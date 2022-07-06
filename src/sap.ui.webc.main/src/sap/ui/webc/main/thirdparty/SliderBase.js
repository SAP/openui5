sap.ui.define(['sap/ui/webc/common/thirdparty/base/UI5Element', 'sap/ui/webc/common/thirdparty/base/renderer/LitRenderer', 'sap/ui/webc/common/thirdparty/base/types/Float', 'sap/ui/webc/common/thirdparty/base/types/Integer', 'sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler', 'sap/ui/webc/common/thirdparty/base/Device', 'sap/ui/webc/common/thirdparty/icons/source-code', 'sap/ui/webc/common/thirdparty/base/Keys', './generated/themes/SliderBase.css'], function (UI5Element, litRender, Float, Integer, ResizeHandler, Device, sourceCode, Keys, SliderBase_css) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var UI5Element__default = /*#__PURE__*/_interopDefaultLegacy(UI5Element);
	var litRender__default = /*#__PURE__*/_interopDefaultLegacy(litRender);
	var Float__default = /*#__PURE__*/_interopDefaultLegacy(Float);
	var Integer__default = /*#__PURE__*/_interopDefaultLegacy(Integer);
	var ResizeHandler__default = /*#__PURE__*/_interopDefaultLegacy(ResizeHandler);

	const metadata = {
		properties:   {
			min: {
				type: Float__default,
				defaultValue: 0,
			},
			max: {
				type: Float__default,
				defaultValue: 100,
			},
			step: {
				type: Float__default,
				defaultValue: 1,
			},
			labelInterval: {
				type: Integer__default,
				defaultValue: 0,
			},
			showTickmarks: {
				type: Boolean,
			},
			showTooltip: {
				type: Boolean,
			},
			disabled: {
				type: Boolean,
			},
			 accessibleName: {
				type: String,
			},
			_tooltipVisibility: {
				type: String,
				defaultValue: "hidden",
			},
			_labelsOverlapping: {
				type: Boolean,
			},
			_hiddenTickmarks: {
				type: Boolean,
			},
		},
		events:  {
			change: {},
			input: {},
		},
	};
	class SliderBase extends UI5Element__default {
		constructor() {
			super();
			this._resizeHandler = this._handleResize.bind(this);
			this._moveHandler = this._handleMove.bind(this);
			this._upHandler = this._handleUp.bind(this);
			this._stateStorage = {
				step: null,
				min: null,
				max: null,
				labelInterval: null,
			};
			const handleTouchStartEvent = event => {
				this._onmousedown(event);
			};
			this._ontouchstart = {
				handleEvent: handleTouchStartEvent,
				passive: true,
			};
		}
		static get metadata() {
			return metadata;
		}
		static get render() {
			return litRender__default;
		}
		static get styles() {
			return SliderBase_css;
		}
		static get UP_EVENTS() {
			return ["mouseup", "touchend"];
		}
		static get MOVE_EVENT_MAP() {
			return {
				mousedown: "mousemove",
				touchstart: "touchmove",
			};
		}
		static get ACTION_KEYS() {
			return [
				Keys.isLeft,
				Keys.isRight,
				Keys.isUp,
				Keys.isDown,
				Keys.isLeftCtrl,
				Keys.isRightCtrl,
				Keys.isUpCtrl,
				Keys.isDownCtrl,
				Keys.isPlus,
				Keys.isMinus,
				Keys.isHome,
				Keys.isEnd,
				Keys.isPageUp,
				Keys.isPageDown,
				Keys.isEscape,
			];
		}
		static get MIN_SPACE_BETWEEN_TICKMARKS() {
			return 8;
		}
		static get TOOLTIP_VISIBILITY() {
			return {
				VISIBLE: "visible",
				HIDDEN: "hidden",
			};
		}
		get classes() {
			return {
				root: {
					"ui5-slider-root-phone": Device.isPhone(),
				},
				labelContainer: {
					"ui5-slider-hidden-labels": this._labelsOverlapping,
				},
			};
		}
		onEnterDOM() {
			ResizeHandler__default.register(this, this._resizeHandler);
		}
		onExitDOM() {
			ResizeHandler__default.deregister(this, this._handleResize);
		}
		onAfterRendering() {
			if (this.notResized) {
				this._resizeHandler();
			}
		}
		_onmouseover(event) {
			if (this.showTooltip) {
				this._tooltipVisibility = SliderBase.TOOLTIP_VISIBILITY.VISIBLE;
			}
		}
		_onmouseout(event) {
			if (this.showTooltip && !this.shadowRoot.activeElement) {
				this._tooltipVisibility = SliderBase.TOOLTIP_VISIBILITY.HIDDEN;
			}
		}
		_setInitialValue(valueType, value) {
			this[`_${valueType}Initial`] = value;
		}
		_getInitialValue(valueType) {
			return this[`_${valueType}Initial`];
		}
		_onkeydown(event) {
			if (this.disabled || this._effectiveStep === 0) {
				return;
			}
			if (SliderBase._isActionKey(event)) {
				event.preventDefault();
				this._isUserInteraction = true;
				this._handleActionKeyPress(event);
			}
		}
		_onkeyup(event) {
			if (this.disabled) {
				return;
			}
			this._isUserInteraction = false;
		}
		_preserveFocus(isFocusing) {
			this._isInnerElementFocusing = isFocusing;
		}
		_isFocusing() {
			return this._isInnerElementFocusing;
		}
		_preventFocusOut() {
			this.focusInnerElement();
		}
		focusInnerElement() {
			this.focus();
		}
		_handleResize() {
			if (!this.showTickmarks) {
				return;
			}
			this.notResized = false;
			const spaceBetweenTickmarks = this._spaceBetweenTickmarks();
			if (spaceBetweenTickmarks < SliderBase.MIN_SPACE_BETWEEN_TICKMARKS) {
				this._hiddenTickmarks = true;
				this._labelsOverlapping = true;
			} else {
				this._hiddenTickmarks = false;
			}
			if (this.labelInterval <= 0 || this._hiddenTickmarks) {
				return;
			}
			const labelItems = this.shadowRoot.querySelectorAll(".ui5-slider-labels li");
			this._labelsOverlapping = [...labelItems].some(label => label.scrollWidth > label.clientWidth);
		}
		handleDownBase(event) {
			const min = this._effectiveMin;
			const max = this._effectiveMax;
			const domRect = this.getBoundingClientRect();
			const directionStart = this.directionStart;
			const step = this._effectiveStep;
			const newValue = SliderBase.getValueFromInteraction(event, step, min, max, domRect, directionStart);
			this._isUserInteraction = true;
			this._moveEventType = !this._moveEventType ? SliderBase.MOVE_EVENT_MAP[event.type] : this._moveEventType;
			SliderBase.UP_EVENTS.forEach(upEventType => window.addEventListener(upEventType, this._upHandler));
			window.addEventListener(this._moveEventType, this._moveHandler);
			this._handleFocusOnMouseDown(event);
			return newValue;
		}
		_handleFocusOnMouseDown(event) {
			const focusedElement = this.shadowRoot.activeElement;
			if (!focusedElement || focusedElement !== event.target) {
				this._preserveFocus(true);
				this.focusInnerElement();
			}
		}
		handleUpBase(valueType) {
			SliderBase.UP_EVENTS.forEach(upEventType => window.removeEventListener(upEventType, this._upHandler));
			window.removeEventListener(this._moveEventType, this._moveHandler);
			this._moveEventType = null;
			this._isUserInteraction = false;
			this._preserveFocus(false);
		}
		updateValue(valueType, value) {
			this[valueType] = value;
			this.storePropertyState(valueType);
			if (this._isUserInteraction) {
				this.fireEvent("input");
			}
		}
		static _isActionKey(event) {
			return this.ACTION_KEYS.some(actionKey => actionKey(event));
		}
		static clipValue(value, min, max) {
			value = Math.min(Math.max(value, min), max);
			return value;
		}
		static getValueFromInteraction(event, stepSize, min, max, boundingClientRect, directionStart) {
			const pageX = this.getPageXValueFromEvent(event);
			const value = this.computedValueFromPageX(pageX, min, max, boundingClientRect, directionStart);
			const steppedValue = this.getSteppedValue(value, stepSize, min);
			return this.clipValue(steppedValue, min, max);
		}
		static getSteppedValue(value, stepSize, min) {
			const stepModuloValue = Math.abs((value - min) % stepSize);
			if (stepSize === 0 || stepModuloValue === 0) {
				return value;
			}
			value = (stepModuloValue * 2 >= stepSize) ? (value + stepSize) - stepModuloValue : value - stepModuloValue;
			const stepPrecision = SliderBase._getDecimalPrecisionOfNumber(stepSize);
			return value.toFixed(stepPrecision);
		}
		static getPageXValueFromEvent(event) {
			if (event.targetTouches && event.targetTouches.length > 0) {
				return event.targetTouches[0].pageX;
			}
			return event.pageX;
		}
		static computedValueFromPageX(pageX, min, max, boundingClientRect, directionStart) {
			const xRelativePosition = directionStart === "left" ? pageX - boundingClientRect[directionStart] : boundingClientRect[directionStart] - pageX;
			const percentageComplete = xRelativePosition / boundingClientRect.width;
			return min + percentageComplete * (max - min);
		}
		static _getDecimalPrecisionOfNumber(value) {
			if (Number.isInteger(value)) {
				return 0;
			}
			const match = (String(value)).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
			return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? Number(match[2]) : 0));
		}
		syncUIAndState(...values) {
			if (this.isPropertyUpdated("step")) {
				this._validateStep(this.step);
				this.storePropertyState("step");
			}
			if (this.isPropertyUpdated("min", "max", ...values)) {
				this.storePropertyState("min", "max");
				values.forEach(valueType => {
					const normalizedValue = SliderBase.clipValue(this[valueType], this._effectiveMin, this._effectiveMax);
					this.updateValue(valueType, normalizedValue);
					this.storePropertyState(valueType);
				});
			}
			if (this.labelInterval && this.showTickmarks) {
				this._createLabels();
			}
			if (this.isPropertyUpdated("labelInterval")) {
				this.storePropertyState("labelInterval");
			}
		}
		isCurrentStateOutdated() {
			return Object.entries(this._stateStorage).some(([propName, propValue]) => this[propName] !== propValue);
		}
		getStoredPropertyState(property) {
			return this._stateStorage[property];
		}
		isPropertyUpdated(...properties) {
			return properties.some(prop => this.getStoredPropertyState(prop) !== this[prop]);
		}
		storePropertyState(...props) {
			props.forEach(property => {
				this._stateStorage[property] = this[property];
			});
		}
		get directionStart() {
			return this.effectiveDir === "rtl" ? "right" : "left";
		}
		_createLabels() {
			if (!this.labelInterval || !this.showTickmarks) {
				return;
			}
			const labelInterval = this.labelInterval;
			const step = this._effectiveStep;
			const newNumberOfLabels = (this._effectiveMax - this._effectiveMin) / (step * labelInterval);
			if (newNumberOfLabels === this._oldNumberOfLabels) {
				return;
			}
			this._oldNumberOfLabels = newNumberOfLabels;
			this._labelWidth = 100 / newNumberOfLabels;
			this._labelValues = [];
			const stepPrecision = SliderBase._getDecimalPrecisionOfNumber(step);
			for (let i = 0; i <= newNumberOfLabels; i++) {
				const labelItemNumber = ((i * step * labelInterval) + this._effectiveMin).toFixed(stepPrecision);
				this._labelValues.push(labelItemNumber);
			}
		}
		_handleActionKeyPressBase(event, affectedValue) {
			const isUpAction = SliderBase._isIncreaseValueAction(event);
			const isBigStep = SliderBase._isBigStepAction(event);
			const currentValue = this[affectedValue];
			const min = this._effectiveMin;
			const max = this._effectiveMax;
			let step = this.effectiveDir === "rtl" ? -this._effectiveStep : this._effectiveStep;
			step = isBigStep && ((max - min) / step > 10) ? (max - min) / 10 : step;
			if (Keys.isEnd(event)) {
				return max - currentValue;
			}
			if (Keys.isHome(event)) {
				return (currentValue - min) * -1;
			}
			return isUpAction ? step : step * -1;
		}
		static _isDecreaseValueAction(event) {
			return Keys.isDown(event) || Keys.isDownCtrl(event) || Keys.isLeft(event) || Keys.isLeftCtrl(event) || Keys.isMinus(event) || Keys.isPageDown(event);
		}
		static _isIncreaseValueAction(event) {
			return Keys.isUp(event) || Keys.isUpCtrl(event) || Keys.isRight(event) || Keys.isRightCtrl(event) || Keys.isPlus(event) || Keys.isPageUp(event);
		}
		static _isBigStepAction(event) {
			return Keys.isDownCtrl(event) || Keys.isUpCtrl(event) || Keys.isLeftCtrl(event) || Keys.isRightCtrl(event) || Keys.isPageUp(event) || Keys.isPageDown(event);
		}
		get _tickmarksCount() {
			return (this._effectiveMax - this._effectiveMin) / this._effectiveStep;
		}
		_spaceBetweenTickmarks() {
			return this.getBoundingClientRect().width / this._tickmarksCount;
		}
		_validateStep(step) {
			if (step === 0) {
				console.warn("The 'step' property must be a positive float number");
			}
			if (step < 0) {
				console.warn("The 'step' property must be a positive float number. The provided negative number has been converted to its positve equivalent");
			}
			if (typeof step !== "number" || Number.isNaN(step)) {
				console.warn("The 'step' property must be a positive float number. It has been set to its default value of 1");
			}
		}
		get _labels() {
			return this._labelValues || [];
		}
		get _effectiveStep() {
			let step = this.step;
			if (step < 0) {
				step = Math.abs(step);
			}
			if (typeof step !== "number" || Number.isNaN(step)) {
				step = 1;
			}
			return step;
		}
		get _effectiveMin() {
			return Math.min(this.min, this.max);
		}
		get _effectiveMax() {
			return Math.max(this.min, this.max);
		}
		get tabIndex() {
			return this.disabled ? "-1" : "0";
		}
		get _ariaLabelledByHandleRefs() {
			return [`${this._id}-accName`, `${this._id}-sliderDesc`].join(" ").trim();
		}
	}

	return SliderBase;

});
