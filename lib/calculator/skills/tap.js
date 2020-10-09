const Logistic = require('../mathUtil/numerics/logistic.js')
const Generate = require('../mathUtil/numerics/generate.js');
const Mean = require('../mathUtil/mean.js');
const Precision = require('../mathUtil/numerics/precision.js');
const {Vector2} = require('osu-bpdpc');

const spaced_buff_factor = 0.10;
const timescale_count = 4;

const timescale_factors = [1.02, 1.02, 1.05, 1.15];

const decay_coeffs = Generate.linearSpaced(timescale_count, 2.3, -2.8).map(x => Math.exp(x));

class Tap
{
  static calculateTapAttributes(hitObjects, clockRate)
  {
    let [strainHistory, tapDiff] = Tap.calculateTapStrain(hitObjects, 0, clockRate);
    let burstStrain = Math.max(...strainHistory.map(x => x[0]));

    let streamnessMask = Tap.calculateStreamnessMask(hitObjects, burstStrain, clockRate);
    let streamNoteCount = streamnessMask.reduce((p, c) => p + c, 0);

    let [_, mashTapDiff] = Tap.calculateTapStrain(hitObjects, 1, clockRate);

    return {tapDiff, streamNoteCount, mashTapDiff, strainHistory};
  }

  static calculateTapStrain(hitObjects, mashLevel, clockRate)
  {
    let strainHistory = [
      new Array(timescale_count).fill(0),
      new Array(timescale_count).fill(0)
    ];
    let currStrain = new Array(timescale_count).fill(0);

    // compute strain at each object and store the results into strainHistory
    if (hitObjects.length >= 2) {
      let prevPrevTime = hitObjects[0].startTime / 1000.0;
      let prevTime = hitObjects[1].startTime / 1000.0;

      for (let i = 2, len = hitObjects.length; i < len; ++i) {
        let currTime = hitObjects[i].startTime / 1000.0;

        // compute current strain after decay
        currStrain = currStrain.map((x, i) => x * Math.exp(-decay_coeffs[i] * (currTime - prevTime) / clockRate));

        strainHistory.push(currStrain.map(x => x ** (1.1 / 3) * 1.5));

        let v1 = hitObjects[i - 1].stackedPos;
        let v2 = hitObjects[i].stackedPos;

        let sub = v2.fsubtract(v1);

        let len = Precision.trunc10(new Vector2(
          Precision.trunc10(sub.x, -6), 
          Precision.trunc10(sub.y, -6)
        ).flength(), -7);

        let distance = len / (2 * hitObjects[i].radius);
        let spacedBuff = Tap.calculateSpacedness(distance) * spaced_buff_factor;

        let deltaTime = Math.max((currTime - prevPrevTime) / clockRate, 0.01);

        // for 1/4 notes above 200 bpm the exponent is -2.7, otherwise it's -2
        let strainAddition = Math.max(Math.pow(deltaTime, -2.7) * 0.265, Math.pow(deltaTime, -2));

        currStrain = currStrain.map((x, i) => x + decay_coeffs[i] * strainAddition *
          Math.pow(Tap.calculateMashNerfFactor(distance, mashLevel), 3) * Math.pow(1 + spacedBuff, 3));

        prevPrevTime = prevTime;
        prevTime = currTime;
      }
    }

    // compute difficulty by aggregating strainHistory
    let strainResult = new Array(timescale_count);

    for (let j = 0; j < decay_coeffs.length; ++j) {
      let singleStrainHistory = [];

      for (let i = 0, len = hitObjects.length; i < len; ++i) {
        singleStrainHistory[i] = strainHistory[i][j];
      }

      singleStrainHistory = singleStrainHistory.sort((a, b) => b - a);

      let singleStrainResult = 0;
      let k = 1 - 0.04 * Math.sqrt(decay_coeffs[j]);

      for (let i = 0, len = hitObjects.length; i < len; ++i) {
        singleStrainResult += singleStrainHistory[i] * Math.pow(k, i);
      }

      strainResult[j] = singleStrainResult * (1 - k) * timescale_factors[j];
    }

    let diff = Mean.powerMean2(strainResult, 2);

    return [strainHistory, diff];
  }

  static calculateStreamnessMask(hitObjects, skill, clockRate)
  {
    let streamnessMask = [];

    if (hitObjects.length > 1) {
      streamnessMask[0] = 0;

      let streamTimeThreshold = Math.pow(skill, -2.7 / 3.2);

      for (let i = 1, len = hitObjects.length; i < len; ++i) {
        let t = (hitObjects[i].startTime - hitObjects[i - 1].startTime) / 1000 / clockRate;
        streamnessMask[i] = 1 - Logistic.logistic((t / streamTimeThreshold - 1) * 15);
      }
    }

    return streamnessMask;
  }

  static calculateMashNerfFactor(relativeD, mashLevel)
  {
    let fullMashFactor = 0.73 + 0.27 * Logistic.logistic(relativeD * 7 - 6);
    return mashLevel * fullMashFactor + (1 - mashLevel);
  }

  static calculateSpacedness(d)
  {
    return Logistic.logistic((d - 0.533) / 0.13) - Logistic.logistic(-4.1);
  }
}

module.exports = Tap;
