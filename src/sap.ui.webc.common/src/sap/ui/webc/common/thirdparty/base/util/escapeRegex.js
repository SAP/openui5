sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Escapes a regular expression text so that it can be used in a regular expression.
   *
   * @param { string } text the string to be interpreted literally
   * @returns { string } the escaped string
   */
  const escapeRegex = text => {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };
  var _default = escapeRegex;
  _exports.default = _default;
});