class User
{
  constructor(options)
  {
    this.userId = options.user_id || 0;
    this.username = options.username;
  
    this.joined = options.join_date || null;
    this.playTime = options.total_seconds_played || 0;
    this.playCount = options.playcount || 0;
  
    this.worldRank = options.pp_rank || 0;
    this.countryRank = options.pp_country_rank || 0;
    this.country = options.country;
  
    this.rankedScore = options.ranked_score || 0;
    this.totalScore = options.total_score || 0;
    this.level = options.level || 0;
  
    this.livePP = options.pp_raw || 0;
    this.accuracy = options.accuracy || 0;
  
    this.count300 = options.count300 || 0;
    this.count100 = options.count100 || 0;
    this.count50 = options.count50 || 0;
  
    this.ranks = {
      XH: options.count_rank_ssh || 0,
      X: options.count_rank_ss || 0,
      SH: options.count_rank_sh || 0,
      S: options.count_rank_s || 0,
      A: options.count_rank_a || 0
    }
  
    this.events = options.events;
  }
}

module.exports = User;