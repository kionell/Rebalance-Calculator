const {Difficulty, Performance, Mods, Beatmap, Score} = require('../lib/entry.js');

const calculatedMaps = require('./preCalc/maps.json');

function getMapDifficultyAndPerformance(path, id, modsRaw)
{
  const beatmap = new Beatmap(path, id);
  const mods = new Mods(modsRaw);
  const scores = [];

  for (let i = 1; i <= 1; i += 0.01) {
    scores.push(new Score({
        totalHits: beatmap.objectsCount,
        maxCombo: beatmap.maxCombo,
        accuracy: i, mods
      })
    );
  }

  const dfCalc = new Difficulty(beatmap, mods);
  const ppCalc = new Performance(beatmap, mods);

  const difficulty = dfCalc.calculate();
  const performances = scores.map(score => {
    return ppCalc.calculate(difficulty, score);
  });

  return [difficulty, performances];
}

function checkAllExpectations(difficulty, performances, preCalcDifficulty, preCalcPerformance)
{
  expect(difficulty.fingerStars).toBeCloseTo(preCalcDifficulty.fingerStars, 0);
  expect(difficulty.tapStars).toBeCloseTo(preCalcDifficulty.tapStars, 0);
  expect(difficulty.aimStars).toBeCloseTo(preCalcDifficulty.aimStars, 0);
  expect(difficulty.totalStars).toBeCloseTo(preCalcDifficulty.totalStars, 0);

  performances.forEach((performance, i) => {
    expect(performance.accPP).toBeCloseTo(preCalcPerformance[10].accPP, 0);
    expect(performance.tapPP).toBeCloseTo(preCalcPerformance[10].tapPP, 0);
    expect(performance.aimPP).toBeCloseTo(preCalcPerformance[10].aimPP, 0);
    expect(performance.totalPP).toBeCloseTo(preCalcPerformance[10].totalPP, 0);
  });
}

describe('Map calculation', () => {
  test('THE ORAL CIGARETTES - Mou Ii kai? (Nevo) [Rain] + NCHD', () => {
    const [difficulty, performances] = getMapDifficultyAndPerformance(
      './tests/maps/1695382.osu', '1695382', 'NCHD'
    );

    const preCalcDifficulty = calculatedMaps[1695382].NCHD.difficulty;
    const preCalcPerformance = calculatedMaps[1695382].NCHD.performance;

    checkAllExpectations(difficulty, performances, preCalcDifficulty, preCalcPerformance);
  });

  test('SPYAIR - Imagination (TV Size) (browiec) [Ambition] + HDDTHR', () => {
    const [difficulty, performances] = getMapDifficultyAndPerformance(
      './tests/maps/2444148.osu', '2444148', 'HDDTHR'
    );

    const preCalcDifficulty = calculatedMaps[2444148].HDDTHR.difficulty;
    const preCalcPerformance = calculatedMaps[2444148].HDDTHR.performance;

    checkAllExpectations(difficulty, performances, preCalcDifficulty, preCalcPerformance);
  });

  test('Demetori - Desire Drive ~ Desire Dream (happy30) [Extra Stage] + NM', () => {
    const [difficulty, performances] = getMapDifficultyAndPerformance(
      './tests/maps/132946.osu', '132946', 'NM'
    );

    const preCalcDifficulty = calculatedMaps[132946].NM.difficulty;
    const preCalcPerformance = calculatedMaps[132946].NM.performance;

    checkAllExpectations(difficulty, performances, preCalcDifficulty, preCalcPerformance);
  });

  test('SUPER STAR -MITSURU- - SA.YO.NA.RA. SUPER STAR (yeahyeahyeahhh) [Another] + DT', () => {
    const [difficulty, performances] = getMapDifficultyAndPerformance(
      './tests/maps/124501.osu', '124501', 'DT'
    );

    const preCalcDifficulty = calculatedMaps[124501].DT.difficulty;
    const preCalcPerformance = calculatedMaps[124501].DT.performance;

    checkAllExpectations(difficulty, performances, preCalcDifficulty, preCalcPerformance);
  });

  test('Ni-Ni - 1,2,3,4, 007 [Wipeout Series] (MCXD) [-Breezin-] + NM', () => {
    const [difficulty, performances] = getMapDifficultyAndPerformance(
      './tests/maps/91.osu', '91', 'NM'
    );

    const preCalcDifficulty = calculatedMaps[91].NM.difficulty;
    const preCalcPerformance = calculatedMaps[91].NM.performance;

    checkAllExpectations(difficulty, performances, preCalcDifficulty, preCalcPerformance);
  });
});