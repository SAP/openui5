sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/Keys', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/types/ValueState', 'sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper', 'sap/ui/webc/common/thirdparty/base/FeaturesRegistry', 'sap/ui/webc/common/thirdparty/base/types/Float', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', './generated/templates/StepInputTemplate.lit', './generated/i18n/i18n-defaults', 'sap/ui/webc/common/thirdparty/icons/less', 'sap/ui/webc/common/thirdparty/icons/add', './Icon', './Input', './types/InputType', './generated/themes/StepInput.css'], function (UI5Element, Keys, i18nBundle, ValueState, AriaLabelHelper, FeaturesRegistry, Float, Integer, litRender, StepInputTemplate_lit, i18nDefaults, less, add, Icon, Input, InputType, StepInput_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var ValueState__default = /*#__PURE__*/_interopDefaultLegacy(ValueState);
	var Float__default = /*#__PURE__*/_interopDefaultLegacy(Float);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);

	const metadata = {
		tag: "ui5-step-input",
		managedSlots: true,
		properties:  {
			value: {
				type: Float__default,
				defaultValue: 0,
			},
			min: {
				type: Float__default,
			},
			max: {
				type: Float__default,
			},
			step: {
				type: Float__default,
				defaultValue: 1,
			},
			valueState: {
				type: ValueState__default,
				defaultValue: ValueState__default.None,
			},
			required: {
				type: Boolean,
			},
			disabled: {
				type: Boolean,
			},
			readonly: {
				type: Boolean,
			},
			placeholder: {
				type: String,
				defaultValue: undefined,
			},
			name: {
				type: String,
			},
			valuePrecision: {
				type: Integer__default,
				defaultValue: 0,
			},
			accessibleName: {
				type: String,
			},
			accessibleNameRef: {
				type: String,
				defaultValue: "",
			},
			_decIconDisabled: {
				type: Boolean,
				noAttribute: true,
			},
			_incIconDisabled: {
				type: Boolean,
				noAttribute: true,
			},
			_focused: {
				type: Boolean,
				noAttribute: true,
			},
			_inputFocused: {
				type: Boolean,
				noAttribute: true,
			},
			_previousValue: {
				type: Float__default,
				noAttribute: true,
			},
			_previousValueState: {
				type: String,
				noAttribute: true,
				defaultValue: "",
			},
			_waitTimeout: {
				type: Float__default,
				noAttribute: true,
			},
			_speed: {
				type: Float__default,
				noAttribute: true,
			},
			_btnDown: {
				type: Boolean,
				noAttribute: true,
			},
			_spinTimeoutId: {
				type: Integer__default,
				noAttribute: true,
			},
			_spinStarted: {
				type: Boolean,
				noAttribute: true,
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
		},
	};
	const INITIAL_WAIT_TIMEOUT = 500;
	const ACCELERATION = 0.8;
	const MIN_WAIT_TIMEOUT = 50;
	const INITIAL_SPEED = 120;
	class StepInput extends UI5Element__default {
		constructor() {
			super();
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return StepInput_css;
		}
		static get template() {
			return StepInputTemplate_lit;
		}
		static get dependencies() {
			return [
				Icon,
				Input,
			];
		}
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
		get type() {
			return InputType.Number;
		}
		get decIconTitle() {
			return this.i18nBundle.getText(i18nDefaults.STEPINPUT_DEC_ICON_TITLE);
		}
		get decIconName() {
			return "less";
		}
		get incIconTitle() {
			return this.i18nBundle.getText(i18nDefaults.STEPINPUT_INC_ICON_TITLE);
		}
		get incIconName() {
			return "add";
		}
		get _decIconClickable() {
			return !this._decIconDisabled && !this.readonly && !this.disabled;
		}
		get _incIconClickable() {
			return !this._incIconDisabled && !this.readonly && !this.disabled;
		}
		get _isFocused() {
			return this._focused;
		}
		get _valuePrecisioned() {
			return this.value.toFixed(this.valuePrecision);
		}
		get accInfo() {
			return {
				"ariaRequired": this.required,
				"ariaLabel": AriaLabelHelper.getEffectiveAriaLabelText(this),
			};
		}
		get inputAttributes() {
			return {
				min: this.min === undefined ? undefined : this.min,
				max: this.max === undefined ? undefined : this.max,
				step: this.step,
			};
		}
		onBeforeRendering() {
			this._setButtonState();
			if (this._previousValue === undefined) {
				this._previousValue = this.value;
			}
			const FormSupport = FeaturesRegistry.getFeature("FormSupport");
			if (FormSupport) {
				FormSupport.syncNativeHiddenInput(this);
			} else if (this.name) {
				console.warn(`In order for the "name" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`);
			}
		}
		get input() {
			return this.shadowRoot.querySelector("[ui5-input]");
		}
		get inputOuter() {
			return this.shadowRoot.querySelector(".ui5-step-input-input");
		}
		_onButtonFocusOut() {
			setTimeout(() => {
				if (!this._inputFocused) {
					this.inputOuter.removeAttribute("focused");
				}
			}, 0);
		}
		_onInputFocusIn() {
			this._inputFocused = true;
		}
		_onInputFocusOut() {
			this._inputFocused = false;
			this._onInputChange();
		}
		_setButtonState() {
			this._decIconDisabled = this.min !== undefined && this.value <= this.min;
			this._incIconDisabled = this.max !== undefined && this.value >= this.max;
		}
		_validate() {
			if (this._previousValueState === "") {
				this._previousValueState = this.valueState !== "" ? this.valueState : ValueState__default.None;
			}
			this.valueState = ((this.min !== undefined && this.value < this.min)
				|| (this.max !== undefined && this.value > this.max))
				? ValueState__default.Error : this._previousValueState;
		}
		_preciseValue(value) {
			const pow = 10 ** this.valuePrecision;
			return Math.round(value * pow) / pow;
		}
		_fireChangeEvent() {
			if (this._previousValue !== this.value) {
				this._previousValue = this.value;
				this.fireEvent("change", { value: this.value });
			}
		}
		_modifyValue(modifier, fireChangeEvent) {
			let value;
			this.value = this._preciseValue(parseFloat(this.input.value));
			value = this.value + modifier;
			if (this.min !== undefined && value < this.min) {
				value = this.min;
			}
			if (this.max !== undefined && value > this.max) {
				value = this.max;
			}
			value = this._preciseValue(value);
			if (value !== this.value) {
				this.value = value;
				this._validate();
				this._setButtonState();
				this._focused = true;
				this.inputOuter.setAttribute("focused", "");
				if (fireChangeEvent) {
					this._fireChangeEvent();
				} else {
					this.input.focus();
				}
			}
		}
		_incValue(event) {
			if (this._incIconClickable && event.isTrusted && !this.disabled && !this.readonly) {
				this._modifyValue(this.step, true);
				this._previousValue = this.value;
			}
		}
		_decValue(event) {
			if (this._decIconClickable && event.isTrusted && !this.disabled && !this.readonly) {
				this._modifyValue(-this.step, true);
				this._previousValue = this.value;
			}
		}
		_onInputChange(event) {
			if (this.input.value === "") {
				this.input.value = this.min || 0;
			}
			const inputValue = this._preciseValue(parseFloat(this.input.value));
			if (this.value !== this._previousValue || this.value !== inputValue) {
				this.value = inputValue;
				this._validate();
				this._setButtonState();
				this._fireChangeEvent();
			}
		}
		_onfocusin() {
			this._focused = true;
		}
		_onfocusout() {
			this._focused = false;
		}
		_onkeydown(event) {
			let preventDefault = true;
			if (this.disabled || this.readonly) {
				return;
			}
			if (Keys.isEnter(event)) {
				this._onInputChange();
				return;
			}
			if (Keys.isUp(event)) {
				this._modifyValue(this.step);
			} else if (Keys.isDown(event)) {
				this._modifyValue(-this.step);
			} else if (Keys.isEscape(event)) {
				this.value = this._previousValue;
				this.input.value = this.value.toFixed(this.valuePrecision);
			} else if (this.max !== undefined && (Keys.isPageUpShift(event) || Keys.isUpShiftCtrl(event))) {
				this._modifyValue(this.max - this.value);
			} else if (this.min !== undefined && (Keys.isPageDownShift(event) || Keys.isDownShiftCtrl(event))) {
				this._modifyValue(this.min - this.value);
			} else if (!Keys.isUpCtrl(event) && !Keys.isDownCtrl(event) && !Keys.isUpShift(event) && !Keys.isDownShift(event)) {
				preventDefault = false;
			}
			if (preventDefault) {
				event.preventDefault();
			}
		}
		_decSpin() {
			if (!this._decIconDisabled) {
				this._spinValue(false, true);
			}
		}
		_incSpin() {
			if (!this._incIconDisabled) {
				this._spinValue(true, true);
			}
		}
		_calcWaitTimeout() {
			this._speed *= ACCELERATION;
			this._waitTimeout = ((this._waitTimeout - this._speed) < MIN_WAIT_TIMEOUT ? MIN_WAIT_TIMEOUT : (this._waitTimeout - this._speed));
			return this._waitTimeout;
		}
		_spinValue(increment, resetVariables) {
			if (resetVariables) {
				this._waitTimeout = INITIAL_WAIT_TIMEOUT;
				this._speed = INITIAL_SPEED;
				this._btnDown = true;
			}
			this._spinTimeoutId = setTimeout(() => {
				if (this._btnDown) {
					this._spinStarted = true;
					this._modifyValue(increment ? this.step : -this.step);
					this._setButtonState();
					if ((!this._incIconDisabled && increment) || (!this._decIconDisabled && !increment)) {
						this._spinValue(increment);
					} else {
						this._resetSpin();
						this._fireChangeEvent();
					}
				}
			}, this._calcWaitTimeout());
		}
		_resetSpin() {
			clearTimeout(this._spinTimeoutId);
			this._btnDown = false;
			this._spinStarted = false;
		}
		_resetSpinOut() {
			if (this._btnDown) {
				this._resetSpin();
				this._fireChangeEvent();
			}
		}
	}
	StepInput.define();

	return StepInput;

});
