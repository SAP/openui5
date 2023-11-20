sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Different Breadcrumbs separator styles.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.BreadcrumbsSeparatorStyle
   */
  var BreadcrumbsSeparatorStyle;
  (function (BreadcrumbsSeparatorStyle) {
    /**
     * The separator appears as "/".
     * @public
     * @type {Slash}
     */
    BreadcrumbsSeparatorStyle["Slash"] = "Slash";
    /**
     * The separator appears as "\".
     * @public
     * @type {BackSlash}
     */
    BreadcrumbsSeparatorStyle["BackSlash"] = "BackSlash";
    /**
     * The separator appears as "\\".
     * @public
     * @type {DoubleBackSlash}
     */
    BreadcrumbsSeparatorStyle["DoubleBackSlash"] = "DoubleBackSlash";
    /**
     * The separator appears as ">>".
     * @public
     * @type {DoubleGreaterThan}
     */
    BreadcrumbsSeparatorStyle["DoubleGreaterThan"] = "DoubleGreaterThan";
    /**
     * The separator appears as "//" .
     * @public
     * @type {DoubleSlash}
     */
    BreadcrumbsSeparatorStyle["DoubleSlash"] = "DoubleSlash";
    /**
     * The separator appears as ">".
     * @public
     * @type {GreaterThan}
     */
    BreadcrumbsSeparatorStyle["GreaterThan"] = "GreaterThan";
  })(BreadcrumbsSeparatorStyle || (BreadcrumbsSeparatorStyle = {}));
  var _default = BreadcrumbsSeparatorStyle;
  _exports.default = _default;
});