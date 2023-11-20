sap.ui.define(["exports", "../config/RTL"], function (_exports, _RTL) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const GLOBAL_DIR_CSS_VAR = "--_ui5_dir";
  const getEffectiveDir = element => {
    const doc = window.document;
    const dirValues = ["ltr", "rtl"]; // exclude "auto" and "" from all calculations
    const locallyAppliedDir = getComputedStyle(element).getPropertyValue(GLOBAL_DIR_CSS_VAR);
    // In that order, inspect the CSS Var (for modern browsers), the element itself, html and body (for IE fallback)
    if (dirValues.includes(locallyAppliedDir)) {
      return locallyAppliedDir;
    }
    if (dirValues.includes(element.dir)) {
      return element.dir;
    }
    if (dirValues.includes(doc.documentElement.dir)) {
      return doc.documentElement.dir;
    }
    if (dirValues.includes(doc.body.dir)) {
      return doc.body.dir;
    }
    // Finally, check the configuration for explicitly set RTL or language-implied RTL
    return (0, _RTL.getRTL)() ? "rtl" : undefined;
  };
  var _default = getEffectiveDir;
  _exports.default = _default;
});