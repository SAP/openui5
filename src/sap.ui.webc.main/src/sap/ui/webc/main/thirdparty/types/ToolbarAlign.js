sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
  * Defines which direction the items of ui5-toolbar will be aligned.
   *
   * @readonly
   * @enum {string}
   * @public
   * @type {string}
   * @author SAP SE
   * @alias sap.ui.webc.main.types.ToolbarAlign
   */
  var ToolbarAlign;
  (function (ToolbarAlign) {
    /**
     * @public
     * @type {Start}
     * Toolbar items are situated at the <code>start</code> of the Toolbar
     */
    ToolbarAlign["Start"] = "Start";
    /**
     * @public
     * @type {End}
     * Toolbar items are situated at the <code>end</code> of the Toolbar
     */
    ToolbarAlign["End"] = "End";
  })(ToolbarAlign || (ToolbarAlign = {}));
  var _default = ToolbarAlign;
  _exports.default = _default;
});