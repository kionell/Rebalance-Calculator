const Logistic = require('../mathUtil/numerics/logistic');
const LinearSpline = require('../mathUtil/numerics/linearSpline');
const FittsLaw = require('../mathUtil/fittsLaw');
const Mean = require('../mathUtil/mean');
const AngleCorrection = require('./angleCorrection');
const Spinner = require('osu-bpdpc/src/Rulesets/Osu/Objects/Spinner');
const Slider = require('osu-bpdpc/src/Rulesets/Osu/Objects/Slider');

const t_ratio_threshold = 1.4;
const correction_neg2_still = 0;

const correctionNeg2_moving_spline = LinearSpline.interpolateSorted([-1.0, 1.0], [1.1, 0]);

class OsuMovement
{
  constructor(rawMovementTime, distance, Mt, indexOfPerformance, cheesability, cheesableRatio, time, endsOnSlider)
  {
    this.rawMovementTime = rawMovementTime || 0;
    this.distance = distance || 0;
    this.movementTime = Mt || 0;
    this.indexOfPerformance = indexOfPerformance || 0;
    this.cheesability = cheesability || 0;
    this.cheesableRatio = cheesableRatio || 0;
    this.time = time || 0;
    this.endsOnSlider = endsOnSlider || false;
  }

  /**
   * Extracts movement (only for the first object in a beatmap).
   * @param {object} obj
   */
  static extractMovement1(obj)
  {
    let movement = this.getEmptyMovement(obj.startTime / 1000.0);

    let movementWithNested = [movement];

    // add zero difficulty movements corresponding to slider ticks/slider ends so combo is reflected properly
    let extraNestedCount = obj.combo - 1;

    for (let i = 0; i < extraNestedCount; ++i) {
      movementWithNested.push(this.getEmptyMovement(movement.time));
    }

    return movementWithNested;
  }

