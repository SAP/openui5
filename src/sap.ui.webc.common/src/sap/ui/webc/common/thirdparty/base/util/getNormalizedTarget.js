sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Returns the normalized event target in cases when it has shadow root.
   * @param {Object} target The original event target
   * @returns {Object} The normalized target
   */
  const getNormalizedTarget = target => {
    let element = target;
    if (target.shadowRoot && target.shadowRoot.activeElement) {
      element = target.shadowRoot.activeElement;
    }
    return element;
  };
  var _default = getNormalizedTarget;
  _exports.default = _default;
});