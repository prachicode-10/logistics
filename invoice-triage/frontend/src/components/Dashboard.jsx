import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, ShieldAlert, Sparkles, Navigation, Clock, Check, LogOut, Route, 
  Truck, ShieldCheck, Activity, Mic, MicOff, AlertTriangle, BarChart3, 
  MapPin, Layers, Settings as SettingsIcon, History as HistoryIcon,
  Sun, Moon, Volume2, Compass, Zap, Shield, HelpCircle, ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, 
  Legend, ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie
} from 'recharts';
import axios from 'axios';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet marker icon fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Map boundary auto-fit component
function FitBounds({ start, end }) {
  const map = useMap();
  useEffect(() => {
    if (start && end) {
      map.fitBounds([start, end], { padding: [50, 50] });
    }
  }, [start, end, map]);
  return null;
}

export default function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  
  // Form State
  const [shipmentsCount, setShipmentsCount] = useState(2);
  const [shipments, setShipments] = useState([
    { origin: 'Bhubaneswar', destination: 'Delhi', num_shipments: 1 },
    { origin: 'Mumbai', destination: 'Kolkata', num_shipments: 1 }
  ]);
  const [mode, setMode] = useState('road');
  const [weather, setWeather] = useState('Clear');
  
  // Loading & Execution State
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);
  
  // API Results
  const [predictionResult, setPredictionResult] = useState(null);
  const [activeShipmentIndex, setActiveShipmentIndex] = useState(0);
  const [lockedPaths, setLockedPaths] = useState({}); // { [shipmentIndex]: 'optimized' | 'normal' }
  const [analyticsData, setAnalyticsData] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Voice & Wizard Assistant State
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [wizardActive, setWizardActive] = useState(false);
  const [wizardStep, setWizardStep] = useState('shipments_count'); // 'shipments_count' | 'mode' | 'origin' | 'destination'
  const [wizardShipmentIndex, setWizardShipmentIndex] = useState(0);
  const [wizardInput, setWizardInput] = useState('');
  const [wizardPrompt, setWizardPrompt] = useState('');
  const [wizardShipmentsData, setWizardShipmentsData] = useState([]);
  const [wizardModeData, setWizardModeData] = useState('road');
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Settings config
  const [tomtomApiKey, setTomtomApiKey] = useState('WH3hDCw1zwxiMoCDLCi0x8Epj3P79IpE');
  
  // Fetch Analytics on Mount
  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/analytics-data');
      setAnalyticsData(response.data);
    } catch (err) {
      console.error("Failed to fetch analytics metrics", err);
    }
  };

  // Hybrid Conversational Wizard Logic
  const startWizard = () => {
    setWizardActive(true);
    setWizardStep('shipments_count');
    setWizardShipmentIndex(0);
    setWizardInput('');
    setWizardPrompt("How many shipments do you want to dispatch?");
    speak("How many shipments do you want to dispatch?");
  };

  const stopWizard = () => {
    setWizardActive(false);
  };

  const handleWizardSubmit = (e) => {
    if (e) e.preventDefault();
    const val = wizardInput.trim();

    if (wizardStep === 'shipments_count') {
      const num = parseInt(val);
      if (isNaN(num) || num <= 0) {
        speak("Please enter a valid number of shipments.");
        return;
      }
      setShipmentsCount(num);
      const initialShipments = Array.from({ length: num }, () => ({ origin: '', destination: '', num_shipments: 1 }));
      setWizardShipmentsData(initialShipments);
      setShipments(initialShipments);
      
      setWizardStep('mode');
      setWizardPrompt("Which mode of transport? (road, rail, or air)");
      setWizardInput('road');
      speak("Which mode of transport?");
    } else if (wizardStep === 'mode') {
      setMode(val);
      setWizardModeData(val);
      
      setWizardStep('origin');
      setWizardShipmentIndex(0);
      setWizardPrompt("What is the origin city for shipment 1?");
      setWizardInput('');
      speak("What is the origin city for shipment 1?");
    } else if (wizardStep === 'origin') {
      if (!val) {
        speak("Origin cannot be empty.");
        return;
      }
      const updated = [...wizardShipmentsData];
      updated[wizardShipmentIndex].origin = val;
      setWizardShipmentsData(updated);
      setShipments(updated);
      
      setWizardStep('destination');
      setWizardPrompt(`What is the destination city for shipment ${wizardShipmentIndex + 1}?`);
      setWizardInput('');
      speak(`What is the destination city for shipment ${wizardShipmentIndex + 1}?`);
    } else if (wizardStep === 'destination') {
      if (!val) {
        speak("Destination cannot be empty.");
        return;
      }
      const updated = [...wizardShipmentsData];
      updated[wizardShipmentIndex].destination = val;
      setWizardShipmentsData(updated);
      setShipments(updated);

      if (wizardShipmentIndex + 1 < shipmentsCount) {
        const nextIdx = wizardShipmentIndex + 1;
        setWizardShipmentIndex(nextIdx);
        setWizardStep('origin');
        setWizardPrompt(`What is the origin city for shipment ${nextIdx + 1}?`);
        setWizardInput('');
        speak(`What is the origin city for shipment ${nextIdx + 1}?`);
      } else {
        setWizardActive(false);
        speak("All parameters collected. Running predictive routing model optimization now.");
        runPrediction(updated);
      }
    }
  };

  const speak = (msg) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(msg);
      synthRef.current.speak(utterance);
    }
  };

  // Run Route Predictions
  const runPrediction = async (shipmentsOverride) => {
    setLoading(true);
    setError(null);
    
    const targetShipments = shipmentsOverride || shipments;
    
    const steps = [
      "Listening...",
      "Processing voice signatures...",
      "Querying TomTom coordinates gateway...",
      "Ingesting dynamic traffic & weather factor constraints...",
      "Evaluating risk probabilities via XGBoost model classifier...",
      "Rendering interactive 3D map polyline grids..."
    ];

    let currentStep = 0;
    setLoadingMessage(steps[0]);
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setLoadingMessage(steps[currentStep]);
      }
    }, 700);

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/predict-route', {
        shipments: targetShipments,
        mode,
        weather
      });

      clearInterval(stepInterval);
      setPredictionResult(response.data);
      setActiveShipmentIndex(0);
      setLockedPaths({});
      
      // Save all resolved shipments to history
      response.data.shipments.forEach((s, idx) => {
        const newHistoryItem = {
          id: Date.now() + idx,
          timestamp: new Date().toLocaleTimeString(),
          origin: s.origin.name,
          destination: s.destination.name,
          risk: s.optimized_route.risk_level,
          distance: s.optimized_route.distance_km,
          mode
        };
        setHistory(prev => [newHistoryItem, ...prev]);
      });
      
      // Auto switch tabs to Routes to display map
      setActiveTab('routes');
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.response?.data?.error || "Connection timed out. Ensure the Flask server is running.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    if (risk === 'Low Risk') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (risk === 'Medium Risk') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? 'bg-[#080d19] text-slate-100' : 'bg-[#f3f6fa] text-slate-800'}`}>
      
      {/* Background Glows (Dark Mode Only) */}
      {darkMode && (
        <>
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full filter blur-[150px] pointer-events-none z-0"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full filter blur-[150px] pointer-events-none z-0"></div>
          <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none z-0"></div>
        </>
      )}

      {/* TOP NAVBAR */}
      <header className={`h-16 flex items-center justify-between px-6 border-b z-40 fixed top-0 left-0 right-0 ${darkMode ? 'bg-[#0c1325]/90 border-slate-800/80 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md'}`}>
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
            <Route className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <span className={`font-bold text-base tracking-wider ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              LOGISTICS AI
            </span>
            <span className="block text-[9px] text-blue-500 font-bold tracking-widest uppercase">
              Predictive Triage System
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Light/Dark mode switcher */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border transition-colors ${darkMode ? 'border-slate-800 hover:bg-slate-850 text-amber-400' : 'border-slate-200 hover:bg-slate-100 text-indigo-600'}`}
          >
            {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-700/30">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className={`text-xs font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {user?.name || 'Operations Officer'}
              </span>
              <span className="text-[10px] text-slate-500">
                {user?.email || 'officer@kiit.in'}
              </span>
            </div>
            <button 
              onClick={onLogout}
              className={`p-2 rounded-xl border flex items-center justify-center transition-all ${darkMode ? 'border-slate-850 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 text-slate-400' : 'border-slate-200 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 text-slate-600'}`}
              title="Log Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTAINER */}
      <div className="flex flex-1 pt-16 z-10">
        
        {/* LEFT SIDEBAR */}
        <aside className={`w-64 fixed top-16 bottom-0 left-0 border-r z-35 flex flex-col justify-between p-4 ${darkMode ? 'bg-[#0c1325]/85 border-slate-800/80' : 'bg-white border-slate-200'}`}>
          <div className="space-y-1">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 pl-3">Navigation</span>
            
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                  : darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button 
              onClick={() => setActiveTab('prediction')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'prediction'
                  ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                  : darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Shipment Prediction</span>
            </button>

            <button 
              onClick={() => setActiveTab('routes')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'routes'
                  ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                  : darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>Routes</span>
            </button>

            <button 
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                  : darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            <button 
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                  : darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HistoryIcon className="w-4 h-4" />
              <span>History</span>
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                  : darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800/40' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>

          <div className={`p-4 rounded-2xl border text-xs ${darkMode ? 'bg-slate-900/60 border-slate-800/60 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            <span className="block font-bold mb-1">XGBoost Classifier Live</span>
            <span className="block text-[10px]">Latency: ~10 ms</span>
            <span className="block text-[10px]">Data: shipment_dataset_extended</span>
          </div>
        </aside>

        {/* MAIN DISPLAY AREA */}
        <main className="flex-1 ml-64 p-8 overflow-y-auto">

          {/* LOADING SCREEN */}
          {loading && (
            <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white`}>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-extrabold tracking-wide mb-2 animate-pulse">Running Predictions</h3>
              <p className="text-sm text-slate-300 font-semibold">{loadingMessage}</p>
            </div>
          )}

          {/* TAB CONTENT: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black tracking-tight">Fleet Control Room</h1>
                  <p className="text-sm text-slate-500">Real-time XGBoost ML route analysis dashboard.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('prediction')}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl border border-blue-500/20 font-bold text-sm shadow-md flex items-center space-x-2 transition-all hover:scale-[1.02]"
                >
                  <Compass className="w-4 h-4" />
                  <span>Run Route Evaluation</span>
                </button>
              </div>

              {/* KPI WIDGET GRID */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className={`p-6 rounded-3xl border flex items-center space-x-4 shadow-md ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider">Model Accuracy</span>
                    <span className="text-2xl font-black">{analyticsData ? `${(analyticsData.metrics.accuracy * 100).toFixed(1)}%` : '99.4%'}</span>
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border flex items-center space-x-4 shadow-md ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider">Anomalies flagged</span>
                    <span className="text-2xl font-black">{analyticsData ? analyticsData.metrics.anomaly_count : '24'}</span>
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border flex items-center space-x-4 shadow-md ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider">Trips Triaged</span>
                    <span className="text-2xl font-black">{history.length + 148}</span>
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border flex items-center space-x-4 shadow-md ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider">Delay Risk Ratio</span>
                    <span className="text-2xl font-black">12.8%</span>
                  </div>
                </div>
              </div>

              {/* OVERVIEW CONTENT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Side: Summary Map & Info */}
                <div className={`lg:col-span-7 p-6 rounded-3xl border shadow-lg flex flex-col justify-between min-h-[380px] ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-lg flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-blue-500" />
                      <span>XGBoost Operational Directives</span>
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Our machine learning engine has evaluated historical delays, traffic densities, weather alerts, and port congestions to construct automated risk boundaries. Ensure your route coordinators keep alternate routes available for metropolitan transit nodes.
                    </p>
                    <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start space-x-3 text-xs text-blue-400">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <div>
                        <span className="block font-bold">Monsoon Transit Caution</span>
                        <span className="block text-slate-400 mt-0.5">Heavy rains inside eastern sectors increases the likelihood of transit delays by up to 34%. Pre-schedule air routes where feasible.</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className={`p-4 rounded-xl border flex flex-col justify-center ${darkMode ? 'bg-slate-900/60 border-slate-800/65' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Average Delay Reduction</span>
                      <span className="text-lg font-extrabold text-blue-500 mt-1">28.4% Faster</span>
                    </div>
                    <div className={`p-4 rounded-xl border flex flex-col justify-center ${darkMode ? 'bg-slate-900/60 border-slate-800/65' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Optimal Route Ratio</span>
                      <span className="text-lg font-extrabold text-emerald-500 mt-1">96.8% Safe Delivery</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Quick Action & Session Summary */}
                <div className={`lg:col-span-5 p-6 rounded-3xl border shadow-lg flex flex-col justify-between ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                  <div>
                    <h3 className="font-extrabold text-lg flex items-center space-x-2 border-b pb-3 mb-4">
                      <HistoryIcon className="w-5 h-5 text-blue-500" />
                      <span>Recent Session Ingestions</span>
                    </h3>
                    
                    {history.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 space-y-2">
                        <Compass className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                        <span className="block text-xs font-semibold">No routes analyzed in this session yet.</span>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                        {history.map((item) => (
                          <div key={item.id} className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${darkMode ? 'bg-slate-900/50 border-slate-850' : 'bg-slate-50 border-slate-200'}`}>
                            <div>
                              <span className="block font-bold text-slate-200">{item.origin} &rarr; {item.destination}</span>
                              <span className="block text-[10px] text-slate-500 mt-0.5">{item.timestamp} | {item.mode.toUpperCase()}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full border font-bold ${getRiskColor(item.risk)}`}>
                              {item.risk}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {history.length > 0 && (
                    <button 
                      onClick={() => setActiveTab('history')}
                      className="w-full text-center text-xs text-blue-500 font-bold hover:underline mt-4 flex items-center justify-center space-x-1.5"
                    >
                      <span>View All History Logs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB CONTENT: SHIPMENT PREDICTION */}
          {activeTab === 'prediction' && (
            <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
              <div>
                <h1 className="text-2xl font-black tracking-tight">Shipment Risk Configurator</h1>
                <p className="text-sm text-slate-500">Configure parameters manually or trigger our AI Voice Coordinator assistant.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Manual form */}
                <div className={`lg:col-span-7 p-6 rounded-3xl border shadow-xl ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-extrabold text-base border-b pb-3 mb-6 flex items-center justify-between">
                    <span>Parameter Specification</span>
                    <span className="text-xs text-slate-500">All fields required</span>
                  </h3>
                  
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Number of Shipments</label>
                        <input 
                          type="number" 
                          className={`w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm ${darkMode ? 'bg-slate-900 border-slate-850 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                          value={shipmentsCount}
                          min={1}
                          max={10}
                          onChange={(e) => {
                            const count = Math.max(1, parseInt(e.target.value) || 1);
                            setShipmentsCount(count);
                            setShipments(prev => {
                              const next = [...prev];
                              while (next.length < count) {
                                next.push({ origin: '', destination: '', num_shipments: 1 });
                              }
                              return next.slice(0, count);
                            });
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Mode of Transport</label>
                        <select 
                          className={`w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm ${darkMode ? 'bg-slate-900 border-slate-850 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                          value={mode}
                          onChange={(e) => setMode(e.target.value)}
                        >
                          <option value="road">Road Freight</option>
                          <option value="rail">Rail Cargo</option>
                          <option value="air">Air Cargo</option>
                        </select>
                      </div>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-4 pr-1">
                      {shipments.map((shipment, index) => (
                        <div key={index} className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-800/85' : 'bg-slate-50 border-slate-250'}`}>
                          <div className="flex items-center justify-between mb-3.5">
                            <span className="text-xs font-black uppercase text-blue-500">Shipment #{index + 1}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Origin</label>
                              <input 
                                type="text" 
                                className={`w-full border px-3 py-2 rounded-lg text-xs ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                                value={shipment.origin}
                                onChange={(e) => {
                                  const next = [...shipments];
                                  next[index].origin = e.target.value;
                                  setShipments(next);
                                }}
                                placeholder="e.g. Bhubaneswar"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Destination</label>
                              <input 
                                type="text" 
                                className={`w-full border px-3 py-2 rounded-lg text-xs ${darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                                value={shipment.destination}
                                onChange={(e) => {
                                  const next = [...shipments];
                                  next[index].destination = e.target.value;
                                  setShipments(next);
                                }}
                                placeholder="e.g. Delhi"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Weather Conditions</label>
                      <select 
                        className={`w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm ${darkMode ? 'bg-slate-900 border-slate-850 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                        value={weather}
                        onChange={(e) => setWeather(e.target.value)}
                      >
                        <option value="Clear">Clear Skies</option>
                        <option value="Cloudy">Partly Cloudy</option>
                        <option value="Heavy Rain">Monsoon / Heavy Rain</option>
                      </select>
                    </div>

                    {error && (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start space-x-2.5 text-xs text-rose-400">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button 
                      onClick={() => runPrediction()}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl border border-blue-500/20 shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
                    >
                      <Play className="w-4.5 h-4.5 fill-current" />
                      <span>Execute Predictive Optimization</span>
                    </button>
                  </div>
                </div>

                {/* Voice assistant card / Conversational Wizard */}
                <div className={`lg:col-span-5 p-6 rounded-3xl border shadow-xl flex flex-col justify-between min-h-[350px] ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                  <div>
                    <h3 className="font-extrabold text-base border-b pb-3 mb-6 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Mic className={`w-5 h-5 ${wizardActive ? 'text-emerald-500 animate-pulse' : 'text-blue-500'}`} />
                        <span>Interactive Voice Assistant</span>
                      </div>
                      {wizardActive && (
                        <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full uppercase animate-pulse">
                          Active
                        </span>
                      )}
                    </h3>

                    {!wizardActive ? (
                      <div className="text-center py-8 space-y-4">
                        <button 
                          onClick={startWizard}
                          className="w-20 h-20 rounded-full flex items-center justify-center border border-blue-500/20 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white mx-auto transition-all duration-300 scale-100 active:scale-95 shadow-md"
                        >
                          <Mic className="w-8 h-8" />
                        </button>
                        <h4 className="font-extrabold text-sm text-slate-200">Start Guided Setup</h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-[240px] mx-auto">
                          Click to let the AI assistant walk you through shipment creation step-by-step.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800/60' : 'bg-slate-50 border-slate-200'} text-xs font-semibold space-y-2`}>
                          <span className="text-slate-500 block uppercase tracking-wider text-[9px] font-bold">AI Prompt:</span>
                          <p className="text-slate-200 leading-relaxed text-sm font-bold">{wizardPrompt}</p>
                        </div>

                        <form onSubmit={handleWizardSubmit} className="space-y-4">
                          {wizardStep === 'mode' ? (
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Transport Mode</label>
                              <select
                                autoFocus
                                value={wizardInput}
                                onChange={(e) => setWizardInput(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl border text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                  darkMode 
                                    ? 'bg-[#0f172a] border-slate-800 text-slate-250' 
                                    : 'bg-white border-slate-200 text-slate-800'
                                }`}
                              >
                                <option value="road">Road Freight</option>
                                <option value="rail">Rail Transport</option>
                                <option value="air">Air Cargo</option>
                              </select>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-500 font-black uppercase tracking-wider">
                                {wizardStep === 'shipments_count' ? 'Number of Shipments' : wizardStep === 'origin' ? `Shipment #${wizardShipmentIndex + 1} Origin` : `Shipment #${wizardShipmentIndex + 1} Destination`}
                              </label>
                              <input
                                autoFocus
                                type={wizardStep === 'shipments_count' ? 'number' : 'text'}
                                min={wizardStep === 'shipments_count' ? 1 : undefined}
                                value={wizardInput}
                                onChange={(e) => setWizardInput(e.target.value)}
                                placeholder={
                                  wizardStep === 'shipments_count' ? 'e.g. 2' :
                                  wizardStep === 'origin' ? 'e.g. Bhubaneswar' : 'e.g. Delhi'
                                }
                                className={`w-full px-4 py-3 rounded-xl border text-xs font-bold transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                  darkMode 
                                    ? 'bg-[#0f172a] border-slate-800 text-slate-250' 
                                    : 'bg-white border-slate-200 text-slate-800'
                                }`}
                              />
                            </div>
                          )}

                          <div className="flex space-x-3 pt-2">
                            <button
                              type="button"
                              onClick={stopWizard}
                              className={`flex-1 py-3.5 rounded-xl border text-xs font-bold transition-all ${
                                darkMode ? 'bg-slate-900 border-slate-850 hover:bg-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-650'
                              }`}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl border border-blue-500/20 shadow-md transition-all"
                            >
                              Submit Input
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>

                  {wizardActive && (
                    <div className="pt-4 mt-4 border-t border-slate-800/40 text-[10px] font-bold text-slate-500 flex justify-between">
                      <span>Step: {wizardStep.replace('_', ' ').toUpperCase()}</span>
                      {wizardStep !== 'shipments_count' && wizardStep !== 'mode' && (
                        <span>Shipment {wizardShipmentIndex + 1} of {shipmentsCount}</span>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB CONTENT: ROUTES */}
          {activeTab === 'routes' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black tracking-tight">AI Optimum Route Triage</h1>
                  <p className="text-sm text-slate-500">Comparing alternate routes based on model weights.</p>
                </div>
                {predictionResult && (
                  <div className="text-xs font-bold text-slate-400 bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl shadow-md">
                    <span>Active Transport Mode: {predictionResult.mode.toUpperCase()}</span>
                  </div>
                )}
              </div>

              {!predictionResult ? (
                <div className={`p-16 rounded-3xl border text-center max-w-xl mx-auto shadow-md ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                  <Compass className="w-12 h-12 text-slate-500 mx-auto mb-4 animate-pulse" />
                  <h3 className="font-extrabold text-base mb-1">No Active Evaluation Available</h3>
                  <p className="text-xs text-slate-500 mb-6">You need to specify shipment parameters and run prediction before route models can be loaded.</p>
                  <button 
                    onClick={() => setActiveTab('prediction')}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-3 rounded-xl border border-blue-500/20 shadow-md transition-all hover:scale-102"
                  >
                    Configure Shipment
                  </button>
                </div>
              ) : (() => {
                const activeShipment = predictionResult.shipments[activeShipmentIndex] || predictionResult.shipments[0];
                const currentSelectedType = lockedPaths[activeShipmentIndex] || 'optimized';
                
                return (
                  <div className="space-y-8">
                    {/* Multi-Shipment Tabs Selector */}
                    <div className="flex flex-wrap gap-3 border-b border-slate-800/30 pb-5">
                      {predictionResult.shipments.map((s, idx) => {
                        const sType = lockedPaths[idx] || 'optimized';
                        const sRoute = sType === 'optimized' ? s.optimized_route : s.normal_route;
                        const isActive = idx === activeShipmentIndex;
                        
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveShipmentIndex(idx)}
                            className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all text-left flex flex-col justify-between min-w-[200px] ${
                              isActive
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg scale-[1.01]'
                                : darkMode 
                                  ? 'bg-slate-900 border-slate-850 hover:border-slate-700 text-slate-300' 
                                  : 'bg-white border-slate-200 hover:border-slate-350 text-slate-700'
                            }`}
                          >
                            <span className={`block text-[9px] font-black uppercase tracking-wider ${isActive ? 'text-blue-200' : 'text-blue-550'}`}>
                              Shipment #{idx + 1}
                            </span>
                            <span className="block font-extrabold text-sm mt-0.5">{s.origin.name} &rarr; {s.destination.name}</span>
                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-750/30 w-full text-[10px]">
                              <span className={isActive ? 'text-slate-250' : 'text-slate-500'}>Path: <strong className="capitalize">{sType}</strong></span>
                              <span className={`px-1.5 py-0.5 rounded-md font-extrabold ${
                                sRoute.risk_level === 'Low Risk' ? 'text-emerald-400 bg-emerald-500/10' :
                                sRoute.risk_level === 'Medium Risk' ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10'
                              }`}>{sRoute.risk_level}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* COMPARISON CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* OPTIMIZED ROUTE */}
                      <div 
                        onClick={() => setLockedPaths(prev => ({ ...prev, [activeShipmentIndex]: 'optimized' }))}
                        className={`p-6 rounded-3xl border shadow-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[260px] ${
                          currentSelectedType === 'optimized'
                            ? 'border-emerald-500/40 bg-emerald-500/5 shadow-[0_8px_24px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                            : darkMode ? 'bg-[#0f172a]/60 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                              activeShipment.optimized_route.risk_level === 'Low Risk' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                            }`}>
                              {activeShipment.optimized_route.risk_level}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-extrabold uppercase">AI Pick</span>
                          </div>
                          <h3 className="font-extrabold text-base text-slate-200">{activeShipment.optimized_route.name}</h3>
                          <p className="text-xs text-slate-400 leading-relaxed">{activeShipment.optimized_route.recommendation_reason}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 border-t border-slate-800/60 pt-4 mt-4 text-center">
                          <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">Distance</span>
                            <span className="text-sm font-extrabold text-slate-200">{activeShipment.optimized_route.distance_km} km</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">ETA Hours</span>
                            <span className="text-sm font-extrabold text-slate-200">{activeShipment.optimized_route.eta_hours} hrs</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">Fuel Cost</span>
                            <span className="text-sm font-extrabold text-slate-200">&#8377;{activeShipment.optimized_route.fuel_cost_inr}</span>
                          </div>
                        </div>
                      </div>

                      {/* NORMAL ROUTE */}
                      <div 
                        onClick={() => setLockedPaths(prev => ({ ...prev, [activeShipmentIndex]: 'normal' }))}
                        className={`p-6 rounded-3xl border shadow-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[260px] ${
                          currentSelectedType === 'normal'
                            ? 'border-rose-500/40 bg-rose-500/5 shadow-[0_8px_24px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/30'
                            : darkMode ? 'bg-[#0f172a]/60 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${getRiskColor(activeShipment.normal_route.risk_level)}`}>
                              {activeShipment.normal_route.risk_level}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold">Alternative Path</span>
                          </div>
                          <h3 className="font-extrabold text-base text-slate-200">{activeShipment.normal_route.name}</h3>
                          <p className="text-xs text-slate-400 leading-relaxed">{activeShipment.normal_route.recommendation_reason}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 border-t border-slate-800/60 pt-4 mt-4 text-center">
                          <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">Distance</span>
                            <span className="text-sm font-extrabold text-slate-200">{activeShipment.normal_route.distance_km} km</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">ETA Hours</span>
                            <span className="text-sm font-extrabold text-slate-200">{activeShipment.normal_route.eta_hours} hrs</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase">Fuel Cost</span>
                            <span className="text-sm font-extrabold text-slate-200">&#8377;{activeShipment.normal_route.fuel_cost_inr}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ROUTE VISUALIZATION MAP */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      
                      {/* Leaflet Map rendering */}
                      <div className={`lg:col-span-8 h-[450px] rounded-3xl border overflow-hidden relative shadow-2xl z-0 ${darkMode ? 'border-slate-800/80' : 'border-slate-200'}`}>
                        <MapContainer 
                          center={[activeShipment.origin.coords[1], activeShipment.origin.coords[0]]} 
                          zoom={6} 
                          style={{ height: '100%', width: '100%', zIndex: 0 }}
                        >
                          <TileLayer
                            url={darkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                          />

                          {/* Non-Active shipments rendered as light secondary paths */}
                          {predictionResult.shipments.map((s, idx) => {
                            if (idx === activeShipmentIndex) return null;
                            const pathType = lockedPaths[idx] || 'optimized';
                            const coords = pathType === 'optimized' ? s.optimized_route.coords : s.normal_route.coords;
                            return (
                              <React.Fragment key={idx}>
                                <Polyline
                                  positions={coords.map(c => [c[1], c[0]])}
                                  color="#4f46e5"
                                  weight={2}
                                  opacity={0.3}
                                  dashArray="4, 4"
                                />
                                <Marker position={[s.origin.coords[1], s.origin.coords[0]]} opacity={0.4} />
                                <Marker position={[s.destination.coords[1], s.destination.coords[0]]} opacity={0.4} />
                              </React.Fragment>
                            );
                          })}

                          {/* Active Origin & Destination Markers */}
                          <Marker position={[activeShipment.origin.coords[1], activeShipment.origin.coords[0]]}>
                            <Popup>
                              <div className="text-xs">
                                <span className="font-bold block text-blue-500">Origin Node (Shipment #{activeShipmentIndex + 1})</span>
                                {activeShipment.origin.name}
                              </div>
                            </Popup>
                          </Marker>

                          <Marker position={[activeShipment.destination.coords[1], activeShipment.destination.coords[0]]}>
                            <Popup>
                              <div className="text-xs">
                                <span className="font-bold block text-blue-500">Destination Node (Shipment #{activeShipmentIndex + 1})</span>
                                {activeShipment.destination.name}
                              </div>
                            </Popup>
                          </Marker>

                          {/* Draw both active shipment routes with clear color highlights, popup data, and choice options */}
                          {/* Standard Route - Glow Layer (Shifted slightly to prevent overlapping) */}
                          <Polyline 
                            positions={activeShipment.normal_route.coords.map(c => [c[1] + 0.025, c[0] + 0.025])} 
                            color="#f43f5e" 
                            weight={currentSelectedType === 'normal' ? 14 : 8}
                            opacity={0.25}
                          />
                          {/* Standard Route - Dotted Core Layer (Shifted slightly to prevent overlapping) */}
                          <Polyline 
                            positions={activeShipment.normal_route.coords.map(c => [c[1] + 0.025, c[0] + 0.025])} 
                            color="#f43f5e" 
                            weight={currentSelectedType === 'normal' ? 5 : 3}
                            opacity={currentSelectedType === 'normal' ? 1.0 : 0.7}
                            dashArray="5, 10"
                            className="neon-standard-route"
                          >
                            <Popup>
                              <div className="p-2 space-y-2 text-xs min-w-[160px] text-slate-800">
                                <span className="font-extrabold text-rose-600 block uppercase tracking-wider text-[9px]">Standard Route</span>
                                <div className="space-y-1">
                                  <div><strong>Distance:</strong> {activeShipment.normal_route.distance_km} km</div>
                                  <div><strong>ETA:</strong> {activeShipment.normal_route.eta_hours} hrs</div>
                                  <div><strong>Fuel:</strong> &#8377;{activeShipment.normal_route.fuel_cost_inr}</div>
                                  <div><strong>Risk:</strong> <span className="text-rose-600 font-bold">{activeShipment.normal_route.risk_level}</span></div>
                                </div>
                                {currentSelectedType !== 'normal' && (
                                  <button
                                    onClick={() => setLockedPaths(prev => ({ ...prev, [activeShipmentIndex]: 'normal' }))}
                                    className="w-full mt-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 px-2 rounded-lg text-[10px] transition-all"
                                  >
                                    Select Standard Route
                                  </button>
                                )}
                              </div>
                            </Popup>
                          </Polyline>

                          {/* Optimized Route - Glow Layer */}
                          <Polyline 
                            positions={activeShipment.optimized_route.coords.map(c => [c[1], c[0]])} 
                            color="#10b981" 
                            weight={currentSelectedType === 'optimized' ? 14 : 8}
                            opacity={0.25}
                          />
                          {/* Optimized Route - Dotted Core Layer */}
                          <Polyline 
                            positions={activeShipment.optimized_route.coords.map(c => [c[1], c[0]])} 
                            color="#10b981" 
                            weight={currentSelectedType === 'optimized' ? 5 : 3}
                            opacity={currentSelectedType === 'optimized' ? 1.0 : 0.7}
                            dashArray="5, 10"
                            className="neon-optimal-route"
                          >
                            <Popup>
                              <div className="p-2 space-y-2 text-xs min-w-[160px] text-slate-800">
                                <span className="font-extrabold text-emerald-600 block uppercase tracking-wider text-[9px]">Optimized AI Route</span>
                                <div className="space-y-1">
                                  <div><strong>Distance:</strong> {activeShipment.optimized_route.distance_km} km</div>
                                  <div><strong>ETA:</strong> {activeShipment.optimized_route.eta_hours} hrs</div>
                                  <div><strong>Fuel:</strong> &#8377;{activeShipment.optimized_route.fuel_cost_inr}</div>
                                  <div><strong>Risk:</strong> <span className="text-emerald-600 font-bold">{activeShipment.optimized_route.risk_level}</span></div>
                                </div>
                                {currentSelectedType !== 'optimized' && (
                                  <button
                                    onClick={() => setLockedPaths(prev => ({ ...prev, [activeShipmentIndex]: 'optimized' }))}
                                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-2 rounded-lg text-[10px] transition-all"
                                  >
                                    Select Optimized Route
                                  </button>
                                )}
                              </div>
                            </Popup>
                          </Polyline>

                          <FitBounds 
                            start={[activeShipment.origin.coords[1], activeShipment.origin.coords[0]]}
                            end={[activeShipment.destination.coords[1], activeShipment.destination.coords[0]]}
                          />
                        </MapContainer>

                        {/* Floating UI overlay */}
                        <div className="absolute top-4 left-4 z-10 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs font-semibold shadow-md flex items-center space-x-2">
                          <Layers className="w-4 h-4 text-blue-500" />
                          <span>Active: {currentSelectedType === 'optimized' ? 'Optimized AI Route (Green)' : 'Standard Alternative Route (Red)'}</span>
                        </div>
                      </div>

                      {/* RECOMMENDATION PANEL */}
                      <div className="lg:col-span-4 space-y-6">
                        <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between min-h-[260px] ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80 shadow-[0_8px_24px_rgba(59,130,246,0.08)]' : 'bg-white border-slate-200'}`}>
                          <div className="space-y-4">
                            <h3 className="font-extrabold text-base border-b pb-3 mb-2 flex items-center space-x-2">
                              <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                              <span>AI Predictive Recommendations</span>
                            </h3>
                            
                            <div className="space-y-3.5 pt-2">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold">Suggested Path:</span>
                                <span className="text-slate-200 font-extrabold">
                                  {currentSelectedType === 'optimized' ? activeShipment.optimized_route.name : activeShipment.normal_route.name}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold">Delay Risk Probability:</span>
                                <span className="text-slate-200 font-extrabold">
                                  {((currentSelectedType === 'optimized' ? activeShipment.optimized_route.risk_probability : activeShipment.normal_route.risk_probability) * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-bold">Route Savings (AI Benefit):</span>
                                <span className="text-emerald-400 font-extrabold">
                                  {round_val(activeShipment.normal_route.distance_km - activeShipment.optimized_route.distance_km)} km saved
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-800/60 mt-4">
                            <button 
                              onClick={() => alert(`Route configuration for Shipment #${activeShipmentIndex + 1} (${currentSelectedType.toUpperCase()} path) locked successfully!`)}
                              className="w-full bg-emerald-650 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl border border-emerald-500/20 shadow-[0_4px_12px_rgba(16,185,129,0.3)] transition-all hover:scale-[1.01]"
                            >
                              Lock Selected Route Path
                            </button>
                          </div>
                        </div>

                        {/* MODEL DETAILS CARD */}
                        <div className={`p-6 rounded-3xl border shadow-xl ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b pb-3 mb-4">ML Decision weights</h4>
                          <div className="space-y-3.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-semibold">Confidence Score:</span>
                              <span className="font-bold">
                                {((currentSelectedType === 'optimized' ? activeShipment.optimized_route.confidence_score : activeShipment.normal_route.confidence_score) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-semibold">Estimated Arrival:</span>
                              <span className="font-bold">
                                {currentSelectedType === 'optimized' ? activeShipment.optimized_route.eta_hours : activeShipment.normal_route.eta_hours} hrs
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-semibold">Transit Mode:</span>
                              <span className="font-bold capitalize">{predictionResult.mode}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB CONTENT: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h1 className="text-2xl font-black tracking-tight">AI Analytics Console</h1>
                <p className="text-sm text-slate-500">Visualizing structural clustering, feature weights, and confusion matrices.</p>
              </div>

              {!analyticsData ? (
                <div className="text-center py-16 text-slate-500">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-slate-600 animate-pulse" />
                  <span className="text-sm font-semibold">Generating live model analytics...</span>
                </div>
              ) : (
                <div className="space-y-8">
                  
                  {/* Top Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* FEATURE IMPORTANCE BARCHART */}
                    <div className={`p-6 rounded-3xl border shadow-xl ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                      <h3 className="font-extrabold text-base border-b pb-3 mb-6">XGBoost Feature Importances</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.feature_importances} layout="vertical">
                            <XAxis type="number" stroke={darkMode ? "#64748b" : "#475569"} fontSize={10} />
                            <YAxis dataKey="name" type="category" stroke={darkMode ? "#64748b" : "#475569"} fontSize={9} width={90} />
                            <RechartsTooltip contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#fff', borderColor: '#475569', borderRadius: 10 }} />
                            <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* KMEANS CLUSTER SCATTERPLOT */}
                    <div className={`p-6 rounded-3xl border shadow-xl ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                      <h3 className="font-extrabold text-base border-b pb-3 mb-6">Structural Supply Chain Clusters (KMeans)</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                            <XAxis type="number" dataKey="origin" name="Origin Code" stroke={darkMode ? "#64748b" : "#475569"} fontSize={10} />
                            <YAxis type="number" dataKey="destination" name="Destination Code" stroke={darkMode ? "#64748b" : "#475569"} fontSize={10} />
                            <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#fff', borderRadius: 10 }} />
                            <Scatter name="Clustered Nodes" data={analyticsData.clusters} fill="#8884d8">
                              {analyticsData.clusters.map((entry, index) => {
                                const colors = ['#38bdf8', '#fb7185', '#34d399', '#facc15', '#a78bfa'];
                                return <Cell key={`cell-${index}`} fill={colors[entry.cluster % colors.length]} />;
                              })}
                            </Scatter>
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Confusion Matrix and Metrics details */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* CONFUSION MATRIX GRID */}
                    <div className={`lg:col-span-6 p-6 rounded-3xl border shadow-xl ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                      <h3 className="font-extrabold text-base border-b pb-3 mb-6">Evaluation Confusion Matrix</h3>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex flex-col justify-center">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">True Negatives</span>
                          <span className="text-2xl font-black text-slate-200">{analyticsData.confusion_matrix[0][0]}</span>
                          <span className="text-[9px] text-slate-500 mt-0.5">Predicted on-time correctly</span>
                        </div>
                        <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex flex-col justify-center">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">False Positives</span>
                          <span className="text-2xl font-black text-rose-400">{analyticsData.confusion_matrix[0][1]}</span>
                          <span className="text-[9px] text-slate-500 mt-0.5">Incorrectly flagged as delayed</span>
                        </div>
                        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex flex-col justify-center">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">False Negatives</span>
                          <span className="text-2xl font-black text-amber-400">{analyticsData.confusion_matrix[1][0]}</span>
                          <span className="text-[9px] text-slate-500 mt-0.5">Missed delay events</span>
                        </div>
                        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col justify-center">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">True Positives</span>
                          <span className="text-2xl font-black text-emerald-400">{analyticsData.confusion_matrix[1][1]}</span>
                          <span className="text-[9px] text-slate-500 mt-0.5">Predicted delays correctly</span>
                        </div>
                      </div>
                    </div>

                    {/* MODEL GAUGES / ACCURACY BARS */}
                    <div className={`lg:col-span-6 p-6 rounded-3xl border shadow-xl ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                      <h3 className="font-extrabold text-base border-b pb-3 mb-6">Model Validation Metrics</h3>
                      
                      <div className="space-y-5">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span>Accuracy Score</span>
                            <span>{(analyticsData.metrics.accuracy * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800/60 overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${analyticsData.metrics.accuracy * 100}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span>Precision Weight</span>
                            <span>{(analyticsData.metrics.precision * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800/60 overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${analyticsData.metrics.precision * 100}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span>Recall Ingest</span>
                            <span>{(analyticsData.metrics.recall * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800/60 overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${analyticsData.metrics.recall * 100}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span>F1 Ingestion Harmonic</span>
                            <span>{(analyticsData.metrics.f1_score * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800/60 overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${analyticsData.metrics.f1_score * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
              <div>
                <h1 className="text-2xl font-black tracking-tight">Session History Log</h1>
                <p className="text-sm text-slate-500">Track and review all predictive optimizations executed during this workspace session.</p>
              </div>

              <div className={`p-6 rounded-3xl border shadow-xl ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                {history.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 space-y-3">
                    <HistoryIcon className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
                    <h3 className="font-extrabold text-base mb-1">No Evaluations Logged</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">All shipment predictions executed during this session will be recorded here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <th className="pb-3">Timestamp</th>
                          <th className="pb-3">Origin</th>
                          <th className="pb-3">Destination</th>
                          <th className="pb-3">Distance</th>
                          <th className="pb-3">Mode</th>
                          <th className="pb-3 text-right">Diagnosed Risk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 text-xs">
                        {history.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-900/10">
                            <td className="py-4 text-slate-400 font-medium">{item.timestamp}</td>
                            <td className="py-4 font-bold">{item.origin}</td>
                            <td className="py-4 font-bold">{item.destination}</td>
                            <td className="py-4 font-bold">{item.distance} km</td>
                            <td className="py-4 font-bold capitalize">{item.mode}</td>
                            <td className="py-4 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full border font-bold text-[10px] ${getRiskColor(item.risk)}`}>
                                {item.risk}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
              <div>
                <h1 className="text-2xl font-black tracking-tight">System Configuration</h1>
                <p className="text-sm text-slate-500">Configure parameters for XGBoost classification modeling & TomTom geolocations.</p>
              </div>

              <div className={`p-6 rounded-3xl border shadow-xl space-y-6 ${darkMode ? 'bg-[#0f172a]/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                <div>
                  <h3 className="font-extrabold text-base border-b pb-3 mb-4">Credentials & Gateways</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">TomTom Routing Api Key</label>
                      <input 
                        type="password" 
                        className={`w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm ${darkMode ? 'bg-slate-900 border-slate-850 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                        value={tomtomApiKey}
                        onChange={(e) => setTomtomApiKey(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-base border-b pb-3 mb-4">Model Hyperparameters</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Model Estimators</span>
                      <span className="text-base font-extrabold text-slate-200 mt-1 block">450 Trees</span>
                    </div>
                    <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Learning Rate</span>
                      <span className="text-base font-extrabold text-slate-200 mt-1 block">0.03</span>
                    </div>
                    <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Anomaly Isolation threshold</span>
                      <span className="text-base font-extrabold text-slate-200 mt-1 block">0.02 (Contamination)</span>
                    </div>
                    <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-850' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">Clustering algorithm</span>
                      <span className="text-base font-extrabold text-slate-200 mt-1 block">KMeans (k=5)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// Utility rounding function helper
function round_val(val) {
  return Math.round(val * 100) / 100;
}