  static extractMovement2(objNeg2, objPrev, objCurr, objNext, tapStrain, 
    clockRate, hidden = false, noteDensity = 0, objNeg4 = null)
  {
    const movement = new OsuMovement();

    let tPrevCurr = (objCurr.startTime - objPrev.startTime) / clockRate / 1000.0;

    movement.rawMovementTime = tPrevCurr;
    movement.time = objCurr.startTime / 1000.0;

    if (objCurr && objCurr instanceof Spinner || objPrev && objPrev instanceof Spinner) {
      movement.indexOfPerformance = 0;
      movement.distance = 0;
      movement.movementTime = 1;
      movement.cheesability = 0;
      movement.cheesableRatio = 0;

      return [movement];
    }

    if (objNeg2 instanceof Spinner) {
      objNeg2 = null;
    }

    if (objNext instanceof Spinner) {
      objNext = null;
    }

    if (objCurr instanceof Slider) {
      movement.endsOnSlider = true;
    }

    // calculate basic info (position, displacement, distance...)
    // explanation of abbreviations:
    // posPrev: position of obj x
    // sPrevCurr : displacement (normalized) from obj x to obj y
    // tPrevCurr : time difference of obj x and obj y
    // dPrevCurr : distance (normalized) from obj x to obj y
    // ipPrevCurr: index of performance of the movement from obj x to obj y
    let posPrev = [objPrev.stackedPos.x, objPrev.stackedPos.y];
    let posCurr = [objCurr.stackedPos.x, objCurr.stackedPos.y];

    let sPrevCurr = posCurr.map((x, i) => (x - posPrev[i]) / (2 * objCurr.radius));
    let dPrevCurr = Math.sqrt(sPrevCurr.map(x => x ** 2).reduce((p, c) => p + c, 0));

    let ipPrevCurr = FittsLaw.calculateIp(dPrevCurr, tPrevCurr);

    movement.indexOfPerformance = ipPrevCurr;

    let posNeg2 = [];
    let posNext = [];
    let sNeg2Prev = [];
    let sCurrNext = [];
    let dNeg2Prev = 0;
    let dNeg2Curr = 0;
    let dCurrNext = 0;
    let tNeg2Prev = 0;
    let tCurrNext = 0;

    let flowinessNeg2PrevCurr = 0;
    let flowinessPrevCurrNext = 0;
    let objPrevTemporallyInTheMiddle = false;
    let objCurrTemporallyInTheMiddle = false;

    let dNeg4Curr = 0;

    if (objNeg4) {
      let posNeg4 = [objNeg4.stackedPos.x, objNeg4.stackedPos.y];

      dNeg4Curr = posCurr.map((x, i) => (x - posNeg4[i]) / (2 * objCurr.radius));
      dNeg4Curr = Math.sqrt(dNeg4Curr.map(x => x ** 2).reduce((p, c) => p + c, 0));
    }

    if (objNeg2) {
      posNeg2 = [objNeg2.stackedPos.x, objNeg2.stackedPos.y];

      sNeg2Prev = posPrev.map((x, i) => (x - posNeg2[i]) / (2 * objCurr.radius));
      dNeg2Prev = Math.sqrt(sNeg2Prev.map(x => x ** 2).reduce((p, c) => p + c, 0));

      tNeg2Prev = (objPrev.startTime - objNeg2.startTime) / clockRate / 1000.0;

      dNeg2Curr = posCurr.map((x, i) => (x - posNeg2[i]) / (2 * objCurr.radius));
      dNeg2Curr = Math.sqrt(dNeg2Curr.map(x => x ** 2).reduce((p, c) => p + c, 0));
    }

    if (objNext) {
      posNext = [objNext.stackedPos.x, objNext.stackedPos.y];

      sCurrNext = posNext.map((x, i) => (x - posCurr[i]) / (2 * objCurr.radius));
      dCurrNext = Math.sqrt(sCurrNext.map(x => x ** 2).reduce((p, c) => p + c, 0));

      tCurrNext = (objNext.startTime - objCurr.startTime) / clockRate / 1000.0;
    }

    // Correction #1 - The Previous Object
    // Estimate how objNeg2 affects the difficulty of hitting objCurr
    let correctionNeg2 = 0;

    if (objNeg2 !== null && dPrevCurr !== 0) {
      let tRatioNeg2 = tPrevCurr / tNeg2Prev;
      let dotProduct = sNeg2Prev.map((x, i) => x * sPrevCurr[i]).reduce((p, c) => p + c);
      let cosNeg2PrevCurr = Math.min(Math.max(-dotProduct / dNeg2Prev / dPrevCurr, -1), 1);

      if (tRatioNeg2 > t_ratio_threshold) {
        if (dNeg2Prev === 0) {
          correctionNeg2 = correction_neg2_still;
        }
        else {
          let correctionNeg2Moving = correctionNeg2_moving_spline.interpolate(cosNeg2PrevCurr);

          let movingness = Logistic.logistic(dNeg2Prev * 6 - 5) - Logistic.logistic(-5);

          correctionNeg2 = (movingness * correctionNeg2Moving + (1 - movingness) * correction_neg2_still) * 1.5;
        }
      }
      else if (tRatioNeg2 < 1 / t_ratio_threshold) {
        if (dNeg2Prev === 0) {
          correctionNeg2 = 0;
        }
        else {
          correctionNeg2 = (1 - cosNeg2PrevCurr) * Logistic.logistic((dNeg2Prev * tRatioNeg2 - 1.5) * 4) * 0.3;
        }
      }
      else {
        objPrevTemporallyInTheMiddle = true;

        let normalizedPosNeg2 = sNeg2Prev.map(x => -x / tNeg2Prev * tPrevCurr);

        let xNeg2 = normalizedPosNeg2.map((x, i) => x * sPrevCurr[i]).reduce((p, c) => p + c) / dPrevCurr;
        let yNeg2 = normalizedPosNeg2.map((x, i) => x - xNeg2 * sPrevCurr[i] / dPrevCurr);
        yNeg2 = Math.sqrt(yNeg2.map(x => x ** 2).reduce((p, c) => p + c, 0));

        let correctionNeg2Flow = AngleCorrection.FLOW_NEG2.evaluate(dPrevCurr, xNeg2, yNeg2);
        let correctionNeg2Snap = AngleCorrection.SNAP_NEG2.evaluate(dPrevCurr, xNeg2, yNeg2);
        let correctionNeg2Stop = this.calcCorrection0Stop(xNeg2, yNeg2);

        flowinessNeg2PrevCurr = Logistic.logistic((correctionNeg2Snap - correctionNeg2Flow - 0.05) * 20);

        correctionNeg2 = Mean.powerMean2([correctionNeg2Flow, correctionNeg2Snap, correctionNeg2Stop], -10) * 1.3;
      }
    }

    // Correction #2 - The Next Object
    // Estimate how objNext affects the difficulty of hitting objCurr
    let correctionNext = 0;

    if (objNext && dPrevCurr != 0) {
      let tRatioNext = tPrevCurr / tCurrNext;
      let dotProduct = sPrevCurr.map((x, i) => x * sCurrNext[i]).reduce((p, c) => p + c);
      let cosPrevCurrNext = Math.min(Math.max(-dotProduct / dPrevCurr / dCurrNext, -1), 1);

      if (tRatioNext > t_ratio_threshold) {
        if (dCurrNext === 0) {
          correctionNext = 0;
        }
        else {
          let correctionNextMoving = correctionNeg2_moving_spline.interpolate(cosPrevCurrNext);

          let movingness = Logistic.logistic(dCurrNext * 6 - 5) - Logistic.logistic(-5);
          correctionNext = (movingness * correctionNextMoving) * 0.5;
        }
      }
      else if (tRatioNext < 1 / t_ratio_threshold) {
        if (dCurrNext == 0) {
          correctionNext = 0;
        }
        else {
          correctionNext = (1 - cosPrevCurrNext) * Logistic.logistic((dCurrNext * tRatioNext - 1.5) * 4) * 0.15;
        }
      }
      else {
        objCurrTemporallyInTheMiddle = true;

        let normalizedPosNext = sCurrNext.map(x => x / tCurrNext * tPrevCurr);

        let xNext = normalizedPosNext.map((x, i) => x * sPrevCurr[i]).reduce((p, c) => p + c) / dPrevCurr;
        let yNext = normalizedPosNext.map((x, i) => x - xNext * sPrevCurr[i] / dPrevCurr);
        yNext = Math.sqrt(yNext.map(x => x ** 2).reduce((p, c) => p + c, 0));;

        let correctionNextFlow = AngleCorrection.FLOW_NEXT.evaluate(dPrevCurr, xNext, yNext);
        let correctionNextSnap = AngleCorrection.SNAP_NEXT.evaluate(dPrevCurr, xNext, yNext);

        flowinessPrevCurrNext = Logistic.logistic((correctionNextSnap - correctionNextFlow - 0.05) * 20);

        correctionNext = Math.max(Mean.powerMean1(correctionNextFlow, correctionNextSnap, -10) - 0.1, 0) * 0.5;
      }
    }

    // Correction #3 - 4-object pattern
    // Estimate how the whole pattern consisting of objNeg2 to objNext affects
    // the difficulty of hitting objCurr. This only takes effect when the pattern
    // is not so spaced (i.e. does not contain jumps)
    let patternCorrection = 0;

    if (objPrevTemporallyInTheMiddle && objCurrTemporallyInTheMiddle) {
      let gap = sPrevCurr.map((x, i) => x - sCurrNext[i] / 2 - sNeg2Prev[i] / 2);
      gap = Math.sqrt(gap.map(x => x ** 2).reduce((p, c) => p + c, 0)) / (dPrevCurr + 0.1);

      patternCorrection = (Logistic.logistic((gap - 1) * 8) - Logistic.logistic(-6)) *
        Logistic.logistic((dNeg2Prev - 0.7) * 10) * Logistic.logistic((dCurrNext - 0.7) * 10) *
        Mean.powerMean1(flowinessNeg2PrevCurr, flowinessPrevCurrNext, 2) * 0.6;
    }

    // Correction #4 - Tap Strain
    // Estimate how tap strain affects difficulty
    let tapCorrection = 0;

    if (dPrevCurr > 0 && tapStrain) {
      tapCorrection = Logistic.logistic((Mean.powerMean2(tapStrain, 2) / ipPrevCurr - 1.34) / 0.1) * 0.15;
    }

    // Correction #5 - Cheesing
    // The player might make the movement of objPrev -> objCurr easier by
    // hitting objPrev early and objCurr late. Here we estimate the amount of
    // cheesing and update MT accordingly.
    let timeEarly = 0;
    let timeLate = 0;
    let cheesabilityEarly = 0;
    let cheesabilityLate = 0;

    if (dPrevCurr > 0) {
      let tNeg2PrevReciprocal;
      let ipNeg2Prev;

      if (objNeg2) {
        tNeg2PrevReciprocal = 1 / (tNeg2Prev + 1e-10);
        ipNeg2Prev = FittsLaw.calculateIp(dNeg2Prev, tNeg2Prev);
      }
      else {
        tNeg2PrevReciprocal = 0;
        ipNeg2Prev = 0;
      }

      cheesabilityEarly = Logistic.logistic((ipNeg2Prev / ipPrevCurr - 0.6) * (-15)) * 0.5;
      timeEarly = cheesabilityEarly * (1 / (1 / (tPrevCurr + 0.07) + tNeg2PrevReciprocal));

      let tCurrNextReciprocal;
      let ipCurrNext;

      if (objNext) {
        tCurrNextReciprocal = 1 / (tCurrNext + 1e-10);
        ipCurrNext = FittsLaw.calculateIp(dCurrNext, tCurrNext);
      }
      else {
        tCurrNextReciprocal = 0;
        ipCurrNext = 0;
      }

      cheesabilityLate = Logistic.logistic((ipCurrNext / ipPrevCurr - 0.6) * (-15)) * 0.5;
      timeLate = cheesabilityLate * (1 / (1 / (tPrevCurr + 0.07) + tCurrNextReciprocal));
    }

    // Correction #6 - High bpm jump buff (alt buff)
    let effectiveBpm = 30 / (tPrevCurr + 1e-10);
    let highBpmJumpBuff = Logistic.logistic((effectiveBpm - 354) / 16) *
      Logistic.logistic((dPrevCurr - 1.9) / 0.15) * 0.23;

    // Correction #7 - Small circle bonus
    let smallCircleBonus = ((Logistic.logistic((55 - 2 * objCurr.radius) / 3.0) * 0.3) +
      (Math.pow(24.5 - Math.min(objCurr.radius, 24.5), 1.4) * 0.01315)) *
      Math.max(Logistic.logistic((dPrevCurr - 0.5) / 0.1), 0.25);

    // Correction #8 - Stacked notes nerf
    let dPrevCurrStackedNerf = Math.max(0, Math.min(dPrevCurr, Math.min(1.2 * dPrevCurr - 0.185, 1.4 * dPrevCurr - 0.32)));

    // Correction #9 - Slow small jump nerf
    let smallJumpNerfFactor = 1 - 0.17 * Math.exp(-Math.pow((dPrevCurr - 2.2) / 0.7, 2)) *
      Logistic.logistic((255 - effectiveBpm) / 10);

    // Correction #10 - Slow big jump buff
    let bigJumpBuffFactor = 1 + 0.15 * Logistic.logistic((dPrevCurr - 6) / 0.5) *
      Logistic.logistic((210 - effectiveBpm) / 8);

    // Correction #11 - Hidden Mod
    let correctionHidden = 0;

    if (hidden) {
      correctionHidden = 0.05 + 0.008 * noteDensity;
    }

    // Correction #12 - Stacked wiggle fix
    if (objNeg2 && objNext) {
      var dPrevNext = posNext.map((x, i) => (x - posPrev[i]) / (2 * objCurr.radius));
      var dNeg2Next = posNext.map((x, i) => (x - posNeg2[i]) / (2 * objCurr.radius));

      dPrevNext = Math.sqrt(dPrevNext.map(x => x ** 2).reduce((p, c) => p + c, 0));
      dNeg2Next = Math.sqrt(dNeg2Next.map(x => x ** 2).reduce((p, c) => p + c, 0));

      if (dNeg2Prev < 1 && dNeg2Curr < 1 && dNeg2Next < 1 && dPrevCurr < 1 && dPrevNext < 1 && dCurrNext < 1) {
        correctionNeg2 = 0;
        correctionNext = 0;
        patternCorrection = 0;
        tapCorrection = 0;
      }
    }

    // Correction #13 - Repetitive jump nerf
    // Nerf big jumps where objNeg2 and objCurr are close or where objNeg4 and objCurr are close
    let jumpOverlapCorrection = 1 - (Math.max(0.15 - 0.1 * dNeg2Curr, 0) + Math.max(0.1125 - 0.075 * dNeg4Curr, 0)) *
      Logistic.logistic((dPrevCurr - 3.3) / 0.25);

    // Correction #14 - Sudden distance increase buff
    let distanceIncreaseBuff = 1;

    if (objNeg2) {
      let dNeg2PrevOverlapNerf = Math.min(1, Math.pow(dNeg2Prev, 3));
      let timeDifferenceNerf = Math.exp(-4 * Math.pow(1 - Math.max(tPrevCurr / (tNeg2Prev + 1e-10), tNeg2Prev / (tPrevCurr + 1e-10)), 2));
      let distanceRatio = dPrevCurr / Math.max(1, dNeg2Prev);
      let bpmScaling = Math.max(1, -16 * tPrevCurr + 3.4);
      distanceIncreaseBuff = 1 + 0.225 * bpmScaling * timeDifferenceNerf * dNeg2PrevOverlapNerf * Math.max(0, distanceRatio - 2);
    }

    // Apply the corrections
    let dPrevCurrWithCorrection = dPrevCurrStackedNerf * (1 + smallCircleBonus) * (1 + correctionNeg2 + correctionNext + patternCorrection) *
      (1 + highBpmJumpBuff) * (1 + tapCorrection) * smallJumpNerfFactor * bigJumpBuffFactor * (1 + correctionHidden) *
      jumpOverlapCorrection * distanceIncreaseBuff;

    movement.distance = dPrevCurrWithCorrection;
    movement.movementTime = tPrevCurr;
    movement.cheesability = cheesabilityEarly + cheesabilityLate;
    movement.cheesableRatio = (timeEarly + timeLate) / (tPrevCurr + 1e-10);

    const movementWithNested = [movement];

    // add zero difficulty movements corresponding to slider ticks/slider ends so combo is reflected properly
    const extraNestedCount = objCurr.combo - 1;

    for (let i = 0; i < extraNestedCount; ++i) {
      movementWithNested.push(this.getEmptyMovement(movement.time));
    }

    return movementWithNested;
  }

  static getEmptyMovement(time)
  {
    return new OsuMovement(0, 0, 1, 0, 0, 0, time);
  }

  static calcCorrection0Stop(x, y)
  {
    return Logistic.logistic(10 * Math.sqrt(x * x + y * y + 1) - 12);
  }
}

module.exports = OsuMovement;
