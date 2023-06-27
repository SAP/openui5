sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Available Page Background Design.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.fiori.types.PageBackgroundDesign
   */
  var PageBackgroundDesign;
  (function (PageBackgroundDesign) {
    /**
     * Page background color when a List is set as the Page content.
     *
     * @type {List}
     * @public
     */
    PageBackgroundDesign["List"] = "List";
    /**
     * A solid background color dependent on the theme.
     *
     * @type {Solid}
     * @public
     */
    PageBackgroundDesign["Solid"] = "Solid";
    /**
     * Transparent background for the page.
     *
     * @type {Transparent}
     * @public
     */
    PageBackgroundDesign["Transparent"] = "Transparent";
  })(PageBackgroundDesign || (PageBackgroundDesign = {}));
  var _default = PageBackgroundDesign;
  _exports.default = _default;
});