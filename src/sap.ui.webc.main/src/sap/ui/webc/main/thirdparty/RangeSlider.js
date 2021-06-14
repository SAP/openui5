sap.ui.define(['sap/ui/webc/common/thirdparty/base/types/Float', 'sap/ui/webc/common/thirdparty/base/i18nBundle', 'sap/ui/webc/common/thirdparty/base/Keys', './SliderBase', './generated/templates/RangeSliderTemplate.lit', './generated/i18n/i18n-defaults'], function (Float, i18nBundle, Keys, SliderBase, RangeSliderTemplate_lit, i18nDefaults) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var Float__default = /*#__PURE__*/_interopDefaultLegacy(Float);

	const metadata = {
		tag: "ui5-range-slider",
		languageAware: true,
		managedSlots: true,
		properties:   {
			startValue: {
				type: Float__default,
				defaultValue: 0,
			},
			endValue: {
				type: Float__default,
				defaultValue: 100,
			},
		},
	};
	class RangeSlider extends SliderBase {
		static get metadata() {
			return metadata;
		}
		static get template() {
			return RangeSliderTemplate_lit;
		}
		static get VALUES() {
			return {
				start: "startValue",
				end: "endValue",
			};
		}
		constructor() {
			super();
			this._stateStorage.startValue = null;
			this._stateStorage.endValue = null;
			this.i18nBundle = i18nBundle.getI18nBundle("@ui5/webcomponents");
		}
		get tooltipStartValue() {
			const stepPrecision = this.constructor._getDecimalPrecisionOfNumber(this._effectiveStep);
			return this.startValue.toFixed(stepPrecision);
		}
		get tooltipEndValue() {
			const stepPrecision = this.constructor._getDecimalPrecisionOfNumber(this._effectiveStep);
			return this.endValue.toFixed(stepPrecision);
		}
		get _ariaDisabled() {
			return this.disabled || undefined;
		}
		get _ariaLabelledByText() {
			return this.i18nBundle.getText(i18nDefaults.RANGE_SLIDER_ARIA_DESCRIPTION);
		}
		get _ariaHandlesText() {
			const isRTL = this.effectiveDir === "rtl";
			const isReversed = this._areValuesReversed();
			const ariaHandlesText = {};
			if ((isRTL && !isReversed) || (!isRTL && isReversed)) {
				ariaHandlesText.startHandleText = this.i18nBundle.getText(i18nDefaults.RANGE_SLIDER_END_HANDLE_DESCRIPTION);
				ariaHandlesText.endHandleText = this.i18nBundle.getText(i18nDefaults.RANGE_SLIDER_START_HANDLE_DESCRIPTION);
			} else {
				ariaHandlesText.startHandleText = this.i18nBundle.getText(i18nDefaults.RANGE_SLIDER_START_HANDLE_DESCRIPTION);
				ariaHandlesText.endHandleText = this.i18nBundle.getText(i18nDefaults.RANGE_SLIDER_END_HANDLE_DESCRIPTION);
			}
			return ariaHandlesText;
		}
		onBeforeRendering() {
			if (!this.isCurrentStateOutdated()) {
				return;
			}
			this.notResized = true;
			this.syncUIAndState("startValue", "endValue");
			this._updateHandlesAndRange(null);
		}
		_onfocusin(event) {
			if (!this._getInitialValue("endValue")) {
				this._setInitialValue("startValue", this.startValue);
				this._setInitialValue("endValue", this.endValue);
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
			this._setAffectedValue(null);
			this._setInitialValue("startValue", null);
			this._setInitialValue("endValue", null);
			if (this.showTooltip) {
				this._tooltipVisibility = SliderBase.TOOLTIP_VISIBILITY.HIDDEN;
			}
		}
		_onkeyup(event) {
			super._onkeyup(event);
			this._swapValues();
			this._setAffectedValue(null);
		}
		_handleActionKeyPress(event) {
			if (Keys.isEscape(event)) {
				this.update(null, this._getInitialValue("startValue"), this._getInitialValue("endValue"));
				return;
			}
			this._setAffectedValueByFocusedElement();
			const min = this._effectiveMin;
			const max = this._effectiveMax;
			const affectedValue = this._valueAffected;
			if ((Keys.isEnd(event) || Keys.isHome(event)) && !affectedValue) {
				this._homeEndForSelectedRange(event, Keys.isHome(event) ? "startValue" : "endValue", min, max);
				return;
			}
			const newValueOffset = this._handleActionKeyPressBase(event, affectedValue);
			if (!newValueOffset) {
				return;
			}
			if (affectedValue && !this._isPressInCurrentRange) {
				const newValue = this.constructor.clipValue(newValueOffset + this[affectedValue], min, max);
				this.update(affectedValue, newValue, null);
			} else if ((newValueOffset < 0 && this.startValue > min) || (newValueOffset > 0 && this.endValue < max)) {
				const newStartValue = this.constructor.clipValue(newValueOffset + this.startValue, min, max);
				const newEndValue = this.constructor.clipValue(newValueOffset + this.endValue, min, max);
				this.update(affectedValue, newStartValue, newEndValue);
			}
		}
		_setAffectedValueByFocusedElement() {
			if (this.shadowRoot.activeElement === this._startHandle) {
				this._setAffectedValue(RangeSlider.VALUES.start);
			}
			if (this.shadowRoot.activeElement === this._endHandle) {
				this._setAffectedValue(RangeSlider.VALUES.end);
			}
			if (this.shadowRoot.activeElement === this._progressBar) {
				this._setAffectedValue(null);
			}
			this._setIsPressInCurrentRange(!this._valueAffected);
		}
		_homeEndForSelectedRange(event, affectedValue, min, max) {
			const newValueOffset = this._handleActionKeyPressBase(event, affectedValue);
			const newStartValue = this.constructor.clipValue(newValueOffset + this.startValue, min, max);
			const newEndValue = this.constructor.clipValue(newValueOffset + this.endValue, min, max);
			this.update(null, newStartValue, newEndValue);
		}
		update(affectedValue, startValue, endValue) {
			if (!affectedValue) {
				this.updateValue("startValue", startValue);
				this.updateValue("endValue", endValue);
				this._updateHandlesAndRange(null);
			} else {
				const newValue = startValue;
				this._updateHandlesAndRange(newValue);
				this.updateValue(affectedValue, newValue);
			}
		}
		_onmousedown(event) {
			if (this.disabled || this._effectiveStep === 0) {
				return;
			}
			const newValue = this.handleDownBase(event);
			this._saveInteractionStartData(event, newValue);
			if (this._isPressInCurrentRange || this._handeIsPressed) {
				this._handeIsPressed = false;
				return;
			}
			this.update(this._valueAffected, newValue, null);
		}
		_saveInteractionStartData(event, newValue) {
			const progressBarDom = this.shadowRoot.querySelector(".ui5-slider-progress").getBoundingClientRect();
			this._startValueAtBeginningOfAction = this.startValue;
			this._endValueAtBeginningOfAction = this.endValue;
			this._initialPageXPosition = this.constructor.getPageXValueFromEvent(event);
			this._pressTargetAndAffectedValue(this._initialPageXPosition, newValue);
			this._initialStartHandlePageX = this.directionStart === "left" ? progressBarDom.left : progressBarDom.right;
		}
		_handleMove(event) {
			event.preventDefault();
			if (this.disabled || this._effectiveStep === 0) {
				return;
			}
			if (!this._isPressInCurrentRange) {
				this._updateValueOnHandleDrag(event);
				return;
			}
			this._updateValueOnRangeDrag(event);
		}
		_updateValueOnHandleDrag(event) {
			const newValue = this.constructor.getValueFromInteraction(event, this._effectiveStep, this._effectiveMin, this._effectiveMax, this.getBoundingClientRect(), this.directionStart);
			this.update(this._valueAffected, newValue, null);
		}
		_updateValueOnRangeDrag(event) {
			const currentPageXPos = this.constructor.getPageXValueFromEvent(event);
			const newValues = this._calculateRangeOffset(currentPageXPos, this._initialStartHandlePageX);
			this._setAffectedValue(null);
			this.update(null, newValues[0], newValues[1]);
		}
		_handleUp() {
			if (this.startValue !== this._startValueAtBeginningOfAction || this.endValue !== this._endValueAtBeginningOfAction) {
				this.fireEvent("change");
			}
			this._swapValues();
			this._setAffectedValueByFocusedElement();
			this._setAffectedValue(null);
			this._startValueAtBeginningOfAction = null;
			this._endValueAtBeginningOfAction = null;
			this._setIsPressInCurrentRange(false);
			this.handleUpBase();
		}
		_pressTargetAndAffectedValue(clientX, value) {
			const startHandle = this.shadowRoot.querySelector(".ui5-slider-handle--start");
			const endHandle = this.shadowRoot.querySelector(".ui5-slider-handle--end");
			const handleStartDomRect = startHandle.getBoundingClientRect();
			const handleEndDomRect = endHandle.getBoundingClientRect();
			const inHandleStartDom = clientX >= handleStartDomRect.left && clientX <= handleStartDomRect.right;
			const inHandleEndDom = clientX >= handleEndDomRect.left && clientX <= handleEndDomRect.right;
			if (inHandleEndDom || inHandleStartDom) {
				this._handeIsPressed = true;
			}
			if (inHandleEndDom || value > this.endValue) {
				this._setAffectedValue(RangeSlider.VALUES.end);
			}
			if (inHandleStartDom || value < this.startValue) {
				this._setAffectedValue(RangeSlider.VALUES.start);
			}
			const isNewValueInCurrentRange = value >= this._startValueAtBeginningOfAction && value <= this._endValueAtBeginningOfAction;
			this._setIsPressInCurrentRange(!(this._valueAffected || this._handeIsPressed) ? isNewValueInCurrentRange : false);
		}
		_setAffectedValue(valuePropAffectedByInteraction) {
			this._valueAffected = valuePropAffectedByInteraction;
			if (this._areValuesReversed()) {
				this._setValuesAreReversed();
			}
		}
		_setIsPressInCurrentRange(isPressInCurrentRange) {
			this._isPressInCurrentRange = isPressInCurrentRange;
		}
		focusInnerElement() {
			const isReversed = this._areValuesReversed();
			const affectedValue = this._valueAffected;
			if (this._isPressInCurrentRange || !affectedValue) {
				this._progressBar.focus();
			}
			if ((affectedValue === RangeSlider.VALUES.start && !isReversed) || (affectedValue === RangeSlider.VALUES.end && isReversed)) {
				this._startHandle.focus();
			}
			if ((affectedValue === RangeSlider.VALUES.end && !isReversed) || (affectedValue === RangeSlider.VALUES.start && isReversed)) {
				this._endHandle.focus();
			}
		}
		_calculateRangeOffset(currentPageXPos, initialStartHandlePageXPos) {
			if (this._initialPageXPosition === currentPageXPos) {
				return [this.startValue, this.endValue];
			}
			const min = this._effectiveMin;
			const max = this._effectiveMax;
			const selectedRange = this.endValue - this.startValue;
			let startValue = this._calculateStartValueByOffset(currentPageXPos, initialStartHandlePageXPos);
			startValue = this.constructor.clipValue(startValue, min, max - selectedRange);
			return [startValue, startValue + selectedRange];
		}
		_calculateStartValueByOffset(currentPageXPos, initialStartHandlePageXPos) {
			const min = this._effectiveMin;
			const max = this._effectiveMax;
			const step = this._effectiveStep;
			const dom = this.getBoundingClientRect();
			let startValue;
			let startValuePageX;
			let positionOffset;
			if (currentPageXPos > this._initialPageXPosition) {
				positionOffset = currentPageXPos - this._initialPageXPosition;
				startValuePageX = initialStartHandlePageXPos + positionOffset;
				startValue = this.constructor.computedValueFromPageX(startValuePageX, min, max, dom, this.directionStart);
				startValue = this.constructor.getSteppedValue(startValue, step, min);
			} else {
				positionOffset = this._initialPageXPosition - currentPageXPos;
				startValuePageX = initialStartHandlePageXPos - positionOffset;
				startValue = this.constructor.computedValueFromPageX(startValuePageX, min, max, dom, this.directionStart);
				startValue = this.constructor.getSteppedValue(startValue, step, min);
			}
			return startValue;
		}
		_updateHandlesAndRange(newValue) {
			const max = this._effectiveMax;
			const min = this._effectiveMin;
			const prevStartValue = this.getStoredPropertyState("startValue");
			const prevEndValue = this.getStoredPropertyState("endValue");
			const affectedValue = this._valueAffected;
			if (affectedValue === RangeSlider.VALUES.start) {
				this._selectedRange = (prevEndValue - newValue) / (max - min);
				this._firstHandlePositionFromStart = ((newValue - min) / (max - min)) * 100;
			} else if (affectedValue === RangeSlider.VALUES.end) {
				this._selectedRange = ((newValue - prevStartValue)) / (max - min);
				this._secondHandlePositionFromStart = ((newValue - min) / (max - min)) * 100;
			} else {
				this._selectedRange = ((this.endValue - this.startValue)) / (max - min);
				this._firstHandlePositionFromStart = ((this.startValue - min) / (max - min)) * 100;
				this._secondHandlePositionFromStart = ((this.endValue - min) / (max - min)) * 100;
			}
		}
		_swapValues() {
			const affectedValue = this._valueAffected;
			if (affectedValue === RangeSlider.VALUES.start && this.startValue > this.endValue) {
				const prevEndValue = this.endValue;
				this.endValue = this.startValue;
				this.startValue = prevEndValue;
				this._setValuesAreReversed();
				this.focusInnerElement();
			}
			if (affectedValue === RangeSlider.VALUES.end && this.endValue < this.startValue) {
				const prevStartValue = this.startValue;
				this.startValue = this.endValue;
				this.endValue = prevStartValue;
				this._setValuesAreReversed();
				this.focusInnerElement();
			}
		}
		_setValuesAreReversed() {
			this._reversedValues = !this._reversedValues;
		 }
		 _areValuesReversed() {
			return this._reversedValues;
		}
		get _startHandle() {
			return this.shadowRoot.querySelector(".ui5-slider-handle--start");
		}
		get _endHandle() {
			return this.shadowRoot.querySelector(".ui5-slider-handle--end");
		}
		get _progressBar() {
			return this.shadowRoot.querySelector(".ui5-slider-progress");
		}
		get styles() {
			return {
				progress: {
					"transform": `scaleX(${this._selectedRange})`,
					"transform-origin": `${this.directionStart} top`,
					[this.directionStart]: `${this._firstHandlePositionFromStart}%`,
				},
				startHandle: {
					[this.directionStart]: `${this._firstHandlePositionFromStart}%`,
				},
				endHandle: {
					[this.directionStart]: `${this._secondHandlePositionFromStart}%`,
				},
				tickmarks: {
					"background": `${this._tickmarks}`,
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
		static async onDefine() {
			await i18nBundle.fetchI18nBundle("@ui5/webcomponents");
		}
	}
	RangeSlider.define();

	return RangeSlider;

});
