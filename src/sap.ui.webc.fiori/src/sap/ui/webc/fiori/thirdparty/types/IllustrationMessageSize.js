sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * Different types of IllustrationMessageSize.
   * @lends sap.ui.webcomponents.fiori.types.IllustrationMessageSize.prototype
   * @public
   * @since 1.5.0
   */
  const IllustrationMessageSizes = {
    /**
     * Automatically decides the <code>Illustration</code> size (<code>Base</code>, <code>Spot</code>,
     * <code>Dialog</code>, or <code>Scene</code>) depending on the <code>IllustratedMessage</code> container width.
     *
     * <b>Note:</b> <code>Auto</code> is the only option where the illustration size is changed according to
     * the available container width. If any other <code>IllustratedMessageSize</code> is chosen, it remains
     * until changed by the app developer.
     *
     * @public
     */
    Auto: "Auto",
    /**
     * Base <code>Illustration</code> size (XS breakpoint). Suitable for cards (two columns).
     *
     * <b>Note:</b> When <code>Base</code> is in use, no illustration is displayed.
     *
     * @public
     */
    Base: "Base",
    /**
     * Spot <code>Illustration</code> size (S breakpoint). Suitable for cards (four columns).
     * @public
     */
    Spot: "Spot",
    /**
     * Dialog <code>Illustration</code> size (M breakpoint). Suitable for dialogs.
     * @public
     */
    Dialog: "Dialog",
    /**
     * Scene <code>Illustration</code> size (L breakpoint). Suitable for a <code>Page</code> or a table.
     * @public
     */
    Scene: "Scene"
  };

  /**
   * @class
   * Different types of IllustrationMessageSize.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.types.IllustrationMessageSize
   * @public
   * @enum {string}
   */
  class IllustrationMessageSize extends _DataType.default {
    static isValid(value) {
      return !!IllustrationMessageSizes[value];
    }
  }
  IllustrationMessageSize.generateTypeAccessors(IllustrationMessageSizes);
  var _default = IllustrationMessageSize;
  _exports.default = _default;
});