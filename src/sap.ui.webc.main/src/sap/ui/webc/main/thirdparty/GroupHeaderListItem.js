sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/i18nBundle", "./ListItemBase", "./generated/i18n/i18n-defaults", "./generated/templates/GroupHeaderListItemTemplate.lit", "./generated/themes/GroupHeaderListItem.css"], function (_exports, _i18nBundle, _ListItemBase, _i18nDefaults, _GroupHeaderListItemTemplate, _GroupHeaderListItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _ListItemBase = _interopRequireDefault(_ListItemBase);
  _GroupHeaderListItemTemplate = _interopRequireDefault(_GroupHeaderListItemTemplate);
  _GroupHeaderListItem = _interopRequireDefault(_GroupHeaderListItem);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Template

  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-li-groupheader",
    languageAware: true,
    properties: /** @lends sap.ui.webcomponents.main.GroupHeaderListItem.prototype */{
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
    },
    slots: /** @lends sap.ui.webcomponents.main.GroupHeaderListItem.prototype */{
      /**
       * Defines the text of the component.
       * <br>
       * <b>Note:</b> Although this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
       *
       * @type {Node[]}
       * @slot
       * @public
       */
      "default": {
        type: Node
      }
    },
    events: /** @lends sap.ui.webcomponents.main.GroupHeaderListItem.prototype */{}
  };

  /**
   * @class
   * The <code>ui5-li-groupheader</code> is a special list item, used only to separate other list items into logical groups.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.GroupHeaderListItem
   * @extends ListItemBase
   * @tagname ui5-li-groupheader
   * @implements sap.ui.webcomponents.main.IListItem
   * @public
   */
  class GroupHeaderListItem extends _ListItemBase.default {
    static get template() {
      return _GroupHeaderListItemTemplate.default;
    }
    static get metadata() {
      return metadata;
    }
    static get styles() {
      return [_ListItemBase.default.styles, _GroupHeaderListItem.default];
    }
    get group() {
      return true;
    }
    get groupHeaderText() {
      return GroupHeaderListItem.i18nBundle.getText(_i18nDefaults.GROUP_HEADER_TEXT);
    }
    get ariaLabelText() {
      return [this.textContent, this.accessibleName].filter(Boolean).join(" ");
    }
    static async onDefine() {
      GroupHeaderListItem.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  }
  GroupHeaderListItem.define();
  var _default = GroupHeaderListItem;
  _exports.default = _default;
});