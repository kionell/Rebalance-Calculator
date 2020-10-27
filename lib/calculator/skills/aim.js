const OsuMovement = require('../preprocessing/osuMovement.js');
const HitProbabilities = require('../mathUtil/hitProbabilities.js');
const PoissonBinomial = require('../mathUtil/poissonBinomial.js');

const Logistic = require('../mathUtil/numerics/logistic.js')
const Brent = require('../mathUtil/numerics/brent.js');
const Bisection = require('../mathUtil/numerics/bisection.js');

const prob_threshold = 0.02;
const time_threshold_base = 1200;

const tp_min = 0.1;
const tp_max = 100;

const prob_precision = 1e-4;
const time_precision = 0.6;

const max_iterations = 100;

const default_cheese_level = 0.4;
const cheese_level_count = 11;

const miss_tp_count = 20;
const combo_tp_count = 50;

class Aim
{
  static calculateAimAttributes(hitObjects, clockRate, strainHistory, noteDensities)
  {
    let movements = Aim._createMovements(hitObjects, clockRate, strainHistory);
    let movementsHidden = Aim._createMovements(hitObjects, clockRate, strainHistory, true, noteDensities);

    let comboSectionAmount = Math.min(combo_tp_count, movements.length);
    let missSectionAmount = Math.min(miss_tp_count, movements.length);

    if (!movements.length) {
      return {
        fcProbTp: 0, 
        hiddenFactor: 0, 
        comboTps: [], 
        missTps: [],
        missCounts: [], 
        cheeseNoteCount: 0, 
        cheeseLevels: [], 
        cheeseFactors: []
      };
    }
 
    let mapHitProbs = new HitProbabilities(movements, default_cheese_level, comboSectionAmount);
    let fcProbTp = Aim._calculateFcProbTp(movements);
    let fcProbTpHidden = Aim._calculateFcProbTp(movementsHidden); 

    let hiddenFactor = fcProbTpHidden / fcProbTp;

    let comboTps = Aim._calculateComboTps(mapHitProbs, comboSectionAmount);
    let fcTimeTp = comboTps[comboTps.length - 1];
    let [missTps, missCounts] = Aim._calculateMissTpsMissCounts(movements, fcTimeTp, missSectionAmount);
    let [cheeseLevels, cheeseFactors] = Aim._calculateCheeseLevelsCheeseFactors(movements, fcProbTp);
    let cheeseNoteCount = Aim._getCheeseNoteCount(movements, fcProbTp);

    return {
      fcProbTp, 
      hiddenFactor, 
      comboTps, 
      missTps, 
      missCounts, 
      cheeseNoteCount, 
      cheeseLevels, 
      cheeseFactors
    };
  }

  static _createMovements(hitObjects, clockRate, strainHistory, hidden = false, noteDensities = null)
  {
    const movements = [];

    if (hitObjects.length === 0) {
      return movements;
    }

    // the first object
    movements.push(...OsuMovement.extractMovement1(hitObjects[0]));

    // the rest
    for (let i = 1, len = hitObjects.length; i < len; ++i) {
      var objNeg4 = i > 3 ? hitObjects[i - 4] : null;
      var objNeg2 = i > 1 ? hitObjects[i - 2] : null;
      var objPrev = hitObjects[i - 1];
      var objCurr = hitObjects[i];
      var objNext = i < hitObjects.length - 1 ? hitObjects[i + 1] : null;
      var tapStrain = strainHistory[i];

      if (hidden) {
        movements.push(...OsuMovement.extractMovement2(
          objNeg2, objPrev, objCurr, objNext, tapStrain, 
          clockRate, true, noteDensities[i], objNeg4
        ));
      } else {
        movements.push(...OsuMovement.extractMovement2(
          objNeg2, objPrev, objCurr, objNext, tapStrain, 
          clockRate, false, 0, objNeg4
        ));
      }
    }

    return movements;
  }

