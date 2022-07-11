sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * Different types of Priority.
   * @lends sap.ui.webcomponents.main.types.Priority.prototype
   * @public
   */
  const Priorities = {
    /**
     * High priority.
     * @public
     * @type {High}
     */
    High: "High",

    /**
     * Medium priority.
     * @public
     * @type {Medium}
     */
    Medium: "Medium",

    /**
     * Low priority.
     * @public
     * @type {Low}
     */
    Low: "Low",

    /**
     * Default, none priority.
     * @public
     * @type {None}
     */
    None: "None"
  };
  /**
   * @class
   * Different types of Priority.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.Priority
   * @public
   * @enum {string}
   */

  class Priority extends _DataType.default {
    static isValid(value) {
      return !!Priorities[value];
    }

  }

  Priority.generateTypeAccessors(Priorities);
  var _default = Priority;
  _exports.default = _default;
});