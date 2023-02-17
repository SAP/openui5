sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/util/InvisibleMessage", "sap/ui/webc/common/thirdparty/icons/slim-arrow-down", "sap/ui/webc/common/thirdparty/icons/decline", "sap/ui/webc/common/thirdparty/icons/not-editable", "sap/ui/webc/common/thirdparty/icons/error", "sap/ui/webc/common/thirdparty/icons/alert", "sap/ui/webc/common/thirdparty/icons/sys-enter-2", "sap/ui/webc/common/thirdparty/icons/information", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/Keys", "./Filters", "./generated/i18n/i18n-defaults", "./generated/templates/ComboBoxTemplate.lit", "./generated/templates/ComboBoxPopoverTemplate.lit", "./generated/themes/ComboBox.css", "./generated/themes/ComboBoxPopover.css", "./generated/themes/ResponsivePopoverCommon.css", "./generated/themes/ValueStateMessage.css", "./generated/themes/Suggestions.css", "./ComboBoxItem", "./Icon", "./Popover", "./ResponsivePopover", "./List", "./BusyIndicator", "./Button", "./StandardListItem", "./ComboBoxGroupItem", "./GroupHeaderListItem"], function (_exports, _UI5Element, _LitRenderer, _ValueState, _Device, _Integer, _AriaLabelHelper, _InvisibleMessage, _slimArrowDown, _decline, _notEditable, _error, _alert, _sysEnter, _information, _i18nBundle, _FeaturesRegistry, _Keys, Filters, _i18nDefaults, _ComboBoxTemplate, _ComboBoxPopoverTemplate, _ComboBox, _ComboBoxPopover, _ResponsivePopoverCommon, _ValueStateMessage, _Suggestions, _ComboBoxItem, _Icon, _Popover, _ResponsivePopover, _List, _BusyIndicator, _Button, _StandardListItem, _ComboBoxGroupItem, _GroupHeaderListItem) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ValueState = _interopRequireDefault(_ValueState);
  _Integer = _interopRequireDefault(_Integer);
  _InvisibleMessage = _interopRequireDefault(_InvisibleMessage);
  Filters = _interopRequireWildcard(Filters);
  _ComboBoxTemplate = _interopRequireDefault(_ComboBoxTemplate);
  _ComboBoxPopoverTemplate = _interopRequireDefault(_ComboBoxPopoverTemplate);
  _ComboBox = _interopRequireDefault(_ComboBox);
  _ComboBoxPopover = _interopRequireDefault(_ComboBoxPopover);
  _ResponsivePopoverCommon = _interopRequireDefault(_ResponsivePopoverCommon);
  _ValueStateMessage = _interopRequireDefault(_ValueStateMessage);
  _Suggestions = _interopRequireDefault(_Suggestions);
  _ComboBoxItem = _interopRequireDefault(_ComboBoxItem);
  _Icon = _interopRequireDefault(_Icon);
  _Popover = _interopRequireDefault(_Popover);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  _List = _interopRequireDefault(_List);
  _BusyIndicator = _interopRequireDefault(_BusyIndicator);
  _Button = _interopRequireDefault(_Button);
  _StandardListItem = _interopRequireDefault(_StandardListItem);
  _ComboBoxGroupItem = _interopRequireDefault(_ComboBoxGroupItem);
  _GroupHeaderListItem = _interopRequireDefault(_GroupHeaderListItem);
  function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
  function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Templates

  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-combobox",
    languageAware: true,
    properties: /** @lends sap.ui.webcomponents.main.ComboBox.prototype */{
      /**
       * Defines the value of the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      value: {
        type: String,
        defaultValue: ""
      },
      /**
       * Defines the "live" value of the component.
       * <br><br>
       * <b>Note:</b> If we have an item e.g. "Bulgaria", "B" is typed, "ulgaria" is typed ahead, value will be "Bulgaria", filterValue will be "B".
       *
       * <br><br>
       * <b>Note:</b> Initially the filter value is synced with value.
       *
       * @type {string}
       * @defaultvalue ""
       * @private
       */
      filterValue: {
        type: String,
        defaultValue: ""
      },
      /**
       * Defines a short hint intended to aid the user with data entry when the
       * component has no value.
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      placeholder: {
        type: String,
        defaultValue: ""
      },
      /**
       * Defines whether the component is in disabled state.
       * <br><br>
       * <b>Note:</b> A disabled component is completely noninteractive.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      disabled: {
        type: Boolean
      },
      /**
       * Defines the value state of the component.
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>None</code></li>
       * <li><code>Error</code></li>
       * <li><code>Warning</code></li>
       * <li><code>Success</code></li>
       * <li><code>Information</code></li>
       * </ul>
       *
       * @type {ValueState}
       * @defaultvalue "None"
       * @public
       */
      valueState: {
        type: _ValueState.default,
        defaultValue: _ValueState.default.None
      },
      /**
       * Defines whether the component is read-only.
       * <br><br>
       * <b>Note:</b> A read-only component is not editable,
       * but still provides visual feedback upon user interaction.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      readonly: {
        type: Boolean
      },
      /**
       * Defines whether the component is required.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      required: {
        type: Boolean
      },
      /**
       * Indicates whether a loading indicator should be shown in the picker.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      loading: {
        type: Boolean
      },
      /**
       * Defines the filter type of the component.
       * Available options are: <code>StartsWithPerTerm</code>, <code>StartsWith</code> and <code>Contains</code>.
       *
       * @type {string}
       * @defaultvalue "StartsWithPerTerm"
       * @public
       */
      filter: {
        type: String,
        defaultValue: "StartsWithPerTerm"
      },
      /**
       * Indicates whether the input is focssed
       * @private
       */
      focused: {
        type: Boolean
      },
      /**
       * Indicates whether the visual focus is on the value state header
       * @private
       */
      _isValueStateFocused: {
        type: Boolean
      },
      /**
       * Defines the accessible aria name of the component.
       *
       * @type {string}
       * @defaultvalue: ""
       * @public
       * @since 1.0.0-rc.15
       */
      accessibleName: {
        type: String,
        defaultValue: undefined
      },
      /**
       * Receives id(or many ids) of the elements that label the component
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.0.0-rc.15
       */
      accessibleNameRef: {
        type: String,
        defaultValue: ""
      },
      _iconPressed: {
        type: Boolean,
        noAttribute: true
      },
      _filteredItems: {
        type: Object
      },
      _listWidth: {
        type: _Integer.default,
        defaultValue: 0,
        noAttribute: true
      }
    },
    managedSlots: true,
    slots: /** @lends sap.ui.webcomponents.main.ComboBox.prototype */{
      /**
       * Defines the component items.
       *
       * @type {sap.ui.webcomponents.main.IComboBoxItem[]}
       * @slot items
       * @public
       */
      "default": {
        propertyName: "items",
        type: HTMLElement,
        invalidateOnChildChange: true
      },
      /**
       * Defines the value state message that will be displayed as pop up under the component.
       * <br><br>
       *
       * <b>Note:</b> If not specified, a default text (in the respective language) will be displayed.
       * <br>
       * <b>Note:</b> The <code>valueStateMessage</code> would be displayed,
       * when the <code>ui5-combobox</code> is in <code>Information</code>, <code>Warning</code> or <code>Error</code> value state.
       * @type {HTMLElement[]}
       * @since 1.0.0-rc.9
       * @slot
       * @public
       */
      valueStateMessage: {
        type: HTMLElement
      },
      /**
       * Defines the icon to be displayed in the input field.
       *
       * @type {sap.ui.webcomponents.main.IIcon}
       * @slot
       * @public
       * @since 1.0.0-rc.9
       */
      icon: {
        type: HTMLElement
      }
    },
    events: /** @lends sap.ui.webcomponents.main.ComboBox.prototype */{
      /**
       * Fired when the input operation has finished by pressing Enter, focusout or an item is selected.
       *
       * @event
       * @public
       */
      change: {},
      /**
       * Fired when typing in input.
       * <br><br>
       * <b>Note:</b> filterValue property is updated, input is changed.
       * @event
       * @public
       */
      input: {},
      /**
       * Fired when selection is changed by user interaction
       *
       * @event sap.ui.webcomponents.main.ComboBox#selection-change
       * @param {HTMLElement} item item to be selected.
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
   * The <code>ui5-combobox</code> component represents a drop-down menu with a list of the available options and a text input field to narrow down the options.
   *
   * It is commonly used to enable users to select an option from a predefined list.
   *
   * <h3>Structure</h3>
   * The <code>ui5-combobox</code> consists of the following elements:
   * <ul>
   * <li> Input field - displays the selected option or a custom user entry. Users can type to narrow down the list or enter their own value.
   * <li> Drop-down arrow - expands\collapses the option list.</li>
   * <li> Option list - the list of available options.</li>
   * </ul>
   *
   * <h3>Keyboard Handling</h3>
   *
   * The <code>ui5-combobox</code> provides advanced keyboard handling.
   * <br>
   *
   * <ul>
   * <li>[F4], [ALT]+[UP], or [ALT]+[DOWN] - Toggles the picker.</li>
   * <li>[ESC] - Closes the picker, if open. If closed, cancels changes and reverts the typed in value.</li>
   * <li>[ENTER] or [RETURN] - If picker is open, takes over the currently selected item and closes it.</li>
   * <li>[DOWN] - Selects the next matching item in the picker.</li>
   * <li>[UP] - Selects the previous matching item in the picker.</li>
   * <li>[PAGEDOWN] - Moves selection down by page size (10 items by default).</li>
   * <li>[PAGEUP] - Moves selection up by page size (10 items by default). </li>
   * <li>[HOME] - If focus is in the ComboBox, moves cursor at the beginning of text. If focus is in the picker, selects the first item.</li>
   * <li>[END] - If focus is in the ComboBox, moves cursor at the end of text. If focus is in the picker, selects the last item.</li>
   * </ul>
   *
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/ComboBox";</code>
   *
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.ComboBox
   * @extends UI5Element
   * @tagname ui5-combobox
   * @appenddocs ComboBoxItem ComboBoxGroupItem
   * @public
   * @since 1.0.0-rc.6
   */
  class ComboBox extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }
    static get render() {
      return _LitRenderer.default;
    }
    static get styles() {
      return _ComboBox.default;
    }
    static get staticAreaStyles() {
      return [_ResponsivePopoverCommon.default, _ValueStateMessage.default, _ComboBoxPopover.default, _Suggestions.default];
    }
    static get template() {
      return _ComboBoxTemplate.default;
    }
    static get staticAreaTemplate() {
      return _ComboBoxPopoverTemplate.default;
    }
    constructor(props) {
      super(props);
      this._filteredItems = [];
      this._initialRendering = true;
      this._itemFocused = false;
      this._selectionChanged = false;
      this.FormSupport = undefined;
    }
    onBeforeRendering() {
      this.FormSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");
      if (this._initialRendering) {
        this._filteredItems = this.items;
      }
      if (!this._initialRendering && this.popover && document.activeElement === this && !this._filteredItems.length) {
        this.popover.close();
      }
      this._selectMatchingItem();
      this._initialRendering = false;
    }
    async onAfterRendering() {
      await this._respPopover();
      if ((0, _Device.isPhone)() && this.responsivePopover.opened) {
        // Set initial focus to the native input
        this.inner.focus();
      }
      if (this.shouldClosePopover() && !(0, _Device.isPhone)()) {
        this.responsivePopover.close(false, false, true);
        this._clearFocus();
        this._itemFocused = false;
      }
      this.toggleValueStatePopover(this.shouldOpenValueStateMessagePopover);
      this.storeResponsivePopoverWidth();

      // Safari is quite slow and does not preserve text highlighting on control rerendering.
      // That's why we need to restore it "manually".
      if ((0, _Device.isSafari)() && this._autocomplete && this.filterValue !== this.value) {
        this.inner.setSelectionRange(this._isKeyNavigation ? 0 : this.filterValue.length, this.value.length);
      }
    }
    shouldClosePopover() {
      return this.responsivePopover.opened && !this.focused && !this._itemFocused && !this._isValueStateFocused;
    }
    _focusin(event) {
      this.focused = true;
      this._lastValue = this.value;
      this._autocomplete = false;
      !(0, _Device.isPhone)() && event.target.setSelectionRange(0, this.value.length);
    }
    _focusout(event) {
      const focusedOutToValueStateMessage = event.relatedTarget && event.relatedTarget.shadowRoot && event.relatedTarget.shadowRoot.querySelector(".ui5-valuestatemessage-root");
      this._fireChangeEvent();
      if (focusedOutToValueStateMessage) {
        event.stopImmediatePropagation();
        return;
      }
      if (!this.shadowRoot.contains(event.relatedTarget) && this.staticAreaItem !== event.relatedTarget) {
        this.focused = false;
        !(0, _Device.isPhone)() && this._closeRespPopover(event);
      }
    }
    _afterOpenPopover() {
      this._iconPressed = true;
    }
    _afterClosePopover() {
      this._iconPressed = false;
      this._filteredItems = this.items;

      // close device's keyboard and prevent further typing
      if ((0, _Device.isPhone)()) {
        this.blur();
      }
      if (this._selectionPerformed) {
        this._lastValue = this.value;
        this._selectionPerformed = false;
      }
    }
    _toggleRespPopover() {
      if (this.responsivePopover.opened) {
        this._closeRespPopover();
      } else {
        this._openRespPopover();
      }
    }
    storeResponsivePopoverWidth() {
      if (this.open && !this._listWidth) {
        this._listWidth = this.responsivePopover.offsetWidth;
      }
    }
    toggleValueStatePopover(open) {
      if (open) {
        this.openValueStatePopover();
      } else {
        this.closeValueStatePopover();
      }
    }
    async openValueStatePopover() {
      this.popover = await this._getPopover();
      this.popover && this.popover.showAt(this);
    }
    async closeValueStatePopover() {
      this.popover = await this._getPopover();
      this.popover && this.popover.close();
    }
    async _getPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector(".ui5-valuestatemessage-popover");
    }
    _resetFilter() {
      this._userTypedValue = null;
      this.inner.setSelectionRange(0, this.value.length);
      this._filteredItems = this._filterItems("");
      this._selectMatchingItem();
    }
    _arrowClick() {
      this.inner.focus();
      this._resetFilter();
      this._toggleRespPopover();
    }
    _input(event) {
      const {
        value
      } = event.target;
      if (event.target === this.inner) {
        // stop the native event, as the semantic "input" would be fired.
        event.stopImmediatePropagation();
        this.focused = true;
        this._isValueStateFocused = false;
      }
      this._filteredItems = this._filterItems(value);
      this.value = value;
      this.filterValue = value;
      this._clearFocus();

      // autocomplete
      if (this._autocomplete && !(0, _Device.isAndroid)()) {
        const item = this._getFirstMatchingItem(value);
        this._applyAtomicValueAndSelection(item, value, true);
        if (value !== "" && !this._selectionChanged && item && !item.selected && !item.isGroupItem) {
          this.fireEvent("selection-change", {
            item
          });
          this._selectionChanged = false;
        }
      }
      this.fireEvent("input");
      if ((0, _Device.isPhone)()) {
        return;
      }
      if (!this._filteredItems.length || value === "") {
        this._closeRespPopover();
      } else {
        this._openRespPopover();
      }
    }
    _startsWithMatchingItems(str) {
      return Filters.StartsWith(str, this._filteredItems, "text");
    }
    _clearFocus() {
      this._filteredItems.map(item => {
        item.focused = false;
        return item;
      });
    }
    handleNavKeyPress(event) {
      if (this.focused && ((0, _Keys.isHome)(event) || (0, _Keys.isEnd)(event)) && this.value) {
        return;
      }
      const isOpen = this.open;
      const currentItem = this._filteredItems.find(item => {
        return isOpen ? item.focused : item.selected;
      });
      const indexOfItem = this._filteredItems.indexOf(currentItem);
      event.preventDefault();
      if (this.focused && isOpen && ((0, _Keys.isUp)(event) || (0, _Keys.isPageUp)(event) || (0, _Keys.isPageDown)(event))) {
        return;
      }
      if (this._filteredItems.length - 1 === indexOfItem && (0, _Keys.isDown)(event)) {
        return;
      }
      this._isKeyNavigation = true;
      this[`_handle${event.key}`](event, indexOfItem);
    }
    _handleItemNavigation(event, indexOfItem, isForward) {
      const isOpen = this.open;
      const currentItem = this._filteredItems[indexOfItem];
      const nextItem = isForward ? this._filteredItems[indexOfItem + 1] : this._filteredItems[indexOfItem - 1];
      const isGroupItem = currentItem && currentItem.isGroupItem;
      if (!isOpen && (isGroupItem && !nextItem || !isGroupItem && !currentItem)) {
        return;
      }
      this._clearFocus();
      if (isOpen) {
        this._itemFocused = true;
        this.value = isGroupItem ? "" : currentItem.text;
        this.focused = false;
        currentItem.focused = true;
      } else {
        this.focused = true;
        this.value = isGroupItem ? nextItem.text : currentItem.text;
        currentItem.focused = false;
      }
      this._isValueStateFocused = false;
      this._selectionChanged = true;
      if (isGroupItem && isOpen) {
        return;
      }
      this._announceSelectedItem(indexOfItem);

      // autocomplete
      const item = this._getFirstMatchingItem(this.value);
      this._applyAtomicValueAndSelection(item, this.open ? this._userTypedValue : null, true);
      if (item && !item.selected) {
        this.fireEvent("selection-change", {
          item
        });
      }
      this.fireEvent("input");
      this._fireChangeEvent();
    }
    _handleArrowDown(event, indexOfItem) {
      const isOpen = this.open;
      if (this.focused && indexOfItem === -1 && this.hasValueStateText && isOpen) {
        this._isValueStateFocused = true;
        this.focused = false;
        return;
      }
      indexOfItem = !isOpen && this.hasValueState && indexOfItem === -1 ? 0 : indexOfItem;
      this._handleItemNavigation(event, ++indexOfItem, true /* isForward */);
    }

    _handleArrowUp(event, indexOfItem) {
      const isOpen = this.open;
      if (indexOfItem === 0 && !this.hasValueStateText) {
        this._clearFocus();
        this.focused = true;
        this._itemFocused = false;
        return;
      }
      if (indexOfItem === 0 && this.hasValueStateText && isOpen) {
        this._clearFocus();
        this._itemFocused = false;
        this._isValueStateFocused = true;
        this._filteredItems[0].selected = false;
        return;
      }
      if (this._isValueStateFocused) {
        this.focused = true;
        this._isValueStateFocused = false;
        return;
      }
      indexOfItem = !isOpen && this.hasValueState && indexOfItem === -1 ? 0 : indexOfItem;
      this._handleItemNavigation(event, --indexOfItem, false /* isForward */);
    }

    _handlePageUp(event, indexOfItem) {
      const isProposedIndexValid = indexOfItem - ComboBox.SKIP_ITEMS_SIZE > -1;
      indexOfItem = isProposedIndexValid ? indexOfItem - ComboBox.SKIP_ITEMS_SIZE : 0;
      const shouldMoveForward = this._filteredItems[indexOfItem].isGroupItem && !this.open;
      if (!isProposedIndexValid && this.hasValueStateText && this.open) {
        this._clearFocus();
        this._itemFocused = false;
        this._isValueStateFocused = true;
        return;
      }
      this._handleItemNavigation(event, indexOfItem, shouldMoveForward);
    }
    _handlePageDown(event, indexOfItem) {
      const itemsLength = this._filteredItems.length;
      const isProposedIndexValid = indexOfItem + ComboBox.SKIP_ITEMS_SIZE < itemsLength;
      indexOfItem = isProposedIndexValid ? indexOfItem + ComboBox.SKIP_ITEMS_SIZE : itemsLength - 1;
      const shouldMoveForward = this._filteredItems[indexOfItem].isGroupItem && !this.open;
      this._handleItemNavigation(event, indexOfItem, shouldMoveForward);
    }
    _handleHome(event, indexOfItem) {
      const shouldMoveForward = this._filteredItems[0].isGroupItem && !this.open;
      if (this.hasValueStateText && this.open) {
        this._clearFocus();
        this._itemFocused = false;
        this._isValueStateFocused = true;
        return;
      }
      this._handleItemNavigation(event, indexOfItem = 0, shouldMoveForward);
    }
    _handleEnd(event, indexOfItem) {
      this._handleItemNavigation(event, indexOfItem = this._filteredItems.length - 1, true /* isForward */);
    }

    _keyup(event) {
      this._userTypedValue = this.value.substring(0, this.inner.selectionStart);
    }
    _keydown(event) {
      const isNavKey = (0, _Keys.isDown)(event) || (0, _Keys.isUp)(event) || (0, _Keys.isPageUp)(event) || (0, _Keys.isPageDown)(event) || (0, _Keys.isHome)(event) || (0, _Keys.isEnd)(event);
      this._autocomplete = !((0, _Keys.isBackSpace)(event) || (0, _Keys.isDelete)(event));
      this._isKeyNavigation = false;
      if (isNavKey && !this.readonly && this._filteredItems.length) {
        this.handleNavKeyPress(event);
      }
      if ((0, _Keys.isEnter)(event)) {
        this._fireChangeEvent();
        if (this.responsivePopover.opened) {
          this._closeRespPopover();
          this.focused = true;
        } else if (this.FormSupport) {
          this.FormSupport.triggerFormSubmit(this);
        }
      }
      if ((0, _Keys.isEscape)(event)) {
        this.focused = true;
        this.value = !this.open ? this._lastValue : this.value;
        this._isValueStateFocused = false;
      }
      if (((0, _Keys.isTabNext)(event) || (0, _Keys.isTabPrevious)(event)) && this.open) {
        this._closeRespPopover();
      }
      if ((0, _Keys.isShow)(event) && !this.readonly && !this.disabled) {
        event.preventDefault();
        this._resetFilter();
        this._toggleRespPopover();
        const selectedItem = this._filteredItems.find(item => {
          return item.selected;
        });
        if (selectedItem && this.open) {
          this._itemFocused = true;
          selectedItem.focused = true;
          this.focused = false;
        } else if (this.open && this._filteredItems.length) {
          // If no item is selected, select the first one on "Show" (F4, Alt+Up/Down)
          this._handleItemNavigation(event, 0, true /* isForward */);
        } else {
          this.focused = true;
        }
      }
    }
    _click(event) {
      if ((0, _Device.isPhone)() && !this.readonly) {
        this._openRespPopover();
      }
    }
    _closeRespPopover(event) {
      if ((0, _Device.isPhone)() && event && event.target.classList.contains("ui5-responsive-popover-close-btn") && this._selectedItemText) {
        this.value = this._selectedItemText;
        this.filterValue = this._selectedItemText;
      }
      this._isValueStateFocused = false;
      this._clearFocus();
      this.responsivePopover.close();
    }
    _openRespPopover() {
      this.responsivePopover.showAt(this);
    }
    _filterItems(str) {
      const itemsToFilter = this.items.filter(item => !item.isGroupItem);
      const filteredItems = (Filters[this.filter] || Filters.StartsWithPerTerm)(str, itemsToFilter, "text");

      // Return the filtered items and their group items
      return this.items.filter((item, idx, allItems) => ComboBox._groupItemFilter(item, ++idx, allItems, filteredItems) || filteredItems.indexOf(item) !== -1);
    }

    /**
     * Returns true if the group header should be shown (if there is a filtered suggestion item for this group item)
     *
     * @private
     */
    static _groupItemFilter(item, idx, allItems, filteredItems) {
      if (item.isGroupItem) {
        let groupHasFilteredItems;
        while (allItems[idx] && !allItems[idx].isGroupItem && !groupHasFilteredItems) {
          groupHasFilteredItems = filteredItems.indexOf(allItems[idx]) !== -1;
          idx++;
        }
        return groupHasFilteredItems;
      }
    }
    _getFirstMatchingItem(current) {
      const currentlyFocusedItem = this.items.find(item => item.focused === true);
      if (currentlyFocusedItem && currentlyFocusedItem.isGroupItem) {
        this.value = this.filterValue;
        return;
      }
      const matchingItems = this._startsWithMatchingItems(current).filter(item => !item.isGroupItem);
      if (matchingItems.length) {
        return matchingItems[0];
      }
    }
    _applyAtomicValueAndSelection(item, filterValue, highlightValue) {
      if (!item) {
        return;
      }
      const value = item && item.text || "";
      this.inner.value = value;
      if (highlightValue) {
        filterValue = filterValue || "";
        this.inner.setSelectionRange(filterValue.length, value.length);
      }
      this.value = value;
    }
    _selectMatchingItem() {
      const currentlyFocusedItem = this.items.find(item => item.focused);
      const shouldSelectionBeCleared = currentlyFocusedItem && currentlyFocusedItem.isGroupItem;
      this._filteredItems = this._filteredItems.map(item => {
        item.selected = !item.isGroupItem && item.text === this.value && !shouldSelectionBeCleared;
        return item;
      });
    }
    _fireChangeEvent() {
      if (this.value !== this._lastValue) {
        this.fireEvent("change");
        this._lastValue = this.value;
      }
    }
    _inputChange(event) {
      event.preventDefault();
    }
    _itemMousedown(event) {
      event.preventDefault();
    }
    _selectItem(event) {
      const listItem = event.detail.item;
      this._selectedItemText = listItem.mappedItem.text;
      this._selectionPerformed = true;
      const sameItemSelected = this.value === this._selectedItemText;
      const sameSelectionPerformed = this.value.toLowerCase() === this.filterValue.toLowerCase();
      if (sameItemSelected && sameSelectionPerformed) {
        this._fireChangeEvent(); // Click on an already typed, but not memoized value shouold also trigger the change event
        return this._closeRespPopover();
      }
      this.value = this._selectedItemText;
      if (!listItem.mappedItem.selected) {
        this.fireEvent("selection-change", {
          item: listItem.mappedItem
        });
        this._selectionChanged = true;
      }
      this._filteredItems.map(item => {
        item.selected = item === listItem.mappedItem && !item.isGroupItem;
        return item;
      });
      this._fireChangeEvent();
      this._closeRespPopover();

      // reset selection
      this.inner.setSelectionRange(this.value.length, this.value.length);
    }
    _onItemFocus(event) {
      this._itemFocused = true;
    }
    _announceSelectedItem(indexOfItem) {
      const itemPositionText = ComboBox.i18nBundle.getText(_i18nDefaults.LIST_ITEM_POSITION, indexOfItem + 1, this._filteredItems.length);
      const itemSelectionText = ComboBox.i18nBundle.getText(_i18nDefaults.LIST_ITEM_SELECTED);
      (0, _InvisibleMessage.default)(`${itemPositionText} ${itemSelectionText}`, "Polite");
    }
    get _headerTitleText() {
      return ComboBox.i18nBundle.getText(_i18nDefaults.INPUT_SUGGESTIONS_TITLE);
    }
    get _iconAccessibleNameText() {
      return ComboBox.i18nBundle.getText(_i18nDefaults.SELECT_OPTIONS);
    }
    get inner() {
      return (0, _Device.isPhone)() ? this.responsivePopover.querySelector(".ui5-input-inner-phone") : this.shadowRoot.querySelector("[inner-input]");
    }
    async _respPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      this.responsivePopover = staticAreaItem.querySelector("[ui5-responsive-popover]");
      return this.responsivePopover;
    }
    get editable() {
      return !this.readonly;
    }
    get hasValueState() {
      return this.valueState !== _ValueState.default.None;
    }
    get hasValueStateText() {
      return this.hasValueState && this.valueState !== _ValueState.default.Success;
    }
    get valueStateText() {
      return this.valueStateTextMappings[this.valueState];
    }
    get valueStateMessageText() {
      return this.getSlottedNodes("valueStateMessage").map(el => el.cloneNode(true));
    }
    get valueStateTextId() {
      return this.hasValueState ? `${this._id}-valueStateDesc` : undefined;
    }
    get valueStateTextMappings() {
      return {
        "Success": ComboBox.i18nBundle.getText(_i18nDefaults.VALUE_STATE_SUCCESS),
        "Error": ComboBox.i18nBundle.getText(_i18nDefaults.VALUE_STATE_ERROR),
        "Warning": ComboBox.i18nBundle.getText(_i18nDefaults.VALUE_STATE_WARNING),
        "Information": ComboBox.i18nBundle.getText(_i18nDefaults.VALUE_STATE_INFORMATION)
      };
    }
    get shouldOpenValueStateMessagePopover() {
      return this.focused && !this.readonly && this.hasValueStateText && !this._iconPressed && !this.open && !this._isPhone;
    }
    get shouldDisplayDefaultValueStateMessage() {
      return !this.valueStateMessage.length && this.hasValueStateText;
    }
    get _valueStatePopoverHorizontalAlign() {
      return this.effectiveDir !== "rtl" ? "Left" : "Right";
    }

    /**
     * This method is relevant for sap_horizon theme only
     */
    get _valueStateMessageIcon() {
      const iconPerValueState = {
        Error: "error",
        Warning: "alert",
        Success: "sys-enter-2",
        Information: "information"
      };
      return this.valueState !== _ValueState.default.None ? iconPerValueState[this.valueState] : "";
    }
    get open() {
      return this.responsivePopover ? this.responsivePopover.opened : false;
    }
    get _isPhone() {
      return (0, _Device.isPhone)();
    }
    get itemTabIndex() {
      return undefined;
    }
    get ariaLabelText() {
      return (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this);
    }
    static get dependencies() {
      return [_ComboBoxItem.default, _Icon.default, _ResponsivePopover.default, _List.default, _BusyIndicator.default, _Button.default, _StandardListItem.default, _GroupHeaderListItem.default, _Popover.default, _ComboBoxGroupItem.default];
    }
    static async onDefine() {
      ComboBox.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    get styles() {
      const remSizeInPx = parseInt(getComputedStyle(document.documentElement).fontSize);
      return {
        popoverHeader: {
          "width": `${this.offsetWidth}px`
        },
        suggestionPopoverHeader: {
          "display": this._listWidth === 0 ? "none" : "inline-block",
          "width": `${this._listWidth}px`
        },
        suggestionsPopover: {
          "min-width": `${this.offsetWidth}px`,
          "max-width": this.offsetWidth / remSizeInPx > 40 ? `${this.offsetWidth}px` : "40rem"
        }
      };
    }
    get classes() {
      return {
        popover: {
          "ui5-suggestions-popover": !this.isPhone,
          "ui5-suggestions-popover-with-value-state-header": !this.isPhone && this.hasValueStateText
        },
        popoverValueState: {
          "ui5-valuestatemessage-header": true,
          "ui5-valuestatemessage-root": true,
          "ui5-valuestatemessage--success": this.valueState === _ValueState.default.Success,
          "ui5-valuestatemessage--error": this.valueState === _ValueState.default.Error,
          "ui5-valuestatemessage--warning": this.valueState === _ValueState.default.Warning,
          "ui5-valuestatemessage--information": this.valueState === _ValueState.default.Information
        }
      };
    }
  }
  ComboBox.SKIP_ITEMS_SIZE = 10;
  ComboBox.define();
  var _default = ComboBox;
  _exports.default = _default;
});