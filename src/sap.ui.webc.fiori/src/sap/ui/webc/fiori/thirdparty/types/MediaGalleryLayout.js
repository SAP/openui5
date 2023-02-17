sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @lends sap.ui.webcomponents.fiori.types.MediaGalleryLayout.prototype
   * @public
   */
  const MediaGalleryLayouts = {
    /**
     * The layout is determined automatically.
     * @public
     * @type {Auto}
     */
    Auto: "Auto",
    /**
     * Displays the layout as a vertical split between the thumbnails list and the selected image.
     * @public
     * @type {Vertical}
     */
    Vertical: "Vertical",
    /**
     * Displays the layout as a horizontal split between the thumbnails list and the selected image.
     * @public
     * @type {Horizontal}
     */
    Horizontal: "Horizontal"
  };

  /**
   * @class
   * Defines the layout type of the thumbnails list of the <code>ui5-media-gallery</code> component.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.types.MediaGalleryLayout
   * @public
   * @enum {string}
   */
  class MediaGalleryLayout extends _DataType.default {
    static isValid(value) {
      return !!MediaGalleryLayouts[value];
    }
  }
  MediaGalleryLayout.generateTypeAccessors(MediaGalleryLayouts);
  var _default = MediaGalleryLayout;
  _exports.default = _default;
});