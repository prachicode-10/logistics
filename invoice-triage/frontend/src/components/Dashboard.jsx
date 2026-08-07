import React, { useState } from 'react';
import { Play, ShieldAlert, Sparkles, Navigation, Clock, Check, LogOut, Route, Truck, ShieldCheck, Activity } from 'lucide-react';

const mockRoutes = [
  {
    id: 1,
    name: 'KIIT University to Bhubaneswar Station',
    distance: 12400, // meters
    time: 1260, // seconds
    defaultRisk: 'High Risk',
    weatherFactor: 3,
    points: [
      { lat: 20.3533, lng: 85.8266 },
      { lat: 20.3200, lng: 85.8300 },
      { lat: 20.2666, lng: 85.8436 }
    ],
    triageRoute: {
      name: 'Alternate: Bypass Route via Canal Road',
      distance: 14200,
      time: 980,
      risk: 'Low Risk'
    }
  },
  {
    id: 2,
    name: 'Patia Square to Biju Patnaik Airport',
    distance: 15100,
    time: 1440,
    defaultRisk: 'Medium Risk',
    weatherFactor: 2,
    points: [
      { lat: 20.3444, lng: 85.8111 },
      { lat: 20.2508, lng: 85.8178 }
    ],
    triageRoute: null
  },
  {
    id: 3,
    name: 'KIIT Campus 3 to Cuttack Link Road',
    distance: 24300,
    time: 1950,
    defaultRisk: 'Low Risk',
    weatherFactor: 1,
    points: [
      { lat: 20.3562, lng: 85.8189 },
      { lat: 20.4625, lng: 85.8812 }
    ],
    triageRoute: null
  }
];

