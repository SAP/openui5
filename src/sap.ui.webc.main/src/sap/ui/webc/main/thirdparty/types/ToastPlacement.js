sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @lends sap.ui.webcomponents.main.types.ToastPlacement.prototype
   * @public
   */
  const ToastPlacements = {
    /**
     * <code>ui5-toast</code> is placed at the <code>TopStart</code> position of its container.
     * @public
     * @type {TopStart}
     */
    TopStart: "TopStart",
    /**
     * <code>ui5-toast</code> is placed at the <code>TopCenter</code> position of its container.
     * @public
     * @type {TopCenter}
     */
    TopCenter: "TopCenter",
    /**
     * <code>ui5-toast</code> is placed at the <code>TopEnd</code> position of its container.
     * @public
     * @type {TopEnd}
     */
    TopEnd: "TopEnd",
    /**
     * <code>ui5-toast</code> is placed at the <code>MiddleStart</code> position of its container.
     * @public
     * @type {MiddleStart}
     */
    MiddleStart: "MiddleStart",
    /**
     * <code>ui5-toast</code> is placed at the <code>MiddleCenter</code> position of its container.
     * @public
     * @type {MiddleCenter}
     */
    MiddleCenter: "MiddleCenter",
    /**
     * <code>ui5-toast</code> is placed at the <code>MiddleEnd</code> position of its container.
     * @public
     * @type {MiddleEnd}
     */
    MiddleEnd: "MiddleEnd",
    /**
     * <code>ui5-toast</code> is placed at the <code>BottomStart</code> position of its container.
     * @public
     * @type {BottomStart}
     */
    BottomStart: "BottomStart",
    /**
     * <code>ui5-toast</code> is placed at the <code>BottomCenter</code> position of its container.
     * Default placement (no selection)
     * @public
     * @type {BottomCenter}
     */
    BottomCenter: "BottomCenter",
    /**
     * <code>ui5-toast</code> is placed at the <code>BottomEnd</code> position of its container.
     * @public
     * @type {BottomEnd}
     */
    BottomEnd: "BottomEnd"
  };

  /**
   * @class
   * Defines where the <code>ui5-toast</code> will be placed.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.ToastPlacement
   * @public
   * @enum {string}
   */
  class ToastPlacement extends _DataType.default {
    static isValid(value) {
      return !!ToastPlacements[value];
    }
  }
  ToastPlacement.generateTypeAccessors(ToastPlacements);
  var _default = ToastPlacement;
  _exports.default = _default;
});