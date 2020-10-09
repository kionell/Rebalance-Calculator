# Rebalance-Calculator

JavaScript library for calculating difficulty and performance of beatmaps and scores in a new osu!std rebalance from delta_t.

## Getting Started

Get your osu api key from: https://osu.ppy.sh/p/api

### Requirements

- Node.js 8.3.0+

### Installing

In your project add the dependency

```npm
npm i osu-rebalance
```

Require inside your javascript file

```javascript
const Rebalance = require('osu-rebalance');
```

or for specific elements using selective require

```javascript
const {Beatmap, Difficulty, Performance} = require('osu-rebalance');
```

## Beatmaps

To calculate difficulty and performance of the map, specify the path to previously downloaded .osu beatmap file.

```javascript
const {Beatmap} = require(osu-rebalance);

const beatmap = new Beatmap('./tests/maps/1695382.osu');
```

### Beatmap object:

<table>
  <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  <tr><td>CS</td><td>number</td><td>Beatmap circles size.</td></tr>
  <tr><td>HP</td><td>number</td><td>Beatmap hp drain.</td></tr>
  <tr><td>OD</td><td>number</td><td>Beatmap overall difficulty.</td></tr>
  <tr><td>AR</td><td>number</td><td>Beatmap approach rate.</td></tr>
  <tr><td>circleCount</td><td>number</td><td>Beatmap circles count.</td></tr>
  <tr><td>sliderCount</td><td>number</td><td>Beatmap sliders count.</td></tr>
  <tr><td>spinnerCount</td><td>number</td><td>Beatmap spinners count.</td></tr>
  <tr><td>objectsCount</td><td>number</td><td>Beatmap total objects count.</td></tr>
  <tr><td>maxCombo</td><td>number</td><td>Beatmap max combo.</td></tr>
  <tr><td>bpmMin</td><td>number</td><td>Beatmap minimum BPM.</td></tr>
  <tr><td>bpmMax</td><td>number</td><td>Beatmap maximum BPM.</td></tr>
  <tr><td>mapID</td><td>number | string</td><td>Beatmap id.</td></tr>
  <tr><td>setID</td><td>number | string</td><td>Beatmap set id.</td></tr>
  <tr><td>artist</td><td>string</td><td>Beatmap artist.</td></tr>
  <tr><td>creator</td><td>string</td><td>Beatmap creator.</td></tr>
  <tr><td>title</td><td>string</td><td>Beatmap title.</td></tr>
  <tr><td>version</td><td>string</td><td>Beatmap difficulty name.</td></tr>
  <tr><td>hitObjects</td><td>HitObject[]</td><td>Beatmap hit objects data.</td></tr>
  <tr><td>fileFormat</td><td>number</td><td>Beatmap file version.</td></tr>
</table>

## Mods

Mods are created as a class containing different representations of the mod combination.

```javascript
const {Mods} = require(osu-rebalance);

const mods = new Mods(24);

console.log(mods.bitwise); // 24
console.log(mods.acronyms); // ['HR', 'HD']
console.log(mods.fullNames); // ['Hard Rock', 'Hidden']
console.log(mods.combination); // HRHD
```

## Scores

### Basic score templates

Performance calculator requires a score to work. A simple score template created by the `Score` class is suitable for beatmap calculations. To create a new score, you need to specify at least max combo, accuracy and total hits. Mods are optional and by default they are equals to 0 (NM).

```javascript
const {Score} = require(osu-rebalance);

const score = new Score({
  totalHits: beatmap.objectsCount,
  maxCombo: beatmap.maxCombo,
  accuracy: 1, 
  mods: new Mods('NCHD')
});
```

#### Score object:

<table>
  <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  <tr><td>mods</td><td>Mods</td><td>Score mods.</td></tr>
  <tr><td>count300</td><td>number</td><td>Score 300s.</td></tr>
  <tr><td>count100</td><td>number</td><td>Score 100s.</td></tr>
  <tr><td>count50</td><td>number</td><td>Score 50s.</td></tr>
  <tr><td>countMiss</td><td>number</td><td>Score misses.</td></tr>
  <tr><td>totalHits</td><td>number</td><td>Score total hits (not to be confused with combo).</td></tr>
  <tr><td>maxCombo</td><td>number</td><td>Score max combo.</td></tr>
  <tr><td>accuracy</td><td>number</td><td>Score accuracy.</td></tr>
</table>

### User scores

User scores information is obtained from the osu api. Therefore, for use it is necessary to transfer the api key. The data for the request is passed as an object, each key of which has the same name as the keys in osu api. You can also specify scores type and filter scores by mods.

