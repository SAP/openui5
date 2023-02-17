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
    tag: "ui5-cb-group-item",
    properties: /** @lends sap.ui.webcomponents.main.ComboBoxGroupItem.prototype */{
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
       * Indicates whether the input is focssed
       * @private
       */
      focused: {
        type: Boolean
      }
    },
    slots: /** @lends sap.ui.webcomponents.main.ComboBoxGroupItem.prototype */{},
    events: /** @lends sap.ui.webcomponents.main.ComboBoxGroupItem.prototype */{}
  };

  /**
   * @class
   * The <code>ui5-cb-group-item</code> is type of suggestion item,
   * that can be used to split the <code>ui5-combobox</code> suggestions into groups.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.ComboBoxGroupItem
   * @extends UI5Element
   * @tagname ui5-cb-group-item
   * @public
   * @implements sap.ui.webcomponents.main.IComboBoxItem
   * @since 1.0.0-rc.15
   */
  class ComboBoxGroupItem extends _UI5Element.default {
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
  }
  ComboBoxGroupItem.define();
  var _default = ComboBoxGroupItem;
  _exports.default = _default;
});