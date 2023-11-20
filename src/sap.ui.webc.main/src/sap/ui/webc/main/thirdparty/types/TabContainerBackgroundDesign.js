sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Background design for the header and content of TabContainer.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.TabContainerBackgroundDesign
   */
  var TabContainerBackgroundDesign;
  (function (TabContainerBackgroundDesign) {
    /**
     * A Solid background color.
     * @public
     * @type {Solid}
     */
    TabContainerBackgroundDesign["Solid"] = "Solid";
    /**
     * A Transparent background color.
     * @public
     * @type {Transparent}
     */
    TabContainerBackgroundDesign["Transparent"] = "Transparent";
    /**
     * A Translucent background color.
     * @public
     * @type {Translucent}
     */
    TabContainerBackgroundDesign["Translucent"] = "Translucent";
  })(TabContainerBackgroundDesign || (TabContainerBackgroundDesign = {}));
  var _default = TabContainerBackgroundDesign;
  _exports.default = _default;
});