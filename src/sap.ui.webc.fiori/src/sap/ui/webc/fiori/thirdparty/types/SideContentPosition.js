sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @lends sap.ui.webcomponents.fiori.types.SideContentPosition.prototype
   * @public
   */
  const SideContentPositionTypes = {
    /**
     * The side content is on the right side of the main container
     * in left-to-right mode and on the left side in right-to-left mode.
     * @public
     * @type {End}
     */
    End: "End",

    /**
     * The side content is on the left side of the main container
     * in left-to-right mode and on the right side in right-to-left mode.
     * @public
     * @type {Start}
     */
    Start: "Start"
  };
  /**
   * @class
   * Side Content position options.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.types.SideContentPosition
   * @public
   * @enum {string}
   */

  class SideContentPosition extends _DataType.default {
    static isValid(value) {
      return !!SideContentPositionTypes[value];
    }

  }

  SideContentPosition.generateTypeAccessors(SideContentPositionTypes);
  var _default = SideContentPosition;
  _exports.default = _default;
});