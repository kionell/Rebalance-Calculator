import UserScore from "../classes/userScore";

/**
 * Parse osu api user scores to get the UserScore objects.
 */
export default function getUserScores(options: object): Promise<UserScore[]>;

/**
 * Try to get user scores from osu api.
 */
declare function requestBanchoScores(options: object): Promise<object[]>;