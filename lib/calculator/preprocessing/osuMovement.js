const Logistic = require('../mathUtil/numerics/logistic.js');
const LinearSpline = require('../mathUtil/numerics/linearSpline.js');
const FittsLaw = require('../mathUtil/fittsLaw.js');
const Mean = require('../mathUtil/mean.js');
const MultiL2NormCorrection = require('../preprocessing/L2NormCorrection.js');
const Spinner = require('osu-bpdpc/src/Rulesets/Osu/Objects/Spinner');
const Slider = require('osu-bpdpc/src/Rulesets/Osu/Objects/Slider');

const t_ratio_threshold = 1.4;
const correction0_still = 0;

class OsuMovement
{
  static #correction0_moving_spline = LinearSpline.interpolateSorted([-1.0, 1.0], [1.1, 0]);

  constructor(rawMt, D, Mt, Ip12, cheesability, cheesableRatio, time, endsOnSlider)
  {
    this.rawMt = rawMt || 0;
    this.D = D || 0;
    this.Mt = Mt || 0;
    this.Ip12 = Ip12 || 0;
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

  /**
   * Calculates the movement time, effective distance and other details for the movement from obj1 to obj2.
   * @param {object} obj0 Prevprev object
   * @param {object} obj1 Previous object
   * @param {object} obj2 Current object
   * @param {object} obj3 Next object
   * @param {number[]} tapStrain Current object tap strain
   * @param {number} clockRate Clock rate
   * @param {bool} hidden Are we calculating hidden mod?
   * @param {number} noteDensity Current object visual note density
   * @param {object} objMinus2 Object that that was three objects before current
   * @returns List of movements related to current object
   */
  static extractMovement2(obj0, obj1, obj2, obj3, tapStrain, clockRate, hidden = false, noteDensity = 0, objMinus2 = null)
  {
    const movement = new OsuMovement();

    let t12 = (obj2.startTime - obj1.startTime) / clockRate / 1000.0;

    movement.rawMt = t12;
    movement.time = obj2.startTime / 1000.0;

    if (obj2 && obj2 instanceof Spinner || obj1 && obj1 instanceof Spinner) {
      movement.Ip12 = 0;
      movement.D = 0;
      movement.Mt = 1;
      movement.cheesability = 0;
      movement.cheesableRatio = 0;

      return [movement];
    }

    if (obj0 instanceof Spinner) {
      obj0 = null;
    }

    if (obj3 instanceof Spinner) {
      obj3 = null;
    }

    if (obj2 instanceof Slider) {
      movement.endsOnSlider = true;
    }

    // calculate basic info (position, displacement, distance...)
    // explanation of abbreviations:
    // pos1: position of obj x
    // s12 : displacement (normalized) from obj x to obj y
    // t12 : time difference of obj x and obj y
    // d12 : distance (normalized) from obj x to obj y
    // ip12: index of performance of the movement from obj x to obj y
    let pos1 = [obj1.stackedPos.x, obj1.stackedPos.y];
    let pos2 = [obj2.stackedPos.x, obj2.stackedPos.y];

    let s12 = pos2.map((x, i) => (x - pos1[i]) / (2 * obj2.radius));
    let d12 = Math.sqrt(s12.map(x => x ** 2).reduce((p, c) => p + c, 0));

    let ip12 = FittsLaw.calculateIp(d12, t12);

    movement.Ip12 = ip12;

    let pos0 = new Array(2);
    let pos3 = new Array(2);
    let s01 = new Array(2);
    let s23 = new Array(2);
    let d01 = 0;
    let d02 = 0;
    let d23 = 0;
    let t01 = 0;
    let t23 = 0;

    let flowiness012 = 0;
    let flowiness123 = 0;
    let obj1InTheMiddle = false;
    let obj2InTheMiddle = false;

    let dMinus22 = 0;

    if (objMinus2) {
      let posMinus2 = [objMinus2.stackedPos.x, objMinus2.stackedPos.y];

      dMinus22 = pos2.map((x, i) => (x - posMinus2[i]) / (2 * obj2.radius));
      dMinus22 = Math.sqrt(dMinus22.map(x => x ** 2).reduce((p, c) => p + c, 0));
    }

    if (obj0) {
      pos0 = [obj0.stackedPos.x, obj0.stackedPos.y];

      s01 = pos1.map((x, i) => (x - pos0[i]) / (2 * obj2.radius));
      d01 = Math.sqrt(s01.map(x => x ** 2).reduce((p, c) => p + c, 0));

      t01 = (obj1.startTime - obj0.startTime) / clockRate / 1000.0;

      d02 = pos2.map((x, i) => (x - pos0[i]) / (2 * obj2.radius));
      d02 = Math.sqrt(d02.map(x => x ** 2).reduce((p, c) => p + c, 0));
    }

    if (obj3) {
      pos3 = [obj3.stackedPos.x, obj3.stackedPos.y];

      s23 = pos3.map((x, i) => (x - pos2[i]) / (2 * obj2.radius));
      d23 = Math.sqrt(s23.map(x => x ** 2).reduce((p, c) => p + c, 0));

      t23 = (obj3.startTime - obj2.startTime) / clockRate / 1000.0;
    }

    // Correction #1 - The Previous Object
    // Estimate how obj0 affects the difficulty of hitting obj2
    let correction0 = 0;

    if (obj0 !== null && d12 !== 0) {
      let tRatio0 = t12 / t01;

      if (tRatio0 > t_ratio_threshold) {
        if (d01 === 0) {
          correction0 = correction0_still;
        }
        else {
          let dotProduct = s01.map((x, i) => x * s12[i]).reduce((p, c) => p + c);
          let cos012 = Math.min(Math.max(-dotProduct / d01 / d12, -1), 1);

          let correction0Moving = OsuMovement.#correction0_moving_spline.interpolate(cos012);

          let movingness = Logistic.logistic(d01 * 6 - 5) - Logistic.logistic(-5);

          correction0 = (movingness * correction0Moving + (1 - movingness) * correction0_still) * 1.5;
        }
      }
      else if (tRatio0 < 1 / t_ratio_threshold) {
        if (d01 === 0) {
          correction0 = 0;
        }
        else {
          let dotProduct = s01.map((x, i) => x * s12[i]).reduce((p, c) => p + c);
          let cos012 = Math.min(Math.max(-dotProduct / d01 / d12, -1), 1);

          correction0 = (1 - cos012) * Logistic.logistic((d01 * tRatio0 - 1.5) * 4) * 0.3;
        }
      }
      else {
        obj1InTheMiddle = true;

        let normalizedPos0 = s01.map(x => -x / t01 * t12);

        let x0 = normalizedPos0.map((x, i) => x * s12[i]).reduce((p, c) => p + c) / d12;
        let y0 = normalizedPos0.map((x, i) => x - x0 * s12[i] / d12);
        y0 = Math.sqrt(y0.map(x => x ** 2).reduce((p, c) => p + c, 0));

        let correction0Flow = MultiL2NormCorrection.FLOW_0.evaluate(d12, x0, y0);
        let correction0Snap = MultiL2NormCorrection.SNAP_0.evaluate(d12, x0, y0);
        let correction0Stop = this.calcCorrection0Stop(x0, y0);

        flowiness012 = Logistic.logistic((correction0Snap - correction0Flow - 0.05) * 20);

        correction0 = Mean.powerMean2([correction0Flow, correction0Snap, correction0Stop], -10) * 1.3;
      }
    }

    // Correction #2 - The Next Object
    // Estimate how obj3 affects the difficulty of hitting obj2
    let correction3 = 0;

    if (obj3 && d12 != 0) {
      let tRatio3 = t12 / t23;

      if (tRatio3 > t_ratio_threshold) {
        if (d23 === 0) {
          correction3 = 0;
        }
        else {
          let dotProduct = s12.map((x, i) => x * s23[i]).reduce((p, c) => p + c);
          let cos123 = Math.min(Math.max(-dotProduct / d12 / d23, -1), 1);
          let correction3Moving = OsuMovement.#correction0_moving_spline.interpolate(cos123);

          let movingness = Logistic.logistic(d23 * 6 - 5) - Logistic.logistic(-5);
          correction3 = (movingness * correction3Moving) * 0.5;
        }
      }
      else if (tRatio3 < 1 / t_ratio_threshold) {
        if (d23 == 0) {
          correction3 = 0;
        }
        else {
          let dotProduct = s12.map((x, i) => x * s23[i]).reduce((p, c) => p + c);
          let cos123 = Math.min(Math.max(-dotProduct / d12 / d23, -1), 1);

          correction3 = (1 - cos123) * Logistic.logistic((d23 * tRatio3 - 1.5) * 4) * 0.15;
        }
      }
      else {
        obj2InTheMiddle = true;

        let normalizedPos3 = s23.map(x => x / t23 * t12);

        let x3 = normalizedPos3.map((x, i) => x * s12[i]).reduce((p, c) => p + c) / d12;
        let y3 = normalizedPos3.map((x, i) => x - x3 * s12[i] / d12);
        y3 = Math.sqrt(y3.map(x => x ** 2).reduce((p, c) => p + c, 0));;

        let correction3Flow = MultiL2NormCorrection.FLOW_3.evaluate(d12, x3, y3);
        let correction3Snap = MultiL2NormCorrection.SNAP_3.evaluate(d12, x3, y3);

        flowiness123 = Logistic.logistic((correction3Snap - correction3Flow - 0.05) * 20);

        correction3 = Math.max(Mean.powerMean1(correction3Flow, correction3Snap, -10) - 0.1, 0) * 0.5;
      }
    }

    // Correction #3 - 4-object pattern
    // Estimate how the whole pattern consisting of obj0 to obj3 affects
    // the difficulty of hitting obj2. This only takes effect when the pattern
    // is not so spaced (i.e. does not contain jumps)
    let patternCorrection = 0;

    if (obj1InTheMiddle && obj2InTheMiddle) {
      let gap = s12.map((x, i) => x - s23[i] / 2 - s01[i] / 2);
      gap = Math.sqrt(gap.map(x => x ** 2).reduce((p, c) => p + c, 0)) / (d12 + 0.1);

      patternCorrection = (Logistic.logistic((gap - 1) * 8) - Logistic.logistic(-6)) *
        Logistic.logistic((d01 - 0.7) * 10) * Logistic.logistic((d23 - 0.7) * 10) *
        Mean.powerMean1(flowiness012, flowiness123, 2) * 0.6;
    }

    // Correction #4 - Tap Strain
    // Estimate how tap strain affects difficulty
    let tapCorrection = 0;

    if (d12 > 0 && tapStrain) {
      tapCorrection = Logistic.logistic((Mean.powerMean2(tapStrain, 2) / ip12 - 1.34) / 0.1) * 0.15;
    }

    // Correction #5 - Cheesing
    // The player might make the movement of obj1 -> obj2 easier by
    // hitting obj1 early and obj2 late. Here we estimate the amount of
    // cheesing and update MT accordingly.
    let timeEarly = 0;
    let timeLate = 0;
    let cheesabilityEarly = 0;
    let cheesabilityLate = 0;

    if (d12 > 0) {
      let t01Reciprocal;
      let ip01;

      if (obj0) {
        t01Reciprocal = 1 / (t01 + 1e-10);
        ip01 = FittsLaw.calculateIp(d01, t01);
      }
      else {
        t01Reciprocal = 0;
        ip01 = 0;
      }

      cheesabilityEarly = Logistic.logistic((ip01 / ip12 - 0.6) * (-15)) * 0.5;
      timeEarly = cheesabilityEarly * (1 / (1 / (t12 + 0.07) + t01Reciprocal));

      let t23Reciprocal;
      let ip23;

      if (obj3) {
        t23Reciprocal = 1 / (t23 + 1e-10);
        ip23 = FittsLaw.calculateIp(d23, t23);
      }
      else {
        t23Reciprocal = 0;
        ip23 = 0;
      }

      cheesabilityLate = Logistic.logistic((ip23 / ip12 - 0.6) * (-15)) * 0.5;
      timeLate = cheesabilityLate * (1 / (1 / (t12 + 0.07) + t23Reciprocal));
    }

    // Correction #6 - High bpm jump buff (alt buff)
    let effectiveBpm = 30 / (t12 + 1e-10);
    let highBpmJumpBuff = Logistic.logistic((effectiveBpm - 354) / 16) *
      Logistic.logistic((d12 - 1.9) / 0.15) * 0.23;

    // Correction #7 - Small circle bonus
    let smallCircleBonus = ((Logistic.logistic((55 - 2 * obj2.radius) / 3.0) * 0.3) +
      (Math.pow(24.5 - Math.min(obj2.radius, 24.5), 1.4) * 0.01315)) *
      Math.max(Logistic.logistic((d12 - 0.5) / 0.1), 0.25);

    // Correction #8 - Stacked notes nerf
    let d12StackedNerf = Math.max(0, Math.min(d12, Math.min(1.2 * d12 - 0.185, 1.4 * d12 - 0.32)));

    // Correction #9 - Slow small jump nerf
    let smallJumpNerfFactor = 1 - 0.17 * Math.exp(-Math.pow((d12 - 2.2) / 0.7, 2)) *
      Logistic.logistic((255 - effectiveBpm) / 10);

    // Correction #10 - Slow big jump buff
    let bigJumpBuffFactor = 1 + 0.15 * Logistic.logistic((d12 - 6) / 0.5) *
      Logistic.logistic((210 - effectiveBpm) / 8);

    // Correction #11 - Hidden Mod
    let correctionHidden = 0;

    if (hidden) {
      correctionHidden = 0.05 + 0.008 * noteDensity;
    }

    // Correction #12 - Stacked wiggle fix
    if (obj0 && obj3) {
      var d13 = pos3.map((x, i) => (x - pos1[i]) / (2 * obj2.radius));
      var d03 = pos3.map((x, i) => (x - pos0[i]) / (2 * obj2.radius));

      d13 = Math.sqrt(d13.map(x => x ** 2).reduce((p, c) => p + c, 0));
      d03 = Math.sqrt(d03.map(x => x ** 2).reduce((p, c) => p + c, 0));

      if (d01 < 1 && d02 < 1 && d03 < 1 && d12 < 1 && d13 < 1 && d23 < 1) {
        correction0 = 0;
        correction3 = 0;
        patternCorrection = 0;
        tapCorrection = 0;
      }
    }

    // Correction #13 - Repetitive jump nerf
    // Nerf big jumps where obj0 and obj2 are close or where objMinus2 and obj2 are close
    let jumpOverlapCorrection = 1 - (Math.max(0.15 - 0.1 * d02, 0) + Math.max(0.1125 - 0.075 * dMinus22, 0)) *
      Logistic.logistic((d12 - 3.3) / 0.25);

    // Correction #14 - Sudden distance increase buff
    let distanceIncreaseBuff = 1;

    if (obj0) {
      let d01OverlapNerf = Math.min(1, Math.pow(d01, 3));
      let timeDifferenceNerf = Math.exp(-4 * Math.pow(1 - Math.max(t12 / (t01 + 1e-10), t01 / (t12 + 1e-10)), 2));
      let distanceRatio = d12 / Math.max(1, d01);
      let bpmScaling = Math.max(1, -16 * t12 + 3.4);
      distanceIncreaseBuff = 1 + 0.225 * bpmScaling * timeDifferenceNerf * d01OverlapNerf * Math.max(0, distanceRatio - 2);
    }

    // Apply the corrections
    let d12WithCorrection = d12StackedNerf * (1 + smallCircleBonus) * (1 + correction0 + correction3 + patternCorrection) *
      (1 + highBpmJumpBuff) * (1 + tapCorrection) * smallJumpNerfFactor * bigJumpBuffFactor * (1 + correctionHidden) *
      jumpOverlapCorrection * distanceIncreaseBuff;

    movement.D = d12WithCorrection;
    movement.Mt = t12;
    movement.cheesability = cheesabilityEarly + cheesabilityLate;
    movement.cheesableRatio = (timeEarly + timeLate) / (t12 + 1e-10);

    const movementWithNested = [movement];

    // add zero difficulty movements corresponding to slider ticks/slider ends so combo is reflected properly
    const extraNestedCount = obj2.combo - 1;

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
