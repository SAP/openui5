sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/delegate/ResizeHandler", "sap/ui/webc/common/thirdparty/base/locale/getLocale", "sap/ui/webc/common/thirdparty/localization/getCachedLocaleDataInstance", "sap/ui/webc/common/thirdparty/localization/dates/modifyDateBy", "sap/ui/webc/common/thirdparty/localization/dates/CalendarDate", "sap/ui/webc/common/thirdparty/icons/date-time", "./Button", "./ToggleButton", "./SegmentedButton", "./Calendar", "./DatePicker", "./TimeSelection", "./generated/i18n/i18n-defaults", "./generated/templates/DateTimePickerPopoverTemplate.lit", "./generated/themes/DateTimePicker.css", "./generated/themes/DateTimePickerPopover.css", "./types/CalendarPickersMode"], function (_exports, _property, _customElement, _ResizeHandler, _getLocale, _getCachedLocaleDataInstance, _modifyDateBy, _CalendarDate, _dateTime, _Button, _ToggleButton, _SegmentedButton, _Calendar, _DatePicker, _TimeSelection, _i18nDefaults, _DateTimePickerPopoverTemplate, _DateTimePicker, _DateTimePickerPopover, _CalendarPickersMode) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _property = _interopRequireDefault(_property);
  _customElement = _interopRequireDefault(_customElement);
  _ResizeHandler = _interopRequireDefault(_ResizeHandler);
  _getLocale = _interopRequireDefault(_getLocale);
  _getCachedLocaleDataInstance = _interopRequireDefault(_getCachedLocaleDataInstance);
  _modifyDateBy = _interopRequireDefault(_modifyDateBy);
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  _Button = _interopRequireDefault(_Button);
  _ToggleButton = _interopRequireDefault(_ToggleButton);
  _SegmentedButton = _interopRequireDefault(_SegmentedButton);
  _Calendar = _interopRequireDefault(_Calendar);
  _DatePicker = _interopRequireDefault(_DatePicker);
  _TimeSelection = _interopRequireDefault(_TimeSelection);
  _DateTimePickerPopoverTemplate = _interopRequireDefault(_DateTimePickerPopoverTemplate);
  _DateTimePicker = _interopRequireDefault(_DateTimePicker);
  _DateTimePickerPopover = _interopRequireDefault(_DateTimePickerPopover);
  _CalendarPickersMode = _interopRequireDefault(_CalendarPickersMode);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var DateTimePicker_1;

  // i18n texts

  // Template

  // Styles

  const PHONE_MODE_BREAKPOINT = 640; // px
  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   * The <code>DateTimePicker</code> component alows users to select both date (day, month and year) and time (hours, minutes and seconds)
   * and for the purpose it consists of input field and Date/Time picker.
   *
   * <h3>Usage</h3>
   *
   * Use the <code>DateTimePicker</code> if you need a combined date and time input component.
   * Don't use it if you want to use either date, or time value.
   * In this case, use the <code>DatePicker</code> or the <code>TimePicker</code> components instead.
   * <br><br>
   * The user can set date/time by:
   * <ul>
   * <li>using the calendar and the time selectors</li>
   * <li>typing in the input field</li>
   * </ul>
   *
   * Programmatically, to set date/time for the <code>DateTimePicker</code>, use the <code>value</code> property
   *
   * <h3>Formatting</h3>
   *
   * The value entered by typing into the input field must fit to the used date/time format.
   * <br><br>
   * Supported format options are pattern-based on Unicode LDML Date Format notation.
   * For more information, see <ui5-link target="_blank" href="https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table">UTS #35: Unicode Locale Data Markup Language</ui5-link>.
   * <br><br>
   * <b>Example:</b> the following format <code>dd/MM/yyyy, hh:mm:ss aa</code>
   * corresponds the <code>13/04/2020, 03:16:16 AM</code> value.
   * <br>
   * The small 'h' defines "12" hours format and the "aa" symbols - "AM/PM" time periods.
   *
   * <br><br>
   * <b>Example:</b> the following format <code>dd/MM/yyyy, HH:mm:ss</code>
   * corresponds the <code>13/04/2020, 15:16:16</code> value.
   * <br>
   * The capital 'H' indicates "24" hours format.
   *
   * <br><br>
   * <b>Note:</b> If the <code>formatPattern</code> does NOT include time,
   * the <code>DateTimePicker</code> will fallback to the default time format according to the locale.
   *
   * <br><br>
   * <b>Note:</b> If no placeholder is set to the <code>DateTimePicker</code>,
   * the current <code>formatPattern</code> is displayed as a placeholder.
   * If another placeholder is needed, it must be set or in case no placeholder is needed - it can be set to an empty string.
   *
   * <br><br>
   * <b>Note:</b> If the user input does NOT match the <code>formatPattern</code>,
   * the <code>DateTimePicker</code> makes an attempt to parse it based on the
   * locale settings.
   *
   * <h3>Responsive behavior</h3>
   *
   * The <code>DateTimePicker</code> is responsive and fully adapts to all devices.
   * For larger screens, such as tablet or desktop, it is displayed as a popover, while
   * on phone devices, it is displayed full screen.
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/DateTimePicker.js";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.DateTimePicker
   * @extends sap.ui.webc.main.DatePicker
   * @tagname ui5-datetime-picker
   * @since 1.0.0-rc.7
   * @public
   */
  let DateTimePicker = DateTimePicker_1 = class DateTimePicker extends _DatePicker.default {
    constructor() {
      super();
      this._handleResizeBound = this._handleResize.bind(this);
    }
    /**
     * @override
     */
    onResponsivePopoverAfterClose() {
      super.onResponsivePopoverAfterClose();
      this._showTimeView = false;
      this._previewValues = {};
    }
    /**
     * LIFECYCLE METHODS
     */
    onEnterDOM() {
      _ResizeHandler.default.register(document.body, this._handleResizeBound);
    }
    onExitDOM() {
      _ResizeHandler.default.deregister(document.body, this._handleResizeBound);
    }
    /**
     * PUBLIC METHODS
     */
    /**
     * Opens the picker.
     * @public
     */
    async openPicker() {
      await super.openPicker();
      this._currentTimeSlider = "hours";
      this._previewValues.timeSelectionValue = this.value || this.getFormat().format(new Date());
    }
    /**
     * Read-only getters
     */
    get classes() {
      return {
        picker: {
          "ui5-dt-picker-content--phone": this.phone
        },
        dateTimeView: {
          "ui5-dt-cal--hidden": this.phone && this.showTimeView,
          "ui5-dt-time--hidden": this.phone && this.showDateView
        },
        footer: {
          "ui5-dt-picker-footer-time-hidden": this.phone && this.showTimeView || this.phone && this.showDateView
        }
      };
    }
    get _formatPattern() {
      const hasHours = !!this.formatPattern.match(/H/i);
      const fallback = !this.formatPattern || !hasHours;
      const localeData = (0, _getCachedLocaleDataInstance.default)((0, _getLocale.default)());
      return fallback ? localeData.getCombinedDateTimePattern("medium", "medium", this._primaryCalendarType) : this.formatPattern;
    }
    get _calendarTimestamp() {
      return this._previewValues.calendarTimestamp ? this._previewValues.calendarTimestamp : super._calendarTimestamp;
    }
    get _calendarSelectedDates() {
      return this._previewValues.calendarValue ? [this._previewValues.calendarValue] : super._calendarSelectedDates;
    }
    get _timeSelectionValue() {
      return this._previewValues.timeSelectionValue ? this._previewValues.timeSelectionValue : this.value;
    }
    get openIconName() {
      return "date-time";
    }
    get btnOKLabel() {
      return DateTimePicker_1.i18nBundle.getText(_i18nDefaults.TIMEPICKER_SUBMIT_BUTTON);
    }
    get btnCancelLabel() {
      return DateTimePicker_1.i18nBundle.getText(_i18nDefaults.TIMEPICKER_CANCEL_BUTTON);
    }
    get btnDateLabel() {
      return DateTimePicker_1.i18nBundle.getText(_i18nDefaults.DATETIME_PICKER_DATE_BUTTON);
    }
    get btnTimeLabel() {
      return DateTimePicker_1.i18nBundle.getText(_i18nDefaults.DATETIME_PICKER_TIME_BUTTON);
    }
    get showFooter() {
      return true;
    }
    get showDateView() {
      return this.phone ? !this._showTimeView : true;
    }
    get showTimeView() {
      return this.phone ? this._showTimeView : true;
    }
    get phone() {
      return super.phone || this._phoneMode;
    }
    get dateAriaDescription() {
      return DateTimePicker_1.i18nBundle.getText(_i18nDefaults.DATETIME_DESCRIPTION);
    }
    /**
     * Defines whether the dialog on mobile should have header
     * @private
     */
    get _shouldHideHeader() {
      return true;
    }
    /**
     * EVENT HANDLERS
     */
    /**
     * @override
     */
    onSelectedDatesChange(e) {
      e.preventDefault();
      // @ts-ignore Needed for FF
      const dateTimePickerContent = e.path ? e.path[1] : e.composedPath()[1];
      this._previewValues = {
        ...this._previewValues,
        calendarTimestamp: e.detail.timestamp,
        calendarValue: e.detail.values[0],
        timeSelectionValue: dateTimePickerContent.lastChild.value
      };
    }
    onTimeSelectionChange(e) {
      this._previewValues = {
        ...this._previewValues,
        timeSelectionValue: e.detail.value
      };
    }
    onTimeSliderChange(e) {
      this._currentTimeSlider = e.detail.slider;
    }
    /**
     * Handles document resize to switch between <code>phoneMode</code> and normal appearance.
     */
    _handleResize() {
      const documentWidth = document.body.offsetWidth;
      const toPhoneMode = documentWidth <= PHONE_MODE_BREAKPOINT;
      const modeChange = toPhoneMode && !this._phoneMode || !toPhoneMode && this._phoneMode; // XOR not allowed by lint
      if (modeChange) {
        this._phoneMode = toPhoneMode;
      }
    }
    get _submitDisabled() {
      return !this._calendarSelectedDates || !this._calendarSelectedDates.length;
    }
    /**
     * Handles clicking on the <code>submit</code> button, within the picker`s footer.
     */
    _submitClick() {
      const selectedDate = this.getSelectedDateTime();
      const value = this.getFormat().format(selectedDate);
      if (this.value !== value) {
        this._updateValueAndFireEvents(value, true, ["change", "value-changed"]);
      }
      this.closePicker();
    }
    /**
     * Handles clicking on the <code>cancel</code> button, within the picker`s footer,
     * that would disregard the user selection.
     */
    _cancelClick() {
      this.closePicker();
    }
    /**
     * Handles the date/time switch available in <code>phoneMode</code> to switch
     * between the date and time views.
     * @param {Event} e
     */
    _dateTimeSwitchChange(e) {
      const target = e.target;
      this._showTimeView = target.getAttribute("key") === "Time";
      if (this._showTimeView) {
        this._currentTimeSlider = "hours";
      }
    }
    /**
     * @override
     */
    _modifyDateValue(amount, unit, preserveDate) {
      if (!this.dateValue) {
        return;
      }
      const modifiedDate = (0, _modifyDateBy.default)(_CalendarDate.default.fromLocalJSDate(this.dateValue), amount, unit, preserveDate, this._minDate, this._maxDate);
      const modifiedLocalDate = modifiedDate.toLocalJSDate();
      modifiedLocalDate.setHours(this.dateValue.getHours());
      modifiedLocalDate.setMinutes(this.dateValue.getMinutes());
      modifiedLocalDate.setSeconds(this.dateValue.getSeconds());
      const newValue = this.formatValue(modifiedLocalDate);
      this._updateValueAndFireEvents(newValue, true, ["change", "value-changed"]);
    }
    async getPicker() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector("[ui5-responsive-popover]");
    }
    getSelectedDateTime() {
      const selectedDate = this.getFormat().parse(this._calendarSelectedDates[0]);
      const selectedTime = this.getFormat().parse(this._timeSelectionValue);
      if (selectedTime) {
        selectedDate.setHours(selectedTime.getHours());
        selectedDate.setMinutes(selectedTime.getMinutes());
        selectedDate.setSeconds(selectedTime.getSeconds());
      }
      return selectedDate;
    }
    /**
     * @override
     */
    get _calendarPickersMode() {
      return _CalendarPickersMode.default.DAY_MONTH_YEAR;
    }
  };
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], DateTimePicker.prototype, "_showTimeView", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], DateTimePicker.prototype, "_phoneMode", void 0);
  __decorate([(0, _property.default)({
    type: Object
  })], DateTimePicker.prototype, "_previewValues", void 0);
  __decorate([(0, _property.default)({
    defaultValue: "hours"
  })], DateTimePicker.prototype, "_currentTimeSlider", void 0);
  DateTimePicker = DateTimePicker_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-datetime-picker",
    staticAreaTemplate: _DateTimePickerPopoverTemplate.default,
    styles: [DateTimePicker_1.styles, _DateTimePicker.default],
    staticAreaStyles: [_DatePicker.default.staticAreaStyles, _DateTimePickerPopover.default],
    dependencies: [..._DatePicker.default.dependencies, _Calendar.default, _Button.default, _ToggleButton.default, _SegmentedButton.default, _TimeSelection.default]
  })], DateTimePicker);
  DateTimePicker.define();
  var _default = DateTimePicker;
  _exports.default = _default;
});