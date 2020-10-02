import UserScore from "../classes/userScore";

/**
 * Makes a call to osu api v1 and tries to get data about a beatmap.
 */
export default function getUserScoresFromApi(options: object): Promise<UserScore>;
