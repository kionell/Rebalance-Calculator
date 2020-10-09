class Precision 
{
  /**
   * Decimal round
   * @param {number} value Correction value.
   * @param {number} exp Exponent (decimal logarithm of the base of the adjustment).
   */
  static round10(value, exp)
  {
    return Precision._decimalAdjust('round', value, exp);
  };

  /**
   * Decimal floor
   * @param {number} value Correction value.
   * @param {number} exp Exponent (decimal logarithm of the base of the adjustment).
   */
  static floor10(value, exp)
  {
    return Precision._decimalAdjust('floor', value, exp);
  };

  /**
   * Decimal ceil
   * @param {number} value Correction value.
   * @param {number} exp Exponent (decimal logarithm of the base of the adjustment).
   */
  static ceil10(value, exp)
  {
    return Precision._decimalAdjust('ceil', value, exp);
  };

  /**
   * Decimal trunc
   * @param {number} value Correction value.
   * @param {number} exp Exponent (decimal logarithm of the base of the adjustment).
   */
  static trunc10(value, exp)
  {
    return Precision._decimalAdjust('trunc', value, exp);
  };

  /**
   * Compares two doubles and determines if they are equal within the specified maximum error.
   * @param {number} a The norm of the first value (can be negative).
   * @param {number} b The norm of the second value (can be negative).
   * @param {number} diff The norm of the difference of the two values (can be negative).
   * @param {number} maximumError The accuracy required for being almost equal.
   * @returns True if both doubles are almost equal up to the specified maximum error, false otherwise.
   */
  static almostEqualNormRelative(a, b, diff, maximumError)
  {
    // If A or B are infinity (positive or negative) then
    // only return true if they are exactly equal to each other -
    // that is, if they are both infinities of the same sign.
    if (a === Infinity || b === Infinity) {
      return a === b;
    }

    // If A or B are a NAN, return false. NANs are equal to nothing,
    // not even themselves.
    if (Number.isNaN(a) || Number.isNaN(b)) {
      return false;
    }

    // If one is almost zero, fall back to absolute equality
    if (Math.abs(a) < 2.220446049250313e-15 || Math.abs(b) < 2.220446049250313e-15) {
      return Math.abs(diff) < maximumError;
    }

    if ((a === 0 && Math.abs(b) < maximumError) || (b === 0 && Math.abs(a) < maximumError)) {
      return true;
    }

    return Math.abs(diff) < maximumError * Math.max(Math.abs(a), Math.abs(b));
  }

  /**
   * Compares two doubles and determines if they are equal within the specified maximum error.
   * @param {number} a The first value.
   * @param {number} b The second value.
   * @param {number} maximumError The accuracy required for being almost equal.
   */
  static almostEqualRelative(a, b, maximumError = 2.220446049250313e-15)
  {
    return Precision.almostEqualNormRelative(a, b, a - b, maximumError);
  }

  /**
   * Correction of rounding of decimal fractions.
   * @param {string} type  Correction type.
   * @param {number} value Correction value.
   * @param {number} exp   Exponent (decimal logarithm of the base of the adjustment).
   * @returns {number}     Corrected value.
   */
  static _decimalAdjust(type, value, exp)
  {
    // exp isn't defined or equals to zero
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;

    // value isn't a number or exp isn't integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }

    // shift of decimal places
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));

    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  };
}

module.exports = Precision;
