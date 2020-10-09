class LinearSpline
{
  constructor(x, c0, c1)
  {
    if ((x.length != c0.length + 1 && x.length != c0.length) || x.length != c1.length + 1) {
      throw new Error("All vectors must have the same dimensionality.");
    }

    if (x.Length < 2) {
      throw new Error("The given array is too small. It must be at least 2 long.");
    }

    this._x = x;
    this._c0 = c0;
    this._c1 = c1;
  }

  static interpolateSorted(x, y)
  {
    if (x.length != y.length) {
      throw new Error("All vectors must have the same dimensionality.");
    }

    if (x.Length < 2) {
      throw new Error("The given array is too small. It must be at least 2 long.");
    }

    const c1 = new Array(x.length - 1);

    for (let i = 0; i < c1.length; ++i) {
      c1[i] = (y[i + 1] - y[i]) / (x[i + 1] - x[i]);
    }

    return new LinearSpline(x, y, c1);
  }

  interpolate(t)
  {
    let k = this._leftSegmentIndex(t);

    return this._c0[k] + (t - this._x[k]) * this._c1[k];
  }

  _leftSegmentIndex(t)
  {
    let index = this._binarySearch(this._x, t);

    if (index < 0) {
      index = ~index - 1;
    }

    return Math.min(Math.max(index, 0), this._x.length - 2);
  }
  
  _binarySearch(arr, x)
  {
    let start = 0, mid, end = arr.length - 1;

    // Iterate while start not meets end 
    while (start <= end) {

      // Find the mid index 
      mid = Math.floor((start + end) / 2);

      if (arr[mid] > x) {
        end = mid - 1;
      }
      else if (arr[mid] <= x) {
        start = mid + 1;
      } 
    }

    return Math.floor((start + end) / 2);
  }
}

module.exports = LinearSpline;
