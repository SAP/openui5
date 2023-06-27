sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Enumeration for different mode behaviors of the InvisibleMessage.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.base.types.InvisibleMessageMode
   */
  var InvisibleMessageMode;
  (function (InvisibleMessageMode) {
    /**
     * Indicates that updates to the region should be presented at the next graceful opportunity,
     * such as at the end of reading the current sentence, or when the user pauses typing.
     * @public
     * @type {Polite}
     */
    InvisibleMessageMode["Polite"] = "Polite";
    /**
     * Indicates that updates to the region have the highest priority and should be presented to the user immediately.
     * @public
     * @type {Assertive}
     */
    InvisibleMessageMode["Assertive"] = "Assertive";
  })(InvisibleMessageMode || (InvisibleMessageMode = {}));
  var _default = InvisibleMessageMode;
  _exports.default = _default;
});