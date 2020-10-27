const BicubicInterp = require('./bicubicInterp');
const CubicInterp = require('./cubicInterp');
const HermiteSpline = require('./hermiteSpline');

class TricubicInterp
{
  /**
   * @param {Object} options
   * @param {number[]} options.x 
   * @param {number[]} options.y 
   * @param {number[]} options.z 
   * @param {number[][][]} options.values 
   * @param {number} [options.dxLower] 
   * @param {number} [options.dxUpper]
   * @param {number} [options.dyLower]
   * @param {number} [options.dyUpper]
   * @param {number} [options.dzLower]
   * @param {number} [options.dzUpper] 
   */
  constructor (options)
  {
    const dxLower = options.dxLower !== undefined
      ? options.dxLower : null;

    const dxUpper = options.dxUpper !== undefined
      ? options.dxUpper : null;

    const dyLower = options.dyLower !== undefined
      ? options.dyLower : null;

    const dyUpper = options.dyUpper !== undefined
      ? options.dyUpper : null;

    const dzLower = options.dzLower !== undefined
      ? options.dzLower : null;

    const dzUpper = options.dzUpper !== undefined
      ? options.dzUpper : null;

    this._xArray = options.x;
    this.dxLower = dxLower;
    this.dxUpper = dxUpper;

    this._cubicInterps = [];

    for (let i = 0, l = options.x.length; i < l; ++i) {
      this._cubicInterps.push(new BicubicInterp({
        x: options.y, 
        y: options.z, 
        values: options.values[i], 
        dxLower: dyLower,
        dxUpper: dyUpper, 
        dyLower: dzLower,
        dyUpper: dzUpper
      }));
    }
  }

  evaluate(x, y, z)
  {
    let xIndex = this.splineIndex(x);
    let [yIndex, zIndex] = this._cubicInterps[0].splineIndex(y, z);

    let x0 = this._xArray[xIndex];
    let x1 = this._xArray[xIndex + 1];

    let val0 = this._cubicInterps[xIndex].evaluate2(yIndex, zIndex, y, z);
    let val1 = this._cubicInterps[xIndex + 1].evaluate2(yIndex, zIndex, y, z);

    let d0, d1;

    if (xIndex === 0) {
      d0 = this.dxLower;

      if (d0 === null || d0 === undefined) {
        d0 = CubicInterp.twoPointDerivative(x0, val0, x1, val1);
      }
    }
    else {
      let xPrev = this._xArray[xIndex - 1];
      let valPrev = this._cubicInterps[xIndex - 1].evaluate2(yIndex, zIndex, y, z);

      d0 = CubicInterp.threePointDerivative(xPrev, valPrev, x0, val0, x1, val1);
    }

    if (xIndex === this._cubicInterps.length - 2) {
      d1 = this.dxUpper;
      
      if (d1 === null || d1 === undefined) {
        CubicInterp.twoPointDerivative(x0, val0, x1, val1);
      }
    }
    else {
      let x2 = this._xArray[xIndex + 2];
      let val2 = this._cubicInterps[xIndex + 2].evaluate2(yIndex, zIndex, y, z);

      d1 = CubicInterp.threePointDerivative(x0, val0, x1, val1, x2, val2);
    }

    let spline = new HermiteSpline(x0, val0, d0, x1, val1, d1);

    return spline.evaluate(x);
  }

  splineIndex(x)
  {
    let index = this._xArray.length - 2;

    while (index > 0 && this._xArray[index] > x) {
      --index;
    };

    return index;
  }
}

module.exports = TricubicInterp;