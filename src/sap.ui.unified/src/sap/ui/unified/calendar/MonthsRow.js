/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.CalendarMonthInterval.
sap.ui.define([
	"sap/base/i18n/Formatting",
	'sap/ui/core/Control',
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	'sap/ui/core/LocaleData',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/library',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/Locale',
	"./MonthsRowRenderer",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/thirdparty/jquery",
	"sap/ui/unified/DateRange",
	"sap/ui/core/date/UI5Date",
	'sap/ui/core/InvisibleText'
], function(
	Formatting,
	Control,
	Element,
	Library,
	LocaleData,
	ItemNavigation,
	CalendarUtils,
	CalendarDate,
	library,
	DateFormat,
	Locale,
	MonthsRowRenderer,
	containsOrEquals,
	jQuery,
	DateRange,
	UI5Date,
	InvisibleText
) {
	"use strict";

	/*
	 * <code>CalendarDate</code> objects are used inside the <code>MonthsRow</code>, whereas UI5Date or JavaScript dates are used in the API.
	 * This means that a conversion must be performed for the API functions.
	 */

	/**
	 * Constructor for a new <code>MonthsRow</code>.
	 * It shows a calendar with month granularity
	 *
	 * <b>Note:</b> This is used inside the CalendarMonthInterval, not for standalone usage.
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Renders a row of months using ItemNavigation. There is no paging or navigation outside the rendered area implemented.
	 * This is done inside the CalendarMonthInterval.
	 * If used inside the CalendarMonthInterval the properties and aggregation are directly taken from the parent
	 * (to not duplicate and synchronize DateRanges and so on...).
	 *
	 * The MontsRow works with UI5Date or JavaScript Date objects, but only the month and the year are used to display and interact.
	 * As representation for a month, the 1st of the month will always be returned in the API.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.32.0
	 * @alias sap.ui.unified.calendar.MonthsRow
	 */
	var MonthsRow = Control.extend("sap.ui.unified.calendar.MonthsRow", /** @lends sap.ui.unified.calendar.MonthsRow.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {
			/**
			 * A date as UI5Date or JavaScript Date object. The month including this date is rendered and this date is focused initially (if no other focus is set).
			 * If the date property is not in the range <code>startDate</code> + <code>months</code> in the rendering phase,
			 * it is set to the <code>startDate</code>.
			 * So after setting the <code>startDate</code> the date should be set to be in the visible range.
			 */
			date : {type : "object", group : "Data"},

			/**
			 * Start date, as UI5Date or JavaScript Date object, of the row. The month of this date is the first month of the displayed row.
			 */
			startDate : {type : "object", group : "Data"},

			/**
			 * Number of months displayed
			 */
			months : {type : "int", group : "Appearance", defaultValue : 12},

			/**
			 * If set, interval selection is allowed
			 */
			intervalSelection : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * If set, only a single month or interval, if intervalSelection is enabled, can be selected
			 *
			 * <b>Note:</b> Selection of multiple intervals is not supported in the current version.
			 */
			singleSelection : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * If set, a header with the years is shown to visualize what month belongs to what year.
			 */
			showHeader : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * If set, the calendar type is used for display.
			 * If not set, the calendar type of the global configuration is used.
			 * @private
			 * @ui5-restricted sap.ui.unified.MonthsRow
			 * @since 1.108.0
			 */
			primaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance"},

			/**
			 * If set, the days are also displayed in this calendar type
			 * If not set, the dates are only displayed in the primary calendar type
			 * @private
			 * @ui5-restricted sap.ui.unified.MonthsRow
			 * @since 1.109.0
			 */
			 secondaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance"}
		},
		aggregations : {

			/**
			 * Date ranges for selected dates.
			 * If <code>singleSelection</code> is set, only the first entry is used.
			 *
			 * <b>Note:</b> Even if only one day is selected, the whole corresponding month is selected.
			 */
			selectedDates : {type : "sap.ui.unified.DateRange", multiple : true, singularName : "selectedDate"},

			/**
			 * Date ranges with type to visualize special months in the row.
			 * If one day is assigned to more than one type, only the first one will be used.
			 *
			 * <b>Note:</b> Even if only one day is set as a special day, the whole corresponding month is displayed in this way.
			 */
			specialDates : {type : "sap.ui.unified.DateTypeRange", multiple : true, singularName : "specialDate"}
		},
		associations: {

			/**
			 * Association to controls / IDs which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" },


			/**
			 * Association to the <code>CalendarLegend</code> explaining the colors of the <code>specialDates</code>.
			 *
			 * <b>Note</b> The legend does not have to be rendered but must exist, and all required types must be assigned.
			 * @since 1.38.5
			 */
			legend: { type: "sap.ui.unified.CalendarLegend", multiple: false}
		},
		events : {

			/**
			 * Month selection changed
			 */
			select : {},

			/**
			 * Month focus changed
			 */
			focus : {
				parameters : {
					/**
					 * First date, as UI5Date or JavaScript Date object, of the month that is focused.
					 */
					date : {type : "object"},
					/**
					 * If set, the focused date is not rendered yet. (This happens by navigating out of the visible area.)
					 */
					notVisible : {type : "boolean"}
				}
			}
		}
	}, renderer: MonthsRowRenderer});

	MonthsRow.prototype.init = function(){
		var sCalendarType = this._getPrimaryCalendarType();
		//need day in pattern because in islamic calendar 2 Month can start in one gregorianic calendar
		this._oFormatYyyymm = DateFormat.getInstance({pattern: "yyyyMMdd", calendarType: sCalendarType});
		this._oFormatOnlyYearLong = DateFormat.getInstance({pattern: "yyyy", calendarType: sCalendarType});
		this._oFormatLong = DateFormat.getInstance({pattern: "MMMM y", calendarType: sCalendarType});
		this._mouseMoveProxy = jQuery.proxy(this._handleMouseMove, this);
		this._rb = Library.getResourceBundleFor("sap.ui.unified");
	};

	MonthsRow.prototype.setPrimaryCalendarType = function (sCalendarType){
		this.setProperty("primaryCalendarType", sCalendarType);
		//need day in pattern because in islamic calendar 2 Month can start in one gregorianic calendar
		this._oFormatYyyymm = DateFormat.getInstance({pattern: "yyyyMMdd", calendarType: sCalendarType});
		this._oFormatLong = DateFormat.getInstance({pattern: "MMMM y", calendarType: sCalendarType});

		return this;
	};

	MonthsRow.prototype._getPrimaryCalendarType = function(){
		return this.getProperty("primaryCalendarType") || Formatting.getCalendarType();
	};

	MonthsRow.prototype.setSecondaryCalendarType = function (sCalendarType){
		this.setProperty("secondaryCalendarType", sCalendarType);
		this._oFormatYearInSecType = DateFormat.getDateInstance({format: "y", calendarType: sCalendarType});
		this._oFormatLongInSecType = DateFormat.getInstance({pattern: "MMMM y", calendarType: sCalendarType});

		return this;
	};

	MonthsRow.prototype._getSecondaryCalendarType = function () {
		var sSecondaryCalendarType = this.getSecondaryCalendarType();

		if (sSecondaryCalendarType === this._getPrimaryCalendarType()) {
			return undefined;
		}

		return sSecondaryCalendarType;
	};

	MonthsRow.prototype.exit = function(){

		if (this._oItemNavigation) {
			this.removeDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			delete this._oItemNavigation;
		}

		if (this._sInvalidateMonths) {
			clearTimeout(this._sInvalidateMonths);
		}

		if (this._invisibleDayHint) {
			this._invisibleDayHint.destroy();
			this._invisibleDayHint = null;
		}
	};

	MonthsRow.prototype.onAfterRendering = function(){

		_initItemNavigation.call(this);

		// check if day names are too big -> use smaller ones
		_checkNamesLength.call(this);

	};

	MonthsRow.prototype.onsapfocusleave = function(oEvent){

		if (!oEvent.relatedControlId || !containsOrEquals(this.getDomRef(), Element.getElementById(oEvent.relatedControlId).getFocusDomRef())) {
			if (this._bMouseMove) {
				_unbindMousemove.call(this, true);

				_selectMonth.call(this, this._getDate());
				this._bMoveChange = false;
				this._bMousedownChange = false;
				_fireSelect.call(this);
			}

			if (this._bMousedownChange) {
				// mouseup somewhere outside of control -> if focus left finish selection
				this._bMousedownChange = false;
				_fireSelect.call(this);
			}
		}

	};

	// overwrite removing of date ranged because invalidate don't get information about it
	MonthsRow.prototype.removeAllSelectedDates = function() {

		this._bDateRangeChanged = true;
		var aRemoved = this.removeAllAggregation("selectedDates");
		return aRemoved;

	};

	MonthsRow.prototype.destroySelectedDates = function() {

		this._bDateRangeChanged = true;
		var oDestroyed = this.destroyAggregation("selectedDates");
		return oDestroyed;

	};

	MonthsRow.prototype.removeAllSpecialDates = function() {

		this._bDateRangeChanged = true;
		var aRemoved = this.removeAllAggregation("specialDates");
		return aRemoved;

	};

	MonthsRow.prototype.destroySpecialDates = function() {

		this._bDateRangeChanged = true;
		var oDestroyed = this.destroyAggregation("specialDates");
		return oDestroyed;

	};

	/**
	 * Sets a date for the months row.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate a date instance
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	MonthsRow.prototype.setDate = function(oDate){
		if (oDate) {
			var oCalDate = CalendarDate.fromLocalJSDate(oDate, this.getProperty("primaryCalendarType"));
			this._oDate = oCalDate;
			_changeDate.call(this, oCalDate, false);
		}

		return this.setProperty("date", oDate);

	};

	/**
	 * Calculates the first and last displayed date about a given month.
	 * @param {integer} iCurrentMonth is the month on which the date calculations are based.
	 * @param {integer} iCurrentYear is the year on which the date calculations are based.
	 * @returns {object} object contains two values - start and end date (JSDates in secondary calendat type).
	 */
	MonthsRow.prototype._getDisplayedSecondaryDates = function (iCurrentMonth, iCurrentYear){
		var sSecondaryCalendarType = this._getSecondaryCalendarType(),
		oDate,
		oFirstDate,
		oLastDate;

		if (this._oDate) {
			oDate = new CalendarDate(this._oDate);
		} else {
			oDate = new CalendarDate(CalendarDate.fromLocalJSDate(UI5Date.getInstance()), this._getPrimaryCalendarType());
		}

		oDate.setYear(iCurrentYear);
		oDate.setMonth(iCurrentMonth);
		oDate.setDate(1);

		oFirstDate = new CalendarDate(oDate, sSecondaryCalendarType);
		oDate.setDate(CalendarUtils._daysInMonth(oDate));
		oLastDate = new CalendarDate(oDate, sSecondaryCalendarType);

		return {start: oFirstDate, end: oLastDate};
	};

	/**
	* @returns {sap.ui.unified.calendar.CalendarDate} the last set calendar date or the current date
	* @private
	*/
	MonthsRow.prototype._getDate = function(){

		if (!this._oDate) {
			this._oDate  = CalendarDate.fromLocalJSDate(UI5Date.getInstance(), this.getProperty("primaryCalendarType"));
		}

		return this._oDate;

	};


	/**
	 * Sets start date of the month row.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date} oStartDate A date instance
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 * @public
	 */
	MonthsRow.prototype.setStartDate = function(oStartDate){
		CalendarUtils._checkJSDateObject(oStartDate);
		var oCalDate, iYear, oOldDate;

		iYear = oStartDate.getFullYear();
		CalendarUtils._checkYearInValidRange(iYear);

		oCalDate = CalendarDate.fromLocalJSDate(oStartDate, this.getProperty("primaryCalendarType"));
		this.setProperty("startDate", oStartDate, true);
		this._oStartDate = oCalDate;
		this._oStartDate.setDate(1); // always use begin of month as start date

		if (this.getDomRef()) {
			oOldDate = this._getDate().toLocalJSDate();
			this._bNoRangeCheck = true;
			this.displayDate(oStartDate); // don't set focus
			this._bNoRangeCheck = false;
			if (oOldDate && this.checkDateFocusable(oOldDate)) {
				this.setDate(oOldDate);
			}
		}
		return this;

	};
	/**
	* @returns {sap.ui.unified.calendar.CalendarDate} the last start calendar date or 1st of the current month
	*/
	MonthsRow.prototype._getStartDate = function(){

		if (!this._oStartDate) {
			this._oStartDate = CalendarDate.fromLocalJSDate(UI5Date.getInstance(), this.getProperty("primaryCalendarType"));
			this._oStartDate.setDate(1); // always use begin of month as start date
		}

		return this._oStartDate;
	};

	/**
	 * Displays the month of a given date without setting the focus
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate date instance for focused date.
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	MonthsRow.prototype.displayDate = function(oDate){

		_changeDate.call(this, CalendarDate.fromLocalJSDate(oDate, this.getProperty("primaryCalendarType")), true);

		return this;

	};

	/*
	 * Use rendered locale for stand alone control
	 * But as Calendar can have an own locale, use this one if used inside Calendar
	 */
	MonthsRow.prototype._getLocale = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getLocale) {
			return oParent.getLocale();
		} else if (!this._sLocale) {
			this._sLocale = new Locale(Formatting.getLanguageTag()).toString();
		}

		return this._sLocale;

	};

	/*
	 * gets localeData for used locale
	 * Use rendered locale for stand alone control
	 * But as Calendar can have an own locale, use this one if used inside Calendar
	 */
	MonthsRow.prototype._getLocaleData = function(){

		var oParent = this.getParent();

		if (oParent && oParent._getLocaleData) {
			return oParent._getLocaleData();
		} else if (!this._oLocaleData) {
			var sLocale = this._getLocale();
			var oLocale = new Locale(sLocale);
			this._oLocaleData = LocaleData.getInstance(oLocale);
		}

		return this._oLocaleData;

	};

	/*
	 * get format for long date output depending on used locale
	 */
	MonthsRow.prototype._getFormatLong = function(){

		var sLocale = this._getLocale();

		if (this._oFormatLong.oLocale.toString() != sLocale) {
			var oLocale = new Locale(sLocale);
			this._oFormatLong = DateFormat.getInstance({style: "long", calendarType: this.getProperty("primaryCalendarType")} , oLocale);
		}

		return this._oFormatLong;

	};

	/*
	 * if used inside CalendarMonthInterval get the value from the parent
	 * To don't have sync issues...
	 */
	MonthsRow.prototype.getIntervalSelection = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getIntervalSelection) {
			return oParent.getIntervalSelection();
		} else {
			return this.getProperty("intervalSelection");
		}

	};

	/*
	 * if used inside CalendarMonthInterval get the value from the parent
	 * To don't have sync issues...
	 */
	MonthsRow.prototype.getSingleSelection = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getSingleSelection) {
			return oParent.getSingleSelection();
		} else {
			return this.getProperty("singleSelection");
		}

	};

	/*
	 * if used inside CalendarMonthInterval get the value from the parent
	 * To don't have sync issues...
	 */
	MonthsRow.prototype.getSelectedDates = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getSelectedDates) {
			return oParent.getSelectedDates();
		} else {
			return this.getAggregation("selectedDates", []);
		}

	};

	/*
	 * if used inside CalendarMonthInterval get the value from the parent
	 * To don't have sync issues...
	 */
	MonthsRow.prototype.getSpecialDates = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getSpecialDates) {
			return oParent.getSpecialDates();
		} else {
			return this.getAggregation("specialDates", []);
		}

	};

	/*
	 * if used inside CalendarMonthInterval get the value from the parent
	 * To don't have sync issues...
	 */
	MonthsRow.prototype._getShowHeader = function(){

		var oParent = this.getParent();

		if (oParent && oParent._getShowItemHeader) {
			return oParent._getShowItemHeader();
		} else {
			return this.getProperty("showHeader");
		}

	};

	/*
	 * if used inside CalendarMonthInterval get the value from the parent
	 * To don't have sync issues...
	 */
	MonthsRow.prototype.getAriaLabelledBy = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getAriaLabelledBy) {
			return oParent.getAriaLabelledBy();
		} else {
			return this.getAssociation("ariaLabelledBy", []);
		}

	};

	/**
	 * Sets the parent control instance which contains the legend
	 * to the MonthsRow control instance
	 * @ui5-restricted sap.m.PlanningCalendar
	 * @private
	 * @param {*} oControl containing the legend
	 */
	MonthsRow.prototype._setLegendControlOrigin = function (oControl) {
		this._oLegendControlOrigin = oControl;
	};

	/*
	 * if used inside CalendarMonthInterval get the value from the parent
	 * To don't have sync issues...
	 */
	MonthsRow.prototype.getLegend = function(){

		var oParent = this.getParent();

		if (this._oLegendControlOrigin) {
			return this._oLegendControlOrigin.getLegend();
		}

		if (oParent && oParent.getLegend) {
			return oParent.getLegend();
		} else {
			return this.getAssociation("ariaLabelledBy", []);
		}

	};

	MonthsRow.prototype._setAriaRole = function(sRole){
		this._ariaRole = sRole;

		return this;
	};

	MonthsRow.prototype._getAriaRole = function(){

		return this._ariaRole ? this._ariaRole : "gridcell";
	};

	MonthsRow.prototype._getMonthDescription = function() {
		return this._fnInvisibleHintFactory().getId();
	};

	MonthsRow.prototype._fnInvisibleHintFactory = function() {
		if (!this._invisibleDayHint) {
			this._invisibleDayHint = new InvisibleText({
				text: Library.getResourceBundleFor("sap.m").getText("SLIDETILE_ACTIVATE")
			}).toStatic();
		}

		return this._invisibleDayHint;
	};

	/**
	 * Checks if a date is selected and what kind of selected
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate A CalendarDate
	 * @returns {int} iSelected 0: not selected; 1: single day selected, 2: interval start, 3: interval end, 4: interval between, 5: one day interval (start = end)
	 * @private
	 */
	MonthsRow.prototype._checkDateSelected = function(oDate){
		var oRange,
			oStartDate, oEndDate,
			oTimeStamp,
			oStartTimeStamp = 0, oEndTimeStamp = 0,
			iSelected = 0,
			sCalendarType = this.getProperty("primaryCalendarType"),
			i,
			aSelectedDates,
			oMyDate;

		CalendarUtils._checkCalendarDate(oDate);

		aSelectedDates = this.getSelectedDates();
		oMyDate = new CalendarDate(oDate);
		oMyDate.setDate(1); //always use begin of month for test
		oTimeStamp = oMyDate.toUTCJSDate().getTime();

		for (i = 0; i < aSelectedDates.length; i++) {
			// initalize the time part of the start and end time
			oRange = aSelectedDates[i];
			oStartDate = oRange.getStartDate();
			oStartTimeStamp = 0;
			if (oStartDate) {
				oStartDate = CalendarDate.fromLocalJSDate(oStartDate, sCalendarType);
				oStartDate.setDate(1); // begin of month
				oStartTimeStamp = oStartDate.toUTCJSDate().getTime();
			}
			oEndDate = oRange.getEndDate();
			oEndTimeStamp = 0;
			if (oEndDate) {
				oEndDate = CalendarDate.fromLocalJSDate(oEndDate, sCalendarType);
				oEndDate.setDate(1); // begin of month
				oEndTimeStamp = oEndDate.toUTCJSDate().getTime();
			}

			if (oTimeStamp == oStartTimeStamp && !oEndDate ) {
				iSelected = 1; // single day selected
				break;
			} else if (oTimeStamp == oStartTimeStamp && oEndDate ) {
				iSelected = 2; // interval start
				if (oEndDate && oTimeStamp == oEndTimeStamp) {
					// one day interval
					iSelected = 5;
				}
				break;
			} else if (oEndDate && oTimeStamp == oEndTimeStamp) {
				iSelected = 3; // interval end
				break;
			} else if (oEndDate && oTimeStamp > oStartTimeStamp && oTimeStamp < oEndTimeStamp) {
				iSelected = 4; // interval between
				break;
			}

			if (this.getSingleSelection()) {
				// if single selection only check the first range
				break;
			}
		}

		return iSelected;

	};

	/**
	 * Gets the type of a single date checking the specialDates aggregation
	 * the first hit is used
	 * @param {object} oDate A date object.
	 * @returns {sap.ui.unified.calendar.CalendarDate} date type and tooltip defined in CalendarDayType
	 * @private
	 */
	MonthsRow.prototype._getDateType = function(oDate){
		CalendarUtils._checkCalendarDate(oDate);

		var oType, oRange, i,
			oStartDate, oStartTimeStamp = 0,
			oEndDate, oEndTimeStamp = 0,
			oTimeStamp,
			aSpecialDates = this.getSpecialDates(),
			oMyDate = new CalendarDate(oDate),
			sCalendarType = this.getProperty("primaryCalendarType");

		oMyDate.setDate(1); //always use begin of month for test
		oTimeStamp = oMyDate.toUTCJSDate().getTime();

		for (i = 0; i < aSpecialDates.length; i++) {
			// initialize the time part of the start and end time
			oRange = aSpecialDates[i];
			oStartDate = oRange.getStartDate();
			oStartTimeStamp = 0;
			if (oStartDate) {
				oStartDate = CalendarDate.fromLocalJSDate(oStartDate, sCalendarType);
				oStartDate.setDate(1); // begin of month
				oStartTimeStamp = oStartDate.toUTCJSDate().getTime();
			}
			oEndDate = oRange.getEndDate();
			oEndTimeStamp = 0;
			if (oEndDate) {
				oEndDate = CalendarDate.fromLocalJSDate(oEndDate, sCalendarType);
				oEndDate.setDate(CalendarUtils._daysInMonth(oEndDate));// end of the Month
				oEndTimeStamp = oEndDate.toUTCJSDate().getTime();
			}

			if ((oTimeStamp == oStartTimeStamp && !oEndDate) || (oTimeStamp >= oStartTimeStamp && oTimeStamp <= oEndTimeStamp)) {
				oType = {type: oRange.getType(), tooltip: oRange.getTooltip_AsString()};
				break;
			}
		}

		return oType;

	};

	/**
	 * Checks if a Month is enabled
	 * the min. and max. date of the CalendarMonthInterval are used
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate A CalendarDate
	 * @returns {boolean} Flag if enabled
	 * @private
	 */
	MonthsRow.prototype._checkMonthEnabled = function(oDate){

		CalendarUtils._checkCalendarDate(oDate);

		var oParent = this.getParent();

		if (oParent && oParent._oMinDate && oParent._oMaxDate) {
			if (CalendarUtils._isOutside(oDate, oParent._oMinDate, oParent._oMaxDate)) {
				return false;
			}
		}

		return true;

	};

	MonthsRow.prototype._handleMouseMove = function(oEvent){

		if (!this.$().is(":visible")) {
			// calendar was closed -> remove mousemove handler
			_unbindMousemove.call(this, true);
		}

		var $Target = jQuery(oEvent.target);

		if ($Target.hasClass("sapUiCalItemText")) {
			$Target = $Target.parent();
		}

		if ($Target.hasClass("sapUiCalItem")) {
			var oOldFocusedDate = this._getDate();
			var oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymm.parse($Target.attr("data-sap-month"), this.getProperty("primaryCalendarType")));
			oFocusedDate.setDate(1);

			if (!oFocusedDate.isSame(oOldFocusedDate)) {
				this.setDate(oFocusedDate.toLocalJSDate());
				_selectMonth.call(this, oFocusedDate, true);
				this._bMoveChange = true;
			}
		}

	};

	MonthsRow.prototype.onmouseup = function(oEvent){

		if (this._bMouseMove) {
			_unbindMousemove.call(this, true);

			// focus now selected day
			var oFocusedDate = this._getDate();
			var aDomRefs = this._oItemNavigation.getItemDomRefs();

			for ( var i = 0; i < aDomRefs.length; i++) {
				var $DomRef = jQuery(aDomRefs[i]);
				if ($DomRef.attr("data-sap-month") == this._oFormatYyyymm.format(oFocusedDate.toUTCJSDate(), true)) {
					$DomRef.trigger("focus");
					break;
				}
			}

			if (this._bMoveChange) {
				// selection was changed -> make it final
				var $Target = jQuery(oEvent.target);

				if ($Target.hasClass("sapUiCalItemText")) {
					$Target = $Target.parent();
				}

				if ($Target.hasClass("sapUiCalItem")) {
					oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymm.parse($Target.attr("data-sap-month")));
					oFocusedDate.setDate(1);
				}

				_selectMonth.call(this, oFocusedDate);
				this._bMoveChange = false;
				this._bMousedownChange = false;
				_fireSelect.call(this);
			}
		}

		if (this._bMousedownChange) {
			this._bMousedownChange = false;
			_fireSelect.call(this);
		}

	};

	MonthsRow.prototype.onsapselect = function(oEvent){

		// focused item must be selected
		var bSelected = _selectMonth.call(this, this._getDate());
		if (bSelected) {
			_fireSelect.call(this);
		}

		//to prevent bubbling into input field if in DatePicker
		oEvent.stopPropagation();
		oEvent.preventDefault();

	};

	MonthsRow.prototype.onsapselectmodifiers = function(oEvent){

		this.onsapselect(oEvent);

	};

	MonthsRow.prototype.onsappageupmodifiers = function(oEvent){

		// not handled by ItemNavigation
		// go one or 10 years back
		var oFocusedDate = new CalendarDate(this._getDate());
		var iYear = oFocusedDate.getYear();

		if (oEvent.metaKey || oEvent.ctrlKey) {
			oFocusedDate.setYear(iYear - 10);
		} else {
			var iMonths = this.getMonths();
			if (iMonths <= 12) {
				oFocusedDate.setYear(iYear - 1);
			} else {
				oFocusedDate.setMonth(oFocusedDate.getMonth() - iMonths);
			}
		}

		this.fireFocus({date: oFocusedDate.toLocalJSDate(), notVisible: true});

		// cancel the event otherwise the browser select some text
		oEvent.preventDefault();

	};

	MonthsRow.prototype.onsappagedownmodifiers = function(oEvent){

		// not handled by ItemNavigation
		// go one or 10 years forward
		var oFocusedDate = new CalendarDate(this._getDate());
		var iYear = oFocusedDate.getYear();

		if (oEvent.metaKey || oEvent.ctrlKey) {
			oFocusedDate.setYear(iYear + 10);
		} else {
			var iMonths = this.getMonths();
			if (iMonths <= 12) {
				oFocusedDate.setYear(iYear + 1);
			} else {
				oFocusedDate.setMonth(oFocusedDate.getMonth() + iMonths);
			}
		}

		this.fireFocus({date: oFocusedDate.toLocalJSDate(), notVisible: true});

		// cancel the event otherwise the browser select some text
		oEvent.preventDefault();

	};

	MonthsRow.prototype.onThemeChanged = function(){

		if (this._bNoThemeChange) {
			// already called from Calendar
			return;
		}

		this._bNamesLengthChecked = undefined;
		this._bLongWeekDays = undefined;
		var oLocaleData = this._getLocaleData();
		var aMonthNamesWide = oLocaleData.getMonthsStandAlone("wide", this.getProperty("primaryCalendarType"));
		var aMonths = this.$("months").children();
		var iMonth = this._getStartDate().getMonth();
		for (var i = 0; i < aMonths.length; i++) {
			var $Month = jQuery(jQuery(aMonths[i]).children(".sapUiCalItemText"));
			$Month.text(aMonthNamesWide[(i + iMonth) % 12]);
		}

		_checkNamesLength.call(this);

	};

	/**
	 * Checks if a date is focusable in the current rendered output.
	 * This means that if it is not rendered, it is not focusable.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDateTime date instance for focused date.
	 * @returns {boolean} flag if focusable
	 * @public
	 */
	MonthsRow.prototype.checkDateFocusable = function(oDateTime){

		CalendarUtils._checkJSDateObject(oDateTime);

		if (this._bNoRangeCheck) {
			// to force to render months if start date is changed
			return false;
		}

		var oStartDate = this._getStartDate();

		// set end date to begin of first month outside row
		var oEndDate = new CalendarDate(oStartDate);
		oEndDate.setDate(1);
		oEndDate.setMonth(oEndDate.getMonth() + this.getMonths());
		var oCalDate = CalendarDate.fromLocalJSDate(oDateTime, this.getProperty("primaryCalendarType"));

		return oCalDate.isSameOrAfter(oStartDate) && oCalDate.isBefore(oEndDate);
	};

	/**
	 * Overrides the applyFocusInfo in order to focus the given html element.
	 * Focus handler does not work with DOM elements, but with UI5 controls only. That's why we need to take care that
	 * when focus is being restored back (e.g. after rerendering), we focus the needed DOM element (in this case month)
	 *
	 * @param {object} oInfo the focus info
	 * @returns {sap.ui.unified.calendar.MonthRow} <code>this</code> for method chaining.
	 */
	MonthsRow.prototype.applyFocusInfo = function(oInfo){
		this._oItemNavigation.focusItem(this._oItemNavigation.getFocusedIndex());
		return this;
	};

	function _initItemNavigation(){

		var oDate = this._getDate();
		var sYyyymm = this._oFormatYyyymm.format(oDate.toUTCJSDate(), true);
		var iIndex = 0;

		var oRootDomRef = this.$("months").get(0);
		var aDomRefs = this.$("months").children(".sapUiCalItem");

		for ( var i = 0; i < aDomRefs.length; i++) {
			var $DomRef = jQuery(aDomRefs[i]);
			if ($DomRef.attr("data-sap-month") === sYyyymm) {
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
			this._oItemNavigation.setDisabledModifiers({
				sapnext : ["alt"],
				sapprevious : ["alt"],
				saphome : ["alt"],
				sapend : ["alt"]
			});
			this._oItemNavigation.setCycling(false);
			this._oItemNavigation.setColumns(1, true);
		}
		this._oItemNavigation.setRootDomRef(oRootDomRef);
		this._oItemNavigation.setItemDomRefs(aDomRefs);
		this._oItemNavigation.setFocusedIndex(iIndex);
		this._oItemNavigation.setPageSize(aDomRefs.length); // to make sure that pageup/down goes out of month

	}

	function _handleAfterFocus(oControlEvent){

		var iIndex = oControlEvent.getParameter("index");
		var oEvent = oControlEvent.getParameter("event");

		if (!oEvent) {
			return; // happens if focus is set via ItemNavigation.focusItem directly
		}

		var oOldDate = this._getDate();
		var oFocusedDate = new CalendarDate(oOldDate);
		var aDomRefs = this._oItemNavigation.getItemDomRefs();

		// find out what day was focused
		var $DomRef = jQuery(aDomRefs[iIndex]);

		oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymm.parse($DomRef.attr("data-sap-month")));
		oFocusedDate.setDate(1);
		this.setDate(oFocusedDate.toLocalJSDate());

		this.fireFocus({date: oFocusedDate.toLocalJSDate(), notVisible: false});

		if (oEvent.type == "mousedown") {
			// as no click event is fired in some cases, e.g. if DOM changed select the month on mousedown
			_handleMousedown.call(this, oEvent, oFocusedDate, iIndex);
		}

	}

	function _handleFocusAgain(oControlEvent){

		var iIndex = oControlEvent.getParameter("index");
		var oEvent = oControlEvent.getParameter("event");

		if (!oEvent) {
			return; // happens if focus is set via ItemNavigation.focusItem directly
		}

		if (oEvent.type == "mousedown") {
			// as no click event is fired in some cases, e.g. if DOM has changed select the day on mousedown
			var oFocusedDate = this._getDate();
			_handleMousedown.call(this, oEvent, oFocusedDate, iIndex);
		}

	}

	function _handleBorderReached(oControlEvent){

		var oEvent = oControlEvent.getParameter("event");
		var iMonths = this.getMonths();
		var oOldDate = this._getDate();
		var oFocusedDate = new CalendarDate(oOldDate);

		if (oEvent.type) {
			switch (oEvent.type) {
			case "sapnext":
			case "sapnextmodifiers":
				//go to next month
				oFocusedDate.setMonth(oFocusedDate.getMonth() + 1);
				break;

			case "sapprevious":
			case "sappreviousmodifiers":
				//go to previous month
				oFocusedDate.setMonth(oFocusedDate.getMonth() - 1);
				break;

			case "sappagedown":
				// go getMonths() month forward
				oFocusedDate.setMonth(oFocusedDate.getMonth() + iMonths);
				break;

			case "sappageup":
				// go getMonths() months backwards
				oFocusedDate.setMonth(oFocusedDate.getMonth() - iMonths);
				break;

			default:
				break;
			}

			this.fireFocus({date: oFocusedDate.toLocalJSDate(), notVisible: true});

		}

	}

	/**
	*
	* @param {object} oEvent The fired event
	* @param {sap.ui.unified.calendar.CalendarDate} oFocusedDate The clicked date
	* @param {int} iIndex
	* @private
	*/
	function _handleMousedown(oEvent, oFocusedDate, iIndex){

		if (oEvent.button) {
			// only use left mouse button
			return;
		}

		var bSelected = _selectMonth.call(this, oFocusedDate);
		if (bSelected) {
			this._bMousedownChange = true;
		}

		if (this._bMouseMove) {
			// a mouseup must be happened outside of control -> just end move
			_unbindMousemove.call(this, true);
			this._bMoveChange = false;
		} else if (bSelected && this.getIntervalSelection() && this.$().is(":visible")) {
			// if closed in select event, do not add mousemove handler
			_bindMousemove.call(this, true);
		}

		oEvent.preventDefault();
		oEvent.setMark("cancelAutoClose");

	}

	/**
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date to be changed
	 * @param {boolean} bNoFocus Whether the date is focused
	 */
	function _changeDate(oDate, bNoFocus){

		CalendarUtils._checkCalendarDate(oDate);

		var iYear = oDate.getYear();
		CalendarUtils._checkYearInValidRange(iYear);

		var bFocusable = true; // if date not changed it is still focusable
		if (!this.getDate() || !oDate.isSame(CalendarDate.fromLocalJSDate(this.getDate(), this.getProperty("primaryCalendarType")))) {
			var oCalDate = new CalendarDate(oDate);
			oCalDate.setDate(1); // always use begin of month
			bFocusable = this.checkDateFocusable(oDate.toLocalJSDate());

			if (!this._bNoRangeCheck && !bFocusable) {
				throw new Error("Date must be in visible date range; " + this);
			}

			this.setProperty("date", oDate.toLocalJSDate());
			this._oDate  = oCalDate;
		}

		if (this.getDomRef()) {
			if (bFocusable) {
				_focusDate.call(this, this._oDate , bNoFocus);
			}
		}

	}

	/**
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate the calendar date to focus
	 * @param {boolean} bNoFocus if true, item navigator's focus won't be set, but just the index will so.
	 * @private
	 */
	function _focusDate(oDate, bNoFocus){

		var sYyyymm = this._oFormatYyyymm.format(oDate.toUTCJSDate(), true);
		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var $DomRefDay;
		for ( var i = 0; i < aDomRefs.length; i++) {
			$DomRefDay = jQuery(aDomRefs[i]);
			if ($DomRefDay.attr("data-sap-month") == sYyyymm) {
				if (document.activeElement != aDomRefs[i]) {
					if (bNoFocus) {
						this._oItemNavigation.setFocusedIndex(i);
					} else {
						this._oItemNavigation.focusItem(i);
					}
				}
				break;
			}
		}

	}


	/**
	* @param {sap.ui.unified.calendar.CalendarDate} oDate The date to be set to the month and the year in the header
	* @param {boolean} bMove Whether move event is fired
	* @returns {boolean} Whether the month is selected
	* @private
	*/
	function _selectMonth(oDate, bMove){

		if (!this._checkMonthEnabled(oDate)) {
			// date is disabled -> do not select it
			return false;
		}

		var aSelectedDates = this.getSelectedDates();
		var oDateRange;
		var i = 0;
		var oParent = this.getParent();
		var oAggOwner = this;
		var oStartDate;

		if (oParent && oParent.getSelectedDates) {
			// if used in Calendar use the aggregation of this one
			oAggOwner = oParent;
		}

		/* eslint-disable no-lonely-if */
		if (this.getSingleSelection()) {

			if (aSelectedDates.length > 0) {
				oDateRange = aSelectedDates[0];
				oStartDate = oDateRange.getStartDate();
				if (oStartDate) {
					oStartDate = CalendarDate.fromLocalJSDate(oStartDate, this.getProperty("primaryCalendarType"));
					oStartDate.setDate(1); // begin of month
				}
			} else {
				oDateRange = new DateRange();
				oAggOwner.addAggregation("selectedDates", oDateRange);
			}

			if (this.getIntervalSelection() && (!oDateRange.getEndDate() || bMove) && oStartDate) {
				// single interval selection
				var oEndDate;
				if (oDate.isBefore(oStartDate)) {
					oEndDate = oStartDate;
					oStartDate = oDate;
					if (!bMove) {
						// in move mode do not set date. this bring problems if on backward move the start date would be changed
						oDateRange.setProperty("startDate", oStartDate.toLocalJSDate());
						oDateRange.setProperty("endDate", oEndDate.toLocalJSDate());
					}
				} else if (oDate.isSameOrAfter(oStartDate)) {
					// single day ranges are allowed
					oEndDate = oDate;
					if (!bMove) {
						oDateRange.setProperty("endDate", oEndDate.toLocalJSDate());
					}
				}
			} else {
				oDateRange.setProperty("startDate", oDate.toLocalJSDate());
				oDateRange.setProperty("endDate", undefined);
			}
		} else {
			// multiple selection
			if (this.getIntervalSelection()) {
				throw new Error("Calender don't support multiple interval selection");

			} else {
				var iSelected = this._checkDateSelected(oDate);
				if (iSelected > 0) {
					// already selected - deselect
					for ( i = 0; i < aSelectedDates.length; i++) {
						oStartDate = aSelectedDates[i].getStartDate();
						if (oStartDate) {
							oStartDate = CalendarDate.fromLocalJSDate(oStartDate, this.getProperty("primaryCalendarType"));
							oStartDate.setDate(1); // begin of month
							if (oDate.isSame(oStartDate)) {
								oAggOwner.removeAggregation("selectedDates", i);
								break;
							}
						}
					}
				} else {
					// not selected -> select
					oDateRange = new DateRange({startDate: oDate.toLocalJSDate()});
					oAggOwner.addAggregation("selectedDates", oDateRange);
				}
			}
		}

		return true;

	}

	function _fireSelect(){

		if (this._bMouseMove) {
			// detach mouse move handler because calendar might be losed in select event handler
			_unbindMousemove.call(this, true);
		}

		this.fireSelect();

	}

	function _checkNamesLength(){

		if (!this._bNamesLengthChecked) {
			var i = 0;
			// only once - cannot change by rerendering - only by theme change
			var aMonths = this.$("months").children();
			var bTooLong = false;
			var iMonths = this.getMonths();
			var iBlocks = Math.ceil(12 / iMonths);
			var iMonth = 0;
			var oLocaleData = this._getLocaleData();
			var aMonthNamesWide = oLocaleData.getMonthsStandAlone("wide", this.getProperty("primaryCalendarType"));
			var $Month;

			for (var b = 0; b < iBlocks; b++) {
				if (iMonths < 12) {
					for (i = 0; i < aMonths.length; i++) {
						$Month = jQuery(jQuery(aMonths[i]).children(".sapUiCalItemText"));
						$Month.text(aMonthNamesWide[(i + iMonth) % 12]);
					}
					iMonth = iMonth + iMonths;
					if (iMonth > 11) {
						iMonth = 11;
					}
				}

				for (i = 0; i < aMonths.length; i++) {
					var oMonth = aMonths[i];
					if (Math.abs(oMonth.clientWidth - oMonth.scrollWidth) > 1) {
						bTooLong = true;
						break;
					}
				}

				if (bTooLong) {
					break;
				}
			}

			if (iMonths < 12) {
				// restore rendered block
				iMonth = this._getStartDate().getMonth();
				for (i = 0; i < aMonths.length; i++) {
					$Month = jQuery(jQuery(aMonths[i]).children(".sapUiCalItemText"));
					$Month.text(aMonthNamesWide[(i + iMonth) % 12]);
				}
			}

			if (bTooLong) {
				this._bLongMonth = false;
				// change month name on button but not change month picker, because it is hided again
				var aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated", this.getProperty("primaryCalendarType"));
				iMonth = this._getStartDate().getMonth();
				for (i = 0; i < aMonths.length; i++) {
					$Month = jQuery(jQuery(aMonths[i]).children(".sapUiCalItemText"));
					$Month.text(aMonthNames[(i + iMonth) % 12]);
				}
			} else {
				this._bLongMonth = true;
			}

			this._bNamesLengthChecked = true;
		}
	}

	function _bindMousemove(){

		jQuery(window.document).on('mousemove', this._mouseMoveProxy);
		this._bMouseMove = true;

	}

	function _unbindMousemove(){

		jQuery(window.document).off('mousemove', this._mouseMoveProxy);
		this._bMouseMove = undefined;

	}

	return MonthsRow;

});