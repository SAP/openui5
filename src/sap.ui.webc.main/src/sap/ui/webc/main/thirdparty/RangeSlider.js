sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/types/Float", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/Keys", "./SliderBase", "./Icon", "./generated/templates/RangeSliderTemplate.lit", "./generated/i18n/i18n-defaults", "./generated/themes/RangeSlider.css"], function (_exports, _customElement, _property, _Float, _i18nBundle, _Keys, _SliderBase, _Icon, _RangeSliderTemplate, _i18nDefaults, _RangeSlider) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _Float = _interopRequireDefault(_Float);
  _SliderBase = _interopRequireDefault(_SliderBase);
  _Icon = _interopRequireDefault(_Icon);
  _RangeSliderTemplate = _interopRequireDefault(_RangeSliderTemplate);
  _RangeSlider = _interopRequireDefault(_RangeSlider);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var RangeSlider_1;

  // Texts

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * Represents a numerical interval and two handles (grips) to select a sub-range within it.
   * The purpose of the component to enable visual selection of sub-ranges within a given interval.
   *
   * <h3>Structure</h3>
   * The most important properties of the Range Slider are:
   * <ul>
   * <li>min - The minimum value of the slider range.</li>
   * <li>max - The maximum value of the slider range.</li>
   * <li>value - The current value of the slider.</li>
   * <li>step - Determines the increments in which the slider will move.</li>
   * <li>showTooltip - Determines if a tooltip should be displayed above the handle.</li>
   * <li>showTickmarks - Displays a visual divider between the step values.</li>
   * <li>labelInterval - Labels some or all of the tickmarks with their values.</li>
   * </ul>
   * <h4>Notes:</h4>
   * <ul>
   * <li>The right and left handle can be moved individually and their positions could therefore switch.</li>
   * <li>The entire range can be moved along the interval.</li>
   * </ul>
   * <h3>Usage</h3>
   * The most common use case is to select and move sub-ranges on a continuous numerical scale.
   *
   * <h3>Responsive Behavior</h3>
   * You can move the currently selected range by clicking on it and dragging it along the interval.
   *
   * <h3>CSS Shadow Parts</h3>
   *
   * <ui5-link target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/::part">CSS Shadow Parts</ui5-link> allow developers to style elements inside the Shadow DOM.
   * <br>
   * The <code>ui5-range-slider</code> exposes the following CSS Shadow Parts:
   * <ul>
   * <li>progress-container - Used to style the progress container(the horizontal bar which visually represents the range between the minimum and maximum value) of the <code>ui5-range-slider</code>.</li>
   * <li>progress-bar - Used to style the progress bar, which shows the progress of the <code>ui5-range-slider</code>.</li>
   * <li>handle - Used to style the handles of the <code>ui5-range-slider</code>.</li>
   * </ul>
   *
   * <h3>Keyboard Handling</h3>
   *
   * <ul>
   * <li><code>Left or Down Arrow</code> - Moves a component's handle or the entire selection one step to the left;</li>
   * <li><code>Right or Up Arrow</code> - Moves a component's handle or the entire selection one step to the right;</li>
   * <li><code>Left or Down Arrow + Ctrl/Cmd</code> - Moves a component's handle to the left or the entire range with step equal to 1/10th of the entire range;</li>
   * <li><code>Right or Up Arrow + Ctrl/Cmd</code> - Moves a component's handle to the right or the entire range with step equal to 1/10th of the entire range;</li>
   * <li><code>Plus</code> - Same as <code>Right or Up Arrow</code>;</li>
   * <li><code>Minus</code> - Same as <code>Left or Down Arrow</code>;</li>
   * <li><code>Home</code> - Moves the entire selection or the selected handle to the beginning of the component's range;</li>
   * <li><code>End</code> - Moves the entire selection or the selected handle to the end of the component's range;</li>
   * <li><code>Page Up</code> - Same as <code>Right or Up Arrow + Ctrl/Cmd</code>;</li>
   * <li><code>Page Down</code> - Same as <code>Left or Down Arrow + Ctrl/Cmd</code>;</li>
   * <li><code>Escape</code> - Resets the <code>startValue</code> and <code>endValue</code> properties to the values prior the component focusing;</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/RangeSlider";</code>
   *
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.RangeSlider
   * @extends sap.ui.webc.main.SliderBase
   * @tagname ui5-range-slider
   * @since 1.0.0-rc.11
   * @public
   */
  let RangeSlider = RangeSlider_1 = class RangeSlider extends _SliderBase.default {
    constructor() {
      super();
      this._isPressInCurrentRange = false;
      this._handeIsPressed = false;
      this._reversedValues = false;
      this._stateStorage.startValue = undefined;
      this._stateStorage.endValue = undefined;
    }
    get tooltipStartValue() {
      const ctor = this.constructor;
      const stepPrecision = ctor._getDecimalPrecisionOfNumber(this._effectiveStep);
      return this.startValue.toFixed(stepPrecision);
    }
    get tooltipEndValue() {
      const ctor = this.constructor;
      const stepPrecision = ctor._getDecimalPrecisionOfNumber(this._effectiveStep);
      return this.endValue.toFixed(stepPrecision);
    }
    get _ariaDisabled() {
      return this.disabled || undefined;
    }
    get _ariaLabelledByText() {
      return RangeSlider_1.i18nBundle.getText(_i18nDefaults.RANGE_SLIDER_ARIA_DESCRIPTION);
    }
    get _ariaHandlesText() {
      const isRTL = this.effectiveDir === "rtl";
      const isReversed = this._areValuesReversed();
      const ariaHandlesText = {};
      if (isRTL && !isReversed || !isRTL && isReversed) {
        ariaHandlesText.startHandleText = RangeSlider_1.i18nBundle.getText(_i18nDefaults.RANGE_SLIDER_END_HANDLE_DESCRIPTION);
        ariaHandlesText.endHandleText = RangeSlider_1.i18nBundle.getText(_i18nDefaults.RANGE_SLIDER_START_HANDLE_DESCRIPTION);
      } else {
        ariaHandlesText.startHandleText = RangeSlider_1.i18nBundle.getText(_i18nDefaults.RANGE_SLIDER_START_HANDLE_DESCRIPTION);
        ariaHandlesText.endHandleText = RangeSlider_1.i18nBundle.getText(_i18nDefaults.RANGE_SLIDER_END_HANDLE_DESCRIPTION);
      }
      return ariaHandlesText;
    }
    get _ariaValueNow() {
      return Math.abs(this.endValue - this.startValue);
    }
    /**
     * Check if the previously saved state is outdated. That would mean
     * either it is the initial rendering or that a property has been changed
     * programmatically - because the previous state is always updated in
     * the interaction handlers.
     *
     * Normalize current properties, update the previously stored state.
     * Update the visual UI representation of the Slider.
     *
     */
    onBeforeRendering() {
      if (this.startValue > this.endValue) {
        const affectedValue = this._valueAffected === "startValue" ? "endValue" : "startValue";
        this._swapValues();
        this._setAffectedValue(affectedValue);
        this.update(affectedValue, this.startValue, this.endValue);
      }
      if (!this.isCurrentStateOutdated()) {
        return;
      }
      this.notResized = true;
      this.syncUIAndState();
      this._updateHandlesAndRange(0);
    }
    syncUIAndState() {
      // Validate step and update the stored state for the step property.
      if (this.isPropertyUpdated("step")) {
        this._validateStep(this.step);
        this.storePropertyState("step");
      }
      // Recalculate the tickmarks and labels and update the stored state.
      if (this.isPropertyUpdated("min", "max", "startValue", "endValue")) {
        this.storePropertyState("min", "max");
        // Here the value props are changed programmatically (not by user interaction)
        // and it won't be "stepified" (rounded to the nearest step). 'Clip' them within
        // min and max bounderies and update the previous state reference.
        const normalizedStartValue = _SliderBase.default.clipValue(this.startValue, this._effectiveMin, this._effectiveMax);
        this.startValue = normalizedStartValue;
        this.updateStateStorageAndFireInputEvent("startValue");
        this.storePropertyState("startValue");
        const normalizedEndValue = _SliderBase.default.clipValue(this.endValue, this._effectiveMin, this._effectiveMax);
        this.endValue = normalizedEndValue;
        this.updateStateStorageAndFireInputEvent("endValue");
        this.storePropertyState("endValue");
      }
      // Labels must be updated if any of the min/max/step/labelInterval props are changed
      if (this.labelInterval && this.showTickmarks) {
        this._createLabels();
      }
      // Update the stored state for the labelInterval, if changed
      if (this.isPropertyUpdated("labelInterval")) {
        this.storePropertyState("labelInterval");
      }
    }
    _onfocusin() {
      // If this is the initial focusin of the component save its initial
      // value properties so they could be restored on ESC key press
      if (!this._endValueInitial) {
        this._startValueInitial = this.startValue;
        this._endValueInitial = this.endValue;
      }
      if (this.showTooltip) {
        this._tooltipVisibility = _SliderBase.default.TOOLTIP_VISIBILITY.VISIBLE;
      }
    }
    /**
     * Handles focus out event of the focusable components inner elements.
     * Prevent focusout when the focus is getting initially set within the slider before the
     * slider customElement itself is finished focusing.
     *
     * Prevents the focus from leaving the Range Slider when the focus is managed between
     * its inner elements in result of user interactions.
     *
     * Resets the stored Range Slider's initial values saved when it was first focused
     *
     * @private
     */
    _onfocusout() {
      if (this._isFocusing()) {
        this._preventFocusOut();
        return;
      }
      this._setAffectedValue(undefined);
      this._startValueInitial = undefined;
      this._endValueInitial = undefined;
      if (this.showTooltip) {
        this._tooltipVisibility = _SliderBase.default.TOOLTIP_VISIBILITY.HIDDEN;
      }
    }
    /**
    * Handles keyup logic. If one of the handles came across the other
    * swap the start and end values. Reset the affected value by the finished
    * user interaction.
    *
    * @private
    */
    _onkeyup() {
      super._onkeyup();
      this._setAffectedValue(undefined);
      if (this.startValue !== this._startValueAtBeginningOfAction || this.endValue !== this._endValueAtBeginningOfAction) {
        this.fireEvent("change");
      }
      this._startValueAtBeginningOfAction = undefined;
      this._endValueAtBeginningOfAction = undefined;
    }
    _handleActionKeyPress(e) {
      this._startValueAtBeginningOfAction = this.startValue;
      this._endValueAtBeginningOfAction = this.endValue;
      if ((0, _Keys.isEscape)(e)) {
        this.update(undefined, this._startValueInitial, this._endValueInitial);
        return;
      }
      // Set the target of the interaction based on the focused inner element
      this._setAffectedValueByFocusedElement();
      const min = this._effectiveMin;
      const max = this._effectiveMax;
      const affectedValue = this._valueAffected;
      // If home/end key is pressed and no single handle is focused the active element
      // is the range selection - update both start and end values. Otherwise, if 'home'
      // is pressed the 'startValue'will be used for the start-handle offset calculation,
      // if 'End' is pressed - the 'endValue' will be used for the end-handle update.
      if (((0, _Keys.isEnd)(e) || (0, _Keys.isHome)(e)) && !affectedValue) {
        this._homeEndForSelectedRange(e, (0, _Keys.isHome)(e) ? "startValue" : "endValue", min, max);
        return;
      }
      // Calculate how much the value should be increased/decreased based on the action key
      const newValueOffset = this._handleActionKeyPressBase(e, affectedValue);
      if (!newValueOffset) {
        return;
      }
      // Update a single value if one of the handles is focused or the range if not already at min or max
      const ctor = this.constructor;
      if (affectedValue && !this._isPressInCurrentRange) {
        const propValue = this[affectedValue];
        const newValue = ctor.clipValue(newValueOffset + propValue, min, max);
        this.update(affectedValue, newValue, undefined);
      } else if (newValueOffset < 0 && this.startValue > min || newValueOffset > 0 && this.endValue < max) {
        const newStartValue = ctor.clipValue(newValueOffset + this.startValue, min, max);
        const newEndValue = ctor.clipValue(newValueOffset + this.endValue, min, max);
        this.update(affectedValue, newStartValue, newEndValue);
      }
    }
    /**
     * Determines affected value (start/end) depending on the currently
     * active inner element within the Range Slider - used in the keyboard handling.
     *
     * @private
     */
    _setAffectedValueByFocusedElement() {
      if (this.shadowRoot.activeElement === this._startHandle) {
        this._setAffectedValue("startValue");
      }
      if (this.shadowRoot.activeElement === this._endHandle) {
        this._setAffectedValue("endValue");
      }
      if (this.shadowRoot.activeElement === this._progressBar) {
        this._setAffectedValue(undefined);
      }
      this._setIsPressInCurrentRange(!this._valueAffected);
    }
    /**
     * Calculates the start and end values when the 'Home" or 'End' keys
     * are pressed on the selected range bar.
     *
     * @private
     */
    _homeEndForSelectedRange(e, affectedValue, min, max) {
      const newValueOffset = this._handleActionKeyPressBase(e, affectedValue);
      const ctor = this.constructor;
      const newStartValue = ctor.clipValue(newValueOffset + this.startValue, min, max);
      const newEndValue = ctor.clipValue(newValueOffset + this.endValue, min, max);
      this.update(undefined, newStartValue, newEndValue);
    }
    /**
     * Update values, stored inner state and the visual UI representation of the component.
     * If no specific type of value property is passed - the range is selected - update both handles,
     * otherwise update the handle corresponding to the affected by the user interacton value prop.
     *
     * @private
     */
    update(affectedValue, startValue, endValue) {
      if (!affectedValue) {
        this.startValue = startValue;
        this.updateStateStorageAndFireInputEvent("startValue");
        this.endValue = endValue;
        this.updateStateStorageAndFireInputEvent("endValue");
        this._updateHandlesAndRange(0);
      } else {
        const newValue = endValue && affectedValue === "endValue" ? endValue : startValue;
        this._updateHandlesAndRange(newValue || 0);
        if (affectedValue === "startValue") {
          this.startValue = newValue;
          this.updateStateStorageAndFireInputEvent("startValue");
        }
        if (affectedValue === "endValue") {
          this.endValue = newValue;
          this.updateStateStorageAndFireInputEvent("endValue");
        }
      }
    }
    /**
     * Called when the user starts interacting with the slider
     *
     * @private
     */
    _onmousedown(e) {
      // If step is 0 no interaction is available because there is no constant
      // (equal for all user environments) quantitative representation of the value
      if (this.disabled || this._effectiveStep === 0) {
        return;
      }
      // Calculate the new value from the press position of the event
      const newValue = this.handleDownBase(e);
      // Determine the rest of the needed details from the start of the interaction.
      this._saveInteractionStartData(e, newValue);
      this.rangePressed = this._isPressInCurrentRange;
      // Do not yet update the RangeSlider if press is in range or over a handle.
      if (this._isPressInCurrentRange || this._handeIsPressed) {
        this._handeIsPressed = false;
        return;
      }
      // Update Slider UI and internal state
      this.update(this._valueAffected, newValue, undefined);
    }
    /**
     * Determines and saves needed values from the start of the interaction:
     *
     * Is the value calculated is within the currently selected range;
     * Initial pageX position of the start handle affected by the interaction;
     * Initial pageX value of the pressed postion;
     * Affected value property by the action;
     *
     * @private
     */
    _saveInteractionStartData(e, newValue) {
      const progressBarDom = this.shadowRoot.querySelector(".ui5-slider-progress").getBoundingClientRect();
      // Save the state of the value properties on the start of the interaction
      this._startValueAtBeginningOfAction = this.startValue;
      this._endValueAtBeginningOfAction = this.endValue;
      // Save the initial press point coordinates (position)
      const ctor = this.constructor;
      this._initialPageXPosition = ctor.getPageXValueFromEvent(e);
      // Which element of the Range Slider is pressed and which value property to be modified on further interaction
      this._pressTargetAndAffectedValue(this._initialPageXPosition, newValue);
      // Use the progress bar to save the initial coordinates of the start-handle when the interaction begins.
      this._initialStartHandlePageX = this.directionStart === "left" ? progressBarDom.left : progressBarDom.right;
    }
    /**
     * Called when the user moves the slider
     *
     * @private
     */
    _handleMove(e) {
      e.preventDefault();
      // If 'step' is 0 no interaction is available as there is no constant quantitative representation of the value
      if (this.disabled || this._effectiveStep === 0) {
        return;
      }
      // Update UI and state when dragging a single Range Slider handle
      if (!this._isPressInCurrentRange) {
        this._updateValueOnHandleDrag(e);
        return;
      }
      // Updates UI and state when dragging of the whole selected range
      this._updateValueOnRangeDrag(e);
    }
    /**
     * Updates UI and state when dragging a single Range Slider handle
     *
     * @private
     */
    _updateValueOnHandleDrag(event) {
      const ctor = this.constructor;
      const newValue = ctor.getValueFromInteraction(event, this._effectiveStep, this._effectiveMin, this._effectiveMax, this.getBoundingClientRect(), this.directionStart);
      this.update(this._valueAffected, newValue, undefined);
    }
    /**
     * Updates UI and state when dragging of the whole selected range
     *
     * @private
     */
    _updateValueOnRangeDrag(event) {
      // Calculate the new 'start' and 'end' values from the offset between the original press point and the current position of the mouse
      const ctor = this.constructor;
      const currentPageXPos = ctor.getPageXValueFromEvent(event);
      const newValues = this._calculateRangeOffset(currentPageXPos, this._initialStartHandlePageX);
      // No matter the which value is set as the one to be modified (by prev. user action) we want to modify both of them
      this._setAffectedValue(undefined);
      // Update the UI and the state according to the calculated new values
      this.update(undefined, newValues[0], newValues[1]);
    }
    _handleUp() {
      this._setAffectedValueByFocusedElement();
      this._setAffectedValue(undefined);
      if (this.startValue !== this._startValueAtBeginningOfAction || this.endValue !== this._endValueAtBeginningOfAction) {
        this.fireEvent("change");
      }
      this._setIsPressInCurrentRange(false);
      this.handleUpBase();
      this.rangePressed = false;
      this._startValueAtBeginningOfAction = undefined;
      this._endValueAtBeginningOfAction = undefined;
    }
    /**
     * Determines where the press occured and which values of the Range Slider
     * handles should be updated on further interaction.
     *
     * If the press is not in the selected range or over one of the Range Slider handles
     * determines which one from the value/endValue properties has to be updated
     * after the user action (based on closest handle).
     *
     * Set flags if the press is over a handle or in the selected range,
     * in such cases no values are changed on interaction start, but could be
     * updated later when dragging.
     *
     * @private
     */
    _pressTargetAndAffectedValue(clientX, value) {
      const startHandle = this.shadowRoot.querySelector(".ui5-slider-handle--start");
      const endHandle = this.shadowRoot.querySelector(".ui5-slider-handle--end");
      // Check if the press point is in the bounds of any of the Range Slider handles
      const handleStartDomRect = startHandle.getBoundingClientRect();
      const handleEndDomRect = endHandle.getBoundingClientRect();
      const inHandleStartDom = clientX >= handleStartDomRect.left && clientX <= handleStartDomRect.right;
      const inHandleEndDom = clientX >= handleEndDomRect.left && clientX <= handleEndDomRect.right;
      // Remove the flag for value in current range if the press action is over one of the handles
      if (inHandleEndDom || inHandleStartDom) {
        this._handeIsPressed = true;
      }
      // Return that handle that is closer to the press point
      if (inHandleEndDom || value > this.endValue) {
        this._setAffectedValue("endValue");
      }
      // If one of the handle is pressed return that one
      if (inHandleStartDom || value < this.startValue) {
        this._setAffectedValue("startValue");
      }
      // Flag if press is in the current select range
      const isNewValueInCurrentRange = this._startValueAtBeginningOfAction !== undefined && this._endValueAtBeginningOfAction !== undefined && value >= this._startValueAtBeginningOfAction && value <= this._endValueAtBeginningOfAction;
      this._setIsPressInCurrentRange(!(this._valueAffected || this._handeIsPressed) ? isNewValueInCurrentRange : false);
    }
    /**
     * Sets the value property (start/end) that will get updated
     * by a user action depending on that user action's characteristics
     * - mouse press position - cursor coordinates relative to the start/end handles
     * - selected inner element via a keyboard navigation
     *
     * @param {string} affectedValue The value that will get modified by the interaction
     * @private
     */
    _setAffectedValue(affectedValue) {
      this._valueAffected = affectedValue;
      // If the values have been swapped reset the reversed flag
      if (this._areValuesReversed()) {
        this._setValuesAreReversed();
      }
    }
    /**
     * Flag if press action is made on the currently selected range of values
     *
     * @param {boolean} isPressInCurrentRange Did the current press action occur in the current range (between the two handles)
     * @private
     */
    _setIsPressInCurrentRange(isPressInCurrentRange) {
      this._isPressInCurrentRange = isPressInCurrentRange;
    }
    /**
     * Manage the focus between the focusable inner elements within the component.
     *
     * On initial focusin or if the whole range is affected by the user interaction
     * set the focus on the progress selection, otherwise on one of the Range Slider
     * handles based on the determined affected value by the user action.
     *
     * If one of the handles came across the other one in result of a user action
     * switch the focus between them to keep it visually consistent.
     *
     * Note:
     * In some cases this function is going to get called twice on one user action.
     *
     * 1. When the focus is initially set to an inner element it is done in the very beginning,
     * of an interaction - on 'mousedown' and 'keydown' events. The focus of the host custom element
     * is still not being received, causining an immediate focusout that we prevent by
     * calling this function once again.
     *
     * 2. When the focused is manually switched from one inner element to another.
     * The focusout handler is one and the same for all focusable parts within the
     * Range Slider and when is called it checks if it should keep the focus within
     * the component and which part of it should get focused if that is the case.
     *
     * @protected
     */
    focusInnerElement() {
      const isReversed = this._areValuesReversed();
      const affectedValue = this._valueAffected;
      if (this._isPressInCurrentRange || !affectedValue) {
        this._progressBar.focus();
      }
      if (affectedValue === "startValue" && !isReversed || affectedValue === "endValue" && isReversed) {
        this._startHandle.focus();
      }
      if (affectedValue === "endValue" && !isReversed || affectedValue === "startValue" && isReversed) {
        this._endHandle.focus();
      }
    }
    /**
     * Calculates startValue/endValue properties when the whole range is moved.
     *
     * Uses the change of the position of the start handle and adds the initially
     * selected range to it, to determine the whole range offset.
     *
     * @param {Integer} currentPageXPos The current horizontal position of the cursor/touch
     * @param {Integer} initialStartHandlePageXPos The initial horizontal position of the start handle
     *
     * @private
     */
    _calculateRangeOffset(currentPageXPos, initialStartHandlePageXPos) {
      // Return the current values if there is no difference in the
      // positions of the initial press and the current pointer
      if (this._initialPageXPosition === currentPageXPos) {
        return [this.startValue, this.endValue];
      }
      const min = this._effectiveMin;
      const max = this._effectiveMax;
      const selectedRange = this.endValue - this.startValue;
      // Computes the new value based on the difference of the current cursor location from the start of the interaction
      let startValue = this._calculateStartValueByOffset(currentPageXPos, initialStartHandlePageXPos);
      // When the end handle reaches the max possible value prevent the start handle from moving
      // And the opposite - if the start handle reaches the beginning of the slider keep the initially selected range.
      const ctor = this.constructor;
      startValue = ctor.clipValue(startValue, min, max - selectedRange);
      return [startValue, startValue + selectedRange];
    }
    /**
     * Computes the new value based on the difference of the current cursor location from the
     * start of the interaction.
     *
     * @param {Integer} currentPageXPos The current horizontal position of the cursor/touch
     * @param {Integer} initialStartHandlePageXPos The initial horizontal position of the start handle
     *
     * @private
     */
    _calculateStartValueByOffset(currentPageXPos, initialStartHandlePageXPos) {
      const min = this._effectiveMin;
      const max = this._effectiveMax;
      const step = this._effectiveStep;
      const dom = this.getBoundingClientRect();
      let startValue;
      let startValuePageX;
      let positionOffset;
      /* Depending on the dragging direction:
      - calculate the new position of the start handle from its old pageX value combined with the movement offset;
      - calculate the start value based on its new pageX coordinates;
      - 'stepify' the calculated value based on the specified step property; */
      const ctor = this.constructor;
      if (currentPageXPos > this._initialPageXPosition) {
        // Difference between the new position of the pointer and when the press event initial occured
        positionOffset = currentPageXPos - this._initialPageXPosition;
        startValuePageX = initialStartHandlePageXPos + positionOffset;
        startValue = ctor.computedValueFromPageX(startValuePageX, min, max, dom, this.directionStart);
        startValue = ctor.getSteppedValue(startValue, step, min);
      } else {
        positionOffset = this._initialPageXPosition - currentPageXPos;
        startValuePageX = initialStartHandlePageXPos - positionOffset;
        startValue = ctor.computedValueFromPageX(startValuePageX, min, max, dom, this.directionStart);
        startValue = ctor.getSteppedValue(startValue, step, min);
      }
      return startValue;
    }
    /**
     * Updates the visual representation of the component by calculating
     * the styles of the handles and the range selection based on the new state.
     *
     * @private
     */
    _updateHandlesAndRange(newValue) {
      const max = this._effectiveMax;
      const min = this._effectiveMin;
      const prevStartValue = this.getStoredPropertyState("startValue") || 0;
      const prevEndValue = this.getStoredPropertyState("endValue") || 0;
      const affectedValue = this._valueAffected;
      // The value according to which we update the UI can be either the startValue
      // or the endValue property. It is determined in _getClosestHandle()
      // depending on to which handle is closer the user interaction.
      if (affectedValue === "startValue") {
        this._selectedRange = (prevEndValue - newValue) / (max - min);
        this._firstHandlePositionFromStart = (newValue - min) / (max - min) * 100;
      } else if (affectedValue === "endValue") {
        this._selectedRange = (newValue - prevStartValue) / (max - min);
        this._secondHandlePositionFromStart = (newValue - min) / (max - min) * 100;
      } else {
        // When both values are changed - UI sync or moving the whole selected range:
        this._selectedRange = (this.endValue - this.startValue) / (max - min);
        this._firstHandlePositionFromStart = (this.startValue - min) / (max - min) * 100;
        this._secondHandlePositionFromStart = (this.endValue - min) / (max - min) * 100;
      }
    }
    /**
     * Swaps the start and end values of the handles if one came accros the other:
     * - If the start value is greater than the endValue swap them and their handles
     * - If the endValue become less than the start value swap them and their handles
     *
     * Switches the focus to the opposite of the currently focused handle.
     *
     * Note: Only the property values are reversed, the DOM elements of the handles
     * corresponding to them are never switched.
     *
     * @private
     */
    _swapValues() {
      const affectedValue = this._valueAffected;
      if (!affectedValue) {
        return;
      }
      if (affectedValue === "startValue" && this.startValue > this.endValue) {
        const prevEndValue = this.endValue;
        this.endValue = this.startValue;
        this.startValue = prevEndValue;
      }
      if (affectedValue === "endValue" && this.endValue < this.startValue) {
        const prevStartValue = this.startValue;
        this.startValue = this.endValue;
        this.endValue = prevStartValue;
      }
      this._setValuesAreReversed();
      this._updateHandlesAndRange(this[affectedValue]);
      this.focusInnerElement();
      this.syncUIAndState();
    }
    /**
     * Flag that we have swapped the values of the 'start' and 'end' properties,
     * to correctly switch the focus within the component from one handle to another
     * when the swapping is finished. As we only swap property values and not
     * the handle elements themselves, we must also swap their focus.
     *
     * @private
     */
    _setValuesAreReversed() {
      this._reversedValues = !this._reversedValues;
    }
    _areValuesReversed() {
      return this._reversedValues;
    }
    get tickmarksObject() {
      const count = this._tickmarksCount;
      const arr = [];
      if (this._hiddenTickmarks) {
        return [false, false];
      }
      for (let i = 0; i <= count; i++) {
        const isBiggerThanStartValue = this._effectiveMin + i * this.step >= this.startValue;
        const isBiggerThanEndValue = this._effectiveMin + i * this.step <= this.endValue;
        arr.push(isBiggerThanStartValue && isBiggerThanEndValue);
      }
      return arr;
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
    get _ariaLabelledByStartHandleRefs() {
      return [`${this._id}-accName`, `${this._id}-startHandleDesc`].join(" ").trim();
    }
    get _ariaLabelledByEndHandleRefs() {
      return [`${this._id}-accName`, `${this._id}-endHandleDesc`].join(" ").trim();
    }
    get _ariaLabelledByProgressBarRefs() {
      return [`${this._id}-accName`, `${this._id}-sliderDesc`].join(" ").trim();
    }
    get styles() {
      return {
        progress: {
          "width": `${this._selectedRange * 100}%`,
          "transform-origin": `${this.directionStart} top`,
          [this.directionStart]: `${this._firstHandlePositionFromStart}%`
        },
        startHandle: {
          [this.directionStart]: `${this._firstHandlePositionFromStart}%`
        },
        endHandle: {
          [this.directionStart]: `${this._secondHandlePositionFromStart}%`
        },
        label: {
          "width": `${this._labelWidth}%`
        },
        labelContainer: {
          "width": `100%`,
          [this.directionStart]: `-${this._labelWidth / 2}%`
        },
        tooltip: {
          "visibility": `${this._tooltipVisibility}`
        }
      };
    }
    static async onDefine() {
      RangeSlider_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
  };
  __decorate([(0, _property.default)({
    validator: _Float.default,
    defaultValue: 0
  })], RangeSlider.prototype, "startValue", void 0);
  __decorate([(0, _property.default)({
    validator: _Float.default,
    defaultValue: 100
  })], RangeSlider.prototype, "endValue", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], RangeSlider.prototype, "rangePressed", void 0);
  RangeSlider = RangeSlider_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-range-slider",
    languageAware: true,
    template: _RangeSliderTemplate.default,
    dependencies: [_Icon.default],
    styles: [_SliderBase.default.styles, _RangeSlider.default]
  })], RangeSlider);
  RangeSlider.define();
  var _default = RangeSlider;
  _exports.default = _default;
});