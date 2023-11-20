sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Defines the layout type of the thumbnails list of the <code>ui5-media-gallery</code> component.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.fiori.types.MediaGalleryLayout
   */
  var MediaGalleryLayout;
  (function (MediaGalleryLayout) {
    /**
     * The layout is determined automatically.
     * @public
     * @type {Auto}
     */
    MediaGalleryLayout["Auto"] = "Auto";
    /**
     * Displays the layout as a vertical split between the thumbnails list and the selected image.
     * @public
     * @type {Vertical}
     */
    MediaGalleryLayout["Vertical"] = "Vertical";
    /**
     * Displays the layout as a horizontal split between the thumbnails list and the selected image.
     * @public
     * @type {Horizontal}
     */
    MediaGalleryLayout["Horizontal"] = "Horizontal";
  })(MediaGalleryLayout || (MediaGalleryLayout = {}));
  var _default = MediaGalleryLayout;
  _exports.default = _default;
});