sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/Render", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/types/NavigationMode", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/util/getNormalizedTarget", "sap/ui/webc/common/thirdparty/base/util/getEffectiveScrollbarStyle", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/util/debounce", "sap/ui/webc/common/thirdparty/base/util/isElementInView", "./types/ListMode", "./types/ListGrowingMode", "./types/ListSeparators", "./BusyIndicator", "./generated/templates/ListTemplate.lit", "./generated/themes/List.css", "./generated/themes/BrowserScrollbar.css", "./generated/i18n/i18n-defaults"], function (_exports, _UI5Element, _LitRenderer, _ResizeHandler, _ItemNavigation, _property, _event, _customElement, _slot, _Render, _Keys, _Integer, _NavigationMode, _AriaLabelHelper, _getNormalizedTarget, _getEffectiveScrollbarStyle, _i18nBundle, _debounce, _isElementInView, _ListMode, _ListGrowingMode, _ListSeparators, _BusyIndicator, _ListTemplate, _List, _BrowserScrollbar, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _ItemNavigation = _interopRequireDefault(_ItemNavigation);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _customElement = _interopRequireDefault(_customElement);
  _slot = _interopRequireDefault(_slot);
  _Integer = _interopRequireDefault(_Integer);
  _NavigationMode = _interopRequireDefault(_NavigationMode);
  _getNormalizedTarget = _interopRequireDefault(_getNormalizedTarget);
  _getEffectiveScrollbarStyle = _interopRequireDefault(_getEffectiveScrollbarStyle);
  _debounce = _interopRequireDefault(_debounce);
  _isElementInView = _interopRequireDefault(_isElementInView);
  _ListMode = _interopRequireDefault(_ListMode);
  _ListGrowingMode = _interopRequireDefault(_ListGrowingMode);
  _ListSeparators = _interopRequireDefault(_ListSeparators);
  _BusyIndicator = _interopRequireDefault(_BusyIndicator);
  _ListTemplate = _interopRequireDefault(_ListTemplate);
  _List = _interopRequireDefault(_List);
  _BrowserScrollbar = _interopRequireDefault(_BrowserScrollbar);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var List_1;

  // Template

  // Styles

  // Texts

  const INFINITE_SCROLL_DEBOUNCE_RATE = 250; // ms
  const PAGE_UP_DOWN_SIZE = 10;
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-list</code> component allows displaying a list of items, advanced keyboard
   * handling support for navigating between items, and predefined modes to improve the development efficiency.
   * <br><br>
   * The <code>ui5-list</code> is a container for the available list items:
   * <ul>
   * <li><code>ui5-li</code></li>
   * <li><code>ui5-li-custom</code></li>
   * <li><code>ui5-li-groupheader</code></li>
   * </ul>
   * <br><br>
   * To benefit from the built-in selection mechanism, you can use the available
   * selection modes, such as
   * <code>SingleSelect</code>, <code>MultiSelect</code> and <code>Delete</code>.
   * <br><br>
   * Additionally, the <code>ui5-list</code> provides header, footer, and customization for the list item separators.
   *
   * <br><br>
   * <h3>Keyboard Handling</h3>
   *
   * <h4>Basic Navigation</h4>
   * The <code>ui5-list</code> provides advanced keyboard handling.
   * When a list is focused the user can use the following keyboard
   * shortcuts in order to perform a navigation:
   * <br>
   *
   * <ul>
   * <li>[UP/DOWN] - Navigates up and down the items</li>
   * <li>[HOME] - Navigates to first item</li>
   * <li>[END] - Navigates to the last item</li>
   * </ul>
   *
   * The user can use the following keyboard shortcuts to perform actions (such as select, delete),
   * when the <code>mode</code> property is in use:
   * <ul>
   * <li>[SPACE] - Select an item (if <code>type</code> is 'Active') when <code>mode</code> is selection</li>
   * <li>[DELETE] - Delete an item if <code>mode</code> property is <code>Delete</code></li>
   * </ul>
   *
   * <h4>Fast Navigation</h4>
   * This component provides a build in fast navigation group which can be used via <code>F6 / Shift + F6</code> or <code> Ctrl + Alt(Option) + Down /  Ctrl + Alt(Option) + Up</code>.
   * In order to use this functionality, you need to import the following module:
   * <code>import "@ui5/webcomponents-base/dist/features/F6Navigation.js"</code>
   * <br><br>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/List.js";</code>
   * <br>
   * <code>import "@ui5/webcomponents/dist/StandardListItem.js";</code> (for <code>ui5-li</code>)
   * <br>
   * <code>import "@ui5/webcomponents/dist/CustomListItem.js";</code> (for <code>ui5-li-custom</code>)
   * <br>
   * <code>import "@ui5/webcomponents/dist/GroupHeaderListItem.js";</code> (for <code>ui5-li-groupheader</code>)
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.List
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-list
   * @appenddocs sap.ui.webc.main.StandardListItem sap.ui.webc.main.CustomListItem sap.ui.webc.main.GroupHeaderListItem
   * @public
   */
  let List = List_1 = class List extends _UI5Element.default {
    static async onDefine() {
      List_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    constructor() {
      super();
      this._previouslyFocusedItem = null;
      // Indicates that the List is forwarding the focus before or after the internal ul.
      this._forwardingFocus = false;
      // Indicates that the List has already subscribed for resize.
      this.resizeListenerAttached = false;
      // Indicates if the IntersectionObserver started observing the List
      this.listEndObserved = false;
      this._itemNavigation = new _ItemNavigation.default(this, {
        skipItemsSize: PAGE_UP_DOWN_SIZE,
        navigationMode: _NavigationMode.default.Vertical,
        getItemsCallback: () => this.getEnabledItems()
      });
      this._handleResize = this.checkListInViewport.bind(this);
      this._handleResize = this.checkListInViewport.bind(this);
      // Indicates the List bottom most part has been detected by the IntersectionObserver
      // for the first time.
      this.initialIntersection = true;
    }
    onExitDOM() {
      this.unobserveListEnd();
      this.resizeListenerAttached = false;
      _ResizeHandler.default.deregister(this.getDomRef(), this._handleResize);
    }
    onBeforeRendering() {
      this.prepareListItems();
    }
    onAfterRendering() {
      if (this.growsOnScroll) {
        this.observeListEnd();
      } else if (this.listEndObserved) {
        this.unobserveListEnd();
      }
      if (this.grows) {
        this.checkListInViewport();
        this.attachForResize();
      }
    }
    attachForResize() {
      if (!this.resizeListenerAttached) {
        this.resizeListenerAttached = true;
        _ResizeHandler.default.register(this.getDomRef(), this._handleResize);
      }
    }
    get shouldRenderH1() {
      return !this.header.length && this.headerText;
    }
    get headerID() {
      return `${this._id}-header`;
    }
    get modeLabelID() {
      return `${this._id}-modeLabel`;
    }
    get listEndDOM() {
      return this.shadowRoot.querySelector(".ui5-list-end-marker");
    }
    get hasData() {
      return this.getItems().length !== 0;
    }
    get showNoDataText() {
      return !this.hasData && this.noDataText;
    }
    get isDelete() {
      return this.mode === _ListMode.default.Delete;
    }
    get isSingleSelect() {
      return [_ListMode.default.SingleSelect, _ListMode.default.SingleSelectBegin, _ListMode.default.SingleSelectEnd, _ListMode.default.SingleSelectAuto].includes(this.mode);
    }
    get isMultiSelect() {
      return this.mode === _ListMode.default.MultiSelect;
    }
    get ariaLabelledBy() {
      if (this.accessibleNameRef || this.accessibleName) {
        return undefined;
      }
      const ids = [];
      if (this.isMultiSelect || this.isSingleSelect || this.isDelete) {
        ids.push(this.modeLabelID);
      }
      if (this.shouldRenderH1) {
        ids.push(this.headerID);
      }
      return ids.length ? ids.join(" ") : undefined;
    }
    get ariaLabelTxt() {
      return (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this);
    }
    get ariaLabelModeText() {
      if (this.isMultiSelect) {
        return List_1.i18nBundle.getText(_i18nDefaults.ARIA_LABEL_LIST_MULTISELECTABLE);
      }
      if (this.isSingleSelect) {
        return List_1.i18nBundle.getText(_i18nDefaults.ARIA_LABEL_LIST_SELECTABLE);
      }
      if (this.isDelete) {
        return List_1.i18nBundle.getText(_i18nDefaults.ARIA_LABEL_LIST_DELETABLE);
      }
      return "";
    }
    get grows() {
      return this.growing !== _ListGrowingMode.default.None;
    }
    get growsOnScroll() {
      return this.growing === _ListGrowingMode.default.Scroll;
    }
    get growsWithButton() {
      return this.growing === _ListGrowingMode.default.Button;
    }
    get _growingButtonText() {
      return List_1.i18nBundle.getText(_i18nDefaults.LOAD_MORE_TEXT);
    }
    get busyIndPosition() {
      if (!this.grows) {
        return "absolute";
      }
      return this._inViewport ? "absolute" : "sticky";
    }
    get styles() {
      return {
        busyInd: {
          position: this.busyIndPosition
        }
      };
    }
    get classes() {
      return {
        root: {
          "ui5-list-root": true,
          "ui5-content-native-scrollbars": (0, _getEffectiveScrollbarStyle.default)()
        }
      };
    }
    prepareListItems() {
      const slottedItems = this.getItemsForProcessing();
      slottedItems.forEach((item, key) => {
        const isLastChild = key === slottedItems.length - 1;
        const showBottomBorder = this.separators === _ListSeparators.default.All || this.separators === _ListSeparators.default.Inner && !isLastChild;
        if (item.hasConfigurableMode) {
          item._mode = this.mode;
        }
        item.hasBorder = showBottomBorder;
      });
    }
    async observeListEnd() {
      if (!this.listEndObserved) {
        await (0, _Render.renderFinished)();
        this.getIntersectionObserver().observe(this.listEndDOM);
        this.listEndObserved = true;
      }
    }
    unobserveListEnd() {
      if (this.growingIntersectionObserver) {
        this.growingIntersectionObserver.disconnect();
        this.growingIntersectionObserver = null;
        this.listEndObserved = false;
      }
    }
    onInteresection(entries) {
      if (this.initialIntersection) {
        this.initialIntersection = false;
        return;
      }
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (0, _debounce.default)(this.loadMore.bind(this), INFINITE_SCROLL_DEBOUNCE_RATE);
        }
      });
    }
    /*
    * ITEM SELECTION BASED ON THE CURRENT MODE
    */
    onSelectionRequested(e) {
      const previouslySelectedItems = this.getSelectedItems();
      let selectionChange = false;
      this._selectionRequested = true;
      if (this.mode !== _ListMode.default.None && this[`handle${this.mode}`]) {
        selectionChange = this[`handle${this.mode}`](e.detail.item, !!e.detail.selected);
      }
      if (selectionChange) {
        const changePrevented = !this.fireEvent("selection-change", {
          selectedItems: this.getSelectedItems(),
          previouslySelectedItems,
          selectionComponentPressed: e.detail.selectionComponentPressed,
          targetItem: e.detail.item,
          key: e.detail.key
        }, true);
        if (changePrevented) {
          this._revertSelection(previouslySelectedItems);
        }
      }
    }
    handleSingleSelect(item) {
      if (item.selected) {
        return false;
      }
      this.deselectSelectedItems();
      item.selected = true;
      return true;
    }
    handleSingleSelectBegin(item) {
      return this.handleSingleSelect(item);
    }
    handleSingleSelectEnd(item) {
      return this.handleSingleSelect(item);
    }
    handleSingleSelectAuto(item) {
      return this.handleSingleSelect(item);
    }
    handleMultiSelect(item, selected) {
      item.selected = selected;
      return true;
    }
    handleDelete(item) {
      this.fireEvent("item-delete", {
        item
      });
      return true;
    }
    deselectSelectedItems() {
      this.getSelectedItems().forEach(item => {
        item.selected = false;
      });
    }
    getSelectedItems() {
      return this.getItems().filter(item => item.selected);
    }
    getEnabledItems() {
      return this.getItems().filter(item => !item.disabled);
    }
    getItems() {
      return this.getSlottedNodes("items");
    }
    getItemsForProcessing() {
      return this.getItems();
    }
    _revertSelection(previouslySelectedItems) {
      this.getItems().forEach(item => {
        const oldSelection = previouslySelectedItems.indexOf(item) !== -1;
        const multiSelectCheckBox = item.shadowRoot.querySelector(".ui5-li-multisel-cb");
        const singleSelectRadioButton = item.shadowRoot.querySelector(".ui5-li-singlesel-radiobtn");
        item.selected = oldSelection;
        if (multiSelectCheckBox) {
          multiSelectCheckBox.checked = oldSelection;
        } else if (singleSelectRadioButton) {
          singleSelectRadioButton.checked = oldSelection;
        }
      });
    }
    _onkeydown(e) {
      if ((0, _Keys.isTabNext)(e)) {
        this._handleTabNext(e);
      }
    }
    _onLoadMoreKeydown(e) {
      if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
        this._loadMoreActive = true;
      }
      if ((0, _Keys.isEnter)(e)) {
        this._onLoadMoreClick();
        this._loadMoreActive = true;
      }
      if ((0, _Keys.isTabNext)(e)) {
        this.focusAfterElement();
      }
      if ((0, _Keys.isTabPrevious)(e)) {
        if (this.getPreviouslyFocusedItem()) {
          this.focusPreviouslyFocusedItem();
        } else {
          this.focusFirstItem();
        }
        e.preventDefault();
      }
    }
    _onLoadMoreKeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
        this._onLoadMoreClick();
      }
      this._loadMoreActive = false;
    }
    _onLoadMoreMousedown() {
      this._loadMoreActive = true;
    }
    _onLoadMoreMouseup() {
      this._loadMoreActive = false;
    }
    _onLoadMoreClick() {
      this.loadMore();
    }
    checkListInViewport() {
      this._inViewport = (0, _isElementInView.default)(this.getDomRef());
    }
    loadMore() {
      this.fireEvent("load-more");
    }
    /*
    * KEYBOARD SUPPORT
    */
    _handleTabNext(e) {
      let lastTabbableEl;
      const target = (0, _getNormalizedTarget.default)(e.target);
      if (!lastTabbableEl) {
        return;
      }
      if (lastTabbableEl === target) {
        if (this.getFirstItem(x => x.selected && !x.disabled)) {
          this.focusFirstSelectedItem();
        } else if (this.getPreviouslyFocusedItem()) {
          this.focusPreviouslyFocusedItem();
        } else {
          this.focusFirstItem();
        }
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }
    _onfocusin(e) {
      const target = (0, _getNormalizedTarget.default)(e.target);
      // If the focusin event does not origin from one of the 'triggers' - ignore it.
      if (!this.isForwardElement(target)) {
        e.stopImmediatePropagation();
        return;
      }
      // The focus arrives in the List for the first time.
      // If there is selected item - focus it or focus the first item.
      if (!this.getPreviouslyFocusedItem()) {
        if (this.growsWithButton && this.isForwardAfterElement(target)) {
          this.focusGrowingButton();
        } else {
          this.focusFirstItem();
        }
        e.stopImmediatePropagation();
        return;
      }
      // The focus returns to the List,
      // focus the first selected item or the previously focused element.
      if (!this.getForwardingFocus()) {
        if (this.growsWithButton && this.isForwardAfterElement(target)) {
          this.focusGrowingButton();
          e.stopImmediatePropagation();
          return;
        }
        this.focusPreviouslyFocusedItem();
        e.stopImmediatePropagation();
      }
      this.setForwardingFocus(false);
    }
    isForwardElement(element) {
      const elementId = element.id;
      const beforeElement = this.getBeforeElement();
      if (this._id === elementId || beforeElement && beforeElement.id === elementId) {
        return true;
      }
      return this.isForwardAfterElement(element);
    }
    isForwardAfterElement(element) {
      const elementId = element.id;
      const afterElement = this.getAfterElement();
      return afterElement && afterElement.id === elementId;
    }
    onItemFocused(e) {
      const target = e.target;
      e.stopPropagation();
      this._itemNavigation.setCurrentItem(target);
      this.fireEvent("item-focused", {
        item: target
      });
      if (this.mode === _ListMode.default.SingleSelectAuto) {
        const detail = {
          item: target,
          selectionComponentPressed: false,
          selected: true,
          key: e.detail.key
        };
        this.onSelectionRequested({
          detail
        });
      }
    }
    onItemPress(e) {
      const pressedItem = e.detail.item;
      if (!this.fireEvent("item-click", {
        item: pressedItem
      }, true)) {
        return;
      }
      if (!this._selectionRequested && this.mode !== _ListMode.default.Delete) {
        this._selectionRequested = true;
        const detail = {
          item: pressedItem,
          selectionComponentPressed: false,
          selected: !pressedItem.selected,
          key: e.detail.key
        };
        this.onSelectionRequested({
          detail
        });
      }
      this._selectionRequested = false;
    }
    // This is applicable to NotificationListItem
    onItemClose(e) {
      const target = e.target;
      const shouldFireItemClose = target?.hasAttribute("ui5-li-notification") || target?.hasAttribute("ui5-li-notification-group");
      if (shouldFireItemClose) {
        this.fireEvent("item-close", {
          item: e.detail?.item
        });
      }
    }
    onItemToggle(e) {
      this.fireEvent("item-toggle", {
        item: e.detail.item
      });
    }
    onForwardBefore(e) {
      this.setPreviouslyFocusedItem(e.target);
      this.focusBeforeElement();
      e.stopPropagation();
    }
    onForwardAfter(e) {
      this.setPreviouslyFocusedItem(e.target);
      if (!this.growsWithButton) {
        this.focusAfterElement();
      } else {
        this.focusGrowingButton();
        e.preventDefault();
      }
      e.stopPropagation();
    }
    focusBeforeElement() {
      this.setForwardingFocus(true);
      this.getBeforeElement().focus();
    }
    focusAfterElement() {
      this.setForwardingFocus(true);
      this.getAfterElement().focus();
    }
    focusGrowingButton() {
      const growingBtn = this.getGrowingButton();
      if (growingBtn) {
        growingBtn.focus();
      }
    }
    getGrowingButton() {
      return this.shadowRoot.querySelector(`#${this._id}-growing-btn`);
    }
    /**
     * Focuses the first list item and sets its tabindex to "0" via the ItemNavigation
     * @protected
     */
    focusFirstItem() {
      // only enabled items are focusable
      const firstItem = this.getFirstItem(x => !x.disabled);
      if (firstItem) {
        firstItem.focus();
      }
    }
    focusPreviouslyFocusedItem() {
      const previouslyFocusedItem = this.getPreviouslyFocusedItem();
      if (previouslyFocusedItem) {
        previouslyFocusedItem.focus();
      }
    }
    focusFirstSelectedItem() {
      // only enabled items are focusable
      const firstSelectedItem = this.getFirstItem(x => x.selected && !x.disabled);
      if (firstSelectedItem) {
        firstSelectedItem.focus();
      }
    }
    /**
     * Focuses a list item and sets its tabindex to "0" via the ItemNavigation
     * @protected
     * @param item
     */
    focusItem(item) {
      this._itemNavigation.setCurrentItem(item);
      item.focus();
    }
    onFocusRequested(e) {
      setTimeout(() => {
        this.setPreviouslyFocusedItem(e.target);
        this.focusPreviouslyFocusedItem();
      }, 0);
    }
    setForwardingFocus(forwardingFocus) {
      this._forwardingFocus = forwardingFocus;
    }
    getForwardingFocus() {
      return this._forwardingFocus;
    }
    setPreviouslyFocusedItem(item) {
      this._previouslyFocusedItem = item;
    }
    getPreviouslyFocusedItem() {
      return this._previouslyFocusedItem;
    }
    getFirstItem(filter) {
      const slottedItems = this.getItems();
      let firstItem = null;
      if (!filter) {
        return slottedItems.length ? slottedItems[0] : null;
      }
      for (let i = 0; i < slottedItems.length; i++) {
        if (filter(slottedItems[i])) {
          firstItem = slottedItems[i];
          break;
        }
      }
      return firstItem;
    }
    getAfterElement() {
      if (!this._afterElement) {
        this._afterElement = this.shadowRoot.querySelector(`#${this._id}-after`);
      }
      return this._afterElement;
    }
    getBeforeElement() {
      if (!this._beforeElement) {
        this._beforeElement = this.shadowRoot.querySelector(`#${this._id}-before`);
      }
      return this._beforeElement;
    }
    getIntersectionObserver() {
      if (!this.growingIntersectionObserver) {
        this.growingIntersectionObserver = new IntersectionObserver(this.onInteresection.bind(this), {
          root: null,
          rootMargin: "0px",
          threshold: 1.0
        });
      }
      return this.growingIntersectionObserver;
    }
  };
  __decorate([(0, _property.default)()], List.prototype, "headerText", void 0);
  __decorate([(0, _property.default)()], List.prototype, "footerText", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], List.prototype, "indent", void 0);
  __decorate([(0, _property.default)({
    type: _ListMode.default,
    defaultValue: _ListMode.default.None
  })], List.prototype, "mode", void 0);
  __decorate([(0, _property.default)()], List.prototype, "noDataText", void 0);
  __decorate([(0, _property.default)({
    type: _ListSeparators.default,
    defaultValue: _ListSeparators.default.All
  })], List.prototype, "separators", void 0);
  __decorate([(0, _property.default)({
    type: _ListGrowingMode.default,
    defaultValue: _ListGrowingMode.default.None
  })], List.prototype, "growing", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], List.prototype, "busy", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 1000
  })], List.prototype, "busyDelay", void 0);
  __decorate([(0, _property.default)()], List.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    defaultValue: ""
  })], List.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "list"
  })], List.prototype, "accessibleRole", void 0);
  __decorate([(0, _property.default)({
    defaultValue: undefined,
    noAttribute: true
  })], List.prototype, "accessibleRoleDescription", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], List.prototype, "_inViewport", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], List.prototype, "_loadMoreActive", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true
  })], List.prototype, "items", void 0);
  __decorate([(0, _slot.default)()], List.prototype, "header", void 0);
  List = List_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-list",
    fastNavigation: true,
    renderer: _LitRenderer.default,
    template: _ListTemplate.default,
    styles: [_BrowserScrollbar.default, _List.default],
    dependencies: [_BusyIndicator.default]
  })
  /**
   * Fired when an item is activated, unless the item's <code>type</code> property
   * is set to <code>Inactive</code>.
   *
   * @event sap.ui.webc.main.List#item-click
   * @allowPreventDefault
   * @param {HTMLElement} item The clicked item.
   * @public
   */, (0, _event.default)("item-click", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired when the <code>Close</code> button of any item is clicked
   * <br><br>
   * <b>Note:</b> This event is only applicable to list items that can be closed (such as notification list items),
   * not to be confused with <code>item-delete</code>.
   *
   * @event sap.ui.webc.main.List#item-close
   * @param {HTMLElement} item the item about to be closed.
   * @public
   * @since 1.0.0-rc.8
   */, (0, _event.default)("item-close", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired when the <code>Toggle</code> button of any item is clicked.
   * <br><br>
   * <b>Note:</b> This event is only applicable to list items that can be toggled (such as notification group list items).
   *
   * @event sap.ui.webc.main.List#item-toggle
   * @param {HTMLElement} item the toggled item.
   * @public
   * @since 1.0.0-rc.8
   */, (0, _event.default)("item-toggle", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired when the Delete button of any item is pressed.
   * <br><br>
   * <b>Note:</b> A Delete button is displayed on each item,
   * when the component <code>mode</code> property is set to <code>Delete</code>.
   *
   * @event sap.ui.webc.main.List#item-delete
   * @param {HTMLElement} item the deleted item.
   * @public
   */, (0, _event.default)("item-delete", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired when selection is changed by user interaction
   * in <code>SingleSelect</code>, <code>SingleSelectBegin</code>, <code>SingleSelectEnd</code> and <code>MultiSelect</code> modes.
   *
   * @event sap.ui.webc.main.List#selection-change
   * @allowPreventDefault
   * @param {Array} selectedItems An array of the selected items.
   * @param {Array} previouslySelectedItems An array of the previously selected items.
   * @public
   */, (0, _event.default)("selection-change", {
    detail: {
      selectedItems: {
        type: Array
      },
      previouslySelectedItems: {
        type: Array
      },
      targetItem: {
        type: HTMLElement
      },
      selectionComponentPressed: {
        type: Boolean
      } // protected, indicates if the user used the selection components to change the selection
    }
  })
  /**
   * Fired when the user scrolls to the bottom of the list.
   * <br><br>
   * <b>Note:</b> The event is fired when the <code>growing='Scroll'</code> property is enabled.
   *
   * @event sap.ui.webc.main.List#load-more
   * @public
   * @since 1.0.0-rc.6
   */, (0, _event.default)("load-more")
  /**
   * @private
   */, (0, _event.default)("item-focused", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })], List);
  List.define();
  var _default = List;
  _exports.default = _default;
});