sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const GLOBAL_CONTENT_DENSITY_CSS_VAR = "--_ui5_content_density";
  const getEffectiveContentDensity = el => getComputedStyle(el).getPropertyValue(GLOBAL_CONTENT_DENSITY_CSS_VAR);
  var _default = getEffectiveContentDensity;
  _exports.default = _default;
});