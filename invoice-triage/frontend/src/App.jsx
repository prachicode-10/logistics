import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');

  const openAuth = (tab) => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return (
      <Dashboard 
        user={user} 
        onLogout={handleLogout} 
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-brand-dark text-slate-100 selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Decorative Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-500/10 via-transparent to-transparent pointer-events-none z-0"></div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 grid-bg opacity-[0.15] pointer-events-none z-0"></div>

      {/* Header / Navigation */}
      <Navbar 
        onLoginClick={() => openAuth('login')}
        onSignupClick={() => openAuth('signup')}
      />

      {/* Hero Section */}
      <main className="relative z-10">
        <Hero onStartClick={() => openAuth('signup')} />
        
        {/* Features Showcase */}
        <Features />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-brand-border/40 py-12 px-6 bg-slate-950/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white tracking-widest text-xs">LOGISTICS</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex space-x-6">
            <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
            <a href="https://github.com/PratikRanjan4/kiit-logistics-engine" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">GitHub Repository</a>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialTab={authTab}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
