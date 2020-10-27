import User from "../classes/user";

/**
 * Parse osu API user data to get the User objects.
 * @param options API request config
 */
export default function getUserData(options: object): Promise<User[]>;