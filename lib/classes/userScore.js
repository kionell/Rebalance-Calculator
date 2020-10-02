const Mods = require('./mods.js');
const Score = require('./score.js');

class UserScore extends Score
{
  constructor(score)
  {
    const options = {
      mods: new Mods(score.enabled_mods),
      maxCombo: score.maxcombo,
    
      count300: score.count300,
      count100: score.count100,
      count50: score.count50,
      countMiss: score.countmiss,
    }

    super(options);

    this.username = score.username;
    this.userId = score.user_id;
    this.date = score.date;
    this.livePP = score.pp;
    this.rank = score.rank;
  }
}

module.exports = UserScore;
