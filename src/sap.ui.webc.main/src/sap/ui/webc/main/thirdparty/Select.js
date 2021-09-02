sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/FeaturesRegistry', 'sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper', 'sap/ui/webc/common/thirdparty/base/types/ValueState', 'sap/ui/webc/common/thirdparty/icons/slim-arrow-down', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/icons/decline', './generated/i18n/i18n-defaults', './Option', './Label', './ResponsivePopover', './Popover', './List', './StandardListItem', './Icon', './Button', './generated/templates/SelectTemplate.lit', './generated/templates/SelectPopoverTemplate.lit', './generated/themes/Select.css', './generated/themes/ResponsivePopoverCommon.css', './generated/themes/ValueStateMessage.css', './generated/themes/SelectPopover.css'], function (UI5Element, litRender, Keys, Integer, FeaturesRegistry, AriaLabelHelper, ValueState, slimArrowDown, Device, i18nBundle, decline, i18nDefaults, Option, Label, ResponsivePopover, Popover, List, StandardListItem, Icon, Button, SelectTemplate_lit, SelectPopoverTemplate_lit, Select_css, ResponsivePopoverCommon_css, ValueStateMessage_css, SelectPopover_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
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
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
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
		}
		_onfocusin() {
			this.focused = true;
		}
		_onfocusout() {
			this.focused = false;
			this.itemSelectionAnnounce();
		}
		get _isPickerOpen() {
			return !!this.responsivePopover && this.responsivePopover.opened;
		}
		async _respPopover() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			return staticAreaItem.querySelector("[ui5-responsive-popover]");
		}
		get selectedOption() {
			return this.options.find(option => option.selected);
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
		_syncSelection() {
			let lastSelectedOptionIndex = -1,
				firstEnabledOptionIndex = -1;
			const opts = this.options.map((opt, index) => {
				if (opt.selected || opt.textContent === this.value) {
					lastSelectedOptionIndex = index;
				}
				if (!opt.disabled && (firstEnabledOptionIndex === -1)) {
					firstEnabledOptionIndex = index;
				}
				opt.selected = false;
				opt._focused = false;
				return {
					selected: false,
					_focused: false,
					disabled: opt.disabled,
					icon: opt.icon,
					value: opt.value,
					textContent: opt.textContent,
					id: opt._id,
					stableDomRef: opt.stableDomRef,
				};
			});
			if (lastSelectedOptionIndex > -1 && !opts[lastSelectedOptionIndex].disabled) {
				opts[lastSelectedOptionIndex].selected = true;
				opts[lastSelectedOptionIndex]._focused = true;
				this.options[lastSelectedOptionIndex].selected = true;
				this.options[lastSelectedOptionIndex]._focused = true;
				this._text = opts[lastSelectedOptionIndex].textContent;
				this._selectedIndex = lastSelectedOptionIndex;
			} else {
				this._text = "";
				this._selectedIndex = -1;
				if (opts[firstEnabledOptionIndex]) {
					opts[firstEnabledOptionIndex].selected = true;
					opts[firstEnabledOptionIndex]._focused = true;
					this.options[firstEnabledOptionIndex].selected = true;
					this.options[firstEnabledOptionIndex]._focused = true;
					this._selectedIndex = firstEnabledOptionIndex;
					this._text = this.options[firstEnabledOptionIndex].textContent;
				}
			}
			this._syncedOptions = opts;
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
			let orderedOptions = this.options.slice(0);
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
			const lastIndex = this.options.length - 1;
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
			this.options[this._selectedIndex].selected = false;
			this._selectedIndex = index;
			this.options[index].selected = true;
		}
		_handleItemPress(event) {
			const item = event.detail.item;
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
			this.options[oldIndex].selected = false;
			this.options[oldIndex]._focused = false;
			this.options[newIndex].selected = true;
			this.options[newIndex]._focused = true;
			this._selectedIndex = newIndex;
			if (!this._isPickerOpen) {
				this._fireChangeEvent(this.options[newIndex]);
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
			this._lastSelectedOption = this.options[this._selectedIndex];
		}
		_afterOpen() {
			this.opened = true;
		}
		_afterClose() {
			this.opened = false;
			this._iconPressed = false;
			this._listWidth = 0;
			if (this._escapePressed) {
				this._select(this._selectedIndexBeforeOpen);
				this._escapePressed = false;
			} else if (this._lastSelectedOption !== this.options[this._selectedIndex]) {
				this._fireChangeEvent(this.options[this._selectedIndex]);
				this._lastSelectedOption = this.options[this._selectedIndex];
			}
		}
		_fireChangeEvent(selectedOption) {
			this.fireEvent("change", { selectedOption });
			this.selectedItem = selectedOption.textContent;
			this.fireEvent("selected-item-changed");
		}
		get valueStateTextMappings() {
			const i18nBundle = this.i18nBundle;
			return {
				"Success": i18nBundle.getText(i18nDefaults.VALUE_STATE_SUCCESS),
				"Information": i18nBundle.getText(i18nDefaults.VALUE_STATE_INFORMATION),
				"Error": i18nBundle.getText(i18nDefaults.VALUE_STATE_ERROR),
				"Warning": i18nBundle.getText(i18nDefaults.VALUE_STATE_WARNING),
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
			return this.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_TITLE);
		}
		get _currentSelectedItem() {
			return this.shadowRoot.querySelector(`#${this.options[this._selectedIndex]._id}-li`);
		}
		get _currentlySelectedOption() {
			return this.options[this._selectedIndex];
		}
		get tabIndex() {
			return this.disabled
			|| (this.responsivePopover
			&& this.responsivePopover.opened) ? "-1" : "0";
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
				popoverHeader: {
					"max-width": `${this.offsetWidth}px`,
				},
				responsivePopoverHeader: {
					"display": this.options.length && this._listWidth === 0 ? "none" : "inline-block",
					"width": `${this.options.length ? this._listWidth : this.offsetWidth}px`,
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
		get _isPhone() {
			return Device.isPhone();
		}
		itemSelectionAnnounce() {
			const invisibleText = this.shadowRoot.querySelector(`#${this._id}-selectionText`);
			if (this.focused && this._currentlySelectedOption) {
				invisibleText.textContent = this._currentlySelectedOption.textContent;
			} else {
				invisibleText.textContent = "";
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
	}
	Select.define();

	return Select;

});
