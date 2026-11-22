import React from 'react';
import { 
  Zap, 
  Activity, 
  Flame, 
  Server, 
  Cpu, 
  ShieldAlert, 
  BarChart3,
  Layers
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'scenarios', label: 'Load & Chaos Scenarios', icon: Zap, badge: '4 Runs' },
    { id: 'correlator', label: 'P99 Bottleneck Correlator', icon: Flame, badge: 'HikariCP' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow-inner">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
              ChaosHarness
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                k6 / SRE
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono">Distributed Load & Chaos</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider">
            Performance Testing
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm' 
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                    isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* SLA Engine Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 m-3 rounded-xl border">
        <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>SLA Gatekeeper: Active</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
          Enforcing strict latency thresholds (P95 &lt; 200ms, P99 &lt; 500ms) during chaos injection.
        </p>
        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>Worker Capacity</span>
          <span className="text-emerald-400 font-bold">50,000 VUs</span>
        </div>
      </div>
    </aside>
  );
}
