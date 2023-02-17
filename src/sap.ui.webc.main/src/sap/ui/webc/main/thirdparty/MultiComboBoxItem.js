sap.ui.define(["exports", "./ComboBoxItem"], function (_exports, _ComboBoxItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _ComboBoxItem = _interopRequireDefault(_ComboBoxItem);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @public
   */
  const metadata = {
    tag: "ui5-mcb-item",
    properties: /** @lends sap.ui.webcomponents.main.MultiComboBoxItem.prototype */{
      /**
       * Defines the selected state of the component.
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      selected: {
        type: Boolean
      }
    }
  };

  /**
   * @class
   * The <code>ui5-mcb-item</code> represents the item for a <code>ui5-multi-combobox</code>.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.MultiComboBoxItem
   * @extends ComboBoxItem
   * @tagname ui5-mcb-item
   * @implements sap.ui.webcomponents.main.IMultiComboBoxItem
   * @public
   */
  class MultiComboBoxItem extends _ComboBoxItem.default {
    static get metadata() {
      return metadata;
    }
    get stableDomRef() {
      return this.getAttribute("stable-dom-ref") || `${this._id}-stable-dom-ref`;
    }
  }
  MultiComboBoxItem.define();
  var _default = MultiComboBoxItem;
  _exports.default = _default;
});