/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.CalendarOneMonthInterval.
sap.ui.define(['jquery.sap.global', 'sap/ui/unified/calendar/CalendarUtils', 'sap/ui/core/date/UniversalDate', './library',
		'sap/ui/unified/CalendarDateInterval', 'sap/ui/unified/CalendarDateIntervalRenderer'],
	function (jQuery, CalendarUtils, UniversalDate, library, CalendarDateInterval, CalendarDateIntervalRenderer) {
		"use strict";

		/**
		 * Constructor for a new <code>CalendarOneMonthInterval</code>.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * OneMonth date interval for the purpose of 'OneMonth' view. This control is private and is meant for usage by
		 * sap.m.PlanningCalendar.
		 * OneMonth view is almost the same as days view except the days interval (31 days) and navigation logic.
		 *
		 * Navigation logic via keyboard allows for month switch if next available day is outside visible area. For example,
		 * if 1st is the start date for given month and it is focused by the keyboard, then arrow left is pressed, this
		 * will switch to the previous month, starting from 1st and the focused date would be the last day of the 31 days
		 * interval. Respectively if the focused date is the last one and arrow right is pressed, then this will switch
		 * the month to the next one and the focused date would be 1st.
		 *
		 * Navigation via previous and forward buttons switches the month before/after.
		 *
		 * Navigation via month picker switches to the beginning of the corresponding month.
		 *
		 * Navigation via year picker switches to the corresponding year and the same month as before the navigation.
		 *
		 * @extends sap.ui.unified.CalendarDateInterval
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.46.0
		 * @alias sap.ui.unified.CalendarOneMonthInterval
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var CalendarOneMonthInterval = CalendarDateInterval.extend("CalendarOneMonthInterval", /** @lends sap.ui.unified.CalendarOneMonthInterval.prototype */  {
			renderer: CalendarDateIntervalRenderer
		});

		CalendarOneMonthInterval.prototype.init = function() {
			CalendarDateInterval.prototype.init.apply(this, arguments);
			this._bShowOneMonth = true;
		};

		/**
		* Handles focusing on a certain date.
		* Special handling is needed if the navigation refers to date that is outside the visible area.
		* @param oEvent
		* @private
		*/
		CalendarOneMonthInterval.prototype._handleFocus = function (oEvent) {
			var bOutsideBorder = !!oEvent.getParameter("_outsideBorder"),
				oDate;

			if (bOutsideBorder) {
				oDate = oEvent.getParameter("date");
				//Before the new(previous/next) month is rendered, this date is outside visible area. Save it, so it can be
				//focused after month rendering. See function _focusDateExtend.
				var oUniversalDate = CalendarUtils._createUniversalUTCDate(oDate);

				if (this._isDateLastInMonth(oUniversalDate)) {
					this._oFocusDateOneMonth = oUniversalDate;
				} else {
					this._oFocusDateOneMonth = CalendarUtils.getFirstDateOfMonth(oUniversalDate);
				}

				if (oDate.getTime() < this.getStartDate().getTime()) {
					this._handlePrevious();
				} else {
					this._handleNext();
				}
			}
			return CalendarDateInterval.prototype._handleFocus.apply(this, arguments);
		};

		/**
		 * Checks in UTC mode if the corresponding date is last in a month, needed for further navigation.
		 * @param {UniversalDate}
		 * @returns {boolean} checks if the next date is bigger or not regarding the selected one, needed for navigation
		 * @private
		 */
		CalendarOneMonthInterval.prototype._isDateLastInMonth = function(oDate) {
			var oNextDay = new Date(oDate.getTime() + 24 * 60 * 60 * 1000);

			return oNextDay.getUTCDate() < oDate.getUTCDate();
		};

		/**
		 * Overrides the Calendar#_focusDateExtend in order to handle focused date in a custom way.
		 *
		 * This function checks for special focus date (set by others) in order to focus this particular date.
		 * Otherwise it delegates the processing to the parent.
		 *
		 * @param {Date} oDate the date to focus
		 * @param {boolean} bOtherMonth determines whether the function is called due navigation outside the visible
		 * date range
		 * @param {boolean} bNoEvent hint to skip firing <code>startDateChange</code> event. If true, the parent is supposed
		 * to take care for firing.
		 * @returns {boolean} whether the parent should fire the <code>startDateChange</code> event.
		 * @private
		 */
		CalendarOneMonthInterval.prototype._focusDateExtend = function (oDate, bOtherMonth, bNoEvent) {
			var oDatesRow, oLocalFocusDate;

			if (!this._oFocusDateOneMonth) {
				return CalendarDateInterval.prototype._focusDateExtend.apply(this, arguments);
			}

			oDatesRow = this.getAggregation("month")[0];
			oLocalFocusDate = CalendarUtils._createLocalDate(this._oFocusDateOneMonth.getJSDate());

			this._setFocusedDate(this._oFocusDateOneMonth);//just a setter
			oDatesRow.setDate(oLocalFocusDate);//really focus the given date

			this._oFocusDateOneMonth = null;

			return !bNoEvent;
		};

		/**
		 * Overrides the CalendarDateInterval#_shiftStartFocusDates in order to handle the start date in
		 * a _shiftStartFocusDates in a custom way.
		 *
		 * Shifts <code>startDate</code> and focusedDate according to given amount of time.
		 *
		 * @param {sap.ui.core.date.UniversalDate} oStartDate start date
		 * @param {sap.ui.core.date.UniversalDate} oFocusedDate focused date
		 * @param {int} iDays number of days to shift. Positive values will shift forward, negative - backward.
		 * It's used only for determine the shift direction. Shift amount is always one month.
		 * @private
		 */

		CalendarOneMonthInterval.prototype._shiftStartFocusDates = function (oStartDate, oFocusedDate, iDays) {

			var iShiftAmount = iDays;
			if (iShiftAmount !== 0){
				iShiftAmount = iShiftAmount > 0 ? 1 : -1;
			}

			oStartDate.setUTCMonth(oStartDate.getUTCMonth() + iShiftAmount);
			oFocusedDate.getJSDate().setTime(oStartDate.getTime());
			this._setFocusedDate(oFocusedDate);
			this._setStartDate(oStartDate, true);
		};

		return CalendarOneMonthInterval;

	}, /* bExport= */ true);
