sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/UI5Element", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/i18nBundle", "sap/ui/webc/common/thirdparty/base/locale/getLocale", "sap/ui/webc/common/thirdparty/localization/DateFormat", "sap/ui/webc/common/thirdparty/localization/getCachedLocaleDataInstance", "sap/ui/webc/common/thirdparty/localization/features/calendar/Gregorian", "sap/ui/webc/common/thirdparty/base/types/CalendarType", "sap/ui/webc/common/thirdparty/base/asset-registries/LocaleData", "sap/ui/webc/common/thirdparty/base/types/Integer", "./timepicker-utils/TimeSlider", "./generated/i18n/i18n-defaults"], function (_exports, _UI5Element, _customElement, _property, _event, _i18nBundle, _getLocale, _DateFormat, _getCachedLocaleDataInstance, _Gregorian, _CalendarType, _LocaleData, _Integer, _TimeSlider, _i18nDefaults) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _UI5Element = _interopRequireDefault(_UI5Element);
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _getLocale = _interopRequireDefault(_getLocale);
  _DateFormat = _interopRequireDefault(_DateFormat);
  _getCachedLocaleDataInstance = _interopRequireDefault(_getCachedLocaleDataInstance);
  _CalendarType = _interopRequireDefault(_CalendarType);
  _Integer = _interopRequireDefault(_Integer);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var TimePickerInternals_1;

  // default calendar for bundling

  const TYPE_COOLDOWN_DELAY = 1000; // Cooldown delay; 0 = disabled cooldown
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * <code>ui5-time-picker-internals</code> is helper component that contains shared methods used in <code>ui5-time-selection-clocks</code>
   * and <ui5-time-selection-inputs> components and should not be used separately.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.TimePickerInternals
   * @extends sap.ui.webc.base.UI5Element
   * @abstract
   * @tagname ui5-time-picker-internals
   * @since 1.15.0
   * @private
   */
  let TimePickerInternals = TimePickerInternals_1 = class TimePickerInternals extends _UI5Element.default {
    static async onDefine() {
      [TimePickerInternals_1.i18nBundle] = await Promise.all([(0, _i18nBundle.getI18nBundle)("@ui5/webcomponents"), (0, _LocaleData.fetchCldr)((0, _getLocale.default)().getLanguage(), (0, _getLocale.default)().getRegion(), (0, _getLocale.default)().getScript())]);
    }
    get _hoursConfiguration() {
      // @ts-ignore aFormatArray is a private API of DateFormat
      const formatArray = this.getFormat().aFormatArray;
      const hourFormat = formatArray.find(item => item.type.startsWith("hour")); // try to find an entry for the hours
      return (0, _TimeSlider.getHoursConfigByFormat)(hourFormat ? hourFormat.type : "hour0_23");
    }
    get _zeroPaddedHours() {
      // @ts-ignore aFormatArray is a private API of DateFormat
      const formatArray = this.getFormat().aFormatArray;
      const hourFormat = formatArray.find(item => item.type.startsWith("hour")); // try to find an entry for the hours
      // @ts-ignore digits is a private API of aFormatArray
      return !(hourFormat.digits && hourFormat.digits === 1);
    }
    get _neededComponents() {
      // @ts-ignore aFormatArray is a private API of DateFormat
      const formatArray = this.getFormat().aFormatArray;
      return (0, _TimeSlider.getTimeControlsByFormat)(formatArray, this._hoursConfiguration);
    }
    get _hasHoursComponent() {
      return this._neededComponents[0];
    }
    get _hasMinutesComponent() {
      return this._neededComponents[1];
    }
    get _hasSecondsComponent() {
      return this._neededComponents[2];
    }
    get _hasPeriodsComponent() {
      return this._neededComponents[3];
    }
    get dateValue() {
      return this.value ? this.getFormat().parse(this.value, undefined, undefined) : new Date();
    }
    get validDateValue() {
      return this.value !== undefined && this.isValid(this.value) ? this.dateValue : new Date();
    }
    get periodsArray() {
      // @ts-ignore aDayPeriodsAbbrev is a private API of DateFormat
      const dayPeriodsAbbrev = this.getFormat().aDayPeriodsAbbrev;
      return dayPeriodsAbbrev.map(x => x.toUpperCase());
    }
    get _hours() {
      let hours;
      const dateValue = this.validDateValue;
      if (this._hoursConfiguration.isTwelveHoursFormat && dateValue.getHours() > this._hoursConfiguration.maxHour) {
        hours = dateValue.getHours() - 12;
      } else if (this._hoursConfiguration.isTwelveHoursFormat && dateValue.getHours() < this._hoursConfiguration.minHour) {
        hours = dateValue.getHours() + 12;
      } else {
        hours = dateValue.getHours();
      }
      if (hours.toString().length === 1 && this._zeroPaddedHours) {
        hours = `0${hours}`;
      }
      return hours.toString();
    }
    get _minutes() {
      const minutes = this.validDateValue.getMinutes().toString();
      return minutes.length === 1 ? `0${minutes}` : minutes;
    }
    get _seconds() {
      const seconds = this.validDateValue.getSeconds().toString();
      return seconds.length === 1 ? `0${seconds}` : seconds;
    }
    get _period() {
      let period;
      const dateValue = this.validDateValue;
      if (!this._hoursConfiguration.isTwelveHoursFormat) {
        return undefined;
      }
      if (this._hoursConfiguration.minHour === 1) {
        period = dateValue.getHours() >= this._hoursConfiguration.maxHour ? this.periodsArray[1] : this.periodsArray[0];
      } else {
        period = dateValue.getHours() > this._hoursConfiguration.maxHour || dateValue.getHours() === this._hoursConfiguration.minHour ? this.periodsArray[1] : this.periodsArray[0];
      }
      return period;
    }
    get _formatPattern() {
      const pattern = this.formatPattern;
      const hasHours = !!pattern.match(/H/i);
      const fallback = !pattern || !hasHours;
      const localeData = (0, _getCachedLocaleDataInstance.default)((0, _getLocale.default)());
      return fallback ? localeData.getCombinedDateTimePattern("medium", "medium", undefined) : pattern;
    }
    get _isPattern() {
      return this._formatPattern !== "medium" && this._formatPattern !== "short" && this._formatPattern !== "long";
    }
    get hoursLabel() {
      return TimePickerInternals_1.i18nBundle.getText(_i18nDefaults.TIMEPICKER_HOURS_LABEL);
    }
    get minutesLabel() {
      return TimePickerInternals_1.i18nBundle.getText(_i18nDefaults.TIMEPICKER_MINUTES_LABEL);
    }
    get secondsLabel() {
      return TimePickerInternals_1.i18nBundle.getText(_i18nDefaults.TIMEPICKER_SECONDS_LABEL);
    }
    get clockDialAriaLabel() {
      return TimePickerInternals_1.i18nBundle.getText(_i18nDefaults.TIMEPICKER_CLOCK_DIAL_LABEL);
    }
    setValue(date) {
      const value = this.formatValue(date);
      if (this.isValid(value)) {
        this.value = this.normalizeValue(value);
        this.fireEvent("change", {
          value: this.value,
          valid: true
        });
      }
    }
    isValid(value) {
      return value === "" || this.getFormat().parse(value, undefined, undefined);
    }
    normalizeValue(value) {
      if (value === "") {
        return value;
      }
      return this.getFormat().format(this.getFormat().parse(value, undefined, undefined));
    }
    getFormat() {
      let dateFormat;
      if (this._isPattern) {
        dateFormat = _DateFormat.default.getDateInstance({
          calendarType: this._calendarType,
          pattern: this._formatPattern
        });
      } else {
        dateFormat = _DateFormat.default.getDateInstance({
          calendarType: this._calendarType,
          style: this._formatPattern
        });
      }
      return dateFormat;
    }
    formatValue(date) {
      return this.getFormat().format(date);
    }
    _componentKey(name) {
      return name;
    }
    _indexFromName(name) {
      return this._componentMap[this._componentKey(name)];
    }
    /**
     * Returns name of the clock or button from the id of the event target.
     *
     * @returns {string | undefined} name of the clock/button
     */
    _getNameFromId(id) {
      const parts = id.split("_");
      return parts.length ? parts[parts.length - 1] : undefined;
    }
    /**
     * Returns index of the clock or button from the id of the event target.
     *
     * @returns {number} index of the clock/button
     */
    _getIndexFromId(id) {
      const name = this._getNameFromId(id);
      return name ? this._indexFromName(name) : 0;
    }
    /**
     * Changes hours value.
     *
     * @param {hours} number new hours value
     */
    _hoursChange(hours) {
      if (this._hoursConfiguration.isTwelveHoursFormat) {
        hours = this._shiftHours(hours);
      }
      const date = this.validDateValue;
      date.setHours(hours);
      this.setValue(date);
    }
    /**
     * Changes minutes value.
     *
     * @param {minutes} number new minutes value
     */
    _minutesChange(minutes) {
      const date = this.validDateValue;
      date.setMinutes(minutes);
      this.setValue(date);
    }
    /**
     * Changes seconds value.
     *
     * @param {seconds} number new seconds value
     */
    _secondsChange(seconds) {
      const date = this.validDateValue;
      date.setSeconds(seconds);
      this.setValue(date);
    }
    _buttonAmPm() {
      return this._hasPeriodsComponent ? this.shadowRoot?.querySelector(`#${this._id}_AmPm`) : undefined;
    }
    _createPeriodComponent() {
      if (this._hasPeriodsComponent) {
        // add period item
        this.periodsArray.forEach(item => {
          this._periods.push({
            "label": item,
            "pressed": this._period === item
          });
        });
      }
    }
    _periodChange(evt) {
      const periodItem = evt.target;
      if (periodItem) {
        const period = periodItem.textContent;
        this._calculatePeriodChange(period);
      }
    }
    _calculatePeriodChange(period) {
      const date = this.validDateValue;
      if (period === this._periods[0].label && date.getHours() >= 12) {
        date.setHours(date.getHours() - 12);
      }
      if (period === this._periods[1].label && date.getHours() < 12) {
        date.setHours(date.getHours() + 12);
      }
      this.setValue(date);
    }
    /**
     * Shifts hours value with +/- 12 depending on hour value and day period.
     *
     * @param {number} hours current hours
     * @returns {number} shifted hours
     */
    _shiftHours(hours) {
      if (this._period === this.periodsArray[0]) {
        // AM
        hours = hours === 12 ? 0 : hours;
      } else if (this._period === this.periodsArray[1]) {
        // PM
        hours = hours === 12 ? hours : hours + 12;
      }
      return hours;
    }
    /**
     * Clears the currently existing cooldown period and starts new one if requested.
     *
     * @param {boolean} startNewCooldown whether to start new cooldown period after clearing previous one
     */
    _resetCooldown(startNewCooldown) {
      if (!TYPE_COOLDOWN_DELAY) {
        return; // if delay is 0, cooldown is disabled
      }

      if (this._typeCooldownId) {
        clearTimeout(this._typeCooldownId);
      }
      if (startNewCooldown) {
        this._startCooldown();
      }
    }
    /**
     * Starts new cooldown period.
     */
    _startCooldown() {
      if (!TYPE_COOLDOWN_DELAY) {
        return; // if delay is 0, cooldown is disabled
      }

      this._typeCooldownId = setTimeout(() => {
        this._keyboardBuffer = "";
        this._typeCooldownId = undefined;
        if (this._exactMatch) {
          this._setExactMatch();
          this._exactMatch = undefined;
        }
      }, TYPE_COOLDOWN_DELAY);
    }
    /**
     * Sets the exact match value. Override if necessary.
     */
    _setExactMatch() {}
  };
  __decorate([(0, _property.default)({
    defaultValue: undefined
  })], TimePickerInternals.prototype, "value", void 0);
  __decorate([(0, _property.default)()], TimePickerInternals.prototype, "formatPattern", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    defaultValue: 0,
    noAttribute: true
  })], TimePickerInternals.prototype, "_activeIndex", void 0);
  __decorate([(0, _property.default)({
    type: _CalendarType.default
  })], TimePickerInternals.prototype, "_calendarType", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], TimePickerInternals.prototype, "_entities", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], TimePickerInternals.prototype, "_componentMap", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], TimePickerInternals.prototype, "_periods", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    noAttribute: true
  })], TimePickerInternals.prototype, "_typeCooldownId", void 0);
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    noAttribute: true
  })], TimePickerInternals.prototype, "_exactMatch", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "",
    noAttribute: true
  })], TimePickerInternals.prototype, "_keyboardBuffer", void 0);
  TimePickerInternals = TimePickerInternals_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-time-picker-internals"
  })
  /**
   * Fired when the value changes due to user interaction with the sliders.
   */, (0, _event.default)("change", {
    detail: {
      value: {
        type: String
      },
      valid: {
        type: Boolean
      }
    }
  })], TimePickerInternals);
  TimePickerInternals.define();
  var _default = TimePickerInternals;
  _exports.default = _default;
});