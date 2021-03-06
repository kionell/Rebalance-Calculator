﻿const Erf = require('./numerics/erf');

class PoissonBinomial
{
  constructor(probabilities)
  {
    this._mu = probabilities.reduce((p, c) => p + c, 0);
    this._sigma = 0;

    let gamma = 0;

    for (const p of probabilities) {
      this._sigma += p * (1 - p);
      gamma += p * (1 - p) * (1 - 2 * p);
    }

    this._sigma = Math.sqrt(this._sigma);

    this._v = gamma / (6 * Math.pow(this._sigma, 3));
  }

  cdf(count)
  {
    if (this._sigma === 0) return 1;

    let k = (count + 0.5 - this._mu) / this._sigma;

    let result = this._CDF(0, 1, k) + this._v * (1 - k * k) * this._PDF(0, 1, k);

    if (result < 0) return 0;
    if (result > 1) return 1;

    return result;
  }

    /**
   * Computes the cumulative distribution (CDF) of the distribution at x, i.e. P(X ≤ x).
   * @param {number} mean The mean (μ) of the normal distribution.
   * @param {number} stddev The standard deviation (σ) of the normal distribution. Range: σ ≥ 0.
   * @param {number} x The location at which to compute the cumulative distribution function.
   * @returns the cumulative distribution at location "x"
   */
  _CDF(mean, stddev, x)
  {
    if (stddev < 0.0) {
      throw new Error("Invalid parametrization for the distribution.");
    }

    return 0.5 * Erf.erfc((mean - x) / (stddev * 1.41421356237));
  }

  /**
   * Computes the probability density of the distribution (PDF) at x, i.e. ∂P(X ≤ x)/∂x.
   * @param {number} mean The mean (μ) of the normal distribution.
   * @param {number} stddev The standard deviation (σ) of the normal distribution. Range: σ ≥ 0.
   * @param {number} x The location at which to compute the density.
   * @returns the density at "x"
   */
  _PDF(mean, stddev, x)
  {
    if (stddev < 0.0) {
      throw new Error("Invalid parametrization for the distribution.");
    }

    return Math.exp(-0.5 * ((x - mean) / stddev) ** 2) / (2.50662827463 * stddev);
  }
}

module.exports = PoissonBinomial;
