sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different types of Switch designs.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.SwitchDesign
   */
  var SwitchDesign;
  (function (SwitchDesign) {
    /**
     * Defines the Switch as Textual
     * @public
     * @type {Textual}
     */
    SwitchDesign["Textual"] = "Textual";
    /**
     * Defines the Switch as Graphical
     * @public
     * @type {Graphical}
     */
    SwitchDesign["Graphical"] = "Graphical";
  })(SwitchDesign || (SwitchDesign = {}));
  var _default = SwitchDesign;
  _exports.default = _default;
});