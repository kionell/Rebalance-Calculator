const {Difficulty, Performance, Mods, Beatmap, getUserScores} = require('../lib/entry');

// Kionell: REOL - Endless Line (DeRandom Otaku) [Infinite] + NM
const beatmap = new Beatmap('./tests/maps/1493345.osu');
const mods = new Mods(0);
const scores = getUserScores({
  apiKey: "YOUR-API-KEY",
  b: '1493345', 
  u: 'Kionell', 
  mods
});

scores.then(score => {
  const dfCalc = new Difficulty(beatmap, mods);
  const ppCalc = new Performance(beatmap, mods);
  
  const difficulty = dfCalc.calculate();
  const performance = ppCalc.calculate(difficulty, score[0]);

  console.log(difficulty.totalStars); // 5.641330225101718
  console.log(performance.totalPP);   // 241.47355804117475
});