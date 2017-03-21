/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.CalendarWeekInterval.
sap.ui.define(['jquery.sap.global', 'sap/ui/unified/calendar/CalendarUtils', 'sap/ui/unified/calendar/CalendarDate', './library',
		'sap/ui/unified/CalendarDateInterval', 'sap/ui/unified/CalendarDateIntervalRenderer'],
	function (jQuery, CalendarUtils, CalendarDate, library, CalendarDateInterval, CalendarDateIntervalRenderer) {
		"use strict";

		/*
		 * Inside the CalendarWeekInterval CalendarDate objects are used. But in the API JS dates are used.
		 * So conversion must be done on API functions.
		 */

		/**
		 * Constructor for a new <code>CalendarWeekInterval</code>.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * Week date interval for the purpose of WeekView. This control is private and is meant for usage by
		 * sap.m.PlanningCalendar.
		 * Week view is almost the same as days view except the days interval (7 days) and navigation logic.
		 *
		 * Navigation logic via keyboard allows for week switch if next available day is outside visible area. In this case
		 * once the week is switched, the focus is moved to the previous/next day.  For example, if 21st is the start date
		 * for given week(11-17) and it is focused by the keyboard, then arrow left is pressed, this will switch the week (4-10)
		 * and the focused date would be 10. Respectively if the focused date is 17 and arrow right is pressed, then this will
		 * switch the week to 18-24 and the focused date would be 18.
		 *
		 * Navigation via previous and forward buttons switches the week one before/after and remains the focus at the same
		 * week day as before the switch.
		 *
		 * Navigation via month picker switches to the beginning of the week where the first date of this month is.
		 *
		 * Navigation via year picker switches to the beginning of the same week, but in the chosen year.
		 *
		 * @extends sap.ui.unified.CalendarDateInterval
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.44.0
		 * @alias sap.ui.unified.CalendarWeekInterval
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var CalendarWeekInterval = CalendarDateInterval.extend("CalendarWeekInterval", /** @lends sap.ui.unified.CalendarWeekInterval.prototype */  {
			renderer: CalendarDateIntervalRenderer
		});

		/**
		 * Enables month names to be concatenated in the switch month's button when both months are visible
		 * @returns {number} the number of days
		 * @private
		 */
		CalendarWeekInterval.prototype._getDaysLarge = function () {
			return 6;
		};

		/**
		 * Handles focusing on a certain date.
		 * Special handling is needed if the navigation refers to date that is outside the visible area.
		 * @param oEvent
		 * @private
		 */
		CalendarWeekInterval.prototype._handleFocus = function (oEvent) {
			var bOutsideBorder = !!oEvent.getParameter("_outsideBorder"),
				oDate, oFirstWeekDate, oDatesRow;

			if (bOutsideBorder) {
				oDate = oEvent.getParameter("date");
				//Before the new(previous/next) week is rendered, this date is outside visible area. Save it, so it can be
				//focused after week rendering. See function _focusDateExtend.
				this._oFocusDateWeek = CalendarDate.fromLocalJSDate(oDate);
				oFirstWeekDate = CalendarUtils._getFirstDateOfWeek(this._oFocusDateWeek);
				oDatesRow = this.getAggregation("month")[0];

				if (oDatesRow.getDomRef()) {//switch/render the new week
					this._setStartDate(oFirstWeekDate, false, true);
				}
			}
			return CalendarDateInterval.prototype._handleFocus.apply(this, arguments);
		};

		/**
		 * Overrides the Calendar#_adjustFocusedDateUponMonthChange function.
		 * Basically does the following:
		 * - get the week for the 1st date of the chosen month
		 * - obtains the 1st day of the week above
		 * - sets this date as both start date and focused date
		 * @param {sap.ui.unified.calendar.CalendarDate} oFocusedDate the focused date that this function will adjust
		 * @param {number} iChosenMonth the new month (0-based)
		 * @private
		 */
		CalendarWeekInterval.prototype._adjustFocusedDateUponMonthChange = function (oFocusedDate, iChosenMonth) {
			var oNextMonth = new CalendarDate(oFocusedDate),
				bIsTheNextMonthVisibleAsWell;

			oNextMonth.setDate(1);
			oNextMonth.setMonth(oNextMonth.getMonth() + 1);
			bIsTheNextMonthVisibleAsWell = this._oPlanningCalendar._dateMatchesVisibleRange(oNextMonth.toLocalJSDate(), sap.ui.unified.CalendarIntervalType.Week);

			//handle the border-case where end of the month and begin of the next month
			if (bIsTheNextMonthVisibleAsWell && iChosenMonth === oNextMonth.getMonth()) {//this is already calculated
				return;
			}
			oFocusedDate.setMonth(iChosenMonth);
			oFocusedDate.setDate(1);

			var oFirstWeekDate = CalendarUtils._getFirstDateOfWeek(oFocusedDate);
			this._setStartDate(oFirstWeekDate, false, true);//renders new week according to the start date

			this._oFocusDateWeek = oFirstWeekDate;
			oFocusedDate.setYear(oFirstWeekDate.getYear());
			oFocusedDate.setMonth(oFirstWeekDate.getMonth());
			oFocusedDate.setDate(oFirstWeekDate.getDate());
		};

		/**
		 * Overrides the Calendar#_adjustFocusedDateUponYearChange function.
		 * @param {sap.ui.unified.calendar.CalendarDate} oFocusedDate the focused date that this function will adjust
		 * @param {number} iChosenYear The new year
		 * @desc The purpose of this function is the following:
		 * 1. Takes the same week of the chosen year (as the passed focused date refers to its own year)
		 * 2. Calculates its first day in order to display the correct viewport according to the week of interest
		 * 3. Sets this date as both start date and focused date
		 * @private
		 */
		CalendarWeekInterval.prototype._adjustFocusedDateUponYearChange = function(oFocusedDate, iChosenYear) {
			if (!(oFocusedDate && oFocusedDate instanceof CalendarDate)) {
				return;
			}

			var oWeekNumber = CalendarUtils._getWeek(oFocusedDate),
				oTempFocusedDate = new CalendarDate(oFocusedDate),
				oNewWeekNumber;

			//Start one week before and find the first date that is sharing the same week as the current
			oTempFocusedDate.setYear(iChosenYear);
			oTempFocusedDate.setDate(oTempFocusedDate.getDate() - 7);
			oNewWeekNumber = CalendarUtils._getWeek(oTempFocusedDate);

			if (oWeekNumber.week === 52 && CalendarUtils._getNumberOfWeeksForYear(iChosenYear) < 53) {
				/**
				 * When we try to navigate from 53rd week of the year to year that don't have 53 weeks in it
				 * always navigate to the last (52nd) week of the target year
				 */
				oWeekNumber.week = 51;
			}

			while (oWeekNumber.week !== oNewWeekNumber.week) {
				oTempFocusedDate.setDate(oTempFocusedDate.getDate() + 1);
				oNewWeekNumber = CalendarUtils._getWeek(oTempFocusedDate);
			}

			oFocusedDate.setYear(oTempFocusedDate.getYear());
			oFocusedDate.setMonth(oTempFocusedDate.getMonth());
			oFocusedDate.setDate(oTempFocusedDate.getDate());

		};

		/**
		 * Overrides the Calendar#_focusDateExtend in order to handle focused date in a custom way.
		 *
		 * This function checks for special focus date (set by others) in order to focus this particular date.
		 * Otherwise it delegates the processing to the parent.
		 *
		 * @param {sap.ui.unified.calendar.CalendarDate} oDate the date to focus
		 * @param {boolean} bOtherMonth determines whether the function is called due navigation outside the visible
		 * date range
		 * @param {boolean} bNoEvent hint to skip firing <code>startDateChange</code> event. If true, the parent is supposed
		 * to take care for firing.
		 * @returns {boolean} whether the parent should fire the <code>startDateChange</code> event.
		 * @private
		 */
		CalendarWeekInterval.prototype._focusDateExtend = function (oDate, bOtherMonth, bNoEvent) {
			var oDatesRow, oLocalFocusDate;

			if (!this._oFocusDateWeek) {
				return CalendarDateInterval.prototype._focusDateExtend.apply(this, arguments);
			}

			oDatesRow = this.getAggregation("month")[0];
			oLocalFocusDate = this._oFocusDateWeek.toLocalJSDate();

			this._setFocusedDate(this._oFocusDateWeek);//just a setter
			oDatesRow.setDate(oLocalFocusDate);//really focus the given date

			this._oFocusDateWeek = null;

			return !bNoEvent;

		};

		/**
		 *
		 * @param {Date} oDateTime a JavaScript Date (datetime). As CalendarWeekInterval works with dates (no time info),
		 * the time part of the oDateTime is not considered during comparison.
		 * @return {boolean} true if the given parameter matches the range between startDate (inclusive) and a date
		 * that is CalendarWeekInterval.getDays() later(exclusive)
		 * @private
		 */
		CalendarWeekInterval.prototype._dateMatchesVisibleRange = function(oDateTime) {
			var iIntervals = this.getDays(),
				oDate = CalendarDate.fromLocalJSDate(oDateTime),
				oStartDate = CalendarDate.fromLocalJSDate(this.getStartDate()),
				oEndDate = CalendarDate.fromLocalJSDate(this.getStartDate());

			oEndDate.setDate(oEndDate.getDate() + iIntervals);

			return oDate.isSameOrAfter(oStartDate) && oDate.isBefore(oEndDate);
		};

		return CalendarWeekInterval;

	}, /* bExport= */ true);
