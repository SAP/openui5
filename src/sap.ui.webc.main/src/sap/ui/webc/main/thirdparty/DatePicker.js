sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/FeaturesRegistry", "sap/ui/webc/common/thirdparty/localization/dates/CalendarDate", "sap/ui/webc/common/thirdparty/localization/dates/modifyDateBy", "sap/ui/webc/common/thirdparty/localization/dates/getRoundedTimestamp", "sap/ui/webc/common/thirdparty/localization/dates/getTodayUTCTimestamp", "sap/ui/webc/common/thirdparty/base/types/ValueState", "sap/ui/webc/common/thirdparty/base/util/AriaLabelHelper", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/Device", "sap/ui/webc/common/thirdparty/icons/appointment-2", "sap/ui/webc/common/thirdparty/icons/decline", "./types/HasPopup", "./generated/i18n/i18n-defaults", "./DateComponentBase", "./Icon", "./Button", "./ResponsivePopover", "./Calendar", "./CalendarDate", "./Input", "./types/InputType", "./generated/templates/DatePickerTemplate.lit", "./generated/templates/DatePickerPopoverTemplate.lit", "sap/ui/webc/common/thirdparty/localization/features/calendar/Gregorian", "./generated/themes/DatePicker.css", "./generated/themes/DatePickerPopover.css", "./generated/themes/ResponsivePopoverCommon.css"], function (_exports, _FeaturesRegistry, _CalendarDate, _modifyDateBy, _getRoundedTimestamp, _getTodayUTCTimestamp, _ValueState, _AriaLabelHelper, _Keys, _Device, _appointment, _decline, _HasPopup, _i18nDefaults, _DateComponentBase, _Icon, _Button, _ResponsivePopover, _Calendar, CalendarDateComponent, _Input, _InputType, _DatePickerTemplate, _DatePickerPopoverTemplate, _Gregorian, _DatePicker, _DatePickerPopover, _ResponsivePopoverCommon) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  _modifyDateBy = _interopRequireDefault(_modifyDateBy);
  _getRoundedTimestamp = _interopRequireDefault(_getRoundedTimestamp);
  _getTodayUTCTimestamp = _interopRequireDefault(_getTodayUTCTimestamp);
  _ValueState = _interopRequireDefault(_ValueState);
  _HasPopup = _interopRequireDefault(_HasPopup);
  _DateComponentBase = _interopRequireDefault(_DateComponentBase);
  _Icon = _interopRequireDefault(_Icon);
  _Button = _interopRequireDefault(_Button);
  _ResponsivePopover = _interopRequireDefault(_ResponsivePopover);
  _Calendar = _interopRequireDefault(_Calendar);
  CalendarDateComponent = _interopRequireWildcard(CalendarDateComponent);
  _Input = _interopRequireDefault(_Input);
  _InputType = _interopRequireDefault(_InputType);
  _DatePickerTemplate = _interopRequireDefault(_DatePickerTemplate);
  _DatePickerPopoverTemplate = _interopRequireDefault(_DatePickerPopoverTemplate);
  _DatePicker = _interopRequireDefault(_DatePicker);
  _DatePickerPopover = _interopRequireDefault(_DatePickerPopover);
  _ResponsivePopoverCommon = _interopRequireDefault(_ResponsivePopoverCommon);

  function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

  function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  // default calendar for bundling
  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-date-picker",
    altTag: "ui5-datepicker",
    managedSlots: true,
    properties:
    /** @lends sap.ui.webcomponents.main.DatePicker.prototype */
    {
      /**
       * Defines a formatted date value.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      value: {
        type: String
      },

      /**
       * Defines the value state of the component.
       * <br><br>
       * Available options are:
       * <ul>
       * <li><code>None</code></li>
       * <li><code>Error</code></li>
       * <li><code>Warning</code></li>
       * <li><code>Success</code></li>
       * <li><code>Information</code></li>
       * </ul>
       *
       * @type {ValueState}
       * @defaultvalue "None"
       * @public
       */
      valueState: {
        type: _ValueState.default,
        defaultValue: _ValueState.default.None
      },

      /**
       * Defines whether the component is required.
       *
       * @since 1.0.0-rc.9
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      required: {
        type: Boolean
      },

      /**
       * Determines whether the component is displayed as disabled.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      disabled: {
        type: Boolean
      },

      /**
       * Determines whether the component is displayed as read-only.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       */
      readonly: {
        type: Boolean
      },

      /**
       * Defines a short hint, intended to aid the user with data entry when the
       * component has no value.
       *
       * <br><br>
       * <b>Note:</b> When no placeholder is set, the format pattern is displayed as a placeholder.
       * Passing an empty string as the value of this property will make the component appear empty - without placeholder or format pattern.
       *
       * @type {string}
       * @defaultvalue undefined
       * @public
       */
      placeholder: {
        type: String,
        defaultValue: undefined
      },

      /**
       * Determines the name with which the component will be submitted in an HTML form.
       *
       * <br><br>
       * <b>Important:</b> For the <code>name</code> property to have effect, you must add the following import to your project:
       * <code>import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";</code>
       *
       * <br><br>
       * <b>Note:</b> When set, a native <code>input</code> HTML element
       * will be created inside the component so that it can be submitted as
       * part of an HTML form. Do not use this property unless you need to submit a form.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       */
      name: {
        type: String
      },

      /**
       * Defines the visibility of the week numbers column.
       * <br><br>
       *
       * <b>Note:</b> For calendars other than Gregorian,
       * the week numbers are not displayed regardless of what is set.
       *
       * @type {boolean}
       * @defaultvalue false
       * @public
       * @since 1.0.0-rc.8
       */
      hideWeekNumbers: {
        type: Boolean
      },

      /**
       * Defines the aria-label attribute for the component.
       *
       * @type {string}
       * @public
       * @since 1.0.0-rc.15
       */
      accessibleName: {
        type: String
      },

      /**
       * Receives id(or many ids) of the elements that label the component.
       *
       * @type {string}
       * @defaultvalue ""
       * @public
       * @since 1.0.0-rc.15
       */
      accessibleNameRef: {
        type: String,
        defaultValue: ""
      },
      _isPickerOpen: {
        type: Boolean,
        noAttribute: true
      },
      _respPopoverConfig: {
        type: Object
      },
      _calendarCurrentPicker: {
        type: String,
        defaultValue: "day"
      }
    },
    slots:
    /** @lends sap.ui.webcomponents.main.DatePicker.prototype */
    {
      /**
       * Defines the value state message that will be displayed as pop up under the component.
       * <br><br>
       *
       * <b>Note:</b> If not specified, a default text (in the respective language) will be displayed.
       * <br>
       * <b>Note:</b> The <code>valueStateMessage</code> would be displayed,
       * when the component is in <code>Information</code>, <code>Warning</code> or <code>Error</code> value state.
       * @type {HTMLElement}
       * @since 1.0.0-rc.7
       * @slot
       * @public
       */
      valueStateMessage: {
        type: HTMLElement
      },

      /**
       * The slot is used to render native <code>input</code> HTML element within Light DOM to enable form submit,
       * when <code>name</code> property is set.
       * @type {HTMLElement[]}
       * @slot
       * @private
       */
      formSupport: {
        type: HTMLElement
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.DatePicker.prototype */
    {
      /**
       * Fired when the input operation has finished by pressing Enter or on focusout.
       *
       * @event
       * @allowPreventDefault
       * @public
       * @param {string} value The submitted value.
       * @param {boolean} valid Indicator if the value is in correct format pattern and in valid range.
      */
      change: {
        detail: {
          value: {
            type: String
          },
          valid: {
            type: Boolean
          }
        }
      },

      /**
       * Fired when the value of the component is changed at each key stroke.
       *
       * @event
       * @allowPreventDefault
       * @public
       * @param {string} value The submitted value.
       * @param {boolean} valid Indicator if the value is in correct format pattern and in valid range.
      */
      input: {
        detail: {
          value: {
            type: String
          },
          valid: {
            type: Boolean
          }
        }
      }
    }
  };
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
   * For more information, see <ui5-link target="_blank" href="http://unicode.org/reports/tr35/#Date_Field_Symbol_Table" class="api-table-content-cell-link">UTS #35: Unicode Locale Data Markup Language</ui5-link>.
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
   * @alias sap.ui.webcomponents.main.DatePicker
   * @extends DateComponentBase
   * @tagname ui5-date-picker
   * @public
   */

  class DatePicker extends _DateComponentBase.default {
    static get metadata() {
      return metadata;
    }

    static get template() {
      return _DatePickerTemplate.default;
    }

    static get staticAreaTemplate() {
      return _DatePickerPopoverTemplate.default;
    }

    static get styles() {
      return _DatePicker.default;
    }

    static get staticAreaStyles() {
      return [_ResponsivePopoverCommon.default, _DatePickerPopover.default];
    }

    constructor() {
      super();
      this.FormSupport = undefined;
    }
    /**
     * @protected
     */


    onResponsivePopoverAfterClose() {
      this._isPickerOpen = false;

      if ((0, _Device.isPhone)()) {
        this.blur(); // close device's keyboard and prevent further typing
      } else {
        this._getInput().focus();
      }
    }

    onBeforeRendering() {
      this.FormSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");
      ["minDate", "maxDate"].forEach(prop => {
        if (this[prop] && !this.isValid(this[prop])) {
          console.warn(`Invalid value for property "${prop}": ${this[prop]} is not compatible with the configured format pattern: "${this._displayFormat}"`); // eslint-disable-line
        }
      });
      const FormSupport = (0, _FeaturesRegistry.getFeature)("FormSupport");

      if (FormSupport) {
        FormSupport.syncNativeHiddenInput(this);
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
     */


    get _calendarTimestamp() {
      if (this.value && this._checkValueValidity(this.value)) {
        const millisecondsUTC = this.dateValueUTC.getTime();
        return (0, _getRoundedTimestamp.default)(millisecondsUTC);
      }

      return (0, _getTodayUTCTimestamp.default)(this._primaryCalendarType);
    }
    /**
     * Used to provide selectedDates to the calendar based on the component's state
     * Override in derivatives to provide different rules for setting the calendar's selected dates
     * @protected
     */


    get _calendarSelectedDates() {
      if (this.value && this._checkValueValidity(this.value)) {
        return [this.value];
      }

      return [];
    }

    _onkeydown(event) {
      if ((0, _Keys.isShow)(event)) {
        event.preventDefault(); // Prevent scroll on Alt/Option + Arrow Up/Down

        if (this.isOpen()) {
          if (!(0, _Keys.isF4)(event)) {
            this._toggleAndFocusInput();
          }
        } else {
          this._toggleAndFocusInput();
        }
      }

      if (this.isOpen()) {
        return;
      }

      if ((0, _Keys.isEnter)(event)) {
        if (this.FormSupport) {
          this.FormSupport.triggerFormSubmit(this);
        }
      } else if ((0, _Keys.isPageUpShiftCtrl)(event)) {
        event.preventDefault();

        this._modifyDateValue(1, "year");
      } else if ((0, _Keys.isPageUpShift)(event)) {
        event.preventDefault();

        this._modifyDateValue(1, "month");
      } else if ((0, _Keys.isPageUp)(event)) {
        event.preventDefault();

        this._modifyDateValue(1, "day");
      } else if ((0, _Keys.isPageDownShiftCtrl)(event)) {
        event.preventDefault();

        this._modifyDateValue(-1, "year");
      } else if ((0, _Keys.isPageDownShift)(event)) {
        event.preventDefault();

        this._modifyDateValue(-1, "month");
      } else if ((0, _Keys.isPageDown)(event)) {
        event.preventDefault();

        this._modifyDateValue(-1, "day");
      }
    }
    /**
     *
     * @param amount
     * @param unit
     * @protected
     */


    _modifyDateValue(amount, unit) {
      if (!this.dateValue) {
        return;
      }

      const modifiedDate = (0, _modifyDateBy.default)(_CalendarDate.default.fromLocalJSDate(this.dateValue), amount, unit, this._minDate, this._maxDate);
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
      events.forEach(event => {
        if (!this.fireEvent(event, {
          value,
          valid
        }, true)) {
          executeEvent = false;
        }
      });

      if (!executeEvent) {
        return;
      }

      if (updateValue) {
        this._getInput().getInputDOMRef().then(innnerInput => {
          innnerInput.value = value;
        });

        this.value = value;

        this._updateValueState(); // Change the value state to Error/None, but only if needed

      }
    }

    _updateValueState() {
      const isValid = this._checkValueValidity(this.value);

      if (!isValid) {
        // If not valid - always set Error regardless of the current value state
        this.valueState = _ValueState.default.Error;
      } else if (isValid && this.valueState === _ValueState.default.Error) {
        // However if valid, change only Error (but not the others) to None
        this.valueState = _ValueState.default.None;
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


    _onInputSubmit(event) {}
    /**
     * The ui5-input "change" event handler - fire change event when the user focuses out of the input
     * @protected
     */


    _onInputChange(event) {
      this._updateValueAndFireEvents(event.target.value, true, ["change", "value-changed"]);
    }
    /**
     * The ui5-input "input" event handler - fire input even when the user types
     * @protected
     */


    async _onInputInput(event) {
      this._updateValueAndFireEvents(event.target.value, false, ["input"], false);
    }
    /**
     * @protected
     */


    _checkValueValidity(value) {
      if (value === "") {
        return true;
      }

      return this.isValid(value) && this.isInValidRange(value);
    }

    _click(event) {
      if ((0, _Device.isPhone)()) {
        this.responsivePopover.showAt(this);
        event.preventDefault(); // prevent immediate selection of any item
      }
    }
    /**
     * Checks if a value is valid against the current date format of the DatePicker.
     * @param {string} value A value to be tested against the current date format
     * @returns {boolean}
     * @public
     */


    isValid(value = "") {
      if (value === "") {
        return true;
      }

      return !!this.getFormat().parse(value);
    }
    /**
     * Checks if a date is between the minimum and maximum date.
     * @param {string} value A value to be checked
     * @returns {boolean}
     * @public
     */


    isInValidRange(value = "") {
      if (value === "") {
        return true;
      }

      const calendarDate = this._getCalendarDateFromString(value);

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
      return this.getFormat().oFormatOptions.pattern;
    }
    /**
     * @protected
     */


    get _placeholder() {
      return this.placeholder !== undefined ? this.placeholder : this._displayFormat;
    }

    get _headerTitleText() {
      return DatePicker.i18nBundle.getText(_i18nDefaults.INPUT_SUGGESTIONS_TITLE);
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
      return DatePicker.i18nBundle.getText(_i18nDefaults.DATEPICKER_OPEN_ICON_TITLE);
    }

    get openIconName() {
      return "appointment-2";
    }

    get dateAriaDescription() {
      return DatePicker.i18nBundle.getText(_i18nDefaults.DATEPICKER_DATE_DESCRIPTION);
    }
    /**
     * Defines whether the dialog on mobile should have header
     * @private
     */


    get _shouldHideHeader() {
      return false;
    }

    async _respPopover() {
      const staticAreaItem = await this.getStaticAreaItemDomRef();
      return staticAreaItem.querySelector("[ui5-responsive-popover]");
    }

    _canOpenPicker() {
      return !this.disabled && !this.readonly;
    }
    /**
     * The user selected a new date in the calendar
     * @param event
     * @protected
     */


    onSelectedDatesChange(event) {
      event.preventDefault();
      const newValue = event.detail.values && event.detail.values[0];

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
     * @param {object} date A Java Script date object to be formatted as string
     * @returns {string} The date as string
     * @public
     */


    formatValue(date) {
      return this.getFormat().format(date);
    }
    /**
     * Closes the picker.
     * @public
     */


    closePicker() {
      this.responsivePopover.close();
    }
    /**
     * Opens the picker.
     * @public
     * @async
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
     * @returns {boolean} true if the picker is open, false otherwise
     * @public
     */


    isOpen() {
      return !!this._isPickerOpen;
    }
    /**
     * Currently selected date represented as a Local JavaScript Date instance.
     *
     * @readonly
     * @type { Date }
     * @public
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

    static get dependencies() {
      return [_Icon.default, _ResponsivePopover.default, _Calendar.default, CalendarDateComponent.default, _Input.default, _Button.default];
    }

  }

  DatePicker.define();
  var _default = DatePicker;
  _exports.default = _default;
});