sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Defines the horizontal alignment of the thumbnails menu of the <code>ui5-media-gallery</code> component.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.fiori.types.MediaGalleryMenuHorizontalAlign
   */
  var MediaGalleryMenuHorizontalAlign;
  (function (MediaGalleryMenuHorizontalAlign) {
    /**
     * Displays the menu on the left side of the target.
     * @public
     * @type {Left}
     */
    MediaGalleryMenuHorizontalAlign["Left"] = "Left";
    /**
     * Displays the menu on the right side of the target.
     * @public
     * @type {Right}
     */
    MediaGalleryMenuHorizontalAlign["Right"] = "Right";
  })(MediaGalleryMenuHorizontalAlign || (MediaGalleryMenuHorizontalAlign = {}));
  var _default = MediaGalleryMenuHorizontalAlign;
  _exports.default = _default;
});