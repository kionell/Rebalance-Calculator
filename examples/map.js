const {Difficulty, Performance, Mods, Beatmap, Score} = require('../lib/entry');

// THE ORAL CIGARETTES - Mou Ii kai? (Nevo) [Rain] + NCHD
const beatmap = new Beatmap('./tests/maps/1695382.osu');
const mods = new Mods('NCHD');
const score = new Score({
  totalHits: beatmap.objectsCount,
  maxCombo: beatmap.maxCombo,
  accuracy: 1, 
  mods
});

const dfCalc = new Difficulty(beatmap, mods);
const ppCalc = new Performance(beatmap, mods);

const difficulty = dfCalc.calculate();
const performance = ppCalc.calculate(difficulty, score);

console.log(difficulty.totalStars); // 9.63355462667461
console.log(performance.totalPP);   // 1366.343694809782