sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @lends sap.ui.webcomponents.fiori.types.MediaGalleryMenuVerticalAlign.prototype
   * @public
   */
  const MediaGalleryMenuVerticalAligns = {
    /**
     * Displays the menu at the top of the reference control.
     * @public
     * @type {Top}
     */
    Top: "Top",
    /**
     * Displays the menu at the bottom of the reference control.
     * @public
     * @type {Bottom}
     */
    Bottom: "Bottom"
  };

  /**
   * @class
   * Types for the vertical alignment of the thumbnails menu of the <code>ui5-media-gallery</code> component.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.types.MediaGalleryMenuVerticalAlign
   * @public
   * @enum {string}
   */
  class MediaGalleryMenuVerticalAlign extends _DataType.default {
    static isValid(value) {
      return !!MediaGalleryMenuVerticalAligns[value];
    }
  }
  MediaGalleryMenuVerticalAlign.generateTypeAccessors(MediaGalleryMenuVerticalAligns);
  var _default = MediaGalleryMenuVerticalAlign;
  _exports.default = _default;
});