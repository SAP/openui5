sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different Icon semantic designs.
  *
  * @readonly
  * @enum {string}
  * @public
  * @author SAP SE
  * @alias sap.ui.webc.main.types.IconDesign
  */
  var IconDesign;
  (function (IconDesign) {
    /**
     * Contrast design
     * @public
     * @type {Contrast}
     */
    IconDesign["Contrast"] = "Contrast";
    /**
     * Critical design
     * @public
     * @type {Critical}
     */
    IconDesign["Critical"] = "Critical";
    /**
     * Default design (brand design)
     * @public
     * @type {Default}
    */
    IconDesign["Default"] = "Default";
    /**
     * info type
     * @public
     * @type {Information}
     */
    IconDesign["Information"] = "Information";
    /**
     * Negative design
     * @public
     * @type {Negative}
     */
    IconDesign["Negative"] = "Negative";
    /**
     * Neutral design
     * @public
     * @type {Neutral}
     */
    IconDesign["Neutral"] = "Neutral";
    /**
     * Design that indicates an icon which isn't interactive
     * @public
     * @type {NonInteractive}
     */
    IconDesign["NonInteractive"] = "NonInteractive";
    /**
     * Positive design
     * @public
     * @type {Positive}
     */
    IconDesign["Positive"] = "Positive";
  })(IconDesign || (IconDesign = {}));
  var _default = IconDesign;
  _exports.default = _default;
});