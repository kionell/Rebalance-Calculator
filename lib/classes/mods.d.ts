export default class Mods
{
  private _mods: number | string | string[];

  /**
   * New Mods instance
   * @param mods Raw mods.
   */
  constructor(mods: number | string | string[]);

  toString(): string;
  toJSON(): string;

  /**
   * Converts mods to a bitwise number.
   */
  get bitwise(): number;

  /**
   * Converts mods to a list of acronyms.
   */
  get acronyms(): string[];

  /**
   * Converts mods to a list of full names.
   */
  get fullNames(): string[];
  
  /**
   * Converts mods to a mods combination.
   */
  get combination(): string;
  
  /**
   * Parses bitwise number to get info about mods.
   */
  private _parseBitwise(bitwise: number): number;

  /**
   * Parses the received data and outputs information about mods
   */
  private _getModInfo(mods: number | string | string[]): ICodes;
}

export interface ICodes
{
  [code: number]: object;
}