export default function Dashboard({ user, onLogout }) {
  const [selectedRoute, setSelectedRoute] = useState(mockRoutes[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showTriage, setShowTriage] = useState(false);

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisStep(1);
    setAnalysisResult(null);
    setShowTriage(false);

    setTimeout(() => {
      setAnalysisStep(2);
      setTimeout(() => {
        setAnalysisStep(3);
        setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisStep(4);
          setAnalysisResult({
            risk: selectedRoute.defaultRisk,
            time: selectedRoute.time,
            distance: selectedRoute.distance
          });
        }, 800);
      }, 900);
    }, 800);
  };

  const getRiskColorClass = (risk) => {
    if (risk === 'Low Risk') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (risk === 'Medium Risk') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getRiskGlowClass = (risk) => {
    if (risk === 'Low Risk') return 'glow-emerald';
    if (risk === 'Medium Risk') return 'glow-blue';
    return 'glow-crimson';
  };

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full filter blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full filter blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none z-0"></div>

      {/* Dashboard Top Header */}
      <header className="glass-navbar border-b border-slate-800 px-6 py-4 fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Route className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider text-white">
                FLEET CONSOLE
              </span>
              <span className="block text-[10px] text-blue-400 font-semibold tracking-widest uppercase">
                Logistics Control Panel
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-200">
                {user?.name || 'Operator'}
              </span>
              <span className="text-xs text-slate-500">
                {user?.email || 'operator@kiit.in'}
              </span>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center space-x-2 border border-slate-800 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 text-slate-300 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-6 pt-28 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Metrics & Configs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Welcome Card */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800/80 shadow-lg">
            <h2 className="text-xl font-extrabold text-white mb-1">
              Active Control Room
            </h2>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              Real-time route diagnostics and triage dispatch. Adjust routing queries using parameters below.
            </p>
            <div className="flex items-center space-x-3 bg-blue-500/5 border border-blue-500/10 p-3.5 rounded-2xl">
              <Activity className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <span className="block text-xs font-bold text-blue-400">XGBoost Engine Live</span>
                <span className="block text-[10px] text-slate-500">Model status: Ready (100 ms latency)</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 shadow-md flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs text-slate-500 font-medium">Safe Fleets</span>
                <span className="text-xl font-bold text-white">96.4%</span>
              </div>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 shadow-md flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs text-slate-500 font-medium">Total Trips</span>
                <span className="text-xl font-bold text-white">2,419</span>
              </div>
            </div>
          </div>

          {/* Route Configs */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800/80 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest border-b border-slate-850 pb-2">
              Route Configurator
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Select Route Node
              </label>
              <select 
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-sm transition-all shadow-md"
                value={selectedRoute.id}
                onChange={(e) => {
                  const route = mockRoutes.find(r => r.id === parseInt(e.target.value));
                  setSelectedRoute(route);
                  setAnalysisResult(null);
                  setShowTriage(false);
                }}
                disabled={isAnalyzing}
              >
                {mockRoutes.map((route) => (
                  <option key={route.id} value={route.id}>{route.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Current Weather Condition
              </label>
              <div className="bg-slate-900 border border-slate-800 text-slate-300 px-4 py-3 rounded-xl text-sm flex items-center justify-between shadow-md">
                <span>{selectedRoute.weatherFactor === 3 ? 'Heavy Rain (3)' : selectedRoute.weatherFactor === 2 ? 'Cloudy (2)' : 'Clear (1)'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Live Analyzer Panel */}
        <div className="lg:col-span-8">
          <div className={`glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-500 shadow-2xl border border-slate-800/80 min-h-[500px] flex flex-col justify-between ${analysisResult ? getRiskGlowClass(showTriage ? selectedRoute.triageRoute.risk : analysisResult.risk) : 'glow-blue'}`}>
            
            {/* Analyzer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Navigation className="w-5 h-5 text-blue-400 animate-pulse" />
                <h3 className="font-bold text-white text-base">Live Route Risk Evaluator</h3>
              </div>
              <span className="text-xs bg-slate-900 text-slate-300 px-3 py-1 rounded-full border border-slate-800 font-semibold shadow-md">
                XGBoost ML Triage Model
              </span>
            </div>

            {/* Content area changes based on state */}
            <div className="flex-1 flex flex-col justify-center py-6">
              {!analysisResult && !isAnalyzing && (
                <div className="text-center py-12 space-y-4 max-w-sm mx-auto">
                  <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto text-blue-400 shadow-md">
                    <Navigation className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-white text-lg">Ready for Evaluation</h4>
                  <p className="text-slate-400 text-sm">
                    Configure your parameters on the left and run diagnostic routines on the active logistics nodes.
                  </p>
                  <button 
                    onClick={startAnalysis}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl border border-blue-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <span>Run Route Diagnostics</span>
                  </button>
                </div>
              )}

              {isAnalyzing && (
                <div className="max-w-md mx-auto w-full bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6 space-y-4 shadow-md animate-pulse">
                  <h4 className="font-bold text-slate-200 text-sm mb-2 border-b border-slate-850 pb-2">Analysis Execution Log</h4>
                  
                  <div className="flex items-center space-x-3 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${analysisStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      {analysisStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
                    </div>
                    <span className={analysisStep >= 1 ? 'text-slate-200 font-semibold' : 'text-slate-500'}>Connecting to TomTom calculation gateway...</span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${analysisStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      {analysisStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
                    </div>
                    <span className={analysisStep >= 2 ? 'text-slate-200 font-semibold' : 'text-slate-500'}>Extracting routing coordinates & average delays...</span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${analysisStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                      {analysisStep > 3 ? <Check className="w-3.5 h-3.5" /> : '3'}
                    </div>
                    <span className={analysisStep >= 3 ? 'text-slate-200 font-semibold' : 'text-slate-500'}>Evaluating risk probability through XGBoost model...</span>
                  </div>
                </div>
              )}

              {analysisResult && !isAnalyzing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  
                  {/* Results Log */}
                  <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-850">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Diagnosed Status</span>
                        <span className="font-extrabold text-white text-sm">
                          {showTriage ? selectedRoute.triageRoute.name : 'Primary Route'}
                        </span>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${getRiskColorClass(showTriage ? selectedRoute.triageRoute.risk : analysisResult.risk)}`}>
                        {showTriage ? selectedRoute.triageRoute.risk : analysisResult.risk}
                      </span>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 font-medium">Coordinate Count:</span>
                        <span className="text-slate-200 font-bold">{selectedRoute.points.length} nodes</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 font-medium">Distance Evaluated:</span>
                        <span className="text-slate-200 font-bold">
                          {showTriage ? (selectedRoute.triageRoute.distance / 1000).toFixed(1) : (analysisResult.distance / 1000).toFixed(1)} km
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400 font-medium">Estimated Duration:</span>
                        <span className="text-slate-200 font-bold">
                          {showTriage ? Math.round(selectedRoute.triageRoute.time / 60) : Math.round(analysisResult.time / 60)} mins
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Route Visualizer map */}
                  <div className="relative h-56 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-md">
                    <div className="absolute inset-0 grid-bg opacity-15"></div>
                    
                    {/* Simulated Path */}
                    <svg className="w-full h-full p-8">
                      {!showTriage ? (
                        <path 
                          d="M 30 110 Q 150 20 280 130" 
                          fill="none" 
                          stroke={analysisResult.risk === 'High Risk' ? '#dc2626' : analysisResult.risk === 'Medium Risk' ? '#d97706' : '#059669'} 
                          strokeWidth="4" 
                          strokeDasharray="4"
                          className="animate-[dash_2s_linear_infinite]"
                        />
                      ) : (
                        <path 
                          d="M 30 110 Q 160 170 280 130" 
                          fill="none" 
                          stroke="#059669" 
                          strokeWidth="4" 
                          className="animate-[dash_2s_linear_infinite]"
                        />
                      )}
                      <circle cx="30" cy="110" r="6" fill="#059669" />
                      <circle cx="280" cy="130" r="6" fill="#dc2626" />
                    </svg>

                    <div className="absolute top-2 left-2 bg-slate-900/90 px-2 py-0.5 rounded text-[9px] text-slate-300 border border-slate-800 font-semibold shadow-md">
                      Start Coordinate
                    </div>
                    <div className="absolute bottom-2 right-2 bg-slate-900/90 px-2 py-0.5 rounded text-[9px] text-slate-300 border border-slate-800 font-semibold shadow-md">
                      Destination
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Bottom Actions */}
            {analysisResult && !isAnalyzing && (
              <div className="flex space-x-4 border-t border-slate-850 pt-4 mt-4">
                <button 
                  onClick={() => {
                    setAnalysisResult(null);
                    setShowTriage(false);
                  }}
                  className="flex-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold py-3.5 rounded-xl text-xs transition-all shadow-md"
                >
                  Clear Terminal
                </button>

                {analysisResult.risk === 'High Risk' && selectedRoute.triageRoute && (
                  <button 
                    onClick={() => setShowTriage(!showTriage)}
                    className={`flex-1 font-bold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5 border shadow-md ${
                      showTriage 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                        : 'bg-emerald-650 hover:bg-emerald-600 text-white border-emerald-500/20 shadow-[0_4px_12px_rgba(16,185,129,0.3)]'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{showTriage ? 'Display Primary Risk Path' : 'Trigger Safety Reroute'}</span>
                  </button>
                )}
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}
