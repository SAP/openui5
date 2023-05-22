sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Defines background designs.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.BackgroundDesign
   */
  var BackgroundDesign;
  (function (BackgroundDesign) {
    /**
     * A solid background color dependent on the theme.
     * @public
     * @type {Solid}
     */
    BackgroundDesign["Solid"] = "Solid";
    /**
     * Transparent background.
     * @public
     * @type {Transparent}
     */
    BackgroundDesign["Transparent"] = "Transparent";
    /**
     * A translucent background depending on the opacity value of the theme.
     * @public
     * @type {Translucent}
     */
    BackgroundDesign["Translucent"] = "Translucent";
  })(BackgroundDesign || (BackgroundDesign = {}));
  var _default = BackgroundDesign;
  _exports.default = _default;
});