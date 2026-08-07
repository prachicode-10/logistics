import React from 'react';
import { Play, Sparkles } from 'lucide-react';

export default function Hero({ onStartClick }) {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">

      {/* Full-Screen Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        <video
          src="/Semi-truck3.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-[1.01]"
        />
        {/* Lower opacity of overlay to make video clearly visible */}
        <div className="absolute inset-0 bg-slate-950/35 backdrop-blur-[0.5px] z-10"></div>
        {/* Gradient Fade to next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-brand-dark to-transparent z-10"></div>
      </div>

      {/* Hero Content Overlaid on Video */}
      <div className="max-w-5xl mx-auto w-full text-center relative z-20 px-6 py-20 space-y-8 md:space-y-10">

        {/* Sparkle Badge
        <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-white border border-blue-400/30 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-blue-300 animate-pulse" />
          <span>AI-Driven Logistics Intelligence</span>
        </div> */}

        {/* Headings */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto drop-shadow-xl">
          <span className="block text-white mb-3 drop-shadow-md">Predictive Routing Risk</span>
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-md">
            & Automated Routing Optimization
          </span>
        </h1>

        {/* Description */}
        <p className="text-white text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-semibold drop-shadow-lg">
          Eliminate fleet delays. Leverage an XGBoost machine learning model trained on real-time TomTom traffic metrics to preemptively reroute high-risk shipments.
        </p>

        {/* CTA Buttons - All Transparent Glassmorphic */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={onStartClick}
            className="w-full sm:w-auto bg-blue-500/10 hover:bg-blue-500/20 text-white font-semibold px-8 py-4 rounded-2xl border border-blue-400/30 hover:border-blue-400/60 shadow-lg backdrop-blur-md transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>Get Started Free</span>
            <Play className="w-4 h-4 fill-white" />
          </button>
          <a
            href="#features"
            className="w-full sm:w-auto text-white hover:text-slate-200 font-semibold px-8 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 shadow-lg backdrop-blur-md transition-all duration-300 flex items-center justify-center"
          >
            <span>Explore Features</span>
          </a>
        </div>

        {/* Micro Stats */}
        <div className="pt-12 border-t border-white/20 grid grid-cols-3 gap-6 max-w-lg mx-auto backdrop-blur-xs">
          <div>
            <span className="block text-2xl md:text-3xl lg:text-4xl font-extrabold text-white drop-shadow-md">99.4%</span>
            <span className="text-xs md:text-sm text-slate-200 font-bold uppercase tracking-wider drop-shadow-md">Routing Accuracy</span>
          </div>
          <div>
            <span className="block text-2xl md:text-3xl lg:text-4xl font-extrabold text-white drop-shadow-md">&lt; 3.2s</span>
            <span className="text-xs md:text-sm text-slate-200 font-bold uppercase tracking-wider drop-shadow-md">Triage Speed</span>
          </div>
          <div>
            <span className="block text-2xl md:text-3xl lg:text-4xl font-extrabold text-white drop-shadow-md">28%</span>
            <span className="text-xs md:text-sm text-slate-200 font-bold uppercase tracking-wider drop-shadow-md">Delay Reduction</span>
          </div>
        </div>
      </div>

    </div>
  );
}
