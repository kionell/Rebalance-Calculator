class Mean
{
  static powerMean1(x, y, i)
  {
    return Math.pow((Math.pow(x, i) + Math.pow(y, i)) / 2, 1 / i);
  }

  static powerMean2(values, i)
  {
    let sum = 0;
    let count = 0;

    for (const x of values) {
      sum += Math.pow(x, i);
      count++;
    }

    return Math.pow(sum / count, 1 / i);
  }
}

module.exports = Mean;
