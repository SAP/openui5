sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/delegate/ItemNavigation", "sap/ui/webc/common/thirdparty/base/Render", "sap/ui/webc/common/thirdparty/base/util/TabbableElements", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/types/NavigationMode", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/util/debounce", "sap/ui/webc/common/thirdparty/base/util/isElementInView", "./types/ListMode", "./types/ListGrowingMode", "./types/ListSeparators", "./BusyIndicator", "./generated/templates/ListTemplate.lit", "./generated/themes/List.css", "./generated/themes/BrowserScrollbar.css", "./generated/i18n/i18n-defaults"], function (_exports, _UI5Element, _LitRenderer, _ResizeHandler, _ItemNavigation, _Render, _TabbableElements, _Keys, _Integer, _NavigationMode, _AriaLabelHelper, _i18nBundle, _debounce, _isElementInView, _ListMode, _ListGrowingMode, _ListSeparators, _BusyIndicator, _ListTemplate, _List, _BrowserScrollbar, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _ItemNavigation = _interopRequireDefault(_ItemNavigation);
  _Integer = _interopRequireDefault(_Integer);
  _NavigationMode = _interopRequireDefault(_NavigationMode);
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

  // Template
  // Styles
  // Texts
  const INFINITE_SCROLL_DEBOUNCE_RATE = 250; // ms

  const PAGE_UP_DOWN_SIZE = 10;
  /**
   * @public
   */

  const metadata = {
    tag: "ui5-list",
    managedSlots: true,
    fastNavigation: true,
    slots:
    /** @lends sap.ui.webcomponents.main.List.prototype */
    {
      /**
       * Defines the component header.
       * <br><br>
       * <b>Note:</b> When <code>header</code> is set, the
       * <code>headerText</code> property is ignored.
       *
       * @type {HTMLElement[]}
       * @slot
       * @public
       */
      header: {
        type: HTMLElement
      },

      /**
       * Defines the items of the component.
       * <br><br>
       * <b>Note:</b> Use <code>ui5-li</code>, <code>ui5-li-custom</code>, and <code>ui5-li-groupheader</code> for the intended design.
       *
       * @type {sap.ui.webcomponents.main.IListItem[]}
       * @slot items
       * @public
       */
      "default": {
        propertyName: "items",
        type: HTMLElement
      }
    },
    properties:
    /** @lends sap.ui.webcomponents.main.List.prototype */
    {
      /**
       * Defines the component header text.
       * <br><br>
       * <b>Note:</b> If <code>header</code> is set this property is ignored.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      headerText: {
        type: String
      },

      /**
       * Defines the footer text.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      footerText: {
        type: String
      },

      /**
       * Determines whether the component is indented.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      indent: {
        type: Boolean
      },

      /**
       * Defines the mode of the component.
       * <br><br>
       * <b>Note:</b> Available options are <code>None</code>, <code>SingleSelect</code>, <code>SingleSelectBegin</code>,
       * <code>SingleSelectEnd</code>, <code>MultiSelect</code>, and <code>Delete</code>.
       *
       * @type {ListMode}
       * @defaultvalue "None"
       * @public
       */
      mode: {
        type: _ListMode.default,
        defaultValue: _ListMode.default.None
      },

      /**
       * Defines the text that is displayed when the component contains no items.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      noDataText: {
        type: String
      },

      /**
       * Defines the item separator style that is used.
       * <br><br>
       * <b>Notes:</b>
       * <ul>
       * <li>Avalaible options are <code>All</code>, <code>Inner</code>, and <code>None</code>.</li>
       * <li>When set to <code>None</code>, none of the items are separated by horizontal lines.</li>
       * <li>When set to <code>Inner</code>, the first item doesn't have a top separator and the last
       * item doesn't have a bottom separator.</li>
       * </ul>
       *
       * @type {ListSeparators}
       * @defaultvalue "All"
       * @public
       */
      separators: {
        type: _ListSeparators.default,
        defaultValue: _ListSeparators.default.All
      },

      /**
       * Defines whether the component will have growing capability either by pressing a <code>More</code> button,
       * or via user scroll. In both cases <code>load-more</code> event is fired.
       * <br><br>
       *
       * Available options:
       * <br><br>
       * <code>Button</code> - Shows a <code>More</code> button at the bottom of the list,
       * pressing of which triggers the <code>load-more</code> event.
       * <br>
       * <code>Scroll</code> - The <code>load-more</code> event is triggered when the user scrolls to the bottom of the list;
       * <br>
       * <code>None</code> (default) - The growing is off.
       * <br><br>
       *
       * <b>Restrictions:</b> <code>growing="Scroll"</code> is not supported for Internet Explorer,
       * on IE the component will fallback to <code>growing="Button"</code>.
       * @type {ListGrowingMode}
       * @defaultvalue "None"
       * @since 1.0.0-rc.13
       * @public
       */
      growing: {
        type: _ListGrowingMode.default,
        defaultValue: _ListGrowingMode.default.None
      },

      /**
       * Defines if the component would display a loading indicator over the list.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       * @since 1.0.0-rc.6
       */
      busy: {
        type: Boolean
      },

      /**
       * Defines the delay in milliseconds, after which the busy indicator will show up for this component.
       *
       * @type {Integer}
       * @defaultValue 1000
       * @public
       */
      busyDelay: {
        type: _Integer.default,
        defaultValue: 1000
      },

      /**
       * Defines the accessible name of the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.0.0-rc.15
       */
      accessibleName: {
        type: String
      },

      /**
       * Defines the IDs of the elements that label the input.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.0.0-rc.15
       */
      accessibleNameRef: {
        type: String,
        defaultValue: ""
      },

      /**
       * Defines the accessible role of the component.
       * <br><br>
       * @public
       * @type {string}
       * @defaultvalue "list"
       * @since 1.0.0-rc.15
       */
      accessibleRole: {
        type: String,
        defaultValue: "list"
      },

      /**
       * Defines if the entire list is in view port.
       * @private
       */
      _inViewport: {
        type: Boolean
      },

      /**
       * Defines the active state of the <code>More</code> button.
       * @private
       */
      _loadMoreActive: {
        type: Boolean
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.List.prototype */
    {
      /**
       * Fired when an item is activated, unless the item's <code>type</code> property
       * is set to <code>Inactive</code>.
       *
       * @event sap.ui.webcomponents.main.List#item-click
       * @allowPreventDefault
       * @param {HTMLElement} item The clicked item.
       * @public
       */
      "item-click": {
        detail: {
          item: {
            type: HTMLElement
          }
        }
      },

      /**
       * Fired when the <code>Close</code> button of any item is clicked
       * <br><br>
       * <b>Note:</b> This event is only applicable to list items that can be closed (such as notification list items),
       * not to be confused with <code>item-delete</code>.
       *
       * @event sap.ui.webcomponents.main.List#item-close
       * @param {HTMLElement} item the item about to be closed.
       * @public
       * @since 1.0.0-rc.8
       */
      "item-close": {
        detail: {
          item: {
            type: HTMLElement
          }
        }
      },

      /**
       * Fired when the <code>Toggle</code> button of any item is clicked.
       * <br><br>
       * <b>Note:</b> This event is only applicable to list items that can be toggled (such as notification group list items).
       *
       * @event sap.ui.webcomponents.main.List#item-toggle
       * @param {HTMLElement} item the toggled item.
       * @public
       * @since 1.0.0-rc.8
       */
      "item-toggle": {
        detail: {
          item: {
            type: HTMLElement
          }
        }
      },

      /**
       * Fired when the Delete button of any item is pressed.
       * <br><br>
       * <b>Note:</b> A Delete button is displayed on each item,
       * when the component <code>mode</code> property is set to <code>Delete</code>.
       *
       * @event sap.ui.webcomponents.main.List#item-delete
       * @param {HTMLElement} item the deleted item.
       * @public
       */
      "item-delete": {
        detail: {
          item: {
            type: HTMLElement
          }
        }
      },

      /**
       * Fired when selection is changed by user interaction
       * in <code>SingleSelect</code>, <code>SingleSelectBegin</code>, <code>SingleSelectEnd</code> and <code>MultiSelect</code> modes.
       *
       * @event sap.ui.webcomponents.main.List#selection-change
       * @param {Array} selectedItems An array of the selected items.
       * @param {Array} previouslySelectedItems An array of the previously selected items.
       * @public
       */
      "selection-change": {
        detail: {
          selectedItems: {
            type: Array
          },
          previouslySelectedItems: {
            type: Array
          },
          selectionComponentPressed: {
            type: Boolean
          } // protected, indicates if the user used the selection components to change the selection

        }
      },

      /**
       * Fired when the user scrolls to the bottom of the list.
       * <br><br>
       * <b>Note:</b> The event is fired when the <code>growing='Scroll'</code> property is enabled.
       *
       * @event sap.ui.webcomponents.main.List#load-more
       * @public
       * @since 1.0.0-rc.6
       */
      "load-more": {}
    }
  };
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
   * @alias sap.ui.webcomponents.main.List
   * @extends UI5Element
   * @tagname ui5-list
   * @appenddocs StandardListItem CustomListItem GroupHeaderListItem
   * @public
   */

  class List extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _ListTemplate.default;
    }

    static get styles() {
      return [_BrowserScrollbar.default, _List.default];
    }

    static async onDefine() {
      List.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }

    static get dependencies() {
      return [_BusyIndicator.default];
    }

    constructor() {
      super();
      this.initItemNavigation(); // Stores the last focused item within the internal ul element.

      this._previouslyFocusedItem = null; // Indicates that the List is forwarding the focus before or after the internal ul.

      this._forwardingFocus = false;
      this._previouslySelectedItem = null; // Indicates that the List has already subscribed for resize.

      this.resizeListenerAttached = false; // Indicates if the IntersectionObserver started observing the List

      this.listEndObserved = false;
      this.addEventListener("ui5-_press", this.onItemPress.bind(this));
      this.addEventListener("ui5-close", this.onItemClose.bind(this));
      this.addEventListener("ui5-toggle", this.onItemToggle.bind(this));
      this.addEventListener("ui5-_focused", this.onItemFocused.bind(this));
      this.addEventListener("ui5-_forward-after", this.onForwardAfter.bind(this));
      this.addEventListener("ui5-_forward-before", this.onForwardBefore.bind(this));
      this.addEventListener("ui5-_selection-requested", this.onSelectionRequested.bind(this));
      this.addEventListener("ui5-_focus-requested", this.focusUploadCollectionItem.bind(this));
      this._handleResize = this.checkListInViewport.bind(this); // Indicates the List bottom most part has been detected by the IntersectionObserver
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
      return this.getSlottedNodes("items").length !== 0;
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
        return List.i18nBundle.getText(_i18nDefaults.ARIA_LABEL_LIST_MULTISELECTABLE);
      }

      if (this.isSingleSelect) {
        return List.i18nBundle.getText(_i18nDefaults.ARIA_LABEL_LIST_SELECTABLE);
      }

      if (this.isDelete) {
        return List.i18nBundle.getText(_i18nDefaults.ARIA_LABEL_LIST_DELETABLE);
      }

      return undefined;
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
      return List.i18nBundle.getText(_i18nDefaults.LOAD_MORE_TEXT);
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

    initItemNavigation() {
      this._itemNavigation = new _ItemNavigation.default(this, {
        skipItemsSize: PAGE_UP_DOWN_SIZE,
        // PAGE_UP and PAGE_DOWN will skip trough 10 items
        navigationMode: _NavigationMode.default.Vertical,
        getItemsCallback: () => this.getEnabledItems()
      });
    }

    prepareListItems() {
      const slottedItems = this.getSlottedNodes("items");
      slottedItems.forEach((item, key) => {
        const isLastChild = key === slottedItems.length - 1;
        const showBottomBorder = this.separators === _ListSeparators.default.All || this.separators === _ListSeparators.default.Inner && !isLastChild;
        item._mode = this.mode;
        item.hasBorder = showBottomBorder;
      });
      this._previouslySelectedItem = null;
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


    onSelectionRequested(event) {
      const previouslySelectedItems = this.getSelectedItems();
      let selectionChange = false;
      this._selectionRequested = true;

      if (this[`handle${this.mode}`]) {
        selectionChange = this[`handle${this.mode}`](event.detail.item, event.detail.selected);
      }

      if (selectionChange) {
        this.fireEvent("selection-change", {
          selectedItems: this.getSelectedItems(),
          previouslySelectedItems,
          selectionComponentPressed: event.detail.selectionComponentPressed,
          key: event.detail.key
        });
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
    }

    deselectSelectedItems() {
      this.getSelectedItems().forEach(item => {
        item.selected = false;
      });
    }

    getSelectedItems() {
      return this.getSlottedNodes("items").filter(item => item.selected);
    }

    getEnabledItems() {
      return this.getSlottedNodes("items").filter(item => !item.disabled);
    }

    _onkeydown(event) {
      if ((0, _Keys.isTabNext)(event)) {
        this._handleTabNext(event);
      }
    }

    _onLoadMoreKeydown(event) {
      if ((0, _Keys.isSpace)(event)) {
        event.preventDefault();
        this._loadMoreActive = true;
      }

      if ((0, _Keys.isEnter)(event)) {
        this._onLoadMoreClick();

        this._loadMoreActive = true;
      }

      if ((0, _Keys.isTabNext)(event)) {
        this.focusAfterElement();
      }

      if ((0, _Keys.isTabPrevious)(event)) {
        if (this.getPreviouslyFocusedItem()) {
          this.focusPreviouslyFocusedItem();
        } else {
          this.focusFirstItem();
        }

        event.preventDefault();
      }
    }

    _onLoadMoreKeyup(event) {
      if ((0, _Keys.isSpace)(event)) {
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


    _handleTabNext(event) {
      // If forward navigation is performed, we check if the List has headerToolbar.
      // If yes - we check if the target is at the last tabbable element of the headerToolbar
      // to forward correctly the focus to the selected, previously focused or to the first list item.
      let lastTabbableEl;
      const target = this.getNormalizedTarget(event.target);

      if (this.headerToolbar) {
        lastTabbableEl = this.getHeaderToolbarLastTabbableElement();
      }

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

        event.stopImmediatePropagation();
        event.preventDefault();
      }
    }

    _onfocusin(event) {
      const target = this.getNormalizedTarget(event.target); // If the focusin event does not origin from one of the 'triggers' - ignore it.

      if (!this.isForwardElement(target)) {
        event.stopImmediatePropagation();
        return;
      } // The focus arrives in the List for the first time.
      // If there is selected item - focus it or focus the first item.


      if (!this.getPreviouslyFocusedItem()) {
        if (this.growsWithButton && this.isForwardAfterElement(target)) {
          this.focusGrowingButton();
        } else {
          this.focusFirstItem();
        }

        event.stopImmediatePropagation();
        return;
      } // The focus returns to the List,
      // focus the first selected item or the previously focused element.


      if (!this.getForwardingFocus()) {
        if (this.growsWithButton && this.isForwardAfterElement(target)) {
          this.focusGrowingButton();
          event.stopImmediatePropagation();
          return;
        }

        this.focusPreviouslyFocusedItem();
        event.stopImmediatePropagation();
      }

      this.setForwardingFocus(false);
    }

    isForwardElement(node) {
      const nodeId = node.id;
      const beforeElement = this.getBeforeElement();

      if (this._id === nodeId || beforeElement && beforeElement.id === nodeId) {
        return true;
      }

      return this.isForwardAfterElement(node);
    }

    isForwardAfterElement(node) {
      const nodeId = node.id;
      const afterElement = this.getAfterElement();
      return afterElement && afterElement.id === nodeId;
    }

    onItemFocused(event) {
      const target = event.target;

      this._itemNavigation.setCurrentItem(target);

      this.fireEvent("item-focused", {
        item: target
      });

      if (this.mode === _ListMode.default.SingleSelectAuto) {
        this.onSelectionRequested({
          detail: {
            item: target,
            selectionComponentPressed: false,
            selected: true,
            key: event.detail.key
          }
        });
      }
    }

    onItemPress(event) {
      const pressedItem = event.detail.item;

      if (!this.fireEvent("item-click", {
        item: pressedItem
      }, true)) {
        return;
      }

      if (!this._selectionRequested && this.mode !== _ListMode.default.Delete) {
        this._selectionRequested = true;
        this.onSelectionRequested({
          detail: {
            item: pressedItem,
            selectionComponentPressed: false,
            selected: !pressedItem.selected,
            key: event.detail.key
          }
        });
      }

      this._selectionRequested = false;
    } // This is applicable to NoficationListItem


    onItemClose(event) {
      this.fireEvent("item-close", {
        item: event.detail.item
      });
    }

    onItemToggle(event) {
      this.fireEvent("item-toggle", {
        item: event.detail.item
      });
    }

    onForwardBefore(event) {
      this.setPreviouslyFocusedItem(event.target);
      this.focusBeforeElement();
      event.stopImmediatePropagation();
    }

    onForwardAfter(event) {
      this.setPreviouslyFocusedItem(event.target);

      if (!this.growsWithButton) {
        this.focusAfterElement();
      } else {
        this.focusGrowingButton();
        event.preventDefault();
      }
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

    focusUploadCollectionItem(event) {
      setTimeout(() => {
        this.setPreviouslyFocusedItem(event.target);
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
      const slottedItems = this.getSlottedNodes("items");
      let firstItem = null;

      if (!filter) {
        return !!slottedItems.length && slottedItems[0];
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

    getHeaderToolbarLastTabbableElement() {
      return (0, _TabbableElements.getLastTabbableElement)(this.headerToolbar.getDomRef()) || this.headerToolbar.getDomRef();
    }

    getNormalizedTarget(target) {
      let focused = target;

      if (target.shadowRoot && target.shadowRoot.activeElement) {
        focused = target.shadowRoot.activeElement;
      }

      return focused;
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

  }

  List.define();
  var _default = List;
  _exports.default = _default;
});