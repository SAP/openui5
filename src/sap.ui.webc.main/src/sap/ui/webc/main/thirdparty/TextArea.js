sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/FeaturesRegistry', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/types/ValueState', './Popover', './generated/templates/TextAreaTemplate.lit', './generated/templates/TextAreaPopoverTemplate.lit', './generated/i18n/i18n-defaults', './generated/themes/TextArea.css', './generated/themes/ValueStateMessage.css'], function (UI5Element, litRender, ResizeHandler, Integer, AriaLabelHelper, i18nBundle, FeaturesRegistry, Device, Keys, ValueState, Popover, TextAreaTemplate_lit, TextAreaPopoverTemplate_lit, i18nDefaults, TextArea_css, ValueStateMessage_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var ValueState__default = /*#__PURE__*/_interopDefaultLegacy(ValueState);

	const metadata = {
		tag: "ui5-textarea",
		languageAware: true,
		managedSlots: true,
		properties:  {
			value: {
				type: String,
			},
			disabled: {
				type: Boolean,
			},
			readonly: {
				type: Boolean,
			},
			required: {
				type: Boolean,
			},
			placeholder: {
				type: String,
			},
			valueState: {
				type: ValueState__default,
				defaultValue: ValueState__default.None,
			},
			rows: {
				type: Integer__default,
				defaultValue: 0,
			},
			maxlength: {
				type: Integer__default,
				defaultValue: null,
			},
			showExceededText: {
				type: Boolean,
			},
			growing: {
				type: Boolean,
			},
			growingMaxLines: {
				type: Integer__default,
				defaultValue: 0,
			},
			name: {
				type: String,
			},
			accessibleName: {
				type: String,
			},
			accessibleNameRef: {
				type: String,
			},
			focused: {
				type: Boolean,
			},
			exceeding: {
				type: Boolean,
			},
			_mirrorText: {
				type: Object,
				multiple: true,
				defaultValue: "",
			},
			_maxHeight: {
				type: String,
				noAttribute: true,
			},
			_width: {
				type: Integer__default,
			},
		},
		slots:  {
			valueStateMessage: {
				type: HTMLElement,
			},
			formSupport: {
				type: HTMLElement,
			},
		},
		events:  {
			change: {},
			input: {},
		},
	};
	class TextArea extends UI5Element__default {
		static get metadata() {
			return metadata;
		}
		static get styles() {
			return TextArea_css;
		}
		static get render() {
			return litRender__default;
		}
		static get template() {
			return TextAreaTemplate_lit;
		}
		static get staticAreaTemplate() {
			return TextAreaPopoverTemplate_lit;
		}
		static get staticAreaStyles() {
			return ValueStateMessage_css;
		}
		constructor() {
			super();
			this._firstRendering = true;
			this._openValueStateMsgPopover = false;
			this._fnOnResize = this._onResize.bind(this);
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		onEnterDOM() {
			ResizeHandler__default.register(this, this._fnOnResize);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this, this._fnOnResize);
		}
		onBeforeRendering() {
			this._exceededTextProps = this._calcExceededText();
			this._mirrorText = this._tokenizeText(this.value);
			this.exceeding = this._exceededTextProps.leftCharactersCount < 0;
			if (this.growingMaxLines) {
				this._maxHeight = `${this.growingMaxLines * 1.4 * 14 + 9}px`;
			}
			const FormSupport = FeaturesRegistry.getFeature("FormSupport");
			if (FormSupport) {
				FormSupport.syncNativeHiddenInput(this);
			} else if (this.name) {
				console.warn(`In order for the "name" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`);
			}
		}
		onAfterRendering() {
			this.toggleValueStateMessage(this.openValueStateMsgPopover);
			this._firstRendering = false;
		}
		getInputDomRef() {
			return this.getDomRef().querySelector("textarea");
		}
		_onkeydown(event) {
			this._keyDown = true;
			if (Keys.isEscape(event)) {
				const nativeTextArea = this.getInputDomRef();
				this.value = this.previousValue;
				nativeTextArea.value = this.value;
				this.fireEvent("input");
			}
		}
		_onkeyup() {
			this._keyDown = false;
		}
		_onfocusin() {
			this.focused = true;
			this._openValueStateMsgPopover = true;
			this.previousValue = this.getInputDomRef().value;
		}
		_onfocusout() {
			this.focused = false;
			this._openValueStateMsgPopover = false;
		}
		_onchange() {
			this.fireEvent("change", {});
		}
		_oninput(event) {
			const nativeTextArea = this.getInputDomRef();
			const skipFiring = (nativeTextArea.value === this.value) && Device.isIE() && !this._keyDown && !!this.placeholder;
			if (event.target === nativeTextArea) {
				event.stopImmediatePropagation();
			}
			if (skipFiring) {
				return;
			}
			this.value = nativeTextArea.value;
			this.fireEvent("input", {});
			this.fireEvent("value-changed");
		}
		_onResize() {
			if (this.displayValueStateMessagePopover) {
				this._width = this.offsetWidth;
			}
		}
		toggleValueStateMessage(toggle) {
			if (toggle) {
				this.openPopover();
			} else {
				this.closePopover();
			}
		}
		async openPopover() {
			this.popover = await this._getPopover();
			this.popover && this.popover.showAt(this.shadowRoot.querySelector(".ui5-textarea-inner"));
		}
		async closePopover() {
			this.popover = await this._getPopover();
			this.popover && this.popover.close();
		}
		async _getPopover() {
			const staticAreaItem = await this.getStaticAreaItemDomRef();
			return staticAreaItem.querySelector("[ui5-popover]");
		}
		_tokenizeText(value) {
			const tokenizedText = value.replace(/&/gm, "&amp;").replace(/"/gm, "&quot;").replace(/'/gm, "&apos;").replace(/</gm, "&lt;")
				.replace(/>/gm, "&gt;")
				.split("\n");
			if (tokenizedText.length < this.rows) {
				return this._mapTokenizedTextToObject([...tokenizedText, ...Array(this.rows - tokenizedText.length).fill("")]);
			}
			return this._mapTokenizedTextToObject(tokenizedText);
		}
		_mapTokenizedTextToObject(tokenizedText) {
			return tokenizedText.map((token, index) => {
				return {
					text: token,
					last: index === (tokenizedText.length - 1),
				};
			});
		}
		_calcExceededText() {
			let calcedMaxLength,
				exceededText,
				leftCharactersCount;
			if (this.showExceededText) {
				const maxLength = this.maxlength || 0;
				if (maxLength) {
					leftCharactersCount = maxLength - this.value.length;
					if (leftCharactersCount >= 0) {
						exceededText = this.i18nBundle.getText(i18nDefaults.TEXTAREA_CHARACTERS_LEFT, [leftCharactersCount]);
					} else {
						exceededText = this.i18nBundle.getText(i18nDefaults.TEXTAREA_CHARACTERS_EXCEEDED, [Math.abs(leftCharactersCount)]);
					}
				}
			} else {
				calcedMaxLength = this.maxlength;
			}
			return {
				exceededText, leftCharactersCount, calcedMaxLength,
			};
		}
		get classes() {
			return {
				valueStateMsg: {
					"ui5-valuestatemessage--error": this.valueState === ValueState__default.Error,
					"ui5-valuestatemessage--warning": this.valueState === ValueState__default.Warning || this.exceeding,
					"ui5-valuestatemessage--information": this.valueState === ValueState__default.Information,
				},
			};
		}
		get styles() {
			const lineHeight = 1.4 * 16;
			return {
				mirror: {
					"max-height": this._maxHeight,
				},
				main: {
					width: "100%",
					height: (this.rows && !this.growing) ? `${this.rows * lineHeight}px` : "100%",
				},
				focusDiv: {
					"height": (this.showExceededText ? "calc(100% - 26px)" : "100%"),
					"max-height": (this._maxHeight),
				},
				valueStateMsgPopover: {
					"max-width": `${this._width}px`,
				},
			};
		}
		get tabIndex() {
			return this.disabled ? undefined : "0";
		}
		get ariaLabelText() {
			const effectiveAriaLabelText = AriaLabelHelper.getEffectiveAriaLabelText(this);
			if (this.showExceededText) {
				if (effectiveAriaLabelText) {
					return `${effectiveAriaLabelText} ${this._exceededTextProps.exceededText}`;
				}
				return this._exceededTextProps.exceededText;
			}
			return effectiveAriaLabelText;
		}
		get ariaDescribedBy() {
			return this.hasValueState ? `${this._id}-valueStateDesc` : undefined;
		}
		get ariaValueStateHiddenText() {
			if (!this.hasValueState) {
				return;
			}
			if (this.hasCustomValueState) {
				return this.valueStateMessageText.map(el => el.textContent).join(" ");
			}
			return this.valueStateText;
		}
		get ariaInvalid() {
			return this.valueState === "Error" ? "true" : undefined;
		}
		get openValueStateMsgPopover() {
			return !this._firstRendering && this._openValueStateMsgPopover && this.displayValueStateMessagePopover;
		}
		get displayValueStateMessagePopover() {
			return this.hasCustomValueState || this.hasValueState || this.exceeding;
		}
		get hasCustomValueState() {
			return !!this.valueStateMessage.length && this.hasValueState;
		}
		get hasValueState() {
			return this.valueState === ValueState__default.Error || this.valueState === ValueState__default.Warning || this.valueState === ValueState__default.Information;
		}
		get valueStateMessageText() {
			return this.valueStateMessage.map(x => x.cloneNode(true));
		}
		get valueStateText() {
			if (this.valueState !== ValueState__default.Error && this.exceeding) {
				return this.valueStateTextMappings()[ValueState__default.Warning];
			}
			return this.valueStateTextMappings()[this.valueState];
		}
		valueStateTextMappings() {
			const i18nBundle = this.i18nBundle;
			return {
				"Information": i18nBundle.getText(i18nDefaults.VALUE_STATE_INFORMATION),
				"Error": i18nBundle.getText(i18nDefaults.VALUE_STATE_ERROR),
				"Warning": i18nBundle.getText(i18nDefaults.VALUE_STATE_WARNING),
			};
		}
		static get dependencies() {
			return [Popover];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
	}
	TextArea.define();

	return TextArea;

});
