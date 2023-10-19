/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.Calendar.
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/Device',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/CalendarDate',
	"sap/ui/unified/DateRange",
	'sap/ui/unified/library',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/library',
	'sap/ui/core/Locale',
	'sap/ui/core/LocaleData',
	"sap/ui/core/date/UI5Date",
	"./YearPickerRenderer",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Configuration"
], function(
	Control,
	Device,
	ItemNavigation,
	CalendarUtils,
	CalendarDate,
	DateRange,
	library,
	DateFormat,
	coreLibrary,
	Locale,
	LocaleData,
	UI5Date,
	YearPickerRenderer,
	KeyCodes,
	jQuery,
	Configuration
) {
	"use strict";

	// shortcut for sap.ui.core.CalendarType
	var CalendarType = coreLibrary.CalendarType;

	/*
	* Inside the YearPicker CalendarDate objects are used. But in the API JS dates are used.
	* So conversion must be done on API functions.
	*/

	/**
	 * Constructor for a new YearPicker.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * renders a YearPicker with ItemNavigation
	 * This is used inside the calendar. Not for stand alone usage.
	 * As in all date-time controls, all pubic JS Date objects that are given (e.g. <code>setDate()</code>) or read
	 * (e.g. <code>getFirstRenderedDate</code>) with values which are considered as date objects in browser(local) timezone.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.28.0
	 * @alias sap.ui.unified.calendar.YearPicker
	 */
	var YearPicker = Control.extend("sap.ui.unified.calendar.YearPicker", /** @lends sap.ui.unified.calendar.YearPicker.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * The year is initial focused and selected
			 * The value must be between 0 and 9999
			 * @deprecated as of version 1.34.0, replaced by <code>date</code> property
			 */
			year : {type : "int", group : "Data", defaultValue : 2000, deprecated: true},

			/**
			 * number of displayed years
			 * @since 1.30.0
			 */
			years : {type : "int", group : "Appearance", defaultValue : 20},

			/**
			 * If set, interval selection is allowed
			 * @since 1.74
			 */
			intervalSelection : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * number of years in each row
			 * 0 means just to have all years in one row, independent of the number
			 * @since 1.30.0
			 */
			columns : {type : "int", group : "Appearance", defaultValue : 4},

			/**
			 * Date as UI5Date or JavaScript Date object. For this date a <code>YearPicker</code> is rendered. If a Year is selected the
			 * date is updated with the start date of the selected year (depending on the calendar type).
			 * @since 1.34.0
			 */
			date : {type : "object", group : "Data"},

			/**
			 * If set, the calendar type is used for display.
			 * If not set, the calendar type of the global configuration is used.
			 * @since 1.34.0
			 */
			primaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance"},

			/**
			 * If set, the years are also displayed in this calendar type
			 * If not set, the years are only displayed in the primary calendar type
			 * @since 1.104.0
			 */
			secondaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance"},

			/**
			 * Date as CalendarDate object. Holds the rendered date in the middle of the grid.
			 * @since 1.84.0
			 */
			_middleDate : {type : "object", group : "Data", visibility: "hidden"}
		},
		aggregations : {

			/**
			 * Date Ranges for selected dates of the YearPicker
			 * @since 1.74
			 */
			selectedDates : {type : "sap.ui.unified.DateRange", multiple : true, singularName : "selectedDate" }
		},
		events : {

			/**
			 * Year selection changed
			 */
			select : {},

			/**
			 * The <code>pageChange</code> event is fired if the displayed years are changed by user navigation.
			 * @since 1.38.0
			 */
			pageChange : {}
		}
	}, renderer: YearPickerRenderer});

	/* eslint-disable no-lonely-if */

	YearPicker.prototype.init = function(){
		var oInitialDate = UI5Date.getInstance();
		oInitialDate.setFullYear(2000);
		this.setProperty("date", oInitialDate);
		// to format year with era in Japanese
		this._oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyyMMdd", calendarType: CalendarType.Gregorian});

		this._oMinDate = CalendarUtils._minDate(this._getPrimaryCalendarType());
		this._oMaxDate = CalendarUtils._maxDate(this._getPrimaryCalendarType());
	};

	YearPicker.prototype.onBeforeRendering = function() {
		// to format year with era in Japanese
		this._oYearFormat = DateFormat.getDateInstance({format: "y", calendarType: this._getPrimaryCalendarType()});
	};

	YearPicker.prototype.onAfterRendering = function(){
		_initItemNavigation.call(this);
		this.focus();
	};

	YearPicker.prototype.exit = function () {
		if (this._aMPSelectedDates && this._aMPSelectedDates.length) {
			this._aMPSelectedDates.forEach(function(oDateRange) {
				oDateRange.destroy();
			});
			this._aMPSelectedDates = undefined;
		}
	};

	YearPicker.prototype.getFocusDomRef = function(){
		return this.getDomRef() && this._oItemNavigation.getItemDomRefs()[this._iSelectedIndex];
	};

	/**
	 * Sets year for the YearPicker.
	 * @deprecated as of version 1.34, replaced by <code>setDate/code>
	 * @param {int} iCount The counter to be set to
	 * @returns {this} this for chaining
	*/
	YearPicker.prototype.setYear = function(iYear){

		// no rerendering needed, just select new year or update years
		this.setProperty("year", iYear);
		iYear = this.getProperty("year"); // to have type conversion, validation....

		var oDate = new CalendarDate(iYear, 0, 1, this._getPrimaryCalendarType()),
			oSelectedDates = this._getSelectedDates()[0],
			oYearPickerSelectedDates = this.getAggregation("selectedDates");

		if (!oSelectedDates || this.getIntervalSelection()) {
			return this;
		}

		if (!this._oSelectedDatesControlOrigin) {
			if (!oYearPickerSelectedDates || !oYearPickerSelectedDates.length) {
				this.addAggregation("selectedDates", oSelectedDates);
			}
			!this.getIntervalSelection() && oSelectedDates.setStartDate(oDate.toLocalJSDate());
		}

		this.setDate(oDate.toLocalJSDate());

		return this;

	};

	/**
	 * Setter for the <code>date</code> property
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate a date instance
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	YearPicker.prototype.setDate = function(oDate){
		var oMaxYear = CalendarUtils._maxDate(this.getProperty("primaryCalendarType")).getYear(),
			oCalDate, iYear, iYears, iHalfRange;

		// check the given object if it's a JS Date object
		// null is a default value so it should not throw error but set it instead
		oDate && CalendarUtils._checkJSDateObject(oDate);

		iYear = oDate.getFullYear();
		CalendarUtils._checkYearInValidRange(iYear);

		oCalDate = CalendarDate.fromLocalJSDate(oDate, this._getPrimaryCalendarType());
		oCalDate.setMonth(0, 1);

		this.setProperty("date", oDate);
		/**
		 * @deprecated As of version 1.34
		 */
		this.setProperty("year", oCalDate.getYear());
		this._oDate = oCalDate;

		iYears = this.getYears();
		iHalfRange = Math.floor(iYears / 2);

		if (oDate.getFullYear() < iHalfRange) {
			this._iSelectedIndex = oDate.getFullYear() - 1;
		} else if (oDate.getFullYear() > oMaxYear - iHalfRange) {
			this._iSelectedIndex = oMaxYear + iYears - oDate.getFullYear() - 1;
		} else {
			this._iSelectedIndex = iHalfRange;
		}
		this.setProperty("_middleDate", oCalDate);

		return this;

	};

	/**
	* @returns {sap.ui.unified.calendar.CalendarDate} The date, representing the year
	* @private
	*/
	YearPicker.prototype._getDate = function(){

		if (!this._oDate) {
			var iYear = this.getDate().getFullYear();
			this._oDate = new CalendarDate(iYear, 0, 1, this._getPrimaryCalendarType());
		}

		return this._oDate;

	};

	YearPicker.prototype._getPrimaryCalendarType = function(){
		return this.getProperty("primaryCalendarType") || Configuration.getCalendarType();
	};

	/**
	 * Sets the control instance which contains the selectedDates
	 * to the YearPicker control instance
	 * @ui5-restricted sap.m.DateRangeSelection
	 * @private
	 * @param {sap.ui.core.Control} oControl containing the selected dates
	 */
	YearPicker.prototype._setSelectedDatesControlOrigin = function (oControl) {
		this._oSelectedDatesControlOrigin = oControl;
	};

	YearPicker.prototype.getSelectedDates = function(){

		if (this._oSelectedDatesControlOrigin) {
			return this._oSelectedDatesControlOrigin.getSelectedDates();
		}

		return this.getAggregation("selectedDates");
	};

	YearPicker.prototype._getSelectedDates = function() {
		var oSelectedDates = this.getSelectedDates();

		if (oSelectedDates) {
			return oSelectedDates;
		} else if (!this._aMPSelectedDates || !this._aMPSelectedDates.length) {
			this._aMPSelectedDates = [new DateRange()];
			this._aMPSelectedDates[0].setStartDate(this._getDate().toLocalJSDate());

			return this._aMPSelectedDates;
		} else {
			return this._aMPSelectedDates;
		}
	};

	YearPicker.prototype.setPrimaryCalendarType = function(sCalendarType){

		this.setProperty("primaryCalendarType", sCalendarType);

		this._oYearFormat = DateFormat.getDateInstance({format: "y", calendarType: sCalendarType});

		if (this._oDate) {
			this._oDate = new CalendarDate(this._oDate, sCalendarType);
			this._oDate.setMonth(0, 1);
		}
		//The min and max dates are given in gregorian values, but when getters are called they are calendar relevant -
		//i.e. maxdate date for islamic corresponds to 9666/3/30.
		//This is why we need to reinstantiate min/max date. If we don't we would again return the same dates for min/max
		this._oMinDate = new CalendarDate(this._oMinDate, sCalendarType);
		this._oMaxDate = new CalendarDate(this._oMaxDate, sCalendarType);

		if (this._getSecondaryCalendarType()) {
			this.setColumns(2);
			this.setYears(8);
		}

		return this;

	};

	/**
	 * displays the next page
	 *
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	YearPicker.prototype.nextPage = function(){

		this._updatePage(true, this._oItemNavigation.getFocusedIndex());

		return this;

	};

	/**
	 * displays the previous page
	 *
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	YearPicker.prototype.previousPage = function(){

		this._updatePage(false, this._oItemNavigation.getFocusedIndex());

		return this;

	};

	YearPicker.prototype.onsapspace = function(oEvent) {
		oEvent.preventDefault();
	};

	YearPicker.prototype.onsapselect = function(oEvent){

		// focused item must be selected
		var iIndex = this._oItemNavigation.getFocusedIndex();

		var bSelected = this._selectYear(iIndex);
		if (bSelected) {
			this.fireSelect();
		}

	};

	YearPicker.prototype.onmouseover = function(oEvent) {
		var oTarget = oEvent.target,
			oSelectedDates = this._getSelectedDates()[0],
			oStartDate, oFocusedDate, sYyyymmdd;

		if (!oSelectedDates) {
			return;
		}

		if (oSelectedDates.getStartDate()) {
			oStartDate = CalendarDate.fromLocalJSDate(oSelectedDates.getStartDate(), this._getPrimaryCalendarType());
			oStartDate.setMonth(0, 1);
		}

		if (oTarget.classList.contains("sapUiCalItem")) {
			sYyyymmdd = oTarget.getAttribute("data-sap-year-start");
			oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(sYyyymmdd), this._getPrimaryCalendarType());

			if (this._isSelectionInProgress()) {
				this._markInterval(oStartDate, oFocusedDate);
			}
		}
	};

	YearPicker.prototype.onmousedown = function(oEvent) {
		this._oMousedownPosition = {
			clientX: oEvent.clientX,
			clientY: oEvent.clientY
		};
	};

	YearPicker.prototype.onmouseup = function(oEvent){
		var oTarget = oEvent.target,
			oSelectedDates = this._getSelectedDates()[0],
			iIndex, sYyyymmdd, oStartDate, oFocusedDate,
			$DomRefs = this._oItemNavigation.getItemDomRefs();

		// fire select event on mouseup to prevent closing MonthPicker during click
		if (this._bMousedownChange) {
			this._bMousedownChange = false;

			if (this.getIntervalSelection() && oTarget.classList.contains("sapUiCalItem") && oSelectedDates) {
				sYyyymmdd = oTarget.getAttribute("data-sap-year-start");
				oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(sYyyymmdd), this._getPrimaryCalendarType());
				oStartDate = CalendarDate.fromLocalJSDate(oSelectedDates.getStartDate(), this._getPrimaryCalendarType());
				oStartDate.setMonth(0, 1);

				if (!oFocusedDate.isSame(oStartDate) && !oSelectedDates.getEndDate()) {
					iIndex = $DomRefs.index(oTarget);
					this._selectYear.call(this, iIndex);
					this._oItemNavigation.focusItem(iIndex);
				}
			}

			this.fireSelect();
		} else if (Device.support.touch
			&& this._isValueInThreshold(this._oMousedownPosition.clientX, oEvent.clientX, 10)
			&& this._isValueInThreshold(this._oMousedownPosition.clientY, oEvent.clientY, 10)
		) {
			iIndex = this._oItemNavigation.getFocusedIndex();
			if (!$DomRefs[iIndex].classList.contains("sapUiCalItemDsbl")) {
				this._selectYear(iIndex);
				this.fireSelect();
			}
		}

	};

	YearPicker.prototype._markInterval = function(oStartDate, oEndDate) {
		var aDomRefs = this._oItemNavigation.getItemDomRefs(),
			oFocusedDate, sYyyymmdd, i;

		//swap if necessary
		if (oStartDate.isAfter(oEndDate)) {
			oEndDate = [oStartDate, oStartDate = oEndDate][0];
		}

		for (i = 0; i < aDomRefs.length; ++i) {
			sYyyymmdd = aDomRefs[i].getAttribute("data-sap-year-start");
			oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(sYyyymmdd), this._getPrimaryCalendarType());

			if (this._bMousedownChange) {
				if ((oFocusedDate.isSame(oStartDate) || oFocusedDate.isSame(oEndDate)) && !CalendarUtils._isOutside(oFocusedDate, this._oMinDate, this._oMaxDate)) {
					jQuery(aDomRefs[i]).addClass("sapUiCalItemSel");
				} else {
					jQuery(aDomRefs[i]).removeClass("sapUiCalItemSel");
				}
			}

			if (CalendarUtils._isBetween(oFocusedDate, oStartDate, oEndDate) && CalendarUtils._isBetween(oFocusedDate, this._oMinDate, this._oMaxDate)) {
				jQuery(aDomRefs[i]).addClass("sapUiCalItemSelBetween");
			} else {
				jQuery(aDomRefs[i]).removeClass("sapUiCalItemSelBetween");
			}
		}

	};

	/**
	 * Return the first date of the first rendered year
	 * <b>Note:</b> If the YearPicker is not rendered no date is returned
	 *
	 * @returns {Date|module:sap/ui/core/date/UI5Date} A date instance
	 * @public
	 * @since 1.38.0
	 */
	YearPicker.prototype.getFirstRenderedDate = function(){

		var oFirstDate;

		if (this.getDomRef()) {
			var aDomRefs = this._oItemNavigation.getItemDomRefs();
			oFirstDate = this._oFormatYyyymmdd.parse(jQuery(aDomRefs[0]).attr("data-sap-year-start"));
		}

		return oFirstDate;

	};

	/**
	 * Returns if value is in predefined threshold.
	 *
	 * @private
	 */
	YearPicker.prototype._isValueInThreshold = function (iReference, iValue, iThreshold) {
		var iLowerThreshold = iReference - iThreshold,
			iUpperThreshold = iReference + iThreshold;

		return iValue >= iLowerThreshold && iValue <= iUpperThreshold;
	};

	YearPicker.prototype.setSecondaryCalendarType = function(sCalendarType){
		this.setProperty("secondaryCalendarType", sCalendarType);
		if (this._getSecondaryCalendarType()) {
			this.setColumns(2);
			this.setYears(8);
		}
		return this;
	};

	/**
	 * Returns if there is secondary calendar type set and if it is different from the primary one.
	 * @returns {string} if there is secondary calendar type set and if it is different from the primary one
	 */
	YearPicker.prototype._getSecondaryCalendarType = function(){
		var sSecondaryCalendarType = this.getSecondaryCalendarType();

		if (sSecondaryCalendarType === this._getPrimaryCalendarType()) {
			return undefined;
		}

		return sSecondaryCalendarType;
	};

	/**
	 * Calculates the first and last displayed date about a given year.
	 * @param {CalendarDate} oDate the date about which the new dates are calculated
	 * @returns {object} two values - start and end date
	 */
	YearPicker.prototype._getDisplayedSecondaryDates = function(oDate){
		var sSecondaryCalendarType = this.getSecondaryCalendarType(),
			oFirstDate = new CalendarDate(oDate, oDate.getCalendarType()),
			oLastDate = new CalendarDate(oDate, oDate.getCalendarType());

		oFirstDate.setMonth(0, 1);
		oFirstDate = new CalendarDate(oFirstDate, sSecondaryCalendarType);

		oLastDate.setYear(oLastDate.getYear() + 1); // create first day of next year
		oLastDate.setMonth(0, 1);
		oLastDate.setDate(oLastDate.getDate() - 1); // go back one day to receive last day in previous year
		oLastDate = new CalendarDate(oLastDate, sSecondaryCalendarType);

		return {start: oFirstDate, end: oLastDate};
	};

	/*
	 * Use rendered locale for stand alone control
	 * But as Calendar can have an own locale, use this one if used inside Calendar
	 */
	YearPicker.prototype._getLocale = function(){

		var oParent = this._oSelectedDatesControlOrigin;

		if (oParent && oParent._getLocale) {
			return oParent._getLocale();
		} else if (!this._sLocale) {
			this._sLocale = Configuration.getFormatSettings().getFormatLocale().toString();
		}

		return this._sLocale;

	};

	/*
	 * gets localeData for used locale
	 * Use rendered locale for stand alone control
	 * But as Calendar can have an own locale, use this one if used inside Calendar
	 */
	YearPicker.prototype._getLocaleData = function(){

		var oParent = this._oSelectedDatesControlOrigin;

		if (oParent && oParent._getLocaleData) {
			return oParent._getLocaleData();
		} else if (!this._oLocaleData) {
			var sLocale = this._getLocale();
			var oLocale = new Locale(sLocale);
			this._oLocaleData = LocaleData.getInstance(oLocale);
		}

		return this._oLocaleData;

	};

	/**
	 * Calculated which is the first year to be rendered and changes the given date to it if needed.
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date to be checked whether it is outside min and max date
	 * @returns {sap.ui.unified.calendar.CalendarDate} The checked date or min or max date if the checked one is outside
	 * @private
	 */
	YearPicker.prototype._checkFirstDate = function(oDate){

		// check if first date is outside of min and max date
		var iYears = this.getYears(),
			oMaxStartYear = new CalendarDate(this._oMaxDate, this._getPrimaryCalendarType());

		if (!oMaxStartYear.isSame(CalendarUtils._maxDate(this._getPrimaryCalendarType()))) {
			return oDate;
		}

		oMaxStartYear.setYear(oMaxStartYear.getYear() - iYears + 1);
		if (oDate.isAfter(oMaxStartYear) && oDate.getYear() != oMaxStartYear.getYear()) {
			oDate = new CalendarDate(oMaxStartYear, this._getPrimaryCalendarType());
			oDate.setMonth(0, 1);
		} else if (oDate.isBefore(this._oMinDate) && oDate.getYear() != this._oMinDate.getYear()) {
			oDate = new CalendarDate(this._oMinDate, this._getPrimaryCalendarType());
			oDate.setMonth(0, 1);
		}

		return oDate;

	};

	/**
	* @param {sap.ui.unified.calendar.CalendarDate} oDate The date do be checked
	* @returns {boolean} Whether the date is enabled
	* @private
	*/
	YearPicker.prototype._checkDateEnabled = function(oDate){

		var bEnabled = true;

		if ((oDate.isAfter(this._oMaxDate) && oDate.getYear() != this._oMaxDate.getYear()) ||
				(oDate.isBefore(this._oMinDate) && oDate.getYear() != this._oMinDate.getYear())) {
			bEnabled = false;
		}

		return bEnabled;

	};

	YearPicker.prototype._updatePage = function (bForward, iSelectedIndex, bFireEvent){

		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var oFirstDate =  CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(jQuery(aDomRefs[0]).attr("data-sap-year-start")), this._getPrimaryCalendarType());
		var iYears = this.getYears();

		if (bForward) {
			var oMaxDate = new CalendarDate(this._oMaxDate, this._getPrimaryCalendarType());
			oMaxDate.setYear(oMaxDate.getYear() - iYears + 1);
			if (oFirstDate.isBefore(oMaxDate)) {
				oFirstDate.setYear(oFirstDate.getYear() + iYears);
				if (oFirstDate.isAfter(oMaxDate)){
					iSelectedIndex = iSelectedIndex + (oFirstDate.getYear() - oMaxDate.getYear());
					if (iSelectedIndex > iYears - 1) {
						iSelectedIndex = iYears - 1;
					}
					oFirstDate = new CalendarDate(this._oMaxDate, this._getPrimaryCalendarType());
					this._oDate.setMonth(0, 1);
				}
			} else {
				return;
			}
		} else {
			if (oFirstDate.isAfter(this._oMinDate)) {
				oFirstDate.setYear(oFirstDate.getYear() - iYears);
				if (oFirstDate.isBefore(this._oMinDate)) {
					iSelectedIndex = iSelectedIndex - (this._oMinDate.getYear() - oFirstDate.getYear());
					if (iSelectedIndex < 0) {
						iSelectedIndex = 0;
					}
					oFirstDate = new CalendarDate(this._oMinDate, this._getPrimaryCalendarType());
				}
			} else {
				return;
			}
		}

		oFirstDate.setYear(oFirstDate.getYear() + Math.floor(iYears / 2));
		this._iSelectedIndex = iSelectedIndex;
		this.setProperty("_middleDate", oFirstDate);

		if (bFireEvent) {
			this.firePageChange();
		}

	};

	YearPicker.prototype._selectYear = function (iIndex) {

		var aDomRefs = this._oItemNavigation.getItemDomRefs(),
			$DomRef = jQuery(aDomRefs[iIndex]),
			sYyyymmdd = $DomRef.attr("data-sap-year-start"),
			oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(sYyyymmdd), this._getPrimaryCalendarType()),
			oSelectedDates = this._getSelectedDates()[0],
			oYearPickerSelectedDates = this.getAggregation("selectedDates"),
			oStartDate;

		if ($DomRef.hasClass("sapUiCalItemDsbl")) {
			return false; // don't select disabled items
		}

		if (!this._isSelectionInProgress()) {
			// do not re-render in the middle of selection interval
			// if rendering happens, the year picker will immediately render the beginning of the interval in the middle
			var bSuppressInvalidate = true;
		}

		/**
		 * @deprecated As of version 1.34
		 */
		this.setProperty("year", oFocusedDate.getYear(), bSuppressInvalidate);
		this.setProperty("date", oFocusedDate.toLocalJSDate(), bSuppressInvalidate);

		if (!oSelectedDates) {
			return true;
		}

		if (!this._oSelectedDatesControlOrigin) {
			if (!oYearPickerSelectedDates || !oYearPickerSelectedDates.length) {
				this.addAggregation("selectedDates", oSelectedDates);
			}
			!this.getIntervalSelection() && oSelectedDates.setStartDate(oFocusedDate.toLocalJSDate(), bSuppressInvalidate);
		}

		if (this.getIntervalSelection()) {
			if (!oSelectedDates.getStartDate()) {
				oSelectedDates.setStartDate(oFocusedDate.toLocalJSDate(), bSuppressInvalidate);
			} else if (!oSelectedDates.getEndDate()) {
				oStartDate = CalendarDate.fromLocalJSDate(oSelectedDates.getStartDate(), this._getPrimaryCalendarType());
				if (oFocusedDate.isBefore(oStartDate)) {
					oSelectedDates.setEndDate(oStartDate.toLocalJSDate(), bSuppressInvalidate);
					oSelectedDates.setStartDate(oFocusedDate.toLocalJSDate(), bSuppressInvalidate);
				} else {
					oSelectedDates.setEndDate(oFocusedDate.toLocalJSDate(), bSuppressInvalidate);
				}
			} else {
				oSelectedDates.setStartDate(oFocusedDate.toLocalJSDate(), bSuppressInvalidate);
				oSelectedDates.setEndDate(undefined, bSuppressInvalidate);
			}
		}

		if (bSuppressInvalidate) {
			for (var i = 0; i < aDomRefs.length; i++) {
				$DomRef = jQuery(aDomRefs[i]);
				sYyyymmdd = $DomRef.attr("data-sap-year-start");
				var oCurrentDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(sYyyymmdd), this._getPrimaryCalendarType());

				var bApplySelection = this._fnShouldApplySelection(oCurrentDate);
				var bApplySelectionBetween = this._fnShouldApplySelectionBetween(oCurrentDate);

				if (bApplySelection) {
					$DomRef.addClass("sapUiCalItemSel");
					$DomRef.removeClass("sapUiCalItemSelBetween");
					$DomRef.attr("aria-selected", "true");
				}

				if (bApplySelectionBetween) {
					$DomRef.addClass("sapUiCalItemSelBetween");
					$DomRef.attr("aria-selected", "true");
				}

				if (!bApplySelection && !bApplySelectionBetween) {
					$DomRef.removeClass("sapUiCalItemSel");
					$DomRef.removeClass("sapUiCalItemSelBetween");
					$DomRef.attr("aria-selected", "false");
				}
			}
		}

		return true;

	};

	YearPicker.prototype._isSelectionInProgress = function() {
		var oSelectedDates = this._getSelectedDates()[0];
		if (!oSelectedDates) {
			return false;
		}
		return this.getIntervalSelection() && oSelectedDates.getStartDate() && !oSelectedDates.getEndDate();
	};

	function _initItemNavigation(){

		var oFocusedDate = this.getDate()
			? CalendarDate.fromLocalJSDate(this.getDate(), this._getPrimaryCalendarType())
			: this._getDate(),
			oRootDomRef = this.getDomRef(),
			aDomRefs = this.$().find(".sapUiCalItem"),
			iIndex, sYyyymmdd, oCurrentDate, i;

		for (i = 0; i < aDomRefs.length; ++i) {
			sYyyymmdd = aDomRefs[i].getAttribute("data-sap-year-start");
			oCurrentDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(sYyyymmdd), this._getPrimaryCalendarType());

			if (oCurrentDate.isSame(oFocusedDate)) {
				iIndex = i;
				break;
			}
		}

		if (!this._oItemNavigation) {
			this._oItemNavigation = new ItemNavigation();
			this._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, _handleAfterFocus, this);
			this._oItemNavigation.attachEvent(ItemNavigation.Events.FocusAgain, _handleFocusAgain, this);
			this._oItemNavigation.attachEvent(ItemNavigation.Events.BorderReached, _handleBorderReached, this);
			this.addDelegate(this._oItemNavigation);
			this._oItemNavigation.setHomeEndColumnMode(true, true);
			this._oItemNavigation.setDisabledModifiers({
				sapnext: ["alt", "meta"],
				sapprevious: ["alt", "meta"],
				saphome : ["alt", "meta"],
				sapend : ["meta"]
			});
		}
		this._oItemNavigation.setRootDomRef(oRootDomRef);
		this._oItemNavigation.setItemDomRefs(aDomRefs);
		this._oItemNavigation.setCycling(false);
		this._oItemNavigation.setColumns(this.getColumns(), true);
		if (CalendarUtils._isBetween(oFocusedDate, this._oMinDate, this._oMaxDate, true)) {
			this._oItemNavigation.setFocusedIndex(iIndex);
		}
		this._oItemNavigation.setPageSize(aDomRefs.length); // to make sure that pageup/down goes out of month

	}

	function _handleAfterFocus(oControlEvent){

		var iIndex = oControlEvent.getParameter("index"),
			oEvent = oControlEvent.getParameter("event"),
			oTarget = this._oItemNavigation.aItemDomRefs[iIndex],
			oSelectedDates = this._getSelectedDates()[0],
			oStartDate, oFocusedDate, sYyyymmdd;

		if (!oEvent) {
			return; // happens if focus is set via ItemNavigation.focusItem directly
		}

		if (oEvent.type === "mousedown") {
			// as no click event is fired in some cases
			this._handleMousedown(oEvent, iIndex);
		} else if (oEvent.type === "sapnext" || oEvent.type === "sapprevious") {
			if (!oSelectedDates) {
				return;
		}

			if (oSelectedDates.getStartDate()) {
				oStartDate = CalendarDate.fromLocalJSDate(oSelectedDates.getStartDate(), this._getPrimaryCalendarType());
				oStartDate.setMonth(0, 1);
	}

			sYyyymmdd = oTarget.getAttribute("data-sap-year-start");
			oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(sYyyymmdd), this._getPrimaryCalendarType());

			if (this._isSelectionInProgress()) {
				this._markInterval(oStartDate, oFocusedDate);
			}
		}

		}

	function _handleFocusAgain(oControlEvent){

		_handleAfterFocus.call(this, oControlEvent);
	}

	YearPicker.prototype._handleMousedown = function(oEvent, iIndex){

		if (oEvent.button || Device.support.touch && !Device.system.combi) {
			// only use left mouse button or not touch
			return;
		}

		var bSelected = this._selectYear(iIndex);
		if (bSelected) {
			this._bMousedownChange = true;
		}

		oEvent.preventDefault(); // to prevent focus set outside of DatePicker
		oEvent.setMark("cancelAutoClose");

	};

	function _handleBorderReached(oControlEvent){

		var oEvent = oControlEvent.getParameter("event"),
			iIndex = this._oItemNavigation.getFocusedIndex(),
			iYears = this.getYears(),
			iColumns = this.getColumns(),
			oSelectedDates = this._getSelectedDates()[0],
			aDomRefs = this._oItemNavigation.getItemDomRefs(),
			oStartDate, oFocusedDate, sYyyymmdd;

		if (oSelectedDates && oSelectedDates.getStartDate()) {
			oStartDate = CalendarDate.fromLocalJSDate(oSelectedDates.getStartDate(), this._getPrimaryCalendarType());
			oStartDate.setMonth(0, 1);
		}

		if (oEvent.type) {
			if (iColumns === 0) {
				iColumns = iYears;
			}

			switch (oEvent.type) {
			case "sapnext":
			case "sapnextmodifiers":
				if (oEvent.keyCode === KeyCodes.ARROW_DOWN && iColumns < iYears) {
					sYyyymmdd = aDomRefs[iIndex - iYears + iColumns].getAttribute("data-sap-year-start");
					oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(sYyyymmdd), this._getPrimaryCalendarType());

					//same column in first row of next group (only if more than one row)
					this._updatePage(true, iIndex - iYears + iColumns, true);
					this._iSelectedIndex = iIndex - iYears + iColumns;
				} else {
					sYyyymmdd = aDomRefs[0].getAttribute("data-sap-year-start");
					oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(sYyyymmdd), this._getPrimaryCalendarType());

					// first year in next group
					this._updatePage(true, 0, true);
				}
				break;

			case "sapprevious":
			case "sappreviousmodifiers":
				if (oEvent.keyCode === KeyCodes.ARROW_UP && iColumns < iYears) {
					sYyyymmdd = aDomRefs[iYears - iColumns + iIndex].getAttribute("data-sap-year-start");
					oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(sYyyymmdd), this._getPrimaryCalendarType());

					//same column in last row of previous group (only if more than one row)
					this._updatePage(false, iYears - iColumns + iIndex, true);
					this._iSelectedIndex = iYears - iColumns + iIndex;
				} else {
					sYyyymmdd = aDomRefs[iYears - 1].getAttribute("data-sap-year-start");
					oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(sYyyymmdd), this._getPrimaryCalendarType());

					// last year in previous group
					this._updatePage(false, iYears - 1, true);
				}
				break;

			case "sappagedown":
				sYyyymmdd = aDomRefs[iIndex].getAttribute("data-sap-year-start");
				oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(sYyyymmdd), this._getPrimaryCalendarType());

				// same index in next group
				this._updatePage(true, iIndex, true);
				break;

			case "sappageup":
				sYyyymmdd = aDomRefs[iIndex].getAttribute("data-sap-year-start");
				oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse(sYyyymmdd), this._getPrimaryCalendarType());

				// same index in previous group
				this._updatePage(false, iIndex, true);
				break;

			default:
				break;
			}
		}

		this._isSelectionInProgress() && this._markInterval(oStartDate, oFocusedDate);
	}


	/**
	 * Determines if a given date is the same as selected start or end date
	 *
	 * @private
	 * @param {sap.ui.unified.calendar.CalendarDate} oCurrentDate
	 */
	YearPicker.prototype._fnShouldApplySelection = function(oCurrentDate) {
		var oSelectedDates = this._getSelectedDates()[0],
			oStartDate, oEndDate;

		if (!oSelectedDates) {
			return false;
		}

		oStartDate = oSelectedDates.getStartDate();
		oEndDate = oSelectedDates.getEndDate();

		if (oStartDate) {
			oStartDate = CalendarDate.fromLocalJSDate(oStartDate, this._getPrimaryCalendarType());
			oStartDate.setMonth(0, 1);
		}

		if (this.getIntervalSelection() && oStartDate && oEndDate) {
			oEndDate = CalendarDate.fromLocalJSDate(oEndDate, this._getPrimaryCalendarType());
			oEndDate.setMonth(0, 1);
			if (oCurrentDate.isSame(oStartDate) || oCurrentDate.isSame(oEndDate)) {
				return true;
			}
		} else if (oStartDate && oCurrentDate.isSame(oStartDate)) {
			return true;
		}
		return false;
	};

	/**
	 * Determines if a given date is between the selected start and end date
	 *
	 * @private
	 * @param {sap.ui.unified.calendar.CalendarDate} oCurrentDate
	 */
	YearPicker.prototype._fnShouldApplySelectionBetween = function(oCurrentDate) {
		var oSelectedDates = this._getSelectedDates()[0],
			oStartDate, oEndDate;

		if (!oSelectedDates) {
			return false;
		}
		oStartDate = oSelectedDates.getStartDate();
		oEndDate = oSelectedDates.getEndDate();

		if (this.getIntervalSelection() && oStartDate && oEndDate) {
			oStartDate = CalendarDate.fromLocalJSDate(oStartDate, this._getPrimaryCalendarType());
			oStartDate.setMonth(0, 1);
			oEndDate = CalendarDate.fromLocalJSDate(oEndDate, this._getPrimaryCalendarType());
			oEndDate.setMonth(0, 1);
			if (CalendarUtils._isBetween(oCurrentDate, oStartDate, oEndDate)) {
				return true;
			}
		}

		return false;
	};

	return YearPicker;

});