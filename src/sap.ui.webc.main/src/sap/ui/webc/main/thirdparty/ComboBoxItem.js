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
    tag: "ui5-cb-item",
    properties: /** @lends sap.ui.webcomponents.main.ComboBoxItem.prototype */{
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
       * @since 1.0.0-rc.11
       * @public
       */
      additionalText: {
        type: String
      }
    }
  };

  /**
   * @class
   * The <code>ui5-cb-item</code> represents the item for a <code>ui5-combobox</code>.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.ComboBoxItem
   * @extends UI5Element
   * @tagname ui5-cb-item
   * @implements sap.ui.webcomponents.main.IComboBoxItem
   * @public
   */
  class ComboBoxItem extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }
  }
  ComboBoxItem.define();
  var _default = ComboBoxItem;
  _exports.default = _default;
});