sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/types/NavigationMode", "sap/ui/webc/common/thirdparty/base/UI5Element", "./types/BreadcrumbsDesign", "./types/BreadcrumbsSeparatorStyle", "./BreadcrumbsItem", "./generated/i18n/i18n-defaults", "./Link", "./Label", "./ResponsivePopover", "./List", "./StandardListItem", "./Icon", "./Button", "./generated/templates/BreadcrumbsTemplate.lit", "./generated/templates/BreadcrumbsPopoverTemplate.lit", "./generated/themes/Breadcrumbs.css", "./generated/themes/BreadcrumbsPopover.css"], function (_exports, _ItemNavigation, _LitRenderer, _Keys, _Integer, _i18nBundle, _ResizeHandler, _NavigationMode, _UI5Element, _BreadcrumbsDesign, _BreadcrumbsSeparatorStyle, _BreadcrumbsItem, _i18nDefaults, _Link, _Label, _ResponsivePopover, _List, _StandardListItem, _Icon, _Button, _BreadcrumbsTemplate, _BreadcrumbsPopoverTemplate, _Breadcrumbs, _BreadcrumbsPopover) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _ItemNavigation = _interopRequireDefault(_ItemNavigation);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Integer = _interopRequireDefault(_Integer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _NavigationMode = _interopRequireDefault(_NavigationMode);
  _UI5Element = _interopRequireDefault(_UI5Element);
  _BreadcrumbsDesign = _interopRequireDefault(_BreadcrumbsDesign);
  _BreadcrumbsSeparatorStyle = _interopRequireDefault(_BreadcrumbsSeparatorStyle);
  _BreadcrumbsItem = _interopRequireDefault(_BreadcrumbsItem);
  _Link = _interopRequireDefault(_Link);
  _Label = _interopRequireDefault(_Label);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  _List = _interopRequireDefault(_List);
  _StandardListItem = _interopRequireDefault(_StandardListItem);
  _Icon = _interopRequireDefault(_Icon);
  _Button = _interopRequireDefault(_Button);
  _BreadcrumbsTemplate = _interopRequireDefault(_BreadcrumbsTemplate);
  _BreadcrumbsPopoverTemplate = _interopRequireDefault(_BreadcrumbsPopoverTemplate);
  _Breadcrumbs = _interopRequireDefault(_Breadcrumbs);
  _BreadcrumbsPopover = _interopRequireDefault(_BreadcrumbsPopover);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Templates

  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-breadcrumbs",
    managedSlots: true,
    languageAware: true,
    slots: /** @lends sap.ui.webcomponents.main.Breadcrumbs.prototype */{
      /**
       * Defines the component items.
       *
       * <br><br>
       * <b>Note:</b> Use the <code>ui5-breadcrumbs-item</code> component to define the desired items.
       * @type {sap.ui.webcomponents.main.IBreadcrumbsItem[]}
       * @slot items
       * @public
       */
      "default": {
        propertyName: "items",
        type: HTMLElement,
        invalidateOnChildChange: true
      }
    },
    properties: /** @lends sap.ui.webcomponents.main.Breadcrumbs.prototype */{
      /**
       * Defines the visual indication and behavior of the breadcrumbs.
       * Available options are <code>Standard</code> (by default) and <code>NoCurrentPage</code>.
       * <br><br>
       * <b>Note:</b> The <code>Standard</code> breadcrumbs show the current page as the last item in the trail.
       * The last item contains only plain text and is not a link.
       *
       * @type {BreadcrumbsDesign}
       * @defaultvalue "Standard"
       * @public
      */
      design: {
        type: _BreadcrumbsDesign.default,
        defaultValue: _BreadcrumbsDesign.default.Standard
      },
      /**
       * Determines the visual style of the separator between the breadcrumb items.
       *
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>Slash</code></li>
       * <li><code>BackSlash</code></li>
       * <li><code>DoubleBackSlash</code></li>
       * <li><code>DoubleGreaterThan</code></li>
       * <li><code>DoubleSlash</code></li>
       * <li><code>GreaterThan</code></li>
       * </ul>
       *
       * @type {BreadcrumbsSeparatorStyle}
       * @defaultvalue "Slash"
       * @public
       */
      separatorStyle: {
        type: _BreadcrumbsSeparatorStyle.default,
        defaultValue: _BreadcrumbsSeparatorStyle.default.Slash
      },
      /**
       * Holds the number of items in the overflow.
       *
       * @type {Integer}
       * @defaultvalue 0
       * @private
       */
      _overflowSize: {
        type: _Integer.default,
        noAttribute: true,
        defaultValue: 0
      }
    },
    events: /** @lends sap.ui.webcomponents.main.Breadcrumbs.prototype */{
      /**
       * Fires when a <code>BreadcrumbsItem</code> is clicked.
       * <b>Note:</b> You can prevent browser location change by calling <code>event.preventDefault()</code>.
       *
       * @event sap.ui.webcomponents.main.Breadcrumbs#item-click
       * @allowPreventDefault
       * @param {HTMLElement} item The clicked item.
       * @param {Boolean} altKey Returns whether the "ALT" key was pressed when the event was triggered.
       * @param {Boolean} ctrlKey Returns whether the "CTRL" key was pressed when the event was triggered.
       * @param {Boolean} metaKey Returns whether the "META" key was pressed when the event was triggered.
       * @param {Boolean} shiftKey Returns whether the "SHIFT" key was pressed when the event was triggered.
       * @public
       */
      "item-click": {
        detail: {
          item: {
            type: HTMLElement
          },
          altKey: {
            type: Boolean
          },
          ctrlKey: {
            type: Boolean
          },
          metaKey: {
            type: Boolean
          },
          shiftKey: {
            type: Boolean
          }
        }
      }
    }
  };

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * Enables users to navigate between items by providing a list of links to previous steps in the user's navigation path.
   * It helps the user to be aware of their location within the application and allows faster navigation.
   * <br><br>
   * The last three steps can be accessed as links directly, while the remaining links prior to them are available
   * in a drop-down menu.
   * <br><br>
   * You can choose the type of separator to be used from a number of predefined options.
   *
   * <h3>Keyboard Handling</h3>
   * The <code>ui5-breadcrumbs</code> provides advanced keyboard handling.
   * <br>
   * <ul>
   * <li>[F4, ALT+UP, ALT+DOWN, SPACE, ENTER] - If the dropdown arrow is focused - opens/closes the drop-down.</li>
   * <li>[SPACE, ENTER] - Activates the focused item and triggers the <code>item-click</code> event.</li>
   * <li>[ESC] - Closes the drop-down.</li>
   * <li>[LEFT] - If the drop-down is closed - navigates one item to the left.</li>
   * <li>[RIGHT] - If the drop-down is closed - navigates one item to the right.</li>
   * <li>[UP] - If the drop-down is open - moves focus to the next item.</li>
   * <li>[DOWN] - If the drop-down is open - moves focus to the previous item.</li>
   * <li>[HOME] - Navigates to the first item.</li>
   * <li>[END] - Navigates to the last item.</li>
   * </ul>
   * <br>
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.Breadcrumbs
   * @extends UI5Element
   * @tagname ui5-breadcrumbs
   * @appenddocs BreadcrumbsItem
   * @public
   * @since 1.0.0-rc.15
   */
  class Breadcrumbs extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }
    static get render() {
      return _LitRenderer.default;
    }
    static get template() {
      return _BreadcrumbsTemplate.default;
    }
    static get staticAreaTemplate() {
      return _BreadcrumbsPopoverTemplate.default;
    }
    static get styles() {
      return _Breadcrumbs.default;
    }
    static get staticAreaStyles() {
      return _BreadcrumbsPopover.default;
    }
    constructor() {
      super();
      this._initItemNavigation();
      this._onResizeHandler = this._updateOverflow.bind(this);

      // maps items to their widths
      this._breadcrumbItemWidths = new WeakMap();
      // the width of the interactive element that opens the overflow
      this._dropdownArrowLinkWidth = 0;
      this._labelFocusAdaptor = {
        id: `${this._id}-labelWrapper`,
        getlabelWrapper: this.getCurrentLocationLabelWrapper.bind(this),
        set _tabIndex(value) {
          const wrapper = this.getlabelWrapper();
          wrapper && wrapper.setAttribute("tabindex", value);
        },
        get _tabIndex() {
          const wrapper = this.getlabelWrapper();
          return wrapper ? wrapper.getAttribute("tabindex") : undefined;
        }
      };
    }
    onInvalidation(changeInfo) {
      if (changeInfo.reason === "childchange") {
        const itemIndex = this.getSlottedNodes("items").indexOf(changeInfo.child),
          isInOverflow = itemIndex < this._overflowSize;
        if (isInOverflow) {
          // the content of an overflowing item has changed
          // => need to render the item outside the overflow to obtain its new width
          // => lower-down the <code>_overfowSize</code> to exclude that item from the overflow
          this._overflowSize = itemIndex;
        }
      }
    }
    onBeforeRendering() {
      this._preprocessItems();
    }
    onAfterRendering() {
      this._cacheWidths();
      this._updateOverflow();
    }
    onEnterDOM() {
      _ResizeHandler.default.register(this, this._onResizeHandler);
    }
    onExitDOM() {
      _ResizeHandler.default.deregister(this, this._onResizeHandler);
    }
    _initItemNavigation() {
      if (!this._itemNavigation) {
        this._itemNavigation = new _ItemNavigation.default(this, {
          navigationMode: _NavigationMode.default.Horizontal,
          getItemsCallback: () => this._getFocusableItems()
        });
      }
    }

    /**
     * Obtains the items for navigation via keyboard
     * @private
     */
    _getFocusableItems() {
      const items = this._links;
      if (!this._isOverflowEmpty) {
        items.unshift(this._dropdownArrowLink);
      }
      if (this._endsWithCurrentLocationLabel) {
        items.push(this._labelFocusAdaptor);
      }
      return items;
    }
    _onfocusin(event) {
      const target = event.target,
        labelWrapper = this.getCurrentLocationLabelWrapper(),
        currentItem = target === labelWrapper ? this._labelFocusAdaptor : target;
      this._itemNavigation.setCurrentItem(currentItem);
    }
    _onkeydown(event) {
      const isDropdownArrowFocused = this._isDropdownArrowFocused;
      if ((0, _Keys.isShow)(event) && isDropdownArrowFocused && !this._isOverflowEmpty) {
        event.preventDefault();
        this._toggleRespPopover();
        return;
      }
      if ((0, _Keys.isSpace)(event) && isDropdownArrowFocused && !this._isOverflowEmpty && !this._isPickerOpen) {
        event.preventDefault();
        return;
      }
      if (((0, _Keys.isEnter)(event) || (0, _Keys.isSpace)(event)) && this._isCurrentLocationLabelFocused) {
        this._onLabelPress();
      }
    }
    _onkeyup(event) {
      if (this._isDropdownArrowFocused && (0, _Keys.isSpace)(event) && !this._isOverflowEmpty && !this._isPickerOpen) {
        this._openRespPopover();
      }
    }

    /**
     * Caches the space required to render the content
     * @private
     */
    _cacheWidths() {
      const map = this._breadcrumbItemWidths,
        items = this.getSlottedNodes("items"),
        label = this._currentLocationLabel;
      for (let i = this._overflowSize; i < items.length; i++) {
        const item = items[i],
          link = this.shadowRoot.querySelector(`#${item._id}-link-wrapper`);
        map.set(item, this._getElementWidth(link) || 0);
      }
      if (items.length && this._endsWithCurrentLocationLabel && label) {
        const item = items[items.length - 1];
        map.set(item, this._getElementWidth(label));
      }
      if (!this._isOverflowEmpty) {
        this._dropdownArrowLinkWidth = this._getElementWidth(this.shadowRoot.querySelector(".ui5-breadcrumbs-dropdown-arrow-link-wrapper"));
      }
    }
    _updateOverflow() {
      const items = this.getSlottedNodes("items"),
        availableWidth = this.shadowRoot.querySelector(".ui5-breadcrumbs-root").offsetWidth;
      let requiredWidth = this._getTotalContentWidth(),
        overflowSize = 0;
      if (requiredWidth > availableWidth) {
        // need to show the component that opens the overflow
        requiredWidth += this._dropdownArrowLinkWidth;
      }
      while (requiredWidth > availableWidth && overflowSize < this._maxAllowedOverflowSize) {
        const itemToOverflow = items[overflowSize];
        let itemWidth = 0;
        if (this._isItemVisible(itemToOverflow)) {
          itemWidth = this._breadcrumbItemWidths.get(itemToOverflow) || 0;
        }

        // move the item to the overflow
        requiredWidth -= itemWidth;
        overflowSize++;
      }
      this._overflowSize = overflowSize;

      // if overflow was emptied while picker was open => close redundant popup
      if (this._isOverflowEmpty && this._isPickerOpen) {
        this.responsivePopover.close();
      }

      // if the last focused link has done into the overflow =>
      // ensure the first visible link is focusable
      const focusableItems = this._getFocusableItems();
      if (!focusableItems.some(x => x._tabIndex === "0")) {
        this._itemNavigation.setCurrentItem(focusableItems[0]);
      }
    }
    _getElementWidth(element) {
      if (element) {
        return Math.ceil(element.getBoundingClientRect().width);
      }
    }
    _getTotalContentWidth() {
      const items = this.getSlottedNodes("items"),
        widthsMap = this._breadcrumbItemWidths,
        totalLinksWidth = items.reduce((sum, link) => sum + widthsMap.get(link), 0);
      return totalLinksWidth;
    }
    _onLinkPress(event) {
      const link = event.target,
        items = this.getSlottedNodes("items"),
        item = items.find(x => `${x._id}-link` === link.id);
      if (!this.fireEvent("item-click", {
        item,
        ...event.detail
      }, true)) {
        event.preventDefault();
      }
    }
    _onLabelPress(event) {
      const items = this.getSlottedNodes("items"),
        item = items[items.length - 1];
      this.fireEvent("item-click", {
        item,
        ...event.detail
      });
    }
    _onOverflowListItemSelect(event) {
      const listItem = event.detail.selectedItems[0],
        items = this.getSlottedNodes("items"),
        item = items.find(x => `${x._id}-li` === listItem.id);
      if (this.fireEvent("item-click", {
        item
      }, true)) {
        window.open(item.href, item.target || "_self", "noopener,noreferrer");
        this.responsivePopover.close();
      }
    }
    async _respPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector("[ui5-responsive-popover]");
    }
    async _toggleRespPopover() {
      this.responsivePopover = await this._respPopover();
      if (this._isPickerOpen) {
        this._closeRespPopover();
      } else {
        this._openRespPopover();
      }
    }
    async _closeRespPopover() {
      this.responsivePopover && this.responsivePopover.close();
    }
    async _openRespPopover() {
      this.responsivePopover = await this._respPopover();
      this.responsivePopover.showAt(this._dropdownArrowLink);
    }
    _isItemVisible(item) {
      return !item.hidden && this._hasVisibleContent(item);
    }
    _hasVisibleContent(item) {
      // the check is not complete but may be extended in the future if needed to cover
      // cases besides the standard (UX-recommended) ones
      return item.innerText || Array.from(item.children).some(child => !child.hidden);
    }
    _preprocessItems() {
      this.items.forEach(item => {
        item._getRealDomRef = () => this.getDomRef().querySelector(`[data-ui5-stable*=${item.stableDomRef}]`);
      });
    }
    _getItemPositionText(position, size) {
      return Breadcrumbs.i18nBundle.getText(_i18nDefaults.BREADCRUMB_ITEM_POS, position, size);
    }
    _getItemAccessibleName(item, position, size) {
      const positionText = this._getItemPositionText(position, size);

      // innerText is needed as it is no longer read out when label is set
      let text = "";
      if (item.accessibleName) {
        text = `${item.textContent.trim()} ${item.accessibleName} ${positionText}`;
      } else {
        text = `${item.textContent.trim()} ${positionText}`;
      }
      return text;
    }
    getCurrentLocationLabelWrapper() {
      return this.shadowRoot.querySelector(".ui5-breadcrumbs-current-location > span");
    }
    get _visibleItems() {
      return this.getSlottedNodes("items").slice(this._overflowSize).filter(i => this._isItemVisible(i));
    }
    get _endsWithCurrentLocationLabel() {
      return this.design === _BreadcrumbsDesign.default.Standard;
    }
    get _currentLocationText() {
      const items = this.getSlottedNodes("items");
      if (this._endsWithCurrentLocationLabel && items.length) {
        const item = items[items.length - 1];
        if (this._isItemVisible(item)) {
          return item.innerText;
        }
      }
      return "";
    }
    get _currentLocationLabel() {
      return this.shadowRoot.querySelector(".ui5-breadcrumbs-current-location [ui5-label]");
    }
    get _isDropdownArrowFocused() {
      return this._dropdownArrowLink._tabIndex === "0";
    }
    get _isCurrentLocationLabelFocused() {
      const label = this.getCurrentLocationLabelWrapper();
      return label && label.tabIndex === 0;
    }

    /**
     * Returns the maximum allowed count of items in the overflow
     * with respect to the UX requirement to never overflow the last visible item
     */
    get _maxAllowedOverflowSize() {
      const items = this.getSlottedNodes("items").filter(item => this._isItemVisible(item));
      // all items except tha last visible one are allowed to overflow by UX requirement
      return items.length - 1;
    }

    /**
     * Getter for the interactive element that opens the overflow
     * @private
     */
    get _dropdownArrowLink() {
      return this.shadowRoot.querySelector(".ui5-breadcrumbs-dropdown-arrow-link-wrapper [ui5-link]");
    }

    /**
     * Getter for the list of abstract breadcrumb items to be rendered as list-items inside the overflow
     */
    get _overflowItemsData() {
      return this.getSlottedNodes("items").slice(0, this._overflowSize).filter(item => this._isItemVisible(item)).reverse();
    }

    /**
     * Getter for the list of abstract breadcrumb items to be rendered as links outside the overflow
     */
    get _linksData() {
      const items = this._visibleItems;
      const itemsCount = items.length; // get size before removing of current location

      if (this._endsWithCurrentLocationLabel) {
        items.pop();
      }
      return items.map((item, index) => {
        item._accessibleNameText = this._getItemAccessibleName(item, index + 1, itemsCount);
        return item;
      });
    }

    /**
     * Getter for accessible name of the current location. Includes the position of the current location and the size of the breadcrumbs
     */
    get _currentLocationAccName() {
      const items = this._visibleItems;
      const positionText = this._getItemPositionText(items.length, items.length);
      const lastItem = items[items.length - 1];
      if (!lastItem) {
        return positionText;
      }
      if (lastItem.accessibleName) {
        return `${lastItem.textContent.trim()} ${lastItem.accessibleName} ${positionText}`;
      }
      return `${lastItem.textContent.trim()} ${positionText}`;
    }

    /**
     * Getter for the list of links corresponding to the abstract breadcrumb items
     */
    get _links() {
      return Array.from(this.shadowRoot.querySelectorAll(".ui5-breadcrumbs-link-wrapper [ui5-link]"));
    }
    get _isOverflowEmpty() {
      return this._overflowItemsData.length === 0;
    }
    get _ariaHasPopup() {
      if (!this._isOverflowEmpty) {
        return "listbox";
      }
      return undefined;
    }
    get _isPickerOpen() {
      return !!this.responsivePopover && this.responsivePopover.opened;
    }
    get _accessibleNameText() {
      return Breadcrumbs.i18nBundle.getText(_i18nDefaults.BREADCRUMBS_ARIA_LABEL);
    }
    get _dropdownArrowAccessibleNameText() {
      return Breadcrumbs.i18nBundle.getText(_i18nDefaults.BREADCRUMBS_OVERFLOW_ARIA_LABEL);
    }
    get _cancelButtonText() {
      return Breadcrumbs.i18nBundle.getText(_i18nDefaults.BREADCRUMBS_CANCEL_BUTTON);
    }
    static get dependencies() {
      return [_BreadcrumbsItem.default, _Link.default, _Label.default, _ResponsivePopover.default, _List.default, _StandardListItem.default, _Icon.default, _Button.default];
    }
    static async onDefine() {
      Breadcrumbs.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  }
  Breadcrumbs.define();
  var _default = Breadcrumbs;
  _exports.default = _default;
});