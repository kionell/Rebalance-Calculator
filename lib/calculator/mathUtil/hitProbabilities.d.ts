import OsuMovement from '../preprocessing/osuMovement';

export default class HitProbabilities
{
  readonly sections: MapSectionCache[];

  constructor(movements: OsuMovement[], cheeseLevel: number, difficultyCount: number);

  /**
   * Average time it takes a player to FC this subset assuming they retry as soon as they miss a note
   */
  static expectedFcTime(sectionData: SkillData[], start: number, count: number): number;

  static calculateCheeseHitProb(movement: OsuMovement, tp: number, cheeseLevel: number): number;

  /**
   * Calculates (expected time for FC - duration of the submap) for every submap that spans sectionCount sections
   * and takes the minimum value.
   */
  minExpectedTimeForSectionCount(tp: number, sectionCount: number): number;

  /**
   * Calculates duration of the submap
   */
  length(start: number, sectionCount: number): number;

  fcProbability(tp: number): number;
}

declare class MapSectionCache
{
  private readonly cache: object;

  constructor(movements: OsuMovement[], cheeseLevel: number, startT: number, endT: number)

  movements: OsuMovement[];
  startT: number;
  endT: number;

  cheeseLevel: number;

  evaluate(tp: number): SkillData;
}

declare class SkillData
{
  constructor(expectedTime: number, fcProbability: number);

  expectedTime: number;
  fcProbability: number;
}