const codes = {
  536870912: ['V2', 'ScoreV2'],
  4194304:   ['CN', 'Cinema'],
  16384:     ['PF', 'Perfect'],     // 16384 (PF) + 32 (SD) = 16416 (for API compatibility)
  8192:      ['AP', 'Autopilot'],
  4096:      ['SO', 'Spun Out'],
  2048:      ['AO', 'Autoplay'],
  1024:      ['FL', 'Flashlight'],
  512:       ['NC', 'Nightcore'],   // 512 (NC) + 64 (DT) = 576 (for API compatibility()
  256:       ['HT', 'Half Time'],
  128:       ['RX', 'Relax'],
  64:        ['DT', 'Double Time'],
  32:        ['SD', 'Sudden Death'],
  16:        ['HR', 'Hard Rock'],
  8:         ['HD', 'Hidden'],
  4:         ['TD', 'Touch Device'],
  2:         ['EZ', 'Easy'],
  1:         ['NF', 'No Fail'],
  0:         ['NM', 'No Mod'],
};

class Mods 
{
  constructor(mods) 
  {
    this._mods = mods;
  }

  toJSON()
  {
    return this.combination;
  }

  toString()
  {
    return this.combination;
  }

  get bitwise()
  {
    return this._getModInfo(this._mods)
      .map(x => x[0])
      .reduce((p, c) => {
        if (c === 512) c += 64;
        if (c === 16384) c += 32;

        return p + c;
      }, 0);
  }

  get combination()
  {
    return this._getModInfo(this._mods)
      .map(x => x[1])
      .join('');
  }

  get acronyms()
  {
    return this._getModInfo(this._mods)
      .map(x => x[1]);
  }

  get fullNames()
  {
    return this._getModInfo(this._mods)
      .map(x => x[2]);
  }

  _parseBitwise(bitwise)
  { 
    bitwise = (bitwise & 512) && (bitwise & 64) 
      ? bitwise - 64 : bitwise;
      
    bitwise = (bitwise & 16384) && (bitwise & 32) 
      ? bitwise - 32 : bitwise;

    let parsedMods = Object.keys(codes)
      .filter(code => bitwise & code)
      .map(x => [+x, ...codes[x]]);
  
    if (!parsedMods.length) {
      parsedMods.push([0, ...codes['0']]);
    }
  
    return parsedMods;
  }
  
  _getModInfo(mods)
  {
    // If it's not mods bitwise.
    if (typeof mods !== 'number' && parseInt(mods) != mods) {
      // If it's not mods array.
      if (!Array.isArray(mods)) {
        // If it's not mods combination.
        if (!mods || !mods.length || mods.length % 2) {
          return [[0, ...codes['0']]];
        }
  
        // It could be a mod combination.
        // Split it by 2 symbols.
        mods = mods.match(/.{2}/g).map(m => m.toUpperCase());
      }
  
      let parsedMods = [];

      for (const code in codes) {
        if (mods.includes(codes[code][0])) {
          parsedMods.push([Number(code), ...codes[code]]);
        }
      }
  
      return parsedMods.length && parsedMods.length === mods.length
        ? parsedMods : [[0, ...codes['0']]];
    }
    // if it's bitwise
    else {
      return this._parseBitwise(+mods);
    }
  }
}

module.exports = Mods;
