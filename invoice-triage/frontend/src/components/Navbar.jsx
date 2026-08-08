import React, { useState, useEffect } from 'react';
import { Route, Menu, X, ChevronRight } from 'lucide-react';

export default function Navbar({ onLoginClick, onSignupClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-2.5 transition-all duration-300 ${
      scrolled 
        ? 'glass-navbar shadow-md' 
        : 'bg-slate-950/20 backdrop-blur-[2px] py-4'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-400/20 group-hover:border-blue-400/40 transition-colors">
            <Route className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              LOGISTICS
            </span>
            <span className="block text-xs text-blue-400 font-semibold tracking-widest uppercase">
              Engine 2.0
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-base font-medium text-slate-300 hover:text-white transition-colors">
            Features
          </a>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <button 
            onClick={onLoginClick}
            className="text-base font-medium text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={onSignupClick}
            className="text-base font-medium bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl border border-blue-400/20 hover:border-blue-400/40 shadow-[0_4px_12px_rgba(59,130,246,0.2)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.3)] transition-all duration-300 flex items-center space-x-1"
          >
            <span>Sign Up</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-[73px] left-0 right-0 bg-slate-950/95 border-b border-brand-border/60 backdrop-blur-lg px-6 py-6 space-y-6 flex flex-col transition-all duration-300 shadow-lg">
          <a 
            href="#features" 
            onClick={() => setMobileMenuOpen(false)}
            className="text-slate-300 hover:text-white transition-colors py-2 text-lg font-medium"
          >
            Features
          </a>
          <div className="border-t border-brand-border/60 pt-6 flex flex-col space-y-3">
            <button 
              onClick={() => { setMobileMenuOpen(false); onLoginClick(); }}
              className="w-full text-center text-slate-300 hover:text-white py-3 rounded-xl border border-brand-border hover:bg-slate-900 transition-all font-medium"
            >
              Log In
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onSignupClick(); }}
              className="w-full text-center bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl shadow-md transition-all font-medium"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
