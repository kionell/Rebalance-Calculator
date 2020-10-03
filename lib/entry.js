module.exports = {
  Difficulty: require('./calculator/difficultyCalc'),
  Performance: require('./calculator/performanceCalc'),
  Mods: require('./classes/mods'),
  Beatmap: require('./classes/beatmap'),
  Score: require('./classes/score'),
  getUserScores: require('./services/scoreRequester'),
  getUserData: require('./services/userRequester'),
}
