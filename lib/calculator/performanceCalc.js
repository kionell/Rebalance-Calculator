const Mean = require('./mathUtil/mean.js');
const Generate = require('./mathUtil/numerics/generate.js');
const LinearSpline = require('./mathUtil/numerics/linearSpline.js');
const Logistic = require('./mathUtil/numerics/logistic.js');
const Erf = require('./mathUtil/numerics/erf.js');

const Mods = require('../classes/mods.js');
const Performance = require('../classes/performance.js');

class PerformanceCalculator
{
  static #total_value_exponent = 1.5;
  static #skill_to_pp_exponent = 2.7;
  static #miss_count_leniency = 0.5;

  constructor(beatmap, mods) {
    this.beatmap = beatmap;
    this.mods = mods instanceof Mods 
      ? mods : new Mods(mods);
  }

  calculate(difficulty, score)
  {
    this.greatWindow = 79.5 - 6 * difficulty.OD;
    
    // This is being adjusted to keep the final pp value scaled around what it used to be when changing things
    let multiplier = 2.14; 

    // Custom multipliers for NoFail and SpunOut.
    if (this.mods.acronyms.includes('NF')) {
      multiplier *= 0.90;
    }

    if (this.mods.acronyms.includes('SO')) {
      multiplier *= 0.95;
    }

    // guess the number of misses + slider breaks from combo
    let comboBasedMissCount;

    if (this.beatmap.sliderCount === 0) {
      if (score.maxCombo < this.beatmap.maxCombo) {
        comboBasedMissCount = this.beatmap.maxCombo / score.maxCombo;
      }
      else {
        comboBasedMissCount = 0;
      }
    }
    else {
      let fullComboThreshold = this.beatmap.maxCombo - 0.1 * this.beatmap.sliderCount;

      if (score.maxCombo < fullComboThreshold) {
        comboBasedMissCount = fullComboThreshold / score.maxCombo;
      }
      else {
        comboBasedMissCount = Math.pow((this.beatmap.maxCombo - score.maxCombo) 
          / (0.1 * this.beatmap.sliderCount), 3);
      }
    }

    this.effectiveMissCount = Math.max(score.countMiss, comboBasedMissCount);

    let aimValue = this.#computeAimValue(difficulty, score);
    let tapValue = this.#computeTapValue(difficulty, score);
    let accuracyValue = this.#computeAccuracyValue(difficulty, score);

    let totalValue = Mean.powerMean2([aimValue, tapValue, accuracyValue], 
      PerformanceCalculator.#total_value_exponent) * multiplier;

    return new Performance(aimValue, tapValue, accuracyValue, totalValue);
  }

  #computeAimValue(difficulty, score)
  {
    if (this.beatmap.hitObjects.length <= 1) {
      return 0;
    }

    // Get player's throughput according to combo
    let comboTpCount = difficulty.aimAtts.comboTps.length;
    let comboPercentages = Generate.linearSpaced(comboTpCount, 1.0 / comboTpCount, 1);

    let scoreComboPercentage = score.maxCombo / this.beatmap.maxCombo;

    let comboTp = LinearSpline.interpolateSorted(
      comboPercentages, difficulty.aimAtts.comboTps
    ).interpolate(scoreComboPercentage);

    // Get player's throughput according to miss count
    let missTp = LinearSpline.interpolateSorted(
      difficulty.aimAtts.missCounts,
      difficulty.aimAtts.missTps
    ).interpolate(this.effectiveMissCount);

    missTp = Math.max(missTp, 0);

    // Combine combo based throughput and miss count based throughput
    let tp = Mean.powerMean1(comboTp, missTp, 20);

    // Hidden mod
    if (this.mods.acronyms.includes('HD')) {
      let hiddenFactor = difficulty.aimAtts.hiddenFactor;

      // the buff starts decreasing at AR9.75 and reaches 0 at AR10.75
      if (difficulty.AR > 10.75) {
        hiddenFactor = 1;
      }
      else if (difficulty.AR > 9.75) {
        hiddenFactor = 1 + (1 - Math.pow(Math.sin((difficulty.AR - 9.75) * Math.PI / 2), 2)) * (hiddenFactor - 1);
      }

      tp *= hiddenFactor;
    }

    // Account for cheesing
    let modifiedAcc = this.#getModifiedAcc(score);
    let accOnCheeseNotes = 1 - (1 - modifiedAcc) 
      * Math.sqrt(score.totalHits / difficulty.aimAtts.cheeseNoteCount);

    // accOnCheeseNotes can be negative. The formula below ensures a positive acc while
    // preserving the value when accOnCheeseNotes is close to 1
    let accOnCheeseNotesPositive = Math.exp(accOnCheeseNotes - 1);
    let urOnCheeseNotes = 10 * this.greatWindow / (Math.sqrt(2) * Erf.erfInv(accOnCheeseNotesPositive));
    let cheeseLevel = Logistic.logistic(((urOnCheeseNotes * difficulty.aimAtts.fcProbTp) - 3200) / 2000);

    let cheeseFactor = LinearSpline.interpolateSorted(
      difficulty.aimAtts.cheeseLevels,
      difficulty.aimAtts.cheeseFactors
    ).interpolate(cheeseLevel);

    if (this.mods.acronyms.includes('TD')) {
      tp = Math.min(tp, 1.47 * Math.pow(tp, 0.8));
    }

    let aimValue = this.#tpToPP(tp * cheeseFactor);

    // penalize misses
    aimValue *= Math.pow(0.96, Math.max(this.effectiveMissCount - PerformanceCalculator.#miss_count_leniency, 0));

    // Buff long maps
    aimValue *= 1 + (Logistic.logistic((score.totalHits - 2800) / 500.0) - Logistic.logistic(-2800 / 500.0)) * 0.22;

    // Buff very high AR and low AR
    let approachRateFactor = 1.0;

    if (difficulty.AR > 10) {
      approachRateFactor += (0.05 + 0.35 * Math.pow(Math.sin(Math.PI * Math.min(score.totalHits, 1250) / 2500), 1.7)) * 
        Math.pow(difficulty.AR - 10, 2);
    }
    else if (difficulty.AR < 8.0) {
      approachRateFactor += 0.01 * (8.0 - difficulty.AR);
    }

    aimValue *= approachRateFactor;

    if (this.mods.acronyms.includes('FL')) {
      // Apply object-based bonus for flashlight.
      aimValue *= 1.0 + 0.35 * Math.min(1.0, score.totalHits / 200.0) +
        (score.totalHits > 200 ? 0.3 * Math.min(1.0, (score.totalHits - 200) / 300.0) +
          (score.totalHits > 500 ? (score.totalHits - 500) / 2000.0 : 0.0) : 0.0);
    }

    // Scale the aim value down with accuracy
    let accLeniency = this.greatWindow * difficulty.aimAtts.fcProbTp / 300;
    let accPenalty = (0.09 / (score.accuracy - 1.3) + 0.3) * (accLeniency + 1.5);
    aimValue *= Math.exp(-accPenalty);
    
    return aimValue;
  }

  #computeTapValue(difficulty, score)
  {
    if (this.beatmap.hitObjects.length <= 1) {
      return 0;
    }

    let modifiedAcc = this.#getModifiedAcc(score);

    // Assume SS for non-stream parts
    let accOnStreams = 1 - (1 - modifiedAcc) * Math.sqrt(score.totalHits / difficulty.tapAtts.streamNoteCount);

    // accOnStreams can be negative. The formula below ensures a positive acc while
    // preserving the value when accOnStreams is close to 1
    let accOnStreamsPositive = Math.exp(accOnStreams - 1);

    let urOnStreams = 10 * this.greatWindow / (Math.sqrt(2) * Erf.erfInv(accOnStreamsPositive));

    let mashLevel = Logistic.logistic(((urOnStreams * difficulty.tapAtts.tapDiff) - 4000) / 1000);

    let tapSkill = mashLevel * difficulty.tapAtts.mashTapDiff + (1 - mashLevel) * difficulty.tapAtts.tapDiff;

    let tapValue = this.#tapSkillToPP(tapSkill);

    // Buff very high acc on streams
    let accBuff = Math.exp((accOnStreams - 1) * 60) * tapValue * 0.2;
    tapValue += accBuff;

    // Scale tap value down with accuracy
    let accFactor = 0.5 + 0.5 * (Logistic.logistic((score.accuracy - 0.65) / 0.1) + Logistic.logistic(-3.5));
    tapValue *= accFactor;

    // Penalize misses and 50s exponentially
    tapValue *= Math.pow(0.93, Math.max(this.effectiveMissCount - PerformanceCalculator.#miss_count_leniency, 0));
    tapValue *= Math.pow(0.98, score.count50 < score.totalHits / 500.0 ? 
      0.5 * score.count50 : score.count50 - score.totalHits / 500.0 * 0.5);

    // Buff very high AR
    let approachRateFactor = 1.0;

    if (difficulty.AR > 10.33) {
      let ar11LengthBuff = 0.8 * (Logistic.logistic(score.totalHits / 500) - 0.5);
      approachRateFactor += ar11LengthBuff * (difficulty.AR - 10.33) / 0.67;
    }

    tapValue *= approachRateFactor;

    return tapValue;
  }

  #computeAccuracyValue(difficulty, score)
  {
    let fingerControlDiff = difficulty.fingerDiff;

    let modifiedAcc = this.#getModifiedAcc(score);

    // technically accOnCircles = modifiedAcc
    // -0.003 exists so that the difference between 99.5% and 100% is not too big
    let accOnCircles = modifiedAcc - 0.003;

    // accOnCircles can be negative. The formula below ensures a positive acc while
    // preserving the value when accOnCircles is close to 1
    let accOnCirclesPositive = Math.exp(accOnCircles - 1);

    // add 20 to greatWindow to nerf high OD
    let deviationOnCircles = (this.greatWindow + 20) / (Math.sqrt(2) * Erf.erfInv(accOnCirclesPositive));

    let accuracyValue = Math.pow(deviationOnCircles, -2.2) * Math.pow(fingerControlDiff, 0.5) * 46000;

    // scale acc pp with misses
    accuracyValue *= Math.pow(0.96, Math.max(this.effectiveMissCount - PerformanceCalculator.#miss_count_leniency, 0));

    // nerf short maps
    let lengthFactor = difficulty.mapLength < 120 
      ? Logistic.logistic((difficulty.mapLength - 300) / 60.0) + 
          Logistic.logistic(2.5) - Logistic.logistic(-2.5) 
      : Logistic.logistic(difficulty.mapLength / 60.0);

    accuracyValue *= lengthFactor;

    if (this.mods.acronyms.includes('HD')) {
      accuracyValue *= 1.08;
    }

    if (this.mods.acronyms.includes('FL')) {
      accuracyValue *= 1.02;
    }

    return accuracyValue;
  }

  #getModifiedAcc(score)
  {
    // Treat 300 as 300, 100 as 200, 50 as 100
    // Assume all 300s on sliders/spinners and exclude them from the calculation. In other words we're
    // estimating the scorev2 acc from scorev1 acc.
    // Add 2 to countHitCircles in the denominator so that later erfinv gives resonable result for ss scores
    return ((score.count300 - (score.totalHits - this.beatmap.circleCount)) * 3 
      + score.count100 * 2 + score.count50) / ((this.beatmap.circleCount + 2) * 3);
  }

  #tpToPP(tp) 
  {
    return Math.pow(tp, PerformanceCalculator.#skill_to_pp_exponent) * 0.118;
  }

  #tapSkillToPP(tapSkill)
  {
    return Math.pow(tapSkill, PerformanceCalculator.#skill_to_pp_exponent) * 0.115;
  }
}

module.exports = PerformanceCalculator;
