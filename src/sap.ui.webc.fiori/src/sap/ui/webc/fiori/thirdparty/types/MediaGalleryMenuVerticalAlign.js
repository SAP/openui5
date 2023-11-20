sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Types for the vertical alignment of the thumbnails menu of the <code>ui5-media-gallery</code> component.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.fiori.types.MediaGalleryMenuVerticalAlign
   */
  var MediaGalleryMenuVerticalAlign;
  (function (MediaGalleryMenuVerticalAlign) {
    /**
     * Displays the menu at the top of the reference control.
     * @public
     * @type {Top}
     */
    MediaGalleryMenuVerticalAlign["Top"] = "Top";
    /**
     * Displays the menu at the bottom of the reference control.
     * @public
     * @type {Bottom}
     */
    MediaGalleryMenuVerticalAlign["Bottom"] = "Bottom";
  })(MediaGalleryMenuVerticalAlign || (MediaGalleryMenuVerticalAlign = {}));
  var _default = MediaGalleryMenuVerticalAlign;
  _exports.default = _default;
});