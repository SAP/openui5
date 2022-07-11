sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * Available Timeline layout orientation
   * @lends sap.ui.webcomponents.fiori.types.TimelineLayout.prototype
   * @public
   */
  const Layout = {
    /**
     * Vertical layout
     * Default type
     * @public
     * @type {Vertical}
     */
    Vertical: "Vertical",

    /**
     * Horizontal layout
     * @public
     * @type {Horizontal}
     */
    Horizontal: "Horizontal"
  };
  /**
   * @class
   * Different types of Timeline.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.types.TimelineLayout
   * @public
   * @enum {string}
   */

  class TimeLineLayout extends _DataType.default {
    static isValid(value) {
      return !!Layout[value];
    }

  }

  TimeLineLayout.generateTypeAccessors(Layout);
  var _default = TimeLineLayout;
  _exports.default = _default;
});