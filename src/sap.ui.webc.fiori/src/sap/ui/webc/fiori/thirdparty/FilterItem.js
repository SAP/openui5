sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element"], function (_exports, _UI5Element) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-filter-item",
    managedSlots: true,
    properties:
    /** @lends sap.ui.webcomponents.fiori.FilterItem.prototype */
    {
      /**
       * Defines the text of the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      text: {
        type: String
      },

      /**
       * Defines the additional text of the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @private
       */
      additionalText: {
        type: String
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.fiori.FilterItem.prototype */
    {
      /**
       * Defines the <code>values</code> list.
       * @type {sap.ui.webcomponents.fiori.IFilterItemOption[]}
       * @slot values
       * @public
       */
      values: {
        type: HTMLElement
      }
    },
    events:
    /** @lends sap.ui.webcomponents.fiori.FilterItem.prototype */
    {//
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   *
   * <h3>Usage</h3>
   *
   * For the <code>ui5-filter-item</code>
   * <h3>ES6 Module Import</h3>
   *
   * <code>import @ui5/webcomponents-fiori/dist/FilterItem.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.fiori.FilterItem
   * @extends UI5Element
   * @since 1.0.0-rc.16
   * @tagname ui5-filter-item
   * @implements sap.ui.webcomponents.fiori.IFilterItem
   * @public
   */

  class FilterItem extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

  }

  FilterItem.define();
  var _default = FilterItem;
  _exports.default = _default;
});