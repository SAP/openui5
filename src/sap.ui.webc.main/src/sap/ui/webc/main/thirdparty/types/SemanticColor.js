sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different types of SemanticColor.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.SemanticColor
   */
  var SemanticColor;
  (function (SemanticColor) {
    /**
     * Default color (brand color)
     * @public
     * @type {Default}
     */
    SemanticColor["Default"] = "Default";
    /**
     * Positive color
     * @public
     * @type {Positive}
     */
    SemanticColor["Positive"] = "Positive";
    /**
     * Negative color
     * @public
     * @type {Negative}
     */
    SemanticColor["Negative"] = "Negative";
    /**
     * Critical color
     * @public
     * @type {Critical}
     */
    SemanticColor["Critical"] = "Critical";
    /**
     * Neutral color.
     * @public
     * @type {Neutral}
     */
    SemanticColor["Neutral"] = "Neutral";
  })(SemanticColor || (SemanticColor = {}));
  var _default = SemanticColor;
  _exports.default = _default;
});