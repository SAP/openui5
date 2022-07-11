sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;

  const getStylesString = styles => {
    if (Array.isArray(styles)) {
      return flatten(styles.filter(style => !!style)).map(style => {
        return typeof style === "string" ? style : style.content;
      }).join(" ");
    }

    return typeof styles === "string" ? styles : styles.content;
  };

  const flatten = arr => {
    return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), []);
  };

  var _default = getStylesString;
  _exports.default = _default;
});