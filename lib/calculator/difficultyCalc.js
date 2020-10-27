const NoteDensity = require('./preprocessing/noteDensity');
const Mean = require('./mathUtil/mean');

const FingerControl = require('./skills/fingerControl');
const Aim = require('./skills/aim');
const Tap = require('./skills/tap');

const Beatmap = require('../classes/beatmap');
const Mods = require('../classes/mods');
const Difficulty = require('../classes/difficulty');

const {difficultyRange, completeBeatmap} = require('../services/beatmapBuilder');

const aim_multiplier = 0.641;
const tap_multiplier = 0.641;
const finger_control_multiplier = 1.245;

const sr_exponent = 0.83;

class DifficultyCalculator
{
  constructor(beatmap, mods)
  {
    this.setBeatmap(beatmap);
    this.setMods(mods);
  }

  calculate(totalHits = undefined)
  {
    if (!(this.beatmap instanceof Beatmap)) {
      throw new Error(`Wrong beatmap! Can't calculate performance!`);
    }
    
    let modStats = this._applyMods(this.mods);

    let hitObjects = this.beatmap.hitObjects.slice(0, totalHits);
    let clockRate = modStats.clockRate;
    let mapLength = 0;

    if (hitObjects.length > 0) {
      mapLength = (hitObjects[hitObjects.length - 1].startTime - hitObjects[0].startTime) / 1000 / clockRate;
    }

    let preemptNoClockRate = difficultyRange(modStats.AR, 1800, 1200, 450);
    let noteDensities = NoteDensity.calculateNoteDensities(hitObjects, preemptNoClockRate);

    const atts = {};

    atts.tap = Tap.calculateTapAttributes(hitObjects, clockRate);
    atts.aim = Aim.calculateAimAttributes(hitObjects, clockRate, atts.tap.strainHistory, noteDensities);
    atts.finger = FingerControl.calculateFingerControlDiff(hitObjects, clockRate);

    const stars = {};
    
    stars.tap = tap_multiplier* Math.pow(atts.tap.tapDiff, sr_exponent) || 0;
    stars.aim = aim_multiplier * Math.pow(atts.aim.fcProbTp, sr_exponent) || 0;
    stars.finger = finger_control_multiplier * Math.pow(atts.finger, sr_exponent) || 0; 

    stars.total = Mean.powerMean2([stars.tap, stars.aim, stars.finger], 7) * 1.131;

    let hitWindowGreat = Math.trunc(difficultyRange(modStats.OD, 80, 50, 20)) / clockRate;
    let preempt = Math.trunc(difficultyRange(modStats.AR, 1800, 1200, 450)) / clockRate;

    return new Difficulty(stars, atts, mapLength, this.mods, modStats, preempt, hitWindowGreat);
  }

  setBeatmap(beatmap) {
    this.beatmap = beatmap;
  }

  setMods(mods) {
    this.mods = mods instanceof Mods 
      ? mods : new Mods(mods);
  }

  _applyMods(mods) 
  {
    // Use fround() for compatibility with C# float type.
    let modStats = {
      CS: Math.fround(this.beatmap.CS),
      HP: Math.fround(this.beatmap.HP),
      OD: Math.fround(this.beatmap.OD),
      AR: Math.fround(this.beatmap.AR),

      clockRate: 1
    }

    if (mods.acronyms.includes('DT') || mods.acronyms.includes('NC')) {
      modStats.clockRate = 1.5;
    }
    // For the future updates, when Daycore will appear.
    else if (mods.acronyms.includes('HT') || mods.acronyms.includes('DC')) {
      modStats.clockRate = 0.75;
    }
    else {
      modStats.clockRate = 1;
    }

    // It is possible to apply HR and EZ at the same time.
    if (mods.acronyms.includes('HR')) {
      modStats.CS *= 1.3;
      modStats.HP *= 1.4;
      modStats.OD *= 1.4;
      modStats.AR *= 1.4;
    }
    if (mods.acronyms.includes('EZ')) {
      modStats.CS /= 2;
      modStats.HP /= 2;
      modStats.OD /= 2;
      modStats.AR /= 2;
    }

    modStats.CS = Math.min(modStats.CS, 10);
    modStats.HP = Math.min(modStats.HP, 10);
    modStats.OD = Math.min(modStats.OD, 10);
    modStats.AR = Math.min(modStats.AR, 10);

    completeBeatmap(this.beatmap, modStats);

    return modStats;
  }
};

module.exports = DifficultyCalculator;
