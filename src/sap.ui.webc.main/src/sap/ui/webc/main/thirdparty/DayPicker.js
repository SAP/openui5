sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/base/locale/getLocale", "sap/ui/webc/common/thirdparty/base/config/FormatSettings", "sap/ui/webc/common/thirdparty/localization/getCachedLocaleDataInstance", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/localization/dates/CalendarDate", "sap/ui/webc/common/thirdparty/localization/dates/calculateWeekNumber", "sap/ui/webc/common/thirdparty/base/types/CalendarType", "./types/CalendarSelectionMode", "./CalendarPart", "./generated/i18n/i18n-defaults", "./generated/templates/DayPickerTemplate.lit", "./generated/themes/DayPicker.css"], function (_exports, _customElement, _property, _event, _getLocale, _FormatSettings, _getCachedLocaleDataInstance, _Keys, _Integer, _CalendarDate, _calculateWeekNumber, _CalendarType, _CalendarSelectionMode, _CalendarPart, _i18nDefaults, _DayPickerTemplate, _DayPicker) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _getLocale = _interopRequireDefault(_getLocale);
  _getCachedLocaleDataInstance = _interopRequireDefault(_getCachedLocaleDataInstance);
  _Integer = _interopRequireDefault(_Integer);
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  _calculateWeekNumber = _interopRequireDefault(_calculateWeekNumber);
  _CalendarType = _interopRequireDefault(_CalendarType);
  _CalendarSelectionMode = _interopRequireDefault(_CalendarSelectionMode);
  _CalendarPart = _interopRequireDefault(_CalendarPart);
  _DayPickerTemplate = _interopRequireDefault(_DayPickerTemplate);
  _DayPicker = _interopRequireDefault(_DayPicker);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var DayPicker_1;

  // Template

  // Styles

  const isBetween = (x, num1, num2) => x > Math.min(num1, num2) && x < Math.max(num1, num2);
  const DAYS_IN_WEEK = 7;
  /**
   * @class
   *
   * Represents the days inside a single month view of the <code>ui5-calendar</code> component.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.DayPicker
   * @extends sap.ui.webc.main.CalendarPart
   * @tagname ui5-daypicker
   * @public
   */
  let DayPicker = DayPicker_1 = class DayPicker extends _CalendarPart.default {
    onBeforeRendering() {
      const localeData = (0, _getCachedLocaleDataInstance.default)((0, _getLocale.default)());
      this._buildWeeks(localeData);
      this._buildDayNames(localeData);
    }
    /**
     * Builds the "_weeks" object that represents the month.
     * @param { LocaleData }localeData
     * @private
     */
    _buildWeeks(localeData) {
      if (this._hidden) {
        return; // Optimization to not do any work unless the current picker
      }

      this._weeks = [];
      const firstDayOfWeek = this._getFirstDayOfWeek();
      const monthsNames = localeData.getMonths("wide", this._primaryCalendarType);
      const secondaryMonthsNames = this.hasSecondaryCalendarType ? localeData.getMonths("wide", this.secondaryCalendarType) : [];
      const nonWorkingDayLabel = DayPicker_1.i18nBundle.getText(_i18nDefaults.DAY_PICKER_NON_WORKING_DAY);
      const todayLabel = DayPicker_1.i18nBundle.getText(_i18nDefaults.DAY_PICKER_TODAY);
      const tempDate = this._getFirstDay(); // date that will be changed by 1 day 42 times
      const todayDate = _CalendarDate.default.fromLocalJSDate(new Date(), this._primaryCalendarType); // current day date - calculate once
      const calendarDate = this._calendarDate; // store the _calendarDate value as this getter is expensive and degrades IE11 perf
      const minDate = this._minDate; // store the _minDate (expensive getter)
      const maxDate = this._maxDate; // store the _maxDate (expensive getter)
      const tempSecondDate = this.hasSecondaryCalendarType ? this._getSecondaryDay(tempDate) : undefined;
      let week = [];
      for (let i = 0; i < DAYS_IN_WEEK * 6; i++) {
        // always show 6 weeks total, 42 days to avoid jumping
        const timestamp = tempDate.valueOf() / 1000; // no need to round because CalendarDate does it
        let dayOfTheWeek = tempDate.getDay() - firstDayOfWeek;
        if (dayOfTheWeek < 0) {
          dayOfTheWeek += DAYS_IN_WEEK;
        }
        const isFocused = tempDate.getMonth() === calendarDate.getMonth() && tempDate.getDate() === calendarDate.getDate();
        const isSelected = this._isDaySelected(timestamp);
        const isSelectedBetween = this._isDayInsideSelectionRange(timestamp);
        const isOtherMonth = tempDate.getMonth() !== calendarDate.getMonth();
        const isWeekend = this._isWeekend(tempDate);
        const isDisabled = tempDate.valueOf() < minDate.valueOf() || tempDate.valueOf() > maxDate.valueOf();
        const isToday = tempDate.isSame(todayDate);
        const isFirstDayOfWeek = tempDate.getDay() === firstDayOfWeek;
        const nonWorkingAriaLabel = isWeekend ? `${nonWorkingDayLabel} ` : "";
        const todayAriaLabel = isToday ? `${todayLabel} ` : "";
        const tempSecondDateNumber = tempSecondDate ? tempSecondDate.getDate() : "";
        const tempSecondYearNumber = tempSecondDate ? tempSecondDate.getYear() : "";
        const secondaryMonthsNamesString = secondaryMonthsNames.length > 0 ? secondaryMonthsNames[tempSecondDate.getMonth()] : "";
        const ariaLabel = this.hasSecondaryCalendarType ? `${todayAriaLabel}${nonWorkingAriaLabel}${monthsNames[tempDate.getMonth()]} ${tempDate.getDate()}, ${tempDate.getYear()}; ${secondaryMonthsNamesString} ${tempSecondDateNumber}, ${tempSecondYearNumber}` : `${todayAriaLabel}${nonWorkingAriaLabel}${monthsNames[tempDate.getMonth()]} ${tempDate.getDate()}, ${tempDate.getYear()}`;
        const day = {
          timestamp: timestamp.toString(),
          focusRef: isFocused,
          _tabIndex: isFocused ? "0" : "-1",
          selected: isSelected,
          day: tempDate.getDate(),
          secondDay: this.hasSecondaryCalendarType ? tempSecondDate.getDate() : undefined,
          _isSecondaryCalendarType: this.hasSecondaryCalendarType,
          classes: `ui5-dp-item ui5-dp-wday${dayOfTheWeek}`,
          ariaLabel,
          ariaSelected: isSelected ? "true" : "false",
          ariaDisabled: isOtherMonth ? "true" : undefined,
          disabled: isDisabled
        };
        if (isFirstDayOfWeek) {
          day.classes += " ui5-dp-firstday";
        }
        if (isSelected) {
          day.classes += " ui5-dp-item--selected";
        }
        if (isSelectedBetween) {
          day.classes += " ui5-dp-item--selected-between";
        }
        if (isToday) {
          day.classes += " ui5-dp-item--now";
        }
        if (isOtherMonth) {
          day.classes += " ui5-dp-item--othermonth";
        }
        if (isWeekend) {
          day.classes += " ui5-dp-item--weeekend";
        }
        if (isDisabled) {
          day.classes += " ui5-dp-item--disabled";
        }
        if (this.hasSecondaryCalendarType) {
          day.classes += " ui5-dp-item--withsecondtype";
        }
        week.push(day);
        if (dayOfTheWeek === DAYS_IN_WEEK - 1) {
          // 0-indexed so 6 is the last day of the week
          week.unshift({
            weekNum: (0, _calculateWeekNumber.default)((0, _FormatSettings.getFirstDayOfWeek)(), tempDate.toUTCJSDate(), tempDate.getYear(), (0, _getLocale.default)(), localeData),
            isHidden: this.shouldHideWeekNumbers
          });
        }
        if (week.length === DAYS_IN_WEEK + 1) {
          // 7 entries for each day + 1 for the week numbers
          this._weeks.push(week);
          week = [];
        }
        tempDate.setDate(tempDate.getDate() + 1);
        if (this.hasSecondaryCalendarType && tempSecondDate) {
          tempSecondDate.setDate(tempSecondDate.getDate() + 1);
        }
      }
    }
    /**
     * Builds the dayNames object (header of the month).
     * @param { LocaleData } localeData
     * @private
     */
    _buildDayNames(localeData) {
      if (this._hidden) {
        return; // Optimization to not do any work unless the current picker
      }

      let dayOfTheWeek;
      const aDayNamesWide = localeData.getDays("wide", this._primaryCalendarType);
      const aDayNamesAbbreviated = localeData.getDays("abbreviated", this._primaryCalendarType);
      let dayName;
      this._dayNames = [];
      this._dayNames.push({
        classes: "ui5-dp-dayname",
        name: DayPicker_1.i18nBundle.getText(_i18nDefaults.DAY_PICKER_WEEK_NUMBER_TEXT)
      });
      for (let i = 0; i < DAYS_IN_WEEK; i++) {
        dayOfTheWeek = i + this._getFirstDayOfWeek();
        if (dayOfTheWeek > DAYS_IN_WEEK - 1) {
          // 0-indexed so index of 6 is the maximum allowed
          dayOfTheWeek -= DAYS_IN_WEEK;
        }
        dayName = {
          name: aDayNamesWide[dayOfTheWeek],
          ultraShortName: aDayNamesAbbreviated[dayOfTheWeek],
          classes: "ui5-dp-dayname"
        };
        this._dayNames.push(dayName);
      }
      this._dayNames[1].classes += " ui5-dp-firstday";
      if (this.shouldHideWeekNumbers) {
        this._dayNames.shift();
      }
    }
    onAfterRendering() {
      if (this._autoFocus && !this._hidden) {
        this.focus();
      }
      const focusedDay = this.shadowRoot.querySelector("[data-sap-focus-ref]");
      if (focusedDay && document.activeElement !== focusedDay) {
        focusedDay.focus();
      }
    }
    _onfocusin() {
      this._autoFocus = true;
    }
    _onfocusout() {
      this._autoFocus = false;
    }
    /**
     * Tells if the day is selected (dark blue).
     * @param { number } timestamp
     * @returns { boolean }
     * @private
     */
    _isDaySelected(timestamp) {
      if (this.selectionMode === _CalendarSelectionMode.default.Single) {
        return timestamp === this.selectedDates[0];
      }
      // Multiple, Range
      return this.selectedDates.includes(timestamp);
    }
    /**
     * Tells if the day is inside a selection range (light blue).
     * @param { number } timestamp
     * @returns { boolean }
     * @private
     */
    _isDayInsideSelectionRange(timestamp) {
      // No selection at all (or not in range selection mode)
      if (this.selectionMode !== _CalendarSelectionMode.default.Range || !this.selectedDates.length) {
        return false;
      }
      // Only one date selected - the user is hovering with the mouse or navigating with the keyboard to select the second one
      if (this.selectedDates.length === 1 && this._secondTimestamp) {
        return isBetween(timestamp, this.selectedDates[0], this._secondTimestamp);
      }
      // Two dates selected - stable range
      return isBetween(timestamp, this.selectedDates[0], this.selectedDates[1]);
    }
    /**
     * Selects/deselects a day.
     * @param { Event} e
     * @param { boolean} isShift true if the user did Click+Shift or Enter+Shift (but not Space+Shift)
     * @private
     */
    _selectDate(e, isShift) {
      const target = e.target;
      if (!this._isDayPressed(target)) {
        return;
      }
      const timestamp = this._getTimestampFromDom(target);
      this._safelySetTimestamp(timestamp);
      this._updateSecondTimestamp();
      if (this.selectionMode === _CalendarSelectionMode.default.Single) {
        this.selectedDates = [timestamp];
      } else if (this.selectionMode === _CalendarSelectionMode.default.Multiple) {
        if (this.selectedDates.length > 0 && isShift) {
          this._multipleSelection(timestamp);
        } else {
          this._toggleTimestampInSelection(timestamp);
        }
      } else {
        this.selectedDates = this.selectedDates.length === 1 ? [...this.selectedDates, timestamp] : [timestamp];
      }
      this.fireEvent("change", {
        timestamp: this.timestamp,
        dates: this.selectedDates
      });
    }
    /**
     * Selects/deselects the whole row (week).
     * @private
     */
    _selectWeek() {
      this._weeks.forEach(week => {
        const _week = week;
        const dayInThisWeek = _week.findIndex(item => {
          const date = _CalendarDate.default.fromTimestamp(parseInt(item.timestamp) * 1000);
          return date.getMonth() === this._calendarDate.getMonth() && date.getDate() === this._calendarDate.getDate();
        }) !== -1;
        if (dayInThisWeek) {
          // The current day is in this week
          const notAllDaysOfThisWeekSelected = _week.some(item => item.timestamp && !this.selectedDates.includes(parseInt(item.timestamp)));
          if (notAllDaysOfThisWeekSelected) {
            // even if one day is not selected, select the whole week
            _week.filter(item => item.timestamp).forEach(item => {
              this._addTimestampToSelection(parseInt(item.timestamp));
            });
          } else {
            // only if all days of this week are selected, deselect them
            _week.filter(item => item.timestamp).forEach(item => {
              this._removeTimestampFromSelection(parseInt(item.timestamp));
            });
          }
        }
      });
      this.fireEvent("change", {
        timestamp: this.timestamp,
        dates: this.selectedDates
      });
    }
    _toggleTimestampInSelection(timestamp) {
      if (this.selectedDates.includes(timestamp)) {
        this._removeTimestampFromSelection(timestamp);
      } else {
        this._addTimestampToSelection(timestamp);
      }
    }
    _addTimestampToSelection(timestamp) {
      if (!this.selectedDates.includes(timestamp)) {
        this.selectedDates = [...this.selectedDates, timestamp];
      }
    }
    _removeTimestampFromSelection(timestamp) {
      this.selectedDates = this.selectedDates.filter(value => value !== timestamp);
    }
    /**
     * Called when at least one day is selected and the user presses "Shift".
     * @param { number } timestamp
     * @private
     */
    _multipleSelection(timestamp) {
      const min = Math.min(...this.selectedDates);
      const max = Math.max(...this.selectedDates);
      let start;
      let end;
      let toggle = false;
      if (timestamp < min) {
        start = timestamp;
        end = min;
      } else if (timestamp >= min && timestamp <= max) {
        // inside the current range - toggle all between the selected and focused
        const distanceToMin = Math.abs(timestamp - min);
        const distanceToMax = Math.abs(timestamp - max);
        if (distanceToMin < distanceToMax) {
          start = timestamp;
          end = max;
        } else {
          start = min;
          end = timestamp;
        }
        toggle = true;
      } else {
        start = max;
        end = timestamp;
      }
      const startDate = _CalendarDate.default.fromTimestamp(start * 1000);
      const endDate = _CalendarDate.default.fromTimestamp(end * 1000);
      while (startDate.valueOf() <= endDate.valueOf()) {
        this[toggle ? "_toggleTimestampInSelection" : "_addTimestampToSelection"](startDate.valueOf() / 1000);
        startDate.setDate(startDate.getDate() + 1);
      }
    }
    /**
     * Set the hovered day as the "_secondTimestamp".
     * @param { MouseEvent } e
     * @private
     */
    _onmouseover(e) {
      const target = e.target;
      const hoveredItem = target.closest(".ui5-dp-item");
      if (hoveredItem && this.selectionMode === _CalendarSelectionMode.default.Range && this.selectedDates.length === 1) {
        this._secondTimestamp = this._getTimestampFromDom(hoveredItem);
      }
    }
    _onkeydown(e) {
      let preventDefault = true;
      if ((0, _Keys.isEnter)(e) || (0, _Keys.isEnterShift)(e)) {
        this._selectDate(e, (0, _Keys.isEnterShift)(e));
      } else if ((0, _Keys.isSpace)(e) || (0, _Keys.isSpaceShift)(e)) {
        e.preventDefault();
      } else if ((0, _Keys.isLeft)(e)) {
        this._modifyTimestampBy(-1, "day", false);
      } else if ((0, _Keys.isRight)(e)) {
        this._modifyTimestampBy(1, "day", false);
      } else if ((0, _Keys.isUp)(e)) {
        this._modifyTimestampBy(-7, "day", false);
      } else if ((0, _Keys.isDown)(e)) {
        this._modifyTimestampBy(7, "day", false);
      } else if ((0, _Keys.isPageUp)(e)) {
        this._modifyTimestampBy(-1, "month");
      } else if ((0, _Keys.isPageDown)(e)) {
        this._modifyTimestampBy(1, "month");
      } else if ((0, _Keys.isPageUpShift)(e) || (0, _Keys.isPageUpAlt)(e)) {
        this._modifyTimestampBy(-1, "year");
      } else if ((0, _Keys.isPageDownShift)(e) || (0, _Keys.isPageDownAlt)(e)) {
        this._modifyTimestampBy(1, "year");
      } else if ((0, _Keys.isPageUpShiftCtrl)(e)) {
        this._modifyTimestampBy(-10, "year");
      } else if ((0, _Keys.isPageDownShiftCtrl)(e)) {
        this._modifyTimestampBy(10, "year");
      } else if ((0, _Keys.isHome)(e) || (0, _Keys.isEnd)(e)) {
        this._onHomeOrEnd((0, _Keys.isHome)(e));
      } else if ((0, _Keys.isHomeCtrl)(e)) {
        const tempDate = new _CalendarDate.default(this._calendarDate, this._primaryCalendarType);
        tempDate.setDate(1); // Set the first day of the month
        this._setTimestamp(tempDate.valueOf() / 1000);
      } else if ((0, _Keys.isEndCtrl)(e)) {
        const tempDate = new _CalendarDate.default(this._calendarDate, this._primaryCalendarType);
        tempDate.setMonth(tempDate.getMonth() + 1);
        tempDate.setDate(0); // Set the last day of the month (0th day of next month)
        this._setTimestamp(tempDate.valueOf() / 1000);
      } else {
        preventDefault = false;
      }
      if (preventDefault) {
        e.preventDefault();
      }
    }
    _onkeyup(e) {
      // Even if Space+Shift was pressed, ignore the shift unless in Multiple selection
      if ((0, _Keys.isSpace)(e) || (0, _Keys.isSpaceShift)(e) && this.selectionMode !== _CalendarSelectionMode.default.Multiple) {
        this._selectDate(e, false);
      } else if ((0, _Keys.isSpaceShift)(e)) {
        this._selectWeek();
      }
    }
    /**
     * Click is the same as "Enter".
     * <b>Note:</b> "Click+Shift" has the same effect as "Enter+Shift".
     * @param { MouseEvent } e
     * @private
     */
    _onclick(e) {
      this._selectDate(e, e.shiftKey);
    }
    /**
     * Called upon "Home" or "End" - moves the focus to the first or last item in the row.
     * @param { boolean } homePressed
     * @private
     */
    _onHomeOrEnd(homePressed) {
      this._weeks.forEach(week => {
        const _week = week;
        const dayInThisWeek = _week.findIndex(item => {
          const date = _CalendarDate.default.fromTimestamp(parseInt(item.timestamp) * 1000);
          return date.getMonth() === this._calendarDate.getMonth() && date.getDate() === this._calendarDate.getDate();
        }) !== -1;
        if (dayInThisWeek) {
          // The current day is in this week
          const index = homePressed ? 1 : 7; // select the first (if Home) or last (if End) day of the week
          this._setTimestamp(parseInt(_week[index].timestamp));
        }
      });
    }
    /**
     * Called by the Calendar component.
     * @protected
     * @returns { boolean }
     */
    _hasPreviousPage() {
      return !(this._calendarDate.getMonth() === this._minDate.getMonth() && this._calendarDate.getYear() === this._minDate.getYear());
    }
    /**
     * Called by the Calendar component.
     * @protected
     * @returns { boolean }
     */
    _hasNextPage() {
      return !(this._calendarDate.getMonth() === this._maxDate.getMonth() && this._calendarDate.getYear() === this._maxDate.getYear());
    }
    /**
     * Called by the Calendar component.
     * @protected
     */
    _showPreviousPage() {
      this._modifyTimestampBy(-1, "month", false);
    }
    /**
     * Called by the Calendar component.
     * @protected
     */
    _showNextPage() {
      this._modifyTimestampBy(1, "month", false);
    }
    /**
     * Modifies the timestamp by a certain amount of days/months/years.
     * @param { number } amount
     * @param { string } unit
     * @param { boolean } preserveDate whether to preserve the day of the month (f.e. 15th of March + 1 month = 15th of April)
     * @private
     */
    _modifyTimestampBy(amount, unit, preserveDate) {
      // Modify the current timestamp
      this._safelyModifyTimestampBy(amount, unit, preserveDate);
      this._updateSecondTimestamp();
      // Notify the calendar to update its timestamp
      this.fireEvent("navigate", {
        timestamp: this.timestamp
      });
    }
    /**
     * Sets the timestamp to an absolute value.
     * @param { number } value
     * @private
     */
    _setTimestamp(value) {
      this._safelySetTimestamp(value);
      this._updateSecondTimestamp();
      this.fireEvent("navigate", {
        timestamp: this.timestamp
      });
    }
    /**
     * During range selection, when the user is navigating with the keyboard,
     * the currently focused day is considered the "second day".
     * @private
     */
    _updateSecondTimestamp() {
      if (this.selectionMode === _CalendarSelectionMode.default.Range && (this.selectedDates.length === 1 || this.selectedDates.length === 2)) {
        this._secondTimestamp = this.timestamp;
      }
    }
    get shouldHideWeekNumbers() {
      if (this._primaryCalendarType !== _CalendarType.default.Gregorian) {
        return true;
      }
      return this.hideWeekNumbers;
    }
    get hasSecondaryCalendarType() {
      return !!this.secondaryCalendarType;
    }
    _isWeekend(oDate) {
      const localeData = (0, _getCachedLocaleDataInstance.default)((0, _getLocale.default)());
      const iWeekDay = oDate.getDay(),
        iWeekendStart = localeData.getWeekendStart(),
        iWeekendEnd = localeData.getWeekendEnd();
      return iWeekDay >= iWeekendStart && iWeekDay <= iWeekendEnd || iWeekendEnd < iWeekendStart && (iWeekDay >= iWeekendStart || iWeekDay <= iWeekendEnd);
    }
    _isDayPressed(target) {
      const targetParent = target.parentNode;
      return target.className.indexOf("ui5-dp-item") > -1 || targetParent && targetParent.classList && targetParent.classList.contains("ui5-dp-item");
    }
    _getSecondaryDay(tempDate) {
      return new _CalendarDate.default(tempDate, this.secondaryCalendarType);
    }
    _getFirstDay() {
      let daysFromPreviousMonth;
      const firstDayOfWeek = this._getFirstDayOfWeek();
      // determine weekday of first day in month
      const firstDay = new _CalendarDate.default(this._calendarDate, this._primaryCalendarType);
      firstDay.setDate(1);
      daysFromPreviousMonth = firstDay.getDay() - firstDayOfWeek;
      if (daysFromPreviousMonth < 0) {
        daysFromPreviousMonth = 7 + daysFromPreviousMonth;
      }
      if (daysFromPreviousMonth > 0) {
        firstDay.setDate(1 - daysFromPreviousMonth);
      }
      return firstDay;
    }
    _getFirstDayOfWeek() {
      const localeData = (0, _getCachedLocaleDataInstance.default)((0, _getLocale.default)());
      const confFirstDayOfWeek = (0, _FormatSettings.getFirstDayOfWeek)();
      return Number.isInteger(confFirstDayOfWeek) ? confFirstDayOfWeek : localeData.getFirstDayOfWeek();
    }
    get styles() {
      return {
        wrapper: {
          display: this._hidden ? "none" : "flex",
          "justify-content": "center"
        },
        main: {
          width: "100%"
        }
      };
    }
    get ariaRoledescription() {
      return this.hasSecondaryCalendarType ? `${this._primaryCalendarType} calendar with secondary ${this.secondaryCalendarType} calendar` : `${this._primaryCalendarType} calendar`;
    }
  };
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    multiple: true,
    compareValues: true
  })], DayPicker.prototype, "selectedDates", void 0);
  __decorate([(0, _property.default)({
    type: _CalendarSelectionMode.default,
    defaultValue: _CalendarSelectionMode.default.Single
  })], DayPicker.prototype, "selectionMode", void 0);
  __decorate([(0, _property.default)({
    type: Boolean
  })], DayPicker.prototype, "hideWeekNumbers", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], DayPicker.prototype, "_weeks", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], DayPicker.prototype, "_dayNames", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], DayPicker.prototype, "_hidden", void 0);
  __decorate([(0, _property.default)()], DayPicker.prototype, "_secondTimestamp", void 0);
  DayPicker = DayPicker_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-daypicker",
    styles: _DayPicker.default,
    template: _DayPickerTemplate.default
  })
  /**
   * Fired when the selected date(s) change
   * @public
   * @event sap.ui.webc.main.DayPicker#change
   */, (0, _event.default)("change")
  /**
   * Fired when the timestamp changes (user navigates with the keyboard) or clicks with the mouse
   * @public
   * @event sap.ui.webc.main.DayPicker#navigate
   */, (0, _event.default)("navigate")], DayPicker);
  DayPicker.define();
  var _default = DayPicker;
  _exports.default = _default;
});