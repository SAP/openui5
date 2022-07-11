sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/DataType"], function (_exports, _DataType) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DataType = _interopRequireDefault(_DataType);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * Different types of FCLLayout.
   * @lends sap.ui.webcomponents.fiori.types.FCLLayout.prototype
   * @public
   */
  const FCLLayouts = {
    /**
     * The layout will display 1 column.
     * @public
     * @type {OneColumn}
     */
    OneColumn: "OneColumn",

    /**
     *
     * Desktop: 67/33/-  Start (expanded) and Mid columns are displayed
     * Tablet:  67/33/-  Start (expanded) and Mid columns are displayed
     * Phone:   -/100/-  only the Mid column is displayed
     *
     * Use to display both a list and a detail page when the user should focus on the list page.
     *
     * @type {TwoColumnsStartExpanded}
     * @public
     */
    TwoColumnsStartExpanded: "TwoColumnsStartExpanded",

    /**
     * Desktop: 33/67/-  Start and Mid (expanded) columns are displayed
     * Tablet:  33/67/-  Start and Mid (expanded) columns are displayed
     * Phone:   -/100/-  only the Mid column is displayed
     *
     * Use to display both a list and a detail page when the user should focus on the detail page.
     *
     * @type {TwoColumnsMidExpanded}
     * @public
     */
    TwoColumnsMidExpanded: "TwoColumnsMidExpanded",

    /**
     * Desktop: 25/50/25 Start, Mid (expanded) and End columns are displayed
     * Tablet:  0/67/33  Mid (expanded) and End columns are displayed, Start is accessible by a layout arrow
     * Phone:   -/-/100  only the End column is displayed
     *
     * Use to display all three pages (list, detail, detail-detail) when the user should focus on the detail.
     *
     * @type {ThreeColumnsMidExpanded}
     * @public
     */
    ThreeColumnsMidExpanded: "ThreeColumnsMidExpanded",

    /**
     * Desktop: 25/25/50 Start, Mid and End (expanded) columns are displayed
     * Tablet:  0/33/67  Mid and End (expanded) columns are displayed, Start is accessible by layout arrows
     * Phone:   -/-/100  (only the End column is displayed)
     *
     * Use to display all three pages (list, detail, detail-detail) when the user should focus on the detail-detail.
     *
     * @public
     * @type ThreeColumnsEndExpanded
     */
    ThreeColumnsEndExpanded: "ThreeColumnsEndExpanded",

    /**
     * Desktop: 67/33/0  Start (expanded) and Mid columns are displayed, End is accessible by layout arrows
     * Tablet:  67/33/0  Start (expanded) and Mid columns are displayed, End is accessible by layout arrows
     * Phone:   -/-/100  only the End column is displayed
     *
     * Use to display the list and detail pages when the user should focus on the list.
     * The detail-detail is still loaded and easily accessible with layout arrows.
     *
     * @public
     * @type ThreeColumnsStartExpandedEndHidden
     */
    ThreeColumnsStartExpandedEndHidden: "ThreeColumnsStartExpandedEndHidden",

    /**
     * Desktop: 33/67/0  Start and Mid (expanded) columns are displayed, End is accessible by a layout arrow
     * Tablet:  33/67/0  Start and Mid (expanded) columns are displayed, End is accessible by a layout arrow
     * Phone:   -/-/100  only the End column is displayed
     *
     * Use to display the list and detail pages when the user should focus on the detail.
     * The detail-detail is still loaded and easily accessible with a layout arrow.
     *
     * @public
     * @type ThreeColumnsMidExpandedEndHidden
     */
    ThreeColumnsMidExpandedEndHidden: "ThreeColumnsMidExpandedEndHidden",

    /**
     * Desktop: -/100/-  only the Mid column is displayed
     * Tablet:  -/100/-  only the Mid column is displayed
     * Phone:   -/100/-  only the Mid column is displayed
     *
     * Use to display a detail page only, when the user should focus entirely on it.
     *
     * @public
     * @type MidColumnFullScreen
     */
    MidColumnFullScreen: "MidColumnFullScreen",

    /**
     * Desktop: -/-/100  only the End column is displayed
     * Tablet:  -/-/100  only the End column is displayed
     * Phone:   -/-/100  only the End column is displayed
     *
     * Use to display a detail-detail page only, when the user should focus entirely on it.
     *
     * @public
     * @type EndColumnFullScreen
     */
    EndColumnFullScreen: "EndColumnFullScreen"
  };
  /**
   * The number of columns of <code>ui5-flexible-collcolumn-layout</code>.
   *
   * @class
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.types.FCLLayout
   * @public
   * @enum {string}
   */

  class FCLLayout extends _DataType.default {
    static isValid(value) {
      return !!FCLLayouts[value];
    }

  }

  FCLLayout.generateTypeAccessors(FCLLayouts);
  var _default = FCLLayout;
  _exports.default = _default;
});