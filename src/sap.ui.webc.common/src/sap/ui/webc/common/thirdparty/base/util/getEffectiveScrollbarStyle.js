sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const NO_SCROLLBAR_STYLE_CLASS = "ui5-content-native-scrollbars";
  const getEffectiveScrollbarStyle = () => document.body.classList.contains(NO_SCROLLBAR_STYLE_CLASS);
  var _default = getEffectiveScrollbarStyle;
  _exports.default = _default;
});