import {HitObject} from 'osu-bpdpc/src/Beatmap';
import LinearSpline from '../mathUtil/numerics/linearSpline';

export default class OsuMovement
{
  private static readonly t_ratio_threshold = 1.4;
  private static readonly correction0_still = 0;

  private static correction0_moving_spline: LinearSpline;

  constructor(
    rawMt: number, D: number, Mt: number, Ip12: number, cheesability: number, 
    cheesableRatio: number, time: number, endsOnSlider: boolean);

  /**
   * Extracts movement (only for the first object in a beatmap).
   */
  static extractMovement1(obj: HitObject): OsuMovement[];

  /**
   * Calculates the movement time, effective distance and other details for the movement from obj1 to obj2.
   */
  static extractMovement2(
    obj0: HitObject, obj1: HitObject, obj2: HitObject, obj3: HitObject, 
    tapStrain: number[], clockRate: number, hidden: boolean, 
    noteDensity: number, objMinus2?: HitObject | null): OsuMovement[];

  static getEmptyMovement(time: number): OsuMovement;

  static calcCorrection0Stop(x: number, y: number): number;
}