import Beatmap from '../classes/beatmap';
import Mods from '../classes/mods';
import Score from '../classes/score';
import UserScore from '../classes/userScore';

import Difficulty from '../classes/difficulty';
import Performance from '../classes/performance';

export default class PerformanceCalculator
{
  /**
   * Creates new instance of Rebalance Performance Calculator.
   * @param beatmap Beatmap object.
   * @param mods Mods object or raw mods.
   */
  constructor(beatmap?: Beatmap, mods?: string | string[] | number | Mods);

  beatmap: Beatmap;
  mods: Mods;

  /**
   * Calculates performance attributes.
   * @param difficulty Calculated difficulty.
   * @param score Score template or user score.
   */
  calculate(difficulty: Difficulty, score: Score | UserScore): Performance;
  
  /**
   * Beatmap setter.
   * @param beatmap Beatmap object.
   */
  setBeatmap(beatmap: Beatmap): void;

  /**
   * Mods setter.
   * @param mods Mods object or raw mods.
   */
  setMods(mods: string | string[] | number | Mods): void;

  private _computeAimValue(difficulty: Difficulty, score: Score | UserScore): number;
  private _computeTapValue(difficulty: Difficulty, score: Score | UserScore): number;
  private _computeAccuracyValue(difficulty: Difficulty, score: Score | UserScore): number;

  private _getModifiedAcc(score): number;
  private _tpToPP(tp): number;
  private _tapSkillToPP(tapSkill): number;
}