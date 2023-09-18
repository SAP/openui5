sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/slot", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/localization/dates/CalendarDate", "sap/ui/webc/common/thirdparty/localization/dates/modifyDateBy", "sap/ui/webc/common/thirdparty/localization/dates/getRoundedTimestamp", "sap/ui/webc/common/thirdparty/localization/dates/getTodayUTCTimestamp", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/Device", "./types/CalendarPickersMode", "sap/ui/webc/common/thirdparty/icons/appointment-2", "sap/ui/webc/common/thirdparty/icons/decline", "./types/HasPopup", "./generated/i18n/i18n-defaults", "./DateComponentBase", "./Icon", "./Button", "./ResponsivePopover", "./Calendar", "./CalendarDate", "./Input", "./types/InputType", "./generated/templates/DatePickerTemplate.lit", "./generated/templates/DatePickerPopoverTemplate.lit", "sap/ui/webc/common/thirdparty/localization/features/calendar/Gregorian", "./generated/themes/DatePicker.css", "./generated/themes/DatePickerPopover.css", "./generated/themes/ResponsivePopoverCommon.css"], function (_exports, _customElement, _property, _slot, _event, _FeaturesRegistry, _CalendarDate, _modifyDateBy, _getRoundedTimestamp, _getTodayUTCTimestamp, _ValueState, _AriaLabelHelper, _Keys, _Device, _CalendarPickersMode, _appointment, _decline, _HasPopup, _i18nDefaults, _DateComponentBase, _Icon, _Button, _ResponsivePopover, _Calendar, _CalendarDate2, _Input, _InputType, _DatePickerTemplate, _DatePickerPopoverTemplate, _Gregorian, _DatePicker, _DatePickerPopover, _ResponsivePopoverCommon) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _slot = _interopRequireDefault(_slot);
  _event = _interopRequireDefault(_event);
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  _modifyDateBy = _interopRequireDefault(_modifyDateBy);
  _getRoundedTimestamp = _interopRequireDefault(_getRoundedTimestamp);
  _getTodayUTCTimestamp = _interopRequireDefault(_getTodayUTCTimestamp);
  _ValueState = _interopRequireDefault(_ValueState);
  _CalendarPickersMode = _interopRequireDefault(_CalendarPickersMode);
  _HasPopup = _interopRequireDefault(_HasPopup);
  _DateComponentBase = _interopRequireDefault(_DateComponentBase);
  _Icon = _interopRequireDefault(_Icon);
  _Button = _interopRequireDefault(_Button);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  _Calendar = _interopRequireDefault(_Calendar);
  _CalendarDate2 = _interopRequireDefault(_CalendarDate2);
  _Input = _interopRequireDefault(_Input);
  _InputType = _interopRequireDefault(_InputType);
  _DatePickerTemplate = _interopRequireDefault(_DatePickerTemplate);
  _DatePickerPopoverTemplate = _interopRequireDefault(_DatePickerPopoverTemplate);
  _DatePicker = _interopRequireDefault(_DatePicker);
  _DatePickerPopover = _interopRequireDefault(_DatePickerPopover);
  _ResponsivePopoverCommon = _interopRequireDefault(_ResponsivePopoverCommon);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var DatePicker_1;

  // default calendar for bundling

  // Styles

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-date-picker</code> component provides an input field with assigned calendar which opens on user action.
   * The <code>ui5-date-picker</code> allows users to select a localized date using touch,
   * mouse, or keyboard input. It consists of two parts: the date input field and the
   * date picker.
   *
   * <h3>Usage</h3>
   *
   * The user can enter a date by:
   * <ul>
   * <li>Using the calendar that opens in a popup</li>
   * <li>Typing it in directly in the input field</li>
   * </ul>
   * <br><br>
   * When the user makes an entry and presses the enter key, the calendar shows the corresponding date.
   * When the user directly triggers the calendar display, the actual date is displayed.
   *
   * <h3>Formatting</h3>
   *
   * If a date is entered by typing it into
   * the input field, it must fit to the used date format.
   * <br><br>
   * Supported format options are pattern-based on Unicode LDML Date Format notation.
   * For more information, see <ui5-link target="_blank" href="http://unicode.org/reports/tr35/#Date_Field_Symbol_Table">UTS #35: Unicode Locale Data Markup Language</ui5-link>.
   * <br><br>
   * For example, if the <code>format-pattern</code> is "yyyy-MM-dd",
   * a valid value string is "2015-07-30" and the same is displayed in the input.
   *
   * <h3>Keyboard Handling</h3>
   * The <code>ui5-date-picker</code> provides advanced keyboard handling.
   * If the <code>ui5-date-picker</code> is focused,
   * you can open or close the drop-down by pressing <code>F4</code>, <code>ALT+UP</code> or <code>ALT+DOWN</code> keys.
   * Once the drop-down is opened, you can use the <code>UP</code>, <code>DOWN</code>, <code>LEFT</code>, <code>RIGHT</code> arrow keys
   * to navigate through the dates and select one by pressing the <code>Space</code> or <code>Enter</code> keys. Moreover you can
   * use TAB to reach the buttons for changing month and year.
   * <br>
   *
   * If the <code>ui5-date-picker</code> input field is focused and its corresponding picker dialog is not opened,
   * then users can increment or decrement the date referenced by <code>dateValue</code> property
   * by using the following shortcuts:
   * <br>
   * <ul>
   * <li>[PAGEDOWN] - Decrements the corresponding day of the month by one</li>
   * <li>[SHIFT] + [PAGEDOWN] - Decrements the corresponding month by one</li>
   * <li>[SHIFT] + [CTRL] + [PAGEDOWN] - Decrements the corresponding year by one</li>
   * <li>[PAGEUP] - Increments the corresponding day of the month by one</li>
   * <li>[SHIFT] + [PAGEUP] - Increments the corresponding month by one</li>
   * <li>[SHIFT] + [CTRL] + [PAGEUP] - Increments the corresponding year by one</li>
   * </ul>
   *
   * <h3>Calendar types</h3>
   * The component supports several calendar types - Gregorian, Buddhist, Islamic, Japanese and Persian.
   * By default the Gregorian Calendar is used. In order to use the Buddhist, Islamic, Japanese or Persian calendar,
   * you need to set the <code>primaryCalendarType</code> property and import one or more of the following modules:
   * <br><br>
   *
   * <code>import "@ui5/webcomponents-localization/dist/features/calendar/Buddhist.js";</code>
   * <br>
   * <code>import "@ui5/webcomponents-localization/dist/features/calendar/Islamic.js";</code>
   * <br>
   * <code>import "@ui5/webcomponents-localization/dist/features/calendar/Japanese.js";</code>
   * <br>
   * <code>import "@ui5/webcomponents-localization/dist/features/calendar/Persian.js";</code>
   * <br><br>
   *
   * Or, you can use the global configuration and set the <code>calendarType</code> key:
   * <br>
   * <pre><code>&lt;script data-id="sap-ui-config" type="application/json"&gt;
   * {
   *	"calendarType": "Japanese"
   * }
   * &lt;/script&gt;</code></pre>
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/DatePicker";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.DatePicker
   * @extends sap.ui.webc.main.DateComponentBase
   * @tagname ui5-date-picker
   * @public
   */
  let DatePicker = DatePicker_1 = class DatePicker extends _DateComponentBase.default {
    /**
     * @protected
     */
    onResponsivePopoverAfterClose() {
      this._isPickerOpen = false;
      if ((0, _Device.isPhone)()) {
        this.blur(); // close device's keyboard and prevent further typing
      } else {
        this._getInput()?.focus();
      }
    }
    onBeforeRendering() {
      this.FormSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");
      ["minDate", "maxDate"].forEach(prop => {
        const propValue = this[prop];
        if (!this.isValid(propValue)) {
          console.warn(`Invalid value for property "${prop}": ${propValue} is not compatible with the configured format pattern: "${this._displayFormat}"`); // eslint-disable-line
        }
      });

      if (this.FormSupport) {
        this.FormSupport.syncNativeHiddenInput(this);
      } else if (this.name) {
        console.warn(`In order for the "name" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`); // eslint-disable-line
      }

      this.value = this.normalizeValue(this.value) || this.value;
      this.liveValue = this.value;
    }
    /**
     * Override in derivatives to change calendar selection mode
     * @returns {string}
     * @protected
     */
    get _calendarSelectionMode() {
      return "Single";
    }
    /**
     * Used to provide a timestamp to the Calendar (to focus it to a relevant date when open) based on the component's state
     * Override in derivatives to provide the calendar a timestamp based on their properties
     * By default focus the calendar on the selected date if set, or the current day otherwise
     * @protected
     * @returns { number } the calendar timestamp
     */
    get _calendarTimestamp() {
      if (this.value && this.dateValueUTC && this._checkValueValidity(this.value)) {
        const millisecondsUTC = this.dateValueUTC.getTime();
        return (0, _getRoundedTimestamp.default)(millisecondsUTC);
      }
      return (0, _getTodayUTCTimestamp.default)(this._primaryCalendarType);
    }
    /**
     * Used to provide selectedDates to the calendar based on the component's state
     * Override in derivatives to provide different rules for setting the calendar's selected dates
     * @protected
     * @returns { array } the selected dates
     */
    get _calendarSelectedDates() {
      if (this.value && this._checkValueValidity(this.value)) {
        return [this.value];
      }
      return [];
    }
    _onkeydown(e) {
      if ((0, _Keys.isShow)(e)) {
        e.preventDefault(); // Prevent scroll on Alt/Option + Arrow Up/Down
        if (this.isOpen()) {
          if (!(0, _Keys.isF4)(e)) {
            this._toggleAndFocusInput();
          }
        } else {
          this._toggleAndFocusInput();
        }
      }
      if (this._getInput().isEqualNode(e.target) && this.isOpen() && ((0, _Keys.isTabNext)(e) || (0, _Keys.isTabPrevious)(e) || (0, _Keys.isF6Next)(e) || (0, _Keys.isF6Previous)(e))) {
        this.closePicker();
      }
      if (this.isOpen()) {
        return;
      }
      if ((0, _Keys.isEnter)(e)) {
        if (this.FormSupport) {
          this.FormSupport.triggerFormSubmit(this);
        }
      } else if ((0, _Keys.isPageUpShiftCtrl)(e)) {
        e.preventDefault();
        this._modifyDateValue(1, "year");
      } else if ((0, _Keys.isPageUpShift)(e)) {
        e.preventDefault();
        this._modifyDateValue(1, "month");
      } else if ((0, _Keys.isPageUp)(e)) {
        e.preventDefault();
        this._modifyDateValue(1, "day");
      } else if ((0, _Keys.isPageDownShiftCtrl)(e)) {
        e.preventDefault();
        this._modifyDateValue(-1, "year");
      } else if ((0, _Keys.isPageDownShift)(e)) {
        e.preventDefault();
        this._modifyDateValue(-1, "month");
      } else if ((0, _Keys.isPageDown)(e)) {
        e.preventDefault();
        this._modifyDateValue(-1, "day");
      }
    }
    /**
     *
     * @param { number } amount
     * @param { string } unit
     * @param { boolean } preserveDate whether to preserve the day of the month (f.e. 15th of March + 1 month = 15th of April)
     * @protected
     */
    _modifyDateValue(amount, unit, preserveDate) {
      if (!this.dateValue) {
        return;
      }
      const modifiedDate = (0, _modifyDateBy.default)(_CalendarDate.default.fromLocalJSDate(this.dateValue), amount, unit, preserveDate, this._minDate, this._maxDate);
      const newValue = this.formatValue(modifiedDate.toUTCJSDate());
      this._updateValueAndFireEvents(newValue, true, ["change", "value-changed"]);
    }
    _updateValueAndFireEvents(value, normalizeValue, events, updateValue = true) {
      const valid = this._checkValueValidity(value);
      if (valid && normalizeValue) {
        value = this.normalizeValue(value); // transform valid values (in any format) to the correct format
      }

      let executeEvent = true;
      this.liveValue = value;
      const previousValue = this.value;
      if (updateValue) {
        this._getInput().value = value;
        this.value = value;
        this._updateValueState(); // Change the value state to Error/None, but only if needed
      }

      events.forEach(e => {
        if (!this.fireEvent(e, {
          value,
          valid
        }, true)) {
          executeEvent = false;
        }
      });
      if (!executeEvent && updateValue) {
        if (this.value !== previousValue && this.value !== this._getInput().value) {
          return; // If the value was changed in the change event, do not revert it
        }

        this._getInput().value = previousValue;
        this.value = previousValue;
      }
    }
    _updateValueState() {
      const isValid = this._checkValueValidity(this.value);
      if (isValid && this.valueState === _ValueState.default.Error) {
        // If not valid - always set Error regardless of the current value state
        this.valueState = _ValueState.default.None;
      } else if (!isValid) {
        // However if valid, change only Error (but not the others) to None
        this.valueState = _ValueState.default.Error;
      }
    }
    _toggleAndFocusInput() {
      this.togglePicker();
      this._getInput().focus();
    }
    _getInput() {
      return this.shadowRoot.querySelector("[ui5-input]");
    }
    /**
     * The ui5-input "submit" event handler - fire change event when the user presses enter
     * @protected
     */
    _onInputSubmit() {}
    /**
     * The ui5-input "change" event handler - fire change event when the user focuses out of the input
     * @protected
     */
    _onInputChange(e) {
      this._updateValueAndFireEvents(e.target.value, true, ["change", "value-changed"]);
    }
    /**
     * The ui5-input "input" event handler - fire input even when the user types
     * @protected
     */
    _onInputInput(e) {
      this._updateValueAndFireEvents(e.target.value, false, ["input"], false);
    }
    /**
     * Checks if the provided value is valid and within valid range.
     * @protected
     * @param { string } value
     * @returns { boolean }
     */
    _checkValueValidity(value) {
      if (value === "") {
        return true;
      }
      return this.isValid(value) && this.isInValidRange(value);
    }
    _click(e) {
      if ((0, _Device.isPhone)()) {
        this.responsivePopover.showAt(this);
        e.preventDefault(); // prevent immediate selection of any item
      }
    }
    /**
     * Checks if a value is valid against the current date format of the DatePicker.
     * @public
     * @method
     * @name sap.ui.webc.main.DatePicker#isValid
     * @param { string } [value=""] A value to be tested against the current date format
     * @returns { boolean }
     */
    isValid(value = "") {
      if (value === "") {
        return true;
      }
      return !!this.getFormat().parse(value);
    }
    /**
     * Checks if a date is between the minimum and maximum date.
     * @public
     * @method
     * @name sap.ui.webc.main.DatePicker#isInValidRange
     * @param { string } [value=""] A value to be checked
     * @returns { boolean }
     */
    isInValidRange(value = "") {
      if (value === "") {
        return true;
      }
      const calendarDate = this._getCalendarDateFromString(value);
      if (!calendarDate || !this._minDate || !this._maxDate) {
        return false;
      }
      return calendarDate.valueOf() >= this._minDate.valueOf() && calendarDate.valueOf() <= this._maxDate.valueOf();
    }
    /**
     * The parser understands many formats, but we need one format
     * @protected
     */
    normalizeValue(value) {
      if (value === "") {
        return value;
      }
      return this.getFormat().format(this.getFormat().parse(value, true), true); // it is important to both parse and format the date as UTC
    }

    get _displayFormat() {
      // @ts-ignore oFormatOptions is a private API of DateFormat
      return this.getFormat().oFormatOptions.pattern;
    }
    /**
     * @protected
     */
    get _placeholder() {
      return this.placeholder !== undefined ? this.placeholder : this._displayFormat;
    }
    get _headerTitleText() {
      return DatePicker_1.i18nBundle.getText(_i18nDefaults.INPUT_SUGGESTIONS_TITLE);
    }
    get phone() {
      return (0, _Device.isPhone)();
    }
    get showHeader() {
      return this.phone;
    }
    get showFooter() {
      return this.phone;
    }
    get accInfo() {
      return {
        "ariaRoledescription": this.dateAriaDescription,
        "ariaHasPopup": _HasPopup.default.Grid,
        "ariaAutoComplete": "none",
        "ariaRequired": this.required,
        "ariaLabel": (0, _AriaLabelHelper.getEffectiveAriaLabelText)(this)
      };
    }
    get openIconTitle() {
      return DatePicker_1.i18nBundle.getText(_i18nDefaults.DATEPICKER_OPEN_ICON_TITLE);
    }
    get openIconName() {
      return "appointment-2";
    }
    get dateAriaDescription() {
      return DatePicker_1.i18nBundle.getText(_i18nDefaults.DATEPICKER_DATE_DESCRIPTION);
    }
    /**
     * Defines whether the dialog on mobile should have header
     * @private
     */
    get _shouldHideHeader() {
      return false;
    }
    /**
     * Defines whether the value help icon is hidden
     * @private
     */
    get _ariaHidden() {
      return (0, _Device.isDesktop)();
    }
    async _respPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector("[ui5-responsive-popover]");
    }
    _canOpenPicker() {
      return !this.disabled && !this.readonly;
    }
    get _calendarPickersMode() {
      const format = this.getFormat();
      const patternSymbolTypes = format.aFormatArray.map(patternSymbolSettings => {
        return patternSymbolSettings.type.toLowerCase();
      });
      if (patternSymbolTypes.includes("day")) {
        return _CalendarPickersMode.default.DAY_MONTH_YEAR;
      }
      if (patternSymbolTypes.includes("month") || patternSymbolTypes.includes("monthstandalone")) {
        return _CalendarPickersMode.default.MONTH_YEAR;
      }
      return _CalendarPickersMode.default.YEAR;
    }
    /**
     * The user selected a new date in the calendar
     * @param event
     * @protected
     */
    onSelectedDatesChange(e) {
      e.preventDefault();
      const newValue = e.detail.values && e.detail.values[0];
      this._updateValueAndFireEvents(newValue, true, ["change", "value-changed"]);
      this.closePicker();
    }
    /**
     * The user clicked the "month" button in the header
     */
    onHeaderShowMonthPress() {
      this._calendarCurrentPicker = "month";
    }
    /**
     * The user clicked the "year" button in the header
     */
    onHeaderShowYearPress() {
      this._calendarCurrentPicker = "year";
    }
    /**
     * Formats a Java Script date object into a string representing a locale date
     * according to the <code>formatPattern</code> property of the DatePicker instance
     * @public
     * @method
     * @name sap.ui.webc.main.DatePicker#formatValue
     * @param {Date} date A Java Script date object to be formatted as string
     * @returns {string} The date as string
     */
    formatValue(date) {
      return this.getFormat().format(date);
    }
    /**
     * Closes the picker.
     * @public
     * @method
     * @name sap.ui.webc.main.DatePicker#closePicker
     */
    closePicker() {
      this.responsivePopover.close();
    }
    /**
     * Opens the picker.
     * @public
     * @async
     * @method
     * @name sap.ui.webc.main.DatePicker#openPicker
     * @returns {Promise} Resolves when the picker is open
     */
    async openPicker() {
      this._isPickerOpen = true;
      this._calendarCurrentPicker = "day";
      this.responsivePopover = await this._respPopover();
      this.responsivePopover.showAt(this);
    }
    togglePicker() {
      if (this.isOpen()) {
        this.closePicker();
      } else if (this._canOpenPicker()) {
        this.openPicker();
      }
    }
    /**
     * Checks if the picker is open.
     * @public
     * @method
     * @name sap.ui.webc.main.DatePicker#isOpen
     * @returns {boolean} true if the picker is open, false otherwise
     */
    isOpen() {
      return !!this._isPickerOpen;
    }
    /**
     * Currently selected date represented as a Local JavaScript Date instance.
     *
     * @public
     * @readonly
     * @name sap.ui.webc.main.DatePicker.prototype.dateValue
     * @type { Date }
     */
    get dateValue() {
      return this.liveValue ? this.getFormat().parse(this.liveValue) : this.getFormat().parse(this.value);
    }
    get dateValueUTC() {
      return this.liveValue ? this.getFormat().parse(this.liveValue, true) : this.getFormat().parse(this.value);
    }
    get styles() {
      return {
        main: {
          width: "100%"
        }
      };
    }
    get type() {
      return _InputType.default.Text;
    }
  };
  __decorate([(0, _property.default)()], DatePicker.prototype, "value", void 0);
  __decorate([(0, _property.default)({
    type: _ValueState.default,
    defaultValue: _ValueState.default.None
  })], DatePicker.prototype, "valueState", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], DatePicker.prototype, "required", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], DatePicker.prototype, "disabled", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], DatePicker.prototype, "readonly", void 0);
  __decorate([(0, _property.default)({
    defaultValue: undefined
  })], DatePicker.prototype, "placeholder", void 0);
  __decorate([(0, _property.default)()], DatePicker.prototype, "name", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], DatePicker.prototype, "hideWeekNumbers", void 0);
  __decorate([(0, _property.default)()], DatePicker.prototype, "accessibleName", void 0);
  __decorate([(0, _property.default)({
    defaultValue: ""
  })], DatePicker.prototype, "accessibleNameRef", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], DatePicker.prototype, "_isPickerOpen", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], DatePicker.prototype, "_respPopoverConfig", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "day"
  })], DatePicker.prototype, "_calendarCurrentPicker", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement
  })], DatePicker.prototype, "valueStateMessage", void 0);
  __decorate([(0, _slot.default)({
    type: HTMLElement
  })], DatePicker.prototype, "formSupport", void 0);
  DatePicker = DatePicker_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-date-picker",
    languageAware: true,
    template: _DatePickerTemplate.default,
    staticAreaTemplate: _DatePickerPopoverTemplate.default,
    styles: _DatePicker.default,
    staticAreaStyles: [_ResponsivePopoverCommon.default, _DatePickerPopover.default],
    dependencies: [_Icon.default, _ResponsivePopover.default, _Calendar.default, _CalendarDate2.default, _Input.default, _Button.default]
  })
  /**
   * Fired when the input operation has finished by pressing Enter or on focusout.
   *
   * @event sap.ui.webc.main.DatePicker#change
   * @allowPreventDefault
   * @public
   * @param {string} value The submitted value.
   * @param {boolean} valid Indicator if the value is in correct format pattern and in valid range.
  */, (0, _event.default)("change", {
    detail: {
      value: {
        type: String
      },
      valid: {
        type: Boolean
      }
    }
  })
  /**
   * Fired when the value of the component is changed at each key stroke.
   *
   * @event sap.ui.webc.main.DatePicker#input
   * @allowPreventDefault
   * @public
   * @param {string} value The submitted value.
   * @param {boolean} valid Indicator if the value is in correct format pattern and in valid range.
  */, (0, _event.default)("input", {
    detail: {
      value: {
        type: String
      },
      valid: {
        type: Boolean
      }
    }
  })], DatePicker);
  DatePicker.define();
  var _default = DatePicker;
  _exports.default = _default;
});