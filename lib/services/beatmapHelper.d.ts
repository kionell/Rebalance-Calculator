import Beatmap, {HitObject} from 'osu-bpdpc/src/Beatmap';
import {IModStats} from '../calculator/difficultyCalc';
import BeatmapTemplate from '../classes/beatmap';

/**
 * Builds a complete beatmap object from beatmap template and mod stats.
 */
export default function getBeatmapTemplate(path: string): BeatmapTemplate;

/**
 * Adds missing values to the hit objects.
 */
export function completeBeatmap(parsed: BeatmapTemplate, modStats: IModStats): void;
export function difficultyRange(difficulty: number, min: number, mid: number, max: number): number;

/**
 * Parses .osu file to get beatmap object.
 */
declare function parseBeatmapFile(path: string): Beatmap;

declare function applyStacking(hitObjects: HitObject[], startIndex: number, endIndex: number): void;
declare function applyStackingOld(hitObjects: HitObject[]): void;