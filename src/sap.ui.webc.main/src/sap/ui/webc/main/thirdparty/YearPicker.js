sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/decorators/customElement", "sap/ui/webc/common/thirdparty/base/decorators/property", "sap/ui/webc/common/thirdparty/base/decorators/event", "sap/ui/webc/common/thirdparty/localization/DateFormat", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/locale/getLocale", "sap/ui/webc/common/thirdparty/localization/dates/transformDateToSecondaryType", "sap/ui/webc/common/thirdparty/localization/dates/CalendarDate", "sap/ui/webc/common/thirdparty/localization/dates/ExtremeDates", "sap/ui/webc/common/thirdparty/base/i18nBundle", "./CalendarPart", "./generated/i18n/i18n-defaults", "./generated/templates/YearPickerTemplate.lit", "./generated/themes/YearPicker.css"], function (_exports, _customElement, _property, _event, _DateFormat, _Keys, _Integer, _getLocale, _transformDateToSecondaryType, _CalendarDate, _ExtremeDates, _i18nBundle, _CalendarPart, _i18nDefaults, _YearPickerTemplate, _YearPicker) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _customElement = _interopRequireDefault(_customElement);
  _property = _interopRequireDefault(_property);
  _event = _interopRequireDefault(_event);
  _DateFormat = _interopRequireDefault(_DateFormat);
  _Integer = _interopRequireDefault(_Integer);
  _getLocale = _interopRequireDefault(_getLocale);
  _transformDateToSecondaryType = _interopRequireDefault(_transformDateToSecondaryType);
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  _CalendarPart = _interopRequireDefault(_CalendarPart);
  _YearPickerTemplate = _interopRequireDefault(_YearPickerTemplate);
  _YearPicker = _interopRequireDefault(_YearPicker);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  var __decorate = void 0 && (void 0).__decorate || function (decorators, target, key, desc) {
    var c = arguments.length,
      r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  var YearPicker_1;

  // Template

  // Styles

  /**
   * @class
   *
   * Displays years which can be selected.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webc.main.YearPicker
   * @extends sap.ui.webc.main.CalendarPart
   * @tagname ui5-yearpicker
   * @public
   */
  let YearPicker = YearPicker_1 = class YearPicker extends _CalendarPart.default {
    static async onDefine() {
      YearPicker_1.i18nBundle = await (0, _i18nBundle.getI18nBundle)("@ui5/webcomponents");
    }
    get roleDescription() {
      return YearPicker_1.i18nBundle.getText(_i18nDefaults.YEAR_PICKER_DESCRIPTION);
    }
    onBeforeRendering() {
      this._buildYears();
    }
    _getPageSize() {
      // Total years on a single page depending on using on one or two calendar type
      return this.secondaryCalendarType ? 8 : 20;
    }
    _getRowSize() {
      // Years per row (5 rows of 4 years each) for one claendar type and (4 row of 2 years each) for two calendar type
      return this.secondaryCalendarType ? 2 : 4;
    }
    _buildYears() {
      if (this._hidden) {
        return;
      }
      const pageSize = this._getPageSize();
      const locale = (0, _getLocale.default)();
      const oYearFormat = _DateFormat.default.getDateInstance({
        format: "y",
        calendarType: this._primaryCalendarType
      }, locale);
      const oYearFormatInSecType = _DateFormat.default.getDateInstance({
        format: "y",
        calendarType: this.secondaryCalendarType
      }, locale);
      this._calculateFirstYear();
      this._lastYear = this._firstYear + pageSize - 1;
      const calendarDate = this._calendarDate; // store the value of the expensive getter
      const minDate = this._minDate; // store the value of the expensive getter
      const maxDate = this._maxDate; // store the value of the expensive getter
      const tempDate = new _CalendarDate.default(calendarDate, this._primaryCalendarType);
      let tempDateInSecType;
      let textInSecType;
      tempDate.setYear(this._firstYear);
      const intervals = [];
      let timestamp;
      /* eslint-disable no-loop-func */
      for (let i = 0; i < pageSize; i++) {
        timestamp = tempDate.valueOf() / 1000;
        const isSelected = this.selectedDates.some(itemTimestamp => {
          const date = _CalendarDate.default.fromTimestamp(itemTimestamp * 1000, this._primaryCalendarType);
          return date.getYear() === tempDate.getYear();
        });
        const isFocused = tempDate.getYear() === calendarDate.getYear();
        const isDisabled = tempDate.getYear() < minDate.getYear() || tempDate.getYear() > maxDate.getYear();
        if (this.secondaryCalendarType) {
          tempDateInSecType = (0, _transformDateToSecondaryType.default)(this._primaryCalendarType, this.secondaryCalendarType, timestamp, true);
          textInSecType = tempDateInSecType.firstDate.getYear() === tempDateInSecType.lastDate.getYear() ? `${oYearFormatInSecType.format(tempDateInSecType.firstDate.toLocalJSDate(), true)}` : `${oYearFormatInSecType.format(tempDateInSecType.firstDate.toLocalJSDate(), true)} - ${oYearFormatInSecType.format(tempDateInSecType.lastDate.toLocalJSDate(), true)}`;
        }
        const year = {
          timestamp: timestamp.toString(),
          _tabIndex: isFocused ? "0" : "-1",
          focusRef: isFocused,
          selected: isSelected,
          ariaSelected: isSelected ? "true" : "false",
          year: oYearFormat.format(tempDate.toLocalJSDate()),
          yearInSecType: this.secondaryCalendarType && textInSecType,
          disabled: isDisabled,
          classes: "ui5-yp-item"
        };
        if (isSelected) {
          year.classes += " ui5-yp-item--selected";
        }
        if (isDisabled) {
          year.classes += " ui5-yp-item--disabled";
        }
        if (this.secondaryCalendarType) {
          year.classes += " ui5-yp-item-secondary-type";
        }
        const intervalIndex = Math.floor(i / this._getRowSize());
        if (intervals[intervalIndex]) {
          intervals[intervalIndex].push(year);
        } else {
          intervals[intervalIndex] = [year];
        }
        tempDate.setYear(tempDate.getYear() + 1);
      }
      this._years = intervals;
    }
    _calculateFirstYear() {
      const pageSize = this._getPageSize();
      const absoluteMaxYear = (0, _ExtremeDates.getMaxCalendarDate)(this._primaryCalendarType).getYear(); // 9999
      const currentYear = this._calendarDate.getYear();
      // 1. If first load - center the current year (set first year to be current year minus half page size)
      if (!this._firstYear) {
        this._firstYear = currentYear - pageSize / 2;
      }
      // 2. If out of range - change by a page (20) - do not center in order to keep the same position as the last page
      if (currentYear < this._firstYear) {
        this._firstYear -= pageSize;
      } else if (currentYear >= this._firstYear + pageSize) {
        this._firstYear += pageSize;
      }
      // 3. If the date was changed by more than 20 years - reset _firstYear completely
      if (Math.abs(this._firstYear - currentYear) >= pageSize) {
        this._firstYear = currentYear - pageSize / 2;
      }
      // Keep it in the range between the min and max year
      this._firstYear = Math.max(this._firstYear, this._minDate.getYear());
      this._firstYear = Math.min(this._firstYear, this._maxDate.getYear());
      // If first year is > 9980, make it 9980 to not show any years beyond 9999
      if (this._firstYear > absoluteMaxYear - pageSize + 1) {
        this._firstYear = absoluteMaxYear - pageSize + 1;
      }
    }
    onAfterRendering() {
      if (!this._hidden) {
        this.focus();
      }
    }
    _onkeydown(e) {
      let preventDefault = true;
      const pageSize = this._getPageSize();
      const rowSize = this._getRowSize();
      if ((0, _Keys.isEnter)(e)) {
        this._selectYear(e);
      } else if ((0, _Keys.isSpace)(e)) {
        e.preventDefault();
      } else if ((0, _Keys.isLeft)(e)) {
        this._modifyTimestampBy(-1);
      } else if ((0, _Keys.isRight)(e)) {
        this._modifyTimestampBy(1);
      } else if ((0, _Keys.isUp)(e)) {
        this._modifyTimestampBy(-rowSize);
      } else if ((0, _Keys.isDown)(e)) {
        this._modifyTimestampBy(rowSize);
      } else if ((0, _Keys.isPageUp)(e)) {
        this._modifyTimestampBy(-pageSize);
      } else if ((0, _Keys.isPageDown)(e)) {
        this._modifyTimestampBy(pageSize);
      } else if ((0, _Keys.isHome)(e) || (0, _Keys.isEnd)(e)) {
        this._onHomeOrEnd((0, _Keys.isHome)(e));
      } else if ((0, _Keys.isHomeCtrl)(e)) {
        this._setTimestamp(parseInt(this._years[0][0].timestamp)); // first year of first row
      } else if ((0, _Keys.isEndCtrl)(e)) {
        this._setTimestamp(parseInt(this._years[pageSize / rowSize - 1][rowSize - 1].timestamp)); // last year of last row
      } else {
        preventDefault = false;
      }
      if (preventDefault) {
        e.preventDefault();
      }
    }
    _onHomeOrEnd(homePressed) {
      this._years.forEach(row => {
        const indexInRow = row.findIndex(item => _CalendarDate.default.fromTimestamp(parseInt(item.timestamp) * 1000).getYear() === this._calendarDate.getYear());
        if (indexInRow !== -1) {
          // The current year is on this row
          const index = homePressed ? 0 : this._getRowSize() - 1; // select the first (if Home) or last (if End) year on the row
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
     * Modifies timestamp by a given amount of years and, if necessary, loads the prev/next page.
     * @param { number } amount
     * @private
     */
    _modifyTimestampBy(amount) {
      // Modify the current timestamp
      this._safelyModifyTimestampBy(amount, "year");
      // Notify the calendar to update its timestamp
      this.fireEvent("navigate", {
        timestamp: this.timestamp
      });
    }
    _onkeyup(e) {
      if ((0, _Keys.isSpace)(e)) {
        this._selectYear(e);
      }
    }
    /**
     * User clicked with the mouser or pressed Enter/Space
     * @param { Event } e
     * @private
     */
    _selectYear(e) {
      e.preventDefault();
      const target = e.target;
      if (target.className.indexOf("ui5-yp-item") > -1) {
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
      return this._firstYear > this._minDate.getYear();
    }
    /**
     * Called by the Calendar component.
     * @protected
     * @returns { boolean }
     */
    _hasNextPage() {
      return this._firstYear + this._getPageSize() - 1 < this._maxDate.getYear();
    }
    /**
     * Called by the Calendar component.
     * <b>Note:</b> when the user presses the "<" button in the calendar header (same as "PageUp")
     * @protected
     */
    _showPreviousPage() {
      const pageSize = this._getPageSize();
      this._modifyTimestampBy(-pageSize);
    }
    /**
     * Called by the Calendar component.
     * <b>Note:</b> when the user presses the ">" button in the calendar header (same as "PageDown")
     * @protected
     */
    _showNextPage() {
      this._modifyTimestampBy(this._getPageSize());
    }
  };
  __decorate([(0, _property.default)({
    validator: _Integer.default,
    multiple: true,
    compareValues: true
  })], YearPicker.prototype, "selectedDates", void 0);
  __decorate([(0, _property.default)({
    type: Object,
    multiple: true
  })], YearPicker.prototype, "_years", void 0);
  __decorate([(0, _property.default)({
    type: Boolean,
    noAttribute: true
  })], YearPicker.prototype, "_hidden", void 0);
  YearPicker = YearPicker_1 = __decorate([(0, _customElement.default)({
    tag: "ui5-yearpicker",
    styles: _YearPicker.default,
    template: _YearPickerTemplate.default
  })
  /**
   * Fired when the user selects a year via "Space", "Enter" or click.
   * @public
   * @event sap.ui.webc.main.YearPicker#change
   */, (0, _event.default)("change")
  /**
   * Fired when the timestamp changes - the user navigates with the keyboard or clicks with the mouse.
   * @since 1.0.0-rc.9
   * @public
   * @event sap.ui.webc.main.YearPicker#navigate
   */, (0, _event.default)("navigate")], YearPicker);
  YearPicker.define();
  var _default = YearPicker;
  _exports.default = _default;
});