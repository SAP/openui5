sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/Float', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/Keys', './SliderBase', './Icon', './generated/templates/SliderTemplate.lit', './generated/i18n/i18n-defaults'], function (Float, i18nBundle, Keys, SliderBase, Icon, SliderTemplate_lit, i18nDefaults) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var Float__default = /*#__PURE__*/_interopDefaultLegacy(Float);

	const metadata = {
		tag: "ui5-slider",
		languageAware: true,
		managedSlots: true,
		properties:   {
			value: {
				type: Float__default,
				defaultValue: 0,
			},
		},
	};
	class Slider extends SliderBase {
		static get metadata() {
			return metadata;
		}
		static get template() {
			return SliderTemplate_lit;
		}
		constructor() {
			super();
			this._stateStorage.value = null;
			this._setInitialValue("value", null);
		}
		static get dependencies() {
			return [Icon];
		}
		onBeforeRendering() {
			if (!this.isCurrentStateOutdated()) {
				return;
			}
			this.notResized = true;
			this.syncUIAndState("value");
			this._updateHandleAndProgress(this.value);
		}
		_onmousedown(event) {
			if (this.disabled || this.step === 0) {
				return;
			}
			const newValue = this.handleDownBase(event);
			this._valueOnInteractionStart = this.value;
			if (this._getInitialValue("value") === null) {
				this._setInitialValue("value", this.value);
			}
			if (!this._isHandlePressed(this.constructor.getPageXValueFromEvent(event))) {
				this._updateHandleAndProgress(newValue);
				this.updateValue("value", newValue);
			}
		}
		_onfocusin(event) {
			if (this._getInitialValue("value") === null) {
				this._setInitialValue("value", this.value);
			}
			if (this.showTooltip) {
				this._tooltipVisibility = SliderBase.TOOLTIP_VISIBILITY.VISIBLE;
			}
		}
		_onfocusout(event) {
			if (this._isFocusing()) {
				this._preventFocusOut();
				return;
			}
			this._setInitialValue("value", null);
			if (this.showTooltip) {
				this._tooltipVisibility = SliderBase.TOOLTIP_VISIBILITY.HIDDEN;
			}
		}
		_handleMove(event) {
			event.preventDefault();
			if (this.disabled || this._effectiveStep === 0) {
				return;
			}
			const newValue = this.constructor.getValueFromInteraction(event, this._effectiveStep, this._effectiveMin, this._effectiveMax, this.getBoundingClientRect(), this.directionStart);
			this._updateHandleAndProgress(newValue);
			this.updateValue("value", newValue);
		}
		_handleUp(event) {
			if (this._valueOnInteractionStart !== this.value) {
				this.fireEvent("change");
			}
			this.handleUpBase();
			this._valueOnInteractionStart = null;
		}
		_isHandlePressed(clientX) {
			const sliderHandleDomRect = this._sliderHandle.getBoundingClientRect();
			return clientX >= sliderHandleDomRect.left && clientX <= sliderHandleDomRect.right;
		}
		_updateHandleAndProgress(newValue) {
			const max = this._effectiveMax;
			const min = this._effectiveMin;
			this._progressPercentage = (newValue - min) / (max - min);
			this._handlePositionFromStart = this._progressPercentage * 100;
		}
		_handleActionKeyPress(event) {
			const min = this._effectiveMin;
			const max = this._effectiveMax;
			const currentValue = this.value;
			const newValue = Keys.isEscape(event) ? this._getInitialValue("value") : this.constructor.clipValue(this._handleActionKeyPressBase(event, "value") + currentValue, min, max);
			if (newValue !== currentValue) {
				this._updateHandleAndProgress(newValue);
				this.updateValue("value", newValue);
			}
		}
		get styles() {
			return {
				progress: {
					"transform": `scaleX(${this._progressPercentage})`,
					"transform-origin": `${this.directionStart} top`,
				},
				handle: {
					[this.directionStart]: `${this._handlePositionFromStart}%`,
				},
				label: {
					"width": `${this._labelWidth}%`,
				},
				labelContainer: {
					"width": `100%`,
					[this.directionStart]: `-${this._labelWidth / 2}%`,
				},
				tooltip: {
					"visibility": `${this._tooltipVisibility}`,
				},
			};
		}
		get _sliderHandle() {
			return this.shadowRoot.querySelector(".ui5-slider-handle");
		}
		get labelItems() {
			return this._labelItems;
		}
		get tooltipValue() {
			const stepPrecision = this.constructor._getDecimalPrecisionOfNumber(this._effectiveStep);
			return this.value.toFixed(stepPrecision);
		}
		get _ariaDisabled() {
			return this.disabled || undefined;
		}
		get _ariaLabelledByText() {
			return Slider.i18nBundle.getText(i18nDefaults.SLIDER_ARIA_DESCRIPTION);
		}
		static async onDefine() {
			Slider.i18nBundle = await i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		get tickmarksObject() {
			const count = this._tickmarksCount;
			const arr = [];
			if (this._hiddenTickmarks) {
				return [true, false];
			}
			for (let i = 0; i <= count; i++) {
				arr.push(this._effectiveMin + (i * this.step) <= this.value);
			}
			return arr;
		}
	}
	Slider.define();

	return Slider;

});
