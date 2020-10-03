import User from "../classes/user";

/**
 * Parse osu api user data to get the User objects.
 */
export default function getUserData(options: object): Promise<User[]>;

/**
 * Try to get user data from osu api.
 */
declare function requestBanchoUser(options: object): Promise<object[]>;