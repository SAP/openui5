sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/localization/dates/CalendarDate", "sap/ui/webc/common/thirdparty/base/Render", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/localization/getCachedLocaleDataInstance", "sap/ui/webc/common/thirdparty/base/locale/getLocale", "sap/ui/webc/common/thirdparty/localization/DateFormat", "./CalendarDate", "./CalendarPart", "./CalendarHeader", "./DayPicker", "./MonthPicker", "./YearPicker", "./types/CalendarSelectionMode", "sap/ui/webc/common/thirdparty/localization/features/calendar/Gregorian", "./generated/templates/CalendarTemplate.lit", "./generated/themes/Calendar.css"], function (_exports, _CalendarDate, _Render, _Keys, _getCachedLocaleDataInstance, _getLocale, _DateFormat, CalendarDateComponent, _CalendarPart, _CalendarHeader, _DayPicker, _MonthPicker, _YearPicker, _CalendarSelectionMode, _Gregorian, _CalendarTemplate, _Calendar) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  _getCachedLocaleDataInstance = _interopRequireDefault(_getCachedLocaleDataInstance);
  _getLocale = _interopRequireDefault(_getLocale);
  _DateFormat = _interopRequireDefault(_DateFormat);
  CalendarDateComponent = _interopRequireWildcard(CalendarDateComponent);
  _CalendarPart = _interopRequireDefault(_CalendarPart);
  _CalendarHeader = _interopRequireDefault(_CalendarHeader);
  _DayPicker = _interopRequireDefault(_DayPicker);
  _MonthPicker = _interopRequireDefault(_MonthPicker);
  _YearPicker = _interopRequireDefault(_YearPicker);
  _CalendarSelectionMode = _interopRequireDefault(_CalendarSelectionMode);
  _CalendarTemplate = _interopRequireDefault(_CalendarTemplate);
  _Calendar = _interopRequireDefault(_Calendar);
  function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
  function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  // Default calendar for bundling

  // Template

  // Styles

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-calendar",
    fastNavigation: true,
    properties: /** @lends sap.ui.webcomponents.main.Calendar.prototype */{
      /**
       * Defines the type of selection used in the calendar component.
       * Accepted property values are:<br>
       * <ul>
       * <li><code>CalendarSelectionMode.Single</code> - enables a single date selection.(default value)</li>
       * <li><code>CalendarSelectionMode.Range</code> - enables selection of a date range.</li>
       * <li><code>CalendarSelectionMode.Multiple</code> - enables selection of multiple dates.</li>
       * </ul>
       * @type {CalendarSelectionMode}
       * @defaultvalue "Single"
       * @public
       */
      selectionMode: {
        type: _CalendarSelectionMode.default,
        defaultValue: _CalendarSelectionMode.default.Single
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
       */
      hideWeekNumbers: {
        type: Boolean
      },
      /**
       * Which picker is currently visible to the user: day/month/year
       */
      _currentPicker: {
        type: String,
        defaultValue: "day"
      },
      _previousButtonDisabled: {
        type: Boolean
      },
      _nextButtonDisabled: {
        type: Boolean
      },
      _headerMonthButtonText: {
        type: String
      },
      _headerYearButtonText: {
        type: String
      }
    },
    managedSlots: true,
    slots: /** @lends sap.ui.webcomponents.main.Calendar.prototype */{
      /**
       * Defines the selected date or dates (depending on the <code>selectionMode</code> property) for this calendar as instances of <code>ui5-date</code>
       *
       * @type {sap.ui.webcomponents.main.ICalendarDate[]}
       * @slot dates
       * @public
       */
      "default": {
        propertyName: "dates",
        type: HTMLElement,
        invalidateOnChildChange: true
      }
    },
    events: /** @lends sap.ui.webcomponents.main.Calendar.prototype */{
      /**
       * Fired when the selected dates change.
       * <b>Note:</b> If you call <code>preventDefault()</code> for this event, the component will not
       * create instances of <code>ui5-date</code> for the newly selected dates. In that case you should do this manually.
       *
       * @event sap.ui.webcomponents.main.Calendar#selected-dates-change
       * @allowPreventDefault
       * @param {Array} values The selected dates
       * @param {Array} dates The selected dates as UTC timestamps
       * @public
       */
      "selected-dates-change": {
        detail: {
          dates: {
            type: Array
          },
          values: {
            type: Array
          }
        }
      },
      "show-month-press": {},
      "show-year-press": {}
    }
  };

  /**
   * @class
   *
   * <h3 class="comment-api-title">Overview</h3>
   *
   * The <code>ui5-calendar</code> component allows users to select one or more dates.
   * <br><br>
   * Currently selected dates are represented with instances of <code>ui5-date</code> as
   * children of the <code>ui5-calendar</code>. The value property of each <code>ui5-date</code> must be a
   * date string, correctly formatted according to the <code>ui5-calendar</code>'s <code>formatPattern</code> property.
   * Whenever the user changes the date selection, <code>ui5-calendar</code> will automatically create/remove instances
   * of <code>ui5-date</code> in itself, unless you prevent this behavior by calling <code>preventDefault()</code> for the
   * <code>selected-dates-change</code> event. This is useful if you want to control the selected dates externally.
   * <br><br>
   *
   * <h3>Usage</h3>
   *
   * The user can navigate to a particular date by:
   * <br>
   * <ul>
   * <li>Pressing over a month inside the months view</li>
   * <li>Pressing over an year inside the years view</li>
   * </ul>
   * <br>
   * The user can confirm a date selection by pressing over a date inside the days view.
   * <br><br>
   *
   * <h3>Keyboard Handling</h3>
   * The <code>ui5-calendar</code> provides advanced keyboard handling.
   * When a picker is showed and focused the user can use the following keyboard
   * shortcuts in order to perform a navigation:
   * <br>
   * - Day picker: <br>
   * <ul>
   * <li>[F4] - Shows month picker</li>
   * <li>[SHIFT] + [F4] - Shows year picker</li>
   * <li>[PAGEUP] - Navigate to the previous month</li>
   * <li>[PAGEDOWN] - Navigate to the next month</li>
   * <li>[SHIFT] + [PAGEUP] - Navigate to the previous year</li>
   * <li>[SHIFT] + [PAGEDOWN] - Navigate to the next year</li>
   * <li>[CTRL] + [SHIFT] + [PAGEUP] - Navigate ten years backwards</li>
   * <li>[CTRL] + [SHIFT] + [PAGEDOWN] - Navigate ten years forwards</li>
   * <li>[HOME] - Navigate to the first day of the week</li>
   * <li>[END] - Navigate to the last day of the week</li>
   * <li>[CTRL] + [HOME] - Navigate to the first day of the month</li>
   * <li>[CTRL] + [END] - Navigate to the last day of the month</li>
   * </ul>
   * <br>
   * - Month picker: <br>
   * <ul>
   * <li>[PAGEUP] - Navigate to the previous year</li>
   * <li>[PAGEDOWN] - Navigate to the next year</li>
   * <li>[HOME] - Navigate to the first month of the current row</li>
   * <li>[END] - Navigate to the last month of the current row</li>
   * <li>[CTRL] + [HOME] - Navigate to the first month of the current year</li>
   * <li>[CTRL] + [END] - Navigate to the last month of the year</li>
   * </ul>
   * <br>
   * - Year picker: <br>
   * <ul>
   * <li>[PAGEUP] - Navigate to the previous year range</li>
   * <li>[PAGEDOWN] - Navigate the next year range</li>
   * <li>[HOME] - Navigate to the first year of the current row</li>
   * <li>[END] - Navigate to the last year of the current row</li>
   * <li>[CTRL] + [HOME] - Navigate to the first year of the current year range</li>
   * <li>[CTRL] + [END] - Navigate to the last year of the current year range</li>
   * </ul>
   * <br>
   *
   * <h4>Fast Navigation</h4>
   * This component provides a build in fast navigation group which can be used via <code>F6 / Shift + F6</code> or <code> Ctrl + Alt(Option) + Down /  Ctrl + Alt(Option) + Up</code>.
   * In order to use this functionality, you need to import the following module:
   * <code>import "@ui5/webcomponents-base/dist/features/F6Navigation.js"</code>
   * <br><br>
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
   * <code>
   * &lt;script data-id="sap-ui-config" type="application/json"&gt;
   * {
   *	"calendarType": "Japanese"
   * }
   * &lt;/script&gt;
   * </code>
   *
   *
   * <h3>ES6 Module Import</h3>
   *
   * <code>import "@ui5/webcomponents/dist/Calendar";</code>
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.Calendar
   * @extends CalendarPart
   * @tagname ui5-calendar
   * @appenddocs CalendarDate
   * @public
   * @since 1.0.0-rc.11
   */
  class Calendar extends _CalendarPart.default {
    static get metadata() {
      return metadata;
    }
    static get template() {
      return _CalendarTemplate.default;
    }
    static get styles() {
      return _Calendar.default;
    }

    /**
     * @private
     */
    get _selectedDatesTimestamps() {
      return this.dates.map(date => {
        const value = date.value;
        return value && !!this.getFormat().parse(value) ? this._getTimeStampFromString(value) / 1000 : undefined;
      }).filter(date => !!date);
    }

    /**
     * @private
     */
    _setSelectedDates(selectedDates) {
      const selectedValues = selectedDates.map(timestamp => this.getFormat().format(new Date(timestamp * 1000), true)); // Format as UTC
      const valuesInDOM = [...this.dates].map(dateElement => dateElement.value);

      // Remove all elements for dates that are no longer selected
      this.dates.filter(dateElement => !selectedValues.includes(dateElement.value)).forEach(dateElement => {
        this.removeChild(dateElement);
      });

      // Create tags for the selected dates that don't already exist in DOM
      selectedValues.filter(value => !valuesInDOM.includes(value)).forEach(value => {
        const dateElement = document.createElement(CalendarDateComponent.default.getMetadata().getTag());
        dateElement.value = value;
        this.appendChild(dateElement);
      });
    }
    async onAfterRendering() {
      await (0, _Render.renderFinished)(); // Await for the current picker to render and then ask if it has previous/next pages
      this._previousButtonDisabled = !this._currentPickerDOM._hasPreviousPage();
      this._nextButtonDisabled = !this._currentPickerDOM._hasNextPage();
      const yearFormat = _DateFormat.default.getDateInstance({
        format: "y",
        calendarType: this.primaryCalendarType
      });
      const localeData = (0, _getCachedLocaleDataInstance.default)((0, _getLocale.default)());
      this._headerMonthButtonText = localeData.getMonthsStandAlone("wide", this.primaryCalendarType)[this._calendarDate.getMonth()];
      if (this._currentPicker === "year") {
        const rangeStart = new _CalendarDate.default(this._calendarDate, this._primaryCalendarType);
        const rangeEnd = new _CalendarDate.default(this._calendarDate, this._primaryCalendarType);
        rangeStart.setYear(this._currentPickerDOM._firstYear);
        rangeEnd.setYear(this._currentPickerDOM._lastYear);
        this._headerYearButtonText = `${yearFormat.format(rangeStart.toLocalJSDate(), true)} - ${yearFormat.format(rangeEnd.toLocalJSDate(), true)}`;
      } else {
        this._headerYearButtonText = String(yearFormat.format(this._localDate, true));
      }
    }

    /**
     * The user clicked the "month" button in the header
     */
    onHeaderShowMonthPress(event) {
      this._currentPickerDOM._autoFocus = false;
      this._currentPicker = "month";
      this.fireEvent("show-month-press", event);
    }

    /**
     * The user clicked the "year" button in the header
     */
    onHeaderShowYearPress(event) {
      this._currentPickerDOM._autoFocus = false;
      this._currentPicker = "year";
      this.fireEvent("show-year-press", event);
    }
    get _currentPickerDOM() {
      return this.shadowRoot.querySelector(`[ui5-${this._currentPicker}picker]`);
    }

    /**
     * The year clicked the "Previous" button in the header
     */
    onHeaderPreviousPress() {
      this._currentPickerDOM._showPreviousPage();
    }

    /**
     * The year clicked the "Next" button in the header
     */
    onHeaderNextPress() {
      this._currentPickerDOM._showNextPage();
    }
    get secondaryCalendarTypeButtonText() {
      if (!this.secondaryCalendarType) {
        return;
      }
      const localDate = new Date(this._timestamp * 1000);
      const secondYearFormat = _DateFormat.default.getDateInstance({
        format: "y",
        calendarType: this.secondaryCalendarType
      });
      const secondMonthInfo = this._getDisplayedSecondaryMonthText();
      const secondYearText = secondYearFormat.format(localDate, true);
      return {
        yearButtonText: secondYearText,
        monthButtonText: secondMonthInfo.text,
        monthButtonInfo: secondMonthInfo.info
      };
    }
    _getDisplayedSecondaryMonthText() {
      const month = this._getDisplayedSecondaryMonths();
      const localeData = (0, _getCachedLocaleDataInstance.default)((0, _getLocale.default)());
      const pattern = localeData.getIntervalPattern();
      const secondaryMonthsNames = (0, _getCachedLocaleDataInstance.default)((0, _getLocale.default)()).getMonthsStandAlone("abbreviated", this.secondaryCalendarType);
      const secondaryMonthsNamesWide = (0, _getCachedLocaleDataInstance.default)((0, _getLocale.default)()).getMonthsStandAlone("wide", this.secondaryCalendarType);
      if (month.startMonth === month.endMonth) {
        return {
          text: localeData.getMonths("abbreviated", this.secondaryCalendarType)[month.startMonth],
          textInfo: localeData.getMonths("wide", this.secondaryCalendarType)[month.startMonth]
        };
      }
      return {
        text: pattern.replace(/\{0\}/, secondaryMonthsNames[month.startMonth]).replace(/\{1\}/, secondaryMonthsNames[month.endMonth]),
        textInfo: pattern.replace(/\{0\}/, secondaryMonthsNamesWide[month.startMonth]).replace(/\{1\}/, secondaryMonthsNamesWide[month.endMonth])
      };
    }
    _getDisplayedSecondaryMonths() {
      const localDate = new Date(this._timestamp * 1000);
      let firstDate = _CalendarDate.default.fromLocalJSDate(localDate, this._primaryCalendarType);
      firstDate.setDate(1);
      firstDate = new _CalendarDate.default(firstDate, this.secondaryCalendarType);
      const startMonth = firstDate.getMonth();
      let lastDate = _CalendarDate.default.fromLocalJSDate(localDate, this._primaryCalendarType);
      lastDate.setDate(this._getDaysInMonth(lastDate));
      lastDate = new _CalendarDate.default(lastDate, this.secondaryCalendarType);
      const endMonth = lastDate.getMonth();
      return {
        startMonth,
        endMonth
      };
    }
    _getDaysInMonth(date) {
      const tempCalendarDate = new _CalendarDate.default(date);
      tempCalendarDate.setDate(1);
      tempCalendarDate.setMonth(tempCalendarDate.getMonth() + 1);
      tempCalendarDate.setDate(0);
      return tempCalendarDate.getDate();
    }

    /**
     * The month button is hidden when the month picker or year picker is shown
     * @returns {boolean}
     * @private
     */
    get _isHeaderMonthButtonHidden() {
      return this._currentPicker === "month" || this._currentPicker === "year";
    }
    get _isDayPickerHidden() {
      return this._currentPicker !== "day";
    }
    get _isMonthPickerHidden() {
      return this._currentPicker !== "month";
    }
    get _isYearPickerHidden() {
      return this._currentPicker !== "year";
    }
    onSelectedDatesChange(event) {
      const timestamp = event.detail.timestamp;
      const selectedDates = event.detail.dates;
      const datesValues = selectedDates.map(ts => {
        const calendarDate = _CalendarDate.default.fromTimestamp(ts * 1000, this._primaryCalendarType);
        return this.getFormat().format(calendarDate.toUTCJSDate(), true);
      });
      this.timestamp = timestamp;
      const defaultPrevented = !this.fireEvent("selected-dates-change", {
        timestamp,
        dates: [...selectedDates],
        values: datesValues
      }, true);
      if (!defaultPrevented) {
        this._setSelectedDates(selectedDates);
      }
    }
    onSelectedMonthChange(event) {
      this.timestamp = event.detail.timestamp;
      this._currentPicker = "day";
      this._currentPickerDOM._autoFocus = true;
    }
    onSelectedYearChange(event) {
      this.timestamp = event.detail.timestamp;
      this._currentPicker = "day";
      this._currentPickerDOM._autoFocus = true;
    }
    onNavigate(event) {
      this.timestamp = event.detail.timestamp;
    }
    _onkeydown(event) {
      if ((0, _Keys.isF4)(event) && this._currentPicker !== "month") {
        this._currentPicker = "month";
      }
      if ((0, _Keys.isF4Shift)(event) && this._currentPicker !== "year") {
        this._currentPicker = "year";
      }
    }

    /**
     * Returns an array of UTC timestamps, representing the selected dates.
     * @protected
     * @deprecated
     */
    get selectedDates() {
      return this._selectedDatesTimestamps;
    }

    /**
     * Creates instances of <code>ui5-date</code> inside this <code>ui5-calendar</code> with values, equal to the provided UTC timestamps
     * @protected
     * @deprecated
     * @param selectedDates Array of UTC timestamps
     */
    set selectedDates(selectedDates) {
      this._setSelectedDates(selectedDates);
    }
    static get dependencies() {
      return [CalendarDateComponent.default, _CalendarHeader.default, _DayPicker.default, _MonthPicker.default, _YearPicker.default];
    }
  }
  Calendar.define();
  var _default = Calendar;
  _exports.default = _default;
});