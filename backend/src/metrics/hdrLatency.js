/**
 * High Dynamic Range (HDR) Latency Histogram Engine
 * Inspired by Gil Tene's HdrHistogram architecture.
 * Records latency measurements across a wide dynamic range with configurable significant digits
 * and provides accurate percentile lookups (P50, P90, P95, P99, P99.9, P99.99).
 */

export class HdrLatencyHistogram {
  /**
   * @param {Object} [options]
   * @param {number} [options.lowestTrackableValue=1]       - Lowest trackable value in ms
   * @param {number} [options.highestTrackableValue=3600000]- Highest trackable value in ms (1 hour)
   * @param {number} [options.numberOfSignificantValueDigits=3] - Precision
   */
  constructor(options = {}) {
    this.lowestTrackableValue = Math.max(1, options.lowestTrackableValue || 1);
    this.highestTrackableValue = Math.max(2, options.highestTrackableValue || 3600000);
    this.significantDigits = Math.min(5, Math.max(1, options.numberOfSignificantValueDigits || 3));

    // Dynamic linear-log bucket structure
    const targetSubBucketCount = Math.pow(10, this.significantDigits);
    this.subBucketHalfCountMagnitude = Math.ceil(Math.log2(targetSubBucketCount)) - 1;
    this.subBucketCount = Math.pow(2, this.subBucketHalfCountMagnitude + 1);
    this.subBucketHalfCount = this.subBucketCount / 2;

    let largestValueWithSingleUnitResolution = 2 * this.subBucketHalfCount;
    this.bucketCount = 1;
    while (largestValueWithSingleUnitResolution < this.highestTrackableValue) {
      largestValueWithSingleUnitResolution *= 2;
      this.bucketCount++;
    }

    this.countsArrayLength = (this.bucketCount + 1) * this.subBucketHalfCount;
    this.counts = new Uint32Array(this.countsArrayLength);

    this.totalCount = 0;
    this.minValue = Infinity;
    this.maxValue = 0;
    this.sum = 0;
    this.sumOfSquares = 0;
  }

  _getBucketIndex(value) {
    const pow2 = Math.floor(Math.log2(value | 1));
    return Math.max(0, pow2 - this.subBucketHalfCountMagnitude);
  }

  _getSubBucketIndex(value, bucketIndex) {
    return Math.floor(value / Math.pow(2, bucketIndex));
  }

  _countsIndex(value) {
    const bucketIndex = this._getBucketIndex(value);
    const subBucketIndex = this._getSubBucketIndex(value, bucketIndex);
    if (bucketIndex === 0) {
      return Math.min(this.countsArrayLength - 1, subBucketIndex);
    }
    return Math.min(
      this.countsArrayLength - 1,
      bucketIndex * this.subBucketHalfCount + (subBucketIndex - this.subBucketHalfCount)
    );
  }

  _valueFromIndex(idx) {
    if (idx < this.subBucketHalfCount * 2) {
      return idx;
    }
    const bucketIndex = Math.floor(idx / this.subBucketHalfCount);
    const subBucketOffset = idx % this.subBucketHalfCount;
    const subBucketIndex = subBucketOffset + this.subBucketHalfCount;
    return subBucketIndex * Math.pow(2, bucketIndex);
  }

  /**
   * Record a single latency sample
   * @param {number} value - Measured latency value
   * @param {number} [count=1] - Multiplier count
   */
  recordValue(value, count = 1) {
    if (value < 0 || isNaN(value)) return;
    const boundedValue = Math.min(this.highestTrackableValue, Math.max(this.lowestTrackableValue, value));

    const idx = this._countsIndex(boundedValue);
    this.counts[idx] += count;
    this.totalCount += count;
    this.sum += boundedValue * count;
    this.sumOfSquares += boundedValue * boundedValue * count;

    if (boundedValue < this.minValue) this.minValue = boundedValue;
    if (boundedValue > this.maxValue) this.maxValue = boundedValue;
  }

  /**
   * Record value with coordinated omission compensation
   * @param {number} value - Measured latency
   * @param {number} expectedInterval - Expected cadence between requests
   */
  recordValueWithExpectedInterval(value, expectedInterval) {
    this.recordValue(value);
    if (expectedInterval <= 0) return;

    let missingValue = value - expectedInterval;
    while (missingValue >= expectedInterval) {
      this.recordValue(missingValue);
      missingValue -= expectedInterval;
    }
  }

  /**
   * Calculates the value at a given percentile (0.0 to 100.0)
   * @param {number} percentile - Target percentile (e.g., 50.0, 99.0, 99.9)
   * @returns {number} Value at percentile
   */
  getValueAtPercentile(percentile) {
    if (this.totalCount === 0) return 0;
    const requestedCount = (Math.min(100.0, Math.max(0.0, percentile)) / 100.0) * this.totalCount;

    let countSum = 0;
    for (let idx = 0; idx < this.countsArrayLength; idx++) {
      countSum += this.counts[idx];
      if (countSum >= requestedCount) {
        const val = this._valueFromIndex(idx);
        return Math.max(this.minValue, Math.min(this.maxValue, val));
      }
    }
    return this.maxValue;
  }

  /**
   * Generates comprehensive institutional latency report
   * @returns {Object} P50, P90, P95, P99, P99.9, P99.99, Mean, Min, Max, and StdDev
   */
  getSnapshot() {
    const mean = this.totalCount > 0 ? Number((this.sum / this.totalCount).toFixed(2)) : 0;
    const variance = this.totalCount > 1
      ? Math.max(0, (this.sumOfSquares - (this.sum * this.sum) / this.totalCount) / (this.totalCount - 1))
      : 0;
    const stdDev = Number(Math.sqrt(variance).toFixed(2));

    return {
      totalCount: this.totalCount,
      min: this.totalCount > 0 ? Number(this.minValue.toFixed(2)) : 0,
      max: this.totalCount > 0 ? Number(this.maxValue.toFixed(2)) : 0,
      mean,
      stdDev,
      percentiles: {
        p50: Number(this.getValueAtPercentile(50.0).toFixed(2)),
        p75: Number(this.getValueAtPercentile(75.0).toFixed(2)),
        p90: Number(this.getValueAtPercentile(90.0).toFixed(2)),
        p95: Number(this.getValueAtPercentile(95.0).toFixed(2)),
        p99: Number(this.getValueAtPercentile(99.0).toFixed(2)),
        p99_9: Number(this.getValueAtPercentile(99.9).toFixed(2)),
        p99_99: Number(this.getValueAtPercentile(99.99).toFixed(2))
      },
      slaBreached: this.getValueAtPercentile(99.0) > 250
    };
  }

  /**
   * Resets all histogram counters
   */
  reset() {
    this.counts.fill(0);
    this.totalCount = 0;
    this.minValue = Infinity;
    this.maxValue = 0;
    this.sum = 0;
    this.sumOfSquares = 0;
  }
}

// Dual ESM & CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HdrLatencyHistogram
  };
}

export default HdrLatencyHistogram;
