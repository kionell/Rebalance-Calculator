const UserScore = require('../classes/userScore.js');
const Mods = require('../classes/mods.js');

async function getUserScoresFromApi(options)
{
  if (!options.apiKey || typeof options.apiKey !== 'string') {
    throw new Error("Wrong api key! Can't make osu api call!");
  }

  const Osu = require('node-osu');
  const OsuApi = new Osu.Api(options.apiKey);

  const username = options.u || options.user || options.username;
  const beatmapId = options.b || options.beatmapId;
  const mods = options.mods instanceof Mods 
    ? options.mods.bitwise : undefined;

  const scores = await OsuApi.apiCall('/get_scores', {
    u: username, b: beatmapId, mods, m: 0
  });

  if (!scores.length) {
    throw new Error(`${username} didn't play this map or played with a different combination of mods!`);
  }

  const parsedScores = [];

  for (const score of scores) {
    parsedScores.push(new UserScore(score));
  }

  return parsedScores;
}

module.exports = getUserScoresFromApi;
