const FittsLaw = require('../mathUtil/fittsLaw');

class HitProbabilities
{
  sections = [];

  constructor(movements, cheeseLevel, difficultyCount = 20)
  {
    let start, end, startT, endT;

    for (let i = 0; i < difficultyCount; ++i) {
      start = Math.trunc(movements.length * i / difficultyCount);
      end = Math.trunc(movements.length * (i + 1) / difficultyCount - 1);

      startT = movements[start].time;
      endT = movements[end].time;

      this.sections.push(new MapSectionCache(movements.slice(start, end + 1), cheeseLevel, startT, endT));
    }
  }

  static calculateCheeseHitProb(movement, tp, cheeseLevel)
  {
    let perMovementCheeseLevel = cheeseLevel;

    if (movement.endsOnSlider) {
      perMovementCheeseLevel = 0.5 * cheeseLevel + 0.5;
    }

    let cheeseMt = movement.Mt * (1 + perMovementCheeseLevel * movement.cheesableRatio);

    return FittsLaw.calculateHitProb(movement.D, cheeseMt, tp);
  }

  fcProbability(tp)
  {
    let fcProb = 1;

    this.sections.forEach(section =>
    {
      fcProb *= section.evaluate(tp).fcProbability;
    });

    return fcProb;
  }

  minExpectedTimeForSectionCount(tp, sectionCount)
  {
    let fcTime = Infinity;
    let sectionData = this.sections.map(x => x.evaluate(tp));

    for (let i = 0; i <= this.sections.length - sectionCount; ++i) {
      fcTime = Math.min(fcTime, HitProbabilities.expectedFcTime(sectionData, i, sectionCount) - this.length(i, sectionCount));
    }

    return fcTime;
  }

  length(start, sectionCount)
  {
    return this.sections[start + sectionCount - 1].endT - this.sections[start].startT;
  }

  static expectedFcTime(sectionData, start, count)
  {
    let fcTime = 15;

    for (let i = start; i < start + count; ++i) {
      fcTime /= sectionData[i].fcProbability;
      fcTime += sectionData[i].expectedTime;
    }

    return fcTime;
  }
}

class MapSectionCache
{
  #cache = {};

  constructor(movements, cheeseLevel, startT, endT)
  {
    this.movements = movements;
    this.startT = startT;
    this.endT = endT;

    this.cheeseLevel = cheeseLevel;
  }

  evaluate(tp)
  {
    if (this.movements.length === 0) {
      return new SkillData(0, 1);
    }

    if (this.#cache[tp]) {
      return this.#cache[tp];
    }

    let result = new SkillData(0, 0);

    result.expectedTime = 0;
    result.fcProbability = 1;

    this.movements.forEach(movement => {
      let hitProb = HitProbabilities.calculateCheeseHitProb(movement, tp, this.cheeseLevel) + 1e-10;

      // This line nerfs notes with high miss probability
      hitProb = 1 - (Math.sqrt(1 - hitProb + 0.25) - 0.5);

      result.expectedTime = (result.expectedTime + movement.rawMt) / hitProb;
      result.fcProbability *= hitProb;
    });

    this.#cache[tp] = result;

    return result;
  }
}

class SkillData
{
  constructor(expectedTime, fcProbability)
  {
    this.expectedTime = expectedTime;
    this.fcProbability = fcProbability;
  }
}

module.exports = HitProbabilities;
