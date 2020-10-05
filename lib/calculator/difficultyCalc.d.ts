import Beatmap from '../classes/beatmap';
import Mods from '../classes/mods';

import Difficulty from '../classes/difficulty';

import {IAimAtts} from '../calculator/skills/aim';
import {ITapAtts} from '../calculator/skills/tap';

export default class DifficultyCalculator
{
  private static readonly aim_multiplier: number;
  private static readonly tap_multiplier: number;
  private static readonly finger_control_multiplier: number;

  private static readonly sr_exponent: number;

  /**
   * Creates new instance of Rebalance Difficulty Calculator.
   */
  constructor(beatmap: Beatmap, mods?: string | string[] | number | Mods);

  beatmap: Beatmap;
  mods: Mods;
  
  /**
   * Calculates difficulty attributes.
   */
  calculate(): Difficulty;

  private applyMods(mods: Mods): IModStats;
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
