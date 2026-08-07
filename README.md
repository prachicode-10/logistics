# KIIT Route Triage & Logistics Intelligence Platform

A high-fidelity, premium Logistics Intelligence platform designed for real-time route optimization, cargo risk prediction, and operational control. The platform consists of a responsive React + Vite frontend, a Flask-based backend server with MongoDB logging and email OTP verification, and an XGBoost-powered route triage engine.

---

## 📂 Project Structure

```
KIIT GDS/
├── invoice-triage/            # Core Logistics Application
│   ├── frontend/              # React + Vite + CSS SPA
│   │   ├── src/               # React source files (Hero, Dashboard, AuthModal, etc.)
│   │   ├── package.json       # Frontend dependencies & scripts
│   │   └── vite.config.js     # Vite configuration
│   ├── server.py              # Flask Backend REST API (MongoDB + Email 2FA OTP)
│   ├── logistics_engine.py    # TomTom Route Ingestion & XGBoost Risk Model
│   ├── requirements.txt       # Python backend dependencies
│   ├── test_logistics.py      # Backend unit tests
│   └── users.json             # Cache or local mockup profiles
├── .gitignore                 # Root gitignore rules
├── package.json               # Convenience scripts for root-level running
└── README.md                  # Project documentation (this file)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **MongoDB** (running locally on port `27017`)

---

### 2. Backend Setup
1. Navigate to the `invoice-triage` directory:
   ```bash
   cd invoice-triage
   ```
2. Install the Python dependencies:
   ```bash
   python -m pip install -r requirements.txt
   ```
3. Run the Flask backend server:
   ```bash
   python server.py
   ```
   *The server runs locally at `http://127.0.0.1:5000`.*

4. Run the standalone Route Triage script (optional):
   ```bash
   python logistics_engine.py
   ```

---

### 3. Frontend Setup
You can install and run the frontend easily from the project root directory.

1. Install frontend dependencies:
   ```bash
   cd invoice-triage/frontend
   npm install
   ```
2. Run the development server:
   From the root folder, run:
   ```bash
   npm run dev
   ```
   *The application will open in your browser at `http://localhost:5173`.*

---

## 🛠️ Tech Stack & Key Features

### Frontend (React + Vite)
- **Cinematic Design System**: Premium navy/cream palette, glassmorphism, responsive split-screen authentication.
- **Neon Electric Borders**: Interactive, highly aesthetic neon animations to emphasize core states.
- **Risk Indicator & Calculator**: Fully interactive metrics showing real-time trip and risk predictions.

### Backend & Model (Flask + XGBoost)
- **2FA OTP Auth**: Secure signup/login requesting OTP validation sent via SMTP to the user's email.
- **Database Logs**: User profiles and authentication events are logged systematically in MongoDB.
- **XGBoost Risk Model**: Python-based machine learning classifier assessing routing risk into Low, Medium, and High categories using length, duration, and weather inputs.
- **TomTom Maps Ingestion**: Pulls routes dynamically from the TomTom API and visualizes route overlays in green, orange, or red.
