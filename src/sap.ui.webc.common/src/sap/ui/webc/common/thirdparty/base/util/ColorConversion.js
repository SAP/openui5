sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getRGBColor = _exports.RGBToHSL = _exports.HSLToRGB = _exports.HEXToRGB = void 0;
  /**
   *
   * @param {String} color Color in one of the following formats: RGBA or HEX
   */

  /**
   * Map of CSS colors to hex representation
   */
  const CSSColors = {
    aliceblue: "f0f8ff",
    antiquewhite: "faebd7",
    aqua: "00ffff",
    aquamarine: "7fffd4",
    azure: "f0ffff",
    beige: "f5f5dc",
    bisque: "ffe4c4",
    black: "000000",
    blanchedalmond: "ffebcd",
    blue: "0000ff",
    blueviolet: "8a2be2",
    brown: "a52a2a",
    burlywood: "deb887",
    cadetblue: "5f9ea0",
    chartreuse: "7fff00",
    chocolate: "d2691e",
    coral: "ff7f50",
    cornflowerblue: "6495ed",
    cornsilk: "fff8dc",
    crimson: "dc143c",
    cyan: "00ffff",
    darkblue: "00008b",
    darkcyan: "008b8b",
    darkgoldenrod: "b8860b",
    darkgray: "a9a9a9",
    darkgrey: "a9a9a9",
    darkgreen: "006400",
    darkkhaki: "bdb76b",
    darkmagenta: "8b008b",
    darkolivegreen: "556b2f",
    darkorange: "ff8c00",
    darkorchid: "9932cc",
    darkred: "8b0000",
    darksalmon: "e9967a",
    darkseagreen: "8fbc8f",
    darkslateblue: "483d8b",
    darkslategray: "2f4f4f",
    darkslategrey: "2f4f4f",
    darkturquoise: "00ced1",
    darkviolet: "9400d3",
    deeppink: "ff1493",
    deepskyblue: "00bfff",
    dimgray: "696969",
    dimgrey: "696969",
    dodgerblue: "1e90ff",
    firebrick: "b22222",
    floralwhite: "fffaf0",
    forestgreen: "228b22",
    fuchsia: "ff00ff",
    gainsboro: "dcdcdc",
    ghostwhite: "f8f8ff",
    gold: "ffd700",
    goldenrod: "daa520",
    gray: "808080",
    grey: "808080",
    green: "008000",
    greenyellow: "adff2f",
    honeydew: "f0fff0",
    hotpink: "ff69b4",
    indianred: "cd5c5c",
    indigo: "4b0082",
    ivory: "fffff0",
    khaki: "f0e68c",
    lavender: "e6e6fa",
    lavenderblush: "fff0f5",
    lawngreen: "7cfc00",
    lemonchiffon: "fffacd",
    lightblue: "add8e6",
    lightcoral: "f08080",
    lightcyan: "e0ffff",
    lightgoldenrodyellow: "fafad2",
    lightgray: "d3d3d3",
    lightgrey: "d3d3d3",
    lightgreen: "90ee90",
    lightpink: "ffb6c1",
    lightsalmon: "ffa07a",
    lightseagreen: "20b2aa",
    lightskyblue: "87cefa",
    lightslategray: "778899",
    lightslategrey: "778899",
    lightsteelblue: "b0c4de",
    lightyellow: "ffffe0",
    lime: "00ff00",
    limegreen: "32cd32",
    linen: "faf0e6",
    magenta: "ff00ff",
    maroon: "800000",
    mediumaquamarine: "66cdaa",
    mediumblue: "0000cd",
    mediumorchid: "ba55d3",
    mediumpurple: "9370db",
    mediumseagreen: "3cb371",
    mediumslateblue: "7b68ee",
    mediumspringgreen: "00fa9a",
    mediumturquoise: "48d1cc",
    mediumvioletred: "c71585",
    midnightblue: "191970",
    mintcream: "f5fffa",
    mistyrose: "ffe4e1",
    moccasin: "ffe4b5",
    navajowhite: "ffdead",
    navy: "000080",
    oldlace: "fdf5e6",
    olive: "808000",
    olivedrab: "6b8e23",
    orange: "ffa500",
    orangered: "ff4500",
    orchid: "da70d6",
    palegoldenrod: "eee8aa",
    palegreen: "98fb98",
    paleturquoise: "afeeee",
    palevioletred: "db7093",
    papayawhip: "ffefd5",
    peachpuff: "ffdab9",
    peru: "cd853f",
    pink: "ffc0cb",
    plum: "dda0dd",
    powderblue: "b0e0e6",
    purple: "800080",
    red: "ff0000",
    rosybrown: "bc8f8f",
    royalblue: "4169e1",
    saddlebrown: "8b4513",
    salmon: "fa8072",
    sandybrown: "f4a460",
    seagreen: "2e8b57",
    seashell: "fff5ee",
    sienna: "a0522d",
    silver: "c0c0c0",
    skyblue: "87ceeb",
    slateblue: "6a5acd",
    slategray: "708090",
    slategrey: "708090",
    snow: "fffafa",
    springgreen: "00ff7f",
    steelblue: "4682b4",
    tan: "d2b48c",
    teal: "008080",
    thistle: "d8bfd8",
    tomato: "ff6347",
    turquoise: "40e0d0",
    violet: "ee82ee",
    wheat: "f5deb3",
    white: "ffffff",
    whitesmoke: "f5f5f5",
    yellow: "ffff00",
    yellowgreen: "9acd32",
    transparent: "00000000"
  };
  const getRGBColor = color => {
    if (color.startsWith("rgba")) {
      return RGBAToRGB(color);
    }
    if (color.startsWith("rgb")) {
      return RGBToRGB(color);
    }

    // HEX
    if (color.indexOf("#") === 0) {
      // Shorthand Syntax
      if (color.length === 4) {
        color = `${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
      } else {
        color = color.slice(1, color.length);
      }
    }

    // Css Color
    if (Object.keys(CSSColors).includes(color)) {
      color = CSSColors[color];
    }
    return HEXToRGB(color);
  };

  /**
   * Return an object with the properties for each of the main colors(red, green, blue)
   * @param {String} color Receives a color in the following format: "rgba(0, 0, 0, 1)
   */
  _exports.getRGBColor = getRGBColor;
  const RGBAToRGB = color => {
    const openingBracketIndex = color.indexOf("("),
      commasIndexes = [];
    for (let i = 0; i < color.length; i++) {
      if (color[i] === ",") {
        commasIndexes.push(i);
      }
    }
    return {
      r: parseInt(color.slice(openingBracketIndex + 1, commasIndexes[0]).trim()),
      g: parseInt(color.slice(commasIndexes[0] + 1, commasIndexes[1]).trim()),
      b: parseInt(color.slice(commasIndexes[1] + 1, commasIndexes[2]).trim())
    };
  };

  /**
   * Return an object with the properties for each of the main colors(red, green, blue)
   * @param {String} color Receives a color in the following format: "rgb(0, 0, 0)
   */
  const RGBToRGB = color => {
    const openingBracketIndex = color.indexOf("("),
      closingBraketIndex = color.indexOf(")"),
      commasIndexes = [];
    for (let i = 0; i < color.length; i++) {
      if (color[i] === ",") {
        commasIndexes.push(i);
      }
    }
    return {
      r: parseInt(color.slice(openingBracketIndex + 1, commasIndexes[0]).trim()),
      g: parseInt(color.slice(commasIndexes[0] + 1, commasIndexes[1]).trim()),
      b: parseInt(color.slice(commasIndexes[1] + 1, closingBraketIndex).trim())
    };
  };
  const HSLToRGB = (color = {
    h: undefined,
    s: undefined,
    l: undefined
  }) => {
    // Formula taken from https://www.rapidtables.com/convert/color/hsl-to-rgb.html
    const C = (1 - Math.abs(2 * color.l - 1)) * color.s,
      X = C * (1 - Math.abs(color.h / 60 % 2 - 1)),
      m = color.l - C / 2;
    let tempColor = {};
    switch (Math.round(color.h / 60)) {
      // 0 ≤ H < 60
      case 0:
        tempColor = {
          r: C,
          g: X,
          b: 0
        };
        break;

      // 60 ≤ H < 120
      case 1:
        tempColor = {
          r: X,
          g: C,
          b: 0
        };
        break;

      // 120 ≤ H < 180
      case 2:
        tempColor = {
          r: 0,
          g: C,
          b: X
        };
        break;

      // 180 ≤ H < 240
      case 3:
        tempColor = {
          r: 0,
          g: X,
          b: C
        };
        break;

      // 240 ≤ H < 300
      case 4:
        tempColor = {
          r: X,
          g: 0,
          b: C
        };
        break;

      // 300 ≤ H < 360
      default:
        tempColor = {
          r: C,
          g: 0,
          b: X
        };
    }
    return {
      r: Math.floor((tempColor.r + m) * 255),
      g: Math.floor((tempColor.g + m) * 255),
      b: Math.floor((tempColor.b + m) * 255)
    };
  };
  _exports.HSLToRGB = HSLToRGB;
  const HEXToRGB = hex => {
    // Please make sure you pass a valid 6 digit hex color
    // In the implementation of this method we assume that the hex argument is a 6 digit valid hex color

    const rgbValues = {
      r: hex.substr(0, 2),
      g: hex.substr(2, 2),
      b: hex.substr(4, 2)
    };
    const rgbKeys = Object.keys(rgbValues);
    rgbKeys.forEach(key => {
      rgbValues[key] = parseInt(rgbValues[key], 16);
    });
    return rgbValues;
  };
  _exports.HEXToRGB = HEXToRGB;
  const RGBToHSL = (color = {
    r: undefined,
    g: undefined,
    b: undefined
  }) => {
    const R = color.r / 255,
      G = color.g / 255,
      B = color.b / 255,
      max = Math.max(R, G, B),
      min = Math.min(R, G, B),
      delta = max - min;
    let h, s;

    // Hue calculation
    if (delta === 0) {
      h = 0;
    } else if (max === R) {
      h = 60 * ((G - B) / delta % 6);
    } else if (max === G) {
      h = 60 * ((B - R) / delta + 2);
    } else if (max === B) {
      h = 60 * ((R - G) / delta + 4);
    }

    // Lightness calculation
    const l = (max + min) / 2;

    // Saturation calculation
    if (delta === 0) {
      s = 0;
    } else {
      s = delta / (1 - Math.abs(2 * l - 1));
    }
    return {
      h,
      s,
      l
    };
  };
  _exports.RGBToHSL = RGBToHSL;
});