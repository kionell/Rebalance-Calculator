import { HitObject } from 'osu-bpdpc/src/Beatmap';
import LinearSpline from '../mathUtil/numerics/linearSpline';

export default class Tap
{
  private static readonly spaced_buff_factor: number;
  private static readonly timescale_count: number;

  /**
   * Decay coefficient for each timescale.
   */
  private static readonly decay_coeffs: LinearSpline;

  /**
   * For each timescale, the strain result is multiplied by the corresponding factor in timescale_factors.
   */
  private static readonly timescale_factors: number[];

  /**
   * Calculates attributes related to tapping difficulty.
   */
  public static calculateTapAttributes(hitObjects: HitObject[], clockRate: number): ITapAtts;

  /**
   * Calculates the strain values at each note and the maximum strain values
   */
  private static calculateTapStrain(hitObjects: HitObject[], mashLevel: number, clockRate: number): [number[], number];

  /**
   * For every note, calculates the extent to which it is a part of a stream,
   * and returns all results in an array.
   */
  private static calculateStreamnessMask(hitObjects: HitObject[], skill: number, clockRate: number): number[];

  private static calculateMashNerfFactor(relativeD: number, mashLevel: number): number;
  private static calculateSpacedness(d: number): number;
}

export interface ITapAtts
{
  tapDiff: number;
  streamNoteCount: number;
  mashTapDiff: number;
  strainHistory: number[];
}