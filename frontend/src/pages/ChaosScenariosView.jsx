import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Flame, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Plus, 
  Sliders, 
  Server,
  Cpu,
  Database,
  ShieldAlert
} from 'lucide-react';
import { fetchScenarios, triggerChaosScenario } from '../services/api';

export default function ChaosScenariosView({ onScenarioUpdated }) {
  const [scenarios, setScenarios] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testName, setTestName] = useState('Payment_Checkout_Spike_Chaos');
  const [targetService, setTargetService] = useState('Payments Microservice');
  const [virtualUsers, setVirtualUsers] = useState('3500');
  const [targetRps, setTargetRps] = useState('9000');
  const [chaosFault, setChaosFault] = useState('150ms Synthetic Latency Injection');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await fetchScenarios();
    setScenarios(data);
  };

  const handleTrigger = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await triggerChaosScenario({
        testName,
        targetService,
        virtualUsers: parseInt(virtualUsers),
        targetRps: parseInt(targetRps),
        chaosFault
      });
      setIsModalOpen(false);
      await loadData();
      if (onScenarioUpdated) onScenarioUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Virtual Users</span>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Activity className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {scenarios.reduce((acc, s) => acc + s.virtualUsers, 0).toLocaleString()} <span className="text-sm font-normal text-slate-400">VUs</span>
          </div>
          <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
            <span>● Distributed Cluster Active</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Aggregated Ingress RPS</span>
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Zap className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {scenarios.reduce((acc, s) => acc + s.targetRps, 0).toLocaleString()} <span className="text-sm font-normal text-slate-400">req/s</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">k6 High-Concur Worker Nodes</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Chaos Faults Active</span>
            <span className="p-2 bg-red-500/10 text-red-400 rounded-lg"><Flame className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {scenarios.filter(s => s.chaosFaultInjected !== 'None (Baseline)').length} <span className="text-sm font-normal text-slate-400">Faults</span>
          </div>
          <div className="text-[11px] text-red-400 mt-1">Packet Jitter & DB Pool Capping</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">SLA Gate Compliance</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><ShieldAlert className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            75.0%
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">P95 &lt; 200ms Gate Policy</div>
        </div>
      </div>

      {/* Scenarios Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Distributed Load & Chaos Execution Ledger
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulating multi-tenant concurrency under deliberate network drops, thread pool starvation, and service degradation.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
              title="Refresh Scenarios"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Trigger Load & Chaos Run
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">Scenario ID & Target</th>
                <th className="py-3 px-4">Concurrency</th>
                <th className="py-3 px-4">Injected Chaos Fault</th>
                <th className="py-3 px-4">Latency (P50 / P90 / P99)</th>
                <th className="py-3 px-4">CPU / DB Pool</th>
                <th className="py-3 px-4">SLA Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {scenarios.map((sc) => {
                const isPassed = sc.slaVerdict === 'PASSED';
                const isBreached = sc.slaVerdict === 'FAILED_SLA_BREACH';
                const isCircuit = sc.slaVerdict === 'CIRCUIT_BREAKER_TRIGGERED';

                return (
                  <tr key={sc.scenarioId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white flex items-center gap-2">
                        {sc.testName}
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {sc.scenarioId}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Target: {sc.targetService}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div>{sc.virtualUsers.toLocaleString()} VUs</div>
                      <div className="text-[10px] text-slate-500">{sc.targetRps.toLocaleString()} req/s</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        sc.chaosFaultInjected.includes('None') 
                          ? 'bg-slate-800 text-slate-400' 
                          : 'bg-red-500/10 text-red-300 border border-red-500/20'
                      }`}>
                        {sc.chaosFaultInjected}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div>P50: {sc.p50LatencyMs}ms • P90: {sc.p90LatencyMs}ms</div>
                      <div className={`font-bold ${sc.p99LatencyMs > 500 ? 'text-red-400' : 'text-emerald-400'}`}>
                        P99: {sc.p99LatencyMs}ms ({sc.errorRatePct}% err)
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div>CPU: {sc.cpuUtilPct}%</div>
                      <div className={`text-[10px] ${sc.dbPoolUtilPct >= 90 ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                        DB Pool: {sc.dbPoolUtilPct}%
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                        isPassed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        isBreached ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                        isCircuit ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {sc.slaVerdict}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trigger Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Trigger Load & Chaos Scenario</h3>
                  <p className="text-xs text-slate-400">Distributed k6 workers & fault injection</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <form onSubmit={handleTrigger} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Scenario Label</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Microservice</label>
                  <select
                    value={targetService}
                    onChange={(e) => setTargetService(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Payments Microservice">Payments Microservice</option>
                    <option value="Auth / Token Gateway">Auth / Token Gateway</option>
                    <option value="Order Placement API">Order Placement API</option>
                    <option value="Product Search Index">Product Search Index</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Virtual Users (VUs)</label>
                  <input
                    type="number"
                    value={virtualUsers}
                    onChange={(e) => setVirtualUsers(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Injected Chaos Fault</label>
                <select
                  value={chaosFault}
                  onChange={(e) => setChaosFault(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-red-300 font-mono focus:outline-none focus:border-amber-500"
                >
                  <option value="None (Baseline)">None (Baseline Load Test)</option>
                  <option value="150ms Synthetic Latency Injection">150ms Synthetic Packet Jitter</option>
                  <option value="PostgreSQL Pool Capped at 15 conns">Database Connection Pool Exhaustion</option>
                  <option value="25% Synthetic 503 Outage">25% Upstream Dependency 503 Errors</option>
                  <option value="Memory Leak Ramp-up">Slow Heap Leak Exhaustion</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <Flame className="w-4 h-4" />
                  {loading ? 'Ramping up distributed workers...' : 'Execute Chaos Load Run'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
