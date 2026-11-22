import React from 'react';
import { Zap, Search, Activity, Flame, ShieldCheck } from 'lucide-react';

export default function Navbar({ stats }) {
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search load scenarios, target microservices, chaos faults..."
            className="w-80 bg-slate-800/80 border border-slate-700/60 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 bg-amber-950/40 px-3 py-1.5 rounded border border-amber-500/30">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span>Distributed Concurrency: {stats?.aggregateThroughputRps?.toLocaleString() || '43,500'} req/s</span>
        </div>
      </div>

      <div className="flex items-center space-x-5">
        <div className="text-right">
          <div className="text-[11px] text-slate-400 font-mono">Active Virtual Users (VUs)</div>
          <div className="text-sm font-bold text-amber-400 font-mono">
            {stats?.totalVUsActive?.toLocaleString() || '17,500'} VUs <span className="text-slate-500 font-normal">/ P99 {stats?.p99GlobalLatencyMs || 240}ms</span>
          </div>
        </div>

        <div className="h-7 w-[1px] bg-slate-800"></div>

        <div className="flex items-center space-x-2 pl-2">
          <div className="w-8 h-8 rounded-full bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-xs font-bold text-amber-300">
            SRE
          </div>
          <div className="text-left text-xs">
            <div className="font-semibold text-slate-200">Chaos Engineer</div>
            <div className="text-[10px] text-slate-400">Reliability & Testing</div>
          </div>
        </div>
      </div>
    </header>
  );
}
