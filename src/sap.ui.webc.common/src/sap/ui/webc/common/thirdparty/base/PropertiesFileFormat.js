sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const flatstr = typeof window.chrome === "object" || typeof window.v8 === "object" ? (s, iConcatOps) => {
    if (iConcatOps > 2 && 40 * iConcatOps > s.length) {
      Number(s);
    }
    return s;
  } : s => s;
  const rLines = /(?:\r\n|\r|\n|^)[ \t\f]*/;
  const rEscapesOrSeparator = /(\\u[0-9a-fA-F]{0,4})|(\\.)|(\\$)|([ \t\f]*[ \t\f:=][ \t\f]*)/g;
  const rEscapes = /(\\u[0-9a-fA-F]{0,4})|(\\.)|(\\$)/g;
  const mEscapes = {
    "\\f": "\f",
    "\\n": "\n",
    "\\r": "\r",
    "\\t": "\t"
  };
  /**
   * Parses a .properties format
   * @param {string} sText the contents a of a .properties file
   * @returns a object with key/value pairs parsed from the .properties file format
   * @public
   */
  const parseProperties = sText => {
    const properties = {},
      aLines = sText.split(rLines);
    let sLine, rMatcher, sKey, sValue, i, m, iLastIndex, iConcatOps;
    const append = s => {
      if (sValue) {
        sValue = `${sValue}${s}`;
        iConcatOps++;
      } else {
        sValue = s;
        iConcatOps = 0;
      }
    };
    for (i = 0; i < aLines.length; i++) {
      sLine = aLines[i];
      const skipLine = sLine === "" || sLine.charAt(0) === "#" || sLine.charAt(0) === "!";
      if (!skipLine) {
        rMatcher = rEscapesOrSeparator;
        iLastIndex = 0;
        rMatcher.lastIndex = iLastIndex;
        sKey = null;
        sValue = "";
        m = rMatcher.exec(sLine);
        while (m !== null) {
          if (iLastIndex < m.index) {
            append(sLine.slice(iLastIndex, m.index));
          }
          iLastIndex = rMatcher.lastIndex;
          if (m[1]) {
            if (m[1].length !== 6) {
              throw new Error(`Incomplete Unicode Escape '${m[1]}'`);
            }
            append(String.fromCharCode(parseInt(m[1].slice(2), 16)));
          } else if (m[2]) {
            append(mEscapes[m[2]] || m[2].slice(1));
          } else if (m[3]) {
            sLine = aLines[++i];
            iLastIndex = 0;
            rMatcher.lastIndex = iLastIndex;
          } else if (m[4]) {
            sKey = sValue;
            sValue = "";
            rMatcher = rEscapes;
            rMatcher.lastIndex = iLastIndex;
          }
          m = rMatcher.exec(sLine);
        }
        if (iLastIndex < sLine.length) {
          append(sLine.slice(iLastIndex));
        }
        if (sKey == null) {
          sKey = sValue;
          sValue = "";
        }
        properties[sKey] = flatstr(sValue, sValue ? iConcatOps : 0);
      }
    }
    return properties;
  };
  var _default = parseProperties;
  _exports.default = _default;
});