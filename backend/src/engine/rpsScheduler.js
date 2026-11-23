/**
 * RPS Stepper & Load Ramping Scheduler
 * Generates and executes load traffic profiles (Linear, Exponential, Step, Spike)
 * for high-concurrency API performance and chaos resilience testing.
 */

class RpsScheduler {
  constructor(config = {}) {
    this.profileType = config.profileType || 'LINEAR'; // 'LINEAR' | 'EXPONENTIAL' | 'STEP' | 'SPIKE'
    this.startRps = config.startRps || 10;
    this.targetRps = config.targetRps || 1000;
    this.rampUpDurationSec = config.rampUpDurationSec || 30;
    this.sustainDurationSec = config.sustainDurationSec || 60;
    this.rampDownDurationSec = config.rampDownDurationSec || 15;
    this.stepSizeRps = config.stepSizeRps || 200;
    this.stepIntervalSec = config.stepIntervalSec || 15;
    this.spikeMultiplier = config.spikeMultiplier || 5.0;
  }

  /**
   * Calculates the target instantaneous RPS at any given elapsed second t
   * @param {number} t - Elapsed seconds since test initiation
   * @returns {number} Target RPS integer
   */
  getTargetRpsAt(t) {
    const totalDuration = this.rampUpDurationSec + this.sustainDurationSec + this.rampDownDurationSec;
    if (t < 0 || t > totalDuration) return 0;

    switch (this.profileType.toUpperCase()) {
      case 'LINEAR':
        return this._getLinearRps(t);

      case 'EXPONENTIAL':
        return this._getExponentialRps(t);

      case 'STEP':
        return this._getStepRps(t);

      case 'SPIKE':
        return this._getSpikeRps(t);

      default:
        return this.targetRps;
    }
  }

  _getLinearRps(t) {
    if (t <= this.rampUpDurationSec) {
      // Linear ramp: R(t) = start + (target - start) * (t / rampUp)
      const progress = t / Math.max(1, this.rampUpDurationSec);
      return Math.round(this.startRps + (this.targetRps - this.startRps) * progress);
    } else if (t <= this.rampUpDurationSec + this.sustainDurationSec) {
      // Plateau sustain phase
      return this.targetRps;
    } else {
      // Ramp down phase
      const rampDownElapsed = t - (this.rampUpDurationSec + this.sustainDurationSec);
      const progress = 1.0 - (rampDownElapsed / Math.max(1, this.rampDownDurationSec));
      return Math.round(Math.max(0, this.targetRps * progress));
    }
  }

  _getExponentialRps(t) {
    if (t <= this.rampUpDurationSec) {
      // R(t) = R0 * (R_target / R0) ^ (t / rampUp)
      const ratio = this.targetRps / Math.max(1, this.startRps);
      const exponent = t / Math.max(1, this.rampUpDurationSec);
      return Math.round(this.startRps * Math.pow(ratio, exponent));
    } else if (t <= this.rampUpDurationSec + this.sustainDurationSec) {
      return this.targetRps;
    } else {
      const rampDownElapsed = t - (this.rampUpDurationSec + this.sustainDurationSec);
      const progress = 1.0 - (rampDownElapsed / Math.max(1, this.rampDownDurationSec));
      return Math.round(Math.max(0, this.targetRps * progress));
    }
  }

  _getStepRps(t) {
    if (t <= this.rampUpDurationSec) {
      const stepIndex = Math.floor(t / this.stepIntervalSec);
      const currentRps = this.startRps + (stepIndex * this.stepSizeRps);
      return Math.min(this.targetRps, currentRps);
    } else if (t <= this.rampUpDurationSec + this.sustainDurationSec) {
      return this.targetRps;
    } else {
      return Math.round(this.startRps);
    }
  }

  _getSpikeRps(t) {
    const isSpikePeriod = (t >= this.rampUpDurationSec && t < this.rampUpDurationSec + 15);
    if (isSpikePeriod) {
      return Math.round(this.targetRps * this.spikeMultiplier);
    }
    return this.targetRps;
  }

  /**
   * Generates a second-by-second timeline schedule of planned requests
   */
  generateTimeline() {
    const totalDuration = this.rampUpDurationSec + this.sustainDurationSec + this.rampDownDurationSec;
    const timeline = [];
    let cumulativeRequests = 0;
    let peakRps = 0;

    for (let second = 0; second <= totalDuration; second++) {
      const rps = this.getTargetRpsAt(second);
      cumulativeRequests += rps;
      peakRps = Math.max(peakRps, rps);

      let phase = 'RAMP_UP';
      if (second > this.rampUpDurationSec + this.sustainDurationSec) {
        phase = 'RAMP_DOWN';
      } else if (second > this.rampUpDurationSec) {
        phase = 'SUSTAIN';
      }

      timeline.push({
        second,
        targetRps: rps,
        cumulativeRequests,
        phase
      });
    }

    return {
      profileType: this.profileType,
      totalDurationSec: totalDuration,
      peakRps,
      totalPlannedRequests: cumulativeRequests,
      averageRps: Math.round(cumulativeRequests / totalDuration),
      timeline
    };
  }
}

export default RpsScheduler;
export { RpsScheduler };
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RpsScheduler;
}
