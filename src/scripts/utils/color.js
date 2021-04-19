/**
 * CSS color mapping from name to hex
 */
export const Color = {
  names: {
    aqua: 0x00ffff,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    black: 0x000000,
    blue: 0x0000ff,
    brown: 0xa52a2a,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgrey: 0xa9a9a9,
    darkgreen: 0x006400,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkviolet: 0x9400d3,
    fuchsia: 0xff00ff,
    gold: 0xffd700,
    green: 0x008000,
    indigo: 0x4b0082,
    khaki: 0xf0e68c,
    lightblue: 0xadd8e6,
    lightcyan: 0xe0ffff,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    magenta: 0xff00ff,
    maroon: 0x800000,
    navy: 0x000080,
    olive: 0x808000,
    orange: 0xffa500,
    pink: 0xffc0cb,
    purple: 0x800080,
    violet: 0x800080,
    red: 0xff0000,
    silver: 0xc0c0c0,
    white: 0xffffff,
    yellow: 0xffff00
  },

  /**
   * Random colorname generator from css color names
   *
   * @returns {string} random name of a css color
   */
  random() {
    let result
    let count = 0
    for (const prop in this.names) if (Math.random() < 1 / ++count) result = prop
    return result
  }
}
