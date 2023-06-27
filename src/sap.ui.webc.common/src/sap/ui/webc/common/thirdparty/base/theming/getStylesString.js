sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const MAX_DEPTH_INHERITED_CLASSES = 10; // TypeScript complains about Infinity and big numbers
  const getStylesString = styles => {
    if (Array.isArray(styles)) {
      return styles.filter(style => !!style).flat(MAX_DEPTH_INHERITED_CLASSES).map(style => {
        return typeof style === "string" ? style : style.content;
      }).join(" ");
    }
    return typeof styles === "string" ? styles : styles.content;
  };
  var _default = getStylesString;
  _exports.default = _default;
});