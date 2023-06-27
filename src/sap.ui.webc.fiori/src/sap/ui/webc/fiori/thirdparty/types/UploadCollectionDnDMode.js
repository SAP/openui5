sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different drag and drop overlay modes of UploadCollection.
   *
   * @readonly
   * @enum {string}
   * @private
   * @author SAP SE
   * @alias sap.ui.webc.fiori.types.UploadCollectionDnDOverlayMode
   */
  var UploadCollectionDnDOverlayMode;
  (function (UploadCollectionDnDOverlayMode) {
    /**
     * No drag or drop indication.
     * @private
     * @type {None}
     */
    UploadCollectionDnDOverlayMode["None"] = "None";
    /**
     * Indication that drag can be performed.
     * @private
     * @type {Drag}
     */
    UploadCollectionDnDOverlayMode["Drag"] = "Drag";
    /**
     * Indication that drop can be performed.
     * @private
     * @type {Drop}
     */
    UploadCollectionDnDOverlayMode["Drop"] = "Drop";
  })(UploadCollectionDnDOverlayMode || (UploadCollectionDnDOverlayMode = {}));
  var _default = UploadCollectionDnDOverlayMode;
  _exports.default = _default;
});