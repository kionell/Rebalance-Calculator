import {HitObject} from 'osu-bpdpc/src/Beatmap';

export default class Beatmap
{
  /**
   * Builds a Beatmap object from an .osu file
   * @param data Beatmap path or raw data.
   * @param raw Is this a raw data?
   */
  constructor(data: string, raw: boolean);
  
  CS: number;
  HP: number;
  OD: number;
  AR: number;

  circleCount: number;
  sliderCount: number;
  spinnerCount: number;
  objectsCount: number;
  maxCombo: number;

  bpmMin: number;
  bpmMax: number;
  
  mapID: number | string;
  setID: number | string;

  artist: string;
  creator: string;
  title: string;
  version: string;

  hitObjects: HitObject[];
  fileFormat: number;
}
