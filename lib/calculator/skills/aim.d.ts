import {HitObject} from "osu-bpdpc/src/Beatmap";
import HitProbabilities from '../mathUtil/hitProbabilities';
import OsuMovement from "../preprocessing/osuMovement";

/**
 * Represents the skill required to correctly aim at every object in the map with a uniform CircleSize and normalized distances.
 */
export default class Aim
{
  /** 
   * We want to find a throughput level at which the probability of FC = prob_threshold
   */
  private static readonly prob_threshold: number;

  /**
   * We want to find a throughput level at which (the expected time for FC - the length of the song) = time_threshold_base
   */
  private static readonly time_threshold_base: number;

  /**
   * Minimum throughput for root-finding
   */
  private static readonly tp_min: number;

  /**
   * Maximum throughput for root-finding
   */
  private static readonly tp_max: number;

  /**
   * Precision of probability of FC for root-finding
   */
  private static readonly prob_precision: number;

  /**
   * Precision of expected time for FC for root-finding
   */
  private static readonly time_precision: number;

  /**
   * Maximum number of iterations for root-finding
   */
  private static readonly max_iterations: number;

  private static readonly default_cheese_level: number;
  private static readonly cheese_level_count: number;

  private static readonly miss_tp_count: number;
  private static readonly combo_tp_count: number;

  /**
   * Calculates attributes related to aiming difficulty.
   */
  public static calculateAimAttributes(hitObjects: HitObject[], clockRate: number, strainHistory: number[], noteDensities: number[]): IAimAtts;

  /**
   * Converts hit objects into movements.
   */
  private static createMovements(hitObjects: HitObject[], clockRate: number, strainHistory: number[], hidden: boolean, noteDensities: number[] | null): OsuMovement[];

  /**
   * Calculates the throughput at which the probability of FC = prob_threshold 
   */ 
  private static calculateFcProbTp(movements: OsuMovement[], cheeseLevel: number): number;

  /**
   * Calculates the throughput at which MinExpectedTimeForCount(throughput, sectionCount) = timeThresholdBase.
   * 
   * The map is divided into combo_tp_count sections, and a submap can span x sections.
   * This function calculates the minimum skill level such that
   * there exists a submap of length sectionCount that can be FC'd in timeThresholdBase seconds.
   */
  private static calculateFcTimeTp(mapHitProbs: HitProbabilities, sectionCount: number): number;

  /**
   * Calculate miss count for a list of throughputs (used to evaluate miss count of plays).
   */
  private static calculateMissTpsMissCounts(movements: OsuMovement[], fcTimeTp: number, sectionAmount: number): [number[], number[]];

  /**
   * Calculate the probability of missing each note given a skill level.
   */
  private static getMissProbs(movements: OsuMovement[], tp: number): number[];

  /**
   * Find first miss count achievable with at least probability p
   */
  private static getMissCount(p: number, missProbabilities: number[]): number;

  /**
   * For each cheese level, it first calculates the required throughput,
   * then divides the result by the throughput corresponding to the default cheese level.
   */ 
  private static calculateCheeseLevelsCheeseFactors(movements: OsuMovement[], fcProbTp: number): [number[], number[]];;

  /**
   * Gets the number of movements that might be cheesed.
   * A movement might be cheesed if it is both difficult and cheesable.
   */
  private static getCheeseNoteCount(movements: OsuMovement[], tp: number): number;

  /**
   * The map is divided into combo_tp_count sections, and a submap can span x sections.
   * This function calculates fcTimeTp for every possible submap length.
   */
  private static calculateComboTps(hitProbabilities: HitProbabilities, sectionAmount: number): number[];

  /**
   * Calculates the probability to FC the movements.
   */
  private static calculateFcProb(movements: OsuMovement[], tp: number, cheeseLevel: number): number;
}

export interface IAimAtts
{
  fcProbTp: number;
  hiddenFactor: number;
  comboTps: number[];
  missTps: number[];
  missCounts: number[];
  cheeseNoteCount: number;
  cheeseLevels: number[];
  cheeseFactors: number[];
}