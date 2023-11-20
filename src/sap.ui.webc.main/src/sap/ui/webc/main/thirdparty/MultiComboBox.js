sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/icons/slim-arrow-down", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/icons/decline", "sap/ui/webc/common/thirdparty/icons/multiselect-all", "sap/ui/webc/common/thirdparty/icons/not-editable", "sap/ui/webc/common/thirdparty/icons/error", "sap/ui/webc/common/thirdparty/icons/alert", "sap/ui/webc/common/thirdparty/icons/sys-enter-2", "sap/ui/webc/common/thirdparty/icons/information", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/CustomElementsScope", "./MultiComboBoxItem", "./MultiComboBoxGroupItem", "./GroupHeaderListItem", "./Tokenizer", "./Token", "./Icon", "./Popover", "./ResponsivePopover", "./List", "./StandardListItem", "./ToggleButton", "./Filters", "./Button", "./generated/i18n/i18n-defaults", "./generated/templates/MultiComboBoxTemplate.lit", "./generated/templates/MultiComboBoxPopoverTemplate.lit", "./generated/themes/MultiComboBox.css", "./generated/themes/ResponsivePopoverCommon.css", "./generated/themes/ValueStateMessage.css", "./generated/themes/Suggestions.css", "./generated/themes/MultiComboBoxPopover.css", "./types/ComboBoxFilter"], function (_exports, _UI5Element, _customElement, _property, _slot, _event, _LitRenderer, _ResizeHandler, _ValueState, _Keys, _Integer, _slimArrowDown, _Device, _i18nBundle, _decline, _multiselectAll, _notEditable, _error, _alert, _sysEnter, _information, _FeaturesRegistry, _AriaLabelHelper, _CustomElementsScope, _MultiComboBoxItem, _MultiComboBoxGroupItem, _GroupHeaderListItem, _Tokenizer, _Token, _Icon, _Popover, _ResponsivePopover, _List, _StandardListItem, _ToggleButton, Filters, _Button, _i18nDefaults, _MultiComboBoxTemplate, _MultiComboBoxPopoverTemplate, _MultiComboBox, _ResponsivePopoverCommon, _ValueStateMessage, _Suggestions, _MultiComboBoxPopover, _ComboBoxFilter) {
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
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _ValueState = _interopRequireDefault(_ValueState);
  _Integer = _interopRequireDefault(_Integer);
  _MultiComboBoxItem = _interopRequireDefault(_MultiComboBoxItem);
  _MultiComboBoxGroupItem = _interopRequireDefault(_MultiComboBoxGroupItem);
  _GroupHeaderListItem = _interopRequireDefault(_GroupHeaderListItem);
  _Tokenizer = _interopRequireWildcard(_Tokenizer);
  _Token = _interopRequireDefault(_Token);
  _Icon = _interopRequireDefault(_Icon);
  _Popover = _interopRequireDefault(_Popover);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  _List = _interopRequireDefault(_List);
  _StandardListItem = _interopRequireDefault(_StandardListItem);
  _ToggleButton = _interopRequireDefault(_ToggleButton);
  Filters = _interopRequireWildcard(Filters);
  _Button = _interopRequireDefault(_Button);
  _MultiComboBoxTemplate = _interopRequireDefault(_MultiComboBoxTemplate);
  _MultiComboBoxPopoverTemplate = _interopRequireDefault(_MultiComboBoxPopoverTemplate);
  _MultiComboBox = _interopRequireDefault(_MultiComboBox);
  _ResponsivePopoverCommon = _interopRequireDefault(_ResponsivePopoverCommon);
  _ValueStateMessage = _interopRequireDefault(_ValueStateMessage);
  _Suggestions = _interopRequireDefault(_Suggestions);
  _MultiComboBoxPopover = _interopRequireDefault(_MultiComboBoxPopover);
  _ComboBoxFilter = _interopRequireDefault(_ComboBoxFilter);
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
  var MultiComboBox_1;

  // Templates

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-multi-combobox</code> component consists of a list box with items and a text field allowing the user to either type a value directly into the text field, or choose from the list of existing items.
   *
   * The drop-down list is used for selecting and filtering values, it enables users to select one or more options from a predefined list. The control provides an editable input field to filter the list, and a dropdown arrow to expand/collapse the list of available options.
   * The options in the list have checkboxes that permit multi-selection. Entered values are displayed as tokens.
   * <h3>Structure</h3>
   * The <code>ui5-multi-combobox</code> consists of the following elements:
   * <ul>
   * <li> Tokenizer - a list of tokens with selected options.</li>
   * <li> Input field - displays the selected option/s as token/s. Users can type to filter the list.</li>
   * <li> Drop-down arrow - expands\collapses the option list.</li>
   * <li> Option list - the list of available options.</li>
   * </ul>
   * <h3>Keyboard Handling</h3>
   *
   * The <code>ui5-multi-combobox</code> provides advanced keyboard handling.
   *
   * <h4>Picker</h4>
   * If the <code>ui5-multi-combobox</code> is focused,
   * you can open or close the drop-down by pressing <code>F4</code>, <code>ALT+UP</code> or <code>ALT+DOWN</code> keys.
   * Once the drop-down is opened, you can use the <code>UP</code> and <code>DOWN</code> arrow keys
   * to navigate through the available options and select one by pressing the <code>Space</code> or <code>Enter</code> keys.
   * <br>
   *
   * <h4>Tokens</h4>
   * <ul>
   * <li> Left/Right arrow keys - moves the focus selection form the currently focused token to the previous/next one (if available). </li>
   * <li> Delete -  deletes the token and focuses the previous token. </li>
   * <li> Backspace -  deletes the token and focus the next token. </li>
   * </ul>
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-multi-combobox</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>token-{index} - Used to style each token(where <code>token-0</code> corresponds to the first item)</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/MultiComboBox";</code>
   *
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.MultiComboBox
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-multi-combobox
   * @public
   * @appenddocs sap.ui.webc.main.MultiComboBoxItem sap.ui.webc.main.MultiComboBoxGroupItem
   * @since 0.11.0
   */
  let MultiComboBox = MultiComboBox_1 = class MultiComboBox extends _UI5Element.default {
    constructor() {
      super();
      this._filteredItems = [];
      this._previouslySelectedItems = [];
      this.selectedValues = [];
      this._itemsBeforeOpen = [];
      this._inputLastValue = "";
      this._valueBeforeOpen = "";
      this._deleting = false;
      this._validationTimeout = null;
      this._handleResizeBound = this._handleResize.bind(this);
      this.valueBeforeAutoComplete = "";
      this._lastValue = "";
      this.currentItemIdx = -1;
      this.FormSupport = undefined;
    }
    onEnterDOM() {
      _ResizeHandler.default.register(this, this._handleResizeBound);
    }
    onExitDOM() {
      _ResizeHandler.default.deregister(this, this._handleResizeBound);
    }
    _handleResize() {
      this._inputWidth = this.offsetWidth;
    }
    _inputChange() {
      this.fireEvent("change");
    }
    togglePopover() {
      this._tokenizer.closeMorePopover();
      this.allItemsPopover?.toggle(this);
    }
    togglePopoverByDropdownIcon() {
      this._shouldFilterItems = false;
      this.allItemsPopover?.toggle(this);
      this._tokenizer.closeMorePopover();
    }
    _showFilteredItems() {
      this.filterSelected = true;
      this._showMorePressed = true;
      this.togglePopover();
    }
    filterSelectedItems(e) {
      this.filterSelected = e.target.pressed;
      const selectedItems = this._filteredItems.filter(item => item.selected);
      this.selectedItems = this.items.filter((item, idx, allItems) => MultiComboBox_1._groupItemFilter(item, ++idx, allItems, selectedItems) || selectedItems.indexOf(item) !== -1);
    }
    get _showAllItemsButtonPressed() {
      return this.filterSelected;
    }
    get _inputDom() {
      return this.shadowRoot.querySelector("#ui5-multi-combobox-input");
    }
    _inputLiveChange(e) {
      const input = e.target;
      const value = input.value;
      const filteredItems = this._filterItems(value);
      const oldValueState = this.valueState;
      this._shouldFilterItems = true;
      if (this.filterSelected) {
        this.filterSelected = false;
      }
      if (this._validationTimeout) {
        input.value = this._inputLastValue;
        return;
      }
      if (!filteredItems.length && value && !this.allowCustomValues) {
        input.value = this.valueBeforeAutoComplete || this._inputLastValue;
        this.valueState = _ValueState.default.Error;
        this._shouldAutocomplete = false;
        this._resetValueState(oldValueState);
        return;
      }
      this._inputLastValue = input.value;
      this.value = input.value;
      this._filteredItems = filteredItems;
      if (!(0, _Device.isPhone)()) {
        if (filteredItems.length === 0) {
          this.allItemsPopover?.close();
        } else {
          this.allItemsPopover?.showAt(this);
        }
      }
      this.fireEvent("input");
    }
    _tokenDelete(e) {
      this._previouslySelectedItems = this._getSelectedItems();
      const token = e.detail.ref;
      const deletingItem = this.items.find(item => item._id === token.getAttribute("data-ui5-id"));
      deletingItem.selected = false;
      this._deleting = true;
      this._preventTokenizerToggle = true;
      this.focus();
      const changePrevented = this.fireSelectionChange();
      if (changePrevented) {
        this._revertSelection();
      }
    }
    get _getPlaceholder() {
      if (this._getSelectedItems().length) {
        return "";
      }
      return this.placeholder;
    }
    _handleArrowLeft() {
      const inputDomRef = this._inputDom;
      const cursorPosition = inputDomRef.selectionStart || 0;
      const isTextSelected = (inputDomRef.selectionEnd || 0) - cursorPosition > 0;
      if (cursorPosition === 0 && !isTextSelected) {
        this._tokenizer._focusLastToken();
      }
    }
    _tokenizerFocusOut(e) {
      this._tokenizerFocused = false;
      const tokensCount = this._tokenizer.tokens.length;
      const selectedTokens = this._selectedTokensCount;
      const lastTokenBeingDeleted = tokensCount - 1 === 0 && this._deleting;
      const allTokensAreBeingDeleted = selectedTokens === tokensCount && this._deleting;
      const relatedTarget = e.relatedTarget;
      const isFocusingPopover = this.staticAreaItem === relatedTarget;
      const isFocusingInput = this._inputDom === relatedTarget;
      const isFocusingMorePopover = e.relatedTarget === this._tokenizer.staticAreaItem;
      if (!relatedTarget?.hasAttribute("ui5-token") && !isFocusingPopover && !isFocusingInput && !isFocusingMorePopover) {
        this._tokenizer.tokens.forEach(token => {
          token.selected = false;
        });
        this._tokenizer.expanded = this._preventTokenizerToggle ? this._tokenizer.expanded : false;
      }
      if (allTokensAreBeingDeleted || lastTokenBeingDeleted) {
        setTimeout(() => {
          if (!(0, _Device.isPhone)()) {
            this._inputDom.focus();
          }
          this._deleting = false;
        }, 0);
      }
    }
    _tokenizerFocusIn() {
      this._tokenizerFocused = true;
      this.focused = false;
    }
    _onkeydown(e) {
      const isArrowDownCtrl = (0, _Keys.isDownCtrl)(e);
      const isCtrl = e.metaKey || e.ctrlKey;
      if ((0, _Keys.isShow)(e) && !this.disabled) {
        this._handleShow(e);
        return;
      }
      if ((0, _Keys.isDownShift)(e) || (0, _Keys.isUpShift)(e)) {
        e.preventDefault();
        return;
      }
      if ((0, _Keys.isUp)(e) || (0, _Keys.isDown)(e) || (0, _Keys.isUpCtrl)(e) || isArrowDownCtrl) {
        this._handleArrowNavigation(e, isArrowDownCtrl);
        return;
      }
      // CTRL + Arrow Down navigation is performed by the ItemNavigation module of the List,
      // here we only implement the text selection of the selected item
      if (isArrowDownCtrl && !this.allItemsPopover?.opened) {
        setTimeout(() => this._inputDom.setSelectionRange(0, this._inputDom.value.length), 0);
      }
      if ((0, _Keys.isLeftCtrl)(e) || (0, _Keys.isRightCtrl)(e)) {
        this._handleArrowCtrl(e);
        return;
      }
      if ((0, _Keys.isInsertShift)(e)) {
        this._handleInsertPaste();
        return;
      }
      if (isCtrl && e.key.toLowerCase() === "i" && this._tokenizer.tokens.length > 0) {
        e.preventDefault();
        this.togglePopover();
      }
      if ((0, _Keys.isSpaceShift)(e)) {
        e.preventDefault();
      }
      if (e.key === "ArrowLeft" || e.key === "Show" || e.key === "PageUp" || e.key === "PageDown" || e.key === "Backspace" || e.key === "Escape" || e.key === "Home" || e.key === "End" || e.key === "Tab" || e.key === "ArrowDown" || e.key === "Enter") {
        this[`_handle${e.key}`](e);
      }
      this._shouldAutocomplete = !this.noTypeahead && !((0, _Keys.isBackSpace)(e) || (0, _Keys.isDelete)(e) || (0, _Keys.isEscape)(e) || (0, _Keys.isEnter)(e));
    }
    _handlePaste(e) {
      e.preventDefault();
      if (this.readonly || !e.clipboardData) {
        return;
      }
      const pastedText = e.clipboardData.getData("text/plain");
      if (!pastedText) {
        return;
      }
      this._createTokenFromText(pastedText);
    }
    async _handleInsertPaste() {
      if (this.readonly || (0, _Device.isFirefox)()) {
        return;
      }
      const pastedText = await navigator.clipboard.readText();
      if (!pastedText) {
        return;
      }
      this._createTokenFromText(pastedText);
    }
    _createTokenFromText(pastedText) {
      const separatedText = pastedText.split(/\r\n|\r|\n|\t/g).filter(t => !!t);
      const matchingItems = this.items.filter(item => separatedText.indexOf(item.text) > -1 && !item.selected);
      if (separatedText.length > 1) {
        this._previouslySelectedItems = this._getSelectedItems();
        matchingItems.forEach(item => {
          item.selected = true;
          this.value = "";
          const changePrevented = this.fireSelectionChange();
          if (changePrevented) {
            this._revertSelection();
          }
        });
      } else {
        this.value = pastedText;
        this.fireEvent("input");
      }
    }
    _handleShow(e) {
      const items = this.items;
      const selectedItem = this._getSelectedItems()[0];
      const focusedToken = this._tokenizer.tokens.find(token => token.focused);
      const value = this.value;
      const matchingItem = this.items.find(item => item.text.localeCompare(value, undefined, {
        sensitivity: "base"
      }) === 0);
      e.preventDefault();
      if (this.readonly) {
        return;
      }
      this._isOpenedByKeyboard = true;
      this._shouldFilterItems = false;
      this._filteredItems = this.items;
      this.togglePopover();
      if (!focusedToken && matchingItem) {
        this._itemToFocus = matchingItem;
        return;
      }
      if (selectedItem && !focusedToken) {
        this._itemToFocus = selectedItem;
      } else if (focusedToken && e.target === focusedToken) {
        this._itemToFocus = items.find(item => item.text === focusedToken.text);
      } else {
        this._itemToFocus = items[0];
      }
    }
    _handlePageUp(e) {
      e.preventDefault();
    }
    _handlePageDown(e) {
      e.preventDefault();
    }
    _handleBackspace(e) {
      if (e.target.value === "") {
        e.preventDefault();
        this._tokenizer._focusLastToken();
      }
    }
    _handleEscape() {
      const innerInput = this._innerInput;
      const isAutoCompleted = (innerInput.selectionEnd || 0) - (innerInput.selectionStart || 0) > 0;
      if (isAutoCompleted) {
        this.value = this.valueBeforeAutoComplete;
      }
      if (!this.allowCustomValues || !this.open && this.allowCustomValues) {
        this.value = this._lastValue;
      }
    }
    _handleHome(e) {
      const shouldFocusToken = this._isFocusInside && e.target.selectionStart === 0 && this._tokenizer.tokens.length > 0;
      if (shouldFocusToken) {
        e.preventDefault();
        this._tokenizer.tokens[0].focus();
      }
    }
    _handleEnd(e) {
      const tokens = this._tokenizer.tokens;
      const lastTokenIdx = tokens.length - 1;
      const shouldFocusInput = e.target === tokens[lastTokenIdx] && tokens[lastTokenIdx] === this.shadowRoot.activeElement;
      if (shouldFocusInput) {
        e.preventDefault();
        this._inputDom.focus();
      }
    }
    _handleTab() {
      this.allItemsPopover?.close();
    }
    _handleSelectAll() {
      const filteredItems = this._filteredItems;
      const allItemsSelected = filteredItems.every(item => item.selected);
      this._previouslySelectedItems = filteredItems.filter(item => item.selected).map(item => item);
      filteredItems.forEach(item => {
        item.selected = !allItemsSelected;
      });
      const changePrevented = this.fireSelectionChange();
      if (changePrevented) {
        this._revertSelection();
      }
    }
    _onValueStateKeydown(e) {
      const isArrowDown = (0, _Keys.isDown)(e);
      const isArrowUp = (0, _Keys.isUp)(e);
      if ((0, _Keys.isTabNext)(e) || (0, _Keys.isTabPrevious)(e)) {
        this._onItemTab();
        return;
      }
      e.preventDefault();
      if (isArrowDown || (0, _Keys.isDownCtrl)(e)) {
        this._handleArrowDown();
      }
      if (isArrowUp || (0, _Keys.isUpCtrl)(e)) {
        this._shouldAutocomplete = true;
        this._inputDom.focus();
      }
    }
    async _onItemKeydown(e) {
      const isFirstItem = this.list?.items[0] === e.target;
      const isArrowUp = (0, _Keys.isUp)(e) || (0, _Keys.isUpCtrl)(e);
      if (this.hasValueStateMessage && !this.valueStateHeader) {
        await this._setValueStateHeader();
      }
      if ((0, _Keys.isTabNext)(e) || (0, _Keys.isTabPrevious)(e)) {
        this._onItemTab();
        return;
      }
      if ((0, _Keys.isHomeCtrl)(e)) {
        this.list?._itemNavigation._handleHome();
        this.list?.items[this.list?._itemNavigation._currentIndex].focus();
      }
      if ((0, _Keys.isEndCtrl)(e)) {
        this.list?._itemNavigation._handleEnd();
        this.list?.items[this.list?._itemNavigation._currentIndex].focus();
      }
      e.preventDefault();
      if ((0, _Keys.isDownShift)(e) || (0, _Keys.isUpShift)(e)) {
        this._handleItemRangeSelection(e);
        return;
      }
      if ((0, _Keys.isUpCtrl)(e) && !isFirstItem) {
        this.list?._itemNavigation._handleUp();
        this.list?.items[this.list?._itemNavigation._currentIndex].focus();
      }
      if ((0, _Keys.isDownCtrl)(e)) {
        this.list?._itemNavigation._handleDown();
        this.list?.items[this.list?._itemNavigation._currentIndex].focus();
      }
      if ((0, _Keys.isShow)(e)) {
        this.togglePopover();
      }
      if ((0, _Keys.isCtrlA)(e)) {
        this._handleSelectAll();
        return;
      }
      if ((isArrowUp && isFirstItem || (0, _Keys.isHome)(e)) && this.valueStateHeader) {
        this.valueStateHeader.focus();
      }
      if (!this.valueStateHeader && isFirstItem && isArrowUp) {
        this._inputDom.focus();
        this._shouldAutocomplete = true;
      }
    }
    _handleArrowCtrl(e) {
      const input = this._inputDom;
      const isArrowLeft = (0, _Keys.isLeftCtrl)(e);
      if (isArrowLeft && input.selectionStart === 0 && input.selectionEnd === 0) {
        e.preventDefault();
      }
      if (isArrowLeft && (input.selectionEnd || 0) - (input.selectionStart || 0) > 0) {
        input.setSelectionRange(0, 0);
      }
    }
    _onItemTab() {
      this._inputDom.focus();
      this.allItemsPopover?.close();
    }
    async _handleArrowNavigation(e, isDownControl) {
      const isArrowDown = isDownControl || (0, _Keys.isDown)(e);
      const hasSuggestions = this.items.length;
      const isOpen = this.allItemsPopover?.opened;
      e.preventDefault();
      if (this.hasValueStateMessage && !this.valueStateHeader) {
        await this._setValueStateHeader();
      }
      if (isArrowDown && isOpen && this.valueStateHeader) {
        this.value = this.valueBeforeAutoComplete || this.value;
        this.valueStateHeader.focus();
        return;
      }
      if (isArrowDown && hasSuggestions) {
        this._handleArrowDown();
      }
      if (!isArrowDown && !isOpen && !this.readonly) {
        this._navigateToPrevItem();
      }
    }
    _handleArrowDown() {
      const isOpen = this.allItemsPopover?.opened;
      const firstListItem = this.list?.items[0];
      if (isOpen) {
        firstListItem && this.list?._itemNavigation.setCurrentItem(firstListItem);
        this.value = this.valueBeforeAutoComplete || this.value;
        firstListItem?.focus();
      } else if (!this.readonly) {
        this._navigateToNextItem();
      }
    }
    _handleItemRangeSelection(e) {
      const items = this.items;
      const listItems = this.list?.items;
      const currentItemIdx = Number(listItems?.indexOf(e.target));
      const nextItemIdx = currentItemIdx + 1;
      const prevItemIdx = currentItemIdx - 1;
      this._previouslySelectedItems = this._getSelectedItems();
      if ((0, _Keys.isDownShift)(e) && items[nextItemIdx]) {
        items[nextItemIdx].selected = items[currentItemIdx].selected;
        items[nextItemIdx].focus();
      }
      if ((0, _Keys.isUpShift)(e) && items[prevItemIdx]) {
        items[prevItemIdx].selected = items[currentItemIdx].selected;
        items[prevItemIdx].focus();
      }
      const changePrevented = this.fireSelectionChange();
      if (changePrevented) {
        this._revertSelection();
      }
    }
    _navigateToNextItem() {
      const items = this.items;
      const itemsCount = items.length;
      const previousItemIdx = this.currentItemIdx;
      if (previousItemIdx > -1 && items[previousItemIdx].text !== this.value) {
        this.currentItemIdx = -1;
      }
      if (previousItemIdx >= itemsCount - 1) {
        return;
      }
      let currentItem = this.items[++this.currentItemIdx];
      while (this.currentItemIdx < itemsCount - 1 && currentItem.selected || currentItem.isGroupItem) {
        currentItem = this.items[++this.currentItemIdx];
      }
      if (currentItem.selected === true || currentItem.isGroupItem) {
        this.currentItemIdx = previousItemIdx;
        return;
      }
      this.value = currentItem.text;
      this._innerInput.value = currentItem.text;
      this._innerInput.setSelectionRange(0, currentItem.text.length);
    }
    _navigateToPrevItem() {
      const items = this.items;
      let previousItemIdx = this.currentItemIdx;
      if (!this.value && previousItemIdx !== -1 || previousItemIdx !== -1 && this.value && this.value !== items[previousItemIdx].text) {
        previousItemIdx = -1;
      }
      if (previousItemIdx === -1) {
        this.currentItemIdx = items.length;
      }
      if (previousItemIdx === 0) {
        this.currentItemIdx = 0;
        return;
      }
      let currentItem = this.items[--this.currentItemIdx];
      while (currentItem && this.currentItemIdx > 0 && (currentItem.selected || currentItem.isGroupItem)) {
        currentItem = this.items[--this.currentItemIdx];
      }
      if (!currentItem) {
        return;
      }
      if (currentItem.selected || currentItem.isGroupItem) {
        this.currentItemIdx = previousItemIdx;
        return;
      }
      this.value = currentItem.text;
      this._innerInput.value = currentItem.text;
      this._innerInput.setSelectionRange(0, currentItem.text.length);
    }
    _handleEnter() {
      const lowerCaseValue = this.value.toLowerCase();
      const matchingItem = this.items.find(item => item.text.toLowerCase() === lowerCaseValue && !item.isGroupItem);
      const oldValueState = this.valueState;
      const innerInput = this._innerInput;
      if (this.FormSupport) {
        this.FormSupport.triggerFormSubmit(this);
      }
      if (matchingItem) {
        if (matchingItem.selected) {
          if (this._validationTimeout) {
            return;
          }
          this.valueState = _ValueState.default.Error;
          this._performingSelectionTwice = true;
          this._resetValueState(oldValueState, () => {
            this._performingSelectionTwice = false;
          });
        } else {
          this._previouslySelectedItems = this._getSelectedItems();
          matchingItem.selected = true;
          this.value = "";
          const changePrevented = this.fireSelectionChange();
          if (changePrevented) {
            this._revertSelection();
          }
        }
        innerInput.setSelectionRange(matchingItem.text.length, matchingItem.text.length);
        this.allItemsPopover?.close();
      }
    }
    _resetValueState(valueState, callback) {
      this._validationTimeout = setTimeout(() => {
        this.valueState = valueState;
        this._validationTimeout = null;
        callback && callback();
      }, 2000);
    }
    _onTokenizerKeydown(e) {
      const isCtrl = !!(e.metaKey || e.ctrlKey);
      if ((0, _Keys.isRight)(e)) {
        const lastTokenIndex = this._tokenizer.tokens.length - this._tokenizer.overflownTokens.length - 1;
        if (e.target === this._tokenizer.tokens[lastTokenIndex]) {
          setTimeout(() => {
            this._inputDom.focus();
          }, 0);
        }
      }
      if (isCtrl && ["c", "x"].includes(e.key.toLowerCase()) || (0, _Keys.isDeleteShift)(e) || (0, _Keys.isInsertCtrl)(e)) {
        e.preventDefault();
        const isCut = e.key.toLowerCase() === "x" || (0, _Keys.isDeleteShift)(e);
        const selectedTokens = this._tokenizer.tokens.filter(token => token.selected);
        if (isCut) {
          const cutResult = this._tokenizer._fillClipboard(_Tokenizer.ClipboardDataOperation.cut, selectedTokens);
          selectedTokens.forEach(token => {
            this._tokenizer.deleteToken(token);
          });
          this.focus();
          return cutResult;
        }
        return this._tokenizer._fillClipboard(_Tokenizer.ClipboardDataOperation.copy, selectedTokens);
      }
      if ((0, _Keys.isInsertShift)(e)) {
        this._handleInsertPaste();
      }
      if ((0, _Keys.isHome)(e)) {
        this._handleHome(e);
      }
      if ((0, _Keys.isEnd)(e)) {
        this._handleEnd(e);
      }
      if ((0, _Keys.isShow)(e) && !this.readonly && !this.disabled) {
        this._preventTokenizerToggle = true;
        this._handleShow(e);
      }
      if (isCtrl && e.key.toLowerCase() === "i" && this._tokenizer.tokens.length > 0) {
        e.preventDefault();
        this.togglePopover();
      }
    }
    _filterItems(str) {
      const itemsToFilter = this.items.filter(item => !item.isGroupItem);
      const filteredItems = (Filters[this.filter] || Filters.StartsWithPerTerm)(str, itemsToFilter, "text");
      // Return the filtered items and their group items
      return this.items.filter((item, idx, allItems) => MultiComboBox_1._groupItemFilter(item, ++idx, allItems, filteredItems) || filteredItems.indexOf(item) !== -1);
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
    _afterOpenPicker() {
      this._toggle();
      if (!(0, _Device.isPhone)() && !this._isOpenedByKeyboard) {
        this._innerInput.focus();
      } else if (this._isOpenedByKeyboard) {
        this._itemToFocus?.focus();
      } else {
        this.allItemsPopover?.focus();
      }
      this._previouslySelectedItems = this._getSelectedItems();
      this._isOpenedByKeyboard = false;
    }
    _toggle() {
      this.open = !this.open;
      this.fireEvent("open-change");
    }
    _getSelectedItems() {
      // Angular 2 way data binding
      this.selectedValues = this.items.filter(item => item.selected);
      return this.selectedValues;
    }
    _listSelectionChange(e) {
      let changePrevented;
      if (!(0, _Device.isPhone)()) {
        this._previouslySelectedItems = this._getSelectedItems();
      }
      // sync list items and cb items
      this.syncItems(e.target.items);
      // don't call selection change right after selection as user can cancel it on phone
      if (!(0, _Device.isPhone)()) {
        changePrevented = this.fireSelectionChange();
        if (changePrevented) {
          e.preventDefault();
          this._revertSelection();
        }
      }
      // casted to KeyboardEvent since isSpace and isSpaceCtrl accepts KeyboardEvent only
      const castedEvent = {
        key: e.detail.key
      };
      if (!e.detail.selectionComponentPressed && !(0, _Keys.isSpace)(castedEvent) && !(0, _Keys.isSpaceCtrl)(castedEvent)) {
        this.allItemsPopover?.close();
        this.value = "";
        // if the item (not checkbox) is clicked, call the selection change
        if ((0, _Device.isPhone)()) {
          changePrevented = this.fireSelectionChange();
          if (changePrevented) {
            e.preventDefault();
            this._revertSelection();
          }
        }
        this.fireEvent("input");
      }
      this.value = this.valueBeforeAutoComplete || "";
    }
    syncItems(listItems) {
      listItems.forEach(item => {
        this.items.forEach(mcbItem => {
          if (mcbItem._id === item.getAttribute("data-ui5-token-id")) {
            mcbItem.selected = item.selected;
          }
        });
      });
    }
    fireSelectionChange() {
      const changePrevented = !this.fireEvent("selection-change", {
        items: this._getSelectedItems()
      }, true);
      // Angular 2 way data binding
      this.fireEvent("value-changed");
      return changePrevented;
    }
    async _getRespPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      this.allItemsPopover = staticAreaItem.querySelector(`.ui5-multi-combobox-all-items-responsive-popover`);
    }
    async _getList() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      this.list = staticAreaItem.querySelector(".ui5-multi-combobox-all-items-list");
      return this.list;
    }
    _click() {
      if ((0, _Device.isPhone)() && !this.readonly && !this._showMorePressed && !this._deleting) {
        this.allItemsPopover?.showAt(this);
      }
      this._showMorePressed = false;
    }
    async handleBeforeTokenizerPopoverOpen() {
      const tokens = this._tokenizer.tokens;
      const hasTruncatedToken = tokens.length === 1 && tokens[0].isTruncatable;
      const popover = await this._getResponsivePopover();
      if (hasTruncatedToken) {
        popover?.close(false, false, true);
      }
    }
    _afterClosePicker() {
      // close device's keyboard and prevent further typing
      if ((0, _Device.isPhone)()) {
        this.blur();
      }
      this._toggle();
      this._iconPressed = false;
      this._preventTokenizerToggle = false;
      this.filterSelected = false;
    }
    _beforeOpen() {
      this._itemsBeforeOpen = this.items.map(item => {
        return {
          ref: item,
          selected: item.selected
        };
      });
      this._valueBeforeOpen = this.value;
      if (this.filterSelected) {
        const selectedItems = this._filteredItems.filter(item => item.selected);
        this.selectedItems = this.items.filter((item, idx, allItems) => MultiComboBox_1._groupItemFilter(item, ++idx, allItems, selectedItems) || selectedItems.indexOf(item) !== -1);
      }
    }
    _handleTypeAhead(item, filterValue) {
      if (!item) {
        return;
      }
      const value = item.text;
      const innerInput = this._innerInput;
      filterValue = filterValue || "";
      this.value = value;
      innerInput.value = value;
      innerInput.setSelectionRange(filterValue.length, value.length);
      this._shouldAutocomplete = false;
    }
    _getFirstMatchingItem(current) {
      if (!this.items.length) {
        return;
      }
      const matchingItems = this._startsWithMatchingItems(current).filter(item => !item.isGroupItem && !item.selected);
      if (matchingItems.length) {
        return matchingItems[0];
      }
    }
    _startsWithMatchingItems(str) {
      return Filters.StartsWith(str, this.items, "text");
    }
    _revertSelection() {
      this._filteredItems.forEach(item => {
        item.selected = this._previouslySelectedItems.includes(item);
      });
    }
    onBeforeRendering() {
      const input = this._innerInput;
      const autoCompletedChars = input && (input.selectionEnd || 0) - (input.selectionStart || 0);
      const value = input && input.value;
      this.FormSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");
      this._inputLastValue = value;
      if (input && !input.value) {
        this.valueBeforeAutoComplete = "";
        this._filteredItems = this.items;
      }
      this.items.forEach(item => {
        item._getRealDomRef = () => this.allItemsPopover.querySelector(`*[data-ui5-stable=${item.stableDomRef}]`);
      });
      this.tokenizerAvailable = this._getSelectedItems().length > 0;
      this.style.setProperty((0, _CustomElementsScope.getScopedVarName)("--_ui5-input-icons-count"), `${this.iconsCount}`);
      if (!input || !value) {
        return;
      }
      // Typehead causes issues on Android devices, so we disable it for now
      // If there is already a selection the autocomplete has already been performed
      if (this._shouldAutocomplete && !(0, _Device.isAndroid)() && !autoCompletedChars) {
        const item = this._getFirstMatchingItem(value);
        // Keep the original typed in text intact
        this.valueBeforeAutoComplete = value;
        item && this._handleTypeAhead(item, value);
      }
      if (this._shouldFilterItems) {
        this._filteredItems = this._filterItems(this._shouldAutocomplete || !!autoCompletedChars ? this.valueBeforeAutoComplete : value);
      } else {
        this._filteredItems = this.items;
      }
    }
    async onAfterRendering() {
      await this._getRespPopover();
      await this._getList();
      this.toggle(this.shouldDisplayOnlyValueStateMessage);
      this.storeResponsivePopoverWidth();
      this._deleting = false;
      // force resize of the tokenizer on invalidation
      this._tokenizer._handleResize();
    }
    get _isPhone() {
      return (0, _Device.isPhone)();
    }
    _onIconMousedown() {
      this._iconPressed = true;
    }
    storeResponsivePopoverWidth() {
      if (this.open && !this._listWidth) {
        this._listWidth = this.list.offsetWidth;
      }
    }
    toggle(isToggled) {
      if (isToggled && !this.open) {
        this.openPopover();
      } else {
        this.closePopover();
      }
    }
    handleCancel() {
      this._itemsBeforeOpen.forEach(item => {
        if (item.ref instanceof _MultiComboBoxItem.default) {
          item.ref.selected = item.selected;
        }
      });
      this.togglePopover();
      this.value = this._valueBeforeOpen;
    }
    handleOK() {
      if ((0, _Device.isPhone)()) {
        const changePrevented = this.fireSelectionChange();
        if (changePrevented) {
          this._revertSelection();
        }
      }
      if (!this.allowCustomValues) {
        this.value = "";
      }
      this.togglePopover();
    }
    async openPopover() {
      (await this._getPopover())?.showAt(this);
    }
    _forwardFocusToInner() {
      this._innerInput.focus();
    }
    get morePopoverOpener() {
      const tokens = this._tokenizer?.tokens;
      if (tokens?.length === 1 && tokens[0].isTruncatable) {
        return tokens[0];
      }
      return this;
    }
    async closePopover() {
      (await this._getPopover())?.close();
    }
    async _getPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector("[ui5-popover]");
    }
    async _getResponsivePopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector("[ui5-responsive-popover]");
    }
    async _setValueStateHeader() {
      const responsivePopover = await this._getResponsivePopover();
      this.valueStateHeader = responsivePopover.querySelector("div.ui5-responsive-popover-header.ui5-valuestatemessage-root");
    }
    get _tokenizer() {
      return this.shadowRoot.querySelector("[ui5-tokenizer]");
    }
    inputFocusIn(e) {
      if (!(0, _Device.isPhone)() || this.readonly) {
        this.focused = true;
        this._tokenizer.expanded = true;
      } else {
        this._innerInput.blur();
      }
      if (!(0, _Device.isPhone)() && (e.relatedTarget?.tagName !== "UI5-STATIC-AREA-ITEM" || !e.relatedTarget)) {
        this._innerInput.setSelectionRange(0, this.value.length);
      }
      this._tokenizer.tokens.forEach(token => {
        token.selected = false;
      });
      this._lastValue = this.value;
      this.valueBeforeAutoComplete = "";
    }
    inputFocusOut(e) {
      if (!this.shadowRoot.contains(e.relatedTarget) && !this._deleting) {
        this.focused = false;
        this._tokenizer.expanded = this.open;
        // remove the value if user focus out the input and focus is not going in the popover
        if (!(0, _Device.isPhone)() && !this.allowCustomValues && this.staticAreaItem !== e.relatedTarget) {
          this.value = "";
        }
      }
    }
    get editable() {
      return !this.readonly;
    }
    get _isFocusInside() {
      return !(0, _Device.isPhone)() && (this.focused || this._tokenizerFocused);
    }
    get selectedItemsListMode() {
      return this.readonly ? "None" : "MultiSelect";
    }
    get _listItemsType() {
      return this.readonly ? "Inactive" : "Active";
    }
    get hasValueState() {
      return this.valueState !== _ValueState.default.None;
    }
    get hasValueStateMessage() {
      return this.hasValueState && this.valueState !== _ValueState.default.Success;
    }
    get ariaValueStateHiddenText() {
      if (!this.hasValueState) {
        return;
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
        return "";
      }
      if (this._performingSelectionTwice) {
        return MultiComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_ERROR_ALREADY_SELECTED);
      }
      return this.valueStateTextMappings[this.valueState];
    }
    get valueStateTextId() {
      return this.hasValueState ? `ui5-multi-combobox-valueStateDesc` : undefined;
    }
    get valueStateMessageText() {
      return this.getSlottedNodes("valueStateMessage").map(el => el.cloneNode(true));
    }
    get ariaLabelText() {
      return (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this);
    }
    /**
     * This method is relevant for sap_horizon theme only
     */
    get _valueStateMessageIcon() {
      if (this.valueState === _ValueState.default.None) {
        return "";
      }
      return {
        [_ValueState.default.Error]: "error",
        [_ValueState.default.Warning]: "alert",
        [_ValueState.default.Success]: "sys-enter-2",
        [_ValueState.default.Information]: "information"
      }[this.valueState];
    }
    get _tokensCountText() {
      if (!this._tokenizer) {
        return;
      }
      return this._tokenizer._tokensCountText();
    }
    get _tokensCountTextId() {
      return "ui5-multi-combobox-hiddenText-nMore";
    }
    get _selectedTokensCount() {
      return this._tokenizer.tokens.filter(token => token.selected).length;
    }
    get ariaDescribedByText() {
      return this.valueStateTextId ? `${this._tokensCountTextId} ${this.valueStateTextId}` : `${this._tokensCountTextId}`;
    }
    get shouldDisplayDefaultValueStateMessage() {
      return !this.valueStateMessage.length && this.hasValueStateMessage;
    }
    get shouldDisplayOnlyValueStateMessage() {
      return this.focused && !this.readonly && this.hasValueStateMessage && !this._iconPressed;
    }
    get valueStateTypeMappings() {
      return {
        [_ValueState.default.Success]: MultiComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_TYPE_SUCCESS),
        [_ValueState.default.Information]: MultiComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_TYPE_INFORMATION),
        [_ValueState.default.Error]: MultiComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_TYPE_ERROR),
        [_ValueState.default.Warning]: MultiComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_TYPE_WARNING)
      };
    }
    get valueStateTextMappings() {
      return {
        [_ValueState.default.Success]: MultiComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_SUCCESS),
        [_ValueState.default.Error]: MultiComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_ERROR),
        [_ValueState.default.Warning]: MultiComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_WARNING),
        [_ValueState.default.Information]: MultiComboBox_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_INFORMATION)
      };
    }
    get _innerInput() {
      if ((0, _Device.isPhone)()) {
        if (this.allItemsPopover?.opened) {
          return this.allItemsPopover.querySelector("input");
        }
      }
      return this._inputDom;
    }
    get _headerTitleText() {
      return MultiComboBox_1.i18nBundle.getText(_i18nDefaults.INPUT_SUGGESTIONS_TITLE);
    }
    get _iconAccessibleNameText() {
      return MultiComboBox_1.i18nBundle.getText(_i18nDefaults.SELECT_OPTIONS);
    }
    get _dialogOkButton() {
      return MultiComboBox_1.i18nBundle.getText(_i18nDefaults.MULTICOMBOBOX_DIALOG_OK_BUTTON);
    }
    get _tokenizerExpanded() {
      if ((0, _Device.isPhone)() || this.readonly) {
        return false;
      }
      if (this._preventTokenizerToggle) {
        return this._tokenizer.expanded;
      }
      const isCurrentlyExpanded = this._tokenizer?.expanded;
      const shouldBeExpanded = this.focused || this.open || isCurrentlyExpanded;
      return shouldBeExpanded;
    }
    get _valueStatePopoverHorizontalAlign() {
      return this.effectiveDir !== "rtl" ? "Left" : "Right";
    }
    get iconsCount() {
      const slottedIconsCount = this.icon?.length || 0;
      const arrowDownIconsCount = this.readonly ? 0 : 1;
      return slottedIconsCount + arrowDownIconsCount;
    }
    get classes() {
      return {
        popover: {
          "ui5-multi-combobox-all-items-responsive-popover": true,
          "ui5-suggestions-popover": true,
          "ui5-suggestions-popover-with-value-state-header": this.hasValueStateMessage
        },
        popoverValueState: {
          "ui5-valuestatemessage-root": true,
          "ui5-valuestatemessage-header": true,
          "ui5-valuestatemessage--success": this.valueState === _ValueState.default.Success,
          "ui5-valuestatemessage--error": this.valueState === _ValueState.default.Error,
          "ui5-valuestatemessage--warning": this.valueState === _ValueState.default.Warning,
          "ui5-valuestatemessage--information": this.valueState === _ValueState.default.Information
        }
      };
    }
    get styles() {
      const remSizeIxPx = parseInt(getComputedStyle(document.documentElement).fontSize);
      return {
        popoverValueStateMessage: {
          "width": `${this._listWidth || 0}px`,
          "display": this._listWidth === 0 ? "none" : "inline-block"
        },
        popoverHeader: {
          "max-width": (0, _Device.isPhone)() ? "100%" : `${this._inputWidth}px`
        },
        suggestionsPopover: {
          "min-width": `${this._inputWidth}px`,
          "max-width": this._inputWidth / remSizeIxPx > 40 ? `${this._inputWidth}px` : "40rem"
        }
      };
    }
    static async onDefine() {
      MultiComboBox_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)()], MultiComboBox.prototype, "value", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MultiComboBox.prototype, "noTypeahead", void 0);
  __decorate([(0, _property.default)()], MultiComboBox.prototype, "placeholder", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MultiComboBox.prototype, "allowCustomValues", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MultiComboBox.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], MultiComboBox.prototype, "valueState", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MultiComboBox.prototype, "readonly", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MultiComboBox.prototype, "required", void 0);
  __decorate([(0, _property.default)({
    type: _ComboBoxFilter.default,
    defaultValue: _ComboBoxFilter.default.StartsWithPerTerm
  })], MultiComboBox.prototype, "filter", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MultiComboBox.prototype, "open", void 0);
  __decorate([(0, _property.default)()], MultiComboBox.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)()], MultiComboBox.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    noAttribute: true,
    multiple: true
  })], MultiComboBox.prototype, "_filteredItems", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    noAttribute: true,
    multiple: true
  })], MultiComboBox.prototype, "_previouslySelectedItems", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MultiComboBox.prototype, "filterSelected", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MultiComboBox.prototype, "focused", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], MultiComboBox.prototype, "_tokenizerFocused", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], MultiComboBox.prototype, "_iconPressed", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    noAttribute: true
  })], MultiComboBox.prototype, "_inputWidth", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    noAttribute: true,
    defaultValue: 0
  })], MultiComboBox.prototype, "_listWidth", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], MultiComboBox.prototype, "_performingSelectionTwice", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], MultiComboBox.prototype, "tokenizerAvailable", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement,
    "default": true,
    invalidateOnChildChange: true
  })], MultiComboBox.prototype, "items", void 0);
  __decorate([(0, _slot.default)()], MultiComboBox.prototype, "icon", void 0);
  __decorate([(0, _slot.default)()], MultiComboBox.prototype, "valueStateMessage", void 0);
  MultiComboBox = MultiComboBox_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-multi-combobox",
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _MultiComboBoxTemplate.default,
    staticAreaTemplate: _MultiComboBoxPopoverTemplate.default,
    styles: _MultiComboBox.default,
    staticAreaStyles: [_ResponsivePopoverCommon.default, _ValueStateMessage.default, _Suggestions.default, _MultiComboBoxPopover.default],
    dependencies: [_MultiComboBoxItem.default, _MultiComboBoxGroupItem.default, _Tokenizer.default, _Token.default, _Icon.default, _ResponsivePopover.default, _Popover.default, _List.default, _StandardListItem.default, _GroupHeaderListItem.default, _ToggleButton.default, _Button.default]
  })
  /**
   * Fired when the input operation has finished by pressing Enter or on focusout.
   *
   * @event sap.ui.webc.main.MultiComboBox#change
   * @public
   */, (0, _event.default)("change")
  /**
   * Fired when the value of the component changes at each keystroke.
   *
   * @event sap.ui.webc.main.MultiComboBox#input
   * @public
   */, (0, _event.default)("input")
  /**
   * Fired when the dropdown is opened or closed.
   *
   * @event sap.ui.webc.main.MultiComboBox#open-change
   * @since 1.0.0-rc.5
   * @public
   */, (0, _event.default)("open-change")
  /**
   * Fired when selection is changed by user interaction
   * in <code>SingleSelect</code> and <code>MultiSelect</code> modes.
   *
   * @event sap.ui.webc.main.MultiComboBox#selection-change
   * @param {Array} items an array of the selected items.
   * @public
   */, (0, _event.default)("selection-change", {
    detail: {
      items: {
        type: Array
      }
    }
  })], MultiComboBox);
  MultiComboBox.define();
  var _default = MultiComboBox;
  _exports.default = _default;
});