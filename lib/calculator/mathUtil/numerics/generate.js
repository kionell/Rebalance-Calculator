class Generate 
{
  /**
   * Generate a linearly spaced sample vector of the given length between the specified values (inclusive). 
   * Equivalent to MATLAB linspace but with the length as first instead of last argument.
   * @param {number} length 
   * @param {number} start 
   * @param {number} stop 
   */
  static linearSpaced(length, start, stop)
  {
    if (length < 0) {
      throw new Error("Length must be zero or more!");
    }

    if (length == 0) return [];
    if (length == 1) return [stop];

    let step = (stop - start) / (length - 1);

    let data = new Array(length);

    for (let i = 0; i < data.length; ++i) {
      data[i] = start + i * step;
    }

    data[data.length - 1] = stop;

    return data;
  }
}

module.exports = Generate;
