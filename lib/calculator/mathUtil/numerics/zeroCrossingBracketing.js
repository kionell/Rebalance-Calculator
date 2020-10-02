class ZeroCrossingBracketing
{
  /**
   * Detect a range containing at least one root.
   * @param {function} f The function to detect roots from.
   * @param {number} lowerBound Lower value of the range.
   * @param {number} upperBound Upper value of the range.
   * @param {number} factor The growing factor of research. Usually 1.6.
   * @param {number} maxIterations Maximum number of iterations. Usually 50.
   * @returns True if the bracketing operation succeeded, false otherwise.
   */
  static expand(f, lowerBound, upperBound, factor = 1.6, maxIterations = 50)
  {
    let originalLowerBound = lowerBound;
    let originalUpperBound = upperBound;

    if (lowerBound >= upperBound) {
      throw new Error("xmax must be greater than xmin.");
    }

    let fmin = f(lowerBound);
    let fmax = f(upperBound);

    for (let i = 0; i < maxIterations; ++i) {
      if (Math.sign(fmin) != Math.sign(fmax)) {
        return true;
      }

      if (Math.abs(fmin) < Math.abs(fmax)) {
        lowerBound += factor * (lowerBound - upperBound);
        fmin = f(lowerBound);
      }
      else {
        upperBound += factor * (upperBound - lowerBound);
        fmax = f(upperBound);
      }
    }

    lowerBound = originalLowerBound;
    upperBound = originalUpperBound;

    return false;
  }

  static reduce(f, lowerBound, upperBound, subdivisions = 1000)
  {
    let originalLowerBound = lowerBound;
    let originalUpperBound = upperBound;

    if (lowerBound >= upperBound) {
      throw new Error("xmax must be greater than xmin.");
    }

    // TODO: Consider binary-style search instead of linear scan
    let fmin = f(lowerBound);
    let fmax = f(upperBound);

    if (Math.sign(fmin) != Math.sign(fmax)) {
      return true;
    }

    let subdiv = (upperBound - lowerBound) / subdivisions;
    let smin = lowerBound;
    let sign = Math.sign(fmin);

    for (let k = 0; k < subdivisions; ++k) {
      let smax = smin + subdiv;
      let sfmax = f(smax);

      if (sfmax == Infinity) {
        // expand interval to include pole
        smin = smax;
        continue;
      }

      if (Math.sign(sfmax) != sign) {
        lowerBound = smin;
        upperBound = smax;
        return true;
      }

      smin = smax;
    }

    lowerBound = originalLowerBound;
    upperBound = originalUpperBound;
    return false;
  }


  static expandReduce(f, lowerBound, upperBound, expansionFactor = 1.6, expansionMaxIterations = 50, reduceSubdivisions = 100)
  {
    return ZeroCrossingBracketing.expand(f, lowerBound, upperBound, expansionFactor, expansionMaxIterations) 
      || ZeroCrossingBracketing.reduce(f, lowerBound, upperBound, reduceSubdivisions);
  }
}

module.exports = ZeroCrossingBracketing;
