sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Defines border designs.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.BorderDesign
   */
  var BorderDesign;
  (function (BorderDesign) {
    /**
     * A solid border color dependent on the theme.
     * @public
     * @type {Solid}
     */
    BorderDesign["Solid"] = "Solid";
    /**
     * Specifies no border.
     * @public
     * @type {Transparent}
     */
    BorderDesign["None"] = "None";
  })(BorderDesign || (BorderDesign = {}));
  var _default = BorderDesign;
  _exports.default = _default;
});