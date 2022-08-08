sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/util/InvisibleMessage", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/icons/slim-arrow-down", "sap/ui/webc/common/thirdparty/icons/error", "sap/ui/webc/common/thirdparty/icons/alert", "sap/ui/webc/common/thirdparty/icons/sys-enter-2", "sap/ui/webc/common/thirdparty/icons/information", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/icons/decline", "./generated/i18n/i18n-defaults", "./Option", "./Label", "./ResponsivePopover", "./Popover", "./List", "./StandardListItem", "./Icon", "./Button", "./generated/templates/SelectTemplate.lit", "./generated/templates/SelectPopoverTemplate.lit", "./generated/themes/Select.css", "./generated/themes/ResponsivePopoverCommon.css", "./generated/themes/ValueStateMessage.css", "./generated/themes/SelectPopover.css"], function (_exports, _UI5Element, _LitRenderer, _Keys, _InvisibleMessage, _Integer, _FeaturesRegistry, _AriaLabelHelper, _ValueState, _slimArrowDown, _error, _alert, _sysEnter, _information, _Device, _i18nBundle, _decline, _i18nDefaults, _Option, _Label, _ResponsivePopover, _Popover, _List, _StandardListItem, _Icon, _Button, _SelectTemplate, _SelectPopoverTemplate, _Select, _ResponsivePopoverCommon, _ValueStateMessage, _SelectPopover) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _InvisibleMessage = _interopRequireDefault(_InvisibleMessage);
  _Integer = _interopRequireDefault(_Integer);
  _ValueState = _interopRequireDefault(_ValueState);
  _Option = _interopRequireDefault(_Option);
  _Label = _interopRequireDefault(_Label);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  _Popover = _interopRequireDefault(_Popover);
  _List = _interopRequireDefault(_List);
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

  // Templates
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-select",
    languageAware: true,
    managedSlots: true,
    slots:
    /** @lends sap.ui.webcomponents.main.Select.prototype */
    {
      /**
       * Defines the component options.
       *
       * <br><br>
       * <b>Note:</b> Only one selected option is allowed.
       * If more than one option is defined as selected, the last one would be considered as the selected one.
       *
       * <br><br>
       * <b>Note:</b> Use the <code>ui5-option</code> component to define the desired options.
       * @type {sap.ui.webcomponents.main.ISelectOption[]}
       * @slot options
       * @public
       */
      "default": {
        propertyName: "options",
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
       * when the component is in <code>Information</code>, <code>Warning</code> or <code>Error</code> value state.
       * @type {HTMLElement[]}
       * @since 1.0.0-rc.9
       * @slot
       * @public
       */
      valueStateMessage: {
        type: HTMLElement
      },

      /**
       * The slot is used to render native <code>input</code> HTML element within Light DOM to enable form submit,
       * when <code>name</code> property is set.
       * @type {HTMLElement[]}
       * @slot
       * @private
       */
      formSupport: {
        type: HTMLElement
      }
    },
    properties:
    /** @lends sap.ui.webcomponents.main.Select.prototype */
    {
      /**
       * Defines whether the component is in disabled state.
       * <br><br>
       * <b>Note:</b> A disabled component is noninteractive.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      disabled: {
        type: Boolean
      },

      /**
       * Determines the name with which the component will be submitted in an HTML form.
       * The value of the component will be the value of the currently selected <code>ui5-option</code>.
       *
       * <br><br>
       * <b>Important:</b> For the <code>name</code> property to have effect, you must add the following import to your project:
       * <code>import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";</code>
       *
       * <br><br>
       * <b>Note:</b> When set, a native <code>input</code> HTML element
       * will be created inside the <code>ui5-select</code> so that it can be submitted as
       * part of an HTML form. Do not use this property unless you need to submit a form.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      name: {
        type: String
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
       * Defines whether the component is required.
       *
       * @since 1.0.0-rc.9
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      required: {
        type: Boolean
      },

      /**
       * Defines the accessible aria name of the component.
       *
       * @type {string}
       * @since 1.0.0-rc.9
       * @public
       * @since 1.0.0-rc.15
       */
      accessibleName: {
        type: String
      },

      /**
       * Receives id(or many ids) of the elements that label the select.
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
      _text: {
        type: String,
        noAttribute: true
      },
      _iconPressed: {
        type: Boolean,
        noAttribute: true
      },

      /**
       * @private
       */
      opened: {
        type: Boolean
      },
      _listWidth: {
        type: _Integer.default,
        defaultValue: 0,
        noAttribute: true
      },

      /**
       * @private
       */
      focused: {
        type: Boolean
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.Select.prototype */
    {
      /**
       * Fired when the selected option changes.
       *
       * @event
       * @param {HTMLElement} selectedOption the selected option.
       * @public
       */
      change: {
        detail: {
          selectedOption: {}
        }
      }
    }
  };
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-select</code> component is used to create a drop-down list.
   * The items inside the <code>ui5-select</code> define the available options by using the <code>ui5-option</code> component.
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
   * @alias sap.ui.webcomponents.main.Select
   * @extends sap.ui.webcomponents.base.UI5Element
   * @tagname ui5-select
   * @appenddocs Option
   * @public
   * @since 0.8.0
   */

  class Select extends _UI5Element.default {
    static get metadata() {
      return metadata;
    }

    static get render() {
      return _LitRenderer.default;
    }

    static get template() {
      return _SelectTemplate.default;
    }

    static get staticAreaTemplate() {
      return _SelectPopoverTemplate.default;
    }

    static get styles() {
      return _Select.default;
    }

    static get staticAreaStyles() {
      return [_ResponsivePopoverCommon.default, _ValueStateMessage.default, _SelectPopover.default];
    }

    constructor() {
      super();
      this._syncedOptions = [];
      this._selectedIndex = -1;
      this._selectedIndexBeforeOpen = -1;
      this._escapePressed = false;
      this._lastSelectedOption = null;
      this._typedChars = "";
      this._typingTimeoutID = -1;
    }

    onBeforeRendering() {
      this._syncSelection();

      this._enableFormSupport();
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
      return !!this.responsivePopover && this.responsivePopover.opened;
    }

    async _respPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector("[ui5-responsive-popover]");
    }
    /**
     * Currently selected option.
     * @readonly
     * @type { sap.ui.webcomponents.main.ISelectOption }
     * @public
     */


    get selectedOption() {
      return this._filteredItems.find(option => option.selected);
    }

    async _toggleRespPopover() {
      this._iconPressed = true;
      this.responsivePopover = await this._respPopover();

      if (this.disabled) {
        return;
      }

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

      if (lastSelectedOptionIndex > -1 && !syncOpts[lastSelectedOptionIndex].disabled) {
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

    _enableFormSupport() {
      const FormSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");

      if (FormSupport) {
        FormSupport.syncNativeHiddenInput(this, (element, nativeInput) => {
          nativeInput.disabled = element.disabled;
          nativeInput.value = element._currentlySelectedOption ? element._currentlySelectedOption.value : "";
        });
      } else if (this.name) {
        console.warn(`In order for the "name" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`); // eslint-disable-line
      }
    }

    _onkeydown(event) {
      const isTab = (0, _Keys.isTabNext)(event) || (0, _Keys.isTabPrevious)(event);

      if (isTab && this.responsivePopover && this.responsivePopover.opened) {
        this.responsivePopover.close();
      }

      if ((0, _Keys.isShow)(event)) {
        event.preventDefault();

        this._toggleRespPopover();
      } else if ((0, _Keys.isSpace)(event)) {
        event.preventDefault();
      } else if ((0, _Keys.isEscape)(event) && this._isPickerOpen) {
        this._escapePressed = true;
      } else if ((0, _Keys.isHome)(event)) {
        this._handleHomeKey(event);
      } else if ((0, _Keys.isEnd)(event)) {
        this._handleEndKey(event);
      } else if ((0, _Keys.isEnter)(event)) {
        this._handleSelectionChange();
      } else if ((0, _Keys.isUp)(event) || (0, _Keys.isDown)(event)) {
        this._handleArrowNavigation(event);
      }
    }

    _handleKeyboardNavigation(event) {
      if ((0, _Keys.isEnter)(event)) {
        return;
      }

      const typedCharacter = event.key.toLowerCase();
      this._typedChars += typedCharacter; // We check if we have more than one characters and they are all duplicate, we set the
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
        const nextIndex = this._filteredItems.indexOf(itemToSelect);

        this._changeSelectedItem(this._selectedIndex, nextIndex);

        if (currentIndex !== this._selectedIndex) {
          this.itemSelectionAnnounce();
        }
      }
    }

    _searchNextItemByText(text) {
      let orderedOptions = this._filteredItems.slice(0);

      const optionsAfterSelected = orderedOptions.splice(this._selectedIndex + 1, orderedOptions.length - this._selectedIndex);
      const optionsBeforeSelected = orderedOptions.splice(0, orderedOptions.length - 1);
      orderedOptions = optionsAfterSelected.concat(optionsBeforeSelected);
      return orderedOptions.find(option => option.textContent.toLowerCase().startsWith(text));
    }

    _handleHomeKey(event) {
      event.preventDefault();

      this._changeSelectedItem(this._selectedIndex, 0);
    }

    _handleEndKey(event) {
      const lastIndex = this._filteredItems.length - 1;
      event.preventDefault();

      this._changeSelectedItem(this._selectedIndex, lastIndex);
    }

    _onkeyup(event) {
      if ((0, _Keys.isSpace)(event)) {
        if (this._isPickerOpen) {
          this._handleSelectionChange();
        } else {
          this._toggleRespPopover();
        }
      }
    }

    _getSelectedItemIndex(item) {
      return this._filteredItems.findIndex(option => `${option._id}-li` === item.id);
    }

    _select(index) {
      this._filteredItems[this._selectedIndex].selected = false;
      this._selectedIndex = index;
      this._filteredItems[index].selected = true;
    }
    /**
     * The user clicked on an item from the list
     * @private
     */


    _handleItemPress(event) {
      const item = event.detail.selectedItems[0];

      const selectedItemIndex = this._getSelectedItemIndex(item);

      this._handleSelectionChange(selectedItemIndex);
    }

    _itemMousedown(event) {
      // prevent actual focus of items
      event.preventDefault();
    }

    _onclick(event) {
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

    _handleArrowNavigation(event) {
      let nextIndex = -1;
      const currentIndex = this._selectedIndex;
      const isDownKey = (0, _Keys.isDown)(event);
      event.preventDefault();

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
      }
    }

    _changeSelectedItem(oldIndex, newIndex) {
      const options = this._filteredItems;
      options[oldIndex].selected = false;
      options[oldIndex]._focused = false;
      options[newIndex].selected = true;
      options[newIndex]._focused = true;
      this._selectedIndex = newIndex;

      if (!this._isPickerOpen) {
        // arrow pressed on closed picker - do selection change
        this._fireChangeEvent(options[newIndex]);
      }
    }

    _getNextOptionIndex() {
      return this._selectedIndex === this.options.length - 1 ? this._selectedIndex : this._selectedIndex + 1;
    }

    _getPreviousOptionIndex() {
      return this._selectedIndex === 0 ? this._selectedIndex : this._selectedIndex - 1;
    }

    _beforeOpen() {
      this._selectedIndexBeforeOpen = this._selectedIndex;
      this._lastSelectedOption = this._filteredItems[this._selectedIndex];
      this.focused = false;
    }

    _afterOpen() {
      this.opened = true;
    }

    _afterClose() {
      this.opened = false;
      this.focused = true;
      this._iconPressed = false;
      this._listWidth = 0;

      if (this._escapePressed) {
        this._select(this._selectedIndexBeforeOpen);

        this._escapePressed = false;
      } else if (this._lastSelectedOption !== this._filteredItems[this._selectedIndex]) {
        this._fireChangeEvent(this._filteredItems[this._selectedIndex]);

        this._lastSelectedOption = this._filteredItems[this._selectedIndex];
      }
    }

    _fireChangeEvent(selectedOption) {
      this.fireEvent("change", {
        selectedOption
      }); //  Angular two way data binding

      this.selectedItem = selectedOption.textContent;
      this.fireEvent("selected-item-changed");
    }

    get valueStateTextMappings() {
      return {
        "Success": Select.i18nBundle.getText(_i18nDefaults.VALUE_STATE_SUCCESS),
        "Information": Select.i18nBundle.getText(_i18nDefaults.VALUE_STATE_INFORMATION),
        "Error": Select.i18nBundle.getText(_i18nDefaults.VALUE_STATE_ERROR),
        "Warning": Select.i18nBundle.getText(_i18nDefaults.VALUE_STATE_WARNING)
      };
    }

    get valueStateText() {
      return this.valueStateTextMappings[this.valueState];
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
      return Select.i18nBundle.getText(_i18nDefaults.INPUT_SUGGESTIONS_TITLE);
    }

    get _currentSelectedItem() {
      return this.shadowRoot.querySelector(`#${this._filteredItems[this._selectedIndex]._id}-li`);
    }

    get _currentlySelectedOption() {
      return this._filteredItems[this._selectedIndex];
    }

    get tabIndex() {
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
      return !this.valueStateMessage.length && this.hasValueStateText;
    }

    get hasValueStateText() {
      return this.hasValueState && this.valueState !== _ValueState.default.Success;
    }

    get shouldOpenValueStateMessagePopover() {
      return this.focused && this.hasValueStateText && !this._iconPressed && !this._isPickerOpen && !this._isPhone;
    }

    get _ariaRoleDescription() {
      return Select.i18nBundle.getText(_i18nDefaults.SELECT_ROLE_DESCRIPTION);
    }

    get _isPhone() {
      return (0, _Device.isPhone)();
    }

    get _filteredItems() {
      return this.options.filter(option => !option.disabled);
    }

    itemSelectionAnnounce() {
      let text;
      const optionsCount = this._filteredItems.length;
      const itemPositionText = Select.i18nBundle.getText(_i18nDefaults.LIST_ITEM_POSITION, this._selectedIndex + 1, optionsCount);

      if (this.focused && this._currentlySelectedOption) {
        text = `${this._currentlySelectedOption.textContent} ${this._isPickerOpen ? itemPositionText : ""}`;
        (0, _InvisibleMessage.default)(text, "Polite");
      }
    }

    async openValueStatePopover() {
      this.popover = await this._getPopover();

      if (this.popover) {
        this.popover.showAt(this);
      }
    }

    closeValueStatePopover() {
      this.popover && this.popover.close();
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

    static get dependencies() {
      return [_Option.default, _Label.default, _ResponsivePopover.default, _Popover.default, _List.default, _StandardListItem.default, _Icon.default, _Button.default];
    }

    static async onDefine() {
      Select.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }

  }

  Select.define();
  var _default = Select;
  _exports.default = _default;
});