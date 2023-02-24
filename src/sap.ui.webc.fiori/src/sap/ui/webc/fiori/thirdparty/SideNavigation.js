sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/main/thirdparty/ResponsivePopover", "sap/ui/webc/main/thirdparty/List", "sap/ui/webc/main/thirdparty/StandardListItem", "sap/ui/webc/main/thirdparty/Tree", "sap/ui/webc/main/thirdparty/TreeItem", "./generated/templates/SideNavigationTemplate.lit", "./generated/templates/SideNavigationItemPopoverContentTemplate.lit", "./generated/themes/SideNavigation.css", "./generated/themes/SideNavigationPopover.css"], function (_exports, _UI5Element, _LitRenderer, _ResponsivePopover, _List, _StandardListItem, _Tree, _TreeItem, _SideNavigationTemplate, _SideNavigationItemPopoverContentTemplate, _SideNavigation, _SideNavigationPopover) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  _List = _interopRequireDefault(_List);
  _StandardListItem = _interopRequireDefault(_StandardListItem);
  _Tree = _interopRequireDefault(_Tree);
  _TreeItem = _interopRequireDefault(_TreeItem);
  _SideNavigationTemplate = _interopRequireDefault(_SideNavigationTemplate);
  _SideNavigationItemPopoverContentTemplate = _interopRequireDefault(_SideNavigationItemPopoverContentTemplate);
  _SideNavigation = _interopRequireDefault(_SideNavigation);
  _SideNavigationPopover = _interopRequireDefault(_SideNavigationPopover);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-side-navigation",
    managedSlots: true,
    fastNavigation: true,
    properties: /** @lends sap.ui.webcomponents.fiori.SideNavigation.prototype */{
      /**
       * Defines whether the <code>ui5-side-navigation</code> is expanded or collapsed.
       *
       * @public
       * @type {boolean}
       * @defaultvalue false
       */
      collapsed: {
        type: Boolean
      },
      /**
       * @private
       */
      _popoverContent: {
        type: Object
      }
    },
    slots: /** @lends sap.ui.webcomponents.fiori.SideNavigation.prototype */{
      /**
       * Defines the main items of the <code>ui5-side-navigation</code>. Use the <code>ui5-side-navigation-item</code> component
       * for the top-level items, and the <code>ui5-side-navigation-sub-item</code> component for second-level items, nested
       * inside the items.
       *
       * @public
       * @type {sap.ui.webcomponents.fiori.ISideNavigationItem[]}
       * @slot items
       */
      "default": {
        propertyName: "items",
        invalidateOnChildChange: true,
        type: HTMLElement
      },
      /**
       * Defines the header of the <code>ui5-side-navigation</code>.
       *
       * <br><br>
       * <b>Note:</b> The header is displayed when the component is expanded - the property <code>collapsed</code> is false;
       *
       * @public
       * @type {HTMLElement[]}
       * @since 1.0.0-rc.11
       * @slot
       */
      header: {
        type: HTMLElement
      },
      /**
       * Defines the fixed items at the bottom of the <code>ui5-side-navigation</code>. Use the <code>ui5-side-navigation-item</code> component
       * for the fixed items, and optionally the <code>ui5-side-navigation-sub-item</code> component to provide second-level items inside them.
       *
       * <b>Note:</b> In order to achieve the best user experience, it is recommended that you keep the fixed items "flat" (do not pass sub-items)
       *
       * @public
       * @type {sap.ui.webcomponents.fiori.ISideNavigationItem[]}
       * @slot
       */
      fixedItems: {
        type: HTMLElement,
        invalidateOnChildChange: true
      }
    },
    events: /** @lends sap.ui.webcomponents.fiori.SideNavigation.prototype */{
      /**
       * Fired when the selection has changed via user interaction
       *
       * @event sap.ui.webcomponents.fiori.SideNavigation#selection-change
       * @param {HTMLElement} item the clicked item.
       * @allowPreventDefault
       * @public
       */
      "selection-change": {
        detail: {
          item: {
            type: HTMLElement
          }
        }
      }
    }
  };

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
   * @alias sap.ui.webcomponents.fiori.SideNavigation
   * @extends UI5Element
   * @tagname ui5-side-navigation
   * @since 1.0.0-rc.8
   * @appenddocs SideNavigationItem SideNavigationSubItem
   * @public
   */
  class SideNavigation extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }
    static get staticAreaStyles() {
      return [_SideNavigationPopover.default];
    }
    static get render() {
      return _LitRenderer.default;
    }
    static get styles() {
      return _SideNavigation.default;
    }
    static get template() {
      return _SideNavigationTemplate.default;
    }
    static get staticAreaTemplate() {
      return _SideNavigationItemPopoverContentTemplate.default;
    }
    static get dependencies() {
      return [_List.default, _StandardListItem.default, _Tree.default, _TreeItem.default, _ResponsivePopover.default];
    }
    onBeforeRendering() {
      this._items = this.items.map(item => {
        return {
          item,
          selected: item.items.some(subItem => subItem.selected) && this.collapsed || item.selected
        };
      });
      this._fixedItems = this.fixedItems.map(item => {
        return {
          item,
          selected: item.items.some(subItem => subItem.selected) && this.collapsed || item.selected
        };
      });
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
      this._popoverContent = {
        mainItem: item,
        mainItemSelected: item.selected && !item.items.some(subItem => subItem.selected),
        subItems: item.items
      };
    }
    handleTreeItemClick(event) {
      const treeItem = event.detail.item;
      const item = treeItem.associatedItem;
      if (!item.wholeItemToggleable) {
        item.fireEvent("click");
      } else {
        item.expanded = !item.expanded;
      }
      if (item.selected && !this.collapsed) {
        return;
      }
      if (this.collapsed && item.items.length) {
        this._buildPopoverContent(item);
        const currentTree = this._itemsTree === event.target ? this._itemsTree : this._fixedItemsTree;
        this.openPicker(currentTree._getListItemForTreeItem(treeItem));
      } else {
        this._setSelectedItem(item);
      }
    }
    handleListItemClick(event) {
      const listItem = event.detail.item;
      const item = listItem.associatedItem;
      item.fireEvent("click");
      if (item.selected) {
        return;
      }
      this._setSelectedItem(item);
      this.closePicker();
    }
    async getPicker() {
      return (await this.getStaticAreaItemDomRef()).querySelector("[ui5-responsive-popover]");
    }
    async openPicker(opener) {
      const responsivePopover = await this.getPicker();
      responsivePopover.showAt(opener);
    }
    async closePicker(opener) {
      const responsivePopover = await this.getPicker();
      responsivePopover.close();
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
  }
  SideNavigation.define();
  var _default = SideNavigation;
  _exports.default = _default;
});