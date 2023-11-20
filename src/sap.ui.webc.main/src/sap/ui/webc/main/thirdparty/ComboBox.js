sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/types/InvisibleMessageMode", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/util/InvisibleMessage", "sap/ui/webc/common/thirdparty/base/CustomElementsScope", "sap/ui/webc/common/thirdparty/icons/slim-arrow-down", "sap/ui/webc/common/thirdparty/icons/decline", "sap/ui/webc/common/thirdparty/icons/not-editable", "sap/ui/webc/common/thirdparty/icons/error", "sap/ui/webc/common/thirdparty/icons/alert", "sap/ui/webc/common/thirdparty/icons/sys-enter-2", "sap/ui/webc/common/thirdparty/icons/information", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/Keys", "./Filters", "./generated/i18n/i18n-defaults", "./generated/templates/ComboBoxTemplate.lit", "./generated/templates/ComboBoxPopoverTemplate.lit", "./generated/themes/ComboBox.css", "./generated/themes/ComboBoxPopover.css", "./generated/themes/ResponsivePopoverCommon.css", "./generated/themes/ValueStateMessage.css", "./generated/themes/Suggestions.css", "./ComboBoxItem", "./Icon", "./Popover", "./ResponsivePopover", "./List", "./BusyIndicator", "./Button", "./StandardListItem", "./ComboBoxGroupItem", "./GroupHeaderListItem", "./types/ComboBoxFilter", "./types/PopoverHorizontalAlign"], function (_exports, _UI5Element, _customElement, _property, _event, _slot, _LitRenderer, _ValueState, _Device, _Integer, _InvisibleMessageMode, _AriaLabelHelper, _InvisibleMessage, _CustomElementsScope, _slimArrowDown, _decline, _notEditable, _error, _alert, _sysEnter, _information, _i18nBundle, _FeaturesRegistry, _Keys, Filters, _i18nDefaults, _ComboBoxTemplate, _ComboBoxPopoverTemplate, _ComboBox, _ComboBoxPopover, _ResponsivePopoverCommon, _ValueStateMessage, _Suggestions, _ComboBoxItem, _Icon, _Popover, _ResponsivePopover, _List, _BusyIndicator, _Button, _StandardListItem, _ComboBoxGroupItem, _GroupHeaderListItem, _ComboBoxFilter, _PopoverHorizontalAlign) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _slot = _interopRequireDefault(_slot);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ValueState = _interopRequireDefault(_ValueState);
  _Integer = _interopRequireDefault(_Integer);
  _InvisibleMessageMode = _interopRequireDefault(_InvisibleMessageMode);
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
  _ComboBoxFilter = _interopRequireDefault(_ComboBoxFilter);
  _PopoverHorizontalAlign = _interopRequireDefault(_PopoverHorizontalAlign);
  function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
  function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var ComboBox_1;

  // Templates

  // Styles

  const SKIP_ITEMS_SIZE = 10;
  var ValueStateIconMapping;
  (function (ValueStateIconMapping) {
    ValueStateIconMapping["Error"] = "error";
    ValueStateIconMapping["Warning"] = "alert";
    ValueStateIconMapping["Success"] = "sys-enter-2";
    ValueStateIconMapping["Information"] = "information";
  })(ValueStateIconMapping || (ValueStateIconMapping = {}));
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
   *
   * <ul>
   * <li> Input field - displays the selected option or a custom user entry. Users can type to narrow down the list or enter their own value.</li>
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
   * @alias sap.ui.webc.main.ComboBox
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-combobox
   * @appenddocs sap.ui.webc.main.ComboBoxItem sap.ui.webc.main.ComboBoxGroupItem
   * @public
   * @since 1.0.0-rc.6
   */
  let ComboBox = ComboBox_1 = class ComboBox extends _UI5Element.default {
    constructor() {
      super();
      this._filteredItems = [];
      this._initialRendering = true;
      this._itemFocused = false;
      this._autocomplete = false;
      this._isKeyNavigation = false;
      this._lastValue = "";
      this._selectionPerformed = false;
      this._selectedItemText = "";
      this._userTypedValue = "";
    }
    onBeforeRendering() {
      const popover = this.valueStatePopover;
      this.FormSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");
      if (this._initialRendering || this.filter === "None") {
        this._filteredItems = this.items;
      }
      if (!this._initialRendering && document.activeElement === this && !this._filteredItems.length) {
        popover?.close();
      }
      this._selectMatchingItem();
      this._initialRendering = false;
      const slottedIconsCount = this.icon.length || 0;
      const arrowDownIconsCount = this.readonly ? 0 : 1;
      this.style.setProperty((0, _CustomElementsScope.getScopedVarName)("--_ui5-input-icons-count"), `${slottedIconsCount + arrowDownIconsCount}`);
    }
    async onAfterRendering() {
      const picker = await this._getPicker();
      if ((0, _Device.isPhone)() && picker.opened) {
        // Set initial focus to the native input
        this.inner.focus();
      }
      if ((await this.shouldClosePopover()) && !(0, _Device.isPhone)()) {
        picker.close(false, false, true);
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
    async shouldClosePopover() {
      const popover = await this._getPicker();
      return popover.opened && !this.focused && !this._itemFocused && !this._isValueStateFocused;
    }
    _focusin(e) {
      this.focused = true;
      this._lastValue = this.value;
      this._autocomplete = false;
      !(0, _Device.isPhone)() && e.target.setSelectionRange(0, this.value.length);
    }
    _focusout(e) {
      const toBeFocused = e.relatedTarget;
      const focusedOutToValueStateMessage = toBeFocused?.shadowRoot?.querySelector(".ui5-valuestatemessage-root");
      this._fireChangeEvent();
      if (focusedOutToValueStateMessage) {
        e.stopImmediatePropagation();
        return;
      }
      if (!this.shadowRoot.contains(toBeFocused) && this.staticAreaItem !== e.relatedTarget) {
        this.focused = false;
        !(0, _Device.isPhone)() && this._closeRespPopover(e);
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
    async _toggleRespPopover() {
      const picker = await this._getPicker();
      if (picker.opened) {
        this._closeRespPopover();
      } else {
        this._openRespPopover();
      }
    }
    async storeResponsivePopoverWidth() {
      if (this.open && !this._listWidth) {
        this._listWidth = (await this._getPicker()).offsetWidth;
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
      (await this._getValueStatePopover())?.showAt(this);
    }
    async closeValueStatePopover() {
      (await this._getValueStatePopover())?.close();
    }
    async _getValueStatePopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      const popover = staticAreaItem.querySelector(".ui5-valuestatemessage-popover");
      // backward compatibility
      // rework all methods to work with async getters
      this.valueStatePopover = popover;
      return popover;
    }
    _resetFilter() {
      this._userTypedValue = "";
      this.inner.setSelectionRange(0, this.value.length);
      this._filteredItems = this._filterItems("");
      this._selectMatchingItem();
    }
    _arrowClick() {
      this.inner.focus();
      this._resetFilter();
      if ((0, _Device.isPhone)() && this.value && !this._lastValue) {
        this._lastValue = this.value;
      }
      this._toggleRespPopover();
    }
    _input(e) {
      const {
        value
      } = e.target;
      const shouldAutocomplete = this.shouldAutocomplete(e);
      if (e.target === this.inner) {
        // stop the native event, as the semantic "input" would be fired.
        e.stopImmediatePropagation();
        this.focused = true;
        this._isValueStateFocused = false;
      }
      this._filteredItems = this._filterItems(value);
      this.value = value;
      this.filterValue = value;
      this._clearFocus();
      // autocomplete
      if (shouldAutocomplete && !(0, _Device.isAndroid)()) {
        const item = this._getFirstMatchingItem(value);
        item && this._applyAtomicValueAndSelection(item, value, true);
        if (value !== "" && item && !item.selected && !item.isGroupItem) {
          this.fireEvent("selection-change", {
            item
          });
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
    shouldAutocomplete(e) {
      const eventType = e.inputType;
      const allowedEventTypes = ["deleteWordBackward", "deleteWordForward", "deleteSoftLineBackward", "deleteSoftLineForward", "deleteEntireSoftLine", "deleteHardLineBackward", "deleteHardLineForward", "deleteByDrag", "deleteByCut", "deleteContent", "deleteContentBackward", "deleteContentForward", "historyUndo"];
      return !allowedEventTypes.includes(eventType);
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
    handleNavKeyPress(e) {
      if (this.focused && ((0, _Keys.isHome)(e) || (0, _Keys.isEnd)(e)) && this.value) {
        return;
      }
      const isOpen = this.open;
      const currentItem = this._filteredItems.find(item => {
        return isOpen ? item.focused : item.selected;
      });
      const indexOfItem = currentItem ? this._filteredItems.indexOf(currentItem) : -1;
      e.preventDefault();
      if (this.focused && isOpen && ((0, _Keys.isUp)(e) || (0, _Keys.isPageUp)(e) || (0, _Keys.isPageDown)(e))) {
        return;
      }
      if (this._filteredItems.length - 1 === indexOfItem && (0, _Keys.isDown)(e)) {
        return;
      }
      this._isKeyNavigation = true;
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "PageUp" || e.key === "PageDown" || e.key === "Home" || e.key === "End") {
        this[`_handle${e.key}`](e, indexOfItem);
      }
    }
    _handleItemNavigation(e, indexOfItem, isForward) {
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
      this._announceSelectedItem(indexOfItem);
      if (isGroupItem && isOpen) {
        return;
      }
      // autocomplete
      const item = this._getFirstMatchingItem(this.value);
      item && this._applyAtomicValueAndSelection(item, this.open ? this._userTypedValue : "", true);
      if (item && !item.selected) {
        this.fireEvent("selection-change", {
          item
        });
      }
      this.fireEvent("input");
      this._fireChangeEvent();
    }
    _handleArrowDown(e, indexOfItem) {
      const isOpen = this.open;
      if (this.focused && indexOfItem === -1 && this.hasValueStateText && isOpen) {
        this._isValueStateFocused = true;
        this.focused = false;
        return;
      }
      indexOfItem = !isOpen && this.hasValueState && indexOfItem === -1 ? 0 : indexOfItem;
      this._handleItemNavigation(e, ++indexOfItem, true /* isForward */);
    }

    _handleArrowUp(e, indexOfItem) {
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
      this._handleItemNavigation(e, --indexOfItem, false /* isForward */);
    }

    _handlePageUp(e, indexOfItem) {
      const isProposedIndexValid = indexOfItem - SKIP_ITEMS_SIZE > -1;
      indexOfItem = isProposedIndexValid ? indexOfItem - SKIP_ITEMS_SIZE : 0;
      const shouldMoveForward = this._filteredItems[indexOfItem].isGroupItem && !this.open;
      if (!isProposedIndexValid && this.hasValueStateText && this.open) {
        this._clearFocus();
        this._itemFocused = false;
        this._isValueStateFocused = true;
        return;
      }
      this._handleItemNavigation(e, indexOfItem, shouldMoveForward);
    }
    _handlePageDown(e, indexOfItem) {
      const itemsLength = this._filteredItems.length;
      const isProposedIndexValid = indexOfItem + SKIP_ITEMS_SIZE < itemsLength;
      indexOfItem = isProposedIndexValid ? indexOfItem + SKIP_ITEMS_SIZE : itemsLength - 1;
      const shouldMoveForward = this._filteredItems[indexOfItem].isGroupItem && !this.open;
      this._handleItemNavigation(e, indexOfItem, shouldMoveForward);
    }
    _handleHome(e) {
      const shouldMoveForward = this._filteredItems[0].isGroupItem && !this.open;
      if (this.hasValueStateText && this.open) {
        this._clearFocus();
        this._itemFocused = false;
        this._isValueStateFocused = true;
        return;
      }
      this._handleItemNavigation(e, 0, shouldMoveForward);
    }
    _handleEnd(e) {
      this._handleItemNavigation(e, this._filteredItems.length - 1, true /* isForward */);
    }

    _keyup() {
      this._userTypedValue = this.value.substring(0, this.inner.selectionStart || 0);
    }
    _keydown(e) {
      const isNavKey = (0, _Keys.isDown)(e) || (0, _Keys.isUp)(e) || (0, _Keys.isPageUp)(e) || (0, _Keys.isPageDown)(e) || (0, _Keys.isHome)(e) || (0, _Keys.isEnd)(e);
      const picker = this.responsivePopover;
      this._autocomplete = !((0, _Keys.isBackSpace)(e) || (0, _Keys.isDelete)(e));
      this._isKeyNavigation = false;
      if (isNavKey && !this.readonly && this._filteredItems.length) {
        this.handleNavKeyPress(e);
      }
      if ((0, _Keys.isEnter)(e)) {
        this._fireChangeEvent();
        if (picker?.opened) {
          this._closeRespPopover();
          this.focused = true;
        } else if (this.FormSupport) {
          this.FormSupport.triggerFormSubmit(this);
        }
      }
      if ((0, _Keys.isEscape)(e)) {
        this.focused = true;
        this.value = !this.open ? this._lastValue : this.value;
        this._isValueStateFocused = false;
      }
      if (((0, _Keys.isTabNext)(e) || (0, _Keys.isTabPrevious)(e)) && this.open) {
        this._closeRespPopover();
      }
      if ((0, _Keys.isShow)(e) && !this.readonly && !this.disabled) {
        e.preventDefault();
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
          this._handleItemNavigation(e, 0, true /* isForward */);
        } else {
          this.focused = true;
        }
      }
    }
    _click() {
      if ((0, _Device.isPhone)() && !this.readonly) {
        this._openRespPopover();
      }
    }
    _closeRespPopover(e) {
      const picker = this.responsivePopover;
      if (e && e.target.classList.contains("ui5-responsive-popover-close-btn") && this._selectedItemText) {
        this.value = this._selectedItemText;
        this.filterValue = this._selectedItemText;
      }
      if (e && e.target.classList.contains("ui5-responsive-popover-close-btn")) {
        this.value = this._lastValue || "";
        this.filterValue = this._lastValue || "";
      }
      if ((0, _Device.isPhone)()) {
        this._fireChangeEvent();
      }
      this._isValueStateFocused = false;
      this._clearFocus();
      picker?.close();
    }
    async _openRespPopover() {
      (await this._getPicker()).showAt(this);
    }
    _filterItems(str) {
      const itemsToFilter = this.items.filter(item => !item.isGroupItem);
      const filteredItems = (Filters[this.filter] || Filters.StartsWithPerTerm)(str, itemsToFilter, "text");
      // Return the filtered items and their group items
      return this.items.filter((item, idx, allItems) => ComboBox_1._groupItemFilter(item, ++idx, allItems, filteredItems) || filteredItems.indexOf(item) !== -1);
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
      if (currentlyFocusedItem?.isGroupItem) {
        this.value = this.filterValue;
        return;
      }
      const matchingItems = this._startsWithMatchingItems(current).filter(item => !item.isGroupItem);
      if (matchingItems.length) {
        return matchingItems[0];
      }
    }
    _applyAtomicValueAndSelection(item, filterValue, highlightValue) {
      const value = item && item.text || "";
      this.inner.value = value;
      if (highlightValue) {
        this.inner.setSelectionRange(filterValue.length, value.length);
      }
      this.value = value;
    }
    _selectMatchingItem() {
      const currentlyFocusedItem = this.items.find(item => item.focused);
      const shouldSelectionBeCleared = currentlyFocusedItem && currentlyFocusedItem.isGroupItem;
      const itemToBeSelected = this._filteredItems.find(item => {
        return !item.isGroupItem && item.text === this.value && !shouldSelectionBeCleared;
      });
      this._filteredItems = this._filteredItems.map(item => {
        item.selected = item === itemToBeSelected;
        return item;
      });
    }
    _fireChangeEvent() {
      if (this.value !== this._lastValue) {
        this.fireEvent("change");
        this._lastValue = this.value;
      }
    }
    _inputChange(e) {
      e.preventDefault();
    }
    _itemMousedown(e) {
      e.preventDefault();
    }
    _selectItem(e) {
      const listItem = e.detail.item;
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
    _onItemFocus() {
      this._itemFocused = true;
    }
    _announceSelectedItem(indexOfItem) {
      const currentItem = this._filteredItems[indexOfItem];
      const currentItemAdditionalText = currentItem.additionalText || "";
      const isGroupItem = currentItem?.isGroupItem;
      const itemPositionText = ComboBox_1.i18nBundle.getText(_i18nDefaults.LIST_ITEM_POSITION, indexOfItem + 1, this._filteredItems.length);
      const groupHeaderText = ComboBox_1.i18nBundle.getText(_i18nDefaults.LIST_ITEM_GROUP_HEADER);
      if (isGroupItem) {
        (0, _InvisibleMessage.default)(`${groupHeaderText} ${currentItem.text}`, _InvisibleMessageMode.default.Polite);
      } else {
        (0, _InvisibleMessage.default)(`${currentItemAdditionalText} ${itemPositionText}`.trim(), _InvisibleMessageMode.default.Polite);
      }
    }
    get _headerTitleText() {
      return ComboBox_1.i18nBundle.getText(_i18nDefaults.INPUT_SUGGESTIONS_TITLE);
    }
    get _iconAccessibleNameText() {
      return ComboBox_1.i18nBundle.getText(_i18nDefaults.SELECT_OPTIONS);
    }
    get inner() {
      return (0, _Device.isPhone)() ? this.responsivePopover.querySelector(".ui5-input-inner-phone") : this.shadowRoot.querySelector("[inner-input]");
    }
    async _getPicker() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      const picker = staticAreaItem.querySelector("[ui5-responsive-popover]");
      // backward compatibility
      // rework all methods to work with async getters
      this.responsivePopover = picker;
      return picker;
    }
    get hasValueState() {
      return this.valueState !== _ValueState.default.None;
    }
    get hasValueStateText() {
      return this.hasValueState && this.valueState !== _ValueState.default.Success;
    }
    get ariaValueStateHiddenText() {
      if (!this.hasValueState) {
        return "";
      }
      let text = "";
      if (this.valueState !== _ValueState.default.None) {
        text = this.valueStateTypeMappings[this.valueState];
      }
      if (this.shouldDisplayDefaultValueStateMessage) {
        return `${text} ${this.valueStateDefaultText || ""}`;
      }
      return `${text}`.concat(" ", this.valueStateMessageText.map(el => el.textContent).join(" "));
    }
    get valueStateDefaultText() {
      if (this.valueState === _ValueState.default.None) {
        return;
      }
      return this.valueStateTextMappings[this.valueState];
    }
    get valueStateMessageText() {
      return this.getSlottedNodes("valueStateMessage").map(el => el.cloneNode(true));
    }
    get valueStateTextMappings() {
      return {
        [_ValueState.default.Success]: ComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_SUCCESS),
        [_ValueState.default.Error]: ComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_ERROR),
        [_ValueState.default.Warning]: ComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_WARNING),
        [_ValueState.default.Information]: ComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_INFORMATION)
      };
    }
    get valueStateTypeMappings() {
      return {
        [_ValueState.default.Success]: ComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_TYPE_SUCCESS),
        [_ValueState.default.Information]: ComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_TYPE_INFORMATION),
        [_ValueState.default.Error]: ComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_TYPE_ERROR),
        [_ValueState.default.Warning]: ComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_TYPE_WARNING)
      };
    }
    get shouldOpenValueStateMessagePopover() {
      return this.focused && !this.readonly && this.hasValueStateText && !this._iconPressed && !this.open && !this._isPhone;
    }
    get shouldDisplayDefaultValueStateMessage() {
      return !this.valueStateMessage.length && this.hasValueStateText;
    }
    get _valueStatePopoverHorizontalAlign() {
      return this.effectiveDir !== "rtl" ? _PopoverHorizontalAlign.default.Left : _PopoverHorizontalAlign.default.Right;
    }
    /**
     * This method is relevant for sap_horizon theme only
     */
    get _valueStateMessageIcon() {
      return this.valueState !== _ValueState.default.None ? ValueStateIconMapping[this.valueState] : "";
    }
    get open() {
      return this?.responsivePopover?.opened || false;
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
    static async onDefine() {
      ComboBox_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    get styles() {
      const remSizeInPx = parseInt(getComputedStyle(document.documentElement).fontSize);
      return {
        popoverHeader: {
          "width": `${this.offsetWidth}px`
        },
        suggestionPopoverHeader: {
          "display": this._listWidth === 0 ? "none" : "inline-block",
          "width": `${this._listWidth || ""}px`
        },
        suggestionsPopover: {
          "min-width": `${this.offsetWidth || 0}px`,
          "max-width": this.offsetWidth / remSizeInPx > 40 ? `${this.offsetWidth}px` : "40rem"
        }
      };
    }
    get classes() {
      return {
        popover: {
          "ui5-suggestions-popover": !this._isPhone,
          "ui5-suggestions-popover-with-value-state-header": !this._isPhone && this.hasValueStateText
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
  };
  __decorate([(0, _property.default)()], ComboBox.prototype, "value", void 0);
  __decorate([(0, _property.default)()], ComboBox.prototype, "filterValue", void 0);
  __decorate([(0, _property.default)()], ComboBox.prototype, "placeholder", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ComboBox.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], ComboBox.prototype, "valueState", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ComboBox.prototype, "readonly", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ComboBox.prototype, "required", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ComboBox.prototype, "loading", void 0);
  __decorate([(0, _property.default)({
    type: _ComboBoxFilter.default,
    defaultValue: _ComboBoxFilter.default.StartsWithPerTerm
  })], ComboBox.prototype, "filter", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ComboBox.prototype, "focused", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], ComboBox.prototype, "_isValueStateFocused", void 0);
  __decorate([(0, _property.default)()], ComboBox.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)()], ComboBox.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], ComboBox.prototype, "_iconPressed", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    noAttribute: true,
    multiple: true
  })], ComboBox.prototype, "_filteredItems", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    noAttribute: true
  })], ComboBox.prototype, "_listWidth", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true,
    invalidateOnChildChange: true
  })], ComboBox.prototype, "items", void 0);
  __decorate([(0, _slot.default)()], ComboBox.prototype, "valueStateMessage", void 0);
  __decorate([(0, _slot.default)()], ComboBox.prototype, "icon", void 0);
  ComboBox = ComboBox_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-combobox",
    languageAware: true,
    renderer: _LitRenderer.default,
    styles: _ComboBox.default,
    staticAreaStyles: [_ResponsivePopoverCommon.default, _ValueStateMessage.default, _ComboBoxPopover.default, _Suggestions.default],
    template: _ComboBoxTemplate.default,
    staticAreaTemplate: _ComboBoxPopoverTemplate.default,
    dependencies: [_ComboBoxItem.default, _Icon.default, _ResponsivePopover.default, _List.default, _BusyIndicator.default, _Button.default, _StandardListItem.default, _GroupHeaderListItem.default, _Popover.default, _ComboBoxGroupItem.default]
  })
  /**
   * Fired when the input operation has finished by pressing Enter, focusout or an item is selected.
   *
   * @event sap.ui.webc.main.ComboBox#change
   * @public
   */, (0, _event.default)("change")
  /**
   * Fired when typing in input.
   * <br><br>
   * <b>Note:</b> filterValue property is updated, input is changed.
   * @event sap.ui.webc.main.ComboBox#input
   * @public
   */, (0, _event.default)("input")
  /**
   * Fired when selection is changed by user interaction
   *
   * @event sap.ui.webc.main.ComboBox#selection-change
   * @param {sap.ui.webc.main.IComboBoxItem} item item to be selected.
   * @public
   */, (0, _event.default)("selection-change", {
    detail: {
      item: {
        type: HTMLElement
      }
    }
  })], ComboBox);
  ComboBox.define();
  var _default = ComboBox;
  _exports.default = _default;
});