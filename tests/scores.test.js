const {Difficulty, Performance, Mods, Beatmap, getUserScores} = require('../lib/entry.js');

const calculatedScores = require('./preCalc/scores.json');

async function getMapDifficultyAndPerformance(path, id, modsRaw, username)
{
  const beatmap = new Beatmap(path, id);
  const mods = new Mods(modsRaw);
  const scores = await getUserScores({
    b: id, u: username, mods,
    apiKey: "YOUR-API-KEY"
  });

  const dfCalc = new Difficulty(beatmap, mods);
  const ppCalc = new Performance(beatmap, mods);

  const difficulty = dfCalc.calculate();
  const performance = scores.map(score => {
    return ppCalc.calculate(difficulty, score);
  });

  return performance[0];
}

function checkAllExpectations(performance, preCalcPerformance)
{
  expect(performance.accPP).toBeCloseTo(preCalcPerformance.accPP, 0);
  expect(performance.tapPP).toBeCloseTo(preCalcPerformance.tapPP, 0);
  expect(performance.aimPP).toBeCloseTo(preCalcPerformance.aimPP, 0);
  expect(performance.totalPP).toBeCloseTo(preCalcPerformance.totalPP, 0);
}

describe('Scores calculation', () => {
  test('Kionell: REOL - Endless Line (DeRandom Otaku) [Infinite] + NM', async () => {
    const performance = await getMapDifficultyAndPerformance(
      './tests/maps/1493345.osu', '1493345', 'NM', 'Kionell'
    );

    const preCalcPerformance = calculatedScores[1493345]['Kionell'].NM;

    checkAllExpectations(performance, preCalcPerformance);
  });

  test('aetrna: THE ORAL CIGARETTES - Mou Ii kai? (Nevo) [Rain] + NCHD', async () => {
    const performance = await getMapDifficultyAndPerformance(
      './tests/maps/1695382.osu', '1695382', 'NCHD', 'aetrna'
    );

    const preCalcPerformance = calculatedScores[1695382]['aetrna'].NCHD;

    checkAllExpectations(performance, preCalcPerformance);
  });

  test('im a fancy lad: Various Artists - Alternator Compilation (Monstrata) [Marathon] + HR', async () => {
    const performance = await getMapDifficultyAndPerformance(
      './tests/maps/1528842.osu', '1528842', 'HR', 'im a fancy lad'
    );

    const preCalcPerformance = calculatedScores[1528842]['im a fancy lad'].HR;

    checkAllExpectations(performance, preCalcPerformance);
  });

  test('chocomint: xi - FREEDOM DiVE (Nakagawa-Kanon) [FOUR DIMENSIONS] + HDHR', async () => {
    const performance = await getMapDifficultyAndPerformance(
      './tests/maps/129891.osu', '129891', 'HDHR', 'chocomint'
    );

    const preCalcPerformance = calculatedScores[129891]['chocomint'].HDHR;

    checkAllExpectations(performance, preCalcPerformance);
  });

  test('Oomori Seiko - JUSTadICE (TV Size) (fieryrage) [Extreme] + DTHDHRFL', async () => {
    const performance = await getMapDifficultyAndPerformance(
      './tests/maps/2058788.osu', '2058788', 'DTHDHRFL', 'FGSky'
    );

    const preCalcPerformance = calculatedScores[2058788]['FGSky'].DTHDHRFL;

    checkAllExpectations(performance, preCalcPerformance);
  });
});