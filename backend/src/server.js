import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initialScenarios, initialTelemetryStats } from './data.js';

const app = express();
const PORT = process.env.PORT || 5010;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

let scenarios = [...initialScenarios];
let stats = { ...initialTelemetryStats };

// Health
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Distributed API Load & Chaos Testing Harness',
    engine: 'k6 / Locust Distributed Workers',
    version: '1.0.0'
  });
});

// Stats
app.get('/api/v1/chaos/stats', (req, res) => {
  res.json(stats);
});

// Scenarios
app.get('/api/v1/chaos/scenarios', (req, res) => {
  res.json(scenarios);
});

// Run scenario
app.post('/api/v1/chaos/scenarios', (req, res) => {
  const { testName, targetService, virtualUsers, targetRps, chaosFault } = req.body;
  const newId = `SCN-LOAD-${Math.floor(10 + Math.random() * 90)}`;
  const vus = parseInt(virtualUsers) || 3000;
  const rps = parseInt(targetRps) || 8000;

  let p99 = 160 + (vus > 4000 ? 350 : 40);
  let verdict = "PASSED";
  let errRate = 0.02;

  if (chaosFault && chaosFault !== 'None') {
    p99 += 650;
    verdict = p99 > 800 ? "FAILED_SLA_BREACH" : "PASSED_WITH_WARNING";
    errRate = p99 > 800 ? 3.4 : 0.8;
  }

  const newScenario = {
    scenarioId: newId,
    testName: testName || "Custom_Chaos_Load_Run",
    targetService: targetService || "Gateway API",
    virtualUsers: vus,
    targetRps: rps,
    chaosFaultInjected: chaosFault || "None (Baseline)",
    p50LatencyMs: Math.round(p99 * 0.25),
    p90LatencyMs: Math.round(p99 * 0.6),
    p99LatencyMs: p99,
    errorRatePct: errRate,
    cpuUtilPct: Math.min(95, 55 + Math.round(vus / 150)),
    dbPoolUtilPct: Math.min(100, 40 + Math.round(vus / 120)),
    slaVerdict: verdict,
    rootCause: verdict === "PASSED" 
      ? "Clean capacity test with zero saturation bottlenecks."
      : `Synthetic fault (${chaosFault}) induced latency degradation across upstream dependencies.`
  };

  scenarios.unshift(newScenario);
  stats.totalVUsActive += vus;
  stats.aggregateThroughputRps += rps;

  res.status(201).json(newScenario);
});

app.listen(PORT, () => {
  console.log(`Chaos Load Testing backend listening on port http://localhost:${PORT}`);
});
