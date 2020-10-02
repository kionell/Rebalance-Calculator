const Mods = require('./mods');

class Score
{
  constructor(options)
  {
    this.mods = options.mods instanceof Mods 
      ? options.mods : new Mods(options.mods);

    this.count300  = Number(options.count300);
    this.count100  = Number(options.count100);
    this.count50   = Number(options.count50 || 0);
    this.countMiss = Number(options.countMiss || 0);

    this.totalHits = Number(options.totalHits 
      || options.circleCount + options.sliderCount + options.spinnerCount
      || this.count300 + this.count100 + this.count50 + this.countMiss
    );
    
    if (this.count300 && this.count100 && !this.totalHits) {
      this.totalHits = this.count300 + this.count100 
        + this.count50 + this.countMiss;
    }

    this.maxCombo  = Number(options.maxCombo);
    this.accuracy  = Number(options.accuracy);

    while (this.accuracy > 1) {
      this.accuracy /= 100;
    }

    if ((!this.count100 || !this.count300) && this.accuracy && this.totalHits) {
      this.count100 = (this.totalHits - this.accuracy * this.totalHits) / 2 * 3;
    
      this.count100 = Math.ceil(this.count100);
      this.count300 = this.totalHits - this.count100;
    }

    this.accuracy = (300 * this.count300 + 100 * this.count100 + 50 * this.count50)
      / (300 * (this.count300 + this.count100 + this.count50 + this.countMiss));

    if (!this.totalHits) {
      throw new Error("Wrong total hits! Can't create Score object!");
    }

    if (!this.maxCombo) {
      throw new Error("Wrong max combo! Can't create Score object!");
    }

    if (!this.accuracy) {
      throw new Error("Wrong accuracy! Can't create Score object!");
    }
  }
}

module.exports = Score;
