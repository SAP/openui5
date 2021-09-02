sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/Render', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/types/ValueState', 'sap/ui/webc/common/thirdparty/base/FeaturesRegistry', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper', 'sap/ui/webc/common/thirdparty/base/util/Caret', 'sap/ui/webc/common/thirdparty/icons/decline', './types/InputType', './Popover', './generated/templates/InputTemplate.lit', './generated/templates/InputPopoverTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/Input.css', './generated/themes/ResponsivePopoverCommon.css', './generated/themes/ValueStateMessage.css'], function (UI5Element, litRender, ResizeHandler, Render, Device, ValueState, FeaturesRegistry, Keys, Integer, i18nBundle, AriaLabelHelper, Caret, decline, InputType, Popover, InputTemplate_lit, InputPopoverTemplate_lit, i18nDefaults, Input_css, ResponsivePopoverCommon_css, ValueStateMessage_css) { 'use strict';

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
			focused: {
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
			return [ResponsivePopoverCommon_css, ValueStateMessage_css];
		}
		constructor() {
			super();
			this.hasSuggestionItemSelected = false;
			this.valueBeforeItemSelection = "";
			this.valueBeforeItemPreview = "";
			this.suggestionSelectionCanceled = false;
			this._changeFired = false;
			this.previousValue = undefined;
			this.firstRendering = true;
			this.highlightValue = "";
			this._backspaceKeyDown = false;
			this.EVENT_CHANGE = "change";
			this.EVENT_INPUT = "input";
			this.EVENT_SUGGESTION_ITEM_SELECT = "suggestion-item-select";
			this.ACTION_ENTER = "enter";
			this.ACTION_USER_INPUT = "input";
			this.suggestionsTexts = [];
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
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
			const FormSupport = FeaturesRegistry.getFeature("FormSupport");
			if (FormSupport) {
				FormSupport.syncNativeHiddenInput(this);
			} else if (this.name) {
				console.warn(`In order for the "name" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`);
			}
		}
		async onAfterRendering() {
			if (!this.firstRendering && !Device.isPhone() && this.Suggestions) {
				const shouldOpenSuggestions = this.shouldOpenSuggestions();
				this.Suggestions.toggle(shouldOpenSuggestions, {
					preventFocusRestore: !this.hasSuggestionItemSelected,
				});
				await Render.renderFinished();
				this._listWidth = await this.Suggestions._getListWidth();
				if (!Device.isPhone() && shouldOpenSuggestions) {
					(await this.getInputDOMRef()).focus();
				}
			}
			if (!this.firstRendering && this.hasValueStateMessage) {
				this.toggle(this.shouldDisplayOnlyValueStateMessage);
			}
			this.firstRendering = false;
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
			if (Keys.isEscape(event)) {
				return this._handleEscape(event);
			}
			if (Keys.isBackSpace(event)) {
				this._backspaceKeyDown = true;
				this._selectedText = window.getSelection().toString();
			}
			if (this.showSuggestions) {
				this.Suggestions._deselectItems();
			}
			this._keyDown = true;
		}
		_onkeyup(event) {
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
			}
		}
		_handleEscape() {
			if (this.showSuggestions && this.Suggestions && this.Suggestions._isItemOnTarget()) {
				this.value = this.valueBeforeItemPreview;
				this.suggestionSelectionCanceled = true;
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
			if (focusedOutToSuggestions	|| focusedOutToValueStateMessage) {
				event.stopImmediatePropagation();
				return;
			}
			const toBeFocused = event.relatedTarget;
			if (toBeFocused && toBeFocused.classList.contains(this._id)) {
				return;
			}
			this.closePopover();
			this.previousValue = "";
			this.focused = false;
		}
		_click(event) {
			if (Device.isPhone() && !this.readonly && this.Suggestions) {
				this.Suggestions.open();
				this.isRespPopoverOpen = true;
			}
		}
		_handleChange(event) {
			if (!this._changeFired) {
				this.fireEvent(this.EVENT_CHANGE);
			}
			this._changeFired = false;
		}
		_scroll(event) {
			const detail = event.detail;
			this.fireEvent("suggestion-scroll", {
				scrollTop: detail.scrollTop,
				scrollContainer: detail.targetRef,
			});
		}
		async _handleInput(event) {
			const inputDomRef = await this.getInputDOMRef();
			const emptyValueFiredOnNumberInput = this.value && this.isTypeNumber && !inputDomRef.value;
			this.suggestionSelectionCanceled = false;
			if (emptyValueFiredOnNumberInput && !this._backspaceKeyDown) {
				return;
			}
			if (emptyValueFiredOnNumberInput && this._backspaceKeyDown) {
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
				event.stopImmediatePropagation();
			}
			const skipFiring = (inputDomRef.value === this.value) && Device.isIE() && !this._keyDown && !!this.placeholder;
			!skipFiring && this.fireEventByAction(this.ACTION_USER_INPUT);
			this.hasSuggestionItemSelected = false;
			if (this.Suggestions) {
				this.Suggestions.updateSelectedItemPosition(null);
			}
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
			}
		}
		toggle(isToggled) {
			if (isToggled && !this.isRespPopoverOpen) {
				this.openPopover();
			} else {
				this.closePopover();
			}
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
		shouldOpenSuggestions() {
			return !!(this.suggestionItems.length
				&& this.focused
				&& this.showSuggestions
				&& !this.hasSuggestionItemSelected
				&& !this.suggestionSelectionCanceled);
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
				this.fireEvent(this.EVENT_INPUT);
				this.fireEvent(this.EVENT_CHANGE);
				this._changeFired = true;
			}
			this.valueBeforeItemPreview = "";
			this.suggestionSelectionCanceled = false;
			this.fireEvent(this.EVENT_SUGGESTION_ITEM_SELECT, { item });
		}
		previewSuggestion(item) {
			this.valueBeforeItemSelection = this.value;
			this.updateValueOnPreview(item);
			this.announceSelectedItem();
			this._previewItem = item;
		}
		updateValueOnPreview(item) {
			const noPreview = item.type === "Inactive" || item.group;
			const itemValue = noPreview ? "" : (item.effectiveTitle || item.textContent);
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
				this.fireEvent(this.EVENT_CHANGE);
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
			if (Device.isPhone() && this.Suggestions && this.suggestionItems.length) {
				await this.Suggestions._respPopover();
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
			const i18nBundle = this.i18nBundle;
			return {
				"Success": i18nBundle.getText(i18nDefaults.VALUE_STATE_SUCCESS),
				"Information": i18nBundle.getText(i18nDefaults.VALUE_STATE_INFORMATION),
				"Error": i18nBundle.getText(i18nDefaults.VALUE_STATE_ERROR),
				"Warning": i18nBundle.getText(i18nDefaults.VALUE_STATE_WARNING),
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
			return this.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_TITLE);
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
				popoverValueState: {
					"ui5-valuestatemessage-root": true,
					"ui5-responsive-popover-header": !this.isValueStateOpened(),
					"ui5-valuestatemessage--success": this.valueState === ValueState__default.Success,
					"ui5-valuestatemessage--error": this.valueState === ValueState__default.Error,
					"ui5-valuestatemessage--warning": this.valueState === ValueState__default.Warning,
					"ui5-valuestatemessage--information": this.valueState === ValueState__default.Information,
				},
			};
		}
		get styles() {
			const stylesObject = {
				popoverHeader: {
					"max-width": `${this._inputWidth}px`,
				},
				suggestionPopoverHeader: {
					"display": this._listWidth === 0 ? "none" : "inline-block",
					"width": `${this._listWidth}px`,
					"padding": "0.925rem 1rem",
				},
				suggestionsPopover: {
					"max-width": `${this._inputWidth}px`,
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
			return this.hasValueStateMessage && !this.shouldOpenSuggestions() && this.focused;
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
			return this.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS);
		}
		get availableSuggestionsCount() {
			if (this.showSuggestions && (this.value || this.Suggestions.isOpened())) {
				switch (this.suggestionsTexts.length) {
				case 0:
					return this.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_NO_HIT);
				case 1:
					return this.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_ONE_HIT);
				default:
					return this.i18nBundle.getText(i18nDefaults.INPUT_SUGGESTIONS_MORE_HITS, this.suggestionsTexts.length);
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
		get _placeholder() {
			return this.placeholder;
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
			return [Popover].concat(Suggestions ? Suggestions.dependencies : []);
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
	}
	Input.define();

	return Input;

});
