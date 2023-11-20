sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/localization/getCachedLocaleDataInstance", "sap/ui/webc/common/thirdparty/localization/dates/convertMonthNumbersToMonthNames", "sap/ui/webc/common/thirdparty/localization/dates/transformDateToSecondaryType", "sap/ui/webc/common/thirdparty/localization/dates/CalendarDate", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/locale/getLocale", "sap/ui/webc/common/thirdparty/base/i18nBundle", "./generated/i18n/i18n-defaults", "./CalendarPart", "./generated/templates/MonthPickerTemplate.lit", "./generated/themes/MonthPicker.css"], function (_exports, _customElement, _property, _event, _getCachedLocaleDataInstance, _convertMonthNumbersToMonthNames, _transformDateToSecondaryType, _CalendarDate, _Keys, _Integer, _getLocale, _i18nBundle, _i18nDefaults, _CalendarPart, _MonthPickerTemplate, _MonthPicker) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _getCachedLocaleDataInstance = _interopRequireDefault(_getCachedLocaleDataInstance);
  _convertMonthNumbersToMonthNames = _interopRequireDefault(_convertMonthNumbersToMonthNames);
  _transformDateToSecondaryType = _interopRequireDefault(_transformDateToSecondaryType);
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  _Integer = _interopRequireDefault(_Integer);
  _getLocale = _interopRequireDefault(_getLocale);
  _CalendarPart = _interopRequireDefault(_CalendarPart);
  _MonthPickerTemplate = _interopRequireDefault(_MonthPickerTemplate);
  _MonthPicker = _interopRequireDefault(_MonthPicker);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var MonthPicker_1;

  // Template

  // Styles

  const PAGE_SIZE = 12; // total months on a single page
  const ROW_SIZE = 3; // months per row (4 rows of 3 months each)
  /**
   * Month picker component.
   *
   * @class
   *
   * Displays months which can be selected.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.MonthPicker
   * @extends sap.ui.webc.main.CalendarPart
   * @tagname ui5-monthpicker
   * @public
   */
  let MonthPicker = MonthPicker_1 = class MonthPicker extends _CalendarPart.default {
    static async onDefine() {
      MonthPicker_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    get roleDescription() {
      return MonthPicker_1.i18nBundle.getText(_i18nDefaults.MONTH_PICKER_DESCRIPTION);
    }
    onBeforeRendering() {
      this._buildMonths();
    }
    onAfterRendering() {
      if (!this._hidden) {
        this.focus();
      }
    }
    _buildMonths() {
      if (this._hidden) {
        return;
      }
      const localeData = (0, _getCachedLocaleDataInstance.default)((0, _getLocale.default)());
      const monthsNames = localeData.getMonthsStandAlone("wide", this._primaryCalendarType);
      const months = [];
      const calendarDate = this._calendarDate; // store the value of the expensive getter
      const minDate = this._minDate; // store the value of the expensive getter
      const maxDate = this._maxDate; // store the value of the expensive getter
      const tempDate = new _CalendarDate.default(calendarDate, this._primaryCalendarType);
      let timestamp;
      /* eslint-disable no-loop-func */
      for (let i = 0; i < 12; i++) {
        tempDate.setMonth(i);
        timestamp = tempDate.valueOf() / 1000;
        const isSelected = this.selectedDates.some(itemTimestamp => {
          const date = _CalendarDate.default.fromTimestamp(itemTimestamp * 1000, this._primaryCalendarType);
          return date.getYear() === tempDate.getYear() && date.getMonth() === tempDate.getMonth();
        });
        const isFocused = tempDate.getMonth() === calendarDate.getMonth();
        const isDisabled = this._isOutOfSelectableRange(tempDate, minDate, maxDate);
        const month = {
          timestamp: timestamp.toString(),
          focusRef: isFocused,
          _tabIndex: isFocused ? "0" : "-1",
          selected: isSelected,
          ariaSelected: isSelected ? "true" : "false",
          name: monthsNames[i],
          nameInSecType: this.secondaryCalendarType && this._getDisplayedSecondaryMonthText(timestamp).text,
          disabled: isDisabled,
          classes: "ui5-mp-item"
        };
        if (isSelected) {
          month.classes += " ui5-mp-item--selected";
        }
        if (isDisabled) {
          month.classes += " ui5-mp-item--disabled";
        }
        const quarterIndex = Math.floor(i / ROW_SIZE);
        if (months[quarterIndex]) {
          months[quarterIndex].push(month);
        } else {
          months[quarterIndex] = [month];
        }
      }
      this._months = months;
    }
    _getDisplayedSecondaryMonthText(timestamp) {
      const monthsName = (0, _transformDateToSecondaryType.default)(this._primaryCalendarType, this.secondaryCalendarType, timestamp);
      return (0, _convertMonthNumbersToMonthNames.default)(monthsName.firstDate.getMonth(), monthsName.lastDate.getMonth(), this.secondaryCalendarType);
    }
    _onkeydown(e) {
      let preventDefault = true;
      if ((0, _Keys.isEnter)(e)) {
        this._selectMonth(e);
      } else if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
      } else if ((0, _Keys.isLeft)(e)) {
        this._modifyTimestampBy(-1);
      } else if ((0, _Keys.isRight)(e)) {
        this._modifyTimestampBy(1);
      } else if ((0, _Keys.isUp)(e)) {
        this._modifyTimestampBy(-ROW_SIZE);
      } else if ((0, _Keys.isDown)(e)) {
        this._modifyTimestampBy(ROW_SIZE);
      } else if ((0, _Keys.isPageUp)(e)) {
        this._modifyTimestampBy(-PAGE_SIZE);
      } else if ((0, _Keys.isPageDown)(e)) {
        this._modifyTimestampBy(PAGE_SIZE);
      } else if ((0, _Keys.isHome)(e) || (0, _Keys.isEnd)(e)) {
        this._onHomeOrEnd((0, _Keys.isHome)(e));
      } else if ((0, _Keys.isHomeCtrl)(e)) {
        this._setTimestamp(parseInt(this._months[0][0].timestamp)); // first month of first row
      } else if ((0, _Keys.isEndCtrl)(e)) {
        this._setTimestamp(parseInt(this._months[PAGE_SIZE / ROW_SIZE - 1][ROW_SIZE - 1].timestamp)); // last month of last row
      } else {
        preventDefault = false;
      }
      if (preventDefault) {
        e.preventDefault();
      }
    }
    _onHomeOrEnd(homePressed) {
      this._months.forEach(row => {
        const indexInRow = row.findIndex(item => _CalendarDate.default.fromTimestamp(parseInt(item.timestamp) * 1000).getMonth() === this._calendarDate.getMonth());
        if (indexInRow !== -1) {
          // The current month is on this row
          const index = homePressed ? 0 : ROW_SIZE - 1; // select the first (if Home) or last (if End) month on the row
          this._setTimestamp(parseInt(row[index].timestamp));
        }
      });
    }
    /**
     * Sets the timestamp to an absolute value.
     * @param { number } value
     * @private
     */
    _setTimestamp(value) {
      this._safelySetTimestamp(value);
      this.fireEvent("navigate", {
        timestamp: this.timestamp
      });
    }
    /**
     * Modifies timestamp by a given amount of months and,
     * if necessary, loads the prev/next page.
     * @param { number } amount
     * @param { boolean } preserveDate whether to preserve the day of the month (f.e. 15th of March + 1 month = 15th of April)
     * @private
     */
    _modifyTimestampBy(amount, preserveDate) {
      // Modify the current timestamp
      this._safelyModifyTimestampBy(amount, "month", preserveDate);
      // Notify the calendar to update its timestamp
      this.fireEvent("navigate", {
        timestamp: this.timestamp
      });
    }
    _onkeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
        this._selectMonth(e);
      }
    }
    /**
     * Selects a month, when the user clicks or presses "Enter" or "Space".
     * @param { Event } e
     * @private
     */
    _selectMonth(e) {
      e.preventDefault();
      const target = e.target;
      if (target.className.indexOf("ui5-mp-item") > -1) {
        const timestamp = this._getTimestampFromDom(target);
        this._safelySetTimestamp(timestamp);
        this.fireEvent("change", {
          timestamp: this.timestamp
        });
      }
    }
    /**
     * Called by the Calendar component.
     * @protected
     * @returns { boolean }
     */
    _hasPreviousPage() {
      return this._calendarDate.getYear() !== this._minDate.getYear();
    }
    /**
     * Called by the Calendar component.
     * @protected
     * @returns { boolean }
     */
    _hasNextPage() {
      return this._calendarDate.getYear() !== this._maxDate.getYear();
    }
    /**
     * Called by Calendar.js.
     * <b>Note:</b> when the user presses the "<" button in the calendar header (same as "PageUp")
     * @protected
     */
    _showPreviousPage() {
      this._modifyTimestampBy(-PAGE_SIZE, true);
    }
    /**
     * Called by Calendar.js
     * <b>Note:</b> when the user presses the ">" button in the calendar header (same as "PageDown")
     * @protected
     */
    _showNextPage() {
      this._modifyTimestampBy(PAGE_SIZE, true);
    }
    _isOutOfSelectableRange(date, minDate, maxDate) {
      const month = date.getMonth();
      const year = date.getYear();
      const minYear = minDate.getYear();
      const minMonth = minDate.getMonth();
      const maxYear = maxDate.getYear();
      const maxMonth = maxDate.getMonth();
      return year < minYear || year === minYear && month < minMonth || year > maxYear || year === maxYear && month > maxMonth;
    }
  };
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    multiple: true,
    compareValues: true
  })], MonthPicker.prototype, "selectedDates", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], MonthPicker.prototype, "_months", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], MonthPicker.prototype, "_hidden", void 0);
  MonthPicker = MonthPicker_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-monthpicker",
    template: _MonthPickerTemplate.default,
    styles: _MonthPicker.default
  })
  /**
   * Fired when the user selects a month via "Space", "Enter" or click.
   * @public
   * @event sap.ui.webc.main.MonthPicker#change
   */, (0, _event.default)("change")
  /**
   * Fired when the timestamp changes - the user navigates with the keyboard or clicks with the mouse.
   * @since 1.0.0-rc.9
   * @public
   * @event sap.ui.webc.main.MonthPicker#navigate
   */, (0, _event.default)("navigate")], MonthPicker);
  MonthPicker.define();
  var _default = MonthPicker;
  _exports.default = _default;
});