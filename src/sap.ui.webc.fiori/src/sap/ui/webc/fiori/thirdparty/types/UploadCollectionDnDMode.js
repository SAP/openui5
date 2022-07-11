sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * Different drag and drop overlay modes of UploadCollection.
   *
   * @lends sap.ui.webcomponents.fiori.types.UploadCollectionDnDOverlayMode.prototype
   * @private
   */
  const DndOverlayModes = {
    /**
     * No drag or drop indication.
     * @private
     * @type {None}
     */
    None: "None",

    /**
     * Indication that drag can be performed.
     * @private
     * @type {Drag}
     */
    Drag: "Drag",

    /**
     * Indication that drop can be performed.
     * @private
     * @type {Drop}
     */
    Drop: "Drop"
  };
  /**
   * @class
   * Different types of drag and drop overlay modes.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.types.UploadCollectionDnDOverlayMode
   * @private
   * @enum {string}
   */

  class UploadCollectionDnDOverlayMode extends _DataType.default {
    static isValid(value) {
      return !!DndOverlayModes[value];
    }

  }

  UploadCollectionDnDOverlayMode.generateTypeAccessors(DndOverlayModes);
  var _default = UploadCollectionDnDOverlayMode;
  _exports.default = _default;
});