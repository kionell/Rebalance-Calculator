const Erf = require('./numerics/erf');

const coeffs = [
  1.0000000060371126,
  0.693146840098149,
  0.2402310826131064,
  0.05547894683131716,
  0.009686150703032881,
  0.0012382531241478965,
  0.00021871427263121524,
];

class FittsLaw
{
  /**
   * Calculates the index of performance for the distance and the movement time specified.
   * Index of performance is the difficulty of a movement.
   */
  static calculateIp(d, mt)
  {
    return Math.log2(d + 1) / (mt + 1e-10);
  }

  /**
   * Calculates the probability that the target is hit successfully.
   */
  static calculateHitProb(d, mt, tp)
  {
    if (d === 0) {
      return 1.0;
    }

    if (mt * tp > 50) {
      return 1.0;
    }

    if (mt <= 0.03) {
      mt = 0.03;
    }

    return Erf.erf(2.066 / d * (FittsLaw.exp2(mt * tp) - 1) / Math.sqrt(2));
  }

  /**
   * Fast approximation of 2^x. Accurate to around 9-10 significant figures, around 6x faster than Math.pow or Math.exp
   * Calculates the integer part using a bit shift and fraction part using a polynomial approximation
   */
  static exp2(x)
  {
    if (x < 0) {
      return 1 / FittsLaw.exp2(-x);
    }

    if (x > 60) {
      return Infinity;
    }

    let floor = Math.trunc(x);
    let frac = x - floor;
    let frac2 = frac * frac;
    let frac3 = frac * frac2;
    let frac4 = frac * frac3;
    let frac5 = frac * frac4;
    let frac6 = frac * frac5;

    return (1 * 2 ** floor * (coeffs[0] + coeffs[1] * frac + coeffs[2] * frac2 +
      coeffs[3] * frac3 + coeffs[4] * frac4 + coeffs[5] * frac5 + coeffs[6] * frac6));
  }
}

module.exports = FittsLaw;
