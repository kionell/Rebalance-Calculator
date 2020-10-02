module.exports = {
  Difficulty: require('./calculator/difficultyCalc.js'),
  Performance: require('./calculator/performanceCalc.js'),
  Mods: require('./classes/mods.js'),
  Beatmap: require('./services/beatmapHelper.js').default,
  Score: require('./classes/score.js'),
  getUserScores: require('./services/scoreRequester.js')
}
