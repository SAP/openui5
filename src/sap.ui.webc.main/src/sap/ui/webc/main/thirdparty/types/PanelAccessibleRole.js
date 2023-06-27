sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * Panel accessible roles.
   *
   * @readonly
   * @enum {string}
   * @public
   * @author SAP SE
   * @alias sap.ui.webc.main.types.PanelAccessibleRole
   */
  var PanelAccessibleRole;
  (function (PanelAccessibleRole) {
    /**
     * Represents the ARIA role "complementary".
     * A section of the page, designed to be complementary to the main content at a similar level in the DOM hierarchy.
     * @public
     * @type {Complementary}
     */
    PanelAccessibleRole["Complementary"] = "Complementary";
    /**
     * Represents the ARIA role "Form".
     * A landmark region that contains a collection of items and objects that, as a whole, create a form.
     * @public
     * @type {Form}
     */
    PanelAccessibleRole["Form"] = "Form";
    /**
     * Represents the ARIA role "Region".
     * A section of a page, that is important enough to be included in a page summary or table of contents.
     * @public
     * @type {Region}
     */
    PanelAccessibleRole["Region"] = "Region";
  })(PanelAccessibleRole || (PanelAccessibleRole = {}));
  var _default = PanelAccessibleRole;
  _exports.default = _default;
});