const ZeroCrossingBracketing = require('./zeroCrossingBracketing.js');
const Precision = require('./precision.js');

/**
 * Algorithm by Brent, Van Wijngaarden, Dekker et al.
 * Implementation inspired by Press, Teukolsky, Vetterling, and Flannery, "Numerical Recipes in C", 2nd edition, Cambridge University Press
 */
class Brent
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
   * @returns returns the root with the specified accuracy.
   */
  static findRootExpand(f, guessLowerBound, guessUpperBound, accuracy = 1e-8, maxIterations = 100, expandFactor = 1.6, maxExpandIteratons = 100)
  {
    ZeroCrossingBracketing.expandReduce(f, guessLowerBound, guessUpperBound, expandFactor, maxExpandIteratons, maxExpandIteratons * 10);

    return Brent.findRoot(f, guessLowerBound, guessUpperBound, accuracy, maxIterations);
  }

  /**
   * Find a solution of the equation f(x)=0.
   * @param {function} f The function to find roots from.
   * @param {number} lowerBound The low value of the range where the root is supposed to be.
   * @param {number} upperBound The high value of the range where the root is supposed to be.
   * @param {number} accuracy Desired accuracy. The root will be refined until the accuracy or the maximum number of iterations is reached. Default 1e-8. Must be greater than 0.
   * @param {number} maxIterations Maximum number of iterations. Default 100.
   * @returns returns the root with the specified accuracy.
   */
  static findRoot(f, lowerBound, upperBound, accuracy = 1e-8, maxIterations = 100)
  {
    let fmin = f(lowerBound);
    let fmax = f(upperBound);
    let froot = fmax;
    let d = 0.0, e = 0.0;

    let xMid = NaN;

    let root = upperBound;

    // Root must be bracketed.
    if (Math.sign(fmin) === Math.sign(fmax)) {
      return false;
    }

    for (let i = 0; i <= maxIterations; ++i) {
      // adjust bounds
      if (Math.sign(froot) === Math.sign(fmax)) {
        upperBound = lowerBound;
        fmax = fmin;
        e = d = root - lowerBound;
      }

      if (Math.abs(fmax) < Math.abs(froot)) {
        lowerBound = root;
        root = upperBound;
        upperBound = lowerBound;
        fmin = froot;
        froot = fmax;
        fmax = fmin;
      }

      // convergence check
      let xAcc1 = 2 * 2 ** -53 * Math.abs(root) + 0.5 * accuracy;
      let xMidOld = xMid;
      xMid = (upperBound - root) / 2.0;

      if (Math.abs(xMid) <= xAcc1 || Precision.almostEqualNormRelative(froot, 0, froot, accuracy)) {
        return root;
      }

      if (xMid === xMidOld) {
        // accuracy not sufficient, but cannot be improved further
        return false;
      }

      if (Math.abs(e) >= xAcc1 && Math.abs(fmin) > Math.abs(froot)) {
        // Attempt inverse quadratic interpolation
        let s = froot / fmin;
        let p, q;

        if (Precision.almostEqualRelative(lowerBound, upperBound)) {
          p = 2.0 * xMid * s;
          q = 1.0 - s;
        }
        else {
          q = fmin / fmax;
          let r = froot / fmax;
          p = s * (2.0 * xMid * q * (q - r) - (root - lowerBound) * (r - 1.0));
          q = (q - 1.0) * (r - 1.0) * (s - 1.0);
        }

        if (p > 0.0) q = -q;

        p = Math.abs(p);

        if (2.0 * p < Math.min(3.0 * xMid * q - Math.abs(xAcc1 * q), Math.abs(e * q))) {
          // Accept interpolation
          e = d;
          d = p / q;
        }
        else {
          // Interpolation failed, use bisection
          d = xMid;
          e = d;
        }
      }
      else {
        // Bounds decreasing too slowly, use bisection
        d = xMid;
        e = d;
      }

      lowerBound = root;
      fmin = froot;

      if (Math.abs(d) > xAcc1) {
        root += d;
      }
      else {
        root += Brent.sign(xAcc1, xMid);
      }

      froot = f(root);
    }

    return false;
  }

  /**
   * Helper method useful for preventing rounding errors.
   * @returns a*sign(b)
   */
  static sign(a, b)
  {
    return b >= 0 ? (a >= 0 ? a : -a) : (a >= 0 ? -a : a);
  }
}

module.exports = Brent;
