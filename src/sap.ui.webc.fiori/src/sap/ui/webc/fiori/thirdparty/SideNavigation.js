sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/main/thirdparty/ResponsivePopover", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/main/thirdparty/List", "sap/ui/webc/main/thirdparty/StandardListItem", "sap/ui/webc/main/thirdparty/Tree", "sap/ui/webc/main/thirdparty/TreeItem", "./SideNavigationItem", "./SideNavigationSubItem", "./generated/templates/SideNavigationTemplate.lit", "./generated/templates/SideNavigationPopoverTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/SideNavigation.css", "./generated/themes/SideNavigationPopover.css"], function (_exports, _UI5Element, _customElement, _LitRenderer, _ResponsivePopover, _event, _property, _slot, _i18nBundle, _List, _StandardListItem, _Tree, _TreeItem, _SideNavigationItem, _SideNavigationSubItem, _SideNavigationTemplate, _SideNavigationPopoverTemplate, _i18nDefaults, _SideNavigation, _SideNavigationPopover) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  _event = _interopRequireDefault(_event);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _List = _interopRequireDefault(_List);
  _StandardListItem = _interopRequireDefault(_StandardListItem);
  _Tree = _interopRequireDefault(_Tree);
  _TreeItem = _interopRequireDefault(_TreeItem);
  _SideNavigationItem = _interopRequireDefault(_SideNavigationItem);
  _SideNavigationSubItem = _interopRequireDefault(_SideNavigationSubItem);
  _SideNavigationTemplate = _interopRequireDefault(_SideNavigationTemplate);
  _SideNavigationPopoverTemplate = _interopRequireDefault(_SideNavigationPopoverTemplate);
  _SideNavigation = _interopRequireDefault(_SideNavigation);
  _SideNavigationPopover = _interopRequireDefault(_SideNavigationPopover);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var SideNavigation_1;

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>SideNavigation</code> is used as a standard menu in applications.
   * It consists of three containers: header (top-aligned), main navigation section (top-aligned) and the secondary section (bottom-aligned).
   * <ul>
   * <li>The header is meant for displaying user related information - profile data, avatar, etc.</li>
   * <li>The main navigation section is related to the user’s current work context</li>
   * <li>The secondary section is mostly used to link additional information that may be of interest (legal information, developer communities, external help, contact information and so on). </li>
   * </ul>
   *
   * <h3>Usage</h3>
   *
   * Use the available <code>ui5-side-navigation-item</code> and <code>ui5-side-navigation-sub-item</code> components to build your menu.
   * The items can consist of text only or an icon with text. The use or non-use of icons must be consistent for all items on one level.
   * You must not combine entries with and without icons on the same level. We strongly recommend that you do not use icons on the second level.
   *
   * <h3>Keyboard Handling</h3>
   *
   * <h4>Fast Navigation</h4>
   * This component provides a build in fast navigation group which can be used via <code>F6 / Shift + F6</code> or <code> Ctrl + Alt(Option) + Down /  Ctrl + Alt(Option) + Up</code>.
   * In order to use this functionality, you need to import the following module:
   * <code>import "@ui5/webcomponents-base/dist/features/F6Navigation.js"</code>
   * <br><br>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents-fiori/dist/SideNavigation.js";</code>
   * <br>
   * <code>import "@ui5/webcomponents-fiori/dist/SideNavigationItem.js";</code> (for <code>ui5-side-navigation-item</code>)
   * <br>
   * <code>import "@ui5/webcomponents-fiori/dist/SideNavigationSubItem.js";</code> (for <code>ui5-side-navigation-sub-item</code>)
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.SideNavigation
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-side-navigation
   * @since 1.0.0-rc.8
   * @appenddocs sap.ui.webc.fiori.SideNavigationItem sap.ui.webc.fiori.SideNavigationSubItem
   * @public
   */
  let SideNavigation = SideNavigation_1 = class SideNavigation extends _UI5Element.default {
    constructor() {
      super(...arguments);
      this._createTreeItem = item => {
        return {
          item,
          selected: item.items.some(subItem => subItem.selected) && this.collapsed || item.selected
        };
      };
    }
    get _items() {
      return this.items.map(this._createTreeItem);
    }
    get _fixedItems() {
      return this.fixedItems.map(this._createTreeItem);
    }
    _setSelectedItem(item) {
      if (!this.fireEvent("selection-change", {
        item
      }, true)) {
        return;
      }
      this._walk(current => {
        current.selected = false;
      });
      item.selected = true;
    }
    _buildPopoverContent(item) {
      this._popoverContents = {
        mainItem: item,
        mainItemSelected: item.selected && !item.items.some(subItem => subItem.selected),
        // add one as the first item is the main item
        selectedSubItemIndex: item.items.findIndex(subItem => subItem.selected) + 1,
        subItems: item.items
      };
    }
    async _onAfterOpen() {
      // as the tree/list inside the popover is never destroyed,
      // item navigation index should be managed, because items are
      // dynamically recreated and tabIndexes are not updated
      const tree = await this.getPickerTree();
      const index = this._popoverContents.selectedSubItemIndex;
      tree.focusItemByIndex(index);
    }
    get accSideNavigationPopoverHiddenText() {
      return SideNavigation_1.i18nBundle.getText(_i18nDefaults.SIDE_NAVIGATION_POPOVER_HIDDEN_TEXT);
    }
    get ariaRoleDescNavigationList() {
      let key = _i18nDefaults.SIDE_NAVIGATION_LIST_ARIA_ROLE_DESC;
      if (this.collapsed) {
        key = _i18nDefaults.SIDE_NAVIGATION_COLLAPSED_LIST_ARIA_ROLE_DESC;
      }
      return SideNavigation_1.i18nBundle.getText(key);
    }
    get ariaRoleDescNavigationListItem() {
      let key = _i18nDefaults.SIDE_NAVIGATION_LIST_ITEMS_ARIA_ROLE_DESC;
      if (this.collapsed) {
        key = _i18nDefaults.SIDE_NAVIGATION_COLLAPSED_LIST_ITEMS_ARIA_ROLE_DESC;
      }
      return SideNavigation_1.i18nBundle.getText(key);
    }
    handleTreeItemClick(e) {
      const treeItem = e.detail.item;
      const item = treeItem.associatedItem;
      if (item instanceof _SideNavigationItem.default && !item.wholeItemToggleable) {
        item.fireEvent("click");
      } else if (item instanceof _SideNavigationSubItem.default) {
        item.fireEvent("click");
      } else {
        item.expanded = !item.expanded;
      }
      if (item.selected && !this.collapsed) {
        return;
      }
      if (this.collapsed && item instanceof _SideNavigationItem.default && item.items.length) {
        this._buildPopoverContent(item);
        let tree = this._itemsTree;
        if (tree !== e.target) {
          tree = this._fixedItemsTree;
        }
        this.openPicker(tree._getListItemForTreeItem(treeItem));
      } else if (!item.selected) {
        this._setSelectedItem(item);
      }
    }
    handleInnerSelectionChange(e) {
      const item = e.detail.item;
      const {
        associatedItem
      } = item;
      associatedItem.fireEvent("click");
      if (associatedItem.selected) {
        return;
      }
      this._setSelectedItem(associatedItem);
      this.closePicker();
    }
    async getPicker() {
      return (await this.getStaticAreaItemDomRef()).querySelector("[ui5-responsive-popover]");
    }
    async openPicker(opener) {
      const responsivePopover = await this.getPicker();
      responsivePopover.showAt(opener);
    }
    async closePicker() {
      const responsivePopover = await this.getPicker();
      responsivePopover.close();
    }
    async getPickerTree() {
      const picker = await this.getPicker();
      const sideNav = picker.querySelector("[ui5-side-navigation]");
      return sideNav._itemsTree;
    }
    get hasHeader() {
      return !!this.header.length;
    }
    get showHeader() {
      return this.hasHeader && !this.collapsed;
    }
    get _itemsTree() {
      return this.getDomRef().querySelector("#ui5-sn-items-tree");
    }
    get _fixedItemsTree() {
      return this.getDomRef().querySelector("#ui5-sn-fixed-items-tree");
    }
    _walk(callback) {
      this.items.forEach(current => {
        callback(current);
        current.items.forEach(currentSubitem => {
          callback(currentSubitem);
        });
      });
      this.fixedItems.forEach(current => {
        callback(current);
        current.items.forEach(currentSubitem => {
          callback(currentSubitem);
        });
      });
    }
    static async onDefine() {
      [SideNavigation_1.i18nBundle] = await Promise.all([(0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori"), super.onDefine()]);
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], SideNavigation.prototype, "collapsed", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], SideNavigation.prototype, "_popoverContents", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    invalidateOnChildChange: true,
    "default": true
  })], SideNavigation.prototype, "items", void 0);
  __decorate([(0, _slot.default)()], SideNavigation.prototype, "header", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    invalidateOnChildChange: true
  })], SideNavigation.prototype, "fixedItems", void 0);
  SideNavigation = SideNavigation_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-side-navigation",
    fastNavigation: true,
    renderer: _LitRenderer.default,
    template: _SideNavigationTemplate.default,
    staticAreaTemplate: _SideNavigationPopoverTemplate.default,
    styles: _SideNavigation.default,
    staticAreaStyles: _SideNavigationPopover.default,
    dependencies: [_List.default, _StandardListItem.default, _Tree.default, _TreeItem.default, _ResponsivePopover.default, _SideNavigationItem.default, _SideNavigationSubItem.default]
  })
  /**
   * Fired when the selection has changed via user interaction
   *
   * @event sap.ui.webc.fiori.SideNavigation#selection-change
   * @param {sap.ui.webc.fiori.ISideNavigationItem|sap.ui.webc.fiori.ISideNavigationSubItem} item the clicked item.
   * @allowPreventDefault
   * @public
   */, (0, _event.default)("selection-change", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })], SideNavigation);
  SideNavigation.define();
  var _default = SideNavigation;
  _exports.default = _default;
});