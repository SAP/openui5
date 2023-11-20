sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/connectToComponent", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/types/DOMReference", "sap/ui/webc/common/thirdparty/base/util/InvisibleMessage", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/icons/slim-arrow-down", "sap/ui/webc/common/thirdparty/icons/error", "sap/ui/webc/common/thirdparty/icons/alert", "sap/ui/webc/common/thirdparty/icons/sys-enter-2", "sap/ui/webc/common/thirdparty/icons/information", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/icons/decline", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/types/InvisibleMessageMode", "sap/ui/webc/common/thirdparty/base/CustomElementsScope", "./List", "./generated/i18n/i18n-defaults", "./Option", "./Label", "./ResponsivePopover", "./Popover", "./StandardListItem", "./Icon", "./Button", "./generated/templates/SelectTemplate.lit", "./generated/templates/SelectPopoverTemplate.lit", "./generated/themes/Select.css", "./generated/themes/ResponsivePopoverCommon.css", "./generated/themes/ValueStateMessage.css", "./generated/themes/SelectPopover.css"], function (_exports, _UI5Element, _customElement, _property, _event, _slot, _LitRenderer, _connectToComponent, _Keys, _DOMReference, _InvisibleMessage, _FeaturesRegistry, _AriaLabelHelper, _ValueState, _slimArrowDown, _error, _alert, _sysEnter, _information, _Device, _i18nBundle, _decline, _Integer, _InvisibleMessageMode, _CustomElementsScope, _List, _i18nDefaults, _Option, _Label, _ResponsivePopover, _Popover, _StandardListItem, _Icon, _Button, _SelectTemplate, _SelectPopoverTemplate, _Select, _ResponsivePopoverCommon, _ValueStateMessage, _SelectPopover) {
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
  _connectToComponent = _interopRequireDefault(_connectToComponent);
  _DOMReference = _interopRequireDefault(_DOMReference);
  _InvisibleMessage = _interopRequireDefault(_InvisibleMessage);
  _ValueState = _interopRequireDefault(_ValueState);
  _Integer = _interopRequireDefault(_Integer);
  _InvisibleMessageMode = _interopRequireDefault(_InvisibleMessageMode);
  _List = _interopRequireDefault(_List);
  _Option = _interopRequireDefault(_Option);
  _Label = _interopRequireDefault(_Label);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  _Popover = _interopRequireDefault(_Popover);
  _StandardListItem = _interopRequireDefault(_StandardListItem);
  _Icon = _interopRequireDefault(_Icon);
  _Button = _interopRequireDefault(_Button);
  _SelectTemplate = _interopRequireDefault(_SelectTemplate);
  _SelectPopoverTemplate = _interopRequireDefault(_SelectPopoverTemplate);
  _Select = _interopRequireDefault(_Select);
  _ResponsivePopoverCommon = _interopRequireDefault(_ResponsivePopoverCommon);
  _ValueStateMessage = _interopRequireDefault(_ValueStateMessage);
  _SelectPopover = _interopRequireDefault(_SelectPopover);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var Select_1;

  // Templates

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-select</code> component is used to create a drop-down list.
   *
   * <h3>Usage</h3>
   *
   * There are two main usages of the <code>ui5-select></code>.
   *
   * 1. With Option (<code>ui5-option</code>) web component:
   * <br>
   * The available options of the Select are defined by using the Option component.
   * The Option comes with predefined design and layout, including <code>icon</code>, <code>text</code> and <code>additional-text</code>.
   * <br><br>
   *
   * 2. With SelectMenu (<code>ui5-select-menu</code>) and SelectMenuOption (<code>ui5-select-menu-option</code>) web components:
   * <br>
   * The SelectMenu can be used as alternative to define the Select's dropdown
   * and can be used via the <code>menu</code> property of the Select to reference SelectMenu by its ID.
   * The component gives the possibility to customize the Select's dropdown
   * by slotting entirely custom options (via the SelectMenuOption component) and adding custom styles.
   *
   * <b>Note:</b> SelectMenu is a popover and placing it top-level in the HTML page is recommended,
   * because some page styles (for example transitions) can misplace the SelectMenu.
   *
   * <h3>Keyboard Handling</h3>
   * The <code>ui5-select</code> provides advanced keyboard handling.
   * <br>
   * <ul>
   * <li>[F4, ALT+UP, ALT+DOWN, SPACE, ENTER] - Opens/closes the drop-down.</li>
   * <li>[UP, DOWN] - If the drop-down is closed - changes selection to the next or the previous option. If the drop-down is opened - moves focus to the next or the previous option.</li>
   * <li>[SPACE, ENTER] - If the drop-down is opened - selects the focused option.</li>
   * <li>[ESC] - Closes the drop-down without changing the selection.</li>
   * <li>[HOME] - Navigates to first option</li>
   * <li>[END] - Navigates to the last option</li>
   * </ul>
   * <br>
   *
   * <h3>ES6 Module Import</h3>
   * <code>import "@ui5/webcomponents/dist/Select";</code>
   * <br>
   * <code>import "@ui5/webcomponents/dist/Option";</code> (comes with <code>ui5-select</code>)
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.Select
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-select
   * @appenddocs sap.ui.webc.main.Option sap.ui.webc.main.SelectMenu sap.ui.webc.main.SelectMenuOption
   * @public
   * @since 0.8.0
   */
  let Select = Select_1 = class Select extends _UI5Element.default {
    constructor() {
      super();
      this._syncedOptions = [];
      this._selectedIndexBeforeOpen = -1;
      this._escapePressed = false;
      this._lastSelectedOption = null;
      this._typedChars = "";
      this._onMenuClick = this.onMenuClick.bind(this);
      this._onMenuClose = this.onMenuClose.bind(this);
      this._onMenuOpen = this.onMenuOpen.bind(this);
      this._onMenuBeforeOpen = this.onMenuBeforeOpen.bind(this);
      this._onMenuChange = this.onMenuChange.bind(this);
      this._attachMenuListeners = this.attachMenuListeners.bind(this);
      this._detachMenuListeners = this.detachMenuListeners.bind(this);
    }
    onBeforeRendering() {
      const menu = this._getSelectMenu();
      if (menu) {
        menu.value = this.value;
      } else {
        this._syncSelection();
      }
      this._enableFormSupport();
      this.style.setProperty((0, _CustomElementsScope.getScopedVarName)("--_ui5-input-icons-count"), `${this.iconsCount}`);
    }
    onAfterRendering() {
      this.toggleValueStatePopover(this.shouldOpenValueStateMessagePopover);
      if (this._isPickerOpen) {
        if (!this._listWidth) {
          this._listWidth = this.responsivePopover.offsetWidth;
        }
      }
      this._attachRealDomRefs();
    }
    _onfocusin() {
      this.focused = true;
    }
    _onfocusout() {
      this.focused = false;
    }
    get _isPickerOpen() {
      const menu = this._getSelectMenu();
      if (menu) {
        return menu.open;
      }
      return !!this.responsivePopover && this.responsivePopover.opened;
    }
    async _respPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector("[ui5-responsive-popover]");
    }
    /**
     * Currently selected <code>ui5-option</code> element.
     * @readonly
     * @type {sap.ui.webc.main.ISelectOption}
     * @name sap.ui.webc.main.Select.prototype.selectedOption
     * @public
     */
    get selectedOption() {
      return this.selectOptions.find(option => option.selected);
    }
    onMenuClick(e) {
      const optionIndex = e.detail.optionIndex;
      this._handleSelectionChange(optionIndex);
    }
    onMenuBeforeOpen() {
      this._beforeOpen();
    }
    onMenuOpen() {
      this._afterOpen();
    }
    onMenuClose() {
      this._afterClose();
    }
    onMenuChange(e) {
      this._text = e.detail.text;
      this._selectedIndex = e.detail.selectedIndex;
    }
    _toggleSelectMenu() {
      const menu = this._getSelectMenu();
      if (!menu) {
        return;
      }
      if (menu.open) {
        menu.close();
      } else {
        menu.showAt(this, this.offsetWidth);
      }
    }
    onExitDOM() {
      const menu = this._getSelectMenu();
      if (menu) {
        this._detachMenuListeners(menu);
      }
    }
    async _toggleRespPopover() {
      if (this.disabled) {
        return;
      }
      this._iconPressed = true;
      const menu = this._getSelectMenu();
      if (menu) {
        this._toggleSelectMenu();
        return;
      }
      this.responsivePopover = await this._respPopover();
      if (this._isPickerOpen) {
        this.responsivePopover.close();
      } else {
        this.responsivePopover.showAt(this);
      }
    }
    async _attachRealDomRefs() {
      this.responsivePopover = await this._respPopover();
      this.options.forEach(option => {
        option._getRealDomRef = () => this.responsivePopover.querySelector(`*[data-ui5-stable=${option.stableDomRef}]`);
      });
    }
    _syncSelection() {
      let lastSelectedOptionIndex = -1,
        firstEnabledOptionIndex = -1;
      const options = this._filteredItems;
      const syncOpts = options.map((opt, index) => {
        if (opt.selected || opt.textContent === this.value) {
          // The second condition in the IF statement is added because of Angular Reactive Forms Support(Two way data binding)
          lastSelectedOptionIndex = index;
        }
        if (firstEnabledOptionIndex === -1) {
          firstEnabledOptionIndex = index;
        }
        opt.selected = false;
        opt._focused = false;
        return {
          selected: false,
          _focused: false,
          icon: opt.icon,
          value: opt.value,
          textContent: opt.textContent,
          title: opt.title,
          additionalText: opt.additionalText,
          id: opt._id,
          stableDomRef: opt.stableDomRef
        };
      });
      if (lastSelectedOptionIndex > -1) {
        syncOpts[lastSelectedOptionIndex].selected = true;
        syncOpts[lastSelectedOptionIndex]._focused = true;
        options[lastSelectedOptionIndex].selected = true;
        options[lastSelectedOptionIndex]._focused = true;
        this._text = syncOpts[lastSelectedOptionIndex].textContent;
        this._selectedIndex = lastSelectedOptionIndex;
      } else {
        this._text = "";
        this._selectedIndex = -1;
        if (syncOpts[firstEnabledOptionIndex]) {
          syncOpts[firstEnabledOptionIndex].selected = true;
          syncOpts[firstEnabledOptionIndex]._focused = true;
          options[firstEnabledOptionIndex].selected = true;
          options[firstEnabledOptionIndex]._focused = true;
          this._selectedIndex = firstEnabledOptionIndex;
          this._text = options[firstEnabledOptionIndex].textContent;
        }
      }
      this._syncedOptions = syncOpts;
    }
    _getSelectMenu() {
      return (0, _connectToComponent.default)({
        host: this,
        propName: "menu",
        onConnect: this._attachMenuListeners,
        onDisconnect: this._detachMenuListeners
      });
    }
    attachMenuListeners(menu) {
      menu.addEventListener("ui5-after-close", this._onMenuClose);
      menu.addEventListener("ui5-after-open", this._onMenuOpen);
      menu.addEventListener("ui5-before-open", this._onMenuBeforeOpen);
      // @ts-ignore
      menu.addEventListener("ui5-option-click", this._onMenuClick);
      // @ts-ignore
      menu.addEventListener("ui5-menu-change", this._onMenuChange);
    }
    detachMenuListeners(menu) {
      menu.removeEventListener("ui5-after-close", this._onMenuClose);
      menu.removeEventListener("ui5-after-open", this._onMenuOpen);
      menu.removeEventListener("ui5-before-open", this._onMenuBeforeOpen);
      // @ts-ignore
      menu.removeEventListener("ui5-option-click", this._onMenuClick);
      // @ts-ignore
      menu.removeEventListener("ui5-menu-change", this._onMenuChange);
    }
    _enableFormSupport() {
      const formSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");
      if (formSupport) {
        formSupport.syncNativeHiddenInput(this, (element, nativeInput) => {
          const selectElement = element;
          nativeInput.disabled = !!element.disabled;
          nativeInput.value = selectElement._currentlySelectedOption ? selectElement._currentlySelectedOption.value : "";
        });
      } else if (this.name) {
        console.warn(`In order for the "name" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`); // eslint-disable-line
      }
    }

    _onkeydown(e) {
      const isTab = (0, _Keys.isTabNext)(e) || (0, _Keys.isTabPrevious)(e);
      if (isTab && this._isPickerOpen) {
        const menu = this._getSelectMenu();
        if (menu) {
          menu.close(false, false, true /* preventFocusRestore */);
        } else {
          this.responsivePopover.close();
        }
      } else if ((0, _Keys.isShow)(e)) {
        e.preventDefault();
        this._toggleRespPopover();
      } else if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
      } else if ((0, _Keys.isEscape)(e) && this._isPickerOpen) {
        this._escapePressed = true;
      } else if ((0, _Keys.isHome)(e)) {
        this._handleHomeKey(e);
      } else if ((0, _Keys.isEnd)(e)) {
        this._handleEndKey(e);
      } else if ((0, _Keys.isEnter)(e)) {
        this._handleSelectionChange();
      } else if ((0, _Keys.isUp)(e) || (0, _Keys.isDown)(e)) {
        this._handleArrowNavigation(e);
      }
    }
    _handleKeyboardNavigation(e) {
      if ((0, _Keys.isEnter)(e)) {
        return;
      }
      const typedCharacter = e.key.toLowerCase();
      this._typedChars += typedCharacter;
      // We check if we have more than one characters and they are all duplicate, we set the
      // text to be the last input character (typedCharacter). If not, we set the text to be
      // the whole input string.
      const text = /^(.)\1+$/i.test(this._typedChars) ? typedCharacter : this._typedChars;
      clearTimeout(this._typingTimeoutID);
      this._typingTimeoutID = setTimeout(() => {
        this._typedChars = "";
        this._typingTimeoutID = -1;
      }, 1000);
      this._selectTypedItem(text);
    }
    _selectTypedItem(text) {
      const currentIndex = this._selectedIndex;
      const itemToSelect = this._searchNextItemByText(text);
      if (itemToSelect) {
        const nextIndex = this.selectOptions.indexOf(itemToSelect);
        this._changeSelectedItem(this._selectedIndex, nextIndex);
        if (currentIndex !== this._selectedIndex) {
          this.itemSelectionAnnounce();
        }
      }
    }
    _searchNextItemByText(text) {
      let orderedOptions = this.selectOptions.slice(0);
      const optionsAfterSelected = orderedOptions.splice(this._selectedIndex + 1, orderedOptions.length - this._selectedIndex);
      const optionsBeforeSelected = orderedOptions.splice(0, orderedOptions.length - 1);
      orderedOptions = optionsAfterSelected.concat(optionsBeforeSelected);
      return orderedOptions.find(option => (option.displayText || option.textContent || "").toLowerCase().startsWith(text));
    }
    _handleHomeKey(e) {
      e.preventDefault();
      this._changeSelectedItem(this._selectedIndex, 0);
    }
    _handleEndKey(e) {
      const lastIndex = this.selectOptions.length - 1;
      e.preventDefault();
      this._changeSelectedItem(this._selectedIndex, lastIndex);
    }
    _onkeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
        if (this._isPickerOpen) {
          this._handleSelectionChange();
        } else {
          this._toggleRespPopover();
        }
      }
    }
    _getSelectedItemIndex(item) {
      return this.selectOptions.findIndex(option => `${option._id}-li` === item.id);
    }
    _select(index) {
      this.selectOptions[this._selectedIndex].selected = false;
      if (this._selectedIndex !== index) {
        this.fireEvent("live-change", {
          selectedOption: this.selectOptions[index]
        });
      }
      this._selectedIndex = index;
      this.selectOptions[index].selected = true;
    }
    /**
     * The user clicked on an item from the list
     * @private
     */
    _handleItemPress(e) {
      const item = e.detail.item;
      const selectedItemIndex = this._getSelectedItemIndex(item);
      this._handleSelectionChange(selectedItemIndex);
    }
    _itemMousedown(e) {
      // prevent actual focus of items
      e.preventDefault();
    }
    _onclick() {
      this.getFocusDomRef().focus();
      this._toggleRespPopover();
    }
    /**
     * The user selected an item with Enter or Space
     * @private
     */
    _handleSelectionChange(index = this._selectedIndex) {
      this._select(index);
      this._toggleRespPopover();
    }
    _scrollSelectedItem() {
      if (this._isPickerOpen) {
        const itemRef = this._currentlySelectedOption?.getDomRef();
        if (itemRef) {
          itemRef.scrollIntoView({
            behavior: "auto",
            block: "nearest",
            inline: "nearest"
          });
        }
      }
    }
    _handleArrowNavigation(e) {
      let nextIndex = -1;
      const currentIndex = this._selectedIndex;
      const isDownKey = (0, _Keys.isDown)(e);
      e.preventDefault();
      if (isDownKey) {
        nextIndex = this._getNextOptionIndex();
      } else {
        nextIndex = this._getPreviousOptionIndex();
      }
      this._changeSelectedItem(this._selectedIndex, nextIndex);
      if (currentIndex !== this._selectedIndex) {
        // Announce new item even if picker is opened.
        // The aria-activedescendents attribute can't be used,
        // because listitem elements are in different shadow dom
        this.itemSelectionAnnounce();
        this._scrollSelectedItem();
      }
    }
    _changeSelectedItem(oldIndex, newIndex) {
      const options = this.selectOptions;
      const previousOption = options[oldIndex];
      previousOption.selected = false;
      previousOption._focused = false;
      previousOption.focused = false;
      const nextOption = options[newIndex];
      nextOption.selected = true;
      nextOption._focused = true;
      nextOption.focused = true;
      this._selectedIndex = newIndex;
      this.fireEvent("live-change", {
        selectedOption: nextOption
      });
      if (!this._isPickerOpen) {
        // arrow pressed on closed picker - do selection change
        this._fireChangeEvent(nextOption);
      }
    }
    _getNextOptionIndex() {
      const menu = this._getSelectMenu();
      if (menu) {
        return this._selectedIndex === menu.options.length - 1 ? this._selectedIndex : this._selectedIndex + 1;
      }
      return this._selectedIndex === this.options.length - 1 ? this._selectedIndex : this._selectedIndex + 1;
    }
    _getPreviousOptionIndex() {
      return this._selectedIndex === 0 ? this._selectedIndex : this._selectedIndex - 1;
    }
    _beforeOpen() {
      this._selectedIndexBeforeOpen = this._selectedIndex;
      this._lastSelectedOption = this.selectOptions[this._selectedIndex];
    }
    _afterOpen() {
      this.opened = true;
      this.fireEvent("open");
      this.itemSelectionAnnounce();
      this._scrollSelectedItem();
    }
    _afterClose() {
      this.opened = false;
      this._iconPressed = false;
      this._listWidth = 0;
      if (this._escapePressed) {
        this._select(this._selectedIndexBeforeOpen);
        this._escapePressed = false;
      } else if (this._lastSelectedOption !== this.selectOptions[this._selectedIndex]) {
        this._fireChangeEvent(this.selectOptions[this._selectedIndex]);
        this._lastSelectedOption = this.selectOptions[this._selectedIndex];
      }
      this.fireEvent("close");
    }
    get selectOptions() {
      const menu = this._getSelectMenu();
      if (menu) {
        return menu.options;
      }
      return this._filteredItems;
    }
    get hasCustomLabel() {
      return !!this.label.length;
    }
    _fireChangeEvent(selectedOption) {
      const changePrevented = !this.fireEvent("change", {
        selectedOption
      }, true);
      //  Angular two way data binding
      this.selectedItem = selectedOption.textContent;
      this.fireEvent("selected-item-changed");
      if (changePrevented) {
        this.selectedItem = this._lastSelectedOption.textContent;
        this._select(this._selectedIndexBeforeOpen);
      }
    }
    get valueStateTextMappings() {
      return {
        [_ValueState.default.Success]: Select_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_SUCCESS),
        [_ValueState.default.Information]: Select_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_INFORMATION),
        [_ValueState.default.Error]: Select_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_ERROR),
        [_ValueState.default.Warning]: Select_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_WARNING)
      };
    }
    get valueStateTypeMappings() {
      return {
        [_ValueState.default.Success]: Select_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_TYPE_SUCCESS),
        [_ValueState.default.Information]: Select_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_TYPE_INFORMATION),
        [_ValueState.default.Error]: Select_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_TYPE_ERROR),
        [_ValueState.default.Warning]: Select_1.i18nBundle.getText(_i18nDefaults.VALUE_STATE_TYPE_WARNING)
      };
    }
    get valueStateText() {
      let valueStateText;
      if (this.shouldDisplayDefaultValueStateMessage) {
        valueStateText = this.valueStateDefaultText;
      } else {
        valueStateText = this.valueStateMessageText.map(el => el.textContent).join(" ");
      }
      return `${this.valueStateTypeText} ${valueStateText}`;
    }
    get valueStateDefaultText() {
      return this.valueState !== _ValueState.default.None ? this.valueStateTextMappings[this.valueState] : "";
    }
    get valueStateTypeText() {
      return this.valueState !== _ValueState.default.None ? this.valueStateTypeMappings[this.valueState] : "";
    }
    get hasValueState() {
      return this.valueState !== _ValueState.default.None;
    }
    get valueStateTextId() {
      return this.hasValueState ? `${this._id}-valueStateDesc` : undefined;
    }
    get isDisabled() {
      return this.disabled || undefined;
    }
    get _headerTitleText() {
      return Select_1.i18nBundle.getText(_i18nDefaults.INPUT_SUGGESTIONS_TITLE);
    }
    get _currentlySelectedOption() {
      return this.selectOptions[this._selectedIndex];
    }
    get _effectiveTabIndex() {
      return this.disabled || this.responsivePopover // Handles focus on Tab/Shift + Tab when the popover is opened
      && this.responsivePopover.opened ? "-1" : "0";
    }
    /**
    * This method is relevant for sap_horizon theme only
    */
    get _valueStateMessageInputIcon() {
      const iconPerValueState = {
        Error: "error",
        Warning: "alert",
        Success: "sys-enter-2",
        Information: "information"
      };
      return this.valueState !== _ValueState.default.None ? iconPerValueState[this.valueState] : "";
    }
    get iconsCount() {
      return this.selectedOptionIcon ? 2 : 1;
    }
    get classes() {
      return {
        popoverValueState: {
          "ui5-valuestatemessage-root": true,
          "ui5-valuestatemessage--success": this.valueState === _ValueState.default.Success,
          "ui5-valuestatemessage--error": this.valueState === _ValueState.default.Error,
          "ui5-valuestatemessage--warning": this.valueState === _ValueState.default.Warning,
          "ui5-valuestatemessage--information": this.valueState === _ValueState.default.Information
        },
        popover: {
          "ui5-select-popover-valuestate": this.hasValueState
        }
      };
    }
    get styles() {
      return {
        popoverHeader: {
          "max-width": `${this.offsetWidth}px`
        },
        responsivePopoverHeader: {
          "display": this._filteredItems.length && this._listWidth === 0 ? "none" : "inline-block",
          "width": `${this._filteredItems.length ? this._listWidth : this.offsetWidth}px`
        },
        responsivePopover: {
          "min-width": `${this.offsetWidth}px`
        }
      };
    }
    get ariaLabelText() {
      return (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this);
    }
    get valueStateMessageText() {
      return this.getSlottedNodes("valueStateMessage").map(el => el.cloneNode(true));
    }
    get shouldDisplayDefaultValueStateMessage() {
      return !this.valueStateMessageText.length && this.hasValueStateText;
    }
    get hasValueStateText() {
      return this.hasValueState && this.valueState !== _ValueState.default.Success;
    }
    get shouldOpenValueStateMessagePopover() {
      return this.focused && this.hasValueStateText && !this._iconPressed && !this._isPickerOpen && !this._isPhone;
    }
    get _ariaRoleDescription() {
      return Select_1.i18nBundle.getText(_i18nDefaults.SELECT_ROLE_DESCRIPTION);
    }
    get _isPhone() {
      return (0, _Device.isPhone)();
    }
    get _filteredItems() {
      return this.options.filter(option => !option.disabled);
    }
    itemSelectionAnnounce() {
      let text;
      const optionsCount = this.selectOptions.length;
      const itemPositionText = Select_1.i18nBundle.getText(_i18nDefaults.LIST_ITEM_POSITION, this._selectedIndex + 1, optionsCount);
      if (this.focused && this._currentlySelectedOption) {
        text = `${this._currentlySelectedOption.textContent} ${this._isPickerOpen ? itemPositionText : ""}`;
        (0, _InvisibleMessage.default)(text, _InvisibleMessageMode.default.Polite);
      }
    }
    async openValueStatePopover() {
      this.valueStatePopover = await this._getPopover();
      if (this.valueStatePopover) {
        this.valueStatePopover.showAt(this);
      }
    }
    closeValueStatePopover() {
      this.valueStatePopover && this.valueStatePopover.close();
    }
    toggleValueStatePopover(open) {
      if (open) {
        this.openValueStatePopover();
      } else {
        this.closeValueStatePopover();
      }
    }
    get selectedOptionIcon() {
      return this.selectedOption && this.selectedOption.icon;
    }
    async _getPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector("[ui5-popover]");
    }
    static async onDefine() {
      Select_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)({
    validator: _DOMReference.default
  })], Select.prototype, "menu", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Select.prototype, "disabled", void 0);
  __decorate([(0, _property.default)()], Select.prototype, "name", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], Select.prototype, "valueState", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Select.prototype, "required", void 0);
  __decorate([(0, _property.default)()], Select.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)()], Select.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)({
    type: String,
    noAttribute: true
  })], Select.prototype, "_text", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], Select.prototype, "_iconPressed", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Select.prototype, "opened", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 0,
    noAttribute: true
  })], Select.prototype, "_listWidth", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], Select.prototype, "focused", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: -1,
    noAttribute: true
  })], Select.prototype, "_selectedIndex", void 0);
  __decorate([(0, _slot.default)({
    "default": true,
    type: HTMLElement,
    invalidateOnChildChange: true
  })], Select.prototype, "options", void 0);
  __decorate([(0, _slot.default)()], Select.prototype, "formSupport", void 0);
  __decorate([(0, _slot.default)()], Select.prototype, "valueStateMessage", void 0);
  __decorate([(0, _slot.default)()], Select.prototype, "label", void 0);
  Select = Select_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-select",
    languageAware: true,
    renderer: _LitRenderer.default,
    template: _SelectTemplate.default,
    staticAreaTemplate: _SelectPopoverTemplate.default,
    styles: _Select.default,
    staticAreaStyles: [_ResponsivePopoverCommon.default, _ValueStateMessage.default, _SelectPopover.default],
    dependencies: [_Option.default, _Label.default, _ResponsivePopover.default, _Popover.default, _List.default, _StandardListItem.default, _Icon.default, _Button.default]
  })
  /**
   * Fired when the selected option changes.
   *
   * @event sap.ui.webc.main.Select#change
   * @allowPreventDefault
   * @param {HTMLElement} selectedOption the selected option.
   * @public
   */, (0, _event.default)("change", {
    detail: {
      selectedOption: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired when the user navigates through the options, but the selection is not finalized,
   * or when pressing the ESC key to revert the current selection.
   *
   * @event sap.ui.webc.main.Select#live-change
   * @param {HTMLElement} selectedOption the selected option.
   * @public
   * @since 1.17.0
   */, (0, _event.default)("live-change", {
    detail: {
      option: {
        type: HTMLElement
      }
    }
  })
  /**
   * Fired after the component's dropdown menu opens.
   *
   * @event sap.ui.webc.main.Select#open
   * @public
   */, (0, _event.default)("open")
  /**
   * Fired after the component's dropdown menu closes.
   *
   * @event sap.ui.webc.main.Select#close
   * @public
   */, (0, _event.default)("close")], Select);
  Select.define();
  var _default = Select;
  _exports.default = _default;
});