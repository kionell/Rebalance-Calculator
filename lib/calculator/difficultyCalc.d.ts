import Beatmap from '../classes/beatmap';
import Mods from '../classes/mods';

import Difficulty from '../classes/difficulty';

import {IAimAtts} from '../calculator/skills/aim';
import {ITapAtts} from '../calculator/skills/tap';

export default class DifficultyCalculator
{
  /**
   * Creates new instance of Rebalance Difficulty Calculator.
   * @param beatmap Beatmap object.
   * @param mods Mods object or raw mods.
   */
  constructor(beatmap?: Beatmap, mods?: string | string[] | number | Mods);

  beatmap: Beatmap;
  mods: Mods;
  
  /**
   * Calculates difficulty attributes.
   * @param totalHits The number of objects to which the map will be calculated
   */
  calculate(totalHits?: number): Difficulty;

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

  private _applyMods(mods: Mods): IModStats;
}

export interface IModStats
{
  CS: number;
  HP: number;
  OD: number;
  AR: number;

  clockRate: number;
}

export interface IAtts
{
  tap: ITapAtts;
  aim: IAimAtts;
  finger: number;
}

export interface IStars
{
  tap: number;
  aim: number;
  finger: number;
  total: number;
}
