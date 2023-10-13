sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/renderer/LitRenderer", "sap/ui/webc/common/thirdparty/base/types/Integer", "./generated/templates/TimePickerClockTemplate.lit", "./generated/themes/TimePickerClock.css"], function (_exports, _UI5Element, _customElement, _property, _event, _LitRenderer, _Integer, _TimePickerClockTemplate, _TimePickerClock) {
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
  _Integer = _interopRequireDefault(_Integer);
  _TimePickerClockTemplate = _interopRequireDefault(_TimePickerClockTemplate);
  _TimePickerClock = _interopRequireDefault(_TimePickerClock);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };

  // Template

  // Styles

  const ANIMATION_DURATION_MAX = 200; // total animation duration, without the delay before firing the event
  const ANIMATION_DELAY_EVENT = 100; // delay before firing the event
  const CLOCK_ANGLE_STEP = 6;
  const CLOCK_NUMBER_CLASS = "ui5-tp-clock-number";
  const CLOCK_NUMBER_HOVER_CLASS = "ui5-tp-clock-number-hover";
  const CLOCK_NUMBER_SELECTED_CLASS = "ui5-tp-clock-selected";
  const CLOCK_MIDDOT_CLASS = "ui5-tp-clock-mid-dot";
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * <code>ui5-time-picker-clock</code> allows selecting of hours,minutes or seconds (depending on property set).
   * The component supports interactions with mouse, touch and mouse wheel.
   * Depending on settings, the clock can display only outer set of items (when the clock displays hours in 12-hour mode,
   * minutes or seconds), or outer and inner sets of items (when the clock displays hours in 24-hours mode).
   * The step for displaying or selecting of items can be configured.
   *
   * <code>ui5-time-picker-clock</code> is used as part of <code>ui5-time-selection-clocks</code> component, which
   * is used in <code>ui5-time-picker</code> component respectively.
   *
   * <h3>Usage</h3>
   *
   * <code>ui5-time-picker-clock</code> can display hours, minutes or seconds
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/TimePickerClock.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.TimePickerClock
   * @extends sap.ui.webc.base.UI5Element
   * @tagname ui5-time-picker-clock
   * @since 1.15.0
   * @private
   */
  let TimePickerClock = class TimePickerClock extends _UI5Element.default {
    constructor() {
      super();
      this._fnOnMouseOutUp = () => {
        this._mouseOrTouchDown = false;
      };
    }
    get classes() {
      return {
        clock: {
          "ui5-tp-clock": true,
          "ui5-tp-clock-inner": this.showInnerCircle,
          "ui5-tp-clock-active": this.active
        }
      };
    }
    onEnterDOM() {
      document.addEventListener("mouseup", this._fnOnMouseOutUp, false);
    }
    onExitDOM() {
      document.removeEventListener("mouseup", this._fnOnMouseOutUp, false);
    }
    onBeforeRendering() {
      this._prepareClockItems();
      const value = this._fixReplacementValue(this.selectedValue);
      this._updateSelectedValueObject(value);
    }
    /**
     * Returns the real value of the passed clock item, if the replacement must be done, returns the replaced value.
     *
     * @param {number} value The value of the clock item
     * @returns {number} The real/replaced value
     */
    _fixReplacementValue(value) {
      let realValue = value;
      const maxValue = this.itemMax * (this.showInnerCircle ? 2 : 1);
      if (realValue === 0) {
        realValue = maxValue;
      }
      if (realValue === maxValue && this.lastItemReplacement !== -1) {
        realValue = this.lastItemReplacement;
      }
      return realValue;
    }
    /**
     * Updates internal selected value object constructed for rendering purposes.
     *
     * @param {number} value currently selected value.
     */
    _updateSelectedValueObject(value) {
      if (value === -1) {
        this._selectedItem = {
          showMarker: false
        };
        return;
      }
      const selectedOuter = value >= this.itemMin && value <= this.itemMax || !this.showInnerCircle && value === this.lastItemReplacement;
      const selectedInner = (value >= this.itemMin + this.itemMax && value <= this.itemMax * 2 || value === this.lastItemReplacement) && this.showInnerCircle;
      const stepAngle = 360 / (this.itemMax - this.itemMin + 1);
      const innerValue = this.lastItemReplacement === -1 || !this.prependZero ? value.toString() : value.toString().padStart(2, "0");
      let currentAngle = selectedOuter || selectedInner ? value * stepAngle : undefined;
      if (currentAngle !== undefined) {
        currentAngle %= 360;
      }
      this._selectedItem = {
        "angle": currentAngle,
        "item": selectedOuter ? value.toString() : "",
        "innerItem": selectedInner ? innerValue : "",
        "showMarker": selectedOuter || selectedInner,
        "itemClasses": CLOCK_NUMBER_CLASS + (selectedOuter ? ` ${CLOCK_NUMBER_SELECTED_CLASS}` : ""),
        "innerItemClasses": CLOCK_NUMBER_CLASS + (selectedInner ? ` ${CLOCK_NUMBER_SELECTED_CLASS}` : ""),
        "outerStyles": {
          transform: `translate(-50%) rotate(${currentAngle || 0}deg)`
        },
        "innerStyles": {
          transform: `rotate(-${currentAngle || 0}deg)`
        }
      };
    }
    /**
     * Prepares clock items objects according to current clock settings. Item objects are used for rendering purposes.
     */
    _prepareClockItems() {
      const values = [];
      let displayStep = this.displayStep;
      let item;
      let valueIndex;
      let i;
      this._items = [];
      for (i = this.itemMin; i <= this.itemMax; i++) {
        values.push({
          "item": i.toString(),
          "innerItem": this.showInnerCircle ? (i + this.itemMax).toString() : undefined
        });
      }
      if (this.lastItemReplacement !== -1) {
        if (this.showInnerCircle && this.prependZero) {
          values[values.length - 1].innerItem = this.lastItemReplacement.toString().padStart(2, "0");
        } else {
          values[values.length - 1].item = this.lastItemReplacement.toString();
        }
      }
      // determines angle step for values display
      const itemStep = 360 / CLOCK_ANGLE_STEP / values.length;
      // determines step for values display in units
      if (this.valueStep * itemStep > displayStep) {
        displayStep = this.valueStep * itemStep;
      }
      for (i = 1; i <= 60; i++) {
        valueIndex = i / itemStep - 1;
        item = i % displayStep !== 0 ? {} : values[valueIndex];
        item.angle = i * CLOCK_ANGLE_STEP;
        item.outerStyles = {
          transform: `translate(-50%) rotate(${i * 6}deg)`
        };
        item.innerStyles = {
          transform: `rotate(-${i * 6}deg)`
        };
        this._items.push(item);
      }
    }
    /**
     * Returns the DOM Reference of the clock cover element
     *
     * @returns {HTMLElement} the DOM Reference
     */
    _getClockCoverContainerDomRef() {
      const domRef = this.getDomRef();
      return domRef && domRef.querySelector(".ui5-tp-clock-cover");
    }
    /**
     * Returns the real max value of clock items, taking in count if there is inner circle or not.
     *
     * @returns {number} max value
     */
    _getMaxValue() {
      return this.showInnerCircle ? this.itemMax * 2 : this.itemMax;
    }
    /**
     * Calculates the outer height of a HTML element.
     *
     * @param {HTMLElement} element The element which outer height to be calculated
     * @returns {number} Outer height of the passed HTML element
     */
    _outerHeight(element) {
      if (!element) {
        return 0;
      }
      const style = window.getComputedStyle(element);
      return element.offsetHeight + parseInt(style.marginTop) + parseInt(style.marginBottom);
    }
    /**
     * Returns the Id of the DOM element of the clock item that display specific value.
     *
     * @param {number} value The value of the clock item
     * @returns {string} Id of the clock item element
     */
    _hoveredId(value) {
      if (value === this._getMaxValue() && this.lastItemReplacement !== -1) {
        value = this.lastItemReplacement;
      }
      const valueString = this.showInnerCircle && value === this.lastItemReplacement && this.prependZero ? value.toString().padStart(2, "0") : value.toString();
      return `#${this._id}-${valueString}`;
    }
    /**
     * Returns provided value as string. Padding with additional zero is applied if necessary.
     *
     * @param {number} value The value that should be returned as string
     * @returns {string} The value as string
     */
    _getStringValue(value) {
      return this.prependZero ? value.toString().padStart(2, "0") : value.toString();
    }
    /**
     * Calculates dimension variables necessary for determining of item selection.
     *
     * @returns {TimePickerClockDimensions} Dimensions object
     */
    _calculateDimensions() {
      const cover = this.getDomRef();
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (!cover) {
        return;
      }
      const domRef = this.getDomRef();
      const dotElement = domRef.querySelector(`.${CLOCK_MIDDOT_CLASS}`);
      const numberElement = domRef.querySelector(`.${CLOCK_NUMBER_CLASS}`);
      const radius = Math.round(cover.offsetHeight / 2);
      const dotHeight = this._outerHeight(dotElement);
      const numberHeight = this._outerHeight(numberElement);
      const offset = cover.getBoundingClientRect();
      this._dimensionParameters = {
        "radius": radius,
        "centerX": radius,
        "centerY": radius,
        "dotHeight": dotHeight,
        "numberHeight": numberHeight,
        "outerMax": radius,
        "outerMin": radius - numberHeight,
        "innerMax": radius - numberHeight - 1,
        "innerMin": radius - numberHeight * 2 - 1,
        "offsetX": offset.left + scrollLeft,
        "offsetY": offset.top + scrollTop
      };
    }
    /**
     * Calculates selected and hovered values based on click/touch position.
     *
     * @param {number} x X position of click/touch returned by the event
     * @param {number} y Y position of click/touch returned by the event
     */
    _calculatePosition(x, y) {
      const dX = x - this._dimensionParameters.offsetX + 1 - this._dimensionParameters.radius;
      const dY = y - this._dimensionParameters.offsetY + 1 - this._dimensionParameters.radius;
      const mod = dX >= 0 ? 0 : 180;
      const angle = Math.atan(dY / dX) * 180 / Math.PI + 90 + mod;
      const angleStep = 360 / this.itemMax * this.valueStep;
      const radius = Math.sqrt(dX * dX + dY * dY);
      const isOuter = radius <= this._dimensionParameters.outerMax && radius > (this.showInnerCircle ? this._dimensionParameters.outerMin : this._dimensionParameters.innerMin);
      const isInner = this.showInnerCircle && radius <= this._dimensionParameters.innerMax && radius > this._dimensionParameters.innerMin;
      const isOuterHover = radius <= this._dimensionParameters.outerMax && radius > this._dimensionParameters.outerMin;
      const isInnerHover = isInner;
      let finalAngle = Math.round((angle === 0 ? 360 : angle) / angleStep) * angleStep;
      if (finalAngle === 0) {
        finalAngle = 360;
      }
      // selected item calculations
      if (isInner || isOuter) {
        this._selectedValue = finalAngle / angleStep * this.valueStep;
        if (isInner) {
          this._selectedValue += this.itemMax;
        }
      } else {
        this._selectedValue = -1;
      }
      // hover simulation calculations
      this._hoveredValue = isInnerHover || isOuterHover ? this._selectedValue : -1;
      if (this._selectedValue === this._getMaxValue() && this.lastItemReplacement !== -1) {
        this._selectedValue = this.lastItemReplacement;
      }
    }
    /**
     * Does the animation between the old and the new value of the clock. Can be skipped with setting the second parameter to true.
     *
     * @param {number} newValue the new value that must be set
     * @param {boolean} skipAnimation whether to skip the animation
     */
    _changeValueAnimation(newValue, skipAnimation = false) {
      const maxValue = this.itemMax * (this.showInnerCircle ? 2 : 1);
      let firstSelected = this._movSelectedValue;
      let lastSelected = newValue;
      let direction = 1;
      let path1;
      let path2;
      let delay;
      if (!skipAnimation) {
        // do the animation here
        path1 = Math.abs(firstSelected - lastSelected);
        path2 = maxValue - path1;
        if (firstSelected < lastSelected) {
          if (path2 < path1) {
            firstSelected += maxValue;
            direction = -1;
          }
        } else if (path2 < path1) {
          lastSelected += maxValue;
        } else {
          direction = -1;
        }
        delay = firstSelected === lastSelected ? 0 : Math.ceil(ANIMATION_DURATION_MAX / Math.abs(firstSelected - lastSelected));
        this._animationInProgress = true;
        this._selectNextNumber(firstSelected, lastSelected, direction, maxValue, newValue, delay);
      } else {
        this._setSelectedValue(newValue);
      }
    }
    /**
     * Does the animation step between old and new selected values.
     *
     * @param {number} firstSelected first/current value to move from
     * @param {number} lastSelected last value to move to
     * @param {number} direction direction of the animation
     * @param {number} maxValue max clock value
     * @param {number} newValue new value
     * @param {number} delay delay of the single step
     */
    _selectNextNumber(firstSelected, lastSelected, direction, maxValue, newValue, delay) {
      const current = firstSelected > maxValue ? firstSelected - maxValue : firstSelected;
      if (firstSelected === lastSelected) {
        this._animationInProgress = false;
      }
      this._setSelectedValue(current);
      if (firstSelected !== lastSelected) {
        firstSelected += direction;
        setTimeout(() => {
          this._selectNextNumber(firstSelected, lastSelected, direction, maxValue, newValue, delay);
        }, delay);
      } else {
        // the new value is set, fire event
        setTimeout(() => {
          this.fireEvent("change", {
            "value": newValue,
            "stringValue": this._getStringValue(newValue),
            "finalChange": true
          });
        }, ANIMATION_DELAY_EVENT);
      }
    }
    /**
     * Mousewheel handler. Increases/decreases value of the clock.
     *
     * @param {boolean} increase whether to increase or decrease the value
     */
    _modifyValue(increase) {
      let selectedValue = this.selectedValue;
      const replacementValue = this.lastItemReplacement;
      const minValue = this.itemMin;
      const maxValue = this.itemMax * (this.showInnerCircle ? 2 : 1);
      let step = this.valueStep;
      let newValue;
      // fix step in order to change value to the nearest possible if step is > 1
      if (selectedValue % step !== 0) {
        newValue = increase ? Math.ceil(selectedValue / step) * step : Math.floor(selectedValue / step) * step;
        step = Math.abs(selectedValue - newValue);
      }
      if (selectedValue === replacementValue) {
        selectedValue = maxValue;
      }
      if (increase) {
        selectedValue += step;
        if (selectedValue > maxValue) {
          selectedValue -= maxValue;
        }
      } else {
        selectedValue -= step;
        if (selectedValue < minValue) {
          selectedValue = maxValue;
        }
      }
      this._setSelectedValue(selectedValue);
    }
    /**
     * Sets new selected value, fires change event and updates selected value object used for rendering purposes.
     *
     * @param {number} value
     */
    _setSelectedValue(value) {
      const realValue = this._fixReplacementValue(value);
      this.selectedValue = realValue;
      this.fireEvent("change", {
        "value": realValue,
        "stringValue": this._getStringValue(realValue),
        "finalChange": false
      });
      this._updateSelectedValueObject(realValue);
    }
    /**
     * TouchStart/MouseDown event handler.
     *
     * @param {event} evt Event object
     */
    _onTouchStart(evt) {
      this._cancelTouchOut = false;
      if (this.disabled || this._mouseOrTouchDown) {
        return;
      }
      const x = evt.type === "touchstart" ? evt.touches[0].pageX : evt.pageX;
      const y = evt.type === "touchstart" ? evt.touches[0].pageY : evt.pageY;
      this._movSelectedValue = this.selectedValue;
      this._calculateDimensions();
      this._calculatePosition(x, y);
      this._mouseOrTouchDown = true;
    }
    /**
     * TouchMove/MouseMove event handler.
     *
     * @param {event} evt Event object
     */
    _onTouchMove(evt) {
      let hoveredNumber;
      const domRef = this.getDomRef();
      evt.preventDefault();
      if (this._mouseOrTouchDown) {
        const x = evt.type === "touchmove" ? evt.touches[0].pageX : evt.pageX;
        const y = evt.type === "touchmove" ? evt.touches[0].pageY : evt.pageY;
        this._calculatePosition(x, y);
        if (!this.disabled && this._selectedValue !== -1 && this._selectedValue !== this._movSelectedValue) {
          this._setSelectedValue(this._selectedValue);
          this._movSelectedValue = 0 + this._selectedValue;
        }
      } else if (evt.type === "mousemove") {
        if (!this._dimensionParameters.radius) {
          this._calculateDimensions();
        }
        this._calculatePosition(evt.pageX, evt.pageY);
        if (this.displayStep > 1 && this._hoveredValue !== -1) {
          this._hoveredValue = Math.round(this._hoveredValue / this.displayStep) * this.displayStep;
        }
        if (!this.disabled && this._hoveredValue !== this._prevHoveredValue) {
          hoveredNumber = domRef.querySelector(this._hoveredId(this._prevHoveredValue));
          hoveredNumber && hoveredNumber.classList.remove(CLOCK_NUMBER_HOVER_CLASS);
          this._prevHoveredValue = this._hoveredValue;
          hoveredNumber = domRef.querySelector(this._hoveredId(this._prevHoveredValue));
          hoveredNumber && hoveredNumber.classList.add(CLOCK_NUMBER_HOVER_CLASS);
        }
      }
    }
    /**
     * TouchEnd/MouseUp event handler.
     *
     * @param {event} evt Event object
     */
    _onTouchEnd(evt) {
      if (!this._mouseOrTouchDown) {
        return;
      }
      this._mouseOrTouchDown = false;
      evt.preventDefault();
      if (this.disabled || this._selectedValue === -1) {
        return;
      }
      if (!this._cancelTouchOut) {
        this._changeValueAnimation(this._selectedValue);
      }
    }
    /**
     * Mouse Wheel event handler.
     *
     * @param {WheelEvent} evt Event object
     */
    _onMouseWheel(evt) {
      const increase = evt.detail ? evt.detail > 0 : evt.deltaY > 0 || evt.deltaX > 0;
      evt.preventDefault();
      if (!this._mouseOrTouchDown) {
        this._modifyValue(increase);
      }
    }
    /**
     * MouseOut event handler.
     */
    _onMouseOut() {
      const hoveredNumber = this.getDomRef().querySelector(this._hoveredId(this._hoveredValue));
      hoveredNumber && hoveredNumber.classList.remove(CLOCK_NUMBER_HOVER_CLASS);
      this._hoveredValue = -1;
      this._prevHoveredValue = -1;
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean
  })], TimePickerClock.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TimePickerClock.prototype, "active", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: -1
  })], TimePickerClock.prototype, "itemMin", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: -1
  })], TimePickerClock.prototype, "itemMax", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TimePickerClock.prototype, "showInnerCircle", void 0);
  __decorate([(0, _property.default)({
    type: String,
    defaultValue: undefined
  })], TimePickerClock.prototype, "label", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TimePickerClock.prototype, "hideFractions", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: -1
  })], TimePickerClock.prototype, "lastItemReplacement", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], TimePickerClock.prototype, "prependZero", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: -1
  })], TimePickerClock.prototype, "selectedValue", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 5
  })], TimePickerClock.prototype, "displayStep", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 1
  })], TimePickerClock.prototype, "valueStep", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], TimePickerClock.prototype, "_items", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], TimePickerClock.prototype, "_selectedItem", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], TimePickerClock.prototype, "_dimensionParameters", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], TimePickerClock.prototype, "_mouseOrTouchDown", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], TimePickerClock.prototype, "_cancelTouchOut", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: -1,
    noAttribute: true
  })], TimePickerClock.prototype, "_selectedValue", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: -1,
    noAttribute: true
  })], TimePickerClock.prototype, "_movSelectedValue", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: -1,
    noAttribute: true
  })], TimePickerClock.prototype, "_hoveredValue", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: -1,
    noAttribute: true
  })], TimePickerClock.prototype, "_prevHoveredValue", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], TimePickerClock.prototype, "_animationInProgress", void 0);
  TimePickerClock = __decorate([(0, _customElement.default)({
    tag: "ui5-time-picker-clock",
    renderer: _LitRenderer.default,
    styles: _TimePickerClock.default,
    template: _TimePickerClockTemplate.default
  })
  /**
   * Fired when a value of clock is changed.
   *
   * @event sap.ui.webc.main.TimePickerClock#change
   * @param { integer } value The new <code>value</code> of the clock.
   * @param { string } stringValue The new <code>value</code> of the clock, as string, zero-prepended when necessary.
   * @param { boolean } finalChange <code>true</code> when a value is selected and confirmed, <code>false</code> when a value is only selected but not confirmed.
   */, (0, _event.default)("change", {
    detail: {
      value: {
        type: _Integer.default
      },
      stringValue: {
        type: String
      },
      finalChange: {
        type: Boolean
      }
    }
  })], TimePickerClock);
  TimePickerClock.define();
  var _default = TimePickerClock;
  _exports.default = _default;
});