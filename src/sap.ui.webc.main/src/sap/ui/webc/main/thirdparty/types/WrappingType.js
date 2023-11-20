sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different types of wrapping.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.WrappingType
   */
  var WrappingType;
  (function (WrappingType) {
    /**
     * The text will be truncated with an ellipsis.
     * @public
     * @type {None}
     */
    WrappingType["None"] = "None";
    /**
     * The text will wrap. The words will not be broken based on hyphenation.
     * @public
     * @type {Normal}
     */
    WrappingType["Normal"] = "Normal";
  })(WrappingType || (WrappingType = {}));
  var _default = WrappingType;
  _exports.default = _default;
});