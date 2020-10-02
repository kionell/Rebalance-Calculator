class Difficulty
{
  constructor(stars, atts, mapLength, mods, modStats, preempt, hitWindowGreat)
  {
    this.totalStars = stars.total;

    this.tapStars = stars.tap;
    this.aimStars = stars.aim;
    this.fingerStars = stars.finger;

    this.tapAtts = atts.tap;
    this.aimAtts = atts.aim;
    this.fingerDiff = atts.finger;

    this.clockRate = modStats.clockRate;
    this.mapLength = mapLength;
    this.mods = mods;

    this.CS = modStats.CS;
    this.HP = modStats.HP;
    this.AR = preempt > 1200 ? (1800 - preempt) / 120 : (1200 - preempt) / 150 + 5;
    this.OD = (80 - hitWindowGreat) / 6;
  }
};

module.exports = Difficulty;
