import React from 'react';
import { Route, Cpu, Map, Terminal, Database, ShieldAlert } from 'lucide-react';

const features = [
  {
    icon: Route,
    title: 'TomTom API Route Ingestion',
    description: 'Queries live routing telemetry, fetching precise coordinates, real-time traffic speeds, and trip metrics dynamically.',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  },
  {
    icon: Cpu,
    title: 'XGBoost Delay Predictor',
    description: 'Passes real-time data through a supervised machine learning model to classify route delay probabilities into risk profiles.',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  },
  {
    icon: Map,
    title: 'Folium Map Generator',
    description: 'Compiles coordinates into visually rich, interactive HTML leaflets showing color-coded risk paths and milestones.',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  },
  {
    icon: Terminal,
    title: 'CLI Route Evaluator',
    description: 'Run quick diagnostic tests or batch evaluations via command line using the built-in custom CLI helper script.',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  },
  {
    icon: ShieldAlert,
    title: 'Automated Reroute Triage',
    description: 'Automatically triggers alternative routing requests when delay risk levels cross safety thresholds.',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  },
  {
    icon: Database,
    title: 'Mock Model Pipeline',
    description: 'Includes a local mock dataset generator to train the prediction model without complex backend storage configurations.',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-6 relative border-t border-slate-800 bg-slate-950/20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Core Engine Capabilities & Modules
          </h2>
          <p className="text-slate-400 text-base md:text-lg">
            A comprehensive suite of intelligence modules designed to deliver fail-safe logistics planning and real-time monitoring.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-panel p-6 rounded-2xl border border-slate-800/60 hover:border-slate-700 hover:scale-[1.01] transition-all duration-300 group shadow-lg"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
