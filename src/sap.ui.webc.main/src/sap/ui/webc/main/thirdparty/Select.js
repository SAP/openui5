sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/util/InvisibleMessage', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/FeaturesRegistry', 'sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper', 'sap/ui/webc/common/thirdparty/base/types/ValueState', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-down', 'sap/ui/webc/common/thirdparty/icons/error', 'sap/ui/webc/common/thirdparty/icons/alert', 'sap/ui/webc/common/thirdparty/icons/sys-enter-2', 'sap/ui/webc/common/thirdparty/icons/information', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/icons/decline', './generated/i18n/i18n-defaults', './Option', './Label', './ResponsivePopover', './Popover', './List', './StandardListItem', './Icon', './Button', './generated/templates/SelectTemplate.lit', './generated/templates/SelectPopoverTemplate.lit', './generated/themes/Select.css', './generated/themes/ResponsivePopoverCommon.css', './generated/themes/ValueStateMessage.css', './generated/themes/SelectPopover.css'], function (UI5Element, litRender, Keys, announce, Integer, FeaturesRegistry, AriaLabelHelper, ValueState, slimArrowDown, error, alert, sysEnter2, information, Device, i18nBundle, decline, i18nDefaults, Option, Label, ResponsivePopover, Popover, List, StandardListItem, Icon, Button, SelectTemplate_lit, SelectPopoverTemplate_lit, Select_css, ResponsivePopoverCommon_css, ValueStateMessage_css, SelectPopover_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var announce__default = /*#__PURE__*/_interopDefaultLegacy(announce);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var ValueState__default = /*#__PURE__*/_interopDefaultLegacy(ValueState);

	const metadata = {
		tag: "ui5-select",
		languageAware: true,
		managedSlots: true,
		slots:  {
			"default": {
				propertyName: "options",
				type: HTMLElement,
				invalidateOnChildChange: true,
			},
			valueStateMessage: {
				type: HTMLElement,
			},
			formSupport: {
				type: HTMLElement,
			},
		},
		properties:   {
			disabled: {
				type: Boolean,
			},
			name: {
				type: String,
			},
			valueState: {
				type: ValueState__default,
				defaultValue: ValueState__default.None,
			},
			required: {
				type: Boolean,
			},
			accessibleName: {
				type: String,
			},
			accessibleNameRef: {
				type: String,
				defaultValue: "",
			},
			_text: {
				type: String,
				noAttribute: true,
			},
			_iconPressed: {
				type: Boolean,
				noAttribute: true,
			},
			opened: {
				type: Boolean,
			},
			_listWidth: {
				type: Integer__default,
				defaultValue: 0,
				noAttribute: true,
			},
			focused: {
				type: Boolean,
			},
		},
		events:  {
			change: {
				detail: {
					selectedOption: {},
				},
			},
		},
	};
	class Select extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return SelectTemplate_lit;
		}
		static get staticAreaTemplate() {
			return SelectPopoverTemplate_lit;
		}
		static get styles() {
			return Select_css;
		}
		static get staticAreaStyles() {
			return [ResponsivePopoverCommon_css, ValueStateMessage_css, SelectPopover_css];
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
					stableDomRef: opt.stableDomRef,
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
			const FormSupport = FeaturesRegistry.getFeature("FormSupport");
			if (FormSupport) {
				FormSupport.syncNativeHiddenInput(this, (element, nativeInput) => {
					nativeInput.disabled = element.disabled;
					nativeInput.value = element._currentlySelectedOption ? element._currentlySelectedOption.value : "";
				});
			} else if (this.name) {
				console.warn(`In order for the "name" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`);
			}
		}
		_onkeydown(event) {
			const isTab = (Keys.isTabNext(event) || Keys.isTabPrevious(event));
			if (isTab && this.responsivePopover && this.responsivePopover.opened) {
				this.responsivePopover.close();
			}
			if (Keys.isShow(event)) {
				event.preventDefault();
				this._toggleRespPopover();
			} else if (Keys.isSpace(event)) {
				event.preventDefault();
			} else if (Keys.isEscape(event) && this._isPickerOpen) {
				this._escapePressed = true;
			} else if (Keys.isHome(event)) {
				this._handleHomeKey(event);
			} else if (Keys.isEnd(event)) {
				this._handleEndKey(event);
			} else if (Keys.isEnter(event)) {
				this._handleSelectionChange();
			} else if (Keys.isUp(event) || Keys.isDown(event)) {
				this._handleArrowNavigation(event);
			}
		}
		_handleKeyboardNavigation(event) {
			if (Keys.isEnter(event)) {
				return;
			}
			const typedCharacter = event.key.toLowerCase();
			this._typedChars += typedCharacter;
			const text = (/^(.)\1+$/i).test(this._typedChars) ? typedCharacter : this._typedChars;
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
				const nextIndex = this._getSelectedItemIndex(itemToSelect);
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
			if (Keys.isSpace(event)) {
				if (this._isPickerOpen) {
					this._handleSelectionChange();
				} else {
					this._toggleRespPopover();
				}
			}
		}
		_getSelectedItemIndex(item) {
			return [].indexOf.call(item.parentElement.children, item);
		}
		_select(index) {
			this._filteredItems[this._selectedIndex].selected = false;
			this._selectedIndex = index;
			this._filteredItems[index].selected = true;
		}
		_handleItemPress(event) {
			const item = event.detail.selectedItems[0];
			const selectedItemIndex = this._getSelectedItemIndex(item);
			this._handleSelectionChange(selectedItemIndex);
		}
		_itemMousedown(event) {
			event.preventDefault();
		}
		_onclick(event) {
			this.getFocusDomRef().focus();
			this._toggleRespPopover();
		}
		_handleSelectionChange(index = this._selectedIndex) {
			this._select(index);
			this._toggleRespPopover();
		}
		_handleArrowNavigation(event) {
			let nextIndex = -1;
			const currentIndex = this._selectedIndex;
			const isDownKey = Keys.isDown(event);
			event.preventDefault();
			if (isDownKey) {
				nextIndex = this._getNextOptionIndex();
			} else {
				nextIndex = this._getPreviousOptionIndex();
			}
			this._changeSelectedItem(this._selectedIndex, nextIndex);
			if (currentIndex !== this._selectedIndex) {
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
				this._fireChangeEvent(options[newIndex]);
			}
		}
		_getNextOptionIndex() {
			return this._selectedIndex === (this.options.length - 1) ? this._selectedIndex : (this._selectedIndex + 1);
		}
		_getPreviousOptionIndex() {
			return this._selectedIndex === 0 ? this._selectedIndex : (this._selectedIndex - 1);
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
			this.fireEvent("change", { selectedOption });
			this.selectedItem = selectedOption.textContent;
			this.fireEvent("selected-item-changed");
		}
		get valueStateTextMappings() {
			return {
				"Success": Select.i18nBundle.getText(i18nDefaults.VALUE_STATE_SUCCESS),
				"Information": Select.i18nBundle.getText(i18nDefaults.VALUE_STATE_INFORMATION),
				"Error": Select.i18nBundle.getText(i18nDefaults.VALUE_STATE_ERROR),
				"Warning": Select.i18nBundle.getText(i18nDefaults.VALUE_STATE_WARNING),
			};
		}
		get valueStateText() {
			return this.valueStateTextMappings[this.valueState];
		}
		get hasValueState() {
			return this.valueState !== ValueState__default.None;
		}
		get valueStateTextId() {
			return this.hasValueState ? `${this._id}-valueStateDesc` : undefined;
		}
		get isDisabled() {
			return this.disabled || undefined;
		}
		get _headerTitleText() {
			return Select.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_TITLE);
		}
		get _currentSelectedItem() {
			return this.shadowRoot.querySelector(`#${this._filteredItems[this._selectedIndex]._id}-li`);
		}
		get _currentlySelectedOption() {
			return this._filteredItems[this._selectedIndex];
		}
		get tabIndex() {
			return this.disabled
			|| (this.responsivePopover
			&& this.responsivePopover.opened) ? "-1" : "0";
		}
		get _valueStateMessageInputIcon() {
			const iconPerValueState = {
				Error: "error",
				Warning: "alert",
				Success: "sys-enter-2",
				Information: "information",
			};
			return this.valueState !== ValueState__default.None ? iconPerValueState[this.valueState] : "";
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
				popover: {
					"ui5-select-popover-valuestate": this.hasValueState,
				},
			};
		}
		get styles() {
			return {
				popoverHeader: {
					"max-width": `${this.offsetWidth}px`,
				},
				responsivePopoverHeader: {
					"display": this._filteredItems.length && this._listWidth === 0 ? "none" : "inline-block",
					"width": `${this._filteredItems.length ? this._listWidth : this.offsetWidth}px`,
				},
			};
		}
		get ariaLabelText() {
			return AriaLabelHelper.getEffectiveAriaLabelText(this);
		}
		get valueStateMessageText() {
			return this.getSlottedNodes("valueStateMessage").map(el => el.cloneNode(true));
		}
		get shouldDisplayDefaultValueStateMessage() {
			return !this.valueStateMessage.length && this.hasValueStateText;
		}
		get hasValueStateText() {
			return this.hasValueState && this.valueState !== ValueState__default.Success;
		}
		get shouldOpenValueStateMessagePopover() {
			return this.focused && this.hasValueStateText && !this._iconPressed
				&& !this._isPickerOpen && !this._isPhone;
		}
		get _ariaRoleDescription() {
			return Select.i18nBundle.getText(i18nDefaults.SELECT_ROLE_DESCRIPTION);
		}
		get _isPhone() {
			return Device.isPhone();
		}
		get _filteredItems() {
			return this.options.filter(option => !option.disabled);
		}
		itemSelectionAnnounce() {
			let text;
			const optionsCount = this._filteredItems.length;
			const itemPositionText = Select.i18nBundle.getText(i18nDefaults.LIST_ITEM_POSITION, this._selectedIndex + 1, optionsCount);
			if (this.focused && this._currentlySelectedOption) {
				text = `${this._currentlySelectedOption.textContent} ${this._isPickerOpen ? itemPositionText : ""}`;
				announce__default(text, "Polite");
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
			return [
				Option,
				Label,
				ResponsivePopover,
				Popover,
				List,
				StandardListItem,
				Icon,
				Button,
			];
		}
		static async onDefine() {
			Select.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
	}
	Select.define();

	return Select;

});
