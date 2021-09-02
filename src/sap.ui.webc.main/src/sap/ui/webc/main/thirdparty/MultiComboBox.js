sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/types/ValueState', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-down', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/icons/decline', 'sap/ui/webc/common/thirdparty/icons/multiselect-all', './MultiComboBoxItem', './Tokenizer', './Token', './Icon', './Popover', './ResponsivePopover', './List', './StandardListItem', './ToggleButton', './ComboBoxFilters-f59100bd', './Button', './generated/i18n/i18n-defaults', './generated/templates/MultiComboBoxTemplate.lit', './generated/templates/MultiComboBoxPopoverTemplate.lit', './generated/themes/MultiComboBox.css', './generated/themes/ResponsivePopoverCommon.css', './generated/themes/ValueStateMessage.css'], function (UI5Element, litRender, ResizeHandler, ValueState, Keys, Integer, slimArrowDown, Device, i18nBundle, decline, multiselectAll, MultiComboBoxItem, Tokenizer, Token, Icon, Popover, ResponsivePopover, List, StandardListItem, ToggleButton, ComboBoxFilters, Button, i18nDefaults, MultiComboBoxTemplate_lit, MultiComboBoxPopoverTemplate_lit, MultiComboBox_css, ResponsivePopoverCommon_css, ValueStateMessage_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var ValueState__default = /*#__PURE__*/_interopDefaultLegacy(ValueState);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);

	const metadata = {
		tag: "ui5-multi-combobox",
		languageAware: true,
		managedSlots: true,
		slots:  {
			"default": {
				propertyName: "items",
				type: HTMLElement,
				invalidateOnChildChange: true,
			},
			icon: {
				type: HTMLElement,
			},
			valueStateMessage: {
				type: HTMLElement,
			},
		},
		properties:  {
			value: {
				type: String,
				defaultValue: "",
			},
			placeholder: {
				type: String,
				defaultValue: "",
			},
			allowCustomValues: {
				type: Boolean,
			},
			disabled: {
				type: Boolean,
			},
			valueState: {
				type: ValueState__default,
				defaultValue: ValueState__default.None,
			},
			readonly: {
				type: Boolean,
			},
			required: {
				type: Boolean,
			},
			filter: {
				type: String,
				defaultValue: "StartsWithPerTerm",
			},
			open: {
				type: Boolean,
			},
			_filteredItems: {
				type: Object,
			},
			filterSelected: {
				type: Boolean,
			},
			focused: {
				type: Boolean,
			},
			_tokenizerFocused: {
				type: Boolean,
			},
			_iconPressed: {
				type: Boolean,
				noAttribute: true,
			},
			_inputWidth: {
				type: Integer__default,
				noAttribute: true,
			},
			_listWidth: {
				type: Integer__default,
				defaultValue: 0,
				noAttribute: true,
			},
		},
		events:  {
			change: {},
			input: {},
			"open-change": {},
			"selection-change": {
				detail: {
					items: { type: Array },
				},
			},
		},
	};
	class MultiComboBox extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return MultiComboBoxTemplate_lit;
		}
		static get staticAreaTemplate() {
			return MultiComboBoxPopoverTemplate_lit;
		}
		static get styles() {
			return MultiComboBox_css;
		}
		static get staticAreaStyles() {
			return [ResponsivePopoverCommon_css, ValueStateMessage_css];
		}
		static get dependencies() {
			return [
				MultiComboBoxItem,
				Tokenizer,
				Token,
				Icon,
				ResponsivePopover,
				Popover,
				List,
				StandardListItem,
				ToggleButton,
				Button,
			];
		}
		constructor() {
			super();
			this._filteredItems = [];
			this.selectedValues = [];
			this._inputLastValue = "";
			this._deleting = false;
			this._validationTimeout = null;
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
			this._handleResizeBound = this._handleResize.bind(this);
		}
		onEnterDOM() {
			ResizeHandler__default.register(this, this._handleResizeBound);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this, this._handleResizeBound);
		}
		_handleResize() {
			this._inputWidth = this.offsetWidth;
		}
		_inputChange() {
			this.fireEvent("change");
		}
		_showMorePopover() {
			this.filterSelected = true;
			this._toggleRespPopover();
		}
		togglePopover() {
			if (!Device.isPhone()) {
				this._inputDom.focus();
			}
			this._toggleRespPopover();
		}
		filterSelectedItems(event) {
			if (this.allItemsSelected) {
				this.filterSelected = true;
				return;
			}
			this.filterSelected = event.target.pressed;
		}
		get _showAllItemsButtonPressed() {
			return this.filterSelected || this.allItemsSelected;
		}
		get allItemsSelected() {
			return this.items.length === this.selectedValues.length;
		}
		get _inputDom() {
			return this.shadowRoot.querySelector("#ui5-multi-combobox-input");
		}
		_inputLiveChange(event) {
			const input = event.target;
			const value = input.value;
			const filteredItems = this._filterItems(value);
			const oldValueState = this.valueState;
			const skipFiring = (this._inputDom.value === this.value) && Device.isIE() && !this._keyDown && !!this.placeholder;
			if (skipFiring) {
				event.preventDefault();
				return;
			}
			if (this._validationTimeout) {
				input.value = this._inputLastValue;
				return;
			}
			if (!filteredItems.length && value && !this.allowCustomValues) {
				input.value = this._inputLastValue;
				this.valueState = "Error";
				this._validationTimeout = setTimeout(() => {
					this.valueState = oldValueState;
					this._validationTimeout = null;
				}, 2000);
				return;
			}
			this._inputLastValue = input.value;
			this.value = input.value;
			this._filteredItems = filteredItems;
			if (!Device.isPhone()) {
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
			if (this._tokenizer && this._tokenizer.tokens.length) {
				return "";
			}
			return this.placeholder;
		}
		_handleLeft() {
			const cursorPosition = this.getDomRef().querySelector(`input`).selectionStart;
			if (cursorPosition === 0) {
				this._tokenizer._focusLastToken();
			}
		}
		_tokenizerFocusOut(event) {
			this._tokenizerFocused = false;
			const tokensCount = this._tokenizer.tokens.length - 1;
			if (!event.relatedTarget || event.relatedTarget.localName !== "ui5-token") {
				this._tokenizer.tokens.forEach(token => { token.selected = false; });
				this._tokenizer.scrollToStart();
			}
			if (tokensCount === 0 && this._deleting) {
				setTimeout(() => {
					if (!Device.isPhone()) {
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
		_onkeyup() {
			this._keyDown = false;
		}
		async _onkeydown(event) {
			if (Keys.isLeft(event)) {
				this._handleLeft(event);
			}
			if (Keys.isShow(event) && !this.readonly && !this.disabled) {
				event.preventDefault();
				this._toggleRespPopover();
			}
			if (Keys.isDown(event) && this.allItemsPopover.opened && this.items.length) {
				event.preventDefault();
				await this._getList();
				const firstListItem = this.list.items[0];
				this.list._itemNavigation.setCurrentItem(firstListItem);
				firstListItem.focus();
			}
			if (Keys.isBackSpace(event) && event.target.value === "") {
				event.preventDefault();
				this._tokenizer._focusLastToken();
			}
			this._keyDown = true;
		}
		_onTokenizerKeydown(event) {
			if (Keys.isRight(event)) {
				const lastTokenIndex = this._tokenizer.tokens.length - 1;
				if (this._tokenizer.tokens[lastTokenIndex] === document.activeElement.shadowRoot.activeElement) {
					setTimeout(() => {
						this.shadowRoot.querySelector("input").focus();
					}, 0);
				}
			}
		}
		_filterItems(str) {
			return (ComboBoxFilters.Filters[this.filter] || ComboBoxFilters.StartsWithPerTerm)(str, this.items);
		}
		_toggle() {
			this.open = !this.open;
			this.fireEvent("open-change");
			if (!this.open) {
				this._afterClosePopover();
			}
		}
		_getSelectedItems() {
			this.selectedValues = this.items.filter(item => item.selected);
			return this.selectedValues;
		}
		_listSelectionChange(event) {
			event.target.items.forEach(item => {
				this.items.forEach(mcbItem => {
					if (mcbItem._id === item.getAttribute("data-ui5-token-id")) {
						mcbItem.selected = item.selected;
					}
				});
			});
			this.fireSelectionChange();
			if (!event.detail.selectionComponentPressed && !Keys.isSpace(event.detail)) {
				this.allItemsPopover.close();
				this.value = "";
				this.fireEvent("input");
			}
		}
		fireSelectionChange() {
			this.fireEvent("selection-change", { items: this._getSelectedItems() });
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
		_toggleRespPopover() {
			this.allItemsPopover.toggle(this);
		}
		_click(event) {
			if (Device.isPhone() && !this.readonly && !this._showMorePressed) {
				this.allItemsPopover.showAt(this);
			}
			this._showMorePressed = false;
		}
		_afterClosePopover() {
			if (Device.isPhone()) {
				this.blur();
			}
			this._iconPressed = false;
			this.filterSelected = false;
		}
		onBeforeRendering() {
			const input = this.shadowRoot.querySelector("input");
			this._inputLastValue = this.value;
			if (input && !input.value) {
				this._filteredItems = this.items;
			}
			const filteredItems = this._filterItems(this.value);
			this._filteredItems = filteredItems;
			if (Device.isPhone() && this.allItemsPopover && this.allItemsPopover.opened) {
				this.allItemsPopover.focus();
			}
		}
		async onAfterRendering() {
			await this._getRespPopover();
			await this._getList();
			this.toggle(this.shouldDisplayOnlyValueStateMessage);
			this.storeResponsivePopoverWidth();
		}
		get _isPhone() {
			return Device.isPhone();
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
		async openPopover() {
			const popover = await this._getPopover();
			if (popover) {
				popover.showAt(this);
			}
		}
		async closePopover() {
			const popover = await this._getPopover();
			popover && popover.close();
		}
		async _getPopover() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			return staticAreaItem.querySelector("[ui5-popover]");
		}
		get _tokenizer() {
			return this.shadowRoot.querySelector("[ui5-tokenizer]");
		}
		inputFocusIn() {
			if (!Device.isPhone()) {
				this.focused = true;
			}
		}
		inputFocusOut(event) {
			if (!this.shadowRoot.contains(event.relatedTarget) && !this._deleting) {
				this.focused = false;
			}
		}
		get editable() {
			return !this.readonly;
		}
		get _isFocusInside() {
			return this.focused || this._tokenizerFocused;
		}
		get selectedItemsListMode() {
			return this.readonly ? "None" : "MultiSelect";
		}
		get _listItemsType() {
			return this.readonly ? "Inactive" : "Active";
		}
		get hasValueState() {
			return this.valueState !== ValueState__default.None;
		}
		get hasValueStateMessage() {
			return this.hasValueState && this.valueState !== ValueState__default.Success;
		}
		get valueStateText() {
			return this.valueStateTextMappings[this.valueState];
		}
		get valueStateTextId() {
			return this.hasValueState ? `${this._id}-valueStateDesc` : undefined;
		}
		get valueStateMessageText() {
			return this.getSlottedNodes("valueStateMessage").map(el => el.cloneNode(true));
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
		get ariaDescribedByText() {
			return this.valueStateTextId ? `${this._tokensCountTextId} ${this.valueStateTextId}` : `${this._tokensCountTextId}`;
		}
		get shouldDisplayDefaultValueStateMessage() {
			return !this.valueStateMessage.length && this.hasValueStateMessage;
		}
		get shouldDisplayOnlyValueStateMessage() {
			return this.focused && this.hasValueStateMessage && !this._iconPressed;
		}
		get valueStateTextMappings() {
			return {
				"Success": this.i18nBundle.getText(i18nDefaults.VALUE_STATE_SUCCESS),
				"Error": this.i18nBundle.getText(i18nDefaults.VALUE_STATE_ERROR),
				"Warning": this.i18nBundle.getText(i18nDefaults.VALUE_STATE_WARNING),
			};
		}
		get _innerInput() {
			if (Device.isPhone()) {
				if (this.allItemsPopover.opened) {
					return this.allItemsPopover.querySelector("input");
				}
			}
			return this.getDomRef().querySelector("#ui5-multi-combobox-input");
		}
		get _headerTitleText() {
			return this.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_TITLE);
		}
		get _iconAccessibleNameText() {
			return this.i18nBundle.getText(i18nDefaults.SELECT_OPTIONS);
		}
		get _dialogOkButton() {
			return this.i18nBundle.getText(i18nDefaults.MULTICOMBOBOX_DIALOG_OK_BUTTON);
		}
		get _tokenizerExpanded() {
			return (this._isFocusInside || this.open) && !this.readonly;
		}
		get classes() {
			return {
				popoverValueState: {
					"ui5-valuestatemessage-root": true,
					"ui5-valuestatemessage--success": this.valueState === ValueState__default.Success,
					"ui5-valuestatemessage--error": this.valueState === ValueState__default.Error,
					"ui5-valuestatemessage--warning": this.valueState === ValueState__default.Warning,
					"ui5-valuestatemessage--information": this.valueState === ValueState__default.Information,
				},
			};
		}
		get styles() {
			return {
				popoverValueStateMessage: {
					"width": `${this._listWidth}px`,
					"display": this._listWidth === 0 ? "none" : "inline-block",
					"padding": "0.9125rem 1rem",
				},
				popoverHeader: {
					"max-width": `${this._inputWidth}px`,
				},
			};
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
	}
	MultiComboBox.define();

	return MultiComboBox;

});
