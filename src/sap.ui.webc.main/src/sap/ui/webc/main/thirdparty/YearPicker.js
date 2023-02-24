sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/localization/DateFormat", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/locale/getLocale", "sap/ui/webc/common/thirdparty/localization/dates/CalendarDate", "sap/ui/webc/common/thirdparty/localization/dates/ExtremeDates", "./CalendarPart", "./generated/templates/YearPickerTemplate.lit", "./generated/themes/YearPicker.css"], function (_exports, _DateFormat, _Keys, _Integer, _getLocale, _CalendarDate, _ExtremeDates, _CalendarPart, _YearPickerTemplate, _YearPicker) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _DateFormat = _interopRequireDefault(_DateFormat);
  _Integer = _interopRequireDefault(_Integer);
  _getLocale = _interopRequireDefault(_getLocale);
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  _CalendarPart = _interopRequireDefault(_CalendarPart);
  _YearPickerTemplate = _interopRequireDefault(_YearPickerTemplate);
  _YearPicker = _interopRequireDefault(_YearPicker);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  /**
   * @public
   */
  const metadata = {
    tag: "ui5-yearpicker",
    properties: /** @lends sap.ui.webcomponents.main.YearPicker.prototype */{
      /**
       * An array of UTC timestamps representing the selected date or dates depending on the capabilities of the picker component.
       * @type {Array}
       * @public
       */
      selectedDates: {
        type: _Integer.default,
        multiple: true,
        compareValues: true
      },
      _years: {
        type: Object,
        multiple: true
      },
      _hidden: {
        type: Boolean,
        noAttribute: true
      }
    },
    events: /** @lends sap.ui.webcomponents.main.YearPicker.prototype */{
      /**
       * Fired when the user selects a year (space/enter/click).
       * @public
       * @event
       */
      change: {},
      /**
       * Fired when the timestamp changes - the user navigates with the keyboard or clicks with the mouse.
       * @since 1.0.0-rc.9
       * @public
       * @event
       */
      navigate: {}
    }
  };
  const PAGE_SIZE = 20; // Total years on a single page
  const ROW_SIZE = 4; // Years per row (5 rows of 4 years each)

  /**
   * @class
   *
   * Displays years which can be selected.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.YearPicker
   * @extends CalendarPart
   * @tagname ui5-yearpicker
   * @public
   */
  class YearPicker extends _CalendarPart.default {
    static get metadata() {
      return metadata;
    }
    static get styles() {
      return _YearPicker.default;
    }
    static get template() {
      return _YearPickerTemplate.default;
    }
    onBeforeRendering() {
      this._buildYears();
    }
    _buildYears() {
      if (this._hidden) {
        return;
      }
      const oYearFormat = _DateFormat.default.getDateInstance({
        format: "y",
        calendarType: this._primaryCalendarType
      }, (0, _getLocale.default)());
      this._calculateFirstYear();
      this._lastYear = this._firstYear + PAGE_SIZE - 1;
      const calendarDate = this._calendarDate; // store the value of the expensive getter
      const minDate = this._minDate; // store the value of the expensive getter
      const maxDate = this._maxDate; // store the value of the expensive getter
      const tempDate = new _CalendarDate.default(calendarDate, this._primaryCalendarType);
      tempDate.setYear(this._firstYear);
      const intervals = [];
      let timestamp;

      /* eslint-disable no-loop-func */
      for (let i = 0; i < PAGE_SIZE; i++) {
        timestamp = tempDate.valueOf() / 1000;
        const isSelected = this.selectedDates.some(itemTimestamp => {
          const date = _CalendarDate.default.fromTimestamp(itemTimestamp * 1000, this._primaryCalendarType);
          return date.getYear() === tempDate.getYear();
        });
        const isFocused = tempDate.getYear() === calendarDate.getYear();
        const isDisabled = tempDate.getYear() < minDate.getYear() || tempDate.getYear() > maxDate.getYear();
        const year = {
          timestamp: timestamp.toString(),
          _tabIndex: isFocused ? "0" : "-1",
          focusRef: isFocused,
          selected: isSelected,
          ariaSelected: isSelected ? "true" : "false",
          year: oYearFormat.format(tempDate.toLocalJSDate()),
          disabled: isDisabled,
          classes: "ui5-yp-item"
        };
        if (isSelected) {
          year.classes += " ui5-yp-item--selected";
        }
        if (isDisabled) {
          year.classes += " ui5-yp-item--disabled";
        }
        const intervalIndex = parseInt(i / ROW_SIZE);
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
      const absoluteMaxYear = (0, _ExtremeDates.getMaxCalendarDate)(this._primaryCalendarType).getYear(); // 9999
      const currentYear = this._calendarDate.getYear();

      // 1. If first load - center the current year (set first year to be current year minus half page size)
      if (!this._firstYear) {
        this._firstYear = currentYear - PAGE_SIZE / 2;
      }

      // 2. If out of range - change by a page (20) - do not center in order to keep the same position as the last page
      if (currentYear < this._firstYear) {
        this._firstYear -= PAGE_SIZE;
      } else if (currentYear >= this._firstYear + PAGE_SIZE) {
        this._firstYear += PAGE_SIZE;
      }

      // 3. If the date was changed by more than 20 years - reset _firstYear completely
      if (Math.abs(this._firstYear - currentYear) >= PAGE_SIZE) {
        this._firstYear = currentYear - PAGE_SIZE / 2;
      }

      // Keep it in the range between the min and max year
      this._firstYear = Math.max(this._firstYear, this._minDate.getYear());
      this._firstYear = Math.min(this._firstYear, this._maxDate.getYear());

      // If first year is > 9980, make it 9980 to not show any years beyond 9999
      if (this._firstYear > absoluteMaxYear - PAGE_SIZE + 1) {
        this._firstYear = absoluteMaxYear - PAGE_SIZE + 1;
      }
    }
    onAfterRendering() {
      if (!this._hidden) {
        this.focus();
      }
    }
    _onkeydown(event) {
      let preventDefault = true;
      if ((0, _Keys.isEnter)(event)) {
        this._selectYear(event);
      } else if ((0, _Keys.isSpace)(event)) {
        event.preventDefault();
      } else if ((0, _Keys.isLeft)(event)) {
        this._modifyTimestampBy(-1);
      } else if ((0, _Keys.isRight)(event)) {
        this._modifyTimestampBy(1);
      } else if ((0, _Keys.isUp)(event)) {
        this._modifyTimestampBy(-ROW_SIZE);
      } else if ((0, _Keys.isDown)(event)) {
        this._modifyTimestampBy(ROW_SIZE);
      } else if ((0, _Keys.isPageUp)(event)) {
        this._modifyTimestampBy(-PAGE_SIZE);
      } else if ((0, _Keys.isPageDown)(event)) {
        this._modifyTimestampBy(PAGE_SIZE);
      } else if ((0, _Keys.isHome)(event) || (0, _Keys.isEnd)(event)) {
        this._onHomeOrEnd((0, _Keys.isHome)(event));
      } else if ((0, _Keys.isHomeCtrl)(event)) {
        this._setTimestamp(parseInt(this._years[0][0].timestamp)); // first year of first row
      } else if ((0, _Keys.isEndCtrl)(event)) {
        this._setTimestamp(parseInt(this._years[PAGE_SIZE / ROW_SIZE - 1][ROW_SIZE - 1].timestamp)); // last year of last row
      } else {
        preventDefault = false;
      }
      if (preventDefault) {
        event.preventDefault();
      }
    }
    _onHomeOrEnd(homePressed) {
      this._years.forEach(row => {
        const indexInRow = row.findIndex(item => _CalendarDate.default.fromTimestamp(parseInt(item.timestamp) * 1000).getYear() === this._calendarDate.getYear());
        if (indexInRow !== -1) {
          // The current year is on this row
          const index = homePressed ? 0 : ROW_SIZE - 1; // select the first (if Home) or last (if End) year on the row
          this._setTimestamp(parseInt(row[index].timestamp));
        }
      });
    }

    /**
     * Sets the timestamp to an absolute value
     * @param value
     * @private
     */
    _setTimestamp(value) {
      this._safelySetTimestamp(value);
      this.fireEvent("navigate", {
        timestamp: this.timestamp
      });
    }

    /**
     * Modifies timestamp by a given amount of years and, if necessary, loads the prev/next page
     * @param amount
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
    _onkeyup(event) {
      if ((0, _Keys.isSpace)(event)) {
        this._selectYear(event);
      }
    }

    /**
     * User clicked with the mouser or pressed Enter/Space
     * @param event
     * @private
     */
    _selectYear(event) {
      event.preventDefault();
      if (event.target.className.indexOf("ui5-yp-item") > -1) {
        const timestamp = this._getTimestampFromDom(event.target);
        this._safelySetTimestamp(timestamp);
        this.fireEvent("change", {
          timestamp: this.timestamp
        });
      }
    }

    /**
     * Called from Calendar.js
     * @protected
     */
    _hasPreviousPage() {
      return this._firstYear > this._minDate.getYear();
    }

    /**
     * Called from Calendar.js
     * @protected
     */
    _hasNextPage() {
      return this._firstYear + PAGE_SIZE - 1 < this._maxDate.getYear();
    }

    /**
     * Called by Calendar.js
     * User pressed the "<" button in the calendar header (same as PageUp)
     * @protected
     */
    _showPreviousPage() {
      this._modifyTimestampBy(-PAGE_SIZE);
    }

    /**
     * Called by Calendar.js
     * User pressed the ">" button in the calendar header (same as PageDown)
     * @protected
     */
    _showNextPage() {
      this._modifyTimestampBy(PAGE_SIZE);
    }
  }
  YearPicker.define();
  var _default = YearPicker;
  _exports.default = _default;
});