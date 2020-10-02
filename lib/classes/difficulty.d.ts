import {IStars, IAtts, IModStats} from "../calculator/difficultyCalc";
import {IAimAtts} from "../calculator/skills/aim";
import {ITapAtts} from "../calculator/skills/tap";

import Mods from "../classes/mods";

export default class Difficulty
{
  /**
   * New difficulty attributes.
   */
  constructor(stars: IStars, atts: IAtts, mapLength: number, mods: Mods, modStats: IModStats, preempt: number, hitWindowGreat: number);

  totalStars: number;

  tapStars: number;
  aimStars: number;
  fingerStars: number;

  tapAtts: ITapAtts;
  aimAtts: IAimAtts;
  fingerDiff: number;

  clockRate: number;
  mapLength: number;
  mods: Mods;

  CS: number;
  HP: number;
  AR: number;
  OD: number;
}
