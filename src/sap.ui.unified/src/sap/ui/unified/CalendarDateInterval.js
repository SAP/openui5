/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.Calendar.
sap.ui.define([
	'./calendar/CalendarUtils',
	'./Calendar',
	'./calendar/DatesRow',
	'./calendar/MonthPicker',
	'./calendar/YearPicker',
	'./calendar/YearRangePicker',
	'./calendar/CalendarDate',
	'./library',
	'sap/ui/Device',
	"./CalendarDateIntervalRenderer",
	"sap/base/util/deepEqual",
	"sap/ui/core/Popup",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"./DateRange"
], function(
	CalendarUtils,
	Calendar,
	DatesRow,
	MonthPicker,
	YearPicker,
	YearRangePicker,
	CalendarDate,
	library,
	Device,
	CalendarDateIntervalRenderer,
	deepEqual,
	Popup,
	Log,
	jQuery,
	DateRange
) {
	"use strict";

	var CalendarType = sap.ui.core.CalendarType;
	/*
	* Inside the CalendarDateInterval CalendarDate objects are used. But in the API JS dates are used.
	* So conversion must be done on API functions.
	*/

	/**
	 * Constructor for a new <code>CalendarDateInterval</code>.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * <code>CalendarDateInterval</code> only visualizes the dates in a one-line interval and allows the selection of a single day.
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

		},
		aggregations : {
			/**
			 * Hidden, for internal use only.
			 */
			calendarPicker : {type : "sap.ui.unified.Calendar", multiple : false, visibility : "hidden"}

		},
		designtime: "sap/ui/unified/designtime/CalendarDateInterval.designtime"
	}});

	CalendarDateInterval.prototype.init = function(){

		Calendar.prototype.init.apply(this, arguments);

		this._iDaysMonthHead = 35; // if more than this number of days, month names are displayed on top of days

	};

	CalendarDateInterval.prototype._initilizeMonthPicker = function() {
		var oMonthPicker = this._createMonthPicker();
		this.setAggregation("monthPicker", oMonthPicker);

		oMonthPicker._setSelectedDatesControlOrigin(this);
	};

	CalendarDateInterval.prototype._initilizeYearPicker = function() {
		var oYearPicker =  this._createYearPicker();
		this.setAggregation("yearPicker", oYearPicker);

		oYearPicker._setSelectedDatesControlOrigin(this);
	};

	CalendarDateInterval.prototype._initilizeYearRangePicker = function() {
		this.setAggregation("yearRangePicker", this._createYearRangePicker());
	};

	CalendarDateInterval.prototype.setPickerPopup = function(bPickerPopup) {
		this.setProperty("pickerPopup", bPickerPopup, true);

		var oHeader = this.getAggregation("header"),
			oMonthPicker,
			oYearPicker;

		if (bPickerPopup) {
			if (this._getMonthPicker()) {
				this._getMonthPicker().destroy();
			}
			if (this._getYearPicker()) {
				this._getYearPicker().destroy();
			}
			oHeader.setVisibleButton2(false);
			oHeader.detachEvent("pressButton2", this._handleButton2, this);
			this._setHeaderText(this._getFocusedDate(true));
		} else {
			if (!this._getMonthPicker()) {
				this.setAggregation("monthPicker", this._createMonthPicker());
			}
			if (!this._getYearPicker()) {
				this.setAggregation("yearPicker", this._createYearPicker());
			}
			oMonthPicker = this._getMonthPicker();
			oYearPicker = this._getYearPicker();

			oMonthPicker.setColumns(0);
			oMonthPicker.setMonths(6);
			oYearPicker.setColumns(0);
			oYearPicker.setYears(6);
			oYearPicker._oMinDate.setYear(this._oMinDate.getYear());
			oYearPicker._oMaxDate.setYear(this._oMaxDate.getYear());

			oHeader.setVisibleButton2(true);
			oHeader.detachEvent("pressButton2", this._handleButton2, this);
			oHeader.attachEvent("pressButton2", this._handleButton2, this);

		}

		return this;

	};

	CalendarDateInterval.prototype._createMonthPicker = function() {
		var oMonthPicker = new MonthPicker(this.getId() + "--MP");
		oMonthPicker.attachEvent("select", this._selectMonth, this);
		oMonthPicker._bNoThemeChange = true;
		oMonthPicker.setColumns(0);
		oMonthPicker.setMonths(3); // default for 7 days
		oMonthPicker.attachEvent("pageChange", _handleMonthPickerPageChange, this);

		return oMonthPicker;
	};

	CalendarDateInterval.prototype._createYearPicker = function() {
		var oYearPicker = new YearPicker(this.getId() + "--YP");
		oYearPicker.attachEvent("select", this._selectYear, this);
		oYearPicker.setColumns(0);
		oYearPicker.setYears(3); // default for 7 days
		oYearPicker.attachEvent("pageChange", _handleYearPickerPageChange, this);

		return oYearPicker;
	};

	CalendarDateInterval.prototype._createYearRangePicker = function() {
		var oYearRangePicker = new YearRangePicker(this.getId() + "--YRP");
		oYearRangePicker.attachEvent("select", this._selectYearRange, this);
		oYearRangePicker.setPrimaryCalendarType(this.getPrimaryCalendarType());
		oYearRangePicker.setYears(6);
		oYearRangePicker.setRangeSize(this._getYearPicker().getYears());

		return oYearRangePicker;
	};

	// TODO: Make a calculation for the YearRangePicker column count
	// based on control width and browser window width
	CalendarDateInterval.prototype._adjustYearRangeDisplay = function() {
		var oYearRangePicker = this.getAggregation("yearRangePicker");

		if (!this._getSucessorsPickerPopup()) {
			switch (this.getPrimaryCalendarType()) {
				case CalendarType.Gregorian:
					oYearRangePicker.setColumns(3);
					oYearRangePicker.setYears(3);
					break;
				default:
					oYearRangePicker.setColumns(2);
					oYearRangePicker.setYears(2);
			}
		} else {
			Calendar.prototype._adjustYearRangeDisplay.call(this, arguments);
		}
	};

	/**
	 * Lazily initializes the <code>calendarPicker</code> aggregation.
	 * @private
	 * @returns {sap.ui.unified.Calendar} The newly created control
	 */
	CalendarDateInterval.prototype._getCalendarPicker = function (){
		var oCalPicker = this.getAggregation("calendarPicker");

		if (!oCalPicker) {
			oCalPicker = new Calendar(this.getId() + "--Cal");
			oCalPicker.setPopupMode(true);
			oCalPicker.attachEvent("select", this._handleCalendarPickerDateSelect, this);
			oCalPicker.attachEvent("cancel", function (oEvent) {
				this._closeCalendarPicker();
				var oDomRefB1 = this.getAggregation("header").getDomRef("B1");
				if (oDomRefB1) {
					oDomRefB1.focus();
				}
			}, this);
			this.setAggregation("calendarPicker", oCalPicker);
		}
		return oCalPicker;
	};

	CalendarDateInterval.prototype._setAriaRole = function(sRole){
		var oDatesRow = this.getAggregation("month")[0];

		oDatesRow._setAriaRole(sRole);
		oDatesRow.invalidate();

		return this;
	};

	CalendarDateInterval.prototype._handleButton1 = function(oEvent){
		if (this.getPickerPopup()) {
			this._showCalendarPicker();
		} else {
			if (this._iMode != 1) {
				this._showMonthPicker();
			} else {
				this._hideMonthPicker();
			}
		}
	};

	CalendarDateInterval.prototype._setHeaderText = function(oDate){

		// sets the text for the month and the year button to the header
		var oTexts = Calendar.prototype._setHeaderText.apply(this, arguments);
		var sText,
			sAriaLabel = oTexts.sAriaLabel,
			oHeader = this.getAggregation("header");
		var oLocaleData = this._getLocaleData();
		var oEndDate = CalendarDate.fromLocalJSDate(new Date(oDate.toLocalJSDate().getTime() + (this._getDays() - 1) * 24 * 60 * 60 * 1000), this.getPrimaryCalendarType());
		oEndDate.setDate(1); // always use the first of the month to have stable year in Japanese calendar
		var sDelimiter = oLocaleData.getIntervalPattern().replace("{0}", "").replace("{1}", "");
		var sEndYear = this._oYearFormat.format(oEndDate.toUTCJSDate(), true);
		var sMonth = oTexts.sMonth;

		if (this.getPickerPopup()) {
			if (oLocaleData.oLocale.sLanguage.toLowerCase() === "ja" || oLocaleData.oLocale.sLanguage.toLowerCase() === "zh") {
				if (sEndYear != oTexts.sYear) {
					sMonth = sMonth.replace(sDelimiter, sDelimiter + sEndYear + " ");
					sAriaLabel = sAriaLabel.replace(sDelimiter, sDelimiter + sEndYear + " ");
				}
				sText = oTexts.sYear + " " + sMonth;
				sAriaLabel = oTexts.sYear + " " + sAriaLabel;
			} else {
				if (sEndYear != oTexts.sYear) {
					sMonth = sMonth.replace(sDelimiter, " " + oTexts.sYear + sDelimiter);
					sAriaLabel = sAriaLabel.replace(sDelimiter, " " + oTexts.sYear + sDelimiter);
				}
				sText = sMonth + " " + sEndYear;
				sAriaLabel = sAriaLabel + " " + sEndYear;
			}
			oHeader.setTextButton1(sText, true);
			oHeader.setAriaLabelButton1(sAriaLabel);
		}
	};

	CalendarDateInterval.prototype._showCalendarPicker = function() {
		var oStartDate = this.getStartDate(),
			oCalPicker = this._getCalendarPicker(),
			oSelectedRange = new DateRange(),
			oEndDate = new Date(oStartDate.getTime());

		oEndDate.setDate(oEndDate.getDate() + this._getDays() - 1);
		oSelectedRange.setStartDate(oStartDate);
		oSelectedRange.setEndDate(oEndDate);

		oCalPicker.displayDate(this._getFocusedDate().toLocalJSDate());
		oCalPicker.removeAllSelectedDates();
		oCalPicker.addSelectedDate(oSelectedRange);

		oCalPicker.setMinDate(this.getMinDate());
		oCalPicker.setMaxDate(this.getMaxDate());

		this._openPickerPopup(oCalPicker);
		this._showOverlay();
	};

	CalendarDateInterval.prototype._handleCalendarPickerDateSelect = function(oEvent) {
		var oCalendar = this._getCalendarPicker(),
			oSelectedDate = oCalendar.getSelectedDates()[0].getStartDate(),
			oNewCalStartDate = new CalendarDate.fromLocalJSDate(oSelectedDate);

		this._setStartDate(oNewCalStartDate);
		this._setFocusedDate(oNewCalStartDate);
		this._closeCalendarPicker();
	};

	CalendarDateInterval.prototype._closeCalendarPicker = function(bSkipFocus) {
		if (this._oPopup && this._oPopup.isOpen()) {
			this._oPopup.close();
		}
		this._hideOverlay();

		if (!bSkipFocus) {
			this._renderMonth(); // to focus date

			// restore tabindex
			var aMonths = this.getAggregation("month");

			for (var i = 0; i < aMonths.length; i++) {
				var oMonth = aMonths[i];
				jQuery(oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
			}
		}

		this.getAggregation("calendarPicker")._closedPickers();
	};

	/**
	* If more than this number of days are displayed, start and end month are displayed on the button.
	* @returns {int} The number of days to determine how the start and end of month are displayed
	* @protected
	*/
	CalendarDateInterval.prototype._getDaysLarge = function() {
		return 10;
	};

	CalendarDateInterval.prototype._createMonth = function(sId){

		var oMonth = new DatesRow(sId);

		return oMonth;

	};

	CalendarDateInterval.prototype.setStartDate = function(oStartDate){

		CalendarUtils._checkJSDateObject(oStartDate);

		if (deepEqual(this.getStartDate(), oStartDate)) {
			return this;
		}

		var iYear = oStartDate.getFullYear();
		CalendarUtils._checkYearInValidRange(iYear);

		var oCalStartDate = CalendarDate.fromLocalJSDate(oStartDate, this.getPrimaryCalendarType());
		if (CalendarUtils._isOutside(oCalStartDate, this._oMinDate, this._oMaxDate)) {
			throw new Error("Date must be in valid range (minDate and maxDate); " + this);
		}

		var oMinDate = this.getMinDate();
		if (oMinDate && oStartDate.getTime() < oMinDate.getTime()) {
			Log.warning("startDate < minDate -> minDate as startDate set", this);
			oStartDate = new Date(oMinDate.getTime());
		}

		var oMaxDate = this.getMaxDate();
		if (oMaxDate && oStartDate.getTime() > oMaxDate.getTime()) {
			Log.warning("startDate > maxDate -> maxDate as startDate set", this);
			oStartDate = new Date(oMaxDate.getTime());
		}

		this.setProperty("startDate", oStartDate, true);
		oCalStartDate = CalendarDate.fromLocalJSDate(oStartDate, this.getPrimaryCalendarType());
		this._oStartDate = oCalStartDate;

		var oDatesRow = this.getAggregation("month")[0];
		oDatesRow.setStartDate(oStartDate);

		this._updateHeader(oCalStartDate);

		var oDate = this._getFocusedDate(true).toLocalJSDate();
		if (!oDatesRow.checkDateFocusable(oDate)) {
			//focused date not longer visible -> focus start date  (but don't set focus)
			this._setFocusedDate(oCalStartDate);
			oDatesRow.displayDate(oStartDate);
		}

		return this;

	};

	// needs to be overwritten because differently implemented in Calendar
	/*
	 * Gets current value of property startDate.
	 *
	 * Start date of the Interval
	 * @returns {object} JavaScript date object for property startDate
	 */
	CalendarDateInterval.prototype.getStartDate = function(){

		return this.getProperty("startDate");

	};

	CalendarDateInterval.prototype.setDays = function(iDays){

		var oYearRangePicker = this.getAggregation("yearRangePicker");

		this.setProperty("days", iDays, true);

		iDays = this._getDays(); // to use phone limit

		var oDatesRow = this.getAggregation("month")[0];
		oDatesRow.setDays(iDays);

		if (!this.getPickerPopup()) {
			var oMonthPicker = this._getMonthPicker();
			var iMonths = Math.ceil(iDays / 3);
			if (iMonths > 12) {
				iMonths = 12;
			}
			oMonthPicker.setMonths(iMonths);

			var oYearPicker = this._getYearPicker();
			var iYears = Math.floor(iDays / 2);
			if (iYears > 20) {
				iYears = 20;
			}
			oYearPicker.setYears(iYears);
			oYearRangePicker.setRangeSize(iYears);
		}

		var oStartDate = this._getStartDate();
		this._updateHeader(oStartDate);

		if (this.getDomRef()) {
			if (iDays > this._getDaysLarge()) {
				this.$().addClass("sapUiCalIntLarge");
			} else {
				this.$().removeClass("sapUiCalIntLarge");
			}

			if (iDays > this._iDaysMonthHead) {
				this.$().addClass("sapUiCalIntHead");
			} else {
				this.$().removeClass("sapUiCalIntHead");
			}
		}

		return this;

	};

	CalendarDateInterval.prototype._getDays = function(){

		var iDays = this.getDays();

		// in phone mode max 8 days are displayed
		if (Device.system.phone && iDays > 8) {
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

	/**
	* @param {boolean} [bForceRecalculate] Indicates if it's called within the <code>startDate</code> property setter and therefore
	* needs to be recalculated
	* @private
	* @returns {sap.ui.unified.calendar.CalendarDate} the date
	*/
	CalendarDateInterval.prototype._getFocusedDate = function(bForceRecalculate){

		if (!this._oFocusedDate || bForceRecalculate) {
			this._oFocusedDate = null;
			Calendar.prototype._getFocusedDate.apply(this, arguments);
			var oStartDate = this.getStartDate();
			var oDatesRow = this.getAggregation("month")[0];
			if (!oStartDate) {
				// use focused date as start date
				this._setStartDate(this._oFocusedDate, false, true);
			}else if (!oDatesRow.checkDateFocusable(this._oFocusedDate.toLocalJSDate())) {
				this._oFocusedDate = CalendarDate.fromLocalJSDate(oStartDate, this.getPrimaryCalendarType());
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
	 * @param {int} iMonths How many months to be displayed
	 * @returns {sap.ui.unified.CalendarDateInterval} <code>this</code> to allow method chaining
	 */
	CalendarDateInterval.prototype.setMonths = function(iMonths){

		if (iMonths == 1) {
			return this.setProperty("months", iMonths, false); // rerender
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
	 * @param {int} [iFirstDayOfWeek] First day of the week
	 * @returns {sap.ui.unified.CalendarDateInterval} <code>this</code> to allow method chaining
	 */
	CalendarDateInterval.prototype.setFirstDayOfWeek = function(iFirstDayOfWeek){

		if (iFirstDayOfWeek == -1) {
			return this.setProperty("firstDayOfWeek", iFirstDayOfWeek, false); // rerender
		} else {
			throw new Error("Property firstDayOfWeek not supported " + this);
		}

	};

	/**
	* Focuses given date.
	* @param {Date} oDate a JavaScript date
	* @return {sap.ui.unified.Calendar} <code>this</code> for method chaining
	*/
	CalendarDateInterval.prototype.focusDate = function(oDate){

		var oDatesRow = this.getAggregation("month")[0];
		if (!oDatesRow.checkDateFocusable(oDate)) {
			this._focusDateExtend(CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType()), true, true);
		}

		Calendar.prototype.focusDate.apply(this, arguments);

		return this;

	};

	CalendarDateInterval.prototype._shouldFocusB2OnTabNext = function(oEvent){
		var oHeader = this.getAggregation("header");

		return (!this.getPickerPopup() && oEvent.target.id == oHeader.getId() + "-B1");
	};

	CalendarDateInterval.prototype._focusOnShiftTab = function() {
		var oHeader = this.getAggregation("header");

		if (this.getPickerPopup() && oHeader.getDomRef("B1")){
			oHeader.getDomRef("B1").focus();
		} else if (!this.getPickerPopup() && oHeader.getDomRef("B2")){
			oHeader.getDomRef("B2").focus();
		}
	};

	CalendarDateInterval.prototype.onsapescape = function(oEvent){

		if (this.getPickerPopup()) {
			this._closeCalendarPicker();
			this.fireCancel();
		} else {
			if (this._iMode === 0) {
				this.fireCancel();
			}
			this._closedPickers();
		}
		this._updateHeadersButtons();
		this._setHeaderText(this._getFocusedDate());

	};

	/**
	 * Overrides the <code>Calendar#_focusDateExtend</code> in order to handle the focused date in a custom way.
	 *
	 * Set start date according to new focused date. If focused date is not in current rendered date interval
	 * new focused date should have the same position like the old one
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate the date to focus
	 * @param {boolean} bOtherMonth determines whether the function is called due navigation outside the visible
	 * date range
	 * @param {boolean} bNoEvent hint to skip firing <code>startDateChange</code> event. If set to <code>true</code>,
	 * the parent is supposed to take care for firing.
	 * @returns {boolean} whether the parent should fire the <code>startDateChange</code> event
	 * @private
	 */
	CalendarDateInterval.prototype._focusDateExtend = function(oDate, bOtherMonth, bNoEvent) {
		if (bOtherMonth) {
			var oOldFocusedDate = this._getFocusedDate();
			var oOldStartDate = this._getStartDate();
			var iDay = CalendarUtils._daysBetween(oOldFocusedDate, oOldStartDate);
			var oNewStartDate = new CalendarDate(oDate, this.getPrimaryCalendarType());
			oNewStartDate.setDate(oNewStartDate.getDate() - iDay);
			this._setStartDate(oNewStartDate, false, true);

			if (!bNoEvent) {
				return true; // fire startDateChange event in caller at end of processing
			}
		}

		return false;

	};

	/**
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate
	 * @override
	 * @private
	*/
	CalendarDateInterval.prototype._setMinMaxDateExtend = function(oDate){

		if (this._oStartDate) {
			// check if still in valid range
			if (this._oStartDate.isBefore(this._oMinDate)) {
				Log.warning("start date < minDate -> minDate will be start date", this);
				this._setStartDate(new CalendarDate(this._oMinDate, this.getPrimaryCalendarType()), true, true);
			} else {
				var oEndDate = new CalendarDate(this._oStartDate);
				oEndDate.setDate(oEndDate.getDate() + this._getDays() - 1);
				if (oEndDate.isAfter(this._oMaxDate)) {
					Log.warning("end date > maxDate -> start date will be changed", this);
					var oStartDate = new CalendarDate(this._oMaxDate);
					oStartDate.setDate(oStartDate.getDate() - this._getDays() + 1);
					this._setStartDate(oStartDate, true, true);
				}
			}
		}

	};


	/**
	* Enables/Disables the next and previous buttons.
	* This function assumes that there is a month picker & year picker available. So
	* the caller must take care of this.
	* @param {sap.ui.unified.calendar.CalendarDate} oDate The currently focused date
	* @param {boolean} bCheckMonth Whether the month must be checked
	* @override
	* @private
	*/
	CalendarDateInterval.prototype._togglePrevNext = function(oDate, bCheckMonth){

		if (this._iMode > 1 || (this._iMode == 1 && this.getPickerPopup())) {
			return Calendar.prototype._togglePrevNext.apply(this, arguments);
		}

		var iYearMax = this._oMaxDate.getYear();
		var iYearMin = this._oMinDate.getYear();
		var iMonthMax = this._oMaxDate.getMonth();
		var iMonthMin = this._oMinDate.getMonth();
		var iDateMin = this._oMinDate.getDate();
		var iDateMax = this._oMaxDate.getDate();
		var oHeader = this.getAggregation("header");
		var iDays = this._getDays();
		var iYear;
		var oStartDate;
		var oEndDate;
		var iMonth;
		var iDate;

		if (this._iMode == 1 && !bCheckMonth) {
			// in line month picker don't disable buttons
			var oMonthPicker = this._getMonthPicker();
			var iMonths = oMonthPicker.getMonths();
			var iStartMonth = oMonthPicker.getStartMonth();
			var iEndMonth = iStartMonth + iMonths - 1;
			iYear = oDate.getYear();

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

		oStartDate = this._getStartDate();
		oEndDate = new CalendarDate(oStartDate, this.getPrimaryCalendarType());
		oEndDate.setDate(oEndDate.getDate() + iDays - 1);

		if (CalendarUtils._isOutside(oDate, oStartDate,oEndDate)) {
			// date outside visible range
			oStartDate = new CalendarDate(oDate, this.getPrimaryCalendarType());
			oEndDate = new CalendarDate(oStartDate, this.getPrimaryCalendarType());
			oEndDate.setDate(oEndDate.getDate() + iDays - 1);
		}

		iYear = oStartDate.getYear();
		iMonth = oStartDate.getMonth();
		iDate = oStartDate.getDate();

		if (iYear < iYearMin ||
				(iYear == iYearMin &&
						(!bCheckMonth || iMonth < iMonthMin || (iMonth == iMonthMin && iDate <= iDateMin)))) {
			oHeader.setEnabledPrevious(false);
		}else {
			oHeader.setEnabledPrevious(true);
		}

		iYear = oEndDate.getYear();
		iMonth = oEndDate.getMonth();
		iDate = oEndDate.getDate();

		if (iYear > iYearMax ||
				(iYear == iYearMax &&
						(!bCheckMonth || iMonth > iMonthMax || (iMonth == iMonthMax && iDate >= iDateMax)))) {
			oHeader.setEnabledNext(false);
		} else {
			oHeader.setEnabledNext(true);
		}

	};

	/**
	* Shifts <code>startDate</code> and focusedDate according to given amount of time.
	*
	* @param {sap.ui.unified.calendar.CalendarDate} oStartDate start date
	* @param {sap.ui.unified.calendar.CalendarDate} oFocusedDate focused date
	* @param {int} iDays number of days to shift. Positive values will shift forward, negative - backward.
	* @private
	*/
	CalendarDateInterval.prototype._shiftStartFocusDates = function(oStartDate, oFocusedDate, iDays){
		oStartDate.setDate(oStartDate.getDate() + iDays);
		oFocusedDate.setDate(oFocusedDate.getDate() + iDays);
		this._setFocusedDate(oFocusedDate);
		this._setStartDate(oStartDate, true);
	};

	CalendarDateInterval.prototype._handlePrevious = function(oEvent){

		var oFocusedDate = new CalendarDate(this._getFocusedDate(), this.getPrimaryCalendarType()),
			oMonthPicker,
			oStartDate,
			iDays;

		switch (this._iMode) {
		case 0: // day picker
			oStartDate =  new CalendarDate(this._getStartDate(),  this.getPrimaryCalendarType());
			iDays = this._getDays();
			this._shiftStartFocusDates(oStartDate, oFocusedDate, (iDays * -1));
			break;

		case 1: // month picker
			if (!this.getPickerPopup()) {
				oMonthPicker = this._getMonthPicker();
				if (oMonthPicker.getMonths() < 12) {
					oMonthPicker.previousPage();
					this._togglePrevNext(oFocusedDate);
				} else {
					oFocusedDate.setYear(oFocusedDate.getYear() - 1);
					var bFireStartDateChange = this._focusDateExtend(oFocusedDate, true, false);
					this._setFocusedDate(oFocusedDate);
					this._updateHeader(oFocusedDate);
					this._setDisabledMonths(oFocusedDate.getYear());

					if (bFireStartDateChange) {
						this.fireStartDateChange();
					}
				}
			}
			break;

		case 2: // year picker
			if (!this.getPickerPopup()) {
				this._getYearPicker().previousPage();
				_handleYearPickerPageChange.call(this);
			}
			break;

		case 3: // year range picker
			if (!this.getPickerPopup()) {
				this.getAggregation("yearRangePicker").previousPage();
				_handleYearPickerPageChange.call(this);
			}
			break;
			// no default
		}

	};

	CalendarDateInterval.prototype._handleNext = function(oEvent){

		var oFocusedDate = new CalendarDate(this._getFocusedDate(),  this.getPrimaryCalendarType()),
			oMonthPicker,
			oStartDate,
			iDays;

		switch (this._iMode) {
		case 0: // day picker
			oStartDate = new CalendarDate(this._getStartDate(), this.getPrimaryCalendarType());
			iDays = this._getDays();
			this._shiftStartFocusDates(oStartDate, oFocusedDate, iDays);
			break;

		case 1: // month picker
			if (!this.getPickerPopup()) {
				oMonthPicker = this._getMonthPicker();
				if (oMonthPicker.getMonths() < 12) {
					oMonthPicker.nextPage();
					this._togglePrevNext(oFocusedDate);
				} else {
					oFocusedDate.setYear(oFocusedDate.getYear() + 1);
					var bFireStartDateChange = this._focusDateExtend(oFocusedDate, true, false);
					this._setFocusedDate(oFocusedDate);
					this._updateHeader(oFocusedDate);
					this._setDisabledMonths(oFocusedDate.getYear());

					if (bFireStartDateChange) {
						this.fireStartDateChange();
					}
				}
			}
			break;

		case 2: // year picker
			if (!this.getPickerPopup()) {
				this._getYearPicker().nextPage();
				_handleYearPickerPageChange.call(this);
			}
			break;

		case 3: // year range picker
			if (!this.getPickerPopup()) {
				this.getAggregation("yearRangePicker").nextPage();
				_handleYearPickerPageChange.call(this);
			}
			break;
			// no default
		}

	};

	/**
	*
	* @param {sap.ui.unified.calendar.CalendarDate} oDate A date to determine the first of the displayed months
	* @returns {int[]} The displayed months rendered for a given date
	* @override
	* @private
	*/
	CalendarDateInterval.prototype._getDisplayedMonths = function(oDate){

		var aMonths = [];
		var iMonth = oDate.getMonth();
		var iDays = this._getDays();

		aMonths.push(iMonth);
		if (iDays > this._getDaysLarge()) {
			// of only a few days displayed, there is not enough space for 2 Months in Button
			var oEndDate = new CalendarDate(oDate, this.getPrimaryCalendarType());
			oEndDate.setDate(oEndDate.getDate() + iDays - 1);
			var iEndMonth = oEndDate.getMonth();
			while (iMonth != iEndMonth) {
				iMonth = (iMonth + 1) % 12;
				aMonths.push(iMonth);
			}
		}

		return aMonths;

	};

	CalendarDateInterval.prototype._getDisplayedSecondaryMonths = function(sPrimaryCalendarType, sSecondaryCalendarType){

		var iDays = this._getDays();
		var oStartDate = new CalendarDate(this._getStartDate(), sSecondaryCalendarType);
		var iStartMonth = oStartDate.getMonth();

		var oEndDate = new CalendarDate(oStartDate, this.getPrimaryCalendarType());
		oEndDate.setDate(oEndDate.getDate() + iDays - 1);
		oEndDate = new CalendarDate(oEndDate, sSecondaryCalendarType);
		var iEndMonth = oEndDate.getMonth();

		return {start: iStartMonth, end: iEndMonth};

	};

	CalendarDateInterval.prototype._openPickerPopup = function(oPicker){

		if (!this._oPopup) {
			this._oPopup = new Popup();
			this._oPopup.setAutoClose(true);
			this._oPopup.setAutoCloseAreas([this.getDomRef()]);
			this._oPopup.setDurations(0, 0); // no animations
			this._oPopup._oCalendar = this;
			this._oPopup.attachClosed(function() { this._closeCalendarPicker(true); }, this);
			this._oPopup.onsapescape = function(oEvent) {
				this._oCalendar.onsapescape(oEvent);
			};
		}

		this._oPopup.setContent(oPicker);

		var oHeader = this.getAggregation("header");
		var eDock = Popup.Dock;
		this._oPopup.open(0, eDock.CenterTop, eDock.CenterTop, oHeader, null, "flipfit", true);

	};

	/**
	 * Align maxDate to the Interval's minDate.
	 * If maxDate is before the minDate number of days to display minus one are added to the maxDate
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oMaxDate calculated maxDate with the days offset
	 * @param {sap.ui.unified.calendar.CalendarDate} oMinDate minDate of the Interval
	 * @returns {sap.ui.unified.calendar.CalendarDate} new calculated date
	 * @private
	 */
	CalendarDateInterval.prototype._getMaxDateAlignedToMinDate = function (oMaxDate, oMinDate) {
		var oNewDate = new CalendarDate(oMaxDate, this.getPrimaryCalendarType());

		if (oNewDate.isBefore(oMinDate)) {
			// min and max smaller than interval
			oNewDate = new CalendarDate(oMinDate);
			oNewDate.setDate(oNewDate.getDate() + this._getDays() - 1);
		}

		return oNewDate;
	};

	/**
	 * Align startDate to the Interval's start and min dates.
	 *
	 * If startDate is before the minDate we just return the minDate.
	 * If startDate is not before the minDate and is after the MaxDate then we just return the maxDate
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oMaxDate calculated maxDate with the days offset
	 * @param {sap.ui.unified.calendar.CalendarDate} oMinDate min date of the Interval
	 * @param {sap.ui.unified.calendar.CalendarDate} oStartDate initial startDate
	 * @returns {sap.ui.unified.calendar.CalendarDate} new calculated startDate
	 * @private
	 */
	CalendarDateInterval.prototype._getStartDateAlignedToMinAndMaxDate = function (oMaxDate, oMinDate, oStartDate) {
		var oNewDate = new CalendarDate(oStartDate, this.getPrimaryCalendarType());

		if (oNewDate.isBefore(oMinDate)) {
			oNewDate = new CalendarDate(oMinDate, this.getPrimaryCalendarType());
		} else if (oNewDate.isAfter(oMaxDate)) {
			oNewDate = oMaxDate;
		}

		return oNewDate;
	};

	/**
	 * Calculates the startDate of the interval, corrected to the minDate and maxDate
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oMaxDate maxDate of the Interval
	 * @param {sap.ui.unified.calendar.CalendarDate} oMinDate minDate of the Interval
	 * @param {sap.ui.unified.calendar.CalendarDate} oStartDate initial startDate
	 * @private
	 */
	CalendarDateInterval.prototype._calculateStartDate = function (oMaxDate, oMinDate, oStartDate) {
		var oNewMaxDate = new CalendarDate(oMaxDate, this.getPrimaryCalendarType());
		oNewMaxDate.setDate(oNewMaxDate.getDate() - this._getDays() + 1);

		oNewMaxDate = this._getMaxDateAlignedToMinDate(oNewMaxDate, oMinDate);
		oStartDate = this._getStartDateAlignedToMinAndMaxDate(oNewMaxDate, oMinDate, oStartDate);

		return oStartDate;
	};

	/**
	 * Sets given start date as date in local.
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oStartDate Date that should be taken to create the local JavaScript date.
	 * E.g. if the date is Dec 21th 1981, the local date (CEST) would be Dec 21th, 1981 00:00:00 GMT +02:00
	 * @param {boolean} bSetFocusDate if true, sets this date as focused date
	 * @param {boolean} bNoEvent describes whether the startDateChange event was previously thrown
	 * @private
	*/
	CalendarDateInterval.prototype._setStartDate = function (oStartDate, bSetFocusDate, bNoEvent) {
		oStartDate = this._calculateStartDate(this._oMaxDate, this._oMinDate, oStartDate);

		var oLocaleDate = oStartDate.toLocalJSDate();
		this.setProperty("startDate", oLocaleDate, true);
		this._oStartDate = oStartDate;

		var oDatesRow = this.getAggregation("month")[0];
		oDatesRow.setStartDate(oLocaleDate);

		this._updateHeader(oStartDate);

		if (bSetFocusDate) {
			var oDate = this._getFocusedDate().toLocalJSDate();
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

	};

	/**
	* Gets the start date as CalendarDate (timezone agnostic)
	*
	* E.g. if the date is Dec 21th 1981, the result date would be Dec 21th, 1981 00:00:00 GMT
	* @private
	 *@returns {sap.ui.unified.calendar.CalendarDate} the date
	*/

	CalendarDateInterval.prototype._getStartDate = function(){

		if (!this._oStartDate) {
			// no start date set, use focused date
			this._oStartDate = this._getFocusedDate();
		}

		return this._oStartDate;

	};

	function _handleMonthPickerPageChange(oEvent) {

		var oFocusedDate = new CalendarDate(this._getFocusedDate(), this.getPrimaryCalendarType());
		this._togglePrevNext(oFocusedDate);

	}

	function _handleYearPickerPageChange(oEvent) {

		this._togglePrevNexYearPicker();
		this._updateHeadersYearPrimaryText(this._getYearString());
	}

	return CalendarDateInterval;

});