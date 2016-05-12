/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.Calendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', 'sap/ui/model/type/Date', 'sap/ui/unified/calendar/CalendarUtils',
               './Calendar', './calendar/Header', './calendar/Month', './calendar/DatesRow', './calendar/MonthPicker', './calendar/YearPicker', 'sap/ui/core/date/UniversalDate', './library'],
               function(jQuery, Control, LocaleData, Date1, CalendarUtils, Calendar, Header, Month, DatesRow, MonthPicker, YearPicker, UniversalDate, library) {
	"use strict";

	/**
	 * Constructor for a new <code>CalendarDateInterval</code>.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Calendar with dates displayed in one line.
	 * @extends sap.ui.unified.Calendar
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.ui.unified.CalendarDateInterval
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CalendarDateInterval = Calendar.extend("sap.ui.unified.CalendarDateInterval", /** @lends sap.ui.unified.CalendarDateInterval.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Start date of the Interval
			 */
			startDate : {type : "object", group : "Data"},

			/**
			 * number of days displayed
			 * on phones the maximum rendered number of days is 8.
			 */
			days : {type : "int", group : "Appearance", defaultValue : 7},

			/**
			 * If set the day names are shown in a separate line.
			 * If not set the day names are shown inside the single days.
			 * @since 1.34.0
			 */
			showDayNamesLine : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * If set, the month- and yearPicker opens on a popup
			 * @since 1.34.0
			 */
			pickerPopup : {type : "boolean", group : "Appearance", defaultValue : false}

		}
	}});

	CalendarDateInterval.prototype.init = function(){

		Calendar.prototype.init.apply(this, arguments);

		var oMonthPicker = this.getAggregation("monthPicker");
		oMonthPicker.setColumns(0);
		oMonthPicker.setMonths(3); // default for 7 days
		oMonthPicker.attachEvent("pageChange", _handleMonthPickerPageChange, this);

		var oYearPicker = this.getAggregation("yearPicker");
		oYearPicker.setColumns(0);
		oYearPicker.setYears(3); // default for 7 days
		oYearPicker.attachEvent("pageChange", _handleYearPickerPageChange, this);

		this._iDaysLarge = 10; // if more than this number of days are displayed, start and end month are displayed on the button
		this._iDaysMonthHead = 35; // if more than this number of days, month names are displayed on top of days

	};

	CalendarDateInterval.prototype._createMonth = function(sId){

		var oMonth = new DatesRow(sId);

		return oMonth;

	};

	CalendarDateInterval.prototype.setStartDate = function(oStartDate){

		if (!(oStartDate instanceof Date)) {
			throw new Error("Date must be a JavaScript date object; " + this);
		}

		if (jQuery.sap.equal(this.getStartDate(), oStartDate)) {
			return this;
		}

		var iYear = oStartDate.getFullYear();
		if (iYear < 1 || iYear > 9999) {
			throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + this);
		}

		if (oStartDate.getTime() < this._oMinDate.getTime() || oStartDate.getTime() > this._oMaxDate.getTime()) {
			throw new Error("Date must not be in valid range (minDate and maxDate); " + this);
		}

		var oMinDate = this.getMinDate();
		if (oMinDate && oStartDate.getTime() < oMinDate.getTime()) {
			jQuery.sap.log.warning("startDate < minDate -> minDate as startDate set", this);
			oStartDate = new Date(oMinDate);
		}

		var oMaxDate = this.getMaxDate();
		if (oMaxDate && oStartDate.getTime() > oMaxDate.getTime()) {
			jQuery.sap.log.warning("startDate > maxDate -> maxDate as startDate set", this);
			oStartDate = new Date(oMaxDate);
		}

		var oUTCDate = CalendarUtils._createUniversalUTCDate(oStartDate, this.getPrimaryCalendarType());
		this.setProperty("startDate", oStartDate, true);
		this._oUTCStartDate = oUTCDate;

		var oDatesRow = this.getAggregation("month")[0];
		oDatesRow.setStartDate(oStartDate);

		this._updateHeader(oUTCDate);

		var oDate = CalendarUtils._createLocalDate(this._getFocusedDate());
		if (!oDatesRow.checkDateFocusable(oDate)) {
			//focused date not longer visible -> focus start date  (but don't set focus)
			this._setFocusedDate(oUTCDate);
			oDatesRow.displayDate(oStartDate);
		}

		return this;

	};

	// needs to be overwritten because differently implemented in Calendar
	/**
	 * Gets current value of property startDate.
	 *
	 * Start date of the Interval
	 * @returns {object} JavaScript date object for property startDate
	 */
	CalendarDateInterval.prototype.getStartDate = function(){

		return this.getProperty("startDate");

	};

	CalendarDateInterval.prototype.setDays = function(iDays){

		this.setProperty("days", iDays, true);

		iDays = this._getDays(); // to use phone limit

		var oDatesRow = this.getAggregation("month")[0];
		oDatesRow.setDays(iDays);

		if (!this.getPickerPopup()) {
			var oMonthPicker = this.getAggregation("monthPicker");
			var iMonths = Math.ceil(iDays / 3);
			if (iMonths > 12) {
				iMonths = 12;
			}
			oMonthPicker.setMonths(iMonths);

			var oYearPicker = this.getAggregation("yearPicker");
			var iYears = Math.floor(iDays / 2);
			if (iYears > 20) {
				iYears = 20;
			}
			oYearPicker.setYears(iYears);
		}

		var oStartDate = _getStartDate.call(this);
		this._updateHeader(oStartDate);

		if (this.getDomRef()) {
			if (iDays > this._iDaysLarge) {
				this.$().addClass("sapUiCalIntLarge");
			}else {
				this.$().removeClass("sapUiCalIntLarge");
			}

			if (iDays > this._iDaysMonthHead) {
				this.$().addClass("sapUiCalIntHead");
			}else {
				this.$().removeClass("sapUiCalIntHead");
			}
		}

		return this;

	};

	CalendarDateInterval.prototype._getDays = function(){

		var iDays = this.getDays();

		// in phone mode max 8 days are displayed
		if (sap.ui.Device.system.phone && iDays > 8) {
			return 8;
		} else {
			return iDays;
		}

	};

	CalendarDateInterval.prototype.setShowDayNamesLine = function(bShowDayNamesLine){

		this.setProperty("showDayNamesLine", bShowDayNamesLine, true);

		var oDatesRow = this.getAggregation("month")[0];
		oDatesRow.setShowDayNamesLine(bShowDayNamesLine);

		return this;

	};

	CalendarDateInterval.prototype._getShowMonthHeader = function(){

		var iDays = this._getDays();
		if (iDays > this._iDaysMonthHead) {
			return true;
		}else {
			return false;
		}

	};

	CalendarDateInterval.prototype._getFocusedDate = function(){

		if (!this._oFocusedDate) {
			Calendar.prototype._getFocusedDate.apply(this, arguments);
			var oStartDate = this.getStartDate();
			var oDatesRow = this.getAggregation("month")[0];
			if (!oStartDate) {
				// use focused date as start date
				_setStartDate.call(this, this._oFocusedDate, false, true);
			}else if (!oDatesRow.checkDateFocusable(CalendarUtils._createLocalDate(this._oFocusedDate))) {
				this._oFocusedDate = CalendarUtils._createUniversalUTCDate(oStartDate, this.getPrimaryCalendarType());
			}
		}


		return this._oFocusedDate;

	};

	/**
	 * Setter for property <code>months</code>.
	 *
	 * Property <code>months</code> is not supported in <code>sap.ui.unified.CalendarDateInterval</code> control.
	 *
	 * @protected
	 * @param {int} [iMonths] months
	 * @name sap.ui.unified.CalendarDateInterval#setMonths
	 * @function
	 */
	CalendarDateInterval.prototype.setMonths = function(iMonths){

		if (iMonths == 1) {
			this.setProperty("months", iMonths, false); // rerender
		} else {
			throw new Error("Property months not supported " + this);
		}

	};

	/**
	 * Setter for property <code>firstDayOfWeek</code>.
	 *
	 * Property <code>firstDayOfWeek</code> is not supported in <code>sap.ui.unified.CalendarDateInterval</code> control.
	 *
	 * @protected
	 * @param {int} [iFirstDayOfWeek] first day of the week
	 * @name sap.ui.unified.CalendarDateInterval#setFirstDayOfWeek
	 * @function
	 */
	CalendarDateInterval.prototype.setFirstDayOfWeek = function(iFirstDayOfWeek){

		if (iFirstDayOfWeek == -1) {
			this.setProperty("firstDayOfWeek", iFirstDayOfWeek, false); // rerender
		} else {
			throw new Error("Property firstDayOfWeek not supported " + this);
		}

	};

	CalendarDateInterval.prototype.focusDate = function(oDate){

		var oDatesRow = this.getAggregation("month")[0];
		if (!oDatesRow.checkDateFocusable(oDate)) {
			var oUTCDate = CalendarUtils._createUniversalUTCDate(oDate, this.getPrimaryCalendarType());
			this._focusDateExtend(oUTCDate, true, true);
		}

		Calendar.prototype.focusDate.apply(this, arguments);

		return this;

	};

	CalendarDateInterval.prototype._focusDateExtend = function(oDate, bOtherMonth, bNoEvent) {

		// set start date according to new focused date
		// only if focused date is not in current rendered date interval
		// new focused date should have the same position like the old one
		if (bOtherMonth) {
			var oOldDate = this._getFocusedDate();
			var oStartDate = _getStartDate.call(this);
			var iDay = Math.ceil((oOldDate.getTime() - oStartDate.getTime()) / (1000 * 3600 * 24));
			oStartDate = this._newUniversalDate(oDate);
			oStartDate.setUTCDate( oStartDate.getUTCDate() - iDay);
			_setStartDate.call(this, oStartDate, false, true);
			if (!bNoEvent) {
				return true; // fire startDateChange event in caller at end of processing
			}
		}

		return false;

	};

	CalendarDateInterval.prototype._setMinMaxDateExtend = function(oDate){

		if (this._oUTCStartDate) {
			// check if still in valid range
			if (this._oUTCStartDate.getTime() < this._oMinDate.getTime()) {
				jQuery.sap.log.warning("start date < minDate -> minDate will be start date", this);
				_setStartDate.call(this, this._newUniversalDate(this._oMinDate), true, true);
			} else {
				var oEndDate = new UniversalDate(this._oUTCStartDate.getTime());
				oEndDate.setUTCDate(oEndDate.getUTCDate() + this._getDays() - 1);
				if (oEndDate.getTime() > this._oMaxDate.getTime()) {
					jQuery.sap.log.warning("end date > maxDate -> start date will be changed", this);
					var oStartDate = new UniversalDate(this._oMaxDate.getTime());
					oStartDate.setUTCDate(oStartDate.getUTCDate() - this._getDays() + 1);
					_setStartDate.call(this, oStartDate, true, true);
				}
			}
		}

	};

	CalendarDateInterval.prototype.setPickerPopup = function(bPickerPopup){

		this.setProperty("pickerPopup", bPickerPopup, true);

		var oMonthPicker = this.getAggregation("monthPicker");
		var oYearPicker = this.getAggregation("yearPicker");

		if (bPickerPopup) {
			oMonthPicker.setColumns(3);
			oMonthPicker.setMonths(12);
			oYearPicker.setColumns(4);
			oYearPicker.setYears(20);
		} else {
			oMonthPicker.setColumns(0);
			oMonthPicker.setMonths(6);
			oYearPicker.setColumns(0);
			oYearPicker.setYears(6);
		}

	};

	CalendarDateInterval.prototype._togglePrevNext = function(oDate, bCheckMonth){

		if (this._iMode > 1 || (this._iMode == 1 && this.getPickerPopup())) {
			return Calendar.prototype._togglePrevNext.apply(this, arguments);
		}

		var iYearMax = this._oMaxDate.getJSDate().getUTCFullYear();
		var iYearMin = this._oMinDate.getJSDate().getUTCFullYear();
		var iMonthMax = this._oMaxDate.getJSDate().getUTCMonth();
		var iMonthMin = this._oMinDate.getJSDate().getUTCMonth();
		var iDateMin = this._oMinDate.getJSDate().getUTCDate();
		var iDateMax = this._oMaxDate.getJSDate().getUTCDate();
		var oHeader = this.getAggregation("header");
		var iDays = this._getDays();
		var iYear;

		if (this._iMode == 1 && !bCheckMonth) {
			// in line month picker don't disable buttons
			var oMonthPicker = this.getAggregation("monthPicker");
			var iMonths = oMonthPicker.getMonths();
			var iStartMonth = oMonthPicker.getStartMonth();
			var iEndMonth = iStartMonth + iMonths - 1;
			iYear = oDate.getJSDate().getUTCFullYear();

			if (iStartMonth == 0 || (iYear == iYearMin && iStartMonth <= iMonthMin)) {
				oHeader.setEnabledPrevious(false);
			} else {
				oHeader.setEnabledPrevious(true);
			}

			if (iEndMonth > 10 || (iYear == iYearMax && iEndMonth >= iMonthMax)) {
				oHeader.setEnabledNext(false);
			} else {
				oHeader.setEnabledNext(true);
			}

			return;
		}

		var oStartDate = _getStartDate.call(this);
		var oEndDate = this._newUniversalDate(oStartDate);
		oEndDate.setUTCDate(oEndDate.getUTCDate() + iDays - 1);

		if (oDate.getTime() < oStartDate.getTime() || oDate.getTime() > oEndDate.getTime()) {
			// date outside visible range
			oStartDate = this._newUniversalDate(oDate);
			oEndDate = this._newUniversalDate(oStartDate);
			oEndDate.setUTCDate(oEndDate.getUTCDate() + iDays - 1);
		}

		iYear = oStartDate.getJSDate().getUTCFullYear();
		var iMonth = oStartDate.getJSDate().getUTCMonth();
		var iDate = oStartDate.getJSDate().getUTCDate();

		if (iYear < iYearMin ||
				(iYear == iYearMin &&
						(!bCheckMonth || iMonth < iMonthMin || (iMonth == iMonthMin && iDate <= iDateMin)))) {
			oHeader.setEnabledPrevious(false);
		}else {
			oHeader.setEnabledPrevious(true);
		}

		iYear = oEndDate.getJSDate().getUTCFullYear();
		iMonth = oEndDate.getJSDate().getUTCMonth();
		iDate = oEndDate.getJSDate().getUTCDate();

		if (iYear > iYearMax ||
				(iYear == iYearMax &&
						(!bCheckMonth || iMonth > iMonthMax || (iMonth == iMonthMax && iDate >= iDateMax)))) {
			oHeader.setEnabledNext(false);
		} else {
			oHeader.setEnabledNext(true);
		}

	};

	CalendarDateInterval.prototype._handlePrevious = function(oEvent){

		var oFocusedDate = this._newUniversalDate(this._getFocusedDate());
		var oMonthPicker = this.getAggregation("monthPicker");
		var oYearPicker = this.getAggregation("yearPicker");
		var oStartDate = this._newUniversalDate(_getStartDate.call(this));
		var iDays = this._getDays();

		switch (this._iMode) {
		case 0: // day picker
			oStartDate.setUTCDate(oStartDate.getUTCDate() - iDays);
			oFocusedDate.setUTCDate(oFocusedDate.getUTCDate() - iDays);
			this._setFocusedDate(oFocusedDate);
			_setStartDate.call(this, oStartDate, true);
			break;

		case 1: // month picker
			if (oMonthPicker.getMonths() < 12) {
				oMonthPicker.previousPage();
				this._togglePrevNext(oFocusedDate);
			} else {
				oFocusedDate.setUTCFullYear(oFocusedDate.getUTCFullYear() - 1);
				var bFireStartDateChange = this._focusDateExtend(oFocusedDate, true, false);
				this._setFocusedDate(oFocusedDate);
				this._updateHeader(oFocusedDate);
				this._setDisabledMonths(oFocusedDate.getUTCFullYear());

				if (bFireStartDateChange) {
					this.fireStartDateChange();
				}
			}
			break;

		case 2: // year picker
			oYearPicker.previousPage();
			this._togglePrevNexYearPicker();
			break;
			// no default
		}

	};

	CalendarDateInterval.prototype._handleNext = function(oEvent){

		var oFocusedDate = this._newUniversalDate(this._getFocusedDate());
		var oMonthPicker = this.getAggregation("monthPicker");
		var oYearPicker = this.getAggregation("yearPicker");
		var oStartDate = this._newUniversalDate(_getStartDate.call(this));
		var iDays = this._getDays();

		switch (this._iMode) {
		case 0: // day picker
			oStartDate.setUTCDate(oStartDate.getUTCDate() + iDays);
			oFocusedDate.setUTCDate(oFocusedDate.getUTCDate() + iDays);
			this._setFocusedDate(oFocusedDate);
			_setStartDate.call(this, oStartDate, true);
			break;

		case 1: // month picker
			if (oMonthPicker.getMonths() < 12) {
				oMonthPicker.nextPage();
				this._togglePrevNext(oFocusedDate);
			} else {
				oFocusedDate.setUTCFullYear(oFocusedDate.getUTCFullYear() + 1);
				var bFireStartDateChange = this._focusDateExtend(oFocusedDate, true, false);
				this._setFocusedDate(oFocusedDate);
				this._updateHeader(oFocusedDate);
				this._setDisabledMonths(oFocusedDate.getUTCFullYear());

				if (bFireStartDateChange) {
					this.fireStartDateChange();
				}
			}
			break;

		case 2: // year picker
			oYearPicker.nextPage();
			this._togglePrevNexYearPicker();
			break;
			// no default
		}

	};

	CalendarDateInterval.prototype._getDisplayedMonths = function(oDate){

		var aMonths = [];
		var iMonth = oDate.getUTCMonth();
		var iDays = this._getDays();

		aMonths.push(iMonth);
		if (iDays > this._iDaysLarge) {
			// of only a few days displayed, there is not enough space for 2 Months in Button
			var oEndDate = this._newUniversalDate(oDate);
			oEndDate.setUTCDate(oEndDate.getUTCDate() + iDays - 1);
			var iEndMonth = oEndDate.getUTCMonth();
			while (iMonth != iEndMonth) {
				iMonth = (iMonth + 1) % 12;
				aMonths.push(iMonth);
			}
		}

		return aMonths;

	};

	CalendarDateInterval.prototype._getDisplayedSecondaryMonths = function(sPrimaryCalendarType, sSecondaryCalendarType){

		var iDays = this._getDays();
		var oStartDate = _getStartDate.call(this);
		oStartDate = UniversalDate.getInstance(oStartDate.getJSDate(), sSecondaryCalendarType);
		var iStartMonth = oStartDate.getUTCMonth();

		var oEndDate = this._newUniversalDate(oStartDate);
		oEndDate.setUTCDate(oEndDate.getUTCDate() + iDays - 1);
		oEndDate = UniversalDate.getInstance(oEndDate.getJSDate(), sSecondaryCalendarType);
		var iEndMonth = oEndDate.getUTCMonth();

		return {start: iStartMonth, end: iEndMonth};

	};

	CalendarDateInterval.prototype._openPickerPopup = function(oPicker){

		if (!this._oPopup) {
			jQuery.sap.require("sap.ui.core.Popup");
			this._oPopup = new sap.ui.core.Popup();
			this._oPopup.setAutoClose(true);
			this._oPopup.setAutoCloseAreas([this.getDomRef()]);
			this._oPopup.setDurations(0, 0); // no animations
			this._oPopup._oCalendar = this;
			this._oPopup.attachClosed(_handlePopupClosed, this);
			this._oPopup.onsapescape = function(oEvent) {
				this._oCalendar.onsapescape(oEvent);
			};
		}

		this._oPopup.setContent(oPicker);

		var oHeader = this.getAggregation("header");
		var eDock = sap.ui.core.Popup.Dock;
		this._oPopup.open(0, eDock.CenterTop, eDock.CenterBottom, oHeader, null, "flipfit", true);

	};

	function _setStartDate(oStartDate, bSetFocusDate, bNoEvent){

		var oMaxDate = this._newUniversalDate(this._oMaxDate);
		oMaxDate.setUTCDate(oMaxDate.getUTCDate() - this._getDays() + 1);
		if (oMaxDate.getTime() < this._oMinDate.getTime()) {
			// min and max smaller than interval
			oMaxDate = new UniversalDate(this._oMinDate.getTime());
			oMaxDate.setUTCDate(oMaxDate.getUTCDate() + this._getDays() - 1);
		}
		if (oStartDate.getTime() < this._oMinDate.getTime()) {
			oStartDate = this._newUniversalDate(this._oMinDate);
		}else if (oStartDate.getTime() > oMaxDate.getTime()){
			oStartDate = oMaxDate;
		}

		var oLocaleDate = CalendarUtils._createLocalDate(oStartDate);
		this.setProperty("startDate", oLocaleDate, true);
		this._oUTCStartDate = oStartDate;

		var oDatesRow = this.getAggregation("month")[0];
		oDatesRow.setStartDate(oLocaleDate);

		this._updateHeader(oStartDate);

		if (bSetFocusDate) {
			var oDate = CalendarUtils._createLocalDate(this._getFocusedDate());
			if (!oDatesRow.checkDateFocusable(oDate)) {
				//focused date not longer visible -> focus start date
				this._setFocusedDate(oStartDate);
				oDatesRow.setDate(oLocaleDate);
			}else {
				oDatesRow.setDate(oDate);
			}
		}

		if (!bNoEvent) {
			this.fireStartDateChange();
		}

	}

	function _getStartDate(){

		if (!this._oUTCStartDate) {
			// no start date set, use focused date
			this._oUTCStartDate = this._getFocusedDate();
		}

		return this._oUTCStartDate;

	}

	function _handlePopupClosed(oEvent) {

		this._closedPickers();

	}

	function _handleMonthPickerPageChange(oEvent) {

		var oFocusedDate = this._newUniversalDate(this._getFocusedDate());
		this._togglePrevNext(oFocusedDate);

	}

	function _handleYearPickerPageChange(oEvent) {

		this._togglePrevNexYearPicker();

	}

	return CalendarDateInterval;

}, /* bExport= */ true);
