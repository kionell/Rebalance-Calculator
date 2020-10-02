export default class Mods
{
  private mods: number | string | string[];

  constructor(mods: number | string | string[]);

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
  private parseBitwise(bitwise: number): number;

  /**
   * Parses the received data and outputs information about mods
   */
  private getModInfo(mods: number | string | string[]): ICodes;
}

export interface ICodes
{
  [code: number]: object;
}