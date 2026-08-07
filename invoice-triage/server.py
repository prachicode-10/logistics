import os
import time
import random
import smtplib
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)
CORS(app)

# MongoDB Connection
client = MongoClient('mongodb://localhost:27017/')
db = client['kiit_logistics']
users_col = db['users']
activities_col = db['activities']

# SMTP Config from original trail.py
SENDER_EMAIL = "prachisharma5232@gmail.com"
APP_PASSWORD = "qnzfpocpuugiadxv"
OTP_TTL_SECONDS = 60

# In-memory storage for pending OTP verifications
# Format: { email: { "otp": 123456, "expires_at": timestamp, "data": { ...optional registration data... } } }
pending_otps = {}

def generate_otp():
    return random.randint(100000, 999999)

def send_otp_email(receiver_email, otp):
    message = f"Subject: KIIT Logistics Verification Code\n\nYour verification code is: {otp}\nIt will expire in {OTP_TTL_SECONDS} seconds.\n"
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SENDER_EMAIL, APP_PASSWORD)
        server.sendmail(SENDER_EMAIL, receiver_email, message)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email to {receiver_email}. Error: {e}")
        return False

def log_activity(email, activity_type, details):
    try:
        activities_col.insert_one({
            "email": email,
            "activityType": activity_type,
            "timestamp": datetime.utcnow(),
            "details": details
        })
    except Exception as e:
        print(f"Error logging activity to MongoDB: {e}")

@app.route("/api/register-request", methods=["POST"])
def register_request():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    name = data.get("name", "").strip()
    fleet_size = data.get("fleetSize", "")

    if not email or not password or not name:
        return jsonify({"error": "Name, email, and password are required."}), 400

    # Check if user already exists in MongoDB
    existing_user = users_col.find_one({"email": email})
    if existing_user:
        return jsonify({"error": "User already exists. Please log in instead."}), 400

    # Generate OTP
    otp = generate_otp()
    
    # Try sending email first
    if not send_otp_email(email, otp):
        return jsonify({"error": "Failed to send OTP email. Please ensure your email address is correct."}), 500

    # Save to pending verifications
    pending_otps[email] = {
        "otp": otp,
        "expires_at": time.time() + OTP_TTL_SECONDS,
        "data": {
            "name": name,
            "password": password,
            "fleetSize": fleet_size
        }
    }
    
    # Log activity in MongoDB
    log_activity(email, "registration_request", "User requested verification code for registration")

    return jsonify({"message": "OTP sent to your email address.", "email": email})

@app.route("/api/register-verify", methods=["POST"])
def register_verify():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    otp_str = data.get("otp", "")

    if not email or not otp_str:
        return jsonify({"error": "Email and OTP are required."}), 400

    try:
        otp = int(otp_str)
    except ValueError:
        return jsonify({"error": "OTP must be numbers only."}), 400

    pending = pending_otps.get(email)
    if not pending:
        return jsonify({"error": "No registration request found for this email."}), 400

    if time.time() > pending["expires_at"]:
        log_activity(email, "registration_failed", "Registration failed: OTP expired")
        return jsonify({"error": "OTP has expired. Please request a new one."}), 400

    if pending["otp"] != otp:
        log_activity(email, "registration_failed", f"Registration failed: Invalid OTP entered")
        return jsonify({"error": "Invalid OTP code. Please try again."}), 400

    # Successfully verified! Save user details in MongoDB.
    reg_data = pending["data"]
    
    users_col.update_one(
        {"email": email},
        {"$set": {
            "email": email,
            "name": reg_data["name"],
            "password": reg_data["password"],
            "fleetSize": reg_data["fleetSize"],
            "createdAt": datetime.utcnow()
        }},
        upsert=True
    )
    
    # Remove from pending list
    pending_otps.pop(email, None)

    # Log successful registration activity
    log_activity(email, "account_created", f"User registered successfully. Name: {reg_data['name']}")

    return jsonify({
        "message": "Registration successful!",
        "user": {
            "email": email,
            "name": reg_data["name"]
        }
    })

@app.route("/api/login-request", methods=["POST"])
def login_request():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    # Query MongoDB for user record
    user_record = users_col.find_one({"email": email})

    if not user_record:
        # Prompt user to sign up first if not registered
        log_activity(email, "login_failed", "Login failed: Email not registered")
        return jsonify({"error": "Email is not registered. Please sign up first."}), 400

    if user_record.get("password") != password:
        log_activity(email, "login_failed", "Login failed: Incorrect password")
        return jsonify({"error": "Incorrect password."}), 400

    # Credentials match, trigger 2FA OTP
    otp = generate_otp()

    if not send_otp_email(email, otp):
        return jsonify({"error": "Failed to send 2FA email. Please try again later."}), 500

    # Save to pending verifications
    pending_otps[email] = {
        "otp": otp,
        "expires_at": time.time() + OTP_TTL_SECONDS,
        "data": {
            "name": user_record.get("name", email.split("@")[0])
        }
    }

    # Log 2FA OTP trigger
    log_activity(email, "login_otp_sent", "Credentials correct. Sent 2FA OTP code")

    return jsonify({"status": "otp_sent", "message": "2FA verification code sent to your email."})

@app.route("/api/login-verify", methods=["POST"])
def login_verify():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    otp_str = data.get("otp", "")

    if not email or not otp_str:
        return jsonify({"error": "Email and OTP are required."}), 400

    try:
        otp = int(otp_str)
    except ValueError:
        return jsonify({"error": "OTP must be numbers only."}), 400

    pending = pending_otps.get(email)
    if not pending:
        return jsonify({"error": "No login session found for this email."}), 400

    if time.time() > pending["expires_at"]:
        log_activity(email, "login_failed", "Login 2FA failed: OTP expired")
        return jsonify({"error": "OTP code has expired. Please request a new one."}), 400

    if pending["otp"] != otp:
        log_activity(email, "login_failed", "Login 2FA failed: Invalid OTP entered")
        return jsonify({"error": "Incorrect verification code. Please try again."}), 400

    # Success!
    user_name = pending["data"]["name"]
    pending_otps.pop(email, None)

    # Log successful login activity in MongoDB
    log_activity(email, "login_success", "User successfully authenticated and logged in")

    return jsonify({
        "message": "Login successful!",
        "user": {
            "email": email,
            "name": user_name
        }
    })

@app.route("/api/resend-otp", methods=["POST"])
def resend_otp():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    req_type = data.get("type", "login") # 'login' or 'signup'

    if not email:
        return jsonify({"error": "Email is required to resend OTP."}), 400

    pending = pending_otps.get(email)
    if not pending:
        return jsonify({"error": "No pending request found for this email."}), 400

    otp = generate_otp()
    if not send_otp_email(email, otp):
        return jsonify({"error": "Failed to resend OTP email. Please try again."}), 500

    # Reset expiration and update OTP
    pending["otp"] = otp
    pending["expires_at"] = time.time() + OTP_TTL_SECONDS

    # Log resend activity
    log_activity(email, "otp_resend", f"Verification code resent for {req_type}")

    return jsonify({"message": "Verification code resent successfully."})

if __name__ == "__main__":
    app.run(port=5000, debug=True, use_reloader=False)
