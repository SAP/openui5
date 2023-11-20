sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/types/DOMReference", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/icons/slim-arrow-right", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/types/Integer", "./ResponsivePopover", "./Button", "./List", "./StandardListItem", "./Icon", "./BusyIndicator", "./generated/templates/MenuTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/Menu.css"], function (_exports, _UI5Element, _customElement, _property, _slot, _event, _DOMReference, _Keys, _Device, _i18nBundle, _slimArrowRight, _LitRenderer, _Integer, _ResponsivePopover, _Button, _List, _StandardListItem, _Icon, _BusyIndicator, _MenuTemplate, _i18nDefaults, _Menu) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _DOMReference = _interopRequireDefault(_DOMReference);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Integer = _interopRequireDefault(_Integer);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  _Button = _interopRequireDefault(_Button);
  _List = _interopRequireDefault(_List);
  _StandardListItem = _interopRequireDefault(_StandardListItem);
  _Icon = _interopRequireDefault(_Icon);
  _BusyIndicator = _interopRequireDefault(_BusyIndicator);
  _MenuTemplate = _interopRequireDefault(_MenuTemplate);
  _Menu = _interopRequireDefault(_Menu);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Menu_1;

  // Styles

  const MENU_OPEN_DELAY = 300;
  const MENU_CLOSE_DELAY = 400;
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * <code>ui5-menu</code> component represents a hierarchical menu structure.
   *
   * <h3>Usage</h3>
   *
   * <code>ui5-menu</code> contains <code>ui5-menu-item</code> components.
   * An arbitrary hierarchy structure can be represented by recursively nesting menu items.
   *
   * <h3>Keyboard Handling</h3>
   *
   * The <code>ui5-menu</code> provides advanced keyboard handling.
   * The user can use the following keyboard shortcuts in order to navigate trough the tree:
   * <ul>
   * <li><code>Arrow Up</code> / <code>Arrow Down</code> - Navigates up and down the menu items that are currently visible.</li>
   * <li><code>Arrow Right</code>, <code>Space</code> or <code>Enter</code> - Opens a sub-menu if there are menu items nested
   * in the currently clicked menu item.</li>
   * <li><code>Arrow Left</code> or <code>Escape</code> - Closes the currently opened sub-menu.</li>
   * </ul>
   * Note: if the text ditrection is set to Right-to-left (RTL), <code>Arrow Right</code> and <code>Arrow Left</code> functionality is swapped.
   * <br>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Menu.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Menu
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-menu
   * @appenddocs sap.ui.webc.main.MenuItem
   * @since 1.3.0
   * @public
   */
  let Menu = Menu_1 = class Menu extends _UI5Element.default {
    static async onDefine() {
      Menu_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    get itemsWithChildren() {
      return !!this._currentItems.filter(item => item.item.items.length).length;
    }
    get itemsWithIcon() {
      return !!this._currentItems.filter(item => item.item.icon !== "").length;
    }
    get isRtl() {
      return this.effectiveDir === "rtl";
    }
    get placementType() {
      const placement = this.isRtl ? "Left" : "Right";
      return this._isSubMenu ? placement : "Bottom";
    }
    get verticalAlign() {
      return this._isSubMenu ? "Top" : "Bottom";
    }
    get labelBack() {
      return Menu_1.i18nBundle.getText(_i18nDefaults.MENU_BACK_BUTTON_ARIA_LABEL);
    }
    get labelClose() {
      return Menu_1.i18nBundle.getText(_i18nDefaults.MENU_CLOSE_BUTTON_ARIA_LABEL);
    }
    get isPhone() {
      return (0, _Device.isPhone)();
    }
    get isSubMenuOpened() {
      return !!this._parentMenuItem;
    }
    get menuHeaderTextPhone() {
      return this._parentMenuItem ? this._parentMenuItem.text : this.headerText;
    }
    onBeforeRendering() {
      !(0, _Device.isPhone)() && this._prepareCurrentItems(this.items);
      const itemsWithChildren = this.itemsWithChildren;
      const itemsWithIcon = this.itemsWithIcon;
      this._currentItems.forEach(item => {
        item.item._siblingsWithChildren = itemsWithChildren;
        item.item._siblingsWithIcon = itemsWithIcon;
        const subMenu = item.item._subMenu;
        const menuItem = item.item;
        if (subMenu && subMenu.busy) {
          subMenu.innerHTML = "";
          const fragment = this._clonedItemsFragment(menuItem);
          subMenu.appendChild(fragment);
        }
        if (subMenu) {
          subMenu.busy = item.item.busy;
          subMenu.busyDelay = item.item.busyDelay;
        }
      });
    }
    onAfterRendering() {
      if (!this.opener) {
        return;
      }
      if (this.open) {
        const rootNode = this.getRootNode();
        const opener = this.opener instanceof HTMLElement ? this.opener : rootNode && rootNode.getElementById(this.opener);
        if (opener) {
          this.showAt(opener);
        }
      } else {
        this.close();
      }
    }
    /**
     * Shows the Menu near the opener element.
     * @param {HTMLElement} opener the element that the popover is shown at
     * @public
     * @method
     * @name sap.ui.webc.main.Menu#showAt
     */
    async showAt(opener) {
      if ((0, _Device.isPhone)()) {
        this._prepareCurrentItems(this.items);
        this._parentItemsStack = [];
      }
      if (!this._isSubMenu) {
        this._parentMenuItem = undefined;
      }
      const popover = await this._createPopover();
      popover.initialFocus = "";
      for (let index = 0; index < this._currentItems.length; index++) {
        if (!this._currentItems[index].item.disabled) {
          popover.initialFocus = `${this._id}-menu-item-${index}`;
          break;
        }
      }
      popover.showAt(opener);
    }
    /**
     * Closes the Menu.
     * @public
     * @method
     * @name sap.ui.webc.main.Menu#close
     */
    close() {
      if (this._popover) {
        if ((0, _Device.isPhone)()) {
          this._parentItemsStack = [];
        }
        this._popover.close();
        this._popover.resetFocus();
      }
    }
    async _createPopover() {
      const staticAreaItemDomRef = await this.getStaticAreaItemDomRef();
      this._popover = staticAreaItemDomRef.querySelector("[ui5-responsive-popover]");
      return this._popover;
    }
    _navigateBack() {
      const parentMenuItem = this._parentItemsStack.pop();
      this.focus();
      if (parentMenuItem) {
        const parentMenuItemParent = parentMenuItem.parentElement;
        this._prepareCurrentItems(parentMenuItemParent.items);
        this._parentMenuItem = this._parentItemsStack.length ? this._parentItemsStack[this._parentItemsStack.length - 1] : undefined;
      }
    }
    _prepareCurrentItems(items) {
      this._currentItems = items.map((item, index) => {
        return {
          item,
          position: index + 1,
          ariaHasPopup: item.hasSubmenu ? "menu" : undefined
        };
      });
    }
    _createSubMenu(item, openerId) {
      const ctor = this.constructor;
      const subMenu = document.createElement(ctor.getMetadata().getTag());
      subMenu._isSubMenu = true;
      subMenu.setAttribute("id", `submenu-${openerId}`);
      subMenu._parentMenuItem = item;
      subMenu.busy = item.busy;
      subMenu.busyDelay = item.busyDelay;
      const fragment = this._clonedItemsFragment(item);
      subMenu.appendChild(fragment);
      this.staticAreaItem.shadowRoot.querySelector(".ui5-menu-submenus").appendChild(subMenu);
      item._subMenu = subMenu;
    }
    _clonedItemsFragment(item) {
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < item.items.length; ++i) {
        const clonedItem = item.items[i].cloneNode(true);
        fragment.appendChild(clonedItem);
      }
      return fragment;
    }
    _openItemSubMenu(item, opener, actionId) {
      const mainMenu = this._findMainMenu(item);
      mainMenu.fireEvent("before-open", {
        item
      });
      item._subMenu.showAt(opener);
      item._preventSubMenuClose = true;
      this._openedSubMenuItem = item;
      this._subMenuOpenerId = actionId;
    }
    _closeItemSubMenu(item, forceClose = false) {
      if (item) {
        if (forceClose) {
          item._preventSubMenuClose = false;
          this._closeSubMenuPopover(item._subMenu, true);
        } else {
          setTimeout(() => this._closeSubMenuPopover(item._subMenu), 0);
        }
      }
    }
    _closeSubMenuPopover(subMenu, forceClose = false) {
      if (subMenu) {
        const parentItem = subMenu._parentMenuItem;
        if (forceClose || !parentItem._preventSubMenuClose) {
          subMenu.close();
          subMenu.remove();
          parentItem._subMenu = undefined;
          this._openedSubMenuItem = undefined;
          this._subMenuOpenerId = "";
        }
      }
    }
    _prepareSubMenuDesktopTablet(item, opener, actionId) {
      if (actionId !== this._subMenuOpenerId || item && item.hasSubmenu) {
        // close opened sub-menu if there is any opened
        this._closeItemSubMenu(this._openedSubMenuItem, true);
      }
      if (item && item.hasSubmenu) {
        // create new sub-menu
        this._createSubMenu(item, actionId);
        this._openItemSubMenu(item, opener, actionId);
      }
      if (this._parentMenuItem) {
        this._parentMenuItem._preventSubMenuClose = true;
      }
    }
    _prepareSubMenuPhone(item) {
      this._prepareCurrentItems(item.items);
      this._parentMenuItem = item;
      this._parentItemsStack.push(item);
    }
    _startOpenTimeout(item, opener, hoverId) {
      // If theres already a timeout, clears it
      this._clearTimeout();
      // Sets the new timeout
      this._timeout = setTimeout(() => {
        this._prepareSubMenuDesktopTablet(item, opener, hoverId);
      }, MENU_OPEN_DELAY);
    }
    _startCloseTimeout(item) {
      // If theres already a timeout, clears it
      this._clearTimeout();
      // Sets the new timeout
      this._timeout = setTimeout(() => {
        this._closeItemSubMenu(item);
      }, MENU_CLOSE_DELAY);
    }
    _clearTimeout() {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
    }
    _itemMouseOver(e) {
      if ((0, _Device.isDesktop)()) {
        // respect mouseover only on desktop
        const opener = e.target;
        const item = opener.associatedItem;
        const hoverId = opener.getAttribute("id");
        opener.focus();
        // If there is a pending close operation, cancel it
        this._clearTimeout();
        // Opens submenu with 300ms delay
        this._startOpenTimeout(item, opener, hoverId);
      }
    }
    _busyMouseOver() {
      if (this._parentMenuItem) {
        this._parentMenuItem._preventSubMenuClose = true;
      }
    }
    _itemMouseOut(e) {
      if ((0, _Device.isDesktop)()) {
        const opener = e.target;
        const item = opener.associatedItem;
        // If there is a pending open operation, cancel it
        this._clearTimeout();
        // Close submenu with 400ms delay
        if (item && item.hasSubmenu && item._subMenu) {
          // try to close the sub-menu
          item._preventSubMenuClose = false;
          this._startCloseTimeout(item);
        }
      }
    }
    _itemKeyDown(e) {
      const isMenuClose = this.isRtl ? (0, _Keys.isRight)(e) : (0, _Keys.isLeft)(e);
      const isMenuOpen = this.isRtl ? (0, _Keys.isLeft)(e) : (0, _Keys.isRight)(e);
      if ((0, _Keys.isEnter)(e)) {
        e.preventDefault();
      }
      if (isMenuOpen) {
        const opener = e.target;
        const item = opener.associatedItem;
        const hoverId = opener.getAttribute("id");
        item.hasSubmenu && this._prepareSubMenuDesktopTablet(item, opener, hoverId);
      } else if (isMenuClose && this._isSubMenu && this._parentMenuItem) {
        const parentMenuItemParent = this._parentMenuItem.parentElement;
        parentMenuItemParent._closeItemSubMenu(this._parentMenuItem, true);
      }
    }
    _itemClick(e) {
      const opener = e.detail.item;
      const item = opener.associatedItem;
      const actionId = opener.getAttribute("id");
      if (!item.hasSubmenu) {
        // click on an item that doesn't have sub-items fires an "item-click" event
        if (!this._isSubMenu) {
          if ((0, _Device.isPhone)()) {
            this._parentMenuItem = undefined;
          }
          // fire event if the click is on top-level menu item
          const prevented = !this.fireEvent("item-click", {
            "item": item,
            "text": item.text
          }, true, false);
          if (!prevented) {
            this._popover.close();
          }
        } else {
          const mainMenu = this._findMainMenu(item);
          const prevented = !mainMenu.fireEvent("item-click", {
            "item": item,
            "text": item.text
          }, true, false);
          if (!prevented) {
            let openerMenuItem = item;
            let parentMenu = openerMenuItem.parentElement;
            do {
              openerMenuItem._preventSubMenuClose = false;
              this._closeItemSubMenu(openerMenuItem);
              parentMenu = openerMenuItem.parentElement;
              openerMenuItem = parentMenu._parentMenuItem;
            } while (parentMenu._parentMenuItem);
            mainMenu._popover.close();
          }
        }
      } else if ((0, _Device.isPhone)()) {
        // prepares and opens sub-menu on phone
        this._prepareSubMenuPhone(item);
      } else if ((0, _Device.isTablet)()) {
        // prepares and opens sub-menu on tablet
        this._prepareSubMenuDesktopTablet(item, opener, actionId);
      }
    }
    _findMainMenu(item) {
      let parentMenu = item.parentElement;
      while (parentMenu._parentMenuItem) {
        parentMenu = parentMenu._parentMenuItem.parentElement;
      }
      return parentMenu;
    }
    _beforePopoverOpen(e) {
      const prevented = !this.fireEvent("before-open", {}, true, false);
      if (prevented) {
        this.open = false;
        e.preventDefault();
      }
    }
    _afterPopoverOpen() {
      this.open = true;
      this.fireEvent("after-open");
    }
    _beforePopoverClose(e) {
      const prevented = !this.fireEvent("before-close", {
        escPressed: e.detail.escPressed
      }, true, false);
      if (prevented) {
        this.open = true;
        e.preventDefault();
        return;
      }
      if (this._openedSubMenuItem) {
        this._openedSubMenuItem._preventSubMenuClose = false;
        this._closeItemSubMenu(this._openedSubMenuItem);
      }
    }
    _afterPopoverClose() {
      this.open = false;
      this.fireEvent("after-close");
    }
  };
  __decorate([(0, _property.default)()], Menu.prototype, "headerText", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Menu.prototype, "open", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Menu.prototype, "busy", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 1000
  })], Menu.prototype, "busyDelay", void 0);
  __decorate([(0, _property.default)({
    validator: _DOMReference.default,
    defaultValue: ""
  })], Menu.prototype, "opener", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], Menu.prototype, "_isSubMenu", void 0);
  __decorate([(0, _property.default)()], Menu.prototype, "_subMenuOpenerId", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], Menu.prototype, "_currentItems", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], Menu.prototype, "_parentItemsStack", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    defaultValue: undefined
  })], Menu.prototype, "_popover", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    defaultValue: undefined
  })], Menu.prototype, "_parentMenuItem", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    defaultValue: undefined
  })], Menu.prototype, "_openedSubMenuItem", void 0);
  __decorate([(0, _slot.default)({
    "default": true,
    type: HTMLElement,
    invalidateOnChildChange: true
  })], Menu.prototype, "items", void 0);
  Menu = Menu_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-menu",
    renderer: _LitRenderer.default,
    staticAreaStyles: _Menu.default,
    staticAreaTemplate: _MenuTemplate.default,
    dependencies: [_ResponsivePopover.default, _Button.default, _List.default, _StandardListItem.default, _Icon.default, _BusyIndicator.default]
  })
  /**
   * Fired when an item is being clicked.
   * <b>Note:</b> Since 1.17.0 the event is preventable, allowing the menu to remain open after an item is pressed.
   *
   * @event sap.ui.webc.main.Menu#item-click
   * @allowPreventDefault
   * @param { HTMLElement } item The currently clicked menu item.
   * @param { string } text The text of the currently clicked menu item.
   * @public
   */, (0, _event.default)("item-click", {
    detail: {
      item: {
        type: HTMLElement
      },
      text: {
        type: String
      }
    }
  })
  /**
   * Fired before the menu is opened. This event can be cancelled, which will prevent the menu from opening. <b>This event does not bubble.</b>
   * <b>Note:</b> Since 1.14.0 the event is also fired before a sub-menu opens.
   *
   * @public
   * @event sap.ui.webc.main.Menu#before-open
   * @allowPreventDefault
   * @since 1.10.0
   * @param { HTMLElement } item The <code>ui5-menu-item</code> that triggers opening of the sub-menu or undefined when fired upon root menu opening. <b>Note:</b> available since 1.14.0.
   */, (0, _event.default)("before-open", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired after the menu is opened. <b>This event does not bubble.</b>
   *
   * @public
   * @event sap.ui.webc.main.Menu#after-open
   * @since 1.10.0
   */, (0, _event.default)("after-open")
  /**
   * Fired before the menu is closed. This event can be cancelled, which will prevent the menu from closing. <b>This event does not bubble.</b>
   *
   * @public
   * @event sap.ui.webc.main.Menu#before-close
   * @allowPreventDefault
   * @param {boolean} escPressed Indicates that <code>ESC</code> key has triggered the event.
   * @since 1.10.0
   */, (0, _event.default)("before-close", {
    detail: {
      escPressed: {
        type: Boolean
      }
    }
  })
  /**
   * Fired after the menu is closed. <b>This event does not bubble.</b>
   *
   * @public
   * @event sap.ui.webc.main.Menu#after-close
   * @since 1.10.0
   */, (0, _event.default)("after-close")], Menu);
  Menu.define();
  var _default = Menu;
  _exports.default = _default;
});