  static _calculateFcProbTp(movements, cheeseLevel = default_cheese_level)
  {
    let fcProbTpMin = Aim._calculateFcProb(movements, tp_min, cheeseLevel);

    if (fcProbTpMin >= prob_threshold) {
      return tp_min;
    }

    let fcProbTpMax = Aim._calculateFcProb(movements, tp_max, cheeseLevel);

    if (fcProbTpMax <= prob_threshold) {
      return tp_max;
    }

    let fcProbMinusThreshold = tp => Aim._calculateFcProb(movements, tp, cheeseLevel) - prob_threshold;

    return Brent.findRoot(fcProbMinusThreshold, tp_min, tp_max, prob_precision, max_iterations);
  }

  static _calculateFcTimeTp(mapHitProbs, sectionCount)
  {
    let maxFcTime = mapHitProbs.minExpectedTimeForSectionCount(tp_min, sectionCount);

    if (maxFcTime <= time_threshold_base) {
      return tp_min;
    }

    let minFcTime = mapHitProbs.minExpectedTimeForSectionCount(tp_max, sectionCount);

    if (minFcTime >= time_threshold_base) {
      return tp_max;
    }

    let fcTimeMinusThreshold = tp => mapHitProbs.minExpectedTimeForSectionCount(tp, sectionCount) - time_threshold_base;

    return Bisection.findRoot(fcTimeMinusThreshold, tp_min, tp_max, time_precision, max_iterations);
  }

  static _calculateMissTpsMissCounts(movements, fcTimeTp, sectionAmount)
  {
    let missTps = [];
    let missCounts = [];
    let fcProb = Aim._calculateFcProb(movements, fcTimeTp, default_cheese_level);

    for (let i = 0; i < sectionAmount; ++i) {
      let missTp = fcTimeTp * (1 - Math.pow(i, 1.5) * 0.005);
      let missProbs = Aim._getMissProbs(movements, missTp);
      missTps[i] = missTp;
      missCounts[i] = Aim._getMissCount(fcProb, missProbs);
    }

    return [missTps, missCounts];
  }

  static _getMissProbs(movements, tp)
  {
    // slider breaks should be a miss :( -- joz, 2019
    let missProbs = new Array(movements.length);

    for (let i = 0; i < movements.length; ++i) {
      let movement = movements[i];
      missProbs[i] = 1 - HitProbabilities.calculateCheeseHitProb(movement, tp, default_cheese_level);
    }

    return missProbs;
  }

  static _getMissCount(p, missProbabilities)
  {
    if (missProbabilities.reduce((p, c) => p + c, 0) === 0) {
      return 0;
    }

    let distribution = new PoissonBinomial(missProbabilities);

    let cdfMinusProb = missCount => distribution.cdf(missCount) - p;

    return Brent.findRootExpand(cdfMinusProb, -100, 1000);
  }

  static _calculateCheeseLevelsCheeseFactors(movements, fcProbTp)
  {
    let cheeseLevels = [];
    let cheeseFactors = [];

    for (let i = 0; i < cheese_level_count; ++i) {
      let cheeseLevel = i / (cheese_level_count - 1);

      cheeseLevels[i] = cheeseLevel;
      cheeseFactors[i] = Aim._calculateFcProbTp(movements, cheeseLevel) / fcProbTp;
    }

    return [cheeseLevels, cheeseFactors];
  }

  static _getCheeseNoteCount(movements, tp)
  {
    let count = 0;

    for (const movement of movements) {
      let cheeseness = Logistic.logistic((movement.indexOfPerformance / tp - 0.6) * 15) * movement.cheesability;
      count += cheeseness;
    }

    return count;
  }

  static _calculateComboTps(hitProbabilities, sectionAmount)
  {
    let comboTps = [];

    for (let i = 1; i <= sectionAmount; ++i) {
      comboTps[i - 1] = Aim._calculateFcTimeTp(hitProbabilities, i);
    }

    return comboTps;
  }

  static _calculateFcProb(movements, tp, cheeseLevel)
  {
    let fcProb = 1;

    for (const movement of movements) {
      let hitProb = HitProbabilities.calculateCheeseHitProb(movement, tp, cheeseLevel);
      fcProb *= hitProb;
    }

    return fcProb;
  }
}

module.exports = Aim;
