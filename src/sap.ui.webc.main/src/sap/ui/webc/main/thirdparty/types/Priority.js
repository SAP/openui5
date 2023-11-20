sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different types of Priority.
   *
   * @enum {string}
   * @readonly
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.Priority
   */
  var Priority;
  (function (Priority) {
    /**
     * High priority.
     * @public
     * @type {High}
     */
    Priority["High"] = "High";
    /**
     * Medium priority.
     * @public
     * @type {Medium}
     */
    Priority["Medium"] = "Medium";
    /**
     * Low priority.
     * @public
     * @type {Low}
     */
    Priority["Low"] = "Low";
    /**
     * Default, none priority.
     * @public
     * @type {None}
     */
    Priority["None"] = "None";
  })(Priority || (Priority = {}));
  var _default = Priority;
  _exports.default = _default;
});