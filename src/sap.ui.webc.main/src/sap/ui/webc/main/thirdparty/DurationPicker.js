sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/icons/fob-watch", "./TimePickerBase", "./generated/i18n/i18n-defaults"], function (_exports, _Integer, _fobWatch, _TimePickerBase, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _Integer = _interopRequireDefault(_Integer);
  _TimePickerBase = _interopRequireDefault(_TimePickerBase);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @private
   */
  const metadata = {
    tag: "ui5-duration-picker",
    properties: /** @lends sap.ui.webcomponents.main.DurationPicker.prototype */{
      /**
       * Defines a formatted time value.
       *
       * @type {string}
       * @defaultvalue "00:00:00"
       * @public
       */
      value: {
        type: String,
        defaultValue: "00:00:00"
      },
      /**
       * Defines the selection step for the minutes
       * @type {Integer}
       * @public
       * @defaultValue 1
       * @since 1.0.0-rc.8
       */
      minutesStep: {
        type: _Integer.default,
        defaultValue: 1
      },
      /**
       * Defines the selection step for the seconds
       * @type {Integer}
       * @public
       * @defaultValue 1
       * @since 1.0.0-rc.8
       */
      secondsStep: {
        type: _Integer.default,
        defaultValue: 1
      },
      /**
       * Defines a formatted maximal time that the user will be able to adjust.
       *
       * @type {string}
       * @defaultvalue "23:59:59"
       * @public
       */
      maxValue: {
        type: String,
        defaultValue: "23:59:59"
      },
      /**
       * Defines whether a slider for seconds will be available. By default there are sliders for hours, minutes and seconds.
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      hideSeconds: {
        type: Boolean
      },
      /**
       * Defines whether the slider for minutes will be available. By default there are sliders for hours, minutes and seconds.
       * @type {boolean}
       * @defaultvalue false
       * @public
       * @since 1.0.0-rc.8
       */
      hideMinutes: {
        type: Boolean
      },
      /**
       * Defines whether the slider for hours will be available. By default there are sliders for hours, minutes and seconds.
       * @type {boolean}
       * @defaultvalue false
       * @public
       * @since 1.0.0-rc.8
       */
      hideHours: {
        type: Boolean
      }
    }
  };
  const getNearestValue = (x, step, max) => {
    const down = Math.floor(x / step) * step; // closest value rounded down to the step
    const up = Math.ceil(x / step) * step; // closest value rounded up to the step
    if (up > max || x - down < up - x) {
      // if the rounded-up value is more than max, or x is closer to the rounded-down value, return down
      return down;
    }
    return up; // x is closer to the rounded-up value and it is not
  };

  const pad = number => {
    number = parseInt(number);
    return number < 9 ? `0${number}` : `${number}`;
  };

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>ui5-duration-picker</code> component provides an input field with assigned sliders which are opened on user action.
   * The <code>ui5-duration-picker</code> allows users to select a time duration.
   * It consists of two parts: the time input field and the sliders.
   *
   *
   * <h3>Usage</h3>
   *
   *
   * The Duration Picker is used for input of time. Users are able to select hours, minutes and seconds.
   * The user can enter a time by:
   * <ul>
   * <li>Using the sliders that opens in a popup</li>
   * <li>Typing it in directly in the input field</li>
   * </ul>
   * <br><br>
   * When the user makes an entry and chooses the enter key, the sliders shows the corresponding time.
   * When the user directly triggers the sliders display, the actual time is displayed.
   *
   * For the <code>ui5-duration-picker</code>
   *
   * <h3>Keyboard handling</h3>
   * [F4], [ALT]+[UP], [ALT]+[DOWN] Open/Close picker dialog and move focus to it.
   * <br>
   * When closed:
   * <ul>
   * <li>[PAGEUP] - Increments hours by 1. If max value is reached, the slider doesn't increment.</li>
   * <li>[PAGEDOWN] - Decrements the corresponding field by 1. If min value is reached, the slider doesn't increment.</li>
   * <li>[SHIFT]+[PAGEUP] Increments minutes by 1.</li>
   * <li>[SHIFT]+ [PAGEDOWN] Decrements minutes by 1.</li>
   * <li>[SHIFT]+[CTRL]+[PAGEUP] Increments seconds by 1.</li>
   * <li>[SHIFT]+[CTRL]+ [PAGEDOWN] Decrements seconds by 1.</li>
   * </ul>
   * When opened:
   * <ul>
   * <li>[UP] If focus is on one of the selection lists: Select the value which is above the current value. If the first value is selected, select the last value in the list.</li>
   * <li>[DOWN] If focus is on one of the selection lists: Select the value which is below the current value. If the last value is selected, select the first value in the list.</li>
   * <li>[LEFT] If focus is on one of the selection lists: Move focus to the selection list which is left of the current selection list. If focus is at the first selection list, move focus to the last selection list.</li>
   * <li>[RIGHT] If focus is on one of the selection lists: Move focus to the selection list which is right of the current selection list. When focus is at the last selection list, move focus to the first selection list.</li>
   * <li>[PAGEUP] If focus is on one of the selection lists: Move focus to the first entry of this list.</li>
   * <li>[PAGEDOWN] If focus is on one of the selection lists: Move focus to the last entry of this list.</li>
   * </ul>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/DurationPicker.js";</code>
   *
   * @constructor
   * @since 1.0.0-rc.7
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.DurationPicker
   * @extends TimePickerBase
   * @tagname ui5-duration-picker
   * @private
   */
  class DurationPicker extends _TimePickerBase.default {
    static get metadata() {
      return metadata;
    }

    /**
     * In order to keep the existing behavior (although not consistent with the other picker components), we enforce limits and step on each change and initially
     */
    onBeforeRendering() {
      const value = this.value;
      if (this.isValid(value)) {
        this.value = this.normalizeValue(value);
      }
    }

    /**
     * In order to keep the existing behavior (although not consistent with the other picker components), we do not update "value" on input, only fire event
     * @override
     */
    async _handleInputLiveChange(event) {
      const value = event.target.value;
      const valid = this.isValid(value);
      this._updateValueState(); // Change the value state to Error/None, but only if needed
      this.fireEvent("input", {
        value,
        valid
      });
    }
    get _formatPattern() {
      return "HH:mm:ss";
    }

    /**
     * The "value" property might be "02:03" (HH:ss) or just "12"(ss) but the ui5-time-selection component requires a value compliant with _formatPattern
     * We split the value and shift up to 3 times, filling the values for the configured units (based on hideHours, hideMinutes, hideSeconds)
     * @override
     */
    get _effectiveValue() {
      return this.isValid(this.value) ? this._toFullFormat(this.value) : "00:00:00";
    }
    get _timeSelectionValue() {
      return this._effectiveValue;
    }

    /**
     * @override
     */
    get openIconName() {
      return "fob-watch";
    }

    /**
     * Transforms the value to HH:mm:ss format to be compatible with time manipulation logic (keyboard handling, time selection component)
     * @private
     */
    _toFullFormat(value) {
      let hours = "00",
        minutes = "00",
        seconds = "00";
      const parts = value.split(":");
      if (parts.length && !this.hideHours) {
        hours = parts.shift();
      }
      if (parts.length && !this.hideMinutes) {
        minutes = parts.shift();
      }
      if (parts.length && !this.hideSeconds) {
        seconds = parts.shift();
      }
      return `${hours}:${minutes}:${seconds}`;
    }

    /**
     * Transforms the value from HH:mm:ss format to the needed partial format (f.e. HH:ss or mm or ss) to be displayed in the input
     * @private
     */
    _toPartialFormat(value) {
      const parts = value.split(":");
      const newParts = [];
      if (!this.hideHours) {
        newParts.push(parts[0]);
      }
      if (!this.hideMinutes) {
        newParts.push(parts[1]);
      }
      if (!this.hideSeconds) {
        newParts.push(parts[2]);
      }
      return newParts.join(":");
    }
    _enforceLimitsAndStep(fullFormatValue) {
      let [hours, minutes, seconds] = fullFormatValue.split(":");
      hours = Math.min(hours, this.maxHours);
      minutes = Math.min(minutes, this.maxMinutes);
      seconds = Math.min(seconds, this.maxSeconds);
      minutes = getNearestValue(minutes, this.minutesStep, this.maxMinutes);
      seconds = getNearestValue(seconds, this.secondsStep, this.maxSeconds);
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

    /**
     * @override
     */
    normalizeValue(value) {
      let fullFormatValue = this._toFullFormat(value); // transform to full format (HH:mm:ss) if not already in this format, in order to normalize the value
      fullFormatValue = this._enforceLimitsAndStep(fullFormatValue);
      return this._toPartialFormat(fullFormatValue); // finally transform back to the needed format for the input
    }

    get maxHours() {
      return parseInt(this.maxValue.split(":")[0]);
    }
    get maxMinutes() {
      return parseInt(this.maxValue.split(":")[1]);
    }
    get maxSeconds() {
      return parseInt(this.maxValue.split(":")[2]);
    }
    get dateAriaDescription() {
      return DurationPicker.i18nBundle.getText(_i18nDefaults.DURATION_INPUT_DESCRIPTION);
    }
    get accInfo() {
      return {
        "ariaRoledescription": this.dateAriaDescription,
        "ariaHasPopup": "dialog",
        "ariaAutoComplete": "none",
        "role": "combobox",
        "ariaControls": `${this._id}-responsive-popover`,
        "ariaExpanded": this.isOpen()
      };
    }
  }
  DurationPicker.define();
  var _default = DurationPicker;
  _exports.default = _default;
});