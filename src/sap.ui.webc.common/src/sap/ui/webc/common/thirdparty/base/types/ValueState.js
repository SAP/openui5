sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different types of ValueStates.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.base.types.ValueState
   */
  var ValueState;
  (function (ValueState) {
    /**
     *
     * @public
     * @type {None}
     */
    ValueState["None"] = "None";
    /**
     *
     * @public
     * @type {Success}
     */
    ValueState["Success"] = "Success";
    /**
     *
     * @public
     * @type {Warning}
     */
    ValueState["Warning"] = "Warning";
    /**
     *
     * @public
     * @type {Error}
     */
    ValueState["Error"] = "Error";
    /**
     *
     * @public
     * @type {Information}
     */
    ValueState["Information"] = "Information";
  })(ValueState || (ValueState = {}));
  var _default = ValueState;
  _exports.default = _default;
});