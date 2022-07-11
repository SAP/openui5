sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @lends sap.ui.webcomponents.main.types.BusyIndicatorSize.prototype
   * @public
   */
  const BusyIndicatorSizes = {
    /**
     * small size
     * @public
     * @type {Small}
     */
    Small: "Small",

    /**
     * medium size
     * @public
     * @type {Medium}
     */
    Medium: "Medium",

    /**
     * large size
     * @public
     * @type {Large}
     */
    Large: "Large"
  };
  /**
   * @class
   * Different types of BusyIndicator.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.BusyIndicatorSize
   * @public
   * @enum {string}
   */

  class BusyIndicatorSize extends _DataType.default {
    static isValid(value) {
      return !!BusyIndicatorSizes[value];
    }

  }

  BusyIndicatorSize.generateTypeAccessors(BusyIndicatorSizes);
  var _default = BusyIndicatorSize;
  _exports.default = _default;
});