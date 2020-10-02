/**
 * A single-variable polynomial with real-valued coefficients and non-negative exponents.
 */
class Polynomial
{
  /**
   * Evaluate a polynomial at point x. 
   * Coefficients are ordered ascending by power with power k at index k.
   * @param {number} z The location where to evaluate the polynomial at.
   * @param {number[]} coefficients The coefficients of the polynomial, coefficient for power k at index k.
   * @example coefficients [3, -1, 2] represents y = 2x^2 - x + 3.
   */
  static evaluate(z, coefficients)
  {
    let sum = coefficients[coefficients.length - 1];

    for (let i = coefficients.length - 2; i >= 0; --i) {
      sum *= z;
      sum += coefficients[i];
    }

    return sum;
  }
}

module.exports = Polynomial;
