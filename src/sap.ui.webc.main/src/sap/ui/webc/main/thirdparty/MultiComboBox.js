sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/icons/slim-arrow-down", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/icons/decline", "sap/ui/webc/common/thirdparty/icons/multiselect-all", "sap/ui/webc/common/thirdparty/icons/not-editable", "sap/ui/webc/common/thirdparty/icons/error", "sap/ui/webc/common/thirdparty/icons/alert", "sap/ui/webc/common/thirdparty/icons/sys-enter-2", "sap/ui/webc/common/thirdparty/icons/information", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "./MultiComboBoxItem", "./MultiComboBoxGroupItem", "./Tokenizer", "./Token", "./Icon", "./Popover", "./ResponsivePopover", "./List", "./StandardListItem", "./ToggleButton", "./Filters", "./Button", "./generated/i18n/i18n-defaults", "./generated/templates/MultiComboBoxTemplate.lit", "./generated/templates/MultiComboBoxPopoverTemplate.lit", "./generated/themes/MultiComboBox.css", "./generated/themes/ResponsivePopoverCommon.css", "./generated/themes/ValueStateMessage.css", "./generated/themes/Suggestions.css", "./generated/themes/MultiComboBoxPopover.css"], function (_exports, _UI5Element, _LitRenderer, _ResizeHandler, _ValueState, _Keys, _Integer, _slimArrowDown, _Device, _i18nBundle, _decline, _multiselectAll, _notEditable, _error, _alert, _sysEnter, _information, _FeaturesRegistry, _AriaLabelHelper, _MultiComboBoxItem, _MultiComboBoxGroupItem, _Tokenizer, _Token, _Icon, _Popover, _ResponsivePopover, _List, _StandardListItem, _ToggleButton, Filters, _Button, _i18nDefaults, _MultiComboBoxTemplate, _MultiComboBoxPopoverTemplate, _MultiComboBox, _ResponsivePopoverCommon, _ValueStateMessage, _Suggestions, _MultiComboBoxPopover) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _ValueState = _interopRequireDefault(_ValueState);
  _Integer = _interopRequireDefault(_Integer);
  _MultiComboBoxItem = _interopRequireDefault(_MultiComboBoxItem);
  _MultiComboBoxGroupItem = _interopRequireDefault(_MultiComboBoxGroupItem);
  _Tokenizer = _interopRequireDefault(_Tokenizer);
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
  function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
  function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Templates

  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-multi-combobox",
    languageAware: true,
    managedSlots: true,
    slots: /** @lends sap.ui.webcomponents.main.MultiComboBox.prototype */{
      /**
       * Defines the component items.
       *
       * @type {sap.ui.webcomponents.main.IMultiComboBoxItem[]}
       * @slot items
       * @public
       */
      "default": {
        propertyName: "items",
        type: HTMLElement,
        invalidateOnChildChange: true
      },
      /**
      * Defines the icon to be displayed in the component.
      *
      * @type {sap.ui.webcomponents.main.IIcon}
      * @slot
      * @public
      * @since 1.0.0-rc.9
      */
      icon: {
        type: HTMLElement
      },
      /**
       * Defines the value state message that will be displayed as pop up under the component.
       * <br><br>
       *
       * <b>Note:</b> If not specified, a default text (in the respective language) will be displayed.
       * <br>
       * <b>Note:</b> The <code>valueStateMessage</code> would be displayed,
       * when the component is in <code>Information</code>, <code>Warning</code> or <code>Error</code> value state.
       * @type {HTMLElement[]}
       * @since 1.0.0-rc.9
       * @slot
       * @public
       */
      valueStateMessage: {
        type: HTMLElement
      }
    },
    properties: /** @lends sap.ui.webcomponents.main.MultiComboBox.prototype */{
      /**
       * Defines the value of the component.
       * <br><br>
       * <b>Note:</b> The property is updated upon typing.
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
       * Defines whether the value will be autcompleted to match an item
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       * @since 1.4.0
       */
      noTypeahead: {
        type: Boolean
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
       * Defines if the user input will be prevented, if no matching item has been found
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      allowCustomValues: {
        type: Boolean
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
       * @since 1.0.0-rc.5
       */
      required: {
        type: Boolean
      },
      /**
       * Defines the filter type of the component.
       * Available options are: <code>StartsWithPerTerm</code>, <code>StartsWith</code>, <code>Contains</code> and <code>None</code>.
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
       * Indicates whether the dropdown is open. True if the dropdown is open, false otherwise.
       *
       * @type {boolean}
       * @defaultvalue false
       * @readonly
       * @since 1.0.0-rc.5
       * @public
       */
      open: {
        type: Boolean
      },
      /**
       * Defines the accessible aria name of the component.
       *
       * @type {string}
       * @defaultvalue: ""
       * @public
       * @since 1.4.0
       */
      accessibleName: {
        type: String,
        defaultValue: undefined
      },
      /**
       * Receives id(or many ids) of the elements that label the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.4.0
       */
      accessibleNameRef: {
        type: String,
        defaultValue: ""
      },
      _filteredItems: {
        type: Object
      },
      filterSelected: {
        type: Boolean
      },
      focused: {
        type: Boolean
      },
      _tokenizerFocused: {
        type: Boolean
      },
      _iconPressed: {
        type: Boolean,
        noAttribute: true
      },
      _inputWidth: {
        type: _Integer.default,
        noAttribute: true
      },
      _listWidth: {
        type: _Integer.default,
        defaultValue: 0,
        noAttribute: true
      },
      _performingSelectionTwice: {
        type: Boolean
      }
    },
    events: /** @lends sap.ui.webcomponents.main.MultiComboBox.prototype */{
      /**
       * Fired when the input operation has finished by pressing Enter or on focusout.
       *
       * @event
       * @public
       */
      change: {},
      /**
       * Fired when the value of the component changes at each keystroke.
       *
       * @event
       * @public
       */
      input: {},
      /**
       * Fired when the dropdown is opened or closed.
       *
       * @event sap.ui.webcomponents.main.MultiComboBox#open-change
       * @since 1.0.0-rc.5
       * @public
       */
      "open-change": {},
      /**
       * Fired when selection is changed by user interaction
       * in <code>SingleSelect</code> and <code>MultiSelect</code> modes.
       *
       * @event sap.ui.webcomponents.main.MultiComboBox#selection-change
       * @param {Array} items an array of the selected items.
       * @public
       */
      "selection-change": {
        detail: {
          items: {
            type: Array
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
   * The <code>ui5-multi-combobox</code> component consists of a list box with items and a text field allowing the user to either type a value directly into the text field, or choose from the list of existing items.
   *
   * The drop-down list is used for selecting and filtering values, it enables users to select one or more options from a predefined list. The control provides an editable input field to filter the list, and a dropdown arrow to expand/collapse the list of available options.
   * The options in the list have checkboxes that permit multi-selection. Entered values are displayed as tokens.
   * <h3>Structure</h3>
   * The <code>ui5-multi-combobox</code> consists of the following elements:
   * <ul>
   * <li> Tokenizer - a list of tokens with selected options.
   * <li> Input field - displays the selected option/s as token/s. Users can type to filter the list.
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
   * @alias sap.ui.webcomponents.main.MultiComboBox
   * @extends UI5Element
   * @tagname ui5-multi-combobox
   * @public
   * @appenddocs MultiComboBoxItem MultiComboBoxGroupItem
   * @since 0.11.0
   */
  class MultiComboBox extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }
    static get render() {
      return _LitRenderer.default;
    }
    static get template() {
      return _MultiComboBoxTemplate.default;
    }
    static get staticAreaTemplate() {
      return _MultiComboBoxPopoverTemplate.default;
    }
    static get styles() {
      return _MultiComboBox.default;
    }
    static get staticAreaStyles() {
      return [_ResponsivePopoverCommon.default, _ValueStateMessage.default, _Suggestions.default, _MultiComboBoxPopover.default];
    }
    static get dependencies() {
      return [_MultiComboBoxItem.default, _MultiComboBoxGroupItem.default, _Tokenizer.default, _Token.default, _Icon.default, _ResponsivePopover.default, _Popover.default, _List.default, _StandardListItem.default, _ToggleButton.default, _Button.default];
    }
    constructor() {
      super();
      this._filteredItems = [];
      this.selectedValues = [];
      this._inputLastValue = "";
      this._valueBeforeOpen = "";
      this._deleting = false;
      this._validationTimeout = null;
      this._handleResizeBound = this._handleResize.bind(this);
      this.valueBeforeAutoComplete = "";
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
      this.allItemsPopover.toggle(this);
    }
    togglePopoverByDropdownIcon() {
      this._shouldFilterItems = false;
      this.allItemsPopover.toggle(this);
    }
    _showFilteredItems() {
      this.filterSelected = true;
      this._showMorePressed = true;
      this.togglePopover();
    }
    filterSelectedItems(event) {
      this.filterSelected = event.target.pressed;
      const selectedItems = this._filteredItems.filter(item => item.selected);
      this.selectedItems = this.items.filter((item, idx, allItems) => MultiComboBox._groupItemFilter(item, ++idx, allItems, selectedItems) || selectedItems.indexOf(item) !== -1);
    }
    get _showAllItemsButtonPressed() {
      return this.filterSelected;
    }
    get _inputDom() {
      return this.shadowRoot.querySelector("#ui5-multi-combobox-input");
    }
    _inputLiveChange(event) {
      const input = event.target;
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
        this.valueState = "Error";
        this._shouldAutocomplete = false;
        this._resetValueState(oldValueState);
        return;
      }
      this._inputLastValue = input.value;
      this.value = input.value;
      this._filteredItems = filteredItems;
      if (!(0, _Device.isPhone)()) {
        if (filteredItems.length === 0) {
          this.allItemsPopover.close();
        } else {
          this.allItemsPopover.showAt(this);
        }
      }
      this.fireEvent("input");
    }
    _tokenDelete(event) {
      const token = event.detail.ref;
      const deletingItem = this.items.find(item => item._id === token.getAttribute("data-ui5-id"));
      deletingItem.selected = false;
      this._deleting = true;
      this.fireSelectionChange();
    }
    get _getPlaceholder() {
      if (this._getSelectedItems().length) {
        return "";
      }
      return this.placeholder;
    }
    _handleArrowLeft() {
      const cursorPosition = this.getDomRef().querySelector(`input`).selectionStart;
      const isTextSelected = this.getDomRef().querySelector(`input`).selectionEnd - cursorPosition > 0;
      if (cursorPosition === 0 && !isTextSelected) {
        this._tokenizer._focusLastToken();
      }
    }
    _tokenizerFocusOut(event) {
      this._tokenizerFocused = false;
      const tokensCount = this._tokenizer.tokens.length;
      const selectedTokens = this._selectedTokensCount;
      const lastTokenBeingDeleted = tokensCount - 1 === 0 && this._deleting;
      const allTokensAreBeingDeleted = selectedTokens === tokensCount && this._deleting;
      if (!event.relatedTarget || !event.relatedTarget.hasAttribute("ui5-token")) {
        this._tokenizer.tokens.forEach(token => {
          token.selected = false;
        });
        this._tokenizer.scrollToStart();
      }
      if (allTokensAreBeingDeleted || lastTokenBeingDeleted) {
        setTimeout(() => {
          if (!(0, _Device.isPhone)()) {
            this.shadowRoot.querySelector("input").focus();
          }
          this._deleting = false;
        }, 0);
      }
    }
    _tokenizerFocusIn() {
      this._tokenizerFocused = true;
      this.focused = false;
    }
    async _onkeydown(event) {
      const isArrowDownCtrl = (0, _Keys.isDownCtrl)(event);
      if ((0, _Keys.isShow)(event) && !this.disabled) {
        this._handleShow(event);
        return;
      }
      if ((0, _Keys.isDownShift)(event) || (0, _Keys.isUpShift)(event)) {
        event.preventDefault();
        return;
      }
      if ((0, _Keys.isUp)(event) || (0, _Keys.isDown)(event) || (0, _Keys.isUpCtrl)(event) || isArrowDownCtrl) {
        this._handleArrowNavigation(event, isArrowDownCtrl);
        return;
      }

      // CTRL + Arrow Down navigation is performed by the ItemNavigation module of the List,
      // here we only implement the text selection of the selected item
      if (isArrowDownCtrl && !this.allItemsPopover.opened) {
        setTimeout(() => this._inputDom.setSelectionRange(0, this._inputDom.value.length), 0);
      }
      if ((0, _Keys.isLeftCtrl)(event) || (0, _Keys.isRightCtrl)(event)) {
        this._handleArrowCtrl(event);
        return;
      }
      if ((0, _Keys.isCtrlV)(event) || (0, _Keys.isInsertShift)(event)) {
        this._handlePaste(event);
        return;
      }
      if ((0, _Keys.isSpaceShift)(event)) {
        event.preventDefault();
      }
      this[`_handle${event.key}`] && this[`_handle${event.key}`](event);
      this._shouldAutocomplete = !this.noTypeahead && !((0, _Keys.isBackSpace)(event) || (0, _Keys.isDelete)(event) || (0, _Keys.isEscape)(event) || (0, _Keys.isEnter)(event));
    }
    async _handlePaste(event) {
      const pastedText = await navigator.clipboard.readText();
      if (!pastedText) {
        return;
      }
      const separatedText = pastedText.split(/\r\n|\r|\n/g);
      const matchingItems = this.items.filter(item => separatedText.indexOf(item.text) > -1 && !item.selected);
      if (matchingItems.length) {
        matchingItems.forEach(item => {
          item.selected = true;
          this.value = "";
          this.fireSelectionChange();
        });
      } else {
        this.value = pastedText;
        this.fireEvent("input");
      }
    }
    _handleShow(event) {
      const items = this.items;
      const selectedItem = this._getSelectedItems()[0];
      const focusedToken = this._tokenizer.tokens.find(token => token.focused);
      const value = this.value;
      const matchingItem = this.items.find(item => item.text.localeCompare(value, undefined, {
        sensitivity: "base"
      }) === 0);
      event.preventDefault();
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
      } else if (focusedToken && event.target === focusedToken) {
        this._itemToFocus = items.find(item => item.text === focusedToken.text);
      } else {
        this._itemToFocus = items[0];
      }
    }
    _handlePageUp(event) {
      event.preventDefault();
    }
    _handlePageDown(event) {
      event.preventDefault();
    }
    _handleBackspace(event) {
      if (event.target.value === "") {
        event.preventDefault();
        this._tokenizer._focusLastToken();
      }
    }
    _handleEscape(event) {
      const innerInput = this._innerInput;
      const isAutoCompleted = innerInput.selectionEnd - innerInput.selectionStart > 0;
      if (isAutoCompleted) {
        this.value = this.valueBeforeAutoComplete;
      }
      if (!this.allowCustomValues || !this.open && this.allowCustomValues) {
        this.value = this._lastValue;
      }
    }
    _handleHome(event) {
      const shouldFocusToken = this._isFocusInside && event.target.selectionStart === 0 && this._tokenizer.tokens.length > 0;
      if (shouldFocusToken) {
        event.preventDefault();
        this._tokenizer.tokens[0].focus();
      }
    }
    _handleEnd(event) {
      const tokens = this._tokenizer.tokens;
      const lastTokenIdx = tokens.length - 1;
      const shouldFocusInput = event.target === tokens[lastTokenIdx] && tokens[lastTokenIdx] === this.shadowRoot.activeElement;
      if (shouldFocusInput) {
        event.preventDefault();
        this._inputDom.focus();
      }
    }
    _handleTab(event) {
      this.allItemsPopover.close();
    }
    _handleSelectAll(event) {
      const filteredItems = this._filteredItems;
      const allItemsSelected = filteredItems.every(item => item.selected);
      filteredItems.forEach(item => {
        item.selected = !allItemsSelected;
      });
      this.fireSelectionChange();
    }
    _onValueStateKeydown(event) {
      const isArrowDown = (0, _Keys.isDown)(event);
      const isArrowUp = (0, _Keys.isUp)(event);
      if ((0, _Keys.isTabNext)(event) || (0, _Keys.isTabPrevious)(event)) {
        this._onItemTab(event);
        return;
      }
      event.preventDefault();
      if (isArrowDown || (0, _Keys.isDownCtrl)(event)) {
        this._handleArrowDown(event);
      }
      if (isArrowUp || (0, _Keys.isUpCtrl)(event)) {
        this._shouldAutocomplete = true;
        this._inputDom.focus();
      }
    }
    async _onItemKeydown(event) {
      const isFirstItem = this.list.items[0] === event.target;
      const isArrowUp = (0, _Keys.isUp)(event) || (0, _Keys.isUpCtrl)(event);
      if (this.hasValueStateMessage && !this.valueStateHeader) {
        await this._setValueStateHeader();
      }
      if ((0, _Keys.isTabNext)(event) || (0, _Keys.isTabPrevious)(event)) {
        this._onItemTab(event);
        return;
      }
      if ((0, _Keys.isHomeCtrl)(event)) {
        this.list._itemNavigation._handleHome(event);
        this.list.items[this.list._itemNavigation._currentIndex].focus();
      }
      if ((0, _Keys.isEndCtrl)(event)) {
        this.list._itemNavigation._handleEnd(event);
        this.list.items[this.list._itemNavigation._currentIndex].focus();
      }
      event.preventDefault();
      if ((0, _Keys.isDownShift)(event) || (0, _Keys.isUpShift)(event)) {
        this._handleItemRangeSelection(event);
        return;
      }
      if ((0, _Keys.isUpCtrl)(event) && !isFirstItem) {
        this.list._itemNavigation._handleUp(event);
        this.list.items[this.list._itemNavigation._currentIndex].focus();
      }
      if ((0, _Keys.isDownCtrl)(event)) {
        this.list._itemNavigation._handleDown(event);
        this.list.items[this.list._itemNavigation._currentIndex].focus();
      }
      if ((0, _Keys.isShow)(event)) {
        this.togglePopover();
      }
      if ((0, _Keys.isCtrlA)(event)) {
        this._handleSelectAll(event);
        return;
      }
      if ((isArrowUp && isFirstItem || (0, _Keys.isHome)(event)) && this.valueStateHeader) {
        this.valueStateHeader.focus();
      }
      if (!this.valueStateHeader && isFirstItem && isArrowUp) {
        this._inputDom.focus();
        this._shouldAutocomplete = true;
      }
    }
    _handleArrowCtrl(event) {
      const input = this._inputDom;
      const isArrowLeft = (0, _Keys.isLeftCtrl)(event);
      if (isArrowLeft && input.selectionStart === 0 && input.selectionEnd === 0) {
        event.preventDefault();
      }
      if (isArrowLeft && input.selectionEnd - input.selectionStart > 0) {
        input.setSelectionRange(0, 0);
      }
    }
    _onItemTab(event) {
      this._inputDom.focus();
      this.allItemsPopover.close();
    }
    async _handleArrowNavigation(event, isDownControl) {
      const isArrowDown = isDownControl || (0, _Keys.isDown)(event);
      const hasSuggestions = this.items.length;
      const isOpen = this.allItemsPopover.opened;
      event.preventDefault();
      if (this.hasValueStateMessage && !this.valueStateHeader) {
        await this._setValueStateHeader();
      }
      if (isArrowDown && isOpen && this.valueStateHeader) {
        this.value = this.valueBeforeAutoComplete || this.value;
        this.valueStateHeader.focus();
        return;
      }
      if (isArrowDown && hasSuggestions) {
        this._handleArrowDown(event);
      }
      if (!isArrowDown && !isOpen && !this.readonly) {
        this._navigateToPrevItem();
      }
    }
    _handleArrowDown(event) {
      const isOpen = this.allItemsPopover.opened;
      const firstListItem = this.list.items[0];
      if (isOpen) {
        this.list._itemNavigation.setCurrentItem(firstListItem);
        this.value = this.valueBeforeAutoComplete || this.value;
        firstListItem.focus();
      } else if (!this.readonly) {
        this._navigateToNextItem();
      }
    }
    _handleItemRangeSelection(event) {
      const items = this.items;
      const listItems = this.list.items;
      const currentItemIdx = listItems.indexOf(event.target);
      const nextItemIdx = currentItemIdx + 1;
      const prevItemIdx = currentItemIdx - 1;
      if ((0, _Keys.isDownShift)(event) && items[nextItemIdx]) {
        items[nextItemIdx].selected = items[currentItemIdx].selected;
        items[nextItemIdx].focus();
      }
      if ((0, _Keys.isUpShift)(event) && items[prevItemIdx]) {
        items[prevItemIdx].selected = items[currentItemIdx].selected;
        items[prevItemIdx].focus();
      }
      this.fireSelectionChange();
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
      const matchingItem = this.items.find(item => item.text.toLowerCase() === lowerCaseValue);
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
          this.valueState = "Error";
          this._performingSelectionTwice = true;
          this._resetValueState(oldValueState, () => {
            this._performingSelectionTwice = false;
          });
        } else {
          matchingItem.selected = true;
          this.value = "";
          this.fireSelectionChange();
        }
        innerInput.setSelectionRange(matchingItem.text.length, matchingItem.text.length);
        this.allItemsPopover.close();
      }
    }
    _resetValueState(valueState, callback) {
      this._validationTimeout = setTimeout(() => {
        this.valueState = valueState;
        this._validationTimeout = null;
        callback && callback();
      }, 2000);
    }
    _onTokenizerKeydown(event) {
      const isCtrl = !!(event.metaKey || event.ctrlKey);
      if ((0, _Keys.isRight)(event)) {
        const lastTokenIndex = this._tokenizer.tokens.length - 1;
        if (event.target === this._tokenizer.tokens[lastTokenIndex]) {
          setTimeout(() => {
            this.shadowRoot.querySelector("input").focus();
          }, 0);
        }
      }
      if (isCtrl && ["c", "x"].includes(event.key.toLowerCase()) || (0, _Keys.isDeleteShift)(event) || (0, _Keys.isInsertCtrl)(event)) {
        event.preventDefault();
        const isCut = event.key.toLowerCase() === "x" || (0, _Keys.isDeleteShift)(event);
        const selectedTokens = this._tokenizer.tokens.filter(token => token.selected);
        if (isCut) {
          const cutResult = this._tokenizer._fillClipboard("cut", selectedTokens);
          selectedTokens.forEach(token => {
            this._tokenizer._tokenDelete(event, token);
          });
          this.focus();
          return cutResult;
        }
        return this._tokenizer._fillClipboard("copy", selectedTokens);
      }
      if ((0, _Keys.isCtrlV)(event) || (0, _Keys.isInsertShift)(event)) {
        this._handlePaste(event);
      }
      if ((0, _Keys.isHome)(event)) {
        this._handleHome(event);
      }
      if ((0, _Keys.isEnd)(event)) {
        this._handleEnd(event);
      }
      if ((0, _Keys.isShow)(event) && !this.readonly && !this.disabled) {
        this._handleShow(event);
      }
    }
    _filterItems(str) {
      const itemsToFilter = this.items.filter(item => !item.isGroupItem);
      const filteredItems = (Filters[this.filter] || Filters.StartsWithPerTerm)(str, itemsToFilter, "text");

      // Return the filtered items and their group items
      return this.items.filter((item, idx, allItems) => MultiComboBox._groupItemFilter(item, ++idx, allItems, filteredItems) || filteredItems.indexOf(item) !== -1);
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
        this._itemToFocus.focus();
      } else {
        this.allItemsPopover.focus();
      }
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
    _listSelectionChange(event) {
      // sync list items and cb items
      this.syncItems(event.target.items);

      // don't call selection change right after selection as user can cancel it on phone
      if (!(0, _Device.isPhone)()) {
        this.fireSelectionChange();
      }
      if (!event.detail.selectionComponentPressed && !(0, _Keys.isSpace)(event.detail) && !(0, _Keys.isSpaceCtrl)(event.detail)) {
        this.allItemsPopover.close();
        this.value = "";

        // if the item (not checkbox) is clicked, call the selection change
        if ((0, _Device.isPhone)()) {
          this.fireSelectionChange();
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
      this.fireEvent("selection-change", {
        items: this._getSelectedItems()
      });
      // Angular 2 way data binding
      this.fireEvent("value-changed");
    }
    async _getRespPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      this.allItemsPopover = staticAreaItem.querySelector(`.ui5-multi-combobox-all-items-responsive-popover`);
    }
    async _getList() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      this.list = staticAreaItem.querySelector(".ui5-multi-combobox-all-items-list");
    }
    _click(event) {
      if ((0, _Device.isPhone)() && !this.readonly && !this._showMorePressed && !this._deleting) {
        this.allItemsPopover.showAt(this);
      }
      this._showMorePressed = false;
    }
    _afterClosePicker() {
      // close device's keyboard and prevent further typing
      if ((0, _Device.isPhone)()) {
        this.blur();
      }
      this._toggle();
      this._iconPressed = false;
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
        this.selectedItems = this.items.filter((item, idx, allItems) => MultiComboBox._groupItemFilter(item, ++idx, allItems, selectedItems) || selectedItems.indexOf(item) !== -1);
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
    onBeforeRendering() {
      const input = this._innerInput;
      const autoCompletedChars = input && input.selectionEnd - input.selectionStart;
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
      if (!input || !value) {
        return;
      }

      // Typehead causes issues on Android devices, so we disable it for now
      // If there is already a selection the autocomplete has already been performed
      if (this._shouldAutocomplete && !(0, _Device.isAndroid)() && !autoCompletedChars) {
        const item = this._getFirstMatchingItem(value);

        // Keep the original typed in text intact
        this.valueBeforeAutoComplete = value;
        this._handleTypeAhead(item, value);
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
        item.ref.selected = item.selected;
      });
      this.togglePopover();
      this.value = this._valueBeforeOpen;
    }
    handleOK() {
      if ((0, _Device.isPhone)()) {
        this.fireSelectionChange();
      }
      this.togglePopover();
    }
    async openPopover() {
      const popover = await this._getPopover();
      if (popover) {
        popover.showAt(this);
      }
    }
    _forwardFocusToInner() {
      this._innerInput.focus();
    }
    async closePopover() {
      const popover = await this._getPopover();
      popover && popover.close();
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
    inputFocusIn(event) {
      if (!(0, _Device.isPhone)() || this.readonly) {
        this.focused = true;
      } else {
        this._innerInput.blur();
      }
      if (!(0, _Device.isPhone)() && (event.relatedTarget && event.relatedTarget.tagName !== "UI5-STATIC-AREA-ITEM" || !event.relatedTarget)) {
        this._innerInput.setSelectionRange(0, this.value.length);
      }
      this._lastValue = this.value;
      this.valueBeforeAutoComplete = "";
    }
    inputFocusOut(event) {
      if (!this.shadowRoot.contains(event.relatedTarget) && !this._deleting) {
        this.focused = false;

        // remove the value if user focus out the input and focus is not going in the popover
        if (!(0, _Device.isPhone)() && !this.allowCustomValues && this.staticAreaItem !== event.relatedTarget) {
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
    get valueStateText() {
      let key = this.valueState;
      if (this._performingSelectionTwice) {
        key = "Error_Selection";
      }
      return this.valueStateTextMappings[key];
    }
    get valueStateTextId() {
      return this.hasValueState ? `${this._id}-valueStateDesc` : undefined;
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
      const iconPerValueState = {
        Error: "error",
        Warning: "alert",
        Success: "sys-enter-2",
        Information: "information"
      };
      return this.valueState !== _ValueState.default.None ? iconPerValueState[this.valueState] : "";
    }
    get _tokensCountText() {
      if (!this._tokenizer) {
        return;
      }
      return this._tokenizer._tokensCountText();
    }
    get _tokensCountTextId() {
      return `${this._id}-hiddenText-nMore`;
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
    get valueStateTextMappings() {
      return {
        "Success": MultiComboBox.i18nBundle.getText(_i18nDefaults.VALUE_STATE_SUCCESS),
        "Error": MultiComboBox.i18nBundle.getText(_i18nDefaults.VALUE_STATE_ERROR),
        "Error_Selection": MultiComboBox.i18nBundle.getText(_i18nDefaults.VALUE_STATE_ERROR_ALREADY_SELECTED),
        "Warning": MultiComboBox.i18nBundle.getText(_i18nDefaults.VALUE_STATE_WARNING),
        "Information": MultiComboBox.i18nBundle.getText(_i18nDefaults.VALUE_STATE_INFORMATION)
      };
    }
    get _innerInput() {
      if ((0, _Device.isPhone)()) {
        if (this.allItemsPopover && this.allItemsPopover.opened) {
          return this.allItemsPopover.querySelector("input");
        }
      }
      return this.getDomRef() ? this.getDomRef().querySelector("#ui5-multi-combobox-input") : null;
    }
    get _headerTitleText() {
      return MultiComboBox.i18nBundle.getText(_i18nDefaults.INPUT_SUGGESTIONS_TITLE);
    }
    get _iconAccessibleNameText() {
      return MultiComboBox.i18nBundle.getText(_i18nDefaults.SELECT_OPTIONS);
    }
    get _dialogOkButton() {
      return MultiComboBox.i18nBundle.getText(_i18nDefaults.MULTICOMBOBOX_DIALOG_OK_BUTTON);
    }
    get _tokenizerExpanded() {
      return (this._isFocusInside || this.open) && !this.readonly;
    }
    get _valueStatePopoverHorizontalAlign() {
      return this.effectiveDir !== "rtl" ? "Left" : "Right";
    }
    get classes() {
      return {
        popover: {
          "ui5-multi-combobox-all-items-responsive-popover": true,
          "ui5-suggestions-popover": !this.isPhone,
          "ui5-suggestions-popover-with-value-state-header": !this.isPhone && this.hasValueStateMessage
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
          "width": `${this._listWidth}px`,
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
      MultiComboBox.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  }
  MultiComboBox.define();
  var _default = MultiComboBox;
  _exports.default = _default;
});