sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @lends sap.ui.webcomponents.main.types.BreadcrumbsDesign.prototype
   * @public
   */
  const BreadcrumbsTypes = {
    /**
     * Shows the current page as the last item in the trail.
     * The last item contains only plain text and is not a link.
     *
     * @public
     * @type {Standard}
     */
    Standard: "Standard",

    /**
     * All items are displayed as links.
     * @public
     * @type {NoCurrentPage}
     */
    NoCurrentPage: "NoCurrentPage"
  };
  /**
   * @class
   * Different types of <code>Breadcrumbs</code>.
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.types.BreadcrumbsDesign
   * @public
   * @enum {string}
   */

  class BreadcrumbsDesign extends _DataType.default {
    static isValid(value) {
      return !!BreadcrumbsTypes[value];
    }

  }

  BreadcrumbsDesign.generateTypeAccessors(BreadcrumbsTypes);
  var _default = BreadcrumbsDesign;
  _exports.default = _default;
});