sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Toast placement.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.ToastPlacement
   */
  var ToastPlacement;
  (function (ToastPlacement) {
    /**
     * Toast is placed at the <code>TopStart</code> position of its container.
     * @public
     * @type {TopStart}
     */
    ToastPlacement["TopStart"] = "TopStart";
    /**
     * Toast is placed at the <code>TopCenter</code> position of its container.
     * @public
     * @type {TopCenter}
     */
    ToastPlacement["TopCenter"] = "TopCenter";
    /**
     * Toast is placed at the <code>TopEnd</code> position of its container.
     * @public
     * @type {TopEnd}
     */
    ToastPlacement["TopEnd"] = "TopEnd";
    /**
     * Toast is placed at the <code>MiddleStart</code> position of its container.
     * @public
     * @type {MiddleStart}
     */
    ToastPlacement["MiddleStart"] = "MiddleStart";
    /**
     * Toast is placed at the <code>MiddleCenter</code> position of its container.
     * @public
     * @type {MiddleCenter}
     */
    ToastPlacement["MiddleCenter"] = "MiddleCenter";
    /**
     * Toast is placed at the <code>MiddleEnd</code> position of its container.
     * @public
     * @type {MiddleEnd}
     */
    ToastPlacement["MiddleEnd"] = "MiddleEnd";
    /**
     * Toast is placed at the <code>BottomStart</code> position of its container.
     * @public
     * @type {BottomStart}
     */
    ToastPlacement["BottomStart"] = "BottomStart";
    /**
     * Toast is placed at the <code>BottomCenter</code> position of its container.
     * Default placement (no selection)
     * @public
     * @type {BottomCenter}
     */
    ToastPlacement["BottomCenter"] = "BottomCenter";
    /**
     * Toast is placed at the <code>BottomEnd</code> position of its container.
     * @public
     * @type {BottomEnd}
     */
    ToastPlacement["BottomEnd"] = "BottomEnd";
  })(ToastPlacement || (ToastPlacement = {}));
  var _default = ToastPlacement;
  _exports.default = _default;
});