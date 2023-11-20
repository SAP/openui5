sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different types of Title level.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.TitleLevel
   */
  var TitleLevel;
  (function (TitleLevel) {
    /**
     * Renders <code>h1</code> tag.
     * @public
     * @type {H1}
     */
    TitleLevel["H1"] = "H1";
    /**
     * Renders <code>h2</code> tag.
     * @public
     * @type {H2}
     */
    TitleLevel["H2"] = "H2";
    /**
     * Renders <code>h3</code> tag.
     * @public
     * @type {H3}
     */
    TitleLevel["H3"] = "H3";
    /**
     * Renders <code>h4</code> tag.
     * @public
     * @type {H4}
     */
    TitleLevel["H4"] = "H4";
    /**
     * Renders <code>h5</code> tag.
     * @public
     * @type {H5}
     */
    TitleLevel["H5"] = "H5";
    /**
     * Renders <code>h6</code> tag.
     * @public
     * @type {H6}
     */
    TitleLevel["H6"] = "H6";
  })(TitleLevel || (TitleLevel = {}));
  var _default = TitleLevel;
  _exports.default = _default;
});