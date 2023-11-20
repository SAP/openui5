sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/types/Float", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/icons/direction-arrows", "sap/ui/webc/common/thirdparty/base/Keys", "./generated/themes/SliderBase.css"], function (_exports, _UI5Element, _customElement, _property, _event, _LitRenderer, _Float, _Integer, _ResizeHandler, _Device, _directionArrows, _Keys, _SliderBase) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _LitRenderer = _interopRequireDefault(_LitRenderer);
  _Float = _interopRequireDefault(_Float);
  _Integer = _interopRequireDefault(_Integer);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _SliderBase = _interopRequireDefault(_SliderBase);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var SliderBase_1;

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.SliderBase
   * @extends sap.ui.webc.base.UI5Element
   * @public
   */
  let SliderBase = SliderBase_1 = class SliderBase extends _UI5Element.default {
    constructor() {
      super();
      this.notResized = false;
      this._isUserInteraction = false;
      this._isInnerElementFocusing = false;
      this._labelWidth = 0;
      this._resizeHandler = this._handleResize.bind(this);
      this._moveHandler = this._handleMove.bind(this);
      this._upHandler = this._handleUp.bind(this);
      this._stateStorage = {
        step: undefined,
        min: undefined,
        max: undefined,
        labelInterval: undefined
      };
      const handleTouchStartEvent = e => {
        this._onmousedown(e);
      };
      this._ontouchstart = {
        handleEvent: handleTouchStartEvent,
        passive: true
      };
    }
    _handleMove(e) {} // eslint-disable-line
    _handleUp() {}
    _onmousedown(e) {} // eslint-disable-line
    _handleActionKeyPress(e) {} // eslint-disable-line
    static get ACTION_KEYS() {
      return [_Keys.isLeft, _Keys.isRight, _Keys.isUp, _Keys.isDown, _Keys.isLeftCtrl, _Keys.isRightCtrl, _Keys.isUpCtrl, _Keys.isDownCtrl, _Keys.isPlus, _Keys.isMinus, _Keys.isHome, _Keys.isEnd, _Keys.isPageUp, _Keys.isPageDown, _Keys.isEscape];
    }
    static get MIN_SPACE_BETWEEN_TICKMARKS() {
      return 8;
    }
    static get TOOLTIP_VISIBILITY() {
      return {
        VISIBLE: "visible",
        HIDDEN: "hidden"
      };
    }
    get classes() {
      return {
        root: {
          "ui5-slider-root-phone": (0, _Device.isPhone)()
        },
        labelContainer: {
          "ui5-slider-hidden-labels": this._labelsOverlapping
        }
      };
    }
    onEnterDOM() {
      _ResizeHandler.default.register(this, this._resizeHandler);
    }
    onExitDOM() {
      _ResizeHandler.default.deregister(this, this._resizeHandler);
    }
    onAfterRendering() {
      // Only call if the resize is triggered by a state changes other than
      // the ones that occured on the previous resize and those caused by user interaction.
      if (this.notResized) {
        this._resizeHandler();
      }
    }
    /** Shows the tooltip(s) if the <code>showTooltip</code> property is set to true
     *
     * @private
     */
    _onmouseover() {
      if (this.showTooltip) {
        this._tooltipVisibility = SliderBase_1.TOOLTIP_VISIBILITY.VISIBLE;
      }
    }
    /**
     * Hides the tooltip(s) if the <code>showTooltip</code> property is set to true
     *
     * @private
     */
    _onmouseout() {
      if (this.showTooltip && !this.shadowRoot.activeElement) {
        this._tooltipVisibility = SliderBase_1.TOOLTIP_VISIBILITY.HIDDEN;
      }
    }
    _onkeydown(e) {
      if (this.disabled || this._effectiveStep === 0) {
        return;
      }
      if (SliderBase_1._isActionKey(e)) {
        e.preventDefault();
        this._isUserInteraction = true;
        this._handleActionKeyPress(e);
      }
    }
    _onkeyup() {
      if (this.disabled) {
        return;
      }
      this._isUserInteraction = false;
    }
    /**
     * Flags if an inner element is currently being focused
     *
     * @private
     */
    _preserveFocus(isFocusing) {
      this._isInnerElementFocusing = isFocusing;
    }
    /**
     * Return if an inside element within the component is currently being focused
     *
     * @private
     */
    _isFocusing() {
      return this._isInnerElementFocusing;
    }
    /**
     * Prevent focus out when inner element within the component is currently being in process of focusing in.
     *
     * @private
     */
    _preventFocusOut() {
      this.focusInnerElement();
    }
    /**
     * Manages the focus between the component's inner elements
     * @protected
     */
    focusInnerElement() {
      this.focus();
    }
    /**
     * Handle the responsiveness of the Slider's UI elements when resizing
     *
     * @private
     */
    _handleResize() {
      if (!this.showTickmarks) {
        return;
      }
      // Mark resizing to avoid unneccessary calls to that function after rendering
      this.notResized = false;
      // Convert the string represented calculation expression to a normal one
      // Check the distance  in pixels exist between every tickmark
      const spaceBetweenTickmarks = this._spaceBetweenTickmarks();
      // If the pixels between the tickmarks are less than 8 only the first and the last one should be visible
      // In such case the labels must correspond to the tickmarks, only the first and the last one should exist.
      if (spaceBetweenTickmarks < SliderBase_1.MIN_SPACE_BETWEEN_TICKMARKS) {
        this._hiddenTickmarks = true;
        this._labelsOverlapping = true;
      } else {
        this._hiddenTickmarks = false;
      }
      if (this.labelInterval <= 0 || this._hiddenTickmarks) {
        return;
      }
      // Check if there are any overlapping labels.
      // If so - only the first and the last one should be visible
      const labelItems = this.shadowRoot.querySelectorAll(".ui5-slider-labels li");
      this._labelsOverlapping = [...labelItems].some(label => label.scrollWidth > label.clientWidth);
    }
    /**
     * Called when the user starts interacting with the slider.
     * After a down event on the slider root, listen for move events on window, so the slider value
     * is updated even if the user drags the pointer outside the slider root.
     *
     * @protected
     */
    handleDownBase(e) {
      const min = this._effectiveMin;
      const max = this._effectiveMax;
      const domRect = this.getBoundingClientRect();
      const directionStart = this.directionStart;
      const step = this._effectiveStep;
      const newValue = SliderBase_1.getValueFromInteraction(e, step, min, max, domRect, directionStart);
      // Mark start of a user interaction
      this._isUserInteraction = true;
      window.addEventListener("mouseup", this._upHandler);
      window.addEventListener("touchend", this._upHandler);
      // Only allow one type of move event to be listened to (the first one registered after the down event)
      if ((0, _Device.supportsTouch)() && e instanceof TouchEvent) {
        window.addEventListener("touchmove", this._moveHandler);
      } else {
        window.addEventListener("mousemove", this._moveHandler);
      }
      this._handleFocusOnMouseDown(e);
      return newValue;
    }
    /**
     * Forward the focus to an inner inner part within the component on press
     *
     * @private
     */
    _handleFocusOnMouseDown(e) {
      const focusedElement = this.shadowRoot.activeElement;
      if (!focusedElement || focusedElement !== e.target) {
        this._preserveFocus(true);
        this.focusInnerElement();
      }
    }
    /**
     * Called when the user finish interacting with the slider
     * Fires an <code>change</code> event indicating a final value change, after user interaction is finished.
     *
     * @protected
     */
    handleUpBase() {
      window.removeEventListener("mouseup", this._upHandler);
      window.removeEventListener("touchend", this._upHandler);
      // Only one of the following was attached, but it's ok to remove both as there is no error
      window.removeEventListener("mousemove", this._moveHandler);
      window.removeEventListener("touchmove", this._moveHandler);
      this._isUserInteraction = false;
      this._preserveFocus(false);
    }
    /**
     * Updates state storage for the value-related property
     * Fires an <code>input</code> event indicating a value change via interaction that is not yet finished.
     *
     * @protected
     */
    updateStateStorageAndFireInputEvent(valueType) {
      this.storePropertyState(valueType);
      if (this._isUserInteraction) {
        this.fireEvent("input");
      }
    }
    /**
     * Goes through the key shortcuts available for the component and returns 'true' if the event is triggered by one.
     *
     * @private
     */
    static _isActionKey(e) {
      return this.ACTION_KEYS.some(actionKey => actionKey(e));
    }
    /**
     * Locks the given value between min and max boundaries based on slider properties
     *
     * @protected
     */
    static clipValue(value, min, max) {
      value = Math.min(Math.max(value, min), max);
      return value;
    }
    /**
     * Sets the slider value from an event
     *
     * @protected
     */
    static getValueFromInteraction(e, stepSize, min, max, boundingClientRect, directionStart) {
      const pageX = this.getPageXValueFromEvent(e);
      const value = this.computedValueFromPageX(pageX, min, max, boundingClientRect, directionStart);
      const steppedValue = this.getSteppedValue(value, stepSize, min);
      return this.clipValue(steppedValue, min, max);
    }
    /**
     * "Stepify" the raw value - calculate the new value depending on the specified step property
     *
     * @protected
     */
    static getSteppedValue(value, stepSize, min) {
      const stepModuloValue = Math.abs((value - min) % stepSize);
      if (stepSize === 0 || stepModuloValue === 0) {
        return value;
      }
      // Clip (snap) the new value to the nearest step
      value = stepModuloValue * 2 >= stepSize ? value + stepSize - stepModuloValue : value - stepModuloValue;
      // If the step value is not a round number get its precision
      const stepPrecision = SliderBase_1._getDecimalPrecisionOfNumber(stepSize);
      return Number(value.toFixed(stepPrecision));
    }
    /**
     * Gets pageX value from event on user interaction with the Slider
     *
     * @protected
     */
    static getPageXValueFromEvent(e) {
      if ((0, _Device.supportsTouch)() && e instanceof TouchEvent) {
        if (e.targetTouches && e.targetTouches.length > 0) {
          return e.targetTouches[0].pageX;
        }
        return 0;
      }
      return e.pageX; // MouseEvent
    }
    /**
     * Computes the new value (in %) from the pageX position of the cursor.
     * Returns the value rounded to a precision of at most 2 digits after decimal point.
     *
     * @protected
     */
    static computedValueFromPageX(pageX, min, max, boundingClientRect, directionStart) {
      // Determine pageX position relative to the Slider DOM
      const xRelativePosition = directionStart === "left" ? pageX - boundingClientRect[directionStart] : boundingClientRect[directionStart] - pageX;
      // Calculate the percentage complete (the "progress")
      const percentageComplete = xRelativePosition / boundingClientRect.width;
      // Fit (map) the complete percentage between the min/max value range
      return min + percentageComplete * (max - min);
    }
    /**
     * Calculates the precision (decimal places) of a number, returns 0 if integer
     * Handles scientific notation cases.
     * @private
     */
    static _getDecimalPrecisionOfNumber(value) {
      if (Number.isInteger(value)) {
        return 0;
      }
      const match = String(value).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
      if (!match || match.length < 2) {
        return 0;
      }
      return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? Number(match[2]) : 0));
    }
    /**
     * In order to always keep the visual UI representation and the internal
     * state in sync, the component has a 'state storage' that is updated when the
     * current state is changed due to a user action.
     *
     * Check if the previously saved state is outdated. That would mean
     * a property has been changed programmatically because the previous state
     * is always updated in the interaction handlers.
     *
     * Will return true if any of the properties is not equal to its previously
     * stored value.
     *
     * @protected
     */
    isCurrentStateOutdated() {
      return Object.entries(this._stateStorage).some(([propName, propValue]) => this[propName] !== propValue);
    }
    /**
     * Returns the last stored value of a property
     *
     * @protected
     */
    getStoredPropertyState(prop) {
      return this._stateStorage[prop];
    }
    /**
     * Check if one or more properties have been updated compared to their last
     * saved values in the state storage.
     *
     * @protected
     */
    isPropertyUpdated(...props) {
      return props.some(prop => this.getStoredPropertyState(prop) !== this[prop]);
    }
    /**
     * Updates the previously saved in the _stateStorage values of one or more properties.
     *
     * @protected
     */
    storePropertyState(...props) {
      props.forEach(prop => {
        this._stateStorage[prop] = this[prop];
      });
    }
    /**
     * Returns the start side of a direction - left for LTR, right for RTL
     */
    get directionStart() {
      return this.effectiveDir === "rtl" ? "right" : "left";
    }
    /**
     * Calculates the labels amount, width and text and creates them
     *
     * @private
     */
    _createLabels() {
      if (!this.labelInterval || !this.showTickmarks) {
        return;
      }
      const labelInterval = this.labelInterval;
      const step = this._effectiveStep;
      const newNumberOfLabels = (this._effectiveMax - this._effectiveMin) / (step * labelInterval);
      // If the required labels are already rendered
      if (newNumberOfLabels === this._oldNumberOfLabels) {
        return;
      }
      this._oldNumberOfLabels = newNumberOfLabels;
      this._labelWidth = 100 / newNumberOfLabels;
      this._labelValues = [];
      // If the step value is not a round number get its precision
      const stepPrecision = SliderBase_1._getDecimalPrecisionOfNumber(step);
      // numberOfLabels below can be float so that the "distance betweenlabels labels"
      // calculation to be precize (exactly the same as the distance between the tickmarks).
      // That's ok as the loop stop condition is set to an integer, so it will practically
      // "floor" the number of labels anyway.
      for (let i = 0; i <= newNumberOfLabels; i++) {
        // Format the label numbers with the same decimal precision as the value of the step property
        const labelItemNumber = (i * step * labelInterval + this._effectiveMin).toFixed(stepPrecision);
        this._labelValues.push(labelItemNumber);
      }
    }
    _handleActionKeyPressBase(e, affectedPropName) {
      const isUpAction = SliderBase_1._isIncreaseValueAction(e);
      const isBigStep = SliderBase_1._isBigStepAction(e);
      const currentValue = this[affectedPropName];
      const min = this._effectiveMin;
      const max = this._effectiveMax;
      // We need to take into consideration the effective direction of the slider - rtl or ltr.
      // While in ltr, the left arrow key decreases the value, in rtl it should actually increase it.
      let step = this.effectiveDir === "rtl" ? -this._effectiveStep : this._effectiveStep;
      // If the action key corresponds to a long step and the slider has more than 10 normal steps,
      // make a jump of 1/10th of the Slider's length, otherwise just use the normal step property.
      step = isBigStep && (max - min) / step > 10 ? (max - min) / 10 : step;
      if ((0, _Keys.isEnd)(e)) {
        return max - currentValue;
      }
      if ((0, _Keys.isHome)(e)) {
        return (currentValue - min) * -1;
      }
      return isUpAction ? step : step * -1;
    }
    static _isDecreaseValueAction(e) {
      return (0, _Keys.isDown)(e) || (0, _Keys.isDownCtrl)(e) || (0, _Keys.isLeft)(e) || (0, _Keys.isLeftCtrl)(e) || (0, _Keys.isMinus)(e) || (0, _Keys.isPageDown)(e);
    }
    static _isIncreaseValueAction(e) {
      return (0, _Keys.isUp)(e) || (0, _Keys.isUpCtrl)(e) || (0, _Keys.isRight)(e) || (0, _Keys.isRightCtrl)(e) || (0, _Keys.isPlus)(e) || (0, _Keys.isPageUp)(e);
    }
    static _isBigStepAction(e) {
      return (0, _Keys.isDownCtrl)(e) || (0, _Keys.isUpCtrl)(e) || (0, _Keys.isLeftCtrl)(e) || (0, _Keys.isRightCtrl)(e) || (0, _Keys.isPageUp)(e) || (0, _Keys.isPageDown)(e);
    }
    get _tickmarksCount() {
      return (this._effectiveMax - this._effectiveMin) / this._effectiveStep;
    }
    /**
     * Calculates space between tickmarks
     *
     * @private
     */
    _spaceBetweenTickmarks() {
      return this.getBoundingClientRect().width / this._tickmarksCount;
    }
    /**
     * Notify in case of a invalid step value type
     *
     * @private
     */
    _validateStep(step) {
      if (step === 0) {
        console.warn("The 'step' property must be a positive float number"); // eslint-disable-line
      }

      if (step < 0) {
        console.warn("The 'step' property must be a positive float number. The provided negative number has been converted to its positve equivalent"); // eslint-disable-line
      }

      if (Number.isNaN(step)) {
        console.warn("The 'step' property must be a positive float number. It has been set to its default value of 1"); // eslint-disable-line
      }
    }

    get _labels() {
      return this._labelValues || [];
    }
    /**
     * Normalizes a new <code>step</code> property value.
     * If tickmarks are enabled recreates them according to it.
     *
     * @private
     */
    get _effectiveStep() {
      let step = this.step;
      if (step < 0) {
        step = Math.abs(step);
      }
      if (Number.isNaN(step)) {
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
    get _tabIndex() {
      return this.disabled ? "-1" : "0";
    }
    get _ariaLabelledByHandleRefs() {
      return [`${this._id}-accName`, `${this._id}-sliderDesc`].join(" ").trim();
    }
  };
  __decorate([(0, _property.default)({
    validator: _Float.default,
    defaultValue: 0
  })], SliderBase.prototype, "min", void 0);
  __decorate([(0, _property.default)({
    validator: _Float.default,
    defaultValue: 100
  })], SliderBase.prototype, "max", void 0);
  __decorate([(0, _property.default)({
    validator: _Float.default,
    defaultValue: 1
  })], SliderBase.prototype, "step", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 0
  })], SliderBase.prototype, "labelInterval", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SliderBase.prototype, "showTickmarks", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SliderBase.prototype, "showTooltip", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SliderBase.prototype, "disabled", void 0);
  __decorate([(0, _property.default)()], SliderBase.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "hidden"
  })], SliderBase.prototype, "_tooltipVisibility", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SliderBase.prototype, "_labelsOverlapping", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], SliderBase.prototype, "_hiddenTickmarks", void 0);
  SliderBase = SliderBase_1 = __decorate([(0, _customElement.default)({
    renderer: _LitRenderer.default,
    styles: _SliderBase.default
  })
  /**
   * Fired when the value changes and the user has finished interacting with the slider.
   *
   * @event sap.ui.webc.main.SliderBase#change
   * @public
   */, (0, _event.default)("change")
  /**
   * Fired when the value changes due to user interaction that is not yet finished - during mouse/touch dragging.
   *
   * @event sap.ui.webc.main.SliderBase#input
   * @public
   */, (0, _event.default)("input")], SliderBase);
  var _default = SliderBase;
  _exports.default = _default;
});