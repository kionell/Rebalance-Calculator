import {HitObject} from 'osu-bpdpc/src/Beatmap';

export default class OsuMovement
{
  /**
   * New osu movement instance.
   * @param rawMovementTime Uncorrected movement time
   * @param distance Corrected distance between objects
   * @param movementTime Corrected movement time
   * @param indexOfPerformance Movement index of performance
   * @param cheesability Cheesablility of the movement
   * @param cheesableRatio Cheesable time ratio
   * @param time Object start time
   * @param endsOnSlider Movement ends on a slider?
   */
  constructor(
    rawMovementTime : number, 
    distance: number, 
    movementTime: number, 
    indexOfPerformance: number, 
    cheesability: number, 
    cheesableRatio: number, 
    time: number, 
    endsOnSlider: boolean
  );

  /**
   * Extracts movement (only for the first object in a beatmap).
   */
  static extractMovement1(obj: HitObject): OsuMovement[];

  /**
   * Calculates the movement time, effective distance and other details for the movement from objPrev to objCurr.
   * @param objNeg4 Object that that was three objects before current</param>
   * @param objNeg2 Prevprev object</param>
   * @param objPrev Previous object</param>
   * @param objCurr Current object</param>
   * @param objNext Next object</param>
   * @param tapStrain Current object tap strain</param>
   * @param noteDensity Current object visual note density</param>
   * @param clockRate Clock rate</param>
   * @param hidden Are we calculating hidden mod?</param>
   * @returns List of movements related to current object</returns>
   */
  static extractMovement2(
    objNeg2: HitObject, objPrev: HitObject, objCurr: HitObject, objNext: HitObject, 
    tapStrain: number[], clockRate: number, hidden: boolean, 
    noteDensity: number, objNeg4?: HitObject | null): OsuMovement[];

  static getEmptyMovement(time: number): OsuMovement;

  static calcCorrection0Stop(x: number, y: number): number;
}