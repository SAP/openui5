/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.CalendarOneMonthInterval.
sap.ui.define(['jquery.sap.global', 'sap/ui/unified/calendar/CalendarUtils', 'sap/ui/core/date/UniversalDate', './library',
		'sap/ui/unified/CalendarDateInterval', 'sap/ui/unified/CalendarDateIntervalRenderer', 'sap/ui/unified/calendar/OneMonthDatesRow'],
	function (jQuery, CalendarUtils, UniversalDate, library, CalendarDateInterval, CalendarDateIntervalRenderer, OneMonthDatesRow) {
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
		var CalendarOneMonthInterval = CalendarDateInterval.extend("sap.ui.unified.CalendarOneMonthInterval", /** @lends sap.ui.unified.CalendarOneMonthInterval.prototype */  {
			renderer: CalendarDateIntervalRenderer
		});

		CalendarOneMonthInterval.prototype.init = function() {
			CalendarDateInterval.prototype.init.apply(this, arguments);
			this._bShowOneMonth = true;
		};

		/**
		 * Creates a month instance.
		 * @param {string }sId ID of the instance
		 * @returns {sap.m.OneMonthDatesRow} A month instance used by the <code>OneMonth</code> view of a <code>sap.m.PlanningCalendar</code>
		 * @private
		 */
		CalendarOneMonthInterval.prototype._createMonth = function(sId) {
			return new OneMonthDatesRow(sId);
		};

		/**
		* Handles focusing on a certain date.
		* Special handling is needed if the navigation refers to date that is outside the visible area.
		* @param oEvent
		* @private
		*/
		CalendarOneMonthInterval.prototype._handleFocus = function (oEvent) {
			var bOutsideVisibleArea = !!oEvent.getParameter("_outsideBorder"),
				oDate = oEvent.getParameter("date"),
				oUniversalDate = CalendarUtils._createUniversalUTCDate(oDate),
				bIsOtherMonth = CalendarUtils.monthsDiffer(oUniversalDate, CalendarUtils._createUniversalUTCDate(this.getStartDate())),
				iDays,
				oFocusedDate,
				oStartDate;


			if (bOutsideVisibleArea || bIsOtherMonth) {
				oDate = oEvent.getParameter("date");
				//Before the new(previous/next) month is rendered, this date is outside visible area. The other scenario is keyboard navigation
				//that will result in a day from next/previous month. For both cases we should save it, so it can be
				//focused after (next/previous) month rendering. See function _focusDateExtend.
				if (CalendarUtils.isDateLastInMonth(oUniversalDate)) {
					this._oFocusDateOneMonth = oUniversalDate;
				} else {
					this._oFocusDateOneMonth = CalendarUtils.getFirstDateOfMonth(oUniversalDate);
				}

				//renders previous/next month (the method calls _setStartDate that does the magic)
				iDays = oDate.getTime() < this.getStartDate().getTime() ?  -1 : 1;
				oFocusedDate = this._newUniversalDate(this._getFocusedDate());
				oStartDate = this._newUniversalDate(this._getStartDate());
				CalendarDateInterval.prototype._shiftStartFocusDates.call(this, oFocusedDate, oStartDate, iDays);
			}
			return CalendarDateInterval.prototype._handleFocus.apply(this, arguments);
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
			var oOneMonthDatesRow, oLocalFocusDate;

			if (!this._oFocusDateOneMonth) {
				return CalendarDateInterval.prototype._focusDateExtend.apply(this, arguments);
			}

			oOneMonthDatesRow = this.getAggregation("month")[0];
			oLocalFocusDate = CalendarUtils._createLocalDate(this._oFocusDateOneMonth.getJSDate());

			this._setFocusedDate(this._oFocusDateOneMonth);//just a setter
			oOneMonthDatesRow._bNoRangeCheck = true; //as we handle focused date by ourselves we know it is visible. So skip the checks for focusable date
			oOneMonthDatesRow.setDate(oLocalFocusDate);//really focus the given date
			oOneMonthDatesRow._bNoRangeCheck = false;

			/* Planning Calendar is already notified about startDateChange event, so no need to manually update its
			 row's startDate like we previously did  */

			this._oFocusDateOneMonth = null;

			return !bNoEvent;
		};

		/**
		 * Sets the display size to the month aggregation.
		 * @param {int} iMode A size 0-2
		 * @private
		 */
		CalendarOneMonthInterval.prototype._setDisplayMode = function(iMode) {
			this.getAggregation("month")[0].setMode(iMode);
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
			var iShiftAmount = iDays,
				oOneMonthDateRow = this.getAggregation("month")[0];

			if (iShiftAmount !== 0){
				iShiftAmount = iShiftAmount > 0 ? 1 : -1;
			}

			oStartDate.setUTCMonth(oStartDate.getUTCMonth() + iShiftAmount);
			oFocusedDate.getJSDate().setTime(oStartDate.getTime());
			this._setFocusedDate(oFocusedDate);
			this._setStartDate(oStartDate, true);
			oOneMonthDateRow.selectDate(oStartDate.getJSDate());
		};

		CalendarOneMonthInterval.prototype._adjustFocusedDateUponMonthChange = function(oFocusedDate, iMonth) {
			oFocusedDate.setUTCMonth(iMonth);
			if (iMonth != oFocusedDate.getUTCMonth()){
				// day did not exist in this month (e.g. 31) -> go to last day of month
				oFocusedDate.setUTCDate(0);
			}

			this._adjustSelectedDate(oFocusedDate, true);
		};

		CalendarOneMonthInterval.prototype._adjustFocusedDateUponYearChange = function(oFocusedDate, iYear) {
			var oYearPicker = this.getAggregation("yearPicker"),
				oDate = CalendarUtils._createUniversalUTCDate(oYearPicker.getDate(), this.getPrimaryCalendarType());

			oDate.setUTCMonth(oFocusedDate.getUTCMonth(), oFocusedDate.getUTCDate()); // to keep day and month stable also for islamic date
			oFocusedDate = oDate;

			this._adjustSelectedDate(oFocusedDate, true);

			return oFocusedDate;
		};

		/**
		 * Sets the selection to match the focused date for size S and M.
		 * @param {Date|sap.ui.core.date.UniversalDate} oDate The date to select unless bUseFirstOfMonth is used
		 * @param bUseFirstOfMonth If specified the first month of the given date will be used
		 * @private
		 */
		CalendarOneMonthInterval.prototype._adjustSelectedDate = function(oDate, bUseFirstOfMonth) {
			var oMonth = this.getAggregation("month")[0],
				oSelectDate;

			oDate = oDate instanceof UniversalDate ? oDate.getJSDate() : oDate;
			oSelectDate = bUseFirstOfMonth ? CalendarUtils.getFirstDateOfMonth(oDate).getJSDate() : oDate;

			if (oMonth.getMode && oMonth.getMode() < 2) {
				this._selectDate(oSelectDate);
			}
		};

		/**
		 * Sets the selection.
		 * @param oDate JS date object
		 * @private
		 */
		CalendarOneMonthInterval.prototype._selectDate = function(oDate) {
			var oMonth = this.getAggregation("month")[0];

			this.removeAllSelectedDates();
			this.addSelectedDate(new sap.ui.unified.DateRange({startDate:oDate}));
			oMonth.selectDate(oDate);
		};

		CalendarOneMonthInterval.prototype._dateMatchesVisibleRange = function(oDate) {
			return !CalendarUtils.monthsDiffer(this.getStartDate(), oDate);
		};

		return CalendarOneMonthInterval;

	}, /* bExport= */ true);
