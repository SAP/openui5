sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/types/ValueState', 'sap/ui/webc/common/thirdparty/base/FeaturesRegistry', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper', 'sap/ui/webc/common/thirdparty/base/util/Caret', 'sap/ui/webc/common/thirdparty/icons/decline', 'sap/ui/webc/common/thirdparty/icons/not-editable', 'sap/ui/webc/common/thirdparty/icons/error', 'sap/ui/webc/common/thirdparty/icons/alert', 'sap/ui/webc/common/thirdparty/icons/sys-enter-2', 'sap/ui/webc/common/thirdparty/icons/information', './types/InputType', './Popover', './Icon', './generated/templates/InputTemplate.lit', './generated/templates/InputPopoverTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/Input.css', './generated/themes/ResponsivePopoverCommon.css', './generated/themes/ValueStateMessage.css', './generated/themes/Suggestions.css'], function (UI5Element, litRender, ResizeHandler, Device, ValueState, FeaturesRegistry, Keys, Integer, i18nBundle, AriaLabelHelper, Caret, decline, notEditable, error, alert, sysEnter2, information, InputType, Popover, Icon, InputTemplate_lit, InputPopoverTemplate_lit, i18nDefaults, Input_css, ResponsivePopoverCommon_css, ValueStateMessage_css, Suggestions_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var ValueState__default = /*#__PURE__*/_interopDefaultLegacy(ValueState);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);

	const rgxFloat = new RegExp(/(\+|-)?\d+(\.|,)\d+/);
	const metadata = {
		tag: "ui5-input",
		languageAware: true,
		managedSlots: true,
		slots:  {
			icon: {
				type: HTMLElement,
			},
			"default": {
				propertyName: "suggestionItems",
				type: HTMLElement,
			},
			formSupport: {
				type: HTMLElement,
			},
			valueStateMessage: {
				type: HTMLElement,
			},
		},
		properties:   {
			disabled: {
				type: Boolean,
			},
			highlight: {
				type: Boolean,
			},
			placeholder: {
				type: String,
			},
			readonly: {
				type: Boolean,
			},
			required: {
				type: Boolean,
			},
			type: {
				type: InputType,
				defaultValue: InputType.Text,
			},
			value: {
				type: String,
			},
			valueState: {
				type: ValueState__default,
				defaultValue: ValueState__default.None,
			},
			name: {
				type: String,
			},
			showSuggestions: {
				type: Boolean,
			},
			maxlength: {
				type: Integer__default,
			},
			accessibleName: {
				type: String,
			},
			accessibleNameRef: {
				type: String,
				defaultValue: "",
			},
			showClearIcon: {
				type: Boolean,
			},
			effectiveShowClearIcon: {
				type: Boolean,
			},
			focused: {
				type: Boolean,
			},
			openOnMobile: {
				type: Boolean,
			},
			open: {
				type: Boolean,
			},
			_forceOpen: {
				type: Boolean,
			},
			_isValueStateFocused: {
				type: Boolean,
			},
			_input: {
				type: Object,
			},
			_inputAccInfo: {
				type: Object,
			},
			_nativeInputAttributes: {
				type: Object,
			},
			_inputWidth: {
				type: Integer__default,
			},
			_listWidth: {
				type: Integer__default,
			},
			_isPopoverOpen: {
				type: Boolean,
				noAttribute: true,
			},
			_inputIconFocused: {
				type: Boolean,
				noAttribute: true,
			},
		},
		events:  {
			change: {},
			input: {},
			"suggestion-item-select": {
				detail: {
					item: { type: HTMLElement },
				},
			},
			"suggestion-item-preview": {
				detail: {
					item: { type: HTMLElement },
					targetRef: { type: HTMLElement },
				},
			},
			"suggestion-scroll": {
				detail: {
					scrollTop: { type: Integer__default },
					scrollContainer: { type: HTMLElement },
				},
			},
		},
	};
	class Input extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return InputTemplate_lit;
		}
		static get staticAreaTemplate() {
			return InputPopoverTemplate_lit;
		}
		static get styles() {
			return Input_css;
		}
		static get staticAreaStyles() {
			return [ResponsivePopoverCommon_css, ValueStateMessage_css, Suggestions_css];
		}
		constructor() {
			super();
			this.hasSuggestionItemSelected = false;
			this.valueBeforeItemSelection = "";
			this.valueBeforeItemPreview = "";
			this.suggestionSelectionCanceled = false;
			this._changeFiredValue = null;
			this.previousValue = undefined;
			this.firstRendering = true;
			this.highlightValue = "";
			this.lastConfirmedValue = "";
			this._backspaceKeyDown = false;
			this.isTyping = false;
			this.EVENT_CHANGE = "change";
			this.EVENT_INPUT = "input";
			this.EVENT_SUGGESTION_ITEM_SELECT = "suggestion-item-select";
			this.ACTION_ENTER = "enter";
			this.ACTION_USER_INPUT = "input";
			this.suggestionsTexts = [];
			this._handleResizeBound = this._handleResize.bind(this);
		}
		onEnterDOM() {
			ResizeHandler__default.register(this, this._handleResizeBound);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this, this._handleResizeBound);
		}
		onBeforeRendering() {
			if (this.showSuggestions) {
				this.enableSuggestions();
				this.suggestionsTexts = this.Suggestions.defaultSlotProperties(this.highlightValue);
			}
			this.effectiveShowClearIcon = (this.showClearIcon && !!this.value && !this.readonly && !this.disabled);
			const FormSupport = FeaturesRegistry.getFeature("FormSupport");
			const hasItems = this.suggestionItems.length;
			const hasValue = !!this.value;
			const isFocused = this === document.activeElement;
			if (this._isPhone) {
				this.open = this.openOnMobile;
			} else if (this._forceOpen) {
				this.open = true;
			} else {
				this.open = hasValue && hasItems && isFocused && this.isTyping;
			}
			if (FormSupport) {
				FormSupport.syncNativeHiddenInput(this);
			} else if (this.name) {
				console.warn(`In order for the "name" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`);
			}
		}
		async onAfterRendering() {
			if (this.Suggestions) {
				this.Suggestions.toggle(this.open, {
					preventFocusRestore: true,
				});
				this._listWidth = await this.Suggestions._getListWidth();
			}
			if (this.shouldDisplayOnlyValueStateMessage) {
				this.openPopover();
			} else {
				this.closePopover();
			}
		}
		_onkeydown(event) {
			if (Keys.isUp(event)) {
				return this._handleUp(event);
			}
			if (Keys.isDown(event)) {
				return this._handleDown(event);
			}
			if (Keys.isSpace(event)) {
				return this._handleSpace(event);
			}
			if (Keys.isTabNext(event)) {
				return this._handleTab(event);
			}
			if (Keys.isEnter(event)) {
				return this._handleEnter(event);
			}
			if (Keys.isPageUp(event)) {
				return this._handlePageUp(event);
			}
			if (Keys.isPageDown(event)) {
				return this._handlePageDown(event);
			}
			if (Keys.isHome(event)) {
				return this._handleHome(event);
			}
			if (Keys.isEnd(event)) {
				return this._handleEnd(event);
			}
			if (Keys.isEscape(event)) {
				return this._handleEscape(event);
			}
			if (Keys.isBackSpace(event)) {
				this._backspaceKeyDown = true;
				this._selectedText = window.getSelection().toString();
			}
			if (this.showSuggestions) {
				this._clearPopoverFocusAndSelection();
			}
			this._keyDown = true;
		}
		_onkeyup(event) {
			if (Keys.isDelete(event)) {
				this.value = event.target.value;
			}
			this._keyDown = false;
			this._backspaceKeyDown = false;
		}
		_handleUp(event) {
			if (this.Suggestions && this.Suggestions.isOpened()) {
				this.Suggestions.onUp(event);
			}
		}
		_handleDown(event) {
			if (this.Suggestions && this.Suggestions.isOpened()) {
				this.Suggestions.onDown(event);
			}
		}
		_handleSpace(event) {
			if (this.Suggestions) {
				this.Suggestions.onSpace(event);
			}
		}
		_handleTab(event) {
			if (this.Suggestions && (this.previousValue !== this.value)) {
				this.Suggestions.onTab(event);
			}
		}
		_handleEnter(event) {
			const itemPressed = !!(this.Suggestions && this.Suggestions.onEnter(event));
			if (!itemPressed) {
				this.fireEventByAction(this.ACTION_ENTER);
				this.lastConfirmedValue = this.value;
				return;
			}
			this.focused = true;
		}
		_handlePageUp(event) {
			if (this._isSuggestionsFocused) {
				this.Suggestions.onPageUp(event);
			} else {
				event.preventDefault();
			}
		}
		_handlePageDown(event) {
			if (this._isSuggestionsFocused) {
				this.Suggestions.onPageDown(event);
			} else {
				event.preventDefault();
			}
		}
		_handleHome(event) {
			if (this._isSuggestionsFocused) {
				this.Suggestions.onHome(event);
			}
		}
		_handleEnd(event) {
			if (this._isSuggestionsFocused) {
				this.Suggestions.onEnd(event);
			}
		}
		_handleEscape() {
			const hasSuggestions = this.showSuggestions && !!this.Suggestions;
			const isOpen = hasSuggestions && this.open;
			if (!isOpen) {
				this.value = this.lastConfirmedValue ? this.lastConfirmedValue : this.previousValue;
				return;
			}
			if (hasSuggestions && isOpen && this.Suggestions._isItemOnTarget()) {
				this.value = this.valueBeforeItemPreview;
				this.suggestionSelectionCanceled = true;
				this.focused = true;
			}
			if (this._isValueStateFocused) {
				this._isValueStateFocused = false;
				this.focused = true;
			}
		}
		async _onfocusin(event) {
			await this.getInputDOMRef();
			this.focused = true;
			this.previousValue = this.value;
			this.valueBeforeItemPreview = this.value;
			this._inputIconFocused = event.target && event.target === this.querySelector("[ui5-icon]");
		}
		_onfocusout(event) {
			const focusedOutToSuggestions = this.Suggestions && event.relatedTarget && event.relatedTarget.shadowRoot && event.relatedTarget.shadowRoot.contains(this.Suggestions.responsivePopover);
			const focusedOutToValueStateMessage = event.relatedTarget && event.relatedTarget.shadowRoot && event.relatedTarget.shadowRoot.querySelector(".ui5-valuestatemessage-root");
			this._preventNextChange = this.effectiveShowClearIcon && this.shadowRoot.contains(event.relatedTarget);
			if (focusedOutToSuggestions || focusedOutToValueStateMessage) {
				event.stopImmediatePropagation();
				return;
			}
			const toBeFocused = event.relatedTarget;
			if (toBeFocused && toBeFocused.classList.contains(this._id)) {
				return;
			}
			this.open = false;
			this._clearPopoverFocusAndSelection();
			this.previousValue = "";
			this.lastConfirmedValue = "";
			this.focused = false;
			this.isTyping = false;
			this._forceOpen = false;
		}
		_clearPopoverFocusAndSelection() {
			if (!this.showSuggestions || !this.Suggestions) {
				return;
			}
			this._isValueStateFocused = false;
			this.hasSuggestionItemSelected = false;
			this.Suggestions._deselectItems();
			this.Suggestions._clearItemFocus();
		}
		_click(event) {
			if (Device.isPhone() && !this.readonly && this.Suggestions) {
				this.blur();
				this.openOnMobile = true;
			}
		}
		_handleNativeInputChange() {
			clearTimeout(this._nativeChangeDebounce);
			this._nativeChangeDebounce = setTimeout(() => this._handleChange(), 100);
		}
		_handleChange() {
			if (this._preventNextChange) {
				this._preventNextChange = false;
				return;
			}
			if (this._changeFiredValue !== this.value) {
				this._changeFiredValue = this.value;
				this.fireEvent(this.EVENT_CHANGE);
			}
		}
		_clear() {
			this.value = "";
			this.fireEvent(this.EVENT_INPUT);
			this._handleChange();
			if (!this._isPhone) {
				this.focus();
			}
		}
		_scroll(event) {
			const detail = event.detail;
			this.fireEvent("suggestion-scroll", {
				scrollTop: detail.scrollTop,
				scrollContainer: detail.targetRef,
			});
		}
		_handleInput(event) {
			const inputDomRef = this.getInputDOMRefSync();
			const emptyValueFiredOnNumberInput = this.value && this.isTypeNumber && !inputDomRef.value;
			this.suggestionSelectionCanceled = false;
			if (emptyValueFiredOnNumberInput && !this._backspaceKeyDown) {
				return;
			}
			if (emptyValueFiredOnNumberInput && this._backspaceKeyDown) {
				if (this._selectedText.indexOf(",") > -1) {
					this._selectedText = this._selectedText.replace(",", ".");
				}
				if (rgxFloat.test(this.value) && this._selectedText !== this.value) {
					const newValue = this.removeFractionalPart(this.value);
					this.value = newValue;
					this.highlightValue = newValue;
					this.valueBeforeItemPreview = newValue;
					this.fireEvent(this.EVENT_INPUT);
					this.fireEvent("value-changed");
					return;
				}
			}
			if (event.target === inputDomRef) {
				this.focused = true;
				event.stopImmediatePropagation();
			}
			const skipFiring = (inputDomRef.value === this.value) && Device.isIE() && !this._keyDown && !!this.placeholder;
			!skipFiring && this.fireEventByAction(this.ACTION_USER_INPUT);
			this.hasSuggestionItemSelected = false;
			this._isValueStateFocused = false;
			if (this.Suggestions) {
				this.Suggestions.updateSelectedItemPosition(null);
			}
			this.isTyping = true;
		}
		_handleResize() {
			this._inputWidth = this.offsetWidth;
		}
		_closeRespPopover(preventFocusRestore) {
			this.Suggestions.close(preventFocusRestore);
		}
		async _afterOpenPopover() {
			if (Device.isPhone()) {
				(await this.getInputDOMRef()).focus();
			}
		}
		_afterClosePopover() {
			this.announceSelectedItem();
			if (Device.isPhone()) {
				this.blur();
				this.focused = false;
			}
			this.isTyping = false;
			this.openOnMobile = false;
			this.open = false;
			this._forceOpen = false;
		}
		isValueStateOpened() {
			return !!this._isPopoverOpen;
		}
		async openPopover() {
			const popover = await this._getPopover();
			if (popover) {
				this._isPopoverOpen = true;
				popover.showAt(this);
			}
		}
		async closePopover() {
			const popover = await this._getPopover();
			popover && popover.close();
		}
		async _getPopover() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			return staticAreaItem && staticAreaItem.querySelector("[ui5-popover]");
		}
		openPicker() {
			if (!this.suggestionItems.length || this.disabled || this.readonly) {
				return;
			}
			this._forceOpen = true;
		}
		enableSuggestions() {
			if (this.Suggestions) {
				return;
			}
			const Suggestions = FeaturesRegistry.getFeature("InputSuggestions");
			if (Suggestions) {
				this.Suggestions = new Suggestions(this, "suggestionItems", true);
			} else {
				throw new Error(`You have to import "@ui5/webcomponents/dist/features/InputSuggestions.js" module to use ui5-input suggestions`);
			}
		}
		selectSuggestion(item, keyboardUsed) {
			if (item.group) {
				return;
			}
			const itemText = item.text || item.textContent;
			const fireInput = keyboardUsed
				? this.valueBeforeItemSelection !== itemText : this.value !== itemText;
			this.hasSuggestionItemSelected = true;
			if (fireInput) {
				this.value = itemText;
				this.valueBeforeItemSelection = itemText;
				this.lastConfirmedValue = itemText;
				this.fireEvent(this.EVENT_INPUT);
				this._handleChange();
			}
			this.valueBeforeItemPreview = "";
			this.suggestionSelectionCanceled = false;
			this.fireEvent(this.EVENT_SUGGESTION_ITEM_SELECT, { item });
			this.isTyping = false;
			this.openOnMobile = false;
			this._forceOpen = false;
		}
		previewSuggestion(item) {
			this.valueBeforeItemSelection = this.value;
			this.updateValueOnPreview(item);
			this.announceSelectedItem();
			this._previewItem = item;
		}
		updateValueOnPreview(item) {
			const noPreview = item.type === "Inactive" || item.group;
			const itemValue = noPreview ? this.valueBeforeItemPreview : (item.effectiveTitle || item.textContent);
			this.value = itemValue;
		}
		get previewItem() {
			if (!this._previewItem) {
				return null;
			}
			return this.getSuggestionByListItem(this._previewItem);
		}
		async fireEventByAction(action) {
			await this.getInputDOMRef();
			if (this.disabled || this.readonly) {
				return;
			}
			const inputValue = await this.getInputValue();
			const isUserInput = action === this.ACTION_USER_INPUT;
			const input = await this.getInputDOMRef();
			const cursorPosition = input.selectionStart;
			this.value = inputValue;
			this.highlightValue = inputValue;
			this.valueBeforeItemPreview = inputValue;
			if (Device.isSafari()) {
				setTimeout(() => {
					input.selectionStart = cursorPosition;
					input.selectionEnd = cursorPosition;
				}, 0);
			}
			if (isUserInput) {
				this.fireEvent(this.EVENT_INPUT);
				this.fireEvent("value-changed");
				return;
			}
			const valueChanged = (this.previousValue !== undefined) && (this.previousValue !== this.value);
			if (Device.isIE() && action === this.ACTION_ENTER && valueChanged) {
				this._handleChange();
			}
		}
		async getInputValue() {
			const domRef = this.getDomRef();
			if (domRef) {
				return (await this.getInputDOMRef()).value;
			}
			return "";
		}
		async getInputDOMRef() {
			if (Device.isPhone() && this.Suggestions) {
				await this.Suggestions._getSuggestionPopover();
				return this.Suggestions && this.Suggestions.responsivePopover.querySelector(".ui5-input-inner-phone");
			}
			return this.nativeInput;
		}
		getInputDOMRefSync() {
			if (Device.isPhone() && this.Suggestions) {
				return this.Suggestions && this.Suggestions.responsivePopover.querySelector(".ui5-input-inner-phone");
			}
			return this.nativeInput;
		}
		get nativeInput() {
			return this.getDomRef() && this.getDomRef().querySelector(`input`);
		}
		get nativeInputWidth() {
			return this.nativeInput && this.nativeInput.offsetWidth;
		}
		getLabelableElementId() {
			return this.getInputId();
		}
		getSuggestionByListItem(item) {
			const key = parseInt(item.getAttribute("data-ui5-key"));
			return this.suggestionItems[key];
		}
		isSuggestionsScrollable() {
			if (!this.Suggestions) {
				return Promise.resolve(false);
			}
			return this.Suggestions._isScrollable();
		}
		getInputId() {
			return `${this._id}-inner`;
		}
		onItemFocused() {}
		onItemMouseOver(event) {
			const item = event.target;
			const suggestion = this.getSuggestionByListItem(item);
			suggestion && suggestion.fireEvent("mouseover", {
				item: suggestion,
				targetRef: item,
			});
		}
		onItemMouseOut(event) {
			const item = event.target;
			const suggestion = this.getSuggestionByListItem(item);
			suggestion && suggestion.fireEvent("mouseout", {
				item: suggestion,
				targetRef: item,
			});
		}
		onItemMouseDown(event) {
			event.preventDefault();
		}
		onItemSelected(item, keyboardUsed) {
			this.selectSuggestion(item, keyboardUsed);
		}
		onItemPreviewed(item) {
			this.previewSuggestion(item);
			this.fireEvent("suggestion-item-preview", {
				item: this.getSuggestionByListItem(item),
				targetRef: item,
			});
		}
		onOpen() {}
		onClose() {}
		valueStateTextMappings() {
			return {
				"Success": Input.i18nBundle.getText(i18nDefaults.VALUE_STATE_SUCCESS),
				"Information": Input.i18nBundle.getText(i18nDefaults.VALUE_STATE_INFORMATION),
				"Error": Input.i18nBundle.getText(i18nDefaults.VALUE_STATE_ERROR),
				"Warning": Input.i18nBundle.getText(i18nDefaults.VALUE_STATE_WARNING),
			};
		}
		announceSelectedItem() {
			const invisibleText = this.shadowRoot.querySelector(`#${this._id}-selectionText`);
			if (this.Suggestions && this.Suggestions._isItemOnTarget()) {
				invisibleText.textContent = this.itemSelectionAnnounce;
			} else {
				invisibleText.textContent = "";
			}
		}
		get _readonly() {
			return this.readonly && !this.disabled;
		}
		get _headerTitleText() {
			return Input.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_TITLE);
		}
		get inputType() {
			return this.type.toLowerCase();
		}
		get isTypeNumber() {
			return this.type === InputType.Number;
		}
		get suggestionsTextId() {
			return this.showSuggestions ? `${this._id}-suggestionsText` : "";
		}
		get valueStateTextId() {
			return this.hasValueState ? `${this._id}-valueStateDesc` : "";
		}
		get accInfo() {
			const ariaHasPopupDefault = this.showSuggestions ? "true" : undefined;
			const ariaAutoCompleteDefault = this.showSuggestions ? "list" : undefined;
			const ariaDescribedBy = this._inputAccInfo.ariaDescribedBy ? `${this.suggestionsTextId} ${this.valueStateTextId} ${this._inputAccInfo.ariaDescribedBy}`.trim() : `${this.suggestionsTextId} ${this.valueStateTextId}`.trim();
			return {
				"input": {
					"ariaRoledescription": this._inputAccInfo && (this._inputAccInfo.ariaRoledescription || undefined),
					"ariaDescribedBy": ariaDescribedBy || undefined,
					"ariaInvalid": this.valueState === ValueState__default.Error ? "true" : undefined,
					"ariaHasPopup": this._inputAccInfo.ariaHasPopup ? this._inputAccInfo.ariaHasPopup : ariaHasPopupDefault,
					"ariaAutoComplete": this._inputAccInfo.ariaAutoComplete ? this._inputAccInfo.ariaAutoComplete : ariaAutoCompleteDefault,
					"role": this._inputAccInfo && this._inputAccInfo.role,
					"ariaControls": this._inputAccInfo && this._inputAccInfo.ariaControls,
					"ariaExpanded": this._inputAccInfo && this._inputAccInfo.ariaExpanded,
					"ariaDescription": this._inputAccInfo && this._inputAccInfo.ariaDescription,
					"ariaLabel": (this._inputAccInfo && this._inputAccInfo.ariaLabel) || AriaLabelHelper.getEffectiveAriaLabelText(this),
				},
			};
		}
		get nativeInputAttributes() {
			return {
				"min": this.isTypeNumber ? this._nativeInputAttributes.min : undefined,
				"max": this.isTypeNumber ? this._nativeInputAttributes.max : undefined,
				"step": this.isTypeNumber ? (this._nativeInputAttributes.step || "any") : undefined,
			};
		}
		get ariaValueStateHiddenText() {
			if (!this.hasValueStateMessage) {
				return;
			}
			if (this.shouldDisplayDefaultValueStateMessage) {
				return this.valueStateText;
			}
			return this.valueStateMessageText.map(el => el.textContent).join(" ");
		}
		get itemSelectionAnnounce() {
			return this.Suggestions ? this.Suggestions.itemSelectionAnnounce : undefined;
		}
		get classes() {
			return {
				popover: {
					"ui5-suggestions-popover": !this.isPhone && this.showSuggestions,
					"ui5-suggestions-popover-with-value-state-header": !this.isPhone && this.showSuggestions && this.hasValueStateMessage,
				},
				popoverValueState: {
					"ui5-valuestatemessage-root": true,
					"ui5-valuestatemessage-header": true,
					"ui5-valuestatemessage--success": this.valueState === ValueState__default.Success,
					"ui5-valuestatemessage--error": this.valueState === ValueState__default.Error,
					"ui5-valuestatemessage--warning": this.valueState === ValueState__default.Warning,
					"ui5-valuestatemessage--information": this.valueState === ValueState__default.Information,
				},
			};
		}
		get styles() {
			const remSizeIxPx = parseInt(getComputedStyle(document.documentElement).fontSize);
			const stylesObject = {
				popoverHeader: {
					"max-width": `${this._inputWidth}px`,
				},
				suggestionPopoverHeader: {
					"display": this._listWidth === 0 ? "none" : "inline-block",
					"width": `${this._listWidth}px`,
				},
				suggestionsPopover: {
					"min-width": `${this._inputWidth}px`,
					"max-width": (this._inputWidth / remSizeIxPx) > 40 ? `${this._inputWidth}px` : "40rem",
				},
				innerInput: {},
			};
			if (this.nativeInputWidth < 48) {
				stylesObject.innerInput.padding = "0";
			}
			return stylesObject;
		}
		get suggestionSeparators() {
			return "None";
		}
		get valueStateMessageText() {
			return this.getSlottedNodes("valueStateMessage").map(el => el.cloneNode(true));
		}
		get shouldDisplayOnlyValueStateMessage() {
			return this.hasValueStateMessage && !this.readonly && !this.open && this.focused;
		}
		get shouldDisplayDefaultValueStateMessage() {
			return !this.valueStateMessage.length && this.hasValueStateMessage;
		}
		get hasValueState() {
			return this.valueState !== ValueState__default.None;
		}
		get hasValueStateMessage() {
			return this.hasValueState && this.valueState !== ValueState__default.Success
				&& (!this._inputIconFocused
				|| (this._isPhone && this.Suggestions));
		}
		get valueStateText() {
			return this.valueStateTextMappings()[this.valueState];
		}
		get suggestionsText() {
			return Input.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS);
		}
		get availableSuggestionsCount() {
			if (this.showSuggestions && (this.value || this.Suggestions.isOpened())) {
				switch (this.suggestionsTexts.length) {
				case 0:
					return Input.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_NO_HIT);
				case 1:
					return Input.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_ONE_HIT);
				default:
					return Input.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_MORE_HITS, this.suggestionsTexts.length);
				}
			}
			return undefined;
		}
		get step() {
			return this.isTypeNumber ? "any" : undefined;
		}
		get _isPhone() {
			return Device.isPhone();
		}
		get _isSuggestionsFocused() {
			return !this.focused && this.Suggestions && this.Suggestions.isOpened();
		}
		get _placeholder() {
			return this.placeholder;
		}
		get _valueStateInputIcon() {
			const iconPerValueState = {
				Error: `<path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20ZM7.70711 13.7071C7.31658 14.0976 6.68342 14.0976 6.29289 13.7071C5.90237 13.3166 5.90237 12.6834 6.29289 12.2929L8.58579 10L6.29289 7.70711C5.90237 7.31658 5.90237 6.68342 6.29289 6.29289C6.68342 5.90237 7.31658 5.90237 7.70711 6.29289L10 8.58579L12.2929 6.29289C12.6834 5.90237 13.3166 5.90237 13.7071 6.29289C14.0976 6.68342 14.0976 7.31658 13.7071 7.70711L11.4142 10L13.7071 12.2929C14.0976 12.6834 14.0976 13.3166 13.7071 13.7071C13.3166 14.0976 12.6834 14.0976 12.2929 13.7071L10 11.4142L7.70711 13.7071Z" fill="#EE3939"/>`,
				Warning: `<path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M11.8619 0.49298C11.6823 0.187541 11.3544 0 11 0C10.6456 0 10.3177 0.187541 10.1381 0.49298L0.138066 17.493C-0.0438112 17.8022 -0.0461447 18.1851 0.13195 18.4965C0.310046 18.8079 0.641283 19 1 19H21C21.3587 19 21.69 18.8079 21.868 18.4965C22.0461 18.1851 22.0438 17.8022 21.8619 17.493L11.8619 0.49298ZM11 6C11.5523 6 12 6.44772 12 7V10C12 10.5523 11.5523 11 11 11C10.4477 11 10 10.5523 10 10V7C10 6.44772 10.4477 6 11 6ZM11 16C11.8284 16 12.5 15.3284 12.5 14.5C12.5 13.6716 11.8284 13 11 13C10.1716 13 9.5 13.6716 9.5 14.5C9.5 15.3284 10.1716 16 11 16Z" fill="#F58B00"/>`,
				Success: `<path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 4.47715 15.5228 0 10 0C4.47715 0 0 4.47715 0 10ZM14.7071 6.29289C14.3166 5.90237 13.6834 5.90237 13.2929 6.29289L8 11.5858L6.70711 10.2929C6.31658 9.90237 5.68342 9.90237 5.29289 10.2929C4.90237 10.6834 4.90237 11.3166 5.29289 11.7071L7.29289 13.7071C7.68342 14.0976 8.31658 14.0976 8.70711 13.7071L14.7071 7.70711C15.0976 7.31658 15.0976 6.68342 14.7071 6.29289Z" fill="#36A41D"/>`,
				Information: `<path xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" d="M3 0C1.34315 0 0 1.34315 0 3V15C0 16.6569 1.34315 18 3 18H15C16.6569 18 18 16.6569 18 15V3C18 1.34315 16.6569 0 15 0H3ZM9 6.5C9.82843 6.5 10.5 5.82843 10.5 5C10.5 4.17157 9.82843 3.5 9 3.5C8.17157 3.5 7.5 4.17157 7.5 5C7.5 5.82843 8.17157 6.5 9 6.5ZM9 8.5C9.55228 8.5 10 8.94772 10 9.5V13.5C10 14.0523 9.55228 14.5 9 14.5C8.44771 14.5 8 14.0523 8 13.5V9.5C8 8.94772 8.44771 8.5 9 8.5Z" fill="#1B90FF"/>`,
			};
			const result = `
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 20 20" fill="none">
			${iconPerValueState[this.valueState]};
		</svg>
		`;
			return this.valueState !== ValueState__default.None ? result : "";
		}
		get _valueStatePopoverHorizontalAlign() {
			return this.effectiveDir !== "rtl" ? "Left" : "Right";
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
		getCaretPosition() {
			return Caret.getCaretPosition(this.nativeInput);
		}
		setCaretPosition(pos) {
			Caret.setCaretPosition(this.nativeInput, pos);
		}
		removeFractionalPart(value) {
			if (value.includes(".")) {
				return value.slice(0, value.indexOf("."));
			}
			if (value.includes(",")) {
				return value.slice(0, value.indexOf(","));
			}
			return value;
		}
		static get dependencies() {
			const Suggestions = FeaturesRegistry.getFeature("InputSuggestions");
			return [Popover, Icon].concat(Suggestions ? Suggestions.dependencies : []);
		}
		static async onDefine() {
			const Suggestions = FeaturesRegistry.getFeature("InputSuggestions");
			[Input.i18nBundle] = await Promise.all([
				i18nBundle.getI18nBundle("@ui5/webcomponents"),
				Suggestions ? Suggestions.init() : Promise.resolve(),
			]);
		}
	}
	Input.define();

	return Input;

});
