const HermiteSpline = require('./hermiteSpline');

class CubicInterp
{
  /**
   * @param {number} x 
   * @param {number} val 
   * @param {number} xNext 
   * @param {number} valNext 
   */
  static twoPointDerivative(x, val, xNext, valNext)
  {
    return (valNext - val) / (xNext - x);
  }

  /**
   * @param {number} xPrev 
   * @param {number} valPrev 
   * @param {number} x 
   * @param {number} val 
   * @param {number} xNext 
   * @param {number} valNext 
   */
  static threePointDerivative(xPrev, valPrev, x, val, xNext, valNext)
  {
    return 1 / (xNext - xPrev) * (
      (xNext - x) * CubicInterp.twoPointDerivative(xPrev, valPrev, x, val) +
      (x - xPrev) * CubicInterp.twoPointDerivative(x, val, xNext, valNext)
    );
  }

  /**
   * Finite difference cubic hermite interpolation
   * @param {Object} options
   * @param {number[]} options.x 
   * @param {number[]} options.values 
   * @param {number} [options.lowerBoundDerivative] 
   * @param {number} [options.upperBoundDerivative]
   */
  constructor (options)
  {
    let derivatives = [];

    let x = options.x;
    let values = options.values;

    let lowerBoundDerivative = options.dyLower !== undefined
      ? options.dyLower : null;

    let upperBoundDerivative = options.dyUpper !== undefined
      ? options.dyUpper : null;

    for (let i = 1, l = x.length - 1; i < l; ++i) {
      derivatives[i] = CubicInterp.threePointDerivative(
        x[i - 1], values[i - 1], x[i], values[i], x[i + 1], values[i + 1]
      );
    }

    let last = x.length - 1;

    if (lowerBoundDerivative === null) {
      derivatives[0] = CubicInterp.twoPointDerivative(
        x[0], values[0], x[1], values[1]);
    }
    else {
      derivatives[0] = lowerBoundDerivative;
    }

    if (upperBoundDerivative === null) {
      derivatives[last] = CubicInterp.twoPointDerivative(
        x[last], values[last], x[last - 1], values[last - 1]);
    }
    else {
      derivatives[last] = upperBoundDerivative;
    }

    this._splines = [];

    for (let i = 0, l = x.length - 1; i < l; ++i) {
      this._splines.push(new HermiteSpline(
        x[i], values[i], derivatives[i], x[i + 1], 
        values[i + 1], derivatives[i + 1]
      ));
    }
  }

  splineIndex(x)
  {
    let index = this._splines.length - 1;

    while (index > 0 && this._splines[index].x0 > x) {
      --index;
    };

    return index;
  }

  evaluate1(x)
  {
    return this._splines[this.splineIndex(x)].evaluate(x);
  }

  evaluate2(index, x)
  {
    return this._splines[index].evaluate(x);
  }
}

module.exports = CubicInterp;