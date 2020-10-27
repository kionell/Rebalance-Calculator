const bpdpc = require('osu-bpdpc');
const fs = require('fs');

class Beatmap
{
  constructor (data, raw = false)
  {
    if (!raw) {
      data = fs.readFileSync(data).toString();
    }

    const parsed = bpdpc.Beatmap.fromOsu(data);

    this.CS = parsed.Difficulty.CircleSize;
    this.HP = parsed.Difficulty.HPDrainRate;
    this.OD = parsed.Difficulty.OverallDifficulty;
    this.AR = parsed.Difficulty.ApproachRate;

    this.circleCount = parsed.countNormal;
    this.sliderCount = parsed.countSlider;
    this.spinnerCount = parsed.countSpinner;
    this.objectsCount = parsed.countObjects;
    this.maxCombo = parsed.maxCombo;

    this.bpmMin = parsed.General.MinBPM;
    this.bpmMax = parsed.General.MaxBPM;
    
    this.mapID = parsed.Metadata.BeatmapID;
    this.setID = parsed.Metadata.BeatmapSetID;

    this.artist = parsed.Metadata.Artist;
    this.creator = parsed.Metadata.Creator;
    this.title = parsed.Metadata.Title;
    this.version = parsed.Metadata.Version;

    // These values can only be obtained from .osu file 
    this.hitObjects = parsed.HitObjects;
    this.fileFormat = parsed.Version;
  }
}

module.exports = Beatmap;
