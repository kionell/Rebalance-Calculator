import Beatmap from '../classes/beatmap';
import Mods from '../classes/mods';
import Score from '../classes/score';
import UserScore from '../classes/userScore';

import Difficulty from '../classes/difficulty';
import Performance from '../classes/performance';

export default class PerformanceCalculator
{
  /**
   * Aim, tap and acc values are combined using power mean with this as the exponent.
   */
  private static readonly total_value_exponent: number;

  /**
   * This exponent is used to convert throughput to aim pp and tap skill to tap pp.
   */
  private static readonly skill_to_pp_exponent: number;

  /**
   * The first 0.5 miss doesn't count when we penalize misses.
   */
  private static readonly miss_count_leniency: number;

  /**
   * Creates new instance of Rebalance Performance Calculator.
   */
  constructor(beatmap: Beatmap, mods: string | string[] | number | Mods);

  /**
   * Calculates performance attributes.
   */
  calculate(difficulty: Difficulty, score: Score | UserScore): Performance;

  private computeAimValue(difficulty: Difficulty, score: Score | UserScore): number;
  private computeTapValue(difficulty: Difficulty, score: Score | UserScore): number;
  private computeAccuracyValue(difficulty: Difficulty, score: Score | UserScore): number;

  private getModifiedAcc(score): number;
  private tpToPP(tp): number;
  private tapSkillToPP(tapSkill): number;
}