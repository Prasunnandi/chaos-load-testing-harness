import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ChaosScenariosView from './pages/ChaosScenariosView';
import BottleneckCorrelatorView from './pages/BottleneckCorrelatorView';
import { fetchStats } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('scenarios');
  const [stats, setStats] = useState({
    totalVUsActive: 17500,
    aggregateThroughputRps: 43500,
    p99GlobalLatencyMs: 240,
    activeChaosInjections: 2,
    slaCompliancePct: 75.0
  });

  const refreshStats = () => {
    fetchStats().then(data => {
      if (data) setStats(data);
    });
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar stats={stats} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'scenarios' && (
            <ChaosScenariosView onScenarioUpdated={refreshStats} />
          )}
          {activeTab === 'correlator' && (
            <BottleneckCorrelatorView />
          )}
        </main>
      </div>
    </div>
  );
}
