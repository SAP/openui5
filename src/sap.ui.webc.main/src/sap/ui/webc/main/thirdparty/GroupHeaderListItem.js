sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/i18nBundle", "./ListItemBase", "./generated/i18n/i18n-defaults", "./generated/templates/GroupHeaderListItemTemplate.lit", "./generated/themes/GroupHeaderListItem.css"], function (_exports, _property, _customElement, _i18nBundle, _ListItemBase, _i18nDefaults, _GroupHeaderListItemTemplate, _GroupHeaderListItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _property = _interopRequireDefault(_property);
  _customElement = _interopRequireDefault(_customElement);
  _ListItemBase = _interopRequireDefault(_ListItemBase);
  _GroupHeaderListItemTemplate = _interopRequireDefault(_GroupHeaderListItemTemplate);
  _GroupHeaderListItem = _interopRequireDefault(_GroupHeaderListItem);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var GroupHeaderListItem_1;

  // Template

  // Styles

  /**
   * @class
   * The <code>ui5-li-groupheader</code> is a special list item, used only to separate other list items into logical groups.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.GroupHeaderListItem
   * @extends sap.ui.webc.main.ListItemBase
   * @tagname ui5-li-groupheader
   * @implements sap.ui.webc.main.IListItem
   * @public
   */
  let GroupHeaderListItem = GroupHeaderListItem_1 = class GroupHeaderListItem extends _ListItemBase.default {
    get groupItem() {
      return true;
    }
    get groupHeaderText() {
      return GroupHeaderListItem_1.i18nBundle.getText(_i18nDefaults.GROUP_HEADER_TEXT);
    }
    get ariaLabelText() {
      return [this.textContent, this.accessibleName].filter(Boolean).join(" ");
    }
    static async onDefine() {
      GroupHeaderListItem_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)()], GroupHeaderListItem.prototype, "accessibleName", void 0);
  GroupHeaderListItem = GroupHeaderListItem_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-li-groupheader",
    languageAware: true,
    template: _GroupHeaderListItemTemplate.default,
    styles: [_ListItemBase.default.styles, _GroupHeaderListItem.default]
  })], GroupHeaderListItem);
  GroupHeaderListItem.define();
  var _default = GroupHeaderListItem;
  _exports.default = _default;
});