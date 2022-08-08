sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @lends sap.ui.webcomponents.main.types.BreadcrumbsSeparatorStyle.prototype
   * @public
   */
  const SeparatorTypes = {
    /**
     * The separator appears as "/".
     * @public
     * @type {Slash}
     */
    Slash: "Slash",

    /**
     * The separator appears as "\".
     * @public
     * @type {BackSlash}
     */
    BackSlash: "BackSlash",

    /**
     * The separator appears as "\\".
     * @public
     * @type {DoubleBackSlash}
     */
    DoubleBackSlash: "DoubleBackSlash",

    /**
     * The separator appears as ">>".
     * @public
     * @type {DoubleGreaterThan}
     */
    DoubleGreaterThan: "DoubleGreaterThan",

    /**
     * The separator appears as "//".
     * @public
     * @type {DoubleSlash}
     */
    DoubleSlash: "DoubleSlash",

    /**
     * The separator appears as ">".
     * @public
     * @type {GreaterThan}
     */
    GreaterThan: "GreaterThan"
  };
  /**
   * @class
   * Different types of <code>Breadcrumbs</code> separator.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.BreadcrumbsSeparatorStyle
   * @public
   * @enum {string}
   */

  class BreadcrumbsSeparatorStyle extends _DataType.default {
    static isValid(value) {
      return !!SeparatorTypes[value];
    }

  }

  BreadcrumbsSeparatorStyle.generateTypeAccessors(SeparatorTypes);
  var _default = BreadcrumbsSeparatorStyle;
  _exports.default = _default;
});