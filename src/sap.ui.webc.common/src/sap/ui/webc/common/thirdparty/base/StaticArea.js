sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  class StaticArea extends HTMLElement {}
  if (!customElements.get("ui5-static-area")) {
    customElements.define("ui5-static-area", StaticArea);
  }
  var _default = StaticArea;
  _exports.default = _default;
});