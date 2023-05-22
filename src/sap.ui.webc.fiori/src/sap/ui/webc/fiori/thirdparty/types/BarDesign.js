sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different types of Bar design
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.fiori.types.BarDesign
   */
  var BarDesign;
  (function (BarDesign) {
    /**
     * Default type
     * @public
     * @type {Header}
     */
    BarDesign["Header"] = "Header";
    /**
     * Subheader type
     * @public
     * @type {Subheader}
     */
    BarDesign["Subheader"] = "Subheader";
    /**
     * Footer type
     * @public
     * @type {Footer}
     */
    BarDesign["Footer"] = "Footer";
    /**
     * Floating Footer type - there is visible border on all sides
     * @public
     * @type {FloatingFooter}
     */
    BarDesign["FloatingFooter"] = "FloatingFooter";
  })(BarDesign || (BarDesign = {}));
  var _default = BarDesign;
  _exports.default = _default;
});