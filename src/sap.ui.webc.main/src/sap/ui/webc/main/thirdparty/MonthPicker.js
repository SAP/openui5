sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/localization/getCachedLocaleDataInstance", "sap/ui/webc/common/thirdparty/localization/dates/CalendarDate", "sap/ui/webc/common/thirdparty/base/Keys", "sap/ui/webc/common/thirdparty/base/types/Integer", "sap/ui/webc/common/thirdparty/base/locale/getLocale", "./CalendarPart", "./generated/templates/MonthPickerTemplate.lit", "./generated/themes/MonthPicker.css"], function (_exports, _getCachedLocaleDataInstance, _CalendarDate, _Keys, _Integer, _getLocale, _CalendarPart, _MonthPickerTemplate, _MonthPicker) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _getCachedLocaleDataInstance = _interopRequireDefault(_getCachedLocaleDataInstance);
  _CalendarDate = _interopRequireDefault(_CalendarDate);
  _Integer = _interopRequireDefault(_Integer);
  _getLocale = _interopRequireDefault(_getLocale);
  _CalendarPart = _interopRequireDefault(_CalendarPart);
  _MonthPickerTemplate = _interopRequireDefault(_MonthPickerTemplate);
  _MonthPicker = _interopRequireDefault(_MonthPicker);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  /**
   * @public
   */
  const metadata = {
    tag: "ui5-monthpicker",
    properties:
    /** @lends sap.ui.webcomponents.main.MonthPicker.prototype */
    {
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
      _months: {
        type: Object,
        multiple: true
      },
      _hidden: {
        type: Boolean,
        noAttribute: true
      }
    },
    events:
    /** @lends sap.ui.webcomponents.main.MonthPicker.prototype */
    {
      /**
       * Fired when the user selects a month (space/enter/click).
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
  const PAGE_SIZE = 12; // Total months on a single page

  const ROW_SIZE = 3; // Months per row (4 rows of 3 months each)

  /**
   * Month picker component.
   *
   * @class
   *
   * Displays months which can be selected.
   *
   * @constructor
   * @author SAP SE
   * @alias sap.ui.webcomponents.main.MonthPicker
   * @extends CalendarPart
   * @tagname ui5-monthpicker
   * @public
   */

  class MonthPicker extends _CalendarPart.default {
    static get metadata() {
      return metadata;
    }

    static get template() {
      return _MonthPickerTemplate.default;
    }

    static get styles() {
      return _MonthPicker.default;
    }

    onBeforeRendering() {
      this._buildMonths();
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
          disabled: isDisabled,
          classes: "ui5-mp-item"
        };

        if (isSelected) {
          month.classes += " ui5-mp-item--selected";
        }

        if (isDisabled) {
          month.classes += " ui5-mp-item--disabled";
        }

        const quarterIndex = parseInt(i / ROW_SIZE);

        if (months[quarterIndex]) {
          months[quarterIndex].push(month);
        } else {
          months[quarterIndex] = [month];
        }
      }

      this._months = months;
    }

    onAfterRendering() {
      if (!this._hidden) {
        this.focus();
      }
    }

    _onkeydown(event) {
      let preventDefault = true;

      if ((0, _Keys.isEnter)(event)) {
        this._selectMonth(event);
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
        this._setTimestamp(parseInt(this._months[0][0].timestamp)); // first month of first row

      } else if ((0, _Keys.isEndCtrl)(event)) {
        this._setTimestamp(parseInt(this._months[PAGE_SIZE / ROW_SIZE - 1][ROW_SIZE - 1].timestamp)); // last month of last row

      } else {
        preventDefault = false;
      }

      if (preventDefault) {
        event.preventDefault();
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
     * Modifies timestamp by a given amount of months and, if necessary, loads the prev/next page
     * @param amount
     * @private
     */


    _modifyTimestampBy(amount) {
      // Modify the current timestamp
      this._safelyModifyTimestampBy(amount, "month"); // Notify the calendar to update its timestamp


      this.fireEvent("navigate", {
        timestamp: this.timestamp
      });
    }

    _onkeyup(event) {
      if ((0, _Keys.isSpace)(event)) {
        this._selectMonth(event);
      }
    }
    /**
     * User clicked with the mouser or pressed Enter/Space
     * @param event
     * @private
     */


    _selectMonth(event) {
      event.preventDefault();

      if (event.target.className.indexOf("ui5-mp-item") > -1) {
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
      return this._calendarDate.getYear() !== this._minDate.getYear();
    }
    /**
     * Called from Calendar.js
     * @protected
     */


    _hasNextPage() {
      return this._calendarDate.getYear() !== this._maxDate.getYear();
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

    _isOutOfSelectableRange(date, minDate, maxDate) {
      const month = date.getMonth();
      const year = date.getYear();
      const minYear = minDate.getYear();
      const minMonth = minDate.getMonth();
      const maxYear = maxDate.getYear();
      const maxMonth = maxDate.getMonth();
      return year < minYear || year === minYear && month < minMonth || year > maxYear || year === maxYear && month > maxMonth;
    }

  }

  MonthPicker.define();
  var _default = MonthPicker;
  _exports.default = _default;
});