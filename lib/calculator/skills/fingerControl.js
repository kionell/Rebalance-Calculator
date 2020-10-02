const Slider = require('osu-bpdpc/src/Rulesets/Osu/Objects/Slider');

class FingerControl
{
  static calculateFingerControlDiff(hitObjects, clockRate)
  {
    if (hitObjects.length == 0) {
      return 0;
    }

    let prevTime = hitObjects[0].startTime / 1000.0;
    let currStrain = 0;
    let prevStrainTime = 0;
    let repeatStrainCount = 1;
    let strainHistory = [0];

    // calculate strain value for each hit object
    for (let i = 1, len = hitObjects.length; i < len; ++i) {
      let currTime = hitObjects[i].startTime / 1000.0;
      let deltaTime = (currTime - prevTime) / clockRate;

      let strainTime = Math.max(deltaTime, 0.046875);
      let strainDecayBase = Math.pow(0.9, 1 / Math.min(strainTime, 0.2));

      currStrain *= Math.pow(strainDecayBase, deltaTime);

      strainHistory.push(currStrain);

      let strain = 0.1 / strainTime;

      if (Math.abs(strainTime - prevStrainTime) > 0.004) {
        repeatStrainCount = 1;
      } else {
        repeatStrainCount++;
      }

      if (hitObjects[i] instanceof Slider) {
        strain /= 2.0;
      }

      if (repeatStrainCount % 2 == 0) {
        strain = 0;
      } else {
        strain /= Math.pow(1.25, repeatStrainCount);
      }

      currStrain += strain;

      prevTime = currTime;
      prevStrainTime = strainTime;
    }

    // aggregate strain values to compute difficulty
    strainHistory = strainHistory.sort((a, b) => b - a);

    let diff = 0;

    for (let i = 0, len = hitObjects.length; i < len; ++i) {
      diff += strainHistory[i] * Math.pow(0.95, i);
    }

    return diff * 0.055;
  }
}

module.exports = FingerControl;
