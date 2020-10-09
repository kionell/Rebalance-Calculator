const LinearSpline = require('../mathUtil/numerics/linearSpline');
const Logistic = require('../mathUtil/numerics/logistic');

const flow0distances = [0.0, 1.0, 1.35, 1.7, 2.3, 3];
const snap0distances = [0, 1.5, 2.5, 4, 6, 8];
const flow3distances = [0, 1, 2, 3, 4];
const snap3distances = [1, 1.5, 2.5, 4, 6, 8];

class L2NormCorrection
{
  /**
   * @param {number[]} distance 
   * @param {number[]} x_offset 
   * @param {number[]} y_offset 
   * @param {number[]} offset 
   * @param {number[]} scale 
   */
  constructor(distance, x_offset, y_offset, offset, scale)
  {
    this._x_offset = LinearSpline.interpolateSorted(distance, x_offset);
    this._y_offset = LinearSpline.interpolateSorted(distance, y_offset);
    this._offset = LinearSpline.interpolateSorted(distance, offset);
    this._scale = LinearSpline.interpolateSorted(distance, scale);
  }

  /**
   * @param {number} distance 
   * @param {number} x 
   * @param {number} y 
   */
  evaluate(distance, x, y)
  {
    x -= this._x_offset.interpolate(distance);
    y -= this._y_offset.interpolate(distance);
    let z = this._offset.interpolate(distance);
    let c = this._scale.interpolate(distance);
    return c * Math.sqrt(x * x + y * y + z);
  }
}

class MultiL2NormCorrection
{
  constructor(components, distance, offset, scale)
  {
    this._offset = LinearSpline.interpolateSorted(distance, offset);
    this._scale = LinearSpline.interpolateSorted(distance, scale);
    this._components = components;
  }

  evaluate(distance, x, y)
  {
    let result = this._components
      .map(component => component.evaluate(distance, x, y))
      .reduce((p, c) => p + c, 0);

    result += this._offset.interpolate(distance);

    return Logistic.logistic(result) * this._scale.interpolate(distance);
  }
}

MultiL2NormCorrection.FLOW_0 = new MultiL2NormCorrection(
  // components
  [
    new L2NormCorrection(
      flow0distances,
      [0, -0.5, -1.15, -1.8, -2, -2],
      [0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1],
      [6, 1, 1, 1, 1, 1]
    ),
    new L2NormCorrection(
      flow0distances,
      [0, -0.8, -0.9, -1, -1, -1],
      [0, 0.5, 0.75, 1, 2, 2],
      [1, 0.5, 0.4, 0.3, 0, 0],
      [3, 0.7, 0.7, 0.7, 1, 1]
    ),
    new L2NormCorrection(
      flow0distances,
      [0, -0.8, -0.9, -1, -1, -1],
      [0, -0.5, -0.75, -1, -2, -2],
      [1, 0.5, 0.4, 0.3, 0, 0],
      [3, 0.7, 0.7, 0.7, 1, 1]
    ),
    new L2NormCorrection(
      flow0distances,
      [0, 0, 0, 0, 0, 0],
      [0, 0.95, 0.975, 1, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0.7, 0.55, 0.4, 0, 0]
    ),
    new L2NormCorrection(
      flow0distances,
      [0, 0, 0, 0, 0, 0],
      [0, -0.95, -0.975, -1, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0.7, 0.55, 0.4, 0, 0]
    )
  ],
  // distance
  flow0distances,
  // offset
  [-11.5, -5.9, -5.4, -5.6, -2, -2],
  // scale
  [1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
);

MultiL2NormCorrection.SNAP_0 = new MultiL2NormCorrection(
  // components
  [
    new L2NormCorrection(
      snap0distances,
      [0.5, 2, 2.8, 5, 5, 5],
      [0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 0],
      [0.6, 1, 0.8, 0.6, 0.2, 0.2]
    ),
    new L2NormCorrection(
      snap0distances,
      [0.25, 1, 0.7, 2, 2, 2],
      [0.5, 2, 2.8, 4, 6, 6],
      [1, 1, 1, 1, 1, 1],
      [0.6, 1, 0.8, 0.3, 0.2, 0.2]
    ),
    new L2NormCorrection(
      snap0distances,
      [0.25, 1, 0.7, 2, 2, 2],
      [-0.5, -2, -2.8, -4, -6, -6],
      [1, 1, 1, 1, 1, 1],
      [0.6, 1, 0.8, 0.3, 0.2, 0.2]
    ),
    new L2NormCorrection(
      snap0distances,
      [0, 0, -0.5, -2, -3, -3],
      [0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1],
      [-0.7, -1, -0.9, -0.1, -0.1, -0.1]
    )
  ],
  // distance
  snap0distances,
  // offset
  [-1, -5, -6.7, -6.5, -4.3, -4.3],
  // scale
  [1, 0.85, 0.6, 0.8, 1, 1]
);

MultiL2NormCorrection.FLOW_3 = new MultiL2NormCorrection(
  // components
  [
    new L2NormCorrection(
      flow3distances,
      [0, 1.2, 2, 2, 2],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [1.5, 1, 0.4, 0, 0]
    ),
    new L2NormCorrection(
      flow3distances,
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [2, 1.5, 2.5, 3.5, 3.5]
    ),
    new L2NormCorrection(
      flow3distances,
      [0, 0.3, 0.6, 0.6, 0.6],
      [0, 1, 2.4, 2.4, 2.4],
      [0, 0, 0, 0, 0],
      [0, 0.4, 0.4, 0, 0]
    ),
    new L2NormCorrection(
      flow3distances,
      [0, 0.3, 0.6, 0.6, 0.6],
      [0, -1, -2.4, -2.4, -2.4],
      [0, 0, 0, 0, 0],
      [0, 0.4, 0.4, 0, 0]
    ),
  ],
  // distance
  flow3distances,
  // offset
  [-4, -5.3, -5.2, -2.5, -2.5],
  // scale
  [1, 1, 1, 1, 1]
);


MultiL2NormCorrection.SNAP_3 = new MultiL2NormCorrection(
  // components
  [
    new L2NormCorrection(
      snap3distances,
      [-2, -2, -3, -4, -6, -6],
      [0, 0, 0, 0, 0, 0],
      [1, 1, 1, 0, 0, 0],
      [0.4, 0.4, 0.2, 0.4, 0.3, 0.3]
    ),
    new L2NormCorrection(
      snap3distances,
      [-1, -1, -1.5, -2, -3, -3],
      [1.4, 1.4, 2.1, 2, 3, 3],
      [1, 1, 1, 1, 1, 1],
      [0.4, 0.4, 0.2, 0.4, 0.2, 0.2]
    ),
    new L2NormCorrection(
      snap3distances,
      [-1, -1, -1.5, -2, -3, -3],
      [-1.4, -1.4, -2.1, -2, -3, -3],
      [1, 1, 1, 1, 1, 1],
      [0.4, 0.4, 0.2, 0.4, 0.2, 0.2]
    ),
    new L2NormCorrection(
      snap3distances,
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0.6, 0.6, 0.6]
    ),
    new L2NormCorrection(
      snap3distances,
      [1, 1, 1.5, 2, 3, 3],
      [0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1],
      [0, 0, -0.6, -0.4, -0.3, -0.3]
    )
  ],
  // distance
  snap3distances,
  // offset
  [-2, -2, -3, -5.4, -4.9, -4.9],
  // scale
  [1, 1, 1, 1, 1, 1]
);

module.exports = MultiL2NormCorrection;
