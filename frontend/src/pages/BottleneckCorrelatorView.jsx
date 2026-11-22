import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Database, 
  Activity, 
  Server, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle,
  Cpu,
  Layers
} from 'lucide-react';
import { fetchScenarios } from '../services/api';

export default function BottleneckCorrelatorView() {
  const [scenarios, setScenarios] = useState([]);

  useEffect(() => {
    fetchScenarios().then(data => setScenarios(data));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-400" />
          P99 Tail Latency & Chaos Root-Cause Correlator
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated multi-variate correlation isolating upstream database connection pool starvation and socket timeouts.
        </p>
      </div>

      {/* Root Cause Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((sc) => {
          const isBreached = sc.slaVerdict === 'FAILED_SLA_BREACH';
          const isWarning = sc.slaVerdict === 'PASSED_WITH_WARNING';

          return (
            <div 
              key={sc.scenarioId}
              className={`p-5 rounded-xl border bg-slate-900 shadow-lg space-y-4 ${
                isBreached ? 'border-red-500/40' : isWarning ? 'border-amber-500/40' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-semibold text-white text-sm">{sc.testName}</h3>
                  <div className="text-[10px] font-mono text-slate-400">{sc.targetService} • {sc.scenarioId}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isBreached ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                  isWarning ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {sc.slaVerdict}
                </span>
              </div>

              {/* Resource utilization bars */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>Database Connection Pool Saturation</span>
                    <span className={sc.dbPoolUtilPct >= 90 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                      {sc.dbPoolUtilPct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${sc.dbPoolUtilPct >= 90 ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${sc.dbPoolUtilPct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>Pod CPU Utilization</span>
                    <span className="text-slate-300 font-mono">{sc.cpuUtilPct}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${sc.cpuUtilPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Root cause analysis text */}
              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed">
                <span className="text-amber-400 font-bold block mb-1">Automated Root Cause Diagnosis:</span>
                {sc.rootCause}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                <span>Injected: {sc.chaosFaultInjected}</span>
                <span className="font-bold text-slate-300">P99: {sc.p99LatencyMs}ms</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
