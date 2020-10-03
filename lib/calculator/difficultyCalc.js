const NoteDensity = require('./preprocessing/noteDensity');
const Mean = require('./mathUtil/mean');

const FingerControl = require('./skills/fingerControl');
const Aim = require('./skills/aim');
const Tap = require('./skills/tap');

const Mods = require('../classes/mods');
const Difficulty = require('../classes/difficulty');

const {difficultyRange, completeBeatmap} = require('../services/beatmapBuilder');

class DifficultyCalculator
{
  static #aim_multiplier = 0.641;
  static #tap_multiplier = 0.641;
  static #finger_control_multiplier = 1.245;

  static #sr_exponent = 0.83;

  constructor(beatmap, mods)
  {
    this.beatmap = beatmap;
    this.mods = mods instanceof Mods 
      ? mods : new Mods(mods);
  }

  calculate()
  {
    let modStats = this.#applyMods(this.mods);

    let hitObjects = this.beatmap.hitObjects;
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
    
    stars.tap = DifficultyCalculator.#tap_multiplier
      * Math.pow(atts.tap.tapDiff, DifficultyCalculator.#sr_exponent);

    stars.aim = DifficultyCalculator.#aim_multiplier 
      * Math.pow(atts.aim.fcProbTp, DifficultyCalculator.#sr_exponent);

    stars.finger = DifficultyCalculator.#finger_control_multiplier
      * Math.pow(atts.finger, DifficultyCalculator.#sr_exponent); 

    stars.total = Mean.powerMean2([stars.tap, stars.aim, stars.finger], 7) * 1.131;

    let hitWindowGreat = Math.trunc(difficultyRange(modStats.OD, 80, 50, 20)) / clockRate;
    let preempt = Math.trunc(difficultyRange(modStats.AR, 1800, 1200, 450)) / clockRate;

    return new Difficulty(stars, atts, mapLength, this.mods, modStats, preempt, hitWindowGreat);
  }

  #applyMods(mods) 
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
