import Beatmap, {HitObject} from 'osu-bpdpc/src/Beatmap';

export default class BeatmapTemplate
{
  /**
   * Builds a complete Beatmap object from an .osu file
   */
  constructor(parsed: Beatmap);
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
