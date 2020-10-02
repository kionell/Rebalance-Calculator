import Mods from './mods';

export default class Score
{
  constructor(options: ILocalScoreOptions | IUserScoreOptions);

  mods: Mods;

  count300: number;
  count100: number;
  count50: number;
  countMiss: number;

  totalHits: number;
  maxCombo: number;
  accuracy: number;
}

export interface ILocalScoreOptions 
{
  maxCombo: number;
  accuracy: number;

  mods?: number | string | Mods;

  totalHits?: number;

  count300?: number;
  count100?: number;
  count50?: number;
  countMiss?: number;

  circleCount?: number;
  sliderCount?: number;
  spinnerCount?: number;
}

export interface IUserScoreOptions
{
  maxCombo: number;
  mods: number | string | Mods;

  count300: number;
  count100: number;
  count50: number;
  countMiss: number;

  accuracy?: number;
}