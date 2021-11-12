sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/types/ValueState', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper', 'sap/ui/webc/common/thirdparty/base/util/InvisibleMessage', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-down', 'sap/ui/webc/common/thirdparty/icons/decline', 'sap/ui/webc/common/thirdparty/icons/not-editable', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/Keys', './ComboBoxFilters-f59100bd', './generated/i18n/i18n-defaults', './generated/templates/ComboBoxTemplate.lit', './generated/templates/ComboBoxPopoverTemplate.lit', './generated/themes/ComboBox.css', './generated/themes/ComboBoxPopover.css', './generated/themes/ResponsivePopoverCommon.css', './generated/themes/ValueStateMessage.css', './generated/themes/Suggestions.css', './ComboBoxItem', './Icon', './Popover', './ResponsivePopover', './List', './BusyIndicator', './Button', './StandardListItem', './ComboBoxGroupItem'], function (UI5Element, litRender, ValueState, Device, Integer, AriaLabelHelper, announce, slimArrowDown, decline, notEditable, i18nBundle, Keys, ComboBoxFilters, i18nDefaults, ComboBoxTemplate_lit, ComboBoxPopoverTemplate_lit, ComboBox_css, ComboBoxPopover_css, ResponsivePopoverCommon_css, ValueStateMessage_css, Suggestions_css, ComboBoxItem, Icon, Popover, ResponsivePopover, List, BusyIndicator, Button, StandardListItem, ComboBoxGroupItem) { 'use strict';

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
			_isValueStateFocused: {
				type: Boolean,
			},
			accessibleName: {
				type: String,
				defaultValue: undefined,
			},
			accessibleNameRef: {
				type: String,
				defaultValue: "",
			},
			_iconPressed: {
				type: Boolean,
				noAttribute: true,
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
			return [ResponsivePopoverCommon_css, ValueStateMessage_css, ComboBoxPopover_css, Suggestions_css];
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
			this._selectionChanged = false;
		}
		onBeforeRendering() {
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
			if (Device.isPhone() && this.responsivePopover.opened) {
				this.inner.focus();
			}
			if (this.shouldClosePopover() && !Device.isPhone()) {
				this.responsivePopover.close(false, false, true);
				this._clearFocus();
				this._itemFocused = false;
			}
			this.toggleValueStatePopover(this.shouldOpenValueStateMessagePopover);
			this.storeResponsivePopoverWidth();
			if (Device.isSafari() && this._autocomplete && this.filterValue !== this.value) {
				this.inner.setSelectionRange(
					(this._isKeyNavigation ? 0 : this.filterValue.length),
					this.value.length,
				);
			}
		}
		shouldClosePopover() {
			return this.responsivePopover.opened && !this.focused && !this._itemFocused && !this._isValueStateFocused;
		}
		_focusin(event) {
			this.focused = true;
			this._lastValue = this.value;
			this._autocomplete = false;
			!Device.isPhone() && event.target.setSelectionRange(0, this.value.length);
		}
		_focusout(event) {
			const focusedOutToValueStateMessage = event.relatedTarget && event.relatedTarget.shadowRoot && event.relatedTarget.shadowRoot.querySelector(".ui5-valuestatemessage-root");
			this._fireChangeEvent();
			if (focusedOutToValueStateMessage) {
				event.stopImmediatePropagation();
				return;
			}
			if (!this.shadowRoot.contains(event.relatedTarget)) {
				this.focused = false;
				!Device.isPhone() && this._closeRespPopover(event);
			}
		}
		_afterOpenPopover() {
			this._iconPressed = true;
		}
		_afterClosePopover() {
			this._iconPressed = false;
			this._filteredItems = this.items;
			if (Device.isPhone()) {
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
			this._filteredItems = this._filterItems("");
			this._selectMatchingItem();
		}
		_arrowClick() {
			this.inner.focus();
			this._resetFilter();
			this._toggleRespPopover();
		}
		_readonlyIconClick() {
			this.inner.focus();
		}
		_input(event) {
			const { value } = event.target;
			if (event.target === this.inner) {
				event.stopImmediatePropagation();
				this.focused = true;
				this._isValueStateFocused = false;
			}
			this._filteredItems = this._filterItems(value);
			this.value = value;
			this.filterValue = value;
			this._clearFocus();
			if (this._autocomplete) {
				const item = this._getFirstMatchingItem(value);
				this._applyAtomicValueAndSelection(item, value, true);
				if (value !== "" && !this._selectionChanged && (item && !item.selected && !item.isGroupItem)) {
					this.fireEvent("selection-change", {
						item,
					});
					this._selectionChanged = false;
				}
			}
			this.fireEvent("input");
			if (Device.isPhone()) {
				return;
			}
			if (!this._filteredItems.length || value === "") {
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
		async handleArrowKeyPress(event) {
			if (this.readonly || !this._filteredItems.length) {
				return;
			}
			const isOpen = this.open;
			const isArrowDown = Keys.isDown(event);
			const isArrowUp = Keys.isUp(event);
			const currentItem = this._filteredItems.find(item => {
				return isOpen ? item.focused : item.selected;
			});
			const indexOfItem = this._filteredItems.indexOf(currentItem);
			event.preventDefault();
			if ((this.focused === true && isArrowUp && isOpen) || (this._filteredItems.length - 1 === indexOfItem && isArrowDown)) {
				return;
			}
			this._isKeyNavigation = true;
			if (isArrowDown) {
				this._handleArrowDown(event, indexOfItem);
			}
			if (isArrowUp) {
				this._handleArrowUp(event, indexOfItem);
			}
		}
		_handleItemNavigation(event, indexOfItem, isForward) {
			const isOpen = this.open;
			const currentItem = this._filteredItems[indexOfItem];
			const nextItem = isForward ? this._filteredItems[indexOfItem + 1] : this._filteredItems[indexOfItem - 1];
			const isGroupItem = currentItem && currentItem.isGroupItem;
			if ((!isOpen) && ((isGroupItem && !nextItem) || (!isGroupItem && !currentItem))) {
				return;
			}
			this._clearFocus();
			if (isOpen) {
				this._itemFocused = true;
				this.value = isGroupItem ? this.filterValue : currentItem.text;
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
			const item = this._getFirstMatchingItem(this.value);
			this._applyAtomicValueAndSelection(item, "", true);
			if ((item && !item.selected)) {
				this.fireEvent("selection-change", {
					item,
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
			this._handleItemNavigation(event, ++indexOfItem, true );
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
			this._handleItemNavigation(event, --indexOfItem, false );
		}
		_keydown(event) {
			const isArrowKey = Keys.isDown(event) || Keys.isUp(event);
			this._autocomplete = !(Keys.isBackSpace(event) || Keys.isDelete(event));
			this._isKeyNavigation = false;
			if (isArrowKey) {
				this.handleArrowKeyPress(event);
			}
			if (Keys.isEnter(event)) {
				this._fireChangeEvent();
				this._closeRespPopover();
				this.focused = true;
			}
			if (Keys.isEscape(event)) {
				this.focused = true;
				this.value = !this.open ? this._lastValue : this.value;
				this._isValueStateFocused = false;
			}
			if ((Keys.isTabNext(event) || Keys.isTabPrevious(event)) && this.open) {
				this._closeRespPopover();
			}
			if (Keys.isShow(event) && !this.readonly && !this.disabled) {
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
				} else {
					this.focused = true;
				}
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
			const filteredItems = (ComboBoxFilters.Filters[this.filter] || ComboBoxFilters.StartsWithPerTerm)(str, itemsToFilter);
			return this.items.filter((item, idx, allItems) => ComboBox._groupItemFilter(item, ++idx, allItems, filteredItems) || filteredItems.indexOf(item) !== -1);
		}
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
			const value = (item && item.text) || "";
			this.inner.value = value;
			if (highlightValue) {
				this.inner.setSelectionRange(filterValue.length, value.length);
			}
			this.value = value;
		}
		_selectMatchingItem() {
			const currentlyFocusedItem = this.items.find(item => item.focused);
			const shouldSelectionBeCleared = currentlyFocusedItem && currentlyFocusedItem.isGroupItem;
			this._filteredItems = this._filteredItems.map(item => {
				item.selected = !item.isGroupItem && (item.text === this.value) && !shouldSelectionBeCleared;
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
				return this._closeRespPopover();
			}
			this.value = this._selectedItemText;
			if (!listItem.mappedItem.selected) {
				this.fireEvent("selection-change", {
					item: listItem.mappedItem,
				});
				this._selectionChanged = true;
			}
			this._filteredItems.map(item => {
				item.selected = (item === listItem.mappedItem && !item.isGroupItem);
				return item;
			});
			this._fireChangeEvent();
			this._closeRespPopover();
			this.inner.setSelectionRange(this.value.length, this.value.length);
		}
		_onItemFocus(event) {
			this._itemFocused = true;
		}
		_announceSelectedItem(indexOfItem) {
			const itemPositionText = ComboBox.i18nBundle.getText(i18nDefaults.LIST_ITEM_POSITION, indexOfItem + 1, this._filteredItems.length);
			const itemSelectionText = ComboBox.i18nBundle.getText(i18nDefaults.LIST_ITEM_SELECTED);
			announce__default(`${itemPositionText} ${itemSelectionText}`, "Polite");
		}
		get _headerTitleText() {
			return ComboBox.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_TITLE);
		}
		get _iconAccessibleNameText() {
			return ComboBox.i18nBundle.getText(i18nDefaults.SELECT_OPTIONS);
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
				"Success": ComboBox.i18nBundle.getText(i18nDefaults.VALUE_STATE_SUCCESS),
				"Error": ComboBox.i18nBundle.getText(i18nDefaults.VALUE_STATE_ERROR),
				"Warning": ComboBox.i18nBundle.getText(i18nDefaults.VALUE_STATE_WARNING),
				"Information": ComboBox.i18nBundle.getText(i18nDefaults.VALUE_STATE_INFORMATION),
			};
		}
		get shouldOpenValueStateMessagePopover() {
			return this.focused && this.hasValueStateText && !this._iconPressed
				&& !this.open && !this._isPhone;
		}
		get shouldDisplayDefaultValueStateMessage() {
			return !this.valueStateMessage.length && this.hasValueStateText;
		}
		get _valueStateMessageIcon() {
			const iconPerValueState = {
				Error: "error",
				Warning: "alert",
				Success: "sys-enter-2",
				Information: "information",
			};
			return this.valueState !== ValueState__default.None ? iconPerValueState[this.valueState] : "";
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
				ComboBoxGroupItem,
			];
		}
		static async onDefine() {
			ComboBox.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		get styles() {
			return {
				popoverHeader: {
					"width": `${this.offsetWidth}px`,
				},
				suggestionPopoverHeader: {
					"display": this._listWidth === 0 ? "none" : "inline-block",
					"width": `${this._listWidth}px`,
				},
			};
		}
		get classes() {
			return {
				popover: {
					"ui5-suggestions-popover": !this.isPhone,
					"ui5-suggestions-popover-with-value-state-header": !this.isPhone && this.hasValueStateText,
				},
				popoverValueState: {
					"ui5-valuestatemessage-header": true,
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
