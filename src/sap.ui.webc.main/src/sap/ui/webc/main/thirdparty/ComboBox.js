sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/types/ValueState', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper', 'sap/ui/webc/common/thirdparty/base/util/InvisibleMessage', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-down', 'sap/ui/webc/common/thirdparty/icons/decline', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/Keys', './ComboBoxFilters-f59100bd', './generated/i18n/i18n-defaults', './generated/templates/ComboBoxTemplate.lit', './generated/templates/ComboBoxPopoverTemplate.lit', './generated/themes/ComboBox.css', './generated/themes/ComboBoxPopover.css', './generated/themes/ResponsivePopoverCommon.css', './generated/themes/ValueStateMessage.css', './ComboBoxItem', './Icon', './Popover', './ResponsivePopover', './List', './BusyIndicator', './Button', './StandardListItem'], function (UI5Element, litRender, ValueState, Device, Integer, AriaLabelHelper, announce, slimArrowDown, decline, i18nBundle, Keys, ComboBoxFilters, i18nDefaults, ComboBoxTemplate_lit, ComboBoxPopoverTemplate_lit, ComboBox_css, ComboBoxPopover_css, ResponsivePopoverCommon_css, ValueStateMessage_css, ComboBoxItem, Icon, Popover, ResponsivePopover, List, BusyIndicator, Button, StandardListItem) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ValueState__default = /*#__PURE__*/_interopDefaultLegacy(ValueState);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var announce__default = /*#__PURE__*/_interopDefaultLegacy(announce);

	const metadata = {
		tag: "ui5-combobox",
		languageAware: true,
		properties:  {
			value: {
				type: String,
				defaultValue: "",
			},
			filterValue: {
				type: String,
				defaultValue: "",
			},
			placeholder: {
				type: String,
				defaultValue: "",
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
			loading: {
				type: Boolean,
			},
			filter: {
				type: String,
				defaultValue: "StartsWithPerTerm",
			},
			focused: {
				type: Boolean,
			},
			ariaLabel: {
				type: String,
				defaultValue: undefined,
			},
			ariaLabelledby: {
				type: String,
				defaultValue: "",
			},
			_iconPressed: {
				type: Boolean,
				noAttribute: true,
			},
			_tempValue: {
				type: String,
				defaultValue: "",
			},
			_filteredItems: {
				type: Object,
			},
			_listWidth: {
				type: Integer__default,
				defaultValue: 0,
				noAttribute: true,
			},
		},
		managedSlots: true,
		slots:  {
			"default": {
				propertyName: "items",
				type: HTMLElement,
				invalidateOnChildChange: true,
			},
			valueStateMessage: {
				type: HTMLElement,
			},
			icon: {
				type: HTMLElement,
			},
		},
		events:  {
			change: {},
			input: {},
			"selection-change": {
				detail: {
					item: { type: HTMLElement },
				},
			},
		},
	};
	class ComboBox extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return ComboBox_css;
		}
		static get staticAreaStyles() {
			return [ResponsivePopoverCommon_css, ValueStateMessage_css, ComboBoxPopover_css];
		}
		static get template() {
			return ComboBoxTemplate_lit;
		}
		static get staticAreaTemplate() {
			return ComboBoxPopoverTemplate_lit;
		}
		constructor(props) {
			super(props);
			this._filteredItems = [];
			this._initialRendering = true;
			this._itemFocused = false;
			this._tempFilterValue = "";
			this._selectionChanged = false;
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		onBeforeRendering() {
			let domValue;
			if (this._initialRendering) {
				domValue = this.value;
				this._filteredItems = this.items;
			} else {
				domValue = this.filterValue;
			}
			if (this._autocomplete && domValue !== "") {
				const item = this._autoCompleteValue(domValue);
				if (!this._selectionChanged && (item && !item.selected)) {
					this.fireEvent("selection-change", {
						item,
					});
					this._selectionChanged = false;
				}
			} else {
				this._tempValue = domValue;
			}
			if (!this._initialRendering && this.popover && document.activeElement === this && !this._filteredItems.length) {
				this.popover.close();
			}
			this._selectMatchingItem();
			if (this._isKeyNavigation && this.responsivePopover && this.responsivePopover.opened) {
				this.focused = false;
			} else if (this.shadowRoot.activeElement) {
				this.focused = this.shadowRoot.activeElement.id === "ui5-combobox-input";
			}
			this._initialRendering = false;
			this._isKeyNavigation = false;
		}
		async onAfterRendering() {
			await this._respPopover();
			if (Device.isPhone() && this.responsivePopover.opened) {
				this.inner.focus();
			}
			if (this.shouldClosePopover() && !Device.isPhone()) {
				this.responsivePopover.close(false, false, true);
			}
			this._itemFocused = false;
			this.toggleValueStatePopover(this.shouldOpenValueStateMessagePopover);
			this.storeResponsivePopoverWidth();
		}
		shouldClosePopover() {
			return this.responsivePopover.opened && !this.focused && !this._itemFocused;
		}
		_focusin(event) {
			this.focused = true;
			if (this.filterValue !== this.value) {
				this.filterValue = this.value;
			}
			!Device.isPhone() && event.target.setSelectionRange(0, this.value.length);
		}
		_focusout() {
			this.focused = false;
			this._inputChange();
			!Device.isPhone() && this._closeRespPopover();
		}
		_afterOpenPopover() {
			this._iconPressed = true;
			if (Device.isPhone() && this.value) {
				this.filterValue = this.value;
			}
			this._clearFocus();
		}
		_afterClosePopover() {
			this._iconPressed = false;
			this._filteredItems = this.items;
			this._tempFilterValue = "";
			if (Device.isPhone()) {
				this.blur();
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
			this.popover && this.popover.openBy(this);
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
			this._filteredItems = this._filterItems("");
			this._selectMatchingItem();
		}
		_arrowClick() {
			this.inner.focus();
			this._resetFilter();
			this._toggleRespPopover();
		}
		_input(event) {
			const { value } = event.target;
			if (event.target === this.inner) {
				event.stopImmediatePropagation();
			}
			this._clearFocus();
			this._tempFilterValue = value;
			this.filterValue = value;
			this.fireEvent("input");
			this._filteredItems = this._filterItems(value);
			if (Device.isPhone()) {
				return;
			}
			if (!this._filteredItems.length) {
				this._closeRespPopover();
			} else {
				this._openRespPopover();
			}
		}
		_startsWithMatchingItems(str) {
			return ComboBoxFilters.StartsWith(str, this._filteredItems);
		}
		_clearFocus() {
			this._filteredItems.map(item => {
				item.focused = false;
				return item;
			});
		}
		handleArrowKeyPress(event) {
			if (this.readonly || !this._filteredItems.length) {
				return;
			}
			const isArrowDown = Keys.isDown(event);
			const isArrowUp = Keys.isUp(event);
			const currentItem = this._filteredItems.find(item => {
				return this.responsivePopover.opened ? item.focused : item.selected;
			});
			let indexOfItem = this._filteredItems.indexOf(currentItem);
			event.preventDefault();
			if ((indexOfItem === 0 && isArrowUp) || (this._filteredItems.length - 1 === indexOfItem && isArrowDown)) {
				return;
			}
			this._clearFocus();
			indexOfItem += isArrowDown ? 1 : -1;
			indexOfItem = indexOfItem < 0 ? 0 : indexOfItem;
			if (this.responsivePopover.opened) {
				this.announceSelectedItem(indexOfItem);
			}
			this._filteredItems[indexOfItem].focused = true;
			this.filterValue = this._filteredItems[indexOfItem].text;
			this._isKeyNavigation = true;
			this._itemFocused = true;
			this.fireEvent("input");
			this.fireEvent("selection-change", {
				item: this._filteredItems[indexOfItem],
			});
			this._selectionChanged = true;
		}
		_keydown(event) {
			const isArrowKey = Keys.isDown(event) || Keys.isUp(event);
			this._autocomplete = !(Keys.isBackSpace(event) || Keys.isDelete(event));
			if (isArrowKey) {
				this.handleArrowKeyPress(event);
			}
			if (Keys.isEnter(event)) {
				this._inputChange();
				this._closeRespPopover();
			}
			if (Keys.isShow(event) && !this.readonly && !this.disabled) {
				event.preventDefault();
				this._resetFilter();
				this._toggleRespPopover();
			}
		}
		_click(event) {
			if (Device.isPhone() && !this.readonly) {
				this._openRespPopover();
			}
		}
		_closeRespPopover(event) {
			if (Device.isPhone() && event && event.target.classList.contains("ui5-responsive-popover-close-btn") && this._selectedItemText) {
				this.value = this._selectedItemText;
				this.filterValue = this._selectedItemText;
				this._tempValue = this._selectedItemText;
			}
			this.responsivePopover.close();
		}
		_openRespPopover() {
			this.responsivePopover.open(this);
		}
		_filterItems(str) {
			return (ComboBoxFilters.Filters[this.filter] || ComboBoxFilters.StartsWithPerTerm)(str, this.items);
		}
		_autoCompleteValue(current) {
			const currentValue = current;
			const matchingItems = this._startsWithMatchingItems(currentValue);
			const selectionValue = this._tempFilterValue ? this._tempFilterValue : currentValue;
			if (matchingItems.length) {
				this._tempValue = matchingItems[0] ? matchingItems[0].text : current;
			} else {
				this._tempValue = current;
			}
			if (matchingItems.length && (selectionValue !== this._tempValue && this.value !== this._tempValue)) {
				setTimeout(() => {
					this.inner.setSelectionRange(selectionValue.length, this._tempValue.length);
				}, 0);
			} else if (this._isKeyNavigation) {
				setTimeout(() => {
					this.inner.setSelectionRange(0, this._tempValue.length);
				}, 0);
			}
			if (matchingItems.length) {
				return matchingItems[0];
			}
		}
		_selectMatchingItem() {
			this._filteredItems = this._filteredItems.map(item => {
				item.selected = (item.text === this._tempValue);
				return item;
			});
		}
		_inputChange() {
			if (this.value !== this._tempValue) {
				this.value = this._tempValue;
				this.fireEvent("change");
				this.inner.setSelectionRange(this.value.length, this.value.length);
			}
		}
		_itemMousedown(event) {
			event.preventDefault();
		}
		_selectItem(event) {
			const listItem = event.detail.item;
			this._tempValue = listItem.mappedItem.text;
			this._selectedItemText = listItem.mappedItem.text;
			this.filterValue = this._tempValue;
			if (!listItem.mappedItem.selected) {
				this.fireEvent("selection-change", {
					item: listItem.mappedItem,
				});
				this._selectionChanged = true;
			}
			this._filteredItems.map(item => {
				item.selected = (item === listItem.mappedItem);
				return item;
			});
			this._inputChange();
			this._closeRespPopover();
		}
		_onItemFocus(event) {
			this._itemFocused = true;
		}
		announceSelectedItem(indexOfItem) {
			const itemPositionText = this.i18nBundle.getText(i18nDefaults.LIST_ITEM_POSITION, [indexOfItem + 1], [this._filteredItems.length]);
			const itemSelectionText = this.i18nBundle.getText(i18nDefaults.LIST_ITEM_SELECTED);
			announce__default(`${itemPositionText} ${itemSelectionText}`, "Polite");
		}
		get _headerTitleText() {
			return this.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_TITLE);
		}
		get _iconAccessibleNameText() {
			return this.i18nBundle.getText(i18nDefaults.SELECT_OPTIONS);
		}
		get inner() {
			return Device.isPhone() ? this.responsivePopover.querySelector(".ui5-input-inner-phone") : this.shadowRoot.querySelector("[inner-input]");
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
			return this.valueState !== ValueState__default.None;
		}
		get hasValueStateText() {
			return this.hasValueState && this.valueState !== ValueState__default.Success;
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
				"Success": this.i18nBundle.getText(i18nDefaults.VALUE_STATE_SUCCESS),
				"Error": this.i18nBundle.getText(i18nDefaults.VALUE_STATE_ERROR),
				"Warning": this.i18nBundle.getText(i18nDefaults.VALUE_STATE_WARNING),
				"Information": this.i18nBundle.getText(i18nDefaults.VALUE_STATE_INFORMATION),
			};
		}
		get shouldOpenValueStateMessagePopover() {
			return this.focused && this.hasValueStateText && !this._iconPressed
				&& !this.open && !this._isPhone;
		}
		get shouldDisplayDefaultValueStateMessage() {
			return !this.valueStateMessage.length && this.hasValueStateText;
		}
		get open() {
			return this.responsivePopover ? this.responsivePopover.opened : false;
		}
		get _isPhone() {
			return Device.isPhone();
		}
		get itemTabIndex() {
			return undefined;
		}
		get ariaLabelText() {
			return AriaLabelHelper.getEffectiveAriaLabelText(this);
		}
		static get dependencies() {
			return [
				ComboBoxItem,
				Icon,
				ResponsivePopover,
				List,
				BusyIndicator,
				Button,
				StandardListItem,
				Popover,
			];
		}
		get styles() {
			return {
				popoverHeader: {
					"width": `${this.offsetWidth}px`,
				},
				suggestionPopoverHeader: {
					"display": this._listWidth === 0 ? "none" : "inline-block",
					"width": `${this._listWidth}px`,
					"padding": "0.9125rem 1rem",
				},
			};
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
	}
	ComboBox.define();

	return ComboBox;

});
