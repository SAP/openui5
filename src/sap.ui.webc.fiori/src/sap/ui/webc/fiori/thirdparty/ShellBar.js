sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/types/AnimationMode", "sap/ui/webc/common/thirdparty/base/config/AnimationMode", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/Render", "sap/ui/webc/main/thirdparty/StandardListItem", "sap/ui/webc/main/thirdparty/List", "sap/ui/webc/main/thirdparty/Popover", "sap/ui/webc/main/thirdparty/Button", "sap/ui/webc/main/thirdparty/types/HasPopup", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/icons/search", "sap/ui/webc/common/thirdparty/icons/bell", "sap/ui/webc/common/thirdparty/icons/overflow", "sap/ui/webc/common/thirdparty/icons/grid", "./generated/templates/ShellBarTemplate.lit", "./generated/templates/ShellBarPopoverTemplate.lit", "./generated/themes/ShellBar.css", "./generated/themes/ShellBarPopover.css", "./generated/i18n/i18n-defaults"], function (_exports, _UI5Element, _property, _slot, _customElement, _event, _LitRenderer, _ResizeHandler, _FeaturesRegistry, _AnimationMode, _AnimationMode2, _Keys, _Render, _StandardListItem, _List, _Popover, _Button, _HasPopup, _i18nBundle, _search, _bell, _overflow, _grid, _ShellBarTemplate, _ShellBarPopoverTemplate, _ShellBar, _ShellBarPopover, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _customElement = _interopRequireDefault(_customElement);
  _event = _interopRequireDefault(_event);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _AnimationMode = _interopRequireDefault(_AnimationMode);
  _StandardListItem = _interopRequireDefault(_StandardListItem);
  _List = _interopRequireDefault(_List);
  _Popover = _interopRequireDefault(_Popover);
  _Button = _interopRequireDefault(_Button);
  _HasPopup = _interopRequireDefault(_HasPopup);
  _ShellBarTemplate = _interopRequireDefault(_ShellBarTemplate);
  _ShellBarPopoverTemplate = _interopRequireDefault(_ShellBarPopoverTemplate);
  _ShellBar = _interopRequireDefault(_ShellBar);
  _ShellBarPopover = _interopRequireDefault(_ShellBarPopover);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var ShellBar_1;

  // Templates

  // Styles

  const HANDLE_RESIZE_DEBOUNCE_RATE = 200; // ms
  /**
   * @class
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-shellbar</code> is meant to serve as an application header
   * and includes numerous built-in features, such as: logo, profile image/icon, title, search field, notifications and so on.
   * <br><br>
   *
   * <h3>Stable DOM Refs</h3>
   *
   * You can use the following stable DOM refs for the <code>ui5-shellbar</code>:
   * <ul>
   * <li>logo</li>
   * <li>copilot</li>
   * <li>notifications</li>
   * <li>overflow</li>
   * <li>profile</li>
   * <li>product-switch</li>
   * </ul>
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-shellbar</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>root - Used to style the outermost wrapper of the <code>ui5-shellbar</code></li>
   * </ul>
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
   * <code>import "@ui5/webcomponents-fiori/dist/ShellBar";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.fiori.ShellBar
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-shellbar
   * @appenddocs sap.ui.webc.fiori.ShellBarItem
   * @public
   * @since 0.8.0
   */
  let ShellBar = ShellBar_1 = class ShellBar extends _UI5Element.default {
    static get FIORI_3_BREAKPOINTS() {
      return [599, 1023, 1439, 1919, 10000];
    }
    static get FIORI_3_BREAKPOINTS_MAP() {
      return {
        "599": "S",
        "1023": "M",
        "1439": "L",
        "1919": "XL",
        "10000": "XXL"
      };
    }
    constructor() {
      super();
      this._itemsInfo = [];
      this._isInitialRendering = true;
      // marks if preventDefault() is called in item's press handler
      this._defaultItemPressPrevented = false;
      this.menuItemsObserver = new MutationObserver(() => {
        this._updateClonedMenuItems();
      });
      this._headerPress = async () => {
        this._updateClonedMenuItems();
        if (this.hasMenuItems) {
          const menuPopover = await this._getMenuPopover();
          menuPopover.showAt(this.shadowRoot.querySelector(".ui5-shellbar-menu-button"), true);
        }
      };
      this._handleResize = () => {
        this._debounce(async () => {
          await this._getResponsivePopover();
          this.overflowPopover.close();
          this._overflowActions();
        }, HANDLE_RESIZE_DEBOUNCE_RATE);
      };
    }
    _debounce(fn, delay) {
      clearTimeout(this._debounceInterval);
      this._debounceInterval = setTimeout(() => {
        this._debounceInterval = null;
        fn();
      }, delay);
    }
    _menuItemPress(e) {
      this.menuPopover.close();
      this.fireEvent("menu-item-click", {
        item: e.detail.selectedItems[0]
      }, true);
    }
    _logoPress() {
      this.fireEvent("logo-click", {
        targetRef: this.shadowRoot.querySelector(".ui5-shellbar-logo")
      });
    }
    _menuPopoverBeforeOpen() {
      this._menuPopoverExpanded = true;
      if (this.menuPopover.content && this.menuPopover.content.length) {
        this.menuPopover.content[0].focusFirstItem();
      }
    }
    _menuPopoverAfterClose() {
      this._menuPopoverExpanded = false;
    }
    _overflowPopoverBeforeOpen() {
      this._overflowPopoverExpanded = true;
      if (this.overflowPopover.content && this.overflowPopover.content.length) {
        this.overflowPopover.content[0].focusFirstItem();
      }
    }
    _overflowPopoverAfterClose() {
      this._overflowPopoverExpanded = false;
    }
    _logoKeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
        this._logoPress();
      }
    }
    _logoKeydown(e) {
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
        return;
      }
      if ((0, _Keys.isEnter)(e)) {
        this._logoPress();
      }
    }
    _fireCoPilotClick() {
      this.fireEvent("co-pilot-click", {
        targetRef: this.shadowRoot.querySelector(".ui5-shellbar-coPilot")
      });
    }
    _coPilotClick() {
      this._fireCoPilotClick();
    }
    _coPilotKeydown(e) {
      if ((0, _Keys.isSpace)(e)) {
        this.coPilotActive = true;
        e.preventDefault();
        return;
      }
      if ((0, _Keys.isEnter)(e)) {
        this.coPilotActive = true;
        this._fireCoPilotClick();
      }
    }
    _coPilotKeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
        this._fireCoPilotClick();
      }
      this.coPilotActive = false;
    }
    onBeforeRendering() {
      const animationsOn = (0, _AnimationMode2.getAnimationMode)() === _AnimationMode.default.Full;
      const coPilotAnimation = (0, _FeaturesRegistry.getFeature)("CoPilotAnimation");
      this.coPilot = coPilotAnimation && animationsOn ? coPilotAnimation : {
        animated: false
      };
      this.withLogo = this.hasLogo;
      this._hiddenIcons = this._itemsInfo.filter(info => {
        const isHidden = info.classes.indexOf("ui5-shellbar-hidden-button") !== -1;
        const isSet = info.classes.indexOf("ui5-shellbar-invisible-button") === -1;
        const isOverflowIcon = info.classes.indexOf("ui5-shellbar-overflow-button") !== -1;
        const isImageIcon = info.classes.indexOf("ui5-shellbar-image-button") !== -1;
        const shouldStayOnScreen = isOverflowIcon || isImageIcon && this.hasProfile;
        return isHidden && isSet && !shouldStayOnScreen;
      });
      this._observeMenuItems();
    }
    onAfterRendering() {
      this._overflowActions();
      this._fullWidthSearch = this._showFullWidthSearch;
    }
    /**
     * Closes the overflow area.
     * Useful to manually close the overflow after having suppressed automatic closing with preventDefault() of ShellbarItem's press event
     * @public
     * @method
     * @name sap.ui.webc.fiori.ShellBar#closeOverflow
     */
    closeOverflow() {
      if (this.overflowPopover) {
        this.overflowPopover.close();
      }
    }
    _handleBarBreakpoints() {
      const width = this.getBoundingClientRect().width;
      const breakpoints = ShellBar_1.FIORI_3_BREAKPOINTS;
      const size = breakpoints.find(bp1 => width <= bp1) || ShellBar_1.FIORI_3_BREAKPOINTS[ShellBar_1.FIORI_3_BREAKPOINTS.length - 1];
      const mappedSize = ShellBar_1.FIORI_3_BREAKPOINTS_MAP[size];
      if (this.breakpointSize !== mappedSize) {
        this.breakpointSize = mappedSize;
      }
      return mappedSize;
    }
    _handleSizeS() {
      const hasIcons = this.showNotifications || this.showProductSwitch || !!this.searchField.length || !!this.items.length;
      const newItems = this._getAllItems(hasIcons).map(info => {
        const isOverflowIcon = info.classes.indexOf("ui5-shellbar-overflow-button") !== -1;
        const isImageIcon = info.classes.indexOf("ui5-shellbar-image-button") !== -1;
        const shouldStayOnScreen = isOverflowIcon || isImageIcon && this.hasProfile;
        return {
          ...info,
          classes: `${info.classes} ${shouldStayOnScreen ? "" : "ui5-shellbar-hidden-button"} ui5-shellbar-button`,
          styles: {
            order: shouldStayOnScreen ? 1 : -1
          }
        };
      });
      this._updateItemsInfo(newItems);
    }
    _handleActionsOverflow() {
      const rightContainerRect = this.shadowRoot.querySelector(".ui5-shellbar-overflow-container-right").getBoundingClientRect();
      let overflowSelector = ".ui5-shellbar-button:not(.ui5-shellbar-overflow-button):not(.ui5-shellbar-invisible-button)";
      if (this.showSearchField) {
        overflowSelector += ",.ui5-shellbar-search-field";
      }
      const elementsToOverflow = this.shadowRoot.querySelectorAll(overflowSelector);
      const isRTL = this.effectiveDir === "rtl";
      const overflowButtons = [...elementsToOverflow].filter(icon => {
        const iconRect = icon.getBoundingClientRect();
        if (isRTL) {
          return iconRect.left + iconRect.width > rightContainerRect.left + rightContainerRect.width;
        }
        return iconRect.left < rightContainerRect.left;
      });
      const showOverflowButton = !!overflowButtons.length;
      const items = this._getAllItems(showOverflowButton).filter(item => item.show);
      const itemsByPriority = items.sort((item1, item2) => {
        if (item1.priority > item2.priority) {
          return 1;
        }
        if (item1.priority < item2.priority) {
          return -1;
        }
        return 0;
      });
      for (let i = 0; i < itemsByPriority.length; i++) {
        if (i < overflowButtons.length) {
          itemsByPriority[i].classes = `${itemsByPriority[i].classes} ui5-shellbar-hidden-button`;
          itemsByPriority[i].styles = {
            order: -1
          };
        }
      }
      return itemsByPriority;
    }
    _overflowActions() {
      const size = this._handleBarBreakpoints();
      if (size === "S") {
        return this._handleSizeS();
      }
      const newItems = this._handleActionsOverflow();
      this._updateItemsInfo(newItems);
    }
    async _toggleActionPopover() {
      const overflowButton = this.shadowRoot.querySelector(".ui5-shellbar-overflow-button");
      const overflowPopover = await this._getOverflowPopover();
      overflowPopover.showAt(overflowButton, true);
    }
    onEnterDOM() {
      _ResizeHandler.default.register(this, this._handleResize);
    }
    onExitDOM() {
      this.menuItemsObserver.disconnect();
      _ResizeHandler.default.deregister(this, this._handleResize);
      clearTimeout(this._debounceInterval);
      this._debounceInterval = null;
    }
    _handleSearchIconPress() {
      this.showSearchField = !this.showSearchField;
      if (!this.showSearchField) {
        return;
      }
      const input = this.searchField[0];
      // update the state immediately
      if (input) {
        input.focused = true;
      }
      // move the focus later
      setTimeout(() => {
        if (input) {
          input.focus();
        }
      }, 100);
    }
    async _handleActionListClick() {
      if (!this._defaultItemPressPrevented) {
        this.closeOverflow();
        // wait for DOM to be updated when ui5-popover is closed, otherwise if Enter key is hold
        // there will be no visual indication that this has happened
        await (0, _Render.renderFinished)();
      }
      this._defaultItemPressPrevented = false;
    }
    _handleCustomActionPress(e) {
      const target = e.target;
      const refItemId = target.getAttribute("data-ui5-external-action-item-id");
      if (refItemId) {
        const shellbarItem = this.items.find(item => {
          return item._id === refItemId;
        });
        const prevented = shellbarItem.fireClickEvent(e);
        this._defaultItemPressPrevented = prevented;
      }
    }
    _handleOverflowPress() {
      this._toggleActionPopover();
    }
    _handleNotificationsPress(e) {
      const notificationIconRef = this.shadowRoot.querySelector(".ui5-shellbar-bell-button"),
        target = e.target;
      this._defaultItemPressPrevented = !this.fireEvent("notifications-click", {
        targetRef: notificationIconRef.classList.contains("ui5-shellbar-hidden-button") ? target : notificationIconRef
      }, true);
    }
    _handleProfilePress() {
      this.fireEvent("profile-click", {
        targetRef: this.shadowRoot.querySelector(".ui5-shellbar-image-button")
      });
    }
    _handleCancelButtonPress() {
      this.showSearchField = false;
    }
    _handleProductSwitchPress(e) {
      const buttonRef = this.shadowRoot.querySelector(".ui5-shellbar-button-product-switch"),
        target = e.target;
      this._defaultItemPressPrevented = !this.fireEvent("product-switch-click", {
        targetRef: buttonRef.classList.contains("ui5-shellbar-hidden-button") ? target : buttonRef
      }, true);
    }
    /**
     * Returns the <code>logo</code> DOM ref.
     * @type {HTMLElement}
     * @name sap.ui.webc.fiori.ShellBar.prototype.logoDomRef
     * @public
     * @readonly
     * @since 1.0.0-rc.16
     */
    get logoDomRef() {
      return this.shadowRoot.querySelector(`*[data-ui5-stable="logo"]`);
    }
    /**
     * Returns the <code>copilot</code> DOM ref.
     * @type {HTMLElement}
     * @name sap.ui.webc.fiori.ShellBar.prototype.copilotDomRef
     * @public
     * @readonly
     * @since 1.0.0-rc.16
     */
    get copilotDomRef() {
      return this.shadowRoot.querySelector(`*[data-ui5-stable="copilot"]`);
    }
    /**
     * Returns the <code>notifications</code> icon DOM ref.
     * @type {HTMLElement}
     * @name sap.ui.webc.fiori.ShellBar.prototype.notificationsDomRef
     * @public
     * @readonly
     * @since 1.0.0-rc.16
     */
    get notificationsDomRef() {
      return this.shadowRoot.querySelector(`*[data-ui5-stable="notifications"]`);
    }
    /**
     * Returns the <code>overflow</code> icon DOM ref.
     * @type {HTMLElement}
     * @name sap.ui.webc.fiori.ShellBar.prototype.overflowDomRef
     * @public
     * @readonly
     * @since 1.0.0-rc.16
     */
    get overflowDomRef() {
      return this.shadowRoot.querySelector(`*[data-ui5-stable="overflow"]`);
    }
    /**
     * Returns the <code>profile</code> icon DOM ref.
     * @type {HTMLElement}
     * @name sap.ui.webc.fiori.ShellBar.prototype.profileDomRef
     * @public
     * @readonly
     * @since 1.0.0-rc.16
     */
    get profileDomRef() {
      return this.shadowRoot.querySelector(`*[data-ui5-stable="profile"]`);
    }
    /**
     * Returns the <code>product-switch</code> icon DOM ref.
     * @type {HTMLElement}
     * @name sap.ui.webc.fiori.ShellBar.prototype.productSwitchDomRef
     * @public
     * @readonly
     * @since 1.0.0-rc.16
     */
    get productSwitchDomRef() {
      return this.shadowRoot.querySelector(`*[data-ui5-stable="product-switch"]`);
    }
    /**
     * Returns all items that will be placed in the right of the bar as icons / dom elements.
     * @param {boolean} showOverflowButton Determines if overflow button should be visible (not overflowing)
     */
    _getAllItems(showOverflowButton) {
      let domOrder = -1;
      const items = [{
        icon: "search",
        text: this._searchText,
        classes: `${this.searchField.length ? "" : "ui5-shellbar-invisible-button"} ui5-shellbar-search-button ui5-shellbar-button`,
        priority: 4,
        domOrder: this.searchField.length ? ++domOrder : -1,
        styles: {
          order: this.searchField.length ? 1 : -10
        },
        id: `${this._id}-item-${1}`,
        press: this._handleSearchIconPress.bind(this),
        show: !!this.searchField.length
      }, ...this.items.map(item => {
        item._getRealDomRef = () => this.getDomRef().querySelector(`*[data-ui5-stable=${item.stableDomRef}]`);
        return {
          icon: item.icon,
          id: item._id,
          count: item.count || undefined,
          refItemid: item._id,
          text: item.text,
          classes: "ui5-shellbar-custom-item ui5-shellbar-button",
          priority: 1,
          domOrder: ++domOrder,
          styles: {
            order: 2
          },
          show: true,
          press: this._handleCustomActionPress.bind(this),
          custom: true,
          title: item.title,
          stableDomRef: item.stableDomRef
        };
      }), {
        icon: "bell",
        text: this._notificationsText,
        classes: `${this.showNotifications ? "" : "ui5-shellbar-invisible-button"} ui5-shellbar-bell-button ui5-shellbar-button`,
        priority: 3,
        styles: {
          order: this.showNotifications ? 3 : -10
        },
        id: `${this._id}-item-${2}`,
        show: this.showNotifications,
        domOrder: this.showNotifications ? ++domOrder : -1,
        press: this._handleNotificationsPress.bind(this)
      }, {
        icon: "overflow",
        text: "Overflow",
        classes: `${showOverflowButton ? "" : "ui5-shellbar-hidden-button"} ui5-shellbar-overflow-button-shown ui5-shellbar-overflow-button ui5-shellbar-button`,
        priority: 5,
        order: 4,
        styles: {
          order: showOverflowButton ? 4 : -1
        },
        domOrder: showOverflowButton ? ++domOrder : -1,
        id: `${this.id}-item-${5}`,
        press: this._handleOverflowPress.bind(this),
        show: true
      }, {
        text: "Person",
        classes: `${this.hasProfile ? "" : "ui5-shellbar-invisible-button"} ui5-shellbar-image-button ui5-shellbar-button`,
        priority: 4,
        styles: {
          order: this.hasProfile ? 5 : -10
        },
        profile: true,
        id: `${this._id}-item-${3}`,
        domOrder: this.hasProfile ? ++domOrder : -1,
        show: this.hasProfile,
        press: this._handleProfilePress.bind(this)
      }, {
        icon: "grid",
        text: this._productsText,
        classes: `${this.showProductSwitch ? "" : "ui5-shellbar-invisible-button"} ui5-shellbar-button ui5-shellbar-button-product-switch`,
        priority: 2,
        styles: {
          order: this.showProductSwitch ? 6 : -10
        },
        id: `${this._id}-item-${4}`,
        show: this.showProductSwitch,
        domOrder: this.showProductSwitch ? ++domOrder : -1,
        press: this._handleProductSwitchPress.bind(this)
      }];
      return items;
    }
    _updateItemsInfo(newItems) {
      const isDifferent = JSON.stringify(this._itemsInfo) !== JSON.stringify(newItems);
      if (isDifferent) {
        this._itemsInfo = newItems;
      }
    }
    _updateClonedMenuItems() {
      this._menuPopoverItems = [];
      this.menuItems.forEach(item => {
        // clone the menuItem and remove the slot="menuItems",
        // otherwise would not be slotted in the internal ui5-li
        const clonedItem = item.cloneNode(true);
        clonedItem.removeAttribute("slot");
        this._menuPopoverItems.push(clonedItem);
      });
    }
    _observeMenuItems() {
      this.menuItems.forEach(item => {
        this.menuItemsObserver.observe(item, {
          characterData: true,
          childList: true,
          subtree: true,
          attributes: true
        });
      });
    }
    async _getResponsivePopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      this.overflowPopover = staticAreaItem.querySelector(".ui5-shellbar-overflow-popover");
      this.menuPopover = staticAreaItem.querySelector(".ui5-shellbar-menu-popover");
    }
    async _getOverflowPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector(".ui5-shellbar-overflow-popover");
    }
    async _getMenuPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector(".ui5-shellbar-menu-popover");
    }
    isIconHidden(name) {
      const itemInfo = this._itemsInfo.find(item => item.icon === name);
      if (!itemInfo) {
        return false;
      }
      return itemInfo.classes.indexOf("ui5-shellbar-hidden-button") !== -1;
    }
    get classes() {
      return {
        wrapper: {
          "ui5-shellbar-root": true,
          "ui5-shellbar-with-searchfield": this.hasSearchField
        },
        button: {
          "ui5-shellbar-menu-button--interactive": this.hasMenuItems,
          "ui5-shellbar-menu-button": true
        },
        items: {
          notification: {
            "ui5-shellbar-hidden-button": this.isIconHidden("bell")
          },
          product: {
            "ui5-shellbar-hidden-button": this.isIconHidden("grid")
          },
          search: {
            "ui5-shellbar-hidden-button": this.isIconHidden("search")
          },
          overflow: {
            "ui5-shellbar-hidden-button": this.isIconHidden("overflow")
          }
        }
      };
    }
    get styles() {
      return {
        items: {
          notification: {
            "order": this.isIconHidden("bell") ? "-1" : "3"
          },
          overflow: {
            "order": this.isIconHidden("overflow") ? "-1" : "4"
          },
          profile: {
            "order": this.hasProfile ? "5" : "-1"
          },
          product: {
            "order": this.isIconHidden("grid") ? "-1" : "6"
          }
        },
        searchField: {
          "display": this.correctSearchFieldStyles
        }
      };
    }
    get correctSearchFieldStyles() {
      if (this.showSearchField) {
        return "flex";
      }
      return "none";
    }
    get customItemsInfo() {
      return this._itemsInfo.filter(itemInfo => !!itemInfo.custom);
    }
    get hasLogo() {
      return !!this.logo.length;
    }
    get showLogoInMenuButton() {
      return this.hasLogo && this.breakpointSize === "S";
    }
    get showTitleInMenuButton() {
      return this.primaryTitle && !this.showLogoInMenuButton;
    }
    get showMenuButton() {
      return this.primaryTitle || this.showLogoInMenuButton;
    }
    get popoverHorizontalAlign() {
      return this.effectiveDir === "rtl" ? "Left" : "Right";
    }
    get hasSearchField() {
      return !!this.searchField.length;
    }
    get hasProfile() {
      return !!this.profile.length;
    }
    get hasMenuItems() {
      return this.menuItems.length > 0;
    }
    get _shellbarText() {
      return ShellBar_1.i18nBundle.getText(_i18nDefaults.SHELLBAR_LABEL);
    }
    get _logoText() {
      return this.accessibilityTexts.logoTitle || ShellBar_1.i18nBundle.getText(_i18nDefaults.SHELLBAR_LOGO);
    }
    get _copilotText() {
      return ShellBar_1.i18nBundle.getText(_i18nDefaults.SHELLBAR_COPILOT);
    }
    get _notificationsText() {
      return ShellBar_1.i18nBundle.getText(_i18nDefaults.SHELLBAR_NOTIFICATIONS, this.notificationsCount);
    }
    get _cancelBtnText() {
      return ShellBar_1.i18nBundle.getText(_i18nDefaults.SHELLBAR_CANCEL);
    }
    get _showFullWidthSearch() {
      const size = this._handleBarBreakpoints();
      const searchBtnHidden = !!this.shadowRoot.querySelector(".ui5-shellbar-search-button.ui5-shellbar-hidden-button");
      return size === "S" || searchBtnHidden;
    }
    get _profileText() {
      return this.accessibilityTexts.profileButtonTitle || ShellBar_1.i18nBundle.getText(_i18nDefaults.SHELLBAR_PROFILE);
    }
    get _productsText() {
      return ShellBar_1.i18nBundle.getText(_i18nDefaults.SHELLBAR_PRODUCTS);
    }
    get _searchText() {
      return ShellBar_1.i18nBundle.getText(_i18nDefaults.SHELLBAR_SEARCH);
    }
    get _overflowText() {
      return ShellBar_1.i18nBundle.getText(_i18nDefaults.SHELLBAR_OVERFLOW);
    }
    get accInfo() {
      return {
        notifications: {
          "title": this._notificationsText,
          "accessibilityAttributes": {
            hasPopup: this._notificationsHasPopup
          }
        },
        profile: {
          "title": this._profileText,
          "accessibilityAttributes": {
            hasPopup: this._profileHasPopup
          }
        },
        products: {
          "title": this._productsText,
          "accessibilityAttributes": {
            hasPopup: this._productsHasPopup
          }
        },
        search: {
          "title": this._searchText,
          "accessibilityAttributes": {
            hasPopup: this._searchHasPopup,
            expanded: this.showSearchField
          }
        },
        overflow: {
          "title": this._overflowText,
          "accessibilityAttributes": {
            hasPopup: this._overflowHasPopup,
            expanded: this._overflowPopoverExpanded
          }
        }
      };
    }
    get _notificationsHasPopup() {
      const notificationsAccAttributes = this.accessibilityAttributes.notifications;
      return notificationsAccAttributes ? notificationsAccAttributes.ariaHasPopup : null;
    }
    get _profileHasPopup() {
      const profileAccAttributes = this.accessibilityAttributes.profile;
      return profileAccAttributes ? profileAccAttributes.ariaHasPopup : null;
    }
    get _productsHasPopup() {
      const productsAccAttributes = this.accessibilityAttributes.product;
      return productsAccAttributes ? productsAccAttributes.ariaHasPopup : null;
    }
    get _searchHasPopup() {
      const searcAccAttributes = this.accessibilityAttributes.search;
      return searcAccAttributes ? searcAccAttributes.ariaHasPopup : null;
    }
    get _overflowHasPopup() {
      const overflowAccAttributes = this.accessibilityAttributes.overflow;
      return overflowAccAttributes ? overflowAccAttributes.ariaHasPopup : _HasPopup.default.Menu;
    }
    get accLogoRole() {
      return this.accessibilityRoles.logoRole || "button";
    }
    static async onDefine() {
      ShellBar_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori");
    }
  };
  __decorate([(0, _property.default)()], ShellBar.prototype, "primaryTitle", void 0);
  __decorate([(0, _property.default)()], ShellBar.prototype, "secondaryTitle", void 0);
  __decorate([(0, _property.default)()], ShellBar.prototype, "notificationsCount", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ShellBar.prototype, "showNotifications", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ShellBar.prototype, "showProductSwitch", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ShellBar.prototype, "showCoPilot", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ShellBar.prototype, "showSearchField", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], ShellBar.prototype, "accessibilityRoles", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], ShellBar.prototype, "accessibilityTexts", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], ShellBar.prototype, "accessibilityAttributes", void 0);
  __decorate([(0, _property.default)()], ShellBar.prototype, "breakpointSize", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ShellBar.prototype, "coPilotActive", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ShellBar.prototype, "withLogo", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], ShellBar.prototype, "_itemsInfo", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], ShellBar.prototype, "_menuPopoverItems", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], ShellBar.prototype, "_menuPopoverExpanded", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], ShellBar.prototype, "_overflowPopoverExpanded", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], ShellBar.prototype, "_fullWidthSearch", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true,
    invalidateOnChildChange: true
  })], ShellBar.prototype, "items", void 0);
  __decorate([(0, _slot.default)()], ShellBar.prototype, "profile", void 0);
  __decorate([(0, _slot.default)()], ShellBar.prototype, "logo", void 0);
  __decorate([(0, _slot.default)()], ShellBar.prototype, "menuItems", void 0);
  __decorate([(0, _slot.default)()], ShellBar.prototype, "searchField", void 0);
  __decorate([(0, _slot.default)()], ShellBar.prototype, "startButton", void 0);
  ShellBar = ShellBar_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-shellbar",
    fastNavigation: true,
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _ShellBarTemplate.default,
    staticAreaTemplate: _ShellBarPopoverTemplate.default,
    styles: _ShellBar.default,
    staticAreaStyles: [_ShellBarPopover.default],
    dependencies: [_Button.default, _List.default, _Popover.default, _StandardListItem.default]
  })
  /**
   *
   * Fired, when the notification icon is activated.
   *
   * @event sap.ui.webc.fiori.ShellBar#notifications-click
   * @allowPreventDefault
   * @param {HTMLElement} targetRef dom ref of the activated element
   * @public
   */, (0, _event.default)("notifications-click", {
    detail: {
      targetRef: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired, when the profile slot is present.
   *
   * @event sap.ui.webc.fiori.ShellBar#profile-click
   * @param {HTMLElement} targetRef dom ref of the activated element
   * @public
   */, (0, _event.default)("profile-click", {
    detail: {
      targetRef: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired, when the product switch icon is activated.
   * <b>Note:</b> You can prevent closing of overflow popover by calling <code>event.preventDefault()</code>.
   *
   * @event sap.ui.webc.fiori.ShellBar#product-switch-click
   * @allowPreventDefault
   * @param {HTMLElement} targetRef dom ref of the activated element
   * @public
   */, (0, _event.default)("product-switch-click", {
    detail: {
      targetRef: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired, when the logo is activated.
   *
   * @event sap.ui.webc.fiori.ShellBar#logo-click
   * @param {HTMLElement} targetRef dom ref of the activated element
   * @since 0.10
   * @public
   */, (0, _event.default)("logo-click", {
    detail: {
      targetRef: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired, when the co pilot is activated.
   *
   * @event sap.ui.webc.fiori.ShellBar#co-pilot-click
   * @param {HTMLElement} targetRef dom ref of the activated element
   * @since 0.10
   * @public
   */, (0, _event.default)("co-pilot-click", {
    detail: {
      targetRef: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired, when a menu item is activated
   * <b>Note:</b> You can prevent closing of overflow popover by calling <code>event.preventDefault()</code>.
   *
   * @event sap.ui.webc.fiori.ShellBar#menu-item-click
   * @param {HTMLElement} item DOM ref of the activated list item
   * @since 0.10
   * @public
   */, (0, _event.default)("menu-item-click", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })], ShellBar);
  ShellBar.define();
  var _default = ShellBar;
  _exports.default = _default;
});