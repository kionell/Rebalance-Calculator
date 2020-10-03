export default class User
{
  constructor(options: IApiUserOptions);

  userId: string | number;
  username: string;

  joined: string | Date | null;
  playTime: string | number;
  playCount: string | number;

  worldRank: string | number;
  countryRank: string | number;
  country: string;

  rankedScore: string | number;
  totalScore: string | number;
  level: string | number;

  livePP: string | number;
  accuracy: string | number;

  count300: string | number;
  count100: string | number;
  count50: string | number;

  ranks: {
    XH: string | number,
    X: string | number,
    SH: string | number,
    S: string | number,
    A: string | number
  }

  events: string[]
}

export interface IApiUserOptions
{
  user_id: string,
  username: string,
  join_date: string,
  count300: string,
  count100: string,
  count50: string,
  playcount: string,
  ranked_score: string,
  total_score: string,
  pp_rank: string,
  level: string,
  pp_raw: string,
  accuracy: string,
  count_rank_ss: string,
  count_rank_ssh: string,
  count_rank_s: string,
  count_rank_sh: string,
  count_rank_a: string,
  country: string,
  total_seconds_played: string,
  pp_country_rank: string,
  events: string[]
}