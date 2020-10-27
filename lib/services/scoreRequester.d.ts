import UserScore from "../classes/userScore";

/**
 * Parse osu API user scores to get the UserScore objects.
 * @param options API request config
 */
export default function getUserScores(options: object): Promise<UserScore[]>;