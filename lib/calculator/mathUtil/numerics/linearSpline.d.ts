export default class LinearSpline
{
  private x: number[];
  private c0: number[];
  private c1: number[];
  
  /**
   * @param x Sample points (N+1), sorted ascending
   * @param c0 Sample values (N or N+1) at the corresponding points; intercept, zero order coefficients
   * @param c1 Slopes (N) at the sample points (first order coefficients): N
   */
  constructor(x: number[], c0: number[], c1: number[]);

  /**
   * Create a linear spline interpolation from a set of (x, y) value pairs, sorted ascendingly by x.
   */
  static interpolateSorted(x: number[], y: number[]): LinearSpline;

  /**
   * Interpolate at point t.
   */
  interpolate(t: number): number;

  /**
   * Find the index of the greatest sample point smaller than t,
   * or the left index of the closest segment for extrapolation.
   */
  private leftSegmentIndex(t: number): number;

  /**
   * Finds the closest value less than X.
   */
  private binarySearch(arr: number[], x: number): number;
}
