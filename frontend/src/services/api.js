// Chaos Load Testing API Service

const API_BASE = 'http://localhost:5010';

export const fallbackScenarios = [
  {
    scenarioId: "SCN-LOAD-01",
    testName: "Peak_Checkout_Spike",
    targetService: "Payments API",
    virtualUsers: 5000,
    targetRps: 12500,
    chaosFaultInjected: "None (Baseline)",
    p50LatencyMs: 42.5,
    p90LatencyMs: 95.0,
    p99LatencyMs: 185.0,
    errorRatePct: 0.01,
    cpuUtilPct: 64.2,
    dbPoolUtilPct: 48.0,
    slaVerdict: "PASSED",
    rootCause: "Nominal operational headroom across all microservice pods."
  },
  {
    scenarioId: "SCN-LOAD-02",
    testName: "Network_Jitter_Injection",
    targetService: "Auth / Token Service",
    virtualUsers: 2500,
    targetRps: 6200,
    chaosFaultInjected: "120ms Packet Delay (10% drop)",
    p50LatencyMs: 148.0,
    p90LatencyMs: 280.0,
    p99LatencyMs: 740.0,
    errorRatePct: 0.45,
    cpuUtilPct: 58.0,
    dbPoolUtilPct: 35.0,
    slaVerdict: "PASSED_WITH_WARNING",
    rootCause: "TCP packet re-transmissions elevated tail latency but handled by exponential backoff."
  },
  {
    scenarioId: "SCN-LOAD-03",
    testName: "DB_Connection_Exhaustion",
    targetService: "Order Placement API",
    virtualUsers: 4000,
    targetRps: 9800,
    chaosFaultInjected: "PostgreSQL Pool Capped at 15 conns",
    p50LatencyMs: 85.0,
    p90LatencyMs: 410.0,
    p99LatencyMs: 1950.0,
    errorRatePct: 4.82,
    cpuUtilPct: 88.5,
    dbPoolUtilPct: 100.0,
    slaVerdict: "FAILED_SLA_BREACH",
    rootCause: "HikariCP thread pool starvation; 1,840 requests queued awaiting DB connection."
  },
  {
    scenarioId: "SCN-LOAD-04",
    testName: "Upstream_Catalog_503_Chaos",
    targetService: "Product Catalog API",
    virtualUsers: 6000,
    targetRps: 15000,
    chaosFaultInjected: "20% Synthetic 503 Outage",
    p50LatencyMs: 38.0,
    p90LatencyMs: 110.0,
    p99LatencyMs: 210.0,
    errorRatePct: 20.10,
    cpuUtilPct: 71.0,
    dbPoolUtilPct: 52.0,
    slaVerdict: "CIRCUIT_BREAKER_TRIGGERED",
    rootCause: "Resilience4j circuit breaker tripped after 100 consecutive 503 errors; fallback served cached catalog."
  }
];

export async function fetchScenarios() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/chaos/scenarios`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (e) {
    return fallbackScenarios;
  }
}

export async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/chaos/stats`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (e) {
    return {
      totalVUsActive: 17500,
      aggregateThroughputRps: 43500,
      p99GlobalLatencyMs: 240,
      activeChaosInjections: 2,
      slaCompliancePct: 75.0
    };
  }
}

export async function triggerChaosScenario(data) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/chaos/scenarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Trigger error');
    return await res.json();
  } catch (e) {
    return {
      scenarioId: `SCN-LOAD-${Math.floor(10 + Math.random() * 90)}`,
      testName: data.testName || "Custom_Chaos_Load_Run",
      targetService: data.targetService || "Gateway API",
      virtualUsers: data.virtualUsers || 3000,
      targetRps: data.targetRps || 8000,
      chaosFaultInjected: data.chaosFault || "None (Baseline)",
      p50LatencyMs: 65,
      p90LatencyMs: 140,
      p99LatencyMs: 290,
      errorRatePct: 0.05,
      cpuUtilPct: 62.0,
      dbPoolUtilPct: 45.0,
      slaVerdict: "PASSED",
      rootCause: "Clean test execution under simulated load."
    };
  }
}
