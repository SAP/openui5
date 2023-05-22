sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getRGBColor = _exports.RGBtoHEX = _exports.RGBToHSL = _exports.RGBStringToRGBObject = _exports.HSLToRGB = _exports.HEXToRGB = void 0;
  /**
   *
   * @param {String} color Color in one of the following formats: RGBA or HEX
   */
  /**
   * Map of CSS colors to hex representation
   */
  var CSSColors;
  (function (CSSColors) {
    CSSColors["aliceblue"] = "f0f8ff";
    CSSColors["antiquewhite"] = "faebd7";
    CSSColors["aqua"] = "00ffff";
    CSSColors["aquamarine"] = "7fffd4";
    CSSColors["azure"] = "f0ffff";
    CSSColors["beige"] = "f5f5dc";
    CSSColors["bisque"] = "ffe4c4";
    CSSColors["black"] = "000000";
    CSSColors["blanchedalmond"] = "ffebcd";
    CSSColors["blue"] = "0000ff";
    CSSColors["blueviolet"] = "8a2be2";
    CSSColors["brown"] = "a52a2a";
    CSSColors["burlywood"] = "deb887";
    CSSColors["cadetblue"] = "5f9ea0";
    CSSColors["chartreuse"] = "7fff00";
    CSSColors["chocolate"] = "d2691e";
    CSSColors["coral"] = "ff7f50";
    CSSColors["cornflowerblue"] = "6495ed";
    CSSColors["cornsilk"] = "fff8dc";
    CSSColors["crimson"] = "dc143c";
    CSSColors["cyan"] = "00ffff";
    CSSColors["darkblue"] = "00008b";
    CSSColors["darkcyan"] = "008b8b";
    CSSColors["darkgoldenrod"] = "b8860b";
    CSSColors["darkgray"] = "a9a9a9";
    CSSColors["darkgrey"] = "a9a9a9";
    CSSColors["darkgreen"] = "006400";
    CSSColors["darkkhaki"] = "bdb76b";
    CSSColors["darkmagenta"] = "8b008b";
    CSSColors["darkolivegreen"] = "556b2f";
    CSSColors["darkorange"] = "ff8c00";
    CSSColors["darkorchid"] = "9932cc";
    CSSColors["darkred"] = "8b0000";
    CSSColors["darksalmon"] = "e9967a";
    CSSColors["darkseagreen"] = "8fbc8f";
    CSSColors["darkslateblue"] = "483d8b";
    CSSColors["darkslategray"] = "2f4f4f";
    CSSColors["darkslategrey"] = "2f4f4f";
    CSSColors["darkturquoise"] = "00ced1";
    CSSColors["darkviolet"] = "9400d3";
    CSSColors["deeppink"] = "ff1493";
    CSSColors["deepskyblue"] = "00bfff";
    CSSColors["dimgray"] = "696969";
    CSSColors["dimgrey"] = "696969";
    CSSColors["dodgerblue"] = "1e90ff";
    CSSColors["firebrick"] = "b22222";
    CSSColors["floralwhite"] = "fffaf0";
    CSSColors["forestgreen"] = "228b22";
    CSSColors["fuchsia"] = "ff00ff";
    CSSColors["gainsboro"] = "dcdcdc";
    CSSColors["ghostwhite"] = "f8f8ff";
    CSSColors["gold"] = "ffd700";
    CSSColors["goldenrod"] = "daa520";
    CSSColors["gray"] = "808080";
    CSSColors["grey"] = "808080";
    CSSColors["green"] = "008000";
    CSSColors["greenyellow"] = "adff2f";
    CSSColors["honeydew"] = "f0fff0";
    CSSColors["hotpink"] = "ff69b4";
    CSSColors["indianred"] = "cd5c5c";
    CSSColors["indigo"] = "4b0082";
    CSSColors["ivory"] = "fffff0";
    CSSColors["khaki"] = "f0e68c";
    CSSColors["lavender"] = "e6e6fa";
    CSSColors["lavenderblush"] = "fff0f5";
    CSSColors["lawngreen"] = "7cfc00";
    CSSColors["lemonchiffon"] = "fffacd";
    CSSColors["lightblue"] = "add8e6";
    CSSColors["lightcoral"] = "f08080";
    CSSColors["lightcyan"] = "e0ffff";
    CSSColors["lightgoldenrodyellow"] = "fafad2";
    CSSColors["lightgray"] = "d3d3d3";
    CSSColors["lightgrey"] = "d3d3d3";
    CSSColors["lightgreen"] = "90ee90";
    CSSColors["lightpink"] = "ffb6c1";
    CSSColors["lightsalmon"] = "ffa07a";
    CSSColors["lightseagreen"] = "20b2aa";
    CSSColors["lightskyblue"] = "87cefa";
    CSSColors["lightslategray"] = "778899";
    CSSColors["lightslategrey"] = "778899";
    CSSColors["lightsteelblue"] = "b0c4de";
    CSSColors["lightyellow"] = "ffffe0";
    CSSColors["lime"] = "00ff00";
    CSSColors["limegreen"] = "32cd32";
    CSSColors["linen"] = "faf0e6";
    CSSColors["magenta"] = "ff00ff";
    CSSColors["maroon"] = "800000";
    CSSColors["mediumaquamarine"] = "66cdaa";
    CSSColors["mediumblue"] = "0000cd";
    CSSColors["mediumorchid"] = "ba55d3";
    CSSColors["mediumpurple"] = "9370db";
    CSSColors["mediumseagreen"] = "3cb371";
    CSSColors["mediumslateblue"] = "7b68ee";
    CSSColors["mediumspringgreen"] = "00fa9a";
    CSSColors["mediumturquoise"] = "48d1cc";
    CSSColors["mediumvioletred"] = "c71585";
    CSSColors["midnightblue"] = "191970";
    CSSColors["mintcream"] = "f5fffa";
    CSSColors["mistyrose"] = "ffe4e1";
    CSSColors["moccasin"] = "ffe4b5";
    CSSColors["navajowhite"] = "ffdead";
    CSSColors["navy"] = "000080";
    CSSColors["oldlace"] = "fdf5e6";
    CSSColors["olive"] = "808000";
    CSSColors["olivedrab"] = "6b8e23";
    CSSColors["orange"] = "ffa500";
    CSSColors["orangered"] = "ff4500";
    CSSColors["orchid"] = "da70d6";
    CSSColors["palegoldenrod"] = "eee8aa";
    CSSColors["palegreen"] = "98fb98";
    CSSColors["paleturquoise"] = "afeeee";
    CSSColors["palevioletred"] = "db7093";
    CSSColors["papayawhip"] = "ffefd5";
    CSSColors["peachpuff"] = "ffdab9";
    CSSColors["peru"] = "cd853f";
    CSSColors["pink"] = "ffc0cb";
    CSSColors["plum"] = "dda0dd";
    CSSColors["powderblue"] = "b0e0e6";
    CSSColors["purple"] = "800080";
    CSSColors["red"] = "ff0000";
    CSSColors["rosybrown"] = "bc8f8f";
    CSSColors["royalblue"] = "4169e1";
    CSSColors["saddlebrown"] = "8b4513";
    CSSColors["salmon"] = "fa8072";
    CSSColors["sandybrown"] = "f4a460";
    CSSColors["seagreen"] = "2e8b57";
    CSSColors["seashell"] = "fff5ee";
    CSSColors["sienna"] = "a0522d";
    CSSColors["silver"] = "c0c0c0";
    CSSColors["skyblue"] = "87ceeb";
    CSSColors["slateblue"] = "6a5acd";
    CSSColors["slategray"] = "708090";
    CSSColors["slategrey"] = "708090";
    CSSColors["snow"] = "fffafa";
    CSSColors["springgreen"] = "00ff7f";
    CSSColors["steelblue"] = "4682b4";
    CSSColors["tan"] = "d2b48c";
    CSSColors["teal"] = "008080";
    CSSColors["thistle"] = "d8bfd8";
    CSSColors["tomato"] = "ff6347";
    CSSColors["turquoise"] = "40e0d0";
    CSSColors["violet"] = "ee82ee";
    CSSColors["wheat"] = "f5deb3";
    CSSColors["white"] = "ffffff";
    CSSColors["whitesmoke"] = "f5f5f5";
    CSSColors["yellow"] = "ffff00";
    CSSColors["yellowgreen"] = "9acd32";
    CSSColors["transparent"] = "00000000";
  })(CSSColors || (CSSColors = {}));
  const getRGBColor = color => {
    if (color.startsWith("rgba")) {
      return RGBAToRGB(color);
    }
    if (color.startsWith("rgb")) {
      return RGBStringToRGBObject(color);
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
    if (color in CSSColors) {
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
  const RGBStringToRGBObject = color => {
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
  _exports.RGBStringToRGBObject = RGBStringToRGBObject;
  const HSLToRGB = color => {
    // Formula taken from https://www.rapidtables.com/convert/color/hsl-to-rgb.html
    const C = (1 - Math.abs(2 * color.l - 1)) * color.s,
      X = C * (1 - Math.abs(color.h / 60 % 2 - 1)),
      m = color.l - C / 2;
    let tempColor;
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
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16)
    };
  };
  /**
   * Returns the hex value of the color as string
   * @param {Object} color Receives an object with the properties for each of the main colors(r, g, b)
   */
  _exports.HEXToRGB = HEXToRGB;
  const RGBtoHEX = color => {
    const hexMap = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E"];
    let hexValue = "#";
    let divisionNumber = color.r / 16;
    let remainder = color.r % 16;
    hexValue += String(hexMap[Math.floor(divisionNumber)]);
    hexValue += String(hexMap[remainder]);
    divisionNumber = color.g / 16;
    remainder = color.g % 16;
    hexValue += String(hexMap[Math.floor(divisionNumber)]);
    hexValue += String(hexMap[remainder]);
    divisionNumber = color.b / 16;
    remainder = color.b % 16;
    hexValue += String(hexMap[Math.floor(divisionNumber)]);
    hexValue += String(hexMap[remainder]);
    return hexValue;
  };
  _exports.RGBtoHEX = RGBtoHEX;
  const RGBToHSL = color => {
    const R = color.r / 255,
      G = color.g / 255,
      B = color.b / 255,
      max = Math.max(R, G, B),
      min = Math.min(R, G, B),
      delta = max - min;
    let h = 0,
      s;
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