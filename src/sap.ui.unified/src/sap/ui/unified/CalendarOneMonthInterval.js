/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.CalendarOneMonthInterval.
sap.ui.define([
	'sap/ui/unified/calendar/CustomMonthPicker',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/Calendar',
	'./library',
	'sap/ui/unified/CalendarDateInterval',
	'sap/ui/unified/calendar/OneMonthDatesRow',
	"sap/ui/unified/DateRange",
	"./CalendarOneMonthIntervalRenderer"
], function(
	CustomMonthPicker,
	CalendarUtils,
	CalendarDate,
	Calendar,
	library,
	CalendarDateInterval,
	OneMonthDatesRow,
	DateRange,
	CalendarOneMonthIntervalRenderer
) {
		"use strict";

		/*
		 * Inside the CalendarOneMonthInterval CalendarDate objects are used. But in the API JS dates are used.
		 * So conversion must be done on API functions.
		 */

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
		 */
		var CalendarOneMonthInterval = CalendarDateInterval.extend("sap.ui.unified.CalendarOneMonthInterval", /** @lends sap.ui.unified.CalendarOneMonthInterval.prototype */  {
		});

		CalendarOneMonthInterval.prototype.init = function() {
			CalendarDateInterval.prototype.init.apply(this, arguments);
			this._bShowOneMonth = true;
		};

		CalendarOneMonthInterval.prototype._getCalendarPicker = function (){
			var oCalPicker = this.getAggregation("calendarPicker");

			if (!oCalPicker) {
				oCalPicker = new CustomMonthPicker(this.getId() + "--Cal");
				oCalPicker.setPopupMode(true);

				oCalPicker.attachEvent("select", function () {
					var oCalPicker = this._getCalendarPicker(),
						oCalPickerFocusedDate = oCalPicker._getFocusedDate(),
						oNewStartDate = CalendarUtils._getFirstDateOfMonth(oCalPickerFocusedDate);
					var oOneMonthDateRow = this.getAggregation("month")[0];

					this._setStartDate(oNewStartDate);

					if (oOneMonthDateRow.getMode() < 2) {
						oNewStartDate = this._getStartDate();
					}

					this._adjustSelectedDate(oNewStartDate);
					this._oFocusDateOneMonth = oNewStartDate;
					this._closeCalendarPicker(true);// true means do not focus, as we set the this._oFocusDateOneMonth and focus will happen in .focusDateExtend
					this._focusDate(oCalPickerFocusedDate, false, true); //true means don't fire event (we already did it in setStartDate())
				}, this);
				oCalPicker.attachEvent("cancel", function (oEvent) {
					var oCalPicker = this._getCalendarPicker(),
						oCalPickerFocusedDate = oCalPicker._getFocusedDate();

					this._closeCalendarPicker(true);
					this._oFocusDateOneMonth = oCalPickerFocusedDate;
					// true means do not focus, as we set the this._oFocusDateOneMonth and focus will happen in .focusDateExtend
					this._focusDate(oCalPickerFocusedDate, true);
					var oDomRefB1 = this.getAggregation("header").getDomRef("B1");
					if (oDomRefB1) {
						oDomRefB1.focus();
					}
				}, this);
				this.setAggregation("calendarPicker", oCalPicker);
			}
			return oCalPicker;
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
		* @param {Object} oEvent The fired event
		* @private
		*/
		CalendarOneMonthInterval.prototype._handleFocus = function (oEvent) {
			var bOutsideVisibleArea = !!oEvent.getParameter("_outsideBorder"),
				oDateTime = oEvent.getParameter("date"),
				oCalDate = CalendarDate.fromLocalJSDate(oDateTime),
				oCalStartDate = CalendarDate.fromLocalJSDate(this.getStartDate()),
				bIsOtherMonth = !CalendarUtils._isSameMonthAndYear(oCalDate, oCalStartDate),
				iDays,
				oFocusedDate,
				oStartDate;


			if (bOutsideVisibleArea || bIsOtherMonth) {
				//Before the new(previous/next) month is rendered, this date is outside visible area. The other scenario is keyboard navigation
				//that will result in a day from next/previous month. For both cases we should save it, so it can be
				//focused after (next/previous) month rendering. See function _focusDateExtend.
				if (CalendarUtils._isLastDateInMonth(oCalDate)) {
					this._oFocusDateOneMonth = oCalDate;
				} else {
					this._oFocusDateOneMonth = CalendarUtils._getFirstDateOfMonth(oCalDate);
				}

				//renders previous/next month (the method calls _setStartDate that does the magic)
				iDays = oCalDate.isBefore(oCalStartDate) ?  -1 : 1;
				oFocusedDate = new CalendarDate(this._getFocusedDate(), this.getPrimaryCalendarType());
				oStartDate = new CalendarDate(this._getStartDate(), this.getPrimaryCalendarType());
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
		 * @param {sap.ui.unified.calendar.CalendarDate} oDate the date to focus
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
			oLocalFocusDate = this._oFocusDateOneMonth.toLocalJSDate();

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
		 * @param {sap.ui.unified.calendar.CalendarDate} oStartDate start date
		 * @param {sap.ui.unified.calendar.CalendarDate} oFocusedDate focused date
		 * @param {int} iDays number of days to shift. Positive values will shift forward, negative - backward.
		 * It's used only for determine the shift direction. Shift amount is always one month.
		 * @private
		 */
		CalendarOneMonthInterval.prototype._shiftStartFocusDates = function (oStartDate, oFocusedDate, iDays) {
			var iShiftAmount = iDays,
				oOneMonthDateRow = this.getAggregation("month")[0],
				oLocalStartDate,
				oSelectedDate;

			if (iShiftAmount !== 0){
				iShiftAmount = iShiftAmount > 0 ? 1 : -1;
			}

			oStartDate.setMonth(oStartDate.getMonth() + iShiftAmount);

			oFocusedDate.setYear(oStartDate.getYear());
			//BCP: 002075129400005182132018
			//setting separately month and date afterwards could lead to not needed shifting of the month
			oFocusedDate.setMonth(oStartDate.getMonth(), oStartDate.getDate());

			this._setFocusedDate(oFocusedDate);
			this._setStartDate(oStartDate, true);

			//it's already different from oStartDate above
			oLocalStartDate = this.getStartDate();
			oSelectedDate = CalendarDate.fromLocalJSDate(oLocalStartDate, this.getPrimaryCalendarType());

			if (this.getMinDate() && this.getMinDate().getTime() > oLocalStartDate.getTime()) {
				oSelectedDate = CalendarDate.fromLocalJSDate(this.getMinDate(), this.getPrimaryCalendarType());
			}

			if (this.getMaxDate() && this.getMaxDate().getTime() < oLocalStartDate.getTime()) {
				oSelectedDate = CalendarDate.fromLocalJSDate(this.getMaxDate(), this.getPrimaryCalendarType());
			}

			oOneMonthDateRow.selectDate(oSelectedDate.toLocalJSDate());//TODO old behavior worked with UTC date set on public api
			if (oOneMonthDateRow.getMode() < 2) {
				this.fireSelect();
			}
		};

		/**
		 * Sets the selection to match the focused date for size S and M.
		 * @param {sap.ui.unified.calendar.CalendarDate} oSelectDate The date to select unless bUseFirstOfMonth is used
		 * @private
		 */
		CalendarOneMonthInterval.prototype._adjustSelectedDate = function(oSelectDate) {
			var oMonth = this.getAggregation("month")[0];

			if (oMonth.getMode && oMonth.getMode() < 2) {
				this._selectDate(oSelectDate);
			}
		};

		/**
		 * Sets the selection.
		 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date to be selected
		 * @private
		 */
		CalendarOneMonthInterval.prototype._selectDate = function(oDate) {
			var oMonth = this.getAggregation("month")[0],
				oLocaleDate = oDate.toLocalJSDate();

			this.removeAllSelectedDates();
			this.addSelectedDate(new DateRange({startDate: oLocaleDate}));
			oMonth.selectDate(oLocaleDate);
			this._bDateRangeChanged = undefined;
		};

		/**
		 * Called by PlanningCalendar to check if the given datetime matches the visible dates.
		 * @param {Date} oDateTime The JavaScript date to be checked
		 * @return {boolean} Whether the given datetime is one of the visible dates
		 * @private
		 */
		CalendarOneMonthInterval.prototype._dateMatchesVisibleRange = function (oDateTime) {
			return CalendarUtils._isSameMonthAndYear(CalendarDate.fromLocalJSDate(this.getStartDate()),
				CalendarDate.fromLocalJSDate(oDateTime));
		};

		CalendarOneMonthInterval.prototype._togglePrevNext = function(oDate, bCheckMonth) {
			var oHeader = this.getAggregation("header");
			var iYearMax = this._oMaxDate.getYear();
			var iYearMin = this._oMinDate.getYear();
			var iMonthMax = this._oMaxDate.getMonth();
			var iMonthMin = this._oMinDate.getMonth();
			var oFirstOfMonth = CalendarUtils._getFirstDateOfMonth(oDate);
			var oFirstOfNextMonth = new CalendarDate(oFirstOfMonth),
				iYear, iMonth;
			oFirstOfNextMonth.setMonth(oFirstOfNextMonth.getMonth() + 1);

			iYear = oFirstOfMonth.getYear();
			iMonth = oFirstOfMonth.getMonth();

			if (iYear < iYearMin
				|| (iYear == iYearMin && (!bCheckMonth || iMonth <= iMonthMin))) {
				oHeader.setEnabledPrevious(false);
			} else {
				oHeader.setEnabledPrevious(true);
			}

			iYear = oFirstOfNextMonth.getYear();
			iMonth = oFirstOfNextMonth.getMonth();

			if (iYear > iYearMax
				|| (iYear == iYearMax && (!bCheckMonth || iMonth > iMonthMax))) {
				oHeader.setEnabledNext(false);
			} else {
				oHeader.setEnabledNext(true);
			}
		};

		CalendarOneMonthInterval.prototype._setMinMaxDateExtend = function(oDate) {
			return Calendar.prototype._setMinMaxDateExtend.apply(this, arguments);
		};

		return CalendarOneMonthInterval;

	});