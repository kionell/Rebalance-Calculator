class NoteDensity
{
  /**
   * Calculates note density for every note
   */
  static calculateNoteDensities(hitObjects, preempt)
  {
    let noteDensities = [];
    let window = [];

    let next = 0;

    for (let i = 0, len = hitObjects.length; i < len; ++i) {
      while (next < len && hitObjects[next].startTime < hitObjects[i].startTime + preempt) {
        window.push(hitObjects[next++]);
      }

      while (window[0].startTime < hitObjects[i].startTime - preempt) {
        window.shift();
      }

      noteDensities.push(this.calculateNoteDensity(hitObjects[i].startTime, preempt, window));
    }

    return noteDensities;
  }

  static calculateNoteDensity(time, preempt, window)
  {
    let noteDensity = 0;

    for (const obj of window) {
      noteDensity += 1 - Math.abs(obj.startTime - time) / preempt;
    }

    return noteDensity;
  }
}

module.exports = NoteDensity;
