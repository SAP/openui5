sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @lends sap.ui.webcomponents.main.types.PanelAccessibleRole.prototype
   * @public
   */
  const PanelAccessibleRoles = {
    /**
     * Represents the ARIA role <code>complementary</code>. A section of the page, designed to be complementary to the main content at a similar level in the DOM hierarchy.
     * @public
     * @type {Complementary}
     */
    Complementary: "Complementary",

    /**
     * Represents the ARIA role <code>Form</code>. A landmark region that contains a collection of items and objects that, as a whole, create a form.
     * @public
     * @type {Form}
     */
    Form: "Form",

    /**
     * Represents the ARIA role <code>Region</code>. A section of a page, that is important enough to be included in a page summary or table of contents.
     * @public
     * @type {Region}
     */
    Region: "Region"
  };
  /**
   * @class
   * Available Panel Accessible Landmark Roles.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.PanelAccessibleRole
   * @public
   * @enum {string}
   */

  class PanelAccessibleRole extends _DataType.default {
    static isValid(value) {
      return !!PanelAccessibleRoles[value];
    }

  }

  PanelAccessibleRole.generateTypeAccessors(PanelAccessibleRoles);
  var _default = PanelAccessibleRole;
  _exports.default = _default;
});