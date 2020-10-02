const ZeroCrossingBracketing = require('./zeroCrossingBracketing.js');

/**
 * Bisection root-finding algorithm.
 */
class Bisection
{
  /**
   * Find a solution of the equation f(x)=0.
   * @param {function} f The function to find roots from.
   * @param {number} guessLowerBound Guess for the low value of the range where the root is supposed to be. Will be expanded if needed.
   * @param {number} guessUpperBound Guess for the  high value of the range where the root is supposed to be. Will be expanded if needed.
   * @param {number} accuracy Desired accuracy. The root will be refined until the accuracy or the maximum number of iterations is reached. Default 1e-8. Must be greater than 0.
   * @param {number} maxIterations Maximum number of iterations. Default 100.
   * @param {number} expandFactor Factor at which to expand the bounds, if needed. Default 1.6.
   * @param {number} maxExpandIteratons Maximum number of expand iterations. Default 100.
   * @returns Returns the root with the specified accuracy.
   */
  static findRootExpand(f, guessLowerBound, guessUpperBound, accuracy = 1e-8, maxIterations = 100, expandFactor = 1.6, maxExpandIteratons = 100)
  {
    ZeroCrossingBracketing.expandReduce(f, guessLowerBound, guessUpperBound, expandFactor, maxExpandIteratons, maxExpandIteratons * 10);
    return FindRoot(f, guessLowerBound, guessUpperBound, accuracy, maxIterations);
  }

  /**
   * Find a solution of the equation f(x)=0.
   * @param {function} f The function to find roots from.
   * @param {number} lowerBound The low value of the range where the root is supposed to be.
   * @param {number} upperBound The high value of the range where the root is supposed to be.
   * @param {number} accuracy Desired accuracy for both the root and the function value at the root. The root will be refined until the accuracy or the maximum number of iterations is reached. Must be greater than 0.
   * @param {number} maxIterations Maximum number of iterations. Usually 100.
   * @returns True if a root with the specified accuracy was found, else false.
   */
  static findRoot(f, lowerBound, upperBound, accuracy = 1e-14, maxIterations = 100)
  {
    if (accuracy <= 0) {
      throw new Error("Accuracy must be greater than zero.");
    }

    let root;

    if (upperBound < lowerBound) {
      [upperBound, lowerBound] = [lowerBound, upperBound];
    }

    let fmin = f(lowerBound);
    if (Math.sign(fmin) === 0) {
      return lowerBound;
    }

    let fmax = f(upperBound);
    if (Math.sign(fmax) === 0) {
      return upperBound;
    }

    root = 0.5 * (lowerBound + upperBound);

    // bad bracketing?
    if (Math.sign(fmin) === Math.sign(fmax)) {
      return false;
    }

    for (let i = 0; i <= maxIterations; ++i) {
      let froot = f(root);

      if (upperBound - lowerBound <= 2 * accuracy && Math.abs(froot) <= accuracy) {
        return root;
      }

      if (lowerBound === root || upperBound === root) {
        // accuracy not sufficient, but cannot be improved further
        return false;
      }

      if (Math.sign(froot) === Math.sign(fmin)) {
        lowerBound = root;
        fmin = froot;
      }
      else if (Math.sign(froot) === Math.sign(fmax)) {
        upperBound = root;
        fmax = froot;
      }
      else
      {
        return root;
      }

      root = 0.5 * (lowerBound + upperBound);
    }

    return false;
  }
}

module.exports = Bisection;
