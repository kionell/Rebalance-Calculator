const Circle = require('osu-bpdpc/src/Rulesets/Osu/Objects/Circle');
const Slider = require('osu-bpdpc/src/Rulesets/Osu/Objects/Slider');
const Spinner = require('osu-bpdpc/src/Rulesets/Osu/Objects/Spinner');

function completeBeatmap(parsed, modStats)
{
  const {Vector2} = require('osu-bpdpc');

  const hitObjects = parsed.hitObjects;

  // Calculation of missing values ​​for each hit object.
  hitObjects.forEach(hitObject => {
    // Use fround() for compatibility with C# float type.
    hitObject.stackHeight = 0;
    hitObject.timePreempt = Math.fround(difficultyRange(modStats.AR, 1800, 1200, 450));
    hitObject.scale = Math.fround((Math.fround(1.0) - Math.fround(0.7) * (modStats.CS - 5) / 5) / 2);

    // Returns the same values ​​as: 23.0400009155273 + (7 - CS) * 4.47999954223635;
    hitObject.radius = Math.fround(64 * hitObject.scale);
  });

  if (parsed.fileFormat >= 6) {
    applyStacking(hitObjects, 0, hitObjects.length - 1);
  }
  else {
    applyStackingOld(hitObjects);
  }

  hitObjects.forEach(hitObject => {
    hitObject.stackedPos = new Vector2(
      Math.fround(hitObject.pos.x) - 0.1 * hitObject.radius * hitObject.stackHeight,
      Math.fround(hitObject.pos.y) - 0.1 * hitObject.radius * hitObject.stackHeight
    );
  });
}

function difficultyRange(difficulty, min, mid, max)
{
  if (difficulty > 5) {
    return mid + (max - mid) * (difficulty - 5) / 5;
  }

  if (difficulty < 5) {
    return mid - (mid - min) * (5 - difficulty) / 5;
  }

  return mid;
}

