sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "./GroupHeaderListItem"], function (_exports, _UI5Element, _GroupHeaderListItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _GroupHeaderListItem = _interopRequireDefault(_GroupHeaderListItem);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-mcb-group-item",
    properties:
    /** @lends sap.ui.webcomponents.main.MultiComboBoxGroupItem.prototype */
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
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.main.MultiComboBoxGroupItem.prototype */
    {},
    events:
    /** @lends sap.ui.webcomponents.main.MultiComboBoxGroupItem.prototype */
    {}
  };
  /**
   * @class
   * The <code>ui5-mcb-group-item</code> is type of suggestion item,
   * that can be used to split the <code>ui5-multi-combobox</code> suggestions into groups.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.MultiComboBoxGroupItem
   * @extends UI5Element
   * @tagname ui5-mcb-group-item
   * @public
   * @implements sap.ui.webcomponents.main.IMultiComboBoxItem
   * @since 1.4.0
   */

  class MultiComboBoxGroupItem extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get dependencies() {
      return [_GroupHeaderListItem.default];
    }
    /**
     * Used to avoid tag name checks
     * @protected
     */


    get isGroupItem() {
      return true;
    }

    get stableDomRef() {
      return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
    }

  }

  MultiComboBoxGroupItem.define();
  var _default = MultiComboBoxGroupItem;
  _exports.default = _default;
});