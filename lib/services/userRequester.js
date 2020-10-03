const User = require('../classes/user');

async function getUserData(options)
{
  const users = await requestBanchoUsers(options);

  const parsedUsers = [];

  for (const user of users) {
    parsedUsers.push(new User(user));
  }

  return parsedUsers;
}

async function requestBanchoUsers(options)
{
  if (!options.apiKey || typeof options.apiKey !== 'string') {
    throw new Error("Wrong api key! Can't make osu api call!");
  }

  const Osu = require('node-osu');
  const OsuApi = new Osu.Api(options.apiKey);

  const target = options.u || options.userId 
    || options.user || options.username;

  const users = await OsuApi.apiCall('/get_user', {u: target, m: 0});

  if (!users.length) {
    throw new Error(`No users were found!`);
  }

  return users;
}

module.exports = getUserData;
