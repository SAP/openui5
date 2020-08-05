/*!
 * ${copyright}
 */

// Provides class sap.ui.unified.calendar.YearRangePicker
sap.ui.define([
	"sap/ui/core/Renderer",
	"./YearPicker",
	"./YearRangePickerRenderer",
	"./CalendarDate",
	"sap/ui/core/date/UniversalDate",
	"./CalendarUtils",
	"sap/ui/thirdparty/jquery"
],
	function(
		Renderer,
		YearPicker,
		YearRangePickerRenderer,
		CalendarDate,
		UniversalDate,
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
		}
	});

	/**
	 * Sets a date.
	 * @param {object} oRangeMidDate a JavaScript date
	 * @return {sap.ui.unified.calendar.YearRangePicker} <code>this</code> for method chaining
	 */
	YearRangePicker.prototype.setDate = function(oRangeMidDate){
		var oCalDate, iYear, iYears, oFirstDate;

		// check the given object if it's a JS Date object
		// null is a default value so it should not throw error but set it instead
		oRangeMidDate && CalendarUtils._checkJSDateObject(oRangeMidDate);

		iYear = oRangeMidDate.getFullYear();
		CalendarUtils._checkYearInValidRange(iYear);

		oCalDate = CalendarDate.fromLocalJSDate(oRangeMidDate, this.getPrimaryCalendarType());
		oCalDate.setMonth(0, 1);

		this.setProperty("date", oRangeMidDate, true);
		this.setProperty("year", oCalDate.getYear(), true);
		this._oDate = oCalDate;

		if (this.getDomRef()) {
			iYears = this.getYears();
			oFirstDate = new CalendarDate(this._oDate, this.getPrimaryCalendarType());
			oFirstDate.setYear(oFirstDate.getYear() - Math.floor(iYears / 2) * this.getRangeSize());
			oFirstDate = this._checkFirstDate(oFirstDate);
			this._updateYears(oFirstDate, Math.floor(iYears / 2));
		}

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
		var oMaxStartYear = new CalendarDate(this._oMaxDate, this.getPrimaryCalendarType());
		oMaxStartYear.setYear(oMaxStartYear.getYear() - iYears * this.getRangeSize() + 1);
		if (oDate.isAfter(oMaxStartYear) && oDate.getYear() != oMaxStartYear.getYear()) {
			oDate = new CalendarDate(oMaxStartYear, this.getPrimaryCalendarType());
			oDate.setMonth(0, 1);
		} else if (oDate.isBefore(this._oMinDate) && oDate.getYear() != this._oMinDate.getYear()) {
			oDate = new CalendarDate(this._oMinDate, this.getPrimaryCalendarType());
			oDate.setMonth(0, 1);
		}

		return oDate;

	};

	YearRangePicker.prototype._updatePage = function (bForward, iSelectedIndex, bFireEvent){

		var aDomRefs = this._oItemNavigation.getItemDomRefs(),
			oFirstDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(jQuery(aDomRefs[0]).attr("data-sap-year-start")), this.getPrimaryCalendarType()),
			iYears = this.getYears();

		if (bForward) {
			var oMaxDate = new CalendarDate(this._oMaxDate, this.getPrimaryCalendarType());
			oMaxDate.setYear(oMaxDate.getYear() - iYears * this.getRangeSize() + 1);
			if (oFirstDate.isBefore(oMaxDate)) {
				oFirstDate.setYear(oFirstDate.getYear() + iYears * this.getRangeSize());
				oFirstDate = this._checkFirstDate(oFirstDate);
			} else {
				return;
			}
		} else {
			if (oFirstDate.isAfter(this._oMinDate)) {
				oFirstDate.setYear(oFirstDate.getYear() - iYears * this.getRangeSize());
				if (oFirstDate.isBefore(this._oMinDate)) {
					oFirstDate = new CalendarDate(this._oMinDate, this.getPrimaryCalendarType());
				}
				oFirstDate = this._checkFirstDate(oFirstDate);
			} else {
				return;
			}
		}

		this._updateYears(oFirstDate, iSelectedIndex);

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

	/**
	* @param {sap.ui.unified.calendar.CalendarDate} oFirstDate
	* @param {int} iSelectedIndex
	* @private
	*/
	YearRangePicker.prototype._updateYears = function(oFirstDate, iSelectedIndex){

		var oSelectedDate = new CalendarDate(this._getDate(), this.getPrimaryCalendarType()),
			sFirstYear = "",
			sSecondYear = "",
			oSecondDate = new CalendarDate(oFirstDate, this.getPrimaryCalendarType()),
			aDomRefs = this._oItemNavigation.getItemDomRefs(),
			sYyyymmdd,
			$DomRef;

		oSelectedDate.setYear(oSelectedDate.getYear() + Math.floor(this.getRangeSize() / 2));
		oSecondDate.setYear(oSecondDate.getYear() + this.getRangeSize() - 1);

		for (var i = 0; i < aDomRefs.length; i++) {
			sYyyymmdd = this._oFormatYyyymmdd.format(oFirstDate.toUTCJSDate(), true);
			$DomRef = jQuery(aDomRefs[i]);
			$DomRef.attr("id", this.getId() + "-y" + sYyyymmdd);

			// to render era in Japanese, UniversalDate is used, since CalendarDate.toUTCJSDate() will convert the date in Gregorian
			sFirstYear = this._oYearFormat.format(UniversalDate.getInstance(oFirstDate.toUTCJSDate(), oFirstDate.getCalendarType()), true);
			sSecondYear = this._oYearFormat.format(UniversalDate.getInstance(oSecondDate.toUTCJSDate(), oSecondDate.getCalendarType()), true);

			$DomRef.text(sFirstYear + " - " + sSecondYear);
			$DomRef.attr("data-sap-year-start", sYyyymmdd);

			if (CalendarUtils._isBetween(oSelectedDate, oFirstDate, oSecondDate, true)) {
				iSelectedIndex = i;
			}

			if (this._checkDateEnabled(oFirstDate, oSecondDate)) {
				$DomRef.removeClass("sapUiCalItemDsbl");
				$DomRef.removeAttr("aria-disabled");
			} else {
				$DomRef.addClass("sapUiCalItemDsbl");
				$DomRef.attr("aria-disabled", true);
			}

			oFirstDate.setYear(oSecondDate.getYear() + 1);
			oSecondDate.setYear(oSecondDate.getYear() + this.getRangeSize());
		}

		this._oItemNavigation.focusItem(iSelectedIndex);
	};

	YearRangePicker.prototype._selectYear = function(iIndex) {
		var aDomRefs = this._oItemNavigation.getItemDomRefs(),
			$DomRef = jQuery(aDomRefs[iIndex]),
			sYyyymmdd = $DomRef.attr("data-sap-year-start"),
			oDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(sYyyymmdd), this.getPrimaryCalendarType());

		if ($DomRef.hasClass("sapUiCalItemDsbl")) {
			return false; // don't select disabled items
		}

		this.setProperty("date", oDate.toLocalJSDate(), true);
		this.setProperty("year", oDate.getYear(), true);

		return true;
	};

	return YearRangePicker;

});
