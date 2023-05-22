sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Defines the layout of the content displayed in the <code>ui5-media-gallery-item</code>.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.fiori.types.MediaGalleryItemLayout
   */
  var MediaGalleryItemLayout;
  (function (MediaGalleryItemLayout) {
    /**
     * Recommended to use when the item contains an image.<br>
     * When a thumbnail is selected, it makes the corresponding enlarged content appear in a square display area.
     * @public
     * @type {Square}
     */
    MediaGalleryItemLayout["Square"] = "Square";
    /**
     * Recommended to use when the item contains video content.<br>
     * When a thumbnail is selected, it makes the corresponding enlarged content appear in a wide display area
     * (stretched to fill all of the available width) for optimal user experiance.
     * @public
     * @type {Wide}
     */
    MediaGalleryItemLayout["Wide"] = "Wide";
  })(MediaGalleryItemLayout || (MediaGalleryItemLayout = {}));
  var _default = MediaGalleryItemLayout;
  _exports.default = _default;
});