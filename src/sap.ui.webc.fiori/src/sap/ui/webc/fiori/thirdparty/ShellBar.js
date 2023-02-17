sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/types/AnimationMode", "sap/ui/webc/common/thirdparty/base/config/AnimationMode", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/Render", "sap/ui/webc/main/thirdparty/StandardListItem", "sap/ui/webc/main/thirdparty/List", "sap/ui/webc/main/thirdparty/Popover", "sap/ui/webc/main/thirdparty/Button", "sap/ui/webc/main/thirdparty/types/HasPopup", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/icons/search", "sap/ui/webc/common/thirdparty/icons/bell", "sap/ui/webc/common/thirdparty/icons/overflow", "sap/ui/webc/common/thirdparty/icons/grid", "./generated/i18n/i18n-defaults", "./generated/templates/ShellBarTemplate.lit", "./generated/templates/ShellBarPopoverTemplate.lit", "./generated/themes/ShellBar.css", "./generated/themes/ShellBarPopover.css"], function (_exports, _UI5Element, _LitRenderer, _ResizeHandler, _FeaturesRegistry, _AnimationMode, _AnimationMode2, _Keys, _Render, _StandardListItem, _List, _Popover, _Button, _HasPopup, _i18nBundle, _search, _bell, _overflow, _grid, _i18nDefaults, _ShellBarTemplate, _ShellBarPopoverTemplate, _ShellBar, _ShellBarPopover) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
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
  // Templates

  // Styles

  const HANDLE_RESIZE_DEBOUNCE_RATE = 200; // ms

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-shellbar",
    languageAware: true,
    fastNavigation: true,
    properties: /** @lends sap.ui.webcomponents.fiori.ShellBar.prototype */{
      /**
       * Defines the <code>primaryTitle</code>.
       * <br><br>
       * <b>Note:</b> The <code>primaryTitle</code> would be hidden on S screen size (less than approx. 700px).
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      primaryTitle: {
        type: String
      },
      /**
       * Defines the <code>secondaryTitle</code>.
       * <br><br>
       * <b>Note:</b> The <code>secondaryTitle</code> would be hidden on S and M screen sizes (less than approx. 1300px).
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      secondaryTitle: {
        type: String
      },
      /**
       * Defines the <code>notificationsCount</code>,
       * displayed in the notification icon top-right corner.
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      notificationsCount: {
        type: String
      },
      /**
       * Defines, if the notification icon would be displayed.
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      showNotifications: {
        type: Boolean
      },
      /**
       * Defines, if the product switch icon would be displayed.
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      showProductSwitch: {
        type: Boolean
      },
      /**
       * Defines, if the product CoPilot icon would be displayed.
       * <br><b>Note:</b> By default the co-pilot is displayed as static SVG.
       * If you need an animated co-pilot, you can import the <code>"@ui5/webcomponents-fiori/dist/features/CoPilotAnimation.js"</code> module as add-on feature.
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      showCoPilot: {
        type: Boolean
      },
      /**
       * An object of strings that defines several additional accessibility texts
       * for even further customization.
       *
       * It supports the following fields:
       * - <code>profileButtonTitle</code>: defines the tooltip for the profile button
       * - <code>logoTitle</code>: defines the tooltip for the logo
       *
       * @type {object}
       * @public
       * @since 1.1.0
       */
      accessibilityTexts: {
        type: Object
      },
      /**
       * @private
       */
      breakpointSize: {
        type: String
      },
      /**
       * @private
       */
      showSearchField: {
        type: Boolean
      },
      /**
       * @private
       */
      coPilotActive: {
        type: Boolean
      },
      /**
       * @private
       */
      withLogo: {
        type: Boolean
      },
      _itemsInfo: {
        type: Object
      },
      _header: {
        type: Object
      },
      _menuPopoverItems: {
        type: String,
        multiple: true
      },
      _menuPopoverExpanded: {
        type: Boolean,
        noAttribute: true
      },
      _overflowPopoverExpanded: {
        type: Boolean,
        noAttribute: true
      },
      _fullWidthSearch: {
        type: Boolean,
        noAttribute: true
      }
    },
    managedSlots: true,
    slots: /** @lends sap.ui.webcomponents.fiori.ShellBar.prototype */{
      /**
       * Defines the <code>ui5-shellbar</code> aditional items.
       * <br><br>
       * <b>Note:</b>
       * You can use the &nbsp;&lt;ui5-shellbar-item>&lt;/ui5-shellbar-item>.
       *
       * @type {sap.ui.webcomponents.fiori.IShellBarItem[]}
       * @slot items
       * @public
       */
      "default": {
        propertyName: "items",
        type: HTMLElement,
        invalidateOnChildChange: true
      },
      /**
       * You can pass <code>ui5-avatar</code> to set the profile image/icon.
       * If no profile slot is set - profile will be excluded from actions.
       *
       * Note: We recommend not using the <code>size</code> attribute of <code>ui5-avatar</code> because
       * it should have specific size by design in the context of <code>ui5-shellbar</code> profile.
       * @type {sap.ui.webcomponents.main.IAvatar}
       * @slot
       * @since 1.0.0-rc.6
       * @public
       */
      profile: {
        type: HTMLElement
      },
      /**
       * Defines the logo of the <code>ui5-shellbar</code>.
       * For example, you can use <code>ui5-avatar</code> or <code>img</code> elements as logo.
       * @type {sap.ui.webcomponents.main.IAvatar}
       * @slot
       * @since 1.0.0-rc.8
       * @public
       */
      logo: {
        type: HTMLElement
      },
      /**
       * Defines the items displayed in menu after a click on the primary title.
       * <br><br>
       * <b>Note:</b>
       * You can use the &nbsp;&lt;ui5-li>&lt;/ui5-li> and its ancestors.
       *
       * @type {sap.ui.webcomponents.main.IListItem[]}
       * @slot
       * @since 0.10
       * @public
       */
      menuItems: {
        type: HTMLElement
      },
      /**
       * Defines the <code>ui5-input</code>, that will be used as a search field.
       *
       * @type {sap.ui.webcomponents.main.IInput}
       * @slot
       * @public
       */
      searchField: {
        type: HTMLElement
      },
      /**
       * Defines a <code>ui5-button</code> in the bar that will be placed in the beginning.
       * We encourage this slot to be used for a back or home button.
       * It gets overstyled to match ShellBar's styling.
       *
       * @type {sap.ui.webcomponents.main.IButton}
       * @slot
       * @public
       */
      startButton: {
        type: HTMLElement
      }
    },
    events: /** @lends sap.ui.webcomponents.fiori.ShellBar.prototype */{
      /**
       *
       * Fired, when the notification icon is activated.
       *
       *
       * @event sap.ui.webcomponents.fiori.ShellBar#notifications-click
       * @allowPreventDefault
       * @param {HTMLElement} targetRef dom ref of the activated element
       * @public
       */
      "notifications-click": {
        detail: {
          targetRef: {
            type: HTMLElement
          }
        }
      },
      /**
       * Fired, when the profile slot is present.
       *
       * @event sap.ui.webcomponents.fiori.ShellBar#profile-click
       * @param {HTMLElement} targetRef dom ref of the activated element
       * @public
       */
      "profile-click": {
        detail: {
          targetRef: {
            type: HTMLElement
          }
        }
      },
      /**
       * Fired, when the product switch icon is activated.
       * <b>Note:</b> You can prevent closing of overflow popover by calling <code>event.preventDefault()</code>.
       *
       * @event sap.ui.webcomponents.fiori.ShellBar#product-switch-click
       * @allowPreventDefault
       * @param {HTMLElement} targetRef dom ref of the activated element
       * @public
       */
      "product-switch-click": {
        detail: {
          targetRef: {
            type: HTMLElement
          }
        }
      },
      /**
       * Fired, when the logo is activated.
       *
       * @event sap.ui.webcomponents.fiori.ShellBar#logo-click
       * @param {HTMLElement} targetRef dom ref of the activated element
       * @since 0.10
       * @public
       */
      "logo-click": {
        detail: {
          targetRef: {
            type: HTMLElement
          }
        }
      },
      /**
       * Fired, when the co pilot is activated.
       *
       * @event sap.ui.webcomponents.fiori.ShellBar#co-pilot-click
       * @param {HTMLElement} targetRef dom ref of the activated element
       * @since 0.10
       * @public
       */
      "co-pilot-click": {
        detail: {
          targetRef: {
            type: HTMLElement
          }
        }
      },
      /**
       * Fired, when a menu item is activated
       * <b>Note:</b> You can prevent closing of overflow popover by calling <code>event.preventDefault()</code>.
       *
       * @event sap.ui.webcomponents.fiori.ShellBar#menu-item-click
       * @param {HTMLElement} item DOM ref of the activated list item
       * @since 0.10
       * @public
       */
      "menu-item-click": {
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
   * @alias sap.ui.webcomponents.fiori.ShellBar
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-shellbar
   * @appenddocs ShellBarItem
   * @public
   * @since 0.8.0
   */
  class ShellBar extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }
    static get render() {
      return _LitRenderer.default;
    }
    static get template() {
      return _ShellBarTemplate.default;
    }
    static get staticAreaTemplate() {
      return _ShellBarPopoverTemplate.default;
    }
    static get styles() {
      return _ShellBar.default;
    }
    static get staticAreaStyles() {
      return [_ShellBarPopover.default];
    }
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
      this._focusedItem = null;

      // marks if preventDefault() is called in item's press handler
      this._defaultItemPressPrevented = false;
      this.menuItemsObserver = new MutationObserver(() => {
        this._updateClonedMenuItems();
      });
      this._header = {
        press: async () => {
          this._updateClonedMenuItems();
          if (this.hasMenuItems) {
            const menuPopover = await this._getMenuPopover();
            menuPopover.showAt(this.shadowRoot.querySelector(".ui5-shellbar-menu-button"));
          }
        }
      };
      this._handleResize = async event => {
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
    _menuItemPress(event) {
      this.menuPopover.close();
      this.fireEvent("menu-item-click", {
        item: event.detail.selectedItems[0]
      }, true);
    }
    _logoPress() {
      this.fireEvent("logo-click", {
        targetRef: this.shadowRoot.querySelector(".ui5-shellbar-logo")
      });
    }
    _menuPopoverBeforeOpen() {
      this._menuPopoverExpanded = true;
    }
    _menuPopoverAfterClose() {
      this._menuPopoverExpanded = false;
    }
    _overflowPopoverBeforeOpen() {
      this._overflowPopoverExpanded = true;
    }
    _overflowPopoverAfterClose() {
      this._overflowPopoverExpanded = false;
    }
    _logoKeyup(event) {
      if ((0, _Keys.isSpace)(event)) {
        this._logoPress();
      }
    }
    _logoKeydown(event) {
      if ((0, _Keys.isSpace)(event)) {
        event.preventDefault();
        return;
      }
      if ((0, _Keys.isEnter)(event)) {
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
    _coPilotKeydown(event) {
      if ((0, _Keys.isSpace)(event)) {
        this.coPilotActive = true;
        event.preventDefault();
        return;
      }
      if ((0, _Keys.isEnter)(event)) {
        this.coPilotActive = true;
        this._fireCoPilotClick();
      }
    }
    _coPilotKeyup(event) {
      if ((0, _Keys.isSpace)(event)) {
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
     */
    closeOverflow() {
      if (this.overflowPopover) {
        this.overflowPopover.close();
      }
    }
    _handleBarBreakpoints() {
      const width = this.getBoundingClientRect().width;
      const breakpoints = ShellBar.FIORI_3_BREAKPOINTS;
      const size = breakpoints.find(bp1 => width < bp1) || ShellBar.FIORI_3_BREAKPOINTS[ShellBar.FIORI_3_BREAKPOINTS.length - 1];
      const mappedSize = ShellBar.FIORI_3_BREAKPOINTS_MAP[size];
      if (this.breakpointSize !== mappedSize) {
        this.breakpointSize = mappedSize;
      }
      return mappedSize;
    }
    _handleSizeS() {
      const hasIcons = this.showNotifications || this.showProductSwitch || this.searchField.length || this.items.length;
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
      let overflowCount = [].filter.call(elementsToOverflow, icon => {
        const iconRect = icon.getBoundingClientRect();
        if (isRTL) {
          return iconRect.left + iconRect.width > rightContainerRect.left + rightContainerRect.width;
        }
        return iconRect.left < rightContainerRect.left;
      });
      overflowCount = overflowCount.length;
      const items = this._getAllItems(!!overflowCount).filter(item => item.show);
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
        if (i < overflowCount) {
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
      overflowPopover.showAt(overflowButton);
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
    _handleSearchIconPress(event) {
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
    async _handleActionListClick(event) {
      if (!this._defaultItemPressPrevented) {
        this.closeOverflow();
        // wait for DOM to be updated when ui5-popover is closed, otherwise if Enter key is hold
        // there will be no visual indication that this has happened
        await (0, _Render.renderFinished)();
      }
      this._defaultItemPressPrevented = false;
    }
    _handleCustomActionPress(event) {
      const refItemId = event.target.getAttribute("data-ui5-external-action-item-id");
      if (refItemId) {
        const shellbarItem = this.items.find(item => {
          return item._id === refItemId;
        });
        const prevented = !shellbarItem.fireEvent("click", {
          targetRef: event.target
        }, true);
        this._defaultItemPressPrevented = prevented;
      }
    }
    _handleOverflowPress(event) {
      this._toggleActionPopover();
    }
    _handleNotificationsPress(event) {
      const notificationIconRef = this.shadowRoot.querySelector(".ui5-shellbar-bell-button");
      this._defaultItemPressPrevented = !this.fireEvent("notifications-click", {
        targetRef: notificationIconRef.classList.contains("ui5-shellbar-hidden-button") ? event.target : notificationIconRef
      }, true);
    }
    _handleProfilePress(event) {
      this.fireEvent("profile-click", {
        targetRef: this.shadowRoot.querySelector(".ui5-shellbar-image-button")
      });
    }
    _handleCancelButtonPress() {
      this.showSearchField = false;
    }
    _handleProductSwitchPress(event) {
      const buttonRef = this.shadowRoot.querySelector(".ui5-shellbar-button-product-switch");
      this._defaultItemPressPrevented = !this.fireEvent("product-switch-click", {
        targetRef: buttonRef.classList.contains("ui5-shellbar-hidden-button") ? event.target : buttonRef
      }, true);
    }

    /**
     * Returns the <code>logo</code> DOM ref.
     * @type { HTMLElement }
     * @public
     * @readonly
     * @since 1.0.0-rc.16
     */
    get logoDomRef() {
      return this.shadowRoot.querySelector(`*[data-ui5-stable="logo"]`);
    }

    /**
     * Returns the <code>copilot</code> DOM ref.
     * @type { HTMLElement }
     * @public
     * @readonly
     * @since 1.0.0-rc.16
     */
    get copilotDomRef() {
      return this.shadowRoot.querySelector(`*[data-ui5-stable="copilot"]`);
    }

    /**
     * Returns the <code>notifications</code> icon DOM ref.
     * @type { HTMLElement }
     * @public
     * @readonly
     * @since 1.0.0-rc.16
     */
    get notificationsDomRef() {
      return this.shadowRoot.querySelector(`*[data-ui5-stable="notifications"]`);
    }

    /**
     * Returns the <code>overflow</code> icon DOM ref.
     * @type { HTMLElement }
     * @public
     * @readonly
     * @since 1.0.0-rc.16
     */
    get overflowDomRef() {
      return this.shadowRoot.querySelector(`*[data-ui5-stable="overflow"]`);
    }

    /**
     * Returns the <code>profile</code> icon DOM ref.
     * @type { HTMLElement }
     * @public
     * @readonly
     * @since 1.0.0-rc.16
     */
    get profileDomRef() {
      return this.shadowRoot.querySelector(`*[data-ui5-stable="profile"]`);
    }

    /**
     * Returns the <code>product-switch</code> icon DOM ref.
     * @type { HTMLElement }
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
        text: "Search",
        classes: `${this.searchField.length ? "" : "ui5-shellbar-invisible-button"} ui5-shellbar-search-button ui5-shellbar-button`,
        priority: 4,
        domOrder: this.searchField.length ? ++domOrder : -1,
        styles: {
          order: this.searchField.length ? 1 : -10
        },
        id: `${this._id}-item-${1}`,
        press: this._handleSearchIconPress.bind(this),
        show: !!this.searchField.length
      }, ...this.items.map((item, index) => {
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
        text: "Notifications",
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
        text: "Product Switch",
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
          "ui5-shellbar-with-searchfield": this.searchField.length
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
      return ShellBar.i18nBundle.getText(_i18nDefaults.SHELLBAR_LABEL);
    }
    get _logoText() {
      return this.accessibilityTexts.logoTitle || ShellBar.i18nBundle.getText(_i18nDefaults.SHELLBAR_LOGO);
    }
    get _copilotText() {
      return ShellBar.i18nBundle.getText(_i18nDefaults.SHELLBAR_COPILOT);
    }
    get _notificationsText() {
      return ShellBar.i18nBundle.getText(_i18nDefaults.SHELLBAR_NOTIFICATIONS, this.notificationsCount);
    }
    get _cancelBtnText() {
      return ShellBar.i18nBundle.getText(_i18nDefaults.SHELLBAR_CANCEL);
    }
    get _showFullWidthSearch() {
      const size = this._handleBarBreakpoints();
      const searchBtnHidden = !!this.shadowRoot.querySelector(".ui5-shellbar-search-button.ui5-shellbar-hidden-button");
      return size === "S" || searchBtnHidden;
    }
    get _profileText() {
      return this.accessibilityTexts.profileButtonTitle || ShellBar.i18nBundle.getText(_i18nDefaults.SHELLBAR_PROFILE);
    }
    get _productsText() {
      return ShellBar.i18nBundle.getText(_i18nDefaults.SHELLBAR_PRODUCTS);
    }
    get _searchText() {
      return ShellBar.i18nBundle.getText(_i18nDefaults.SHELLBAR_SEARCH);
    }
    get _overflowText() {
      return ShellBar.i18nBundle.getText(_i18nDefaults.SHELLBAR_OVERFLOW);
    }
    get accInfo() {
      return {
        notifications: {
          "title": this._notificationsText
        },
        profile: {
          "title": this._profileText
        },
        products: {
          "title": this._productsText
        },
        search: {
          "title": this._searchText,
          "accessibilityAttributes": {
            expanded: this.showSearchField
          }
        },
        overflow: {
          "title": this._overflowText,
          "accessibilityAttributes": {
            hasPopup: _HasPopup.default.Menu,
            expanded: this._overflowPopoverExpanded
          }
        }
      };
    }
    static get dependencies() {
      return [_Button.default, _List.default, _Popover.default, _StandardListItem.default];
    }
    static async onDefine() {
      ShellBar.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents-fiori");
    }
  }
  ShellBar.define();
  var _default = ShellBar;
  _exports.default = _default;
});