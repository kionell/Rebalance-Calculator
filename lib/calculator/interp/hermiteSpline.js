class HermiteSpline
{
  /**
   * @param {number} x0 
   * @param {number} val0 
   * @param {number} d0 
   * @param {number} x1 
   * @param {number} val1 
   * @param {number} d1 
   */
  constructor (x0, val0, d0, x1, val1, d1)
  {
    let scale = 1 / (x1 - x0);
    let scale2 = scale * scale;

    this.x0 = x0;
    this.x1 = x1;
    this.d1 = d1;
    this.val1 = val1;

    this.c0 = val0;
    this.c1 = d0;
    this.c2 = 3 * (val1 - val0) * scale2 - (2 * d0 + d1) * scale;
    this.c3 = (2 * (val0 - val1) * scale + d0 + d1) * scale2;
  }

  evaluate(x)
  {
    if (x > this.x1) {
      return (x - this.x1) * this.d1 + this.val1;
    }
        
    if (x < this.x0) {
      return (x - this.x0) * this.c1 + this.c0;
    }

    let t = (x - this.x0);
    let t2 = t * t;
    let t3 = t2 * t;

    return this.c0 + this.c1 * t + this.c2 * t2 + this.c3 * t3;
  }
}

module.exports = HermiteSpline;