const UserScore = require('../classes/userScore');
const Mods = require('../classes/mods');

const getUserData = require('../services/userRequester');

async function getUserScores(options)
{
  const scores = await requestBanchoScores(options);

  const parsedScores = [];

  for (const score of scores) {
    parsedScores.push(new UserScore(score));
  }

  return parsedScores;
}

async function requestBanchoScores(options)
{
  if (!options.apiKey || typeof options.apiKey !== 'string') {
    throw new Error("Wrong api key! Can't make osu api call!");
  }

  const Osu = require('node-osu');
  const OsuApi = new Osu.Api(options.apiKey);

  const limit = options.limit;
  const user = (await getUserData(options))[0];
  const beatmapId = options.b || options.beatmapId;
  const mods = options.mods instanceof Mods 
    ? options.mods.bitwise : undefined;

  let endpoint, config;

  switch (options.scoreType) {
    case 'recent':
      endpoint = '/get_user_recent';
      config = {u: user.userId, m: 0, limit};
      break;

    case 'best':
      endpoint = '/get_user_best';
      config = {u: user.userId, m: 0, limit};
      break;

    default:
      endpoint = '/get_scores';
      config = {u: user.userId, b: beatmapId, mods, m: 0, limit}
  }

  const scores = await OsuApi.apiCall(endpoint, config);

  scores.forEach((x, i) => {
    x.position = i + 1;
    x.username = user.username;
    x.beatmap_id = beatmapId;
  });

  if (!scores.length) {
    throw new Error(`No scores from ${user.username} were found!`);
  }

  return scores;
}

module.exports = getUserScores;
