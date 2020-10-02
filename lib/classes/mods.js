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
  #mods;

  constructor(mods) 
  {
    this.#mods = mods;
  }

  toJSON()
  {
    return this.combination;
  }

  get bitwise()
  {
    let mods = this.#mods;

    if (typeof mods !== 'number' && parseInt(mods) != mods) {
      if (!Array.isArray(mods)) {
        if (!mods || !mods.length) {
          return 0;
        }

        mods = mods.match(/.{2}/g).map(m => m.toUpperCase());
      }
      
      let bitwise = mods.reduce((p, c) => {
        for (const code in codes) {
          if (codes[code].includes(c)) {
            c = parseInt(code);

            if (c === 512) c += 64;
            if (c === 16384) c += 32;

            break;
          }
        }
        
        return typeof c === 'number' ? p | c : p;
      }, 0);
  
      return bitwise || 0;
    } 
    else {
      return this.#mods;
    }
  }

  get acronyms()
  {
    return this.#getModInfo(this.#mods).map(x => x[0]);
  }

  get fullNames()
  {
    return this.#getModInfo(this.#mods).map(x => x[1]);
  }

  get combination()
  {
    return this.#getModInfo(this.#mods).map(x => x[0]).join('');
  }

  #parseBitwise(bitwise)
  { 
    bitwise = (bitwise & 512) && (bitwise & 64) 
      ? bitwise - 64 : bitwise;
      
    bitwise = (bitwise & 16384) && (bitwise & 32) 
      ? bitwise - 32 : bitwise;

    let parsedMods = Object.keys(codes)
      .filter(code => bitwise & code)
      .map(x => codes[x]);
  
    if (!parsedMods.length) {
      parsedMods.push(codes['0']);
    }
  
    return parsedMods;
  }
  
  #getModInfo(mods)
  {
    if (typeof mods !== 'number' && parseInt(mods) != mods) {
      if (!Array.isArray(mods)) {
        if (!mods || !mods.length) {
          return [codes['0']];
        }
  
        // it's mod combination.
        // split it by 2 symbols and convert to uppercase.
        mods = mods.match(/.{2}/g);
      }
  
      mods = mods.map(x => {
        if (typeof x !== 'string') {
          return null;
        }
  
        for (const code in codes) {
          if (codes[code].includes(x.toUpperCase())) {
            return codes[code];
          }
        }
  
        return null;
      }).filter(x => x);
  
      return mods.length ? mods : [codes['0']];
    }
    else {
      return this.#parseBitwise(+mods);
    }
  }
}

module.exports = Mods;
