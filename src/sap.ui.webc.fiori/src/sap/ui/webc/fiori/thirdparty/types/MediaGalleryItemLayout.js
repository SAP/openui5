sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @lends sap.ui.webcomponents.fiori.types.MediaGalleryItemLayout.prototype
   * @public
   */
  const MediaGalleryItemLayouts = {
    /**
     * Recommended to use when the item contains an image.<br>
     * When a thumbnail is selected, it makes the corresponding enlarged content appear in a square display area.
     * @public
     * @type {Square}
     */
    Square: "Square",

    /**
     * Recommended to use when the item contains video content.<br>
     * When a thumbnail is selected, it makes the corresponding enlarged content appear in a wide display area
     * (stretched to fill all of the available width) for optimal user experiance.
     * @public
     * @type {Wide}
     */
    Wide: "Wide"
  };
  /**
   * @class
   * Defines the layout of the content displayed in the <code>ui5-media-gallery-item</code>.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.types.MediaGalleryItemLayout
   * @public
   * @enum {string}
   */

  class MediaGalleryItemLayout extends _DataType.default {
    static isValid(value) {
      return !!MediaGalleryItemLayouts[value];
    }

  }

  MediaGalleryItemLayout.generateTypeAccessors(MediaGalleryItemLayouts);
  var _default = MediaGalleryItemLayout;
  _exports.default = _default;
});