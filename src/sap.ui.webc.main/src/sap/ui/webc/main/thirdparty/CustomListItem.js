sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/Keys", "./ListItem", "./generated/templates/CustomListItemTemplate.lit", "./generated/themes/CustomListItem.css"], function (_exports, _Keys, _ListItem, _CustomListItemTemplate, _CustomListItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _ListItem = _interopRequireDefault(_ListItem);
  _CustomListItemTemplate = _interopRequireDefault(_CustomListItemTemplate);
  _CustomListItem = _interopRequireDefault(_CustomListItem);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-li-custom",
    slots: /** @lends sap.ui.webcomponents.main.CustomListItem.prototype */{
      /**
       * Defines the content of the component.
       * @type {Node[]}
       * @slot
       * @public
       */
      "default": {
        type: Node
      }
    },
    properties: /** @lends sap.ui.webcomponents.main.CustomListItem.prototype */{
      /**
       * Defines the text alternative of the component.
       * Note: If not provided a default text alternative will be set, if present.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.0.0-rc.15
       */
      accessibleName: {
        type: String
      }
    }
  };

  /**
   * @class
   *
   * A component to be used as custom list item within the <code>ui5-list</code>
   * the same way as the standard <code>ui5-li</code>.
   *
   * The component accepts arbitrary HTML content to allow full customization.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.CustomListItem
   * @extends ListItem
   * @tagname ui5-li-custom
   * @implements sap.ui.webcomponents.main.IListItem
   * @public
   */
  class CustomListItem extends _ListItem.default {
    static get metadata() {
      return metadata;
    }
    static get template() {
      return _CustomListItemTemplate.default;
    }
    static get styles() {
      return [_ListItem.default.styles, _CustomListItem.default];
    }
    _onkeydown(event) {
      const isTab = (0, _Keys.isTabNext)(event) || (0, _Keys.isTabPrevious)(event);
      if (!isTab && !this.focused) {
        return;
      }
      super._onkeydown(event);
    }
    _onkeyup(event) {
      const isTab = (0, _Keys.isTabNext)(event) || (0, _Keys.isTabPrevious)(event);
      if (!isTab && !this.focused) {
        return;
      }
      super._onkeyup(event);
    }
    get classes() {
      const result = super.classes;
      result.main["ui5-custom-li-root"] = true;
      return result;
    }
  }
  CustomListItem.define();
  var _default = CustomListItem;
  _exports.default = _default;
});