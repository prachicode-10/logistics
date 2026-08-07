import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Truck, ShieldAlert, Key, ShieldCheck, ArrowLeft } from 'lucide-react';
import ElectricBorder from './ElectricBorder';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [fleetSize, setFleetSize] = useState('1-10');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // OTP Verification States
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval;
    if (showOtp && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [showOtp, timer]);

  if (!isOpen) return null;

  const handleStartAuth = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!email || !password) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    if (activeTab === 'signup' && !name) {
      setError('Please enter your full name.');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = activeTab === 'signup' 
        ? 'http://127.0.0.1:5000/api/register-request'
        : 'http://127.0.0.1:5000/api/login-request';

      const bodyData = activeTab === 'signup'
        ? { name, email, password, fleetSize }
        : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication request failed.');
      } else {
        // Request succeeded, transition to OTP screen
        setShowOtp(true);
        setOtpCode('');
        setTimer(60);
        setCanResend(false);
      }
    } catch (err) {
      setError('Could not connect to the authentication server. Ensure the python backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = activeTab === 'signup'
        ? 'http://127.0.0.1:5000/api/register-verify'
        : 'http://127.0.0.1:5000/api/login-verify';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed.');
      } else {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setShowOtp(false);
          onClose();
          if (onLoginSuccess) {
            onLoginSuccess(data.user);
          }
        }, 1500);
      }
    } catch (err) {
      setError('Verification server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setCanResend(false);
    setTimer(60);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: activeTab })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Resend request failed.');
      }
    } catch (err) {
      setError('Failed to contact server for resending code.');
    }
  };

  const resetAuthFlow = () => {
    setShowOtp(false);
    setError('');
    setOtpCode('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      {/* Electric Border Wrapped Modal Box */}
      <ElectricBorder
        color="#3b82f6"
        speed={1.2}
        chaos={0.1}
        borderRadius={24}
        className="w-full max-w-md relative z-10 animate-float shadow-2xl"
      >
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 relative overflow-hidden border border-slate-800/80">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {success ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <Truck className="w-8 h-8 text-emerald-400 animate-[bounce_1s_infinite]" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {activeTab === 'login' ? 'Welcome Back!' : 'Account Created!'}
              </h3>
              <p className="text-slate-400 text-sm font-medium">
                {activeTab === 'login' ? 'Directing to dashboard...' : 'Setting up your fleet access...'}
              </p>
            </div>
          ) : showOtp ? (
            /* OTP Verification UI */
            <div className="space-y-6">
              <button 
                onClick={resetAuthFlow}
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to {activeTab === 'login' ? 'Log In' : 'Sign Up'}</span>
              </button>

              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Two-Factor Authentication</h3>
                <p className="text-xs text-slate-400 font-medium">
                  We've sent a 6-digit verification code to <span className="text-blue-400 font-semibold">{email}</span>. Please enter it below.
                </p>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 font-semibold">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider text-center">
                    Enter Verification Code
                  </label>
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 tracking-[0.75em] text-center font-extrabold text-2xl py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-md placeholder-slate-800"
                    disabled={isLoading}
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-xl border border-blue-400/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>{isLoading ? 'Verifying...' : 'Verify & Continue'}</span>
                </button>
              </form>

              <div className="text-center pt-2">
                {canResend ? (
                  <button 
                    onClick={handleResendOtp}
                    className="text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors"
                  >
                    Resend Code
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">
                    Resend code in {timer}s
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Login / Signup Input Form UI */
            <>
              {/* Logo */}
              <div className="flex items-center space-x-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Key className="w-4 h-4 text-blue-400" />
                </div>
                <span className="font-bold text-sm tracking-wider text-slate-200">
                  LOGISTICS PORTAL
                </span>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-800 mb-6">
                <button 
                  onClick={() => { setActiveTab('login'); setError(''); }}
                  className={`flex-1 pb-3 text-sm font-bold transition-colors border-b-2 ${
                    activeTab === 'login' 
                      ? 'text-white border-blue-500' 
                      : 'text-slate-400 border-transparent hover:text-slate-300'
                  }`}
                >
                  Log In
                </button>
                <button 
                  onClick={() => { setActiveTab('signup'); setError(''); }}
                  className={`flex-1 pb-3 text-sm font-bold transition-colors border-b-2 ${
                    activeTab === 'signup' 
                      ? 'text-white border-blue-500' 
                      : 'text-slate-400 border-transparent hover:text-slate-300'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 mb-4 font-semibold">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Forms */}
              <form onSubmit={handleStartAuth} className="space-y-4">
                
                {activeTab === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="e.g. Pratik Ranjan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm transition-all shadow-md"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="email" 
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm transition-all shadow-md"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm transition-all shadow-md"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {activeTab === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                      Fleet Size
                    </label>
                    <div className="relative">
                      <Truck className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                      <select 
                        value={fleetSize}
                        onChange={(e) => setFleetSize(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm transition-all shadow-md"
                        disabled={isLoading}
                      >
                        <option value="1-10">1-10 Vehicles</option>
                        <option value="11-50">11-50 Vehicles</option>
                        <option value="51-200">51-200 Vehicles</option>
                        <option value="200+">200+ Vehicles</option>
                      </select>
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-xl border border-blue-400/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 mt-4 shadow-lg"
                >
                  <span>{isLoading ? 'Sending OTP...' : (activeTab === 'login' ? 'Log In' : 'Sign Up')}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </ElectricBorder>
    </div>
  );
}
