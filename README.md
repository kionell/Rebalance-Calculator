# Rebalance-Calculator

JavaScript library for calculating difficulty and performance of beatmaps and scores in a new osu!std rebalance from delta_t.

## Getting Started

Get your osu api key from: https://osu.ppy.sh/p/api

### Installing

In your project add the dependency

```javascript
npm i osu-rebalance
```

## Usage

Require inside your javascript file

```javascript
const Rebalance = require('osu-rebalance');
```

or for specific elements using selective require

```javascript
const {Beatmap, Difficulty, Performance} = require('osu-rebalance');
```

### Map calculation

```javascript
const {Difficulty, Performance, Mods, Beatmap, Score} = require('osu-rebalance');

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
```

### Score calculation

```javascript
const {Difficulty, Performance, Mods, Beatmap, getUserScores} = require('osu-rebalance');

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
```

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/kionell/Rebalance-Calculator/blob/master/LICENSE) file for details