#### Requesting beatmap scores

If you don't specify any type of user scores, you will get beatmap scores by default.
```javascript
const {getUserScores} = require('osu-rebalance');

// Will return first 10 scores on specified beatmap
const scores = getUserScores({
  apiKey: 'YOUR-API-KEY',
  b: 124501,
  limit: 10
});
```

#### Requesting recent user scores

```javascript
const {Mods, getUserScores} = require('osu-rebalance');

// Will return all user's recent DT only scores.
const scores = getUserScores({
  apiKey: 'YOUR-API-KEY',
  u: 'Kionell',
  scoreType: 'recent',
  limit: 100,
  mods: new Mods('DT');
});
```

#### Requesting user best scores

```javascript
const {getUserScores} = require('osu-rebalance');

// Will return all user's best scores.
const scores = getUserScores({
  apiKey: 'YOUR-API-KEY',
  u: 'Kionell',
  scoreType: 'best',
  limit: 100
});
```

#### UserScore object:

<table>
  <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  <tr><td>mods</td><td>Mods</td><td>Score mods.</td></tr>
  <tr><td>count300</td><td>number</td><td>Score 300s.</td></tr>
  <tr><td>count100</td><td>number</td><td>Score 100s.</td></tr>
  <tr><td>count50</td><td>number</td><td>Score 50s.</td></tr>
  <tr><td>countMiss</td><td>number</td><td>Score misses.</td></tr>
  <tr><td>totalHits</td><td>number</td><td>Score total hits (not to be confused with combo).</td></tr>
  <tr><td>maxCombo</td><td>number</td><td>Score max combo.</td></tr>
  <tr><td>accuracy</td><td>number</td><td>Score accuracy.</td></tr>
  <tr><td>username</td><td>string</td><td>Nickname of the player who set this record.</td></tr>
  <tr><td>userId</td><td>string | number</td><td>User ID of the player who set this record.</td></tr>
  <tr><td>date</td><td>string;</td><td>Score publishing date.</td></tr>
  <tr><td>livePP</td><td>string | number</td><td>Performance of the score with current pp meta.</td></tr>
  <tr><td>rank</td><td>string | number</td><td>Score rank (S, A, B...).</td></tr>
  <tr><td>score</td><td>string | number</td><td>Score points.</td></tr>
  <tr><td>mapId</td><td>string | number</td><td>Score map id.</td></tr>
  <tr><td>position</td><td>string | number</td><td>Score position in api.</td></tr>
</table>

## Users 

As in the examples above with scores, you can also get information about users. This feature will come in handy later, since the calculation of the top 100 is not yet supported.

### Requesting user data

```javascript
const {getUserData} = require('osu-rebalance');

const users = getUserData({

});
```

### User object:

<table>
  <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  <tr><td>userId</td><td>string | number</td><td>User ID.</td></tr>
  <tr><td>username</td><td>string</td><td>Username.</td></tr>
  <tr><td>joined</td><td>string | Date | null</td><td>User join Date.</td></tr>
  <tr><td>playTime</td><td>string | number</td><td>User total play time in seconds.</td></tr>
  <tr><td>playCount</td><td>string | number</td><td>User total play count.</td></tr>
  <tr><td>worldRank</td><td>string | number</td><td>User world rank.</td></tr>
  <tr><td>countryRank</td><td>string | number</td><td>User country rank.</td></tr>
  <tr><td>country</td><td>string</td><td>User country.</td></tr>
  <tr><td>rankedScore</td><td>string | number</td><td>User ranked score.</td></tr>
  <tr><td>totalScore</td><td>string | number</td><td>User total score.</td></tr>
  <tr><td>level</td><td>string | number</td><td>User level.</td></tr>
  <tr><td>livePP</td><td>string | number</td><td>User total performance in current pp meta.</td></tr>
  <tr><td>accuracy</td><td>string | number</td><td>User total accuracy.</td></tr>
  <tr><td>count300</td><td>string | number</td><td>User total count of 300s.</td></tr>
  <tr><td>count100</td><td>string | number</td><td>User total count of 100s.</td></tr>
  <tr><td>count50</td><td>string | number</td><td>User total count of 50s.</td></tr>
  <tr><td>ranks</td><td>object</td><td>User total count of ranks.</td></tr>
  <tr><td>events</td><td>string[]</td><td>User latest events.</td></tr>
</table>

#### User ranks object:

<table>
  <tr><th>Name</th><th>Type</th></tr>
  <tr><td>XH</td><td>string | number</td></tr>
  <tr><td>X</td><td>string | number</td></tr>
  <tr><td>SH</td><td>string | number</td></tr>
  <tr><td>S</td><td>string | number</td></tr>
  <tr><td>A</td><td>string | number</td></tr>
