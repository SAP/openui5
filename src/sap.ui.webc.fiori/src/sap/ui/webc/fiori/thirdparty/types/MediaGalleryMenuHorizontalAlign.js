sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @lends sap.ui.webcomponents.fiori.types.MediaGalleryMenuHorizontalAlign.prototype
   * @public
   */
  const MediaGalleryMenuHorizontalAligns = {
    /**
     * Displays the menu on the left side of the target.
     * @public
     * @type {Left}
     */
    Left: "Left",

    /**
     * Displays the menu on the right side of the target.
     * @public
     * @type {Right}
     */
    Right: "Right"
  };
  /**
   * @class
   * Defines the horizontal alignment of the thumbnails menu of the <code>ui5-media-gallery</code> component.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.types.MediaGalleryMenuHorizontalAlign
   * @public
   * @enum {string}
   */

  class MediaGalleryMenuHorizontalAlign extends _DataType.default {
    static isValid(value) {
      return !!MediaGalleryMenuHorizontalAligns[value];
    }

  }

  MediaGalleryMenuHorizontalAlign.generateTypeAccessors(MediaGalleryMenuHorizontalAligns);
  var _default = MediaGalleryMenuHorizontalAlign;
  _exports.default = _default;
});