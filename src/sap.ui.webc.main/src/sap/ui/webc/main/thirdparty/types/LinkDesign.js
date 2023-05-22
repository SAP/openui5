sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different link designs.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.LinkDesign
   */
  var LinkDesign;
  (function (LinkDesign) {
    /**
     * default type (no special styling)
     * @public
     * @type {Default}
     */
    LinkDesign["Default"] = "Default";
    /**
     * subtle type (appears as regular text, rather than a link)
     * @public
     * @type {Subtle}
     */
    LinkDesign["Subtle"] = "Subtle";
    /**
     * emphasized type
     * @public
     * @type {Emphasized}
     */
    LinkDesign["Emphasized"] = "Emphasized";
  })(LinkDesign || (LinkDesign = {}));
  var _default = LinkDesign;
  _exports.default = _default;
});