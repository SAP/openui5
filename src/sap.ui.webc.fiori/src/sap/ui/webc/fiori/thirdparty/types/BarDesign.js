sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @lends sap.ui.webcomponents.fiori.types.BarDesign.prototype
   * @public
   */
  const BarTypes = {
    /**
     * Default type
     * @public
     * @type {Header}
     */
    Header: "Header",

    /**
     * Subheader type
     * @public
     * @type {Subheader}
     */
    Subheader: "Subheader",

    /**
     * Footer type
     * @public
     * @type {Footer}
     */
    Footer: "Footer",

    /**
     * Floating Footer type - there is visible border on all sides
     * @public
     * @type {FloatingFooter}
     */
    FloatingFooter: "FloatingFooter"
  };
  /**
   * @class
   * Different types of Bar.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.types.BarDesign
   * @public
   * @enum {string}
   */

  class BarDesign extends _DataType.default {
    static isValid(value) {
      return !!BarTypes[value];
    }

  }

  BarDesign.generateTypeAccessors(BarTypes);
  var _default = BarDesign;
  _exports.default = _default;
});