</table>

## Calculations

Once the beatmap and score data are received, difficulty and performance can be calculated:

### Map calculation

```javascript
const {Beatmap, Mods, Score, Difficulty, Performance} = require('osu-rebalance');

// THE ORAL CIGARETTES - Mou Ii kai? (Nevo) [Rain] + NCHD
const beatmap = new Beatmap('./tests/maps/1695382.osu');
const mods = new Mods('NCHD');

const score = new Score({
  totalHits: beatmap.objectsCount,
  maxCombo: beatmap.maxCombo,
  accuracy: 1, // or 100
  mods: mods
});

const difficultyCalc = new Difficulty(beatmap, mods);
const performanceCalc = new Performance(beatmap, mods);

const difficulty = difficultyCalc.calculate();
const performance = performanceCalc.calculate(difficulty, score);

console.log(difficulty.totalStars); // 9.63355462667461
console.log(performance.totalPP);   // 1366.343694809782 (for SS)
```

### Score calculation

```javascript
const {Difficulty, Performance, Mods, Beatmap, getUserScores} = require('osu-rebalance');

// Kionell: REOL - Endless Line (DeRandom Otaku) [Infinite] + NM
const beatmap = new Beatmap('./tests/maps/1493345.osu');
const mods = new Mods(0);

const scores = getUserScores({
  apiKey: 'YOUR-API-KEY',
  b: '1493345', 
  u: 'Kionell', 
  mods: mods
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

### Difficulty object:

<table>
  <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  <tr><td>totalStars</td><td>number</td><td>Beatmap total stars.</td></tr>
  <tr><td>tapStars</td><td>number</td><td>Beatmap tap stars.</td></tr>
  <tr><td>aimStars</td><td>number</td><td>Beatmap aim stars.</td></tr>
  <tr><td>fingerStars</td><td>number</td><td>Beatmap finger control stars.</td></tr>
  <tr><td>tapAtts</td><td>object</td><td>Beatmap tap attributes.</td></tr>
  <tr><td>aimAtts</td><td>object</td><td>Beatmap aim attributes.</td></tr>
  <tr><td>fingerDiff</td><td>number</td><td>Beatmap finger control difficulty.</td></tr>
  <tr><td>clockRate</td><td>number</td><td>Beatmap clock rate.</td></tr>
  <tr><td>mapLength</td><td>number</td><td>Beatmap calculated length.</td></tr>
  <tr><td>mods</td><td>Mods</td><td>Beatmap mods.</td></tr>
  <tr><td>CS</td><td>number</td><td>Beatmap circle size.</td></tr>
  <tr><td>HP</td><td>number</td><td>Beatmap hp drain.</td></tr>
  <tr><td>OD</td><td>number</td><td>Beatmap overall difficulty.</td></tr>
  <tr><td>AR</td><td>number</td><td>Beatmap approach rate.</td></tr>
</table>

#### Tap attributes:

<table>
  <tr><th>Name</th><th>Type</th></tr>
  <tr><td>tapDiff</td><td>number</td></tr>
  <tr><td>streamNoteCount</td><td>number</td></tr>
  <tr><td>mashTapDiff</td><td>number</td></tr>
  <tr><td>strainHistory</td><td>number[]</td></tr>
</table>

#### Aim attributes:

<table>
  <tr><th>Name</th><th>Type</th></tr>
  <tr><td>fcProbTp</td><td>number</td></tr>
  <tr><td>hiddenFactor</td><td>number</td></tr>
  <tr><td>comboTps</td><td>number[]</td></tr>
  <tr><td>missTps</td><td>number[]</td></tr>
  <tr><td>missCounts</td><td>number[]</td></tr>
  <tr><td>cheeseNoteCount</td><td>number</td></tr>
  <tr><td>cheeseLevels</td><td>number[]</td></tr>
  <tr><td>cheeseFactors</td><td>number[]</td></tr>
</table>

### Performance object:

<table>
  <tr><th>Name</th><th>Type</th><th>Description</th></tr>
  <tr><td>totalPP</td><td>number</td><td>Total performance.</td></tr>
  <tr><td>aimPP</td><td>number</td><td>Aim performance.</td></tr>
  <tr><td>tapPP</td><td>number</td><td>Tap performance.</td></tr>
  <tr><td>accPP</td><td>number</td><td>Accuracy performance.</td></tr>
</table>

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/kionell/Rebalance-Calculator/blob/master/LICENSE) file for details