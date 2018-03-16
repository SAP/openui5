/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.CalendarWeekInterval.
sap.ui.define(['sap/ui/unified/calendar/CalendarUtils', 'sap/ui/unified/calendar/CalendarDate', './library',
		'sap/ui/unified/CalendarDateInterval', 'sap/ui/unified/CalendarDateIntervalRenderer'],
	function (CalendarUtils, CalendarDate, library, CalendarDateInterval, CalendarDateIntervalRenderer) {
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
		 * once the week is switched, the focus is moved to the previous/next day.  For example, if 11st is the start date
		 * for given week(11-17) and it is focused by the keyboard, then arrow left is pressed, this will switch the week (4-10)
		 * and the focused date would be 10. Respectively if the focused date is 17 and arrow right is pressed, then this will
		 * switch the week to 18-24 and the focused date would be 18.
		 *
		 * Navigation via previous and forward buttons switches the week one before/after and remains the focus at the same
		 * week day as before the switch.
		 *
		 * If the user opens the date picker and selects a date from it (optionally a month and an year) the control will change
		 * its start date to the first date of the same week as the date the user chose.
		 *
		 * @extends sap.ui.unified.CalendarDateInterval
		 * @version ${version}
		 *
		 * @constructor
		 * @private
		 * @since 1.44.0
		 * @alias sap.ui.unified.CalendarWeekInterval
		 */
		var CalendarWeekInterval = CalendarDateInterval.extend("sap.ui.unified.CalendarWeekInterval", /** @lends sap.ui.unified.CalendarWeekInterval.prototype */  {
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
		 * @param {Object} oEvent The fired event
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

		CalendarWeekInterval.prototype._showCalendarPicker = function() {
			var oCalNewFocusDate = this._getFocusedDate(),
				oCalFirstWeekDate = this._getStartDate(),
				oCalPicker = this._getCalendarPicker(),
				oSelectedRange = new sap.ui.unified.DateRange(),
				oCalEndDate;

			oCalEndDate = new CalendarDate(oCalFirstWeekDate);
			oCalEndDate.setDate(oCalEndDate.getDate() + this._getDays() - 1);
			oSelectedRange.setStartDate(oCalFirstWeekDate.toLocalJSDate());
			oSelectedRange.setEndDate(oCalEndDate.toLocalJSDate());

			oCalPicker.displayDate(oCalNewFocusDate.toLocalJSDate(), false);
			oCalPicker.removeAllSelectedDates();
			oCalPicker.addSelectedDate(oSelectedRange);

			oCalPicker.setMinDate(this.getMinDate());
			oCalPicker.setMaxDate(this.getMaxDate());

			this._openPickerPopup(oCalPicker);
			this._showOverlay();
		};

		CalendarWeekInterval.prototype._handleCalendarPickerDateSelect = function(oEvent) {
			var oCalPicker = this._getCalendarPicker(),
				oFocusedDate = oCalPicker._getFocusedDate(),
				oFirstWeekDate;

			if (this._dateMatchesVisibleRange(oFocusedDate.toLocalJSDate())) {
				this._oFocusDateWeek = oCalPicker._getFocusedDate();
				this._focusDate(this._oFocusDateWeek, false, true); // true means no fire startDateChange event (no start date change)
			} else {
				oFirstWeekDate = CalendarUtils._getFirstDateOfWeek(oFocusedDate);

				this._setStartDate(oFirstWeekDate);
				this._oFocusDateWeek = oCalPicker._getFocusedDate();
				this._focusDate(this._oFocusDateWeek, false, true); // true means no fire startDateChange event (we already did it in _setStartDate)
			}

			this._closeCalendarPicker(true);
		};

		return CalendarWeekInterval;

	});
