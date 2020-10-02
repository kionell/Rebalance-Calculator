/**
 * This partial implementation of the SpecialFunctions class contains all methods related to the logistic function.
 */
class Logistic
{
  /**
   * Computes the logistic function. see: http://en.wikipedia.org/wiki/Logistic
   * @param {number} p  The parameter for which to compute the logistic function.
   * @returns {number}  The logistic function of p.
   * @static
   */
  static logistic(p)
  {
    return 1.0 / (Math.exp(-p) + 1.0);
  }

  /**
   * Computes the logit function, the inverse of the sigmoid logistic function. see: http://en.wikipedia.org/wiki/Logit
   * @param {number} p The parameter for which to compute the logit function. This number should be between 0 and 1.
   * @returns {number} The logarithm of "p" divided by 1.0 - "p".
   * @static
   */
  static logit(p)
  {
    if (p < 0.0 || p > 1.0) {
      throw "The argument must be between 0 and 1.";
    }

    return Math.log(p / (1.0 - p));
  }
}

module.exports = Logistic;
