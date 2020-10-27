const UserScore = require('../classes/userScore');
const Mods = require('../classes/mods');

const getUserData = require('../services/userRequester');

async function getUserScores(options)
{
  if (!options.apiKey || typeof options.apiKey !== 'string') {
    throw new Error("Wrong api key! Can't make osu api call!");
  }

  const Osu = require('node-osu');
  const OsuApi = new Osu.Api(options.apiKey);

  const user = await getUserData(options);
  const limit = options.limit;
  const beatmapId = options.b || options.beatmapId;
  const mods = options.mods instanceof Mods 
    ? options.mods.bitwise : undefined;

  let endpoint, config;

  switch (options.scoreType) {
    case 'recent':
      endpoint = '/get_user_recent';
      config = {u: user[0].userId, m: 0, limit};
      break;

    case 'best':
      endpoint = '/get_user_best';
      config = {u: user[0].userId, m: 0, limit};
      break;

    default:
      endpoint = '/get_scores';
      config = {u: user[0].userId, b: beatmapId, mods, m: 0, limit}
  }

  let scores = await OsuApi.apiCall(endpoint, config);

  scores.forEach((x, i) => {
    x.position = i + 1;
    x.username = user[0].username;
    x.beatmap_id = x.beatmap_id || beatmapId;
  });

  if (mods !== undefined) {
    scores = scores.filter(x => x.enabled_mods == mods);
  }
  
  if (!scores.length) {
    throw new Error(`No scores from ${user[0].username} were found!`);
  }

  const parsedScores = [];

  for (const score of scores) {
    parsedScores.push(new UserScore(score));
  }

  return parsedScores;
}

module.exports = getUserScores;
