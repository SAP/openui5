sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * Available Page Background Design.
   * @lends sap.ui.webcomponents.fiori.types.PageBackgroundDesign.prototype
   * @public
   */
  const PageBackgroundDesigns = {
    /**
     * Page background color when a List is set as the Page content.
     *
     * @type {List}
     * @public
     */
    List: "List",

    /**
     * A solid background color dependent on the theme.
     *
     * @type {Solid}
     * @public
    	 */
    Solid: "Solid",

    /**
     * Transparent background for the page.
     *
     * @type {Transparent}
     * @public
     */
    Transparent: "Transparent"
  };
  /**
   * Available Page Background Design.
   *
   * @class
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.types.PageBackgroundDesign
   * @public
   * @enum {string}
   */

  class PageBackgroundDesign extends _DataType.default {
    static isValid(value) {
      return !!PageBackgroundDesigns[value];
    }

  }

  PageBackgroundDesign.generateTypeAccessors(PageBackgroundDesigns);
  var _default = PageBackgroundDesign;
  _exports.default = _default;
});