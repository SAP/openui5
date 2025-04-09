/*!
 * ${copyright}
 */

// Provides class sap.ui.unified.calendar.YearRangePicker
sap.ui.define([
	"./YearPicker",
	"./YearRangePickerRenderer",
	"./CalendarDate",
	"./CalendarUtils",
	"sap/ui/thirdparty/jquery"
],
	function(
		YearPicker,
		YearRangePickerRenderer,
		CalendarDate,
		CalendarUtils,
		jQuery
	) {
	"use strict";

	/**
	 * Constructor for a new <code>YearRangePicker</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Renders a <code>YearPicker</code> with <code>ItemNavigation</code>.
	 *
	 * <b>Note:</b> This control is used inside the calendar and is not meant for
	 * standalone usage.
	 *
	 * The control is related to the <code>YearPicker</code> control through a
	 * <code>sap.ui.unified.Calendar</code> instance.
	 *
	 * The default value of the <code>rangeSize</code> property should be equal to the
	 * default value of the <code>years</code> property in <code>YearPicker</code>.
	 *
	 * As in all date-time controls, all public JS Date objects that are given
	 * (<code>setDate()</code>) or read (<code>getFirstRenderedDate</code>) have values
	 * which are considered as date objects in browser (local) timezone.
	 * @extends sap.ui.unified.calendar.YearPicker
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.74.0
	 * @alias sap.ui.unified.calendar.YearRangePicker
	 */
	var YearRangePicker = YearPicker.extend("sap.ui.unified.calendar.YearRangePicker", /** @lends sap.ui.unified.calendar.YearRangePicker.prototype */  { metadata: {
			library : "sap.ui.unified",
			properties : {
				/**
				 * Number of displayed years
				 *
				 */
				years : {type : "int", group : "Appearance", defaultValue : 9},
				/**
				 * Number of years in each row
				 *
				 * 0 means just to have all years in one row, independent of the number
				 */
				columns : {type : "int", group : "Appearance", defaultValue : 3},
				/**
				 * Number of years in each range
				 *
				 * <b>Note:</b> 20 is the default value for number of years in YearPicker
				 */
				rangeSize: {type : "int", group : "Appearance", defaultValue: 20}
			}
		},
		renderer: YearRangePickerRenderer
	});

	/**
	 * Sets a date.
	 * @param {object} oRangeMidDate a date instance
	 * @return {this} <code>this</code> for method chaining
	 */
	YearRangePicker.prototype.setDate = function(oRangeMidDate){
		var oCalDate, iYear, iYears, oFirstDate, iHalfRange;

		// check the given object if it's a JS Date object
		// null is a default value so it should not throw error but set it instead
		oRangeMidDate && CalendarUtils._checkJSDateObject(oRangeMidDate);

		iYear = oRangeMidDate.getFullYear();
		CalendarUtils._checkYearInValidRange(iYear);

		oCalDate = CalendarDate.fromLocalJSDate(oRangeMidDate, this._getPrimaryCalendarType());
		oCalDate.setMonth(0, 1);

		this.setProperty("date", oRangeMidDate);
		/**
		 * @deprecated As of version 1.34
		 */
		this.setProperty("year", oCalDate.getYear());
		this._oDate = oCalDate;

		iYears = this.getYears();
		iHalfRange = Math.floor(iYears / 2);
		oFirstDate = new CalendarDate(this._oDate, this._getPrimaryCalendarType());
		oFirstDate = this._checkFirstDate(oFirstDate);

		this._iSelectedIndex = iHalfRange;
		this.setProperty("_middleDate", oFirstDate);

		return this;
	};

	/**
	* @param {sap.ui.unified.calendar.CalendarDate} oDate The date to be checked whether it is outside min and max date
	* @return {sap.ui.unified.calendar.CalendarDate} The checked date or min or max date if the checked one is outside
	* @private
	*/
	YearRangePicker.prototype._checkFirstDate = function(oDate){

		// check if first date is outside of min and max date
		var iYears = this.getYears();
		var oMaxStartYear = new CalendarDate(this._oMaxDate, this._getPrimaryCalendarType());
		const iPageSize = iYears * this.getRangeSize();

		if (!oMaxStartYear.isSame(CalendarUtils._maxDate(this._getPrimaryCalendarType()))) {
			return oDate;
		}

		if (this.getColumns() % 2 === 0) {
			oMaxStartYear.setYear(oMaxStartYear.getYear() - iPageSize / 2 + 1);
		} else {
			Math.floor(iYears / 2) * this.getRangeSize() + 1 - Math.floor(this.getRangeSize() / 2);
		}

		if (oDate.isAfter(oMaxStartYear) && oDate.getYear() != oMaxStartYear.getYear()) {
			oDate = new CalendarDate(oMaxStartYear, this._getPrimaryCalendarType());
			oDate.setMonth(0, 1);
		} else if (oDate.isBefore(this._oMinDate) && oDate.getYear() != this._oMinDate.getYear()) {
			oDate = new CalendarDate(this._oMinDate, this._getPrimaryCalendarType());
			oDate.setMonth(0, 1);
		}

		return oDate;

	};

	YearRangePicker.prototype._updatePage = function (bForward, iSelectedIndex, bFireEvent){

		const aDomRefs = this._oItemNavigation.getItemDomRefs();
		const oFirstDateInCurrentPage = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(aDomRefs[0].getAttribute("data-sap-year-start")), this._getPrimaryCalendarType());
		const iYears = this.getYears();
		const iYearRangeSize = this.getRangeSize();
		const oFirstDateInNextPage = new CalendarDate(oFirstDateInCurrentPage, this._getPrimaryCalendarType());
		const iPageSize = iYears * iYearRangeSize;
		const iHalfYearForPage = this.getColumns() % 2 === 0 ? iPageSize / 2 :  Math.floor(iYears / 2) * iYearRangeSize + Math.floor(iYearRangeSize / 2);
		let oMiddleDateInNextPage;

		if (bForward) {
			const oMaxDate = new CalendarDate(this._oMaxDate, this._getPrimaryCalendarType());
			oMaxDate.setYear(oMaxDate.getYear() - iPageSize + 1);
			if (oFirstDateInCurrentPage.isBefore(oMaxDate)) {

				oFirstDateInNextPage.setYear(oFirstDateInCurrentPage.getYear() + iPageSize);
				const oLastDateInNextPage = new CalendarDate(oFirstDateInNextPage, this._getPrimaryCalendarType());
				oLastDateInNextPage.setYear(oFirstDateInNextPage.getYear() + iPageSize);

				if (oLastDateInNextPage.isAfter(oMaxDate)) {
					oFirstDateInNextPage.setYear(oMaxDate.getYear());
				}
				oMiddleDateInNextPage = new CalendarDate(oFirstDateInNextPage, this._getPrimaryCalendarType());
				oMiddleDateInNextPage.setYear(oFirstDateInNextPage.getYear() + iHalfYearForPage);
			} else {
				return;
			}
		} else {
			if (oFirstDateInCurrentPage.isAfter(this._oMinDate)) {
				const oMinDate = new CalendarDate(this._oMinDate, this._getPrimaryCalendarType());

				oFirstDateInNextPage.setYear(oFirstDateInCurrentPage.getYear() -  iPageSize);
				if (oFirstDateInNextPage.isBefore(oMinDate)) {
					oFirstDateInNextPage.setYear(oMinDate.getYear());
				}
				oMiddleDateInNextPage = new CalendarDate(oFirstDateInNextPage, this._getPrimaryCalendarType());
				oMiddleDateInNextPage.setYear(oFirstDateInNextPage.getYear() + iHalfYearForPage);
			} else {
				return;
			}
		}

		this._iSelectedIndex = iSelectedIndex;
		this.setProperty("_middleDate", oMiddleDateInNextPage);

		if (bFireEvent) {
			this.firePageChange();
		}
	};

	YearRangePicker.prototype._checkDateEnabled = function(oFirstDate, oSecondDate){

		if (CalendarUtils._isBetween(this._oMinDate, oFirstDate, oSecondDate, true) ||
			CalendarUtils._isBetween(this._oMaxDate, oFirstDate, oSecondDate, true) ||
			this._oMinDate.isBefore(oFirstDate) && this._oMaxDate.isAfter(oSecondDate)) {
			return true;
		}

		return false;

	};

	YearRangePicker.prototype._selectYear = function(iIndex) {
		var aDomRefs = this._oItemNavigation.getItemDomRefs(),
			$DomRef = jQuery(aDomRefs[iIndex]),
			sYyyymmdd = $DomRef.attr("data-sap-year-start"),
			oDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(sYyyymmdd), this._getPrimaryCalendarType());

		if ($DomRef.hasClass("sapUiCalItemDsbl")) {
			return false; // don't select disabled items
		}

		this.setProperty("date", oDate.toLocalJSDate());
		/**
		 * @deprecated As of version 1.34
		 */
		this.setProperty("year", oDate.getYear());

		return true;
	};

	/**
	 * Determines if any of the <code>selectedDates</code> fall within a given year range.
	 * <b>Note:</b> If <code>intervalSelection</code> is set to <code>true</code>, the range is selected if it contains the start or end of the interval.
	 *
	 * @private
	 * @override
	 * @param {sap.ui.unified.calendar.CalendarDate} oCurrentYearRangeStart First date of the year range
	 * @returns {boolean} Returns <code>true</code> if the current year range contains any selected dates
	 */
	YearRangePicker.prototype._isYearSelected = function(oCurrentYearRangeStart) {
		const aSelectedDateRanges = this.getSelectedDates();
		const bShowInterval = this._getShowSelectedRange();

		if (!(aSelectedDateRanges && aSelectedDateRanges.length)) {
			return false;
		}

		const oCurrentYearRangeEnd = new CalendarDate(oCurrentYearRangeStart, this.getPrimaryCalendarType());
		oCurrentYearRangeEnd.setYear(oCurrentYearRangeEnd.getYear() + this.getRangeSize() - 1);
		oCurrentYearRangeEnd.setMonth(0, 1);

		const oDateRange = aSelectedDateRanges[0];
		const oStartDate = oDateRange.getStartDate();
		const oEndDate = oDateRange.getEndDate();

		if (bShowInterval && oStartDate && oEndDate) {

			const oCalStartDate = CalendarDate.fromLocalJSDate(oStartDate, this._getPrimaryCalendarType());
			oCalStartDate.setMonth(0, 1);

			const oCalEndDate = CalendarDate.fromLocalJSDate(oEndDate, this._getPrimaryCalendarType());
			oCalEndDate.setMonth(0, 1);

			return CalendarUtils._isBetween(oCalStartDate, oCurrentYearRangeStart, oCurrentYearRangeEnd, true) ||
				CalendarUtils._isBetween(oCalEndDate, oCurrentYearRangeStart, oCurrentYearRangeEnd, true);
		}

		const fnHasDateInRange = (oDateRange) => {
			const oStartDate = oDateRange.getStartDate();

			if (!oStartDate) {
				return false;
			}

			const oCalStartDate = CalendarDate.fromLocalJSDate(oStartDate, this._getPrimaryCalendarType());
			oStartDate.setMonth(0, 1);

			if (CalendarUtils._isBetween(oCalStartDate, oCurrentYearRangeStart, oCurrentYearRangeEnd, true)) {
				return true;
			}

			return false;
		};

		if (this.getProperty("_singleSelection")) {
			return fnHasDateInRange(oDateRange);
		}

		return aSelectedDateRanges.some(fnHasDateInRange);
	};

	/**
	 * Calculates the first and last displayed date about a given year range.
	 * @param {sap.ui.unified.CalendarDate} oDate the year about which the dates are calculated
	 * @returns {object} two values - start and end date
	 */
	YearRangePicker.prototype._getDisplayedSecondaryDates = function(oDate){
		var sSecondaryCalendarType = this.getSecondaryCalendarType(),
			oFirstDate = new CalendarDate(oDate, oDate.getCalendarType()),
			oLastDate = new CalendarDate(oDate, oDate.getCalendarType());

		oFirstDate.setMonth(0, 1);
		oFirstDate = new CalendarDate(oFirstDate, sSecondaryCalendarType);

		oLastDate.setYear(oLastDate.getYear() + this.getRangeSize()); // create first day of next year range
		oLastDate.setMonth(0, 1);
		oLastDate.setDate(oLastDate.getDate() - 1); // go back one day to receive last day in previous year range
		oLastDate = new CalendarDate(oLastDate, sSecondaryCalendarType);

		return {start: oFirstDate, end: oLastDate};
	};

	YearRangePicker.prototype.setSecondaryCalendarType = function(sCalendarType){
		this.setProperty("secondaryCalendarType", sCalendarType);
		if (this._getSecondaryCalendarType()) {
			this.setColumns(2);
			this.setYears(8);
			this.setRangeSize(8);
		}
		return this;
	};

	return YearRangePicker;

});