function applyStacking(hitObjects, startIndex, endIndex)
{
  if (startIndex > endIndex) {
    throw new Error("startIndex cannot be greater than endIndex.");
  }

  if (startIndex < 0) {
    throw new Error("startIndex cannot be less than 0.");
  }

  if (endIndex < 0) {
    throw new Error("endIndex cannot be less than 0.");
  }

  let extendedEndIndex = endIndex;

  if (endIndex < hitObjects.length - 1) {
    // Extend the end index to include objects they are stacked on
    for (let i = endIndex; i >= startIndex; --i) {
      let stackBaseIndex = i;

      for (let n = stackBaseIndex + 1; n < hitObjects.length; ++n) {
        let stackBaseObject = hitObjects[stackBaseIndex];

        if (stackBaseObject instanceof Spinner) {
          break;
        }

        let objectN = hitObjects[n];

        if (objectN instanceof Spinner) {
          continue;
        }

        stackBaseObject.endTime = stackBaseObject.endTime || stackBaseObject.startTime;

        let endTime = stackBaseObject.endTime;

        // timePreempt * stackLeniency
        let stackThreshold = objectN.timePreempt * 0.7;

        if (objectN.startTime - endTime > stackThreshold) {
          // We are no longer within stacking range of the next object.
          break;
        }

        if (Math.fround(stackBaseObject.pos.distance(objectN.pos)) < 3 
          || (stackBaseObject instanceof Slider 
            && Math.fround(stackBaseObject.endPos.distance(objectN.pos)) < 3)) {
          stackBaseIndex = n;

          // HitObjects after the specified update range haven't been reset yet
          objectN.stackHeight = 0;
        }
      }

      if (stackBaseIndex > extendedEndIndex) {
        extendedEndIndex = stackBaseIndex;

        if (extendedEndIndex === hitObjects.length - 1) 
          break;
      }
    }
  }

  // Reverse pass for stack calculation.
  let extendedStartIndex = startIndex;

  for (let i = extendedEndIndex; i > startIndex; --i)
  {
    /**
     * We should check every note which has not yet got a stack.
     * Consider the case we have two interwound stacks and this will make sense.
     * 
     * o <-1      o <-2
     *  o <-3      o <-4
     * 
     * We first process starting from 4 and handle 2,
     * then we come backwards on the i loop iteration until we reach 3 and handle 1.
     * 2 and 1 will be ignored in the i loop because they already have a stack value.
     */
    let n = i;

    let objectI = hitObjects[i];

    if (objectI.stackHeight !== 0 || objectI instanceof Spinner) {
      continue;
    }

    // timePreempt * stackLeniency
    let stackThreshold = objectI.timePreempt * 0.7;

    /**
     * If this object is a circle, then we enter this "special" case.
     * It either ends with a stack of circles only, or a stack of circles that are underneath a slider.
     * Any other case is handled by the "instanceof Slider" code below this.
     */
    if (objectI instanceof Circle)
    {
      while (--n >= 0) {
        let objectN = hitObjects[n];

        if (objectN instanceof Spinner) {
          continue;
        }

        objectN.endTime = objectN.endTime || objectN.startTime;

        let endTime = objectN.endTime;

        if (objectI.startTime - endTime > stackThreshold) {
          // We are no longer within stacking range of the previous object.
          break;
        }

        // HitObjects before the specified update range haven't been reset yet
        if (n < extendedStartIndex) {
          objectN.stackHeight = 0;
          extendedStartIndex = n;
        }

        /**
         * This is a special case where hticircles are moved DOWN and RIGHT (negative stacking) if they are under the *last* slider in a stacked pattern.
         *      o==o <- slider is at original location
         *       o <- hitCircle has stack of -1
         *        o <- hitCircle has stack of -2
         */
        if (objectN instanceof Slider 
          && Math.fround(objectN.endPos.distance(objectI.pos)) < 3)
        {
          let offset = objectI.stackHeight - objectN.stackHeight + 1;

          for (let j = n + 1; j <= i; ++j)
          {
            // For each object which was declared under this slider, we will offset it to appear *below* the slider end (rather than above).
            let objectJ = hitObjects[j];

            if (Math.fround(objectN.endPos.distance(objectJ.pos)) < 3) {
              objectJ.stackHeight -= offset;
            }
          }

          // We have hit a slider.  We should restart calculation using this as the new base.
          // Breaking here will mean that the slider still has StackCount of 0, so will be handled in the i-outer-loop.
          break;
        }

        if (Math.fround(objectN.pos.distance(objectI.pos)) < 3) {
          // Keep processing as if there are no sliders.  If we come across a slider, this gets cancelled out.
          // NOTE: Sliders with start positions stacking are a special case that is also handled here.

          objectN.stackHeight = objectI.stackHeight + 1;
          objectI = objectN;
        }
      }
    }
    else if (objectI instanceof Slider)
    {
      /**
       * We have hit the first slider in a possible stack.
       * From this point on, we ALWAYS stack positive regardless.
       */
      while (--n >= startIndex) {
        let objectN = hitObjects[n];

        if (objectN instanceof Spinner) {
          continue;
        }

        if (objectI.startTime - objectN.startTime > stackThreshold) {
          // We are no longer within stacking range of the previous object.
          break;
        }

        if (Math.fround(objectN.endPos.distance(objectI.pos)) < 3) {
          objectN.stackHeight = objectI.stackHeight + 1;
          objectI = objectN;
        }
      }
    }
  }
}

function applyStackingOld(hitObjects)
{
  for (let i = 0, len = hitObjects.length; i < len; ++i) {
    let currHitObject = hitObjects[i];

    if (currHitObject.stackHeight !== 0 && !(currHitObject instanceof Slider)) {
      continue;
    }

    let startTime = currHitObject.endTime || currHitObject.startTime;
    let sliderStack = 0;

    for (let j = i + 1, len = hitObjects.length; j < len; ++j) {
      // timePreempt * stackLeniency
      let stackThreshold = Math.fround(hitObjects[i].timePreempt * 0.7);

      if (hitObjects[j].startTime - stackThreshold > startTime) {
        break;
      }

      let pos2 = currHitObject.endPos;

      if (Math.fround(hitObjects[j].pos.distance(currHitObject.pos)) < 3) {
        ++currHitObject.stackHeight;
        startTime = hitObjects[j].endTime || hitObjects[j].startTime;
      }
      else if (Math.fround(hitObjects[j].pos.distance(pos2)) < 3) {
        // Case for sliders - bump notes down and right, rather than up and left.
        hitObjects[j].stackHeight -= ++sliderStack;
        startTime = hitObjects[j].endTime || hitObjects[j].startTime;
      }
    }
  }
}

module.exports = {completeBeatmap, difficultyRange};
