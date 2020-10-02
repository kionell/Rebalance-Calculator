const OsuMovement = require('../preprocessing/osuMovement.js');
const HitProbabilities = require('../mathUtil/hitProbabilities.js');
const PoissonBinomial = require('../mathUtil/poissonBinomial.js');

const Logistic = require('../mathUtil/numerics/logistic.js')
const Brent = require('../mathUtil/numerics/brent.js');
const Bisection = require('../mathUtil/numerics/bisection.js');

class Aim
{
  static #prob_threshold = 0.02;
  static #time_threshold_base = 1200;

  static #tp_min = 0.1;
  static #tp_max = 100;

  static #prob_precision = 1e-4;
  static #time_precision = 0.6;

  static #max_iterations = 100;

  static #default_cheese_level = 0.4;
  static #cheese_level_count = 11;

  static #miss_tp_count = 20;
  static #combo_tp_count = 50;

  static calculateAimAttributes(hitObjects, clockRate, strainHistory, noteDensities)
  {
    let movements = Aim.#createMovements(hitObjects, clockRate, strainHistory);
    let movementsHidden = Aim.#createMovements(hitObjects, clockRate, strainHistory, true, noteDensities);

    let comboSectionAmount = Math.min(Aim.#combo_tp_count, movements.length);
    let missSectionAmount = Math.min(Aim.#miss_tp_count, movements.length);

    let mapHitProbs = new HitProbabilities(movements, Aim.#default_cheese_level, comboSectionAmount);
    let fcProbTp = Aim.#calculateFcProbTp(movements);
    let fcProbTpHidden = Aim.#calculateFcProbTp(movementsHidden); 

    let hiddenFactor = fcProbTpHidden / fcProbTp;

    let comboTps = Aim.#calculateComboTps(mapHitProbs, comboSectionAmount);
    let fcTimeTp = comboTps[comboTps.length - 1];
    let [missTps, missCounts] = Aim.#calculateMissTpsMissCounts(movements, fcTimeTp, missSectionAmount);
    let [cheeseLevels, cheeseFactors] = Aim.#calculateCheeseLevelsCheeseFactors(movements, fcProbTp);
    let cheeseNoteCount = Aim.#getCheeseNoteCount(movements, fcProbTp);

    return {fcProbTp, hiddenFactor, comboTps, missTps, missCounts, cheeseNoteCount, cheeseLevels, cheeseFactors};
  }

  static #createMovements(hitObjects, clockRate, strainHistory, hidden = false, noteDensities = null)
  {
    const movements = [];

    if (hitObjects.length === 0) {
      return movements;
    }

    // the first object
    movements.push(...OsuMovement.extractMovement1(hitObjects[0]));

    // the rest
    for (let i = 1, len = hitObjects.length; i < len; ++i) {
      var objMinus2 = i > 3 ? hitObjects[i - 4] : null;
      var obj0 = i > 1 ? hitObjects[i - 2] : null;
      var obj1 = hitObjects[i - 1];
      var obj2 = hitObjects[i];
      var obj3 = i < hitObjects.length - 1 ? hitObjects[i + 1] : null;
      var tapStrain = strainHistory[i];

      if (hidden) {
        movements.push(...OsuMovement.extractMovement2(obj0, obj1, obj2, obj3, tapStrain, clockRate, true, noteDensities[i], objMinus2));
      } else {
        movements.push(...OsuMovement.extractMovement2(obj0, obj1, obj2, obj3, tapStrain, clockRate, false, 0, objMinus2));
      }
    }

    return movements;
  }

  static #calculateFcProbTp(movements, cheeseLevel = Aim.#default_cheese_level)
  {
    let fcProbTpMin = Aim.calculateFcProb(movements, Aim.#tp_min, cheeseLevel);

    if (fcProbTpMin >= Aim.#prob_threshold) {
      return Aim.#tp_min;
    }

    let fcProbTpMax = Aim.calculateFcProb(movements, Aim.#tp_max, cheeseLevel);

    if (fcProbTpMax <= Aim.#prob_threshold) {
      return Aim.#tp_max;
    }

    let fcProbMinusThreshold = tp => Aim.calculateFcProb(movements, tp, cheeseLevel) - Aim.#prob_threshold;

    return Brent.findRoot(fcProbMinusThreshold, Aim.#tp_min, Aim.#tp_max, Aim.#prob_precision, Aim.#max_iterations);
  }

  static calculateFcTimeTp(mapHitProbs, sectionCount)
  {
    let maxFcTime = mapHitProbs.minExpectedTimeForSectionCount(Aim.#tp_min, sectionCount);

    if (maxFcTime <= Aim.#time_threshold_base) {
      return Aim.#tp_min;
    }

    let minFcTime = mapHitProbs.minExpectedTimeForSectionCount(Aim.#tp_max, sectionCount);

    if (minFcTime >= Aim.#time_threshold_base) {
      return Aim.#tp_max;
    }

    let fcTimeMinusThreshold = tp => mapHitProbs.minExpectedTimeForSectionCount(tp, sectionCount) - Aim.#time_threshold_base;

    return Bisection.findRoot(fcTimeMinusThreshold, Aim.#tp_min, Aim.#tp_max, Aim.#time_precision, Aim.#max_iterations);
  }

  static #calculateMissTpsMissCounts(movements, fcTimeTp, sectionAmount)
  {
    let missTps = [];
    let missCounts = [];
    let fcProb = Aim.calculateFcProb(movements, fcTimeTp, Aim.#default_cheese_level);

    for (let i = 0; i < sectionAmount; ++i) {
      let missTp = fcTimeTp * (1 - Math.pow(i, 1.5) * 0.005);
      let missProbs = Aim.#getMissProbs(movements, missTp);
      missTps[i] = missTp;
      missCounts[i] = Aim.#getMissCount(fcProb, missProbs);
    }

    return [missTps, missCounts];
  }

  static #getMissProbs(movements, tp)
  {
    // slider breaks should be a miss :( -- joz, 2019
    let missProbs = new Array(movements.length);

    for (let i = 0; i < movements.length; ++i) {
      let movement = movements[i];
      missProbs[i] = 1 - HitProbabilities.calculateCheeseHitProb(movement, tp, Aim.#default_cheese_level);
    }

    return missProbs;
  }

  static #getMissCount(p, missProbabilities)
  {
    if (missProbabilities.reduce((p, c) => p + c, 0) === 0) {
      return 0;
    }

    let distribution = new PoissonBinomial(missProbabilities);

    let cdfMinusProb = missCount => distribution.cdf(missCount) - p;

    return Brent.findRootExpand(cdfMinusProb, -100, 1000);
  }

  static #calculateCheeseLevelsCheeseFactors(movements, fcProbTp)
  {
    let cheeseLevels = [];
    let cheeseFactors = [];

    for (let i = 0; i < Aim.#cheese_level_count; ++i) {
      let cheeseLevel = i / (Aim.#cheese_level_count - 1);

      cheeseLevels[i] = cheeseLevel;
      cheeseFactors[i] = Aim.#calculateFcProbTp(movements, cheeseLevel) / fcProbTp;
    }

    return [cheeseLevels, cheeseFactors];
  }

  static #getCheeseNoteCount(movements, tp)
  {
    let count = 0;

    for (const movement of movements) {
      let cheeseness = Logistic.logistic((movement.Ip12 / tp - 0.6) * 15) * movement.cheesability;
      count += cheeseness;
    }

    return count;
  }

  static #calculateComboTps(hitProbabilities, sectionAmount)
  {
    let comboTps = [];

    for (let i = 1; i <= sectionAmount; ++i) {
      comboTps[i - 1] = Aim.calculateFcTimeTp(hitProbabilities, i);
    }

    return comboTps;
  }

  static calculateFcProb(movements, tp, cheeseLevel)
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
