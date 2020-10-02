import Score from './score';
import Mods from './mods';

export default class UserScore extends Score
{
  constructor(score: IApiScoreOptions);

  username: string;
}

export interface IApiScoreOptions
{
  count100: string,
  count300: string,
  count50: string,
  countgeki: string,
  countkatu: string,
  countmiss: string,
  date: string,
  enabled_mods: string,
  maxcombo: string,
  perfect: string,
  pp: string,
  rank: string,
  replay_available: string,
  score: string,
  score_id: string,
  user_id: string,
  username: string
}