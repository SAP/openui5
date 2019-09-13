/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.CalendarMonthInterval.
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/core/LocaleData',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/library',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/library',
	'sap/ui/core/Locale',
	"./MonthsRowRenderer",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/thirdparty/jquery",
	"sap/ui/unified/DateRange"
], function(
	Control,
	LocaleData,
	ItemNavigation,
	CalendarUtils,
	CalendarDate,
	library,
	DateFormat,
	coreLibrary,
	Locale,
	MonthsRowRenderer,
	containsOrEquals,
	jQuery,
	DateRange
) {
	"use strict";

	// shortcut for sap.ui.core.CalendarType
	var CalendarType = coreLibrary.CalendarType;

	/*
	 * <code>CalendarDate</code> objects are used inside the <code>MonthsRow</code>, whereas JavaScript dates are used in the API.
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
	 * The MontsRow works with JavaScript Date objects, but only the month and the year are used to display and interact.
	 * As representation for a month, the 1st of the month will always be returned in the API.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.32.0
	 * @alias sap.ui.unified.calendar.MonthsRow
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MonthsRow = Control.extend("sap.ui.unified.calendar.MonthsRow", /** @lends sap.ui.unified.calendar.MonthsRow.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {
			/**
			 * A date as JavaScript Date object. The month including this date is rendered and this date is focused initially (if no other focus is set).
			 * If the date property is not in the range <code>startDate</code> + <code>months</code> in the rendering phase,
			 * it is set to the <code>startDate</code>.
			 * So after setting the <code>startDate</code> the date should be set to be in the visible range.
			 */
			date : {type : "object", group : "Data"},

			/**
			 * Start date, as JavaScript Date object, of the row. The month of this date is the first month of the displayed row.
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
			showHeader : {type : "boolean", group : "Appearance", defaultValue : false}
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
					 * First date, as JavaScript Date object, of the month that is focused.
					 */
					date : {type : "object"},
					/**
					 * If set, the focused date is not rendered yet. (This happens by navigating out of the visible area.)
					 */
					notVisible : {type : "boolean"}
				}
			}
		}
	}});

	MonthsRow.prototype.init = function(){

		//need day in pattern because in islamic calendar 2 Month can start in one gregorianic calendar
		this._oFormatYyyymm = DateFormat.getInstance({pattern: "yyyyMMdd", calendarType: CalendarType.Gregorian});
		this._oFormatLong = DateFormat.getInstance({pattern: "MMMM y"});

		this._mouseMoveProxy = jQuery.proxy(this._handleMouseMove, this);

		this._rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");

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

	};

	MonthsRow.prototype.onAfterRendering = function(){

		_initItemNavigation.call(this);

		// check if day names are too big -> use smaller ones
		_checkNamesLength.call(this);

	};

	MonthsRow.prototype.onsapfocusleave = function(oEvent){

		if (!oEvent.relatedControlId || !containsOrEquals(this.getDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef())) {
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

	// overwrite invalidate to recognize changes on selectedDates
	MonthsRow.prototype.invalidate = function(oOrigin) {

		if (!this._bDateRangeChanged && (!oOrigin || !(oOrigin instanceof DateRange))) {
			Control.prototype.invalidate.apply(this, arguments);
		} else if (this.getDomRef() && !this._sInvalidateMonths) {
			// DateRange changed -> only rerender months
			// do this only once if more DateRanges / Special days are changed
			if (this._bInvalidateSync) { // set if calendar already invalidates in delayed call
				_invalidateMonths.call(this);
			} else {
				this._sInvalidateMonths = setTimeout(_invalidateMonths.bind(this), 0);
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

	/*
	 * Sets a date for the months row.
	 * @param {Date} oDate a JavaScript date
	 * @return {sap.ui.unified.calendar.MonthsRow} <code>this</code> for method chaining
	 */
	MonthsRow.prototype.setDate = function(oDate){

		_changeDate.call(this, CalendarDate.fromLocalJSDate(oDate), false);

		return this;

	};

	/**
	* @param {sap.ui.unified.calendar.CalendarDate} oDate The date to be set to the month row
	*/
	MonthsRow.prototype._setDate = function(oDate){

		var oLocaleDate = oDate.toLocalJSDate();
		this.setProperty("date", oLocaleDate, true);
		this._oDate  = oDate;

	};

	/**
	* @return {sap.ui.unified.calendar.CalendarDate} the last set calendar date or the current date
	* @private
	*/
	MonthsRow.prototype._getDate = function(){

		if (!this._oDate ) {
			this._oDate  = new CalendarDate();
		}

		return this._oDate ;

	};


	/*
	 * Sets a date for a start date of the months row.
	 * @param {Date} oStartDate A JavaScript date
	 * @return {sap.ui.unified.calendar.MonthsRow} <code>this</code> for method chaining
	 */
	MonthsRow.prototype.setStartDate = function(oStartDate){
		CalendarUtils._checkJSDateObject(oStartDate);
		var oCalDate, iYear, oOldDate;

		iYear = oStartDate.getFullYear();
		CalendarUtils._checkYearInValidRange(iYear);

		oCalDate = CalendarDate.fromLocalJSDate(oStartDate);
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
			this._oStartDate = new CalendarDate();
			this._oStartDate.setDate(1); // always use begin of month as start date
		}

		return this._oStartDate;
	};

	/**
	 * Displays the month of a given date without setting the focus
	 *
	 * @param {object} oDate JavaScript Date object for focused date.
	 * @returns {sap.ui.unified.calendar.MonthsRow} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	MonthsRow.prototype.displayDate = function(oDate){

		_changeDate.call(this, CalendarDate.fromLocalJSDate(oDate), true);

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
			this._sLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();
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
			this._oFormatLong = DateFormat.getInstance({style: "long"} , oLocale);
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

	/*
	 * Checks if a date is selected and what kind of selected
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate
	 * @return {int} iSelected 0: not selected; 1: single day selected, 2: interval start, 3: interval end, 4: interval between, 5: one day interval (start = end)
	 * @private
	 */
	MonthsRow.prototype._checkDateSelected = function(oDate){
		var oRange,
			oStartDate, oEndDate,
			oTimeStamp,
			oStartTimeStamp = 0, oEndTimeStamp = 0,
			iSelected = 0,
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
				oStartDate = CalendarDate.fromLocalJSDate(oStartDate);
				oStartDate.setDate(1); // begin of month
				oStartTimeStamp = oStartDate.toUTCJSDate().getTime();
			}
			oEndDate = oRange.getEndDate();
			oEndTimeStamp = 0;
			if (oEndDate) {
				oEndDate = CalendarDate.fromLocalJSDate(oEndDate);
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

	/*
	 * gets the type of a single date checking the specialDates aggregation
	 * the first hit is used
	 * @return {sap.ui.unified.calendar.CalendarDate} date type and tooltip defined in CalendarDayType
	 * @private
	 */
	MonthsRow.prototype._getDateType = function(oDate){
		CalendarUtils._checkCalendarDate(oDate);

		var oType, oRange, i,
			oStartDate, oStartTimeStamp = 0,
			oEndDate, oEndTimeStamp = 0,
			oTimeStamp,
			aSpecialDates = this.getSpecialDates(),
			oMyDate = new CalendarDate(oDate);

		oMyDate.setDate(1); //always use begin of month for test
		oTimeStamp = oMyDate.toUTCJSDate().getTime();

		for (i = 0; i < aSpecialDates.length; i++) {
			// initialize the time part of the start and end time
			oRange = aSpecialDates[i];
			oStartDate = oRange.getStartDate();
			oStartTimeStamp = 0;
			if (oStartDate) {
				oStartDate = CalendarDate.fromLocalJSDate(oStartDate);
				oStartDate.setDate(1); // begin of month
				oStartTimeStamp = oStartDate.toUTCJSDate().getTime();
			}
			oEndDate = oRange.getEndDate();
			oEndTimeStamp = 0;
			if (oEndDate) {
				oEndDate = CalendarDate.fromLocalJSDate(oEndDate);
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

	/*
	 * Checks if a Month is enabled
	 * the min. and max. date of the CalendarMonthInterval are used
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate
	 * @return {boolean} Flag if enabled
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
			var oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymm.parse($Target.attr("data-sap-month")));
			oFocusedDate.setDate(1);

			if (!oFocusedDate.isSame(oOldFocusedDate)) {
				this._setDate(oFocusedDate);
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
					$DomRef.focus();
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
		var aMonthNamesWide = oLocaleData.getMonthsStandAlone("wide");
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
	 * @param {object} oDateTime JavaScript Date object for focused date.
	 * @returns {boolean} flag if focusable
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
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
		var oCalDate = CalendarDate.fromLocalJSDate(oDateTime);

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
		this._setDate(oFocusedDate);

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
		}else if (bSelected && this.getIntervalSelection() && this.$().is(":visible")) {
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
		if (!this.getDate() || !oDate.isSame(CalendarDate.fromLocalJSDate(this.getDate()))) {
			var oCalDate = new CalendarDate(oDate);
			oCalDate.setDate(1); // always use begin of month
			bFocusable = this.checkDateFocusable(oDate.toLocalJSDate());

			if (!this._bNoRangeCheck && !bFocusable) {
				throw new Error("Date must be in visible date range; " + this);
			}

			this.setProperty("date", oDate.toLocalJSDate(), true);
			this._oDate  = oCalDate;
		}

		if (this.getDomRef()) {
			if (bFocusable) {
				_focusDate.call(this, this._oDate , bNoFocus);
			} else {
				_renderRow.call(this, bNoFocus);
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

	function _renderRow(bNoFocus){

		var oDate = this._getStartDate();
		var $Container = this.$("months");

		if ($Container.length > 0) {
			var oRm = sap.ui.getCore().createRenderManager();
			this.getRenderer().renderMonths(oRm, this, oDate);
			oRm.flush($Container[0]);
			oRm.destroy();
		}

		_renderHeader.call(this);

		_initItemNavigation.call(this);
		if (!bNoFocus) {
			this._oItemNavigation.focusItem(this._oItemNavigation.getFocusedIndex());
		}

	}

	function _renderHeader(){

		var oStartDate = this._getStartDate();

		if (this._getShowHeader()) {
			var $Container = this.$("Head");

			if ($Container.length > 0) {
				var oLocaleData = this._getLocaleData();
				var oRm = sap.ui.getCore().createRenderManager();
				this.getRenderer().renderHeaderLine(oRm, this, oLocaleData, oStartDate);
				oRm.flush($Container[0]);
				oRm.destroy();
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
		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var $DomRef;
		var sYyyymm;
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
					oStartDate = CalendarDate.fromLocalJSDate(oStartDate);
					oStartDate.setDate(1); // begin of month
				}
			} else {
				oDateRange = new DateRange();
				oAggOwner.addAggregation("selectedDates", oDateRange, true); // no re-rendering
			}

			if (this.getIntervalSelection() && (!oDateRange.getEndDate() || bMove) && oStartDate) {
				// single interval selection
				var oEndDate;
				if (oDate.isBefore(oStartDate)) {
					oEndDate = oStartDate;
					oStartDate = oDate;
					if (!bMove) {
						// in move mode do not set date. this bring problems if on backward move the start date would be changed
						oDateRange.setProperty("startDate", oStartDate.toLocalJSDate(), true); // no-rerendering
						oDateRange.setProperty("endDate", oEndDate.toLocalJSDate(), true); // no-rerendering
					}
				} else if (oDate.isSameOrAfter(oStartDate)) {
					// single day ranges are allowed
					oEndDate = oDate;
					if (!bMove) {
						oDateRange.setProperty("endDate", oEndDate.toLocalJSDate(), true); // no-rerendering
					}
				}
				_updateSelection.call(this, oStartDate, oEndDate);
			} else {
				// single day selection or start a new interval
				_updateSelection.call(this, oDate);

				oDateRange.setProperty("startDate", oDate.toLocalJSDate(), true); // no-rerendering
				oDateRange.setProperty("endDate", undefined, true); // no-rerendering
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
							oStartDate = CalendarDate.fromLocalJSDate(oStartDate);
							oStartDate.setDate(1); // begin of month
							if (oDate.isSame(oStartDate)) {
								oAggOwner.removeAggregation("selectedDates", i, true); // no re-rendering
								break;
							}
						}
					}
				} else {
					// not selected -> select
					oDateRange = new DateRange({startDate: oDate.toLocalJSDate()});
					oAggOwner.addAggregation("selectedDates", oDateRange, true); // no re-rendering
				}
				sYyyymm = this._oFormatYyyymm.format(oDate.toUTCJSDate(), true);
				for ( i = 0; i < aDomRefs.length; i++) {
					$DomRef = jQuery(aDomRefs[i]);
					if ($DomRef.attr("data-sap-month") == sYyyymm) {
						if (iSelected > 0) {
							$DomRef.removeClass("sapUiCalItemSel");
							$DomRef.attr("aria-selected", "false");
						} else {
							$DomRef.addClass("sapUiCalItemSel");
							$DomRef.attr("aria-selected", "true");
						}
					}
				}
			}
		}

		return true;

	}

	/**
	* @param {sap.ui.unified.calendar.CalendarDate} oStartDate The start date of the selection
	* @param {sap.ui.unified.calendar.CalendarDate} oEndDate The end date of the selection
	* @private
	*/
	function _updateSelection(oStartDate, oEndDate){

		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var $DomRef;
		var i = 0;
		var bStart = false;
		var bEnd = false;

		if (!oEndDate) {
			// start of interval or single date
			var sYyyymm = this._oFormatYyyymm.format(oStartDate.toUTCJSDate(), true);
			for ( i = 0; i < aDomRefs.length; i++) {
				$DomRef = jQuery(aDomRefs[i]);
				bStart = false;
				bEnd = false;
				if ($DomRef.attr("data-sap-month") == sYyyymm) {
					$DomRef.addClass("sapUiCalItemSel");
					$DomRef.attr("aria-selected", "true");
					bStart = true;
				} else if ($DomRef.hasClass("sapUiCalItemSel")) {
					$DomRef.removeClass("sapUiCalItemSel");
					$DomRef.attr("aria-selected", "false");
				}
				if ($DomRef.hasClass("sapUiCalItemSelStart")) {
					$DomRef.removeClass("sapUiCalItemSelStart");
				} else if ($DomRef.hasClass("sapUiCalItemSelBetween")) {
					$DomRef.removeClass("sapUiCalItemSelBetween");
				} else if ($DomRef.hasClass("sapUiCalItemSelEnd")) {
					$DomRef.removeClass("sapUiCalItemSelEnd");
				}
				_updateARIADesrcibedby.call(this, $DomRef, bStart, bEnd);
			}
		} else {
			var oDay;
			for ( i = 0; i < aDomRefs.length; i++) {
				$DomRef = jQuery(aDomRefs[i]);
				bStart = false;
				bEnd = false;
				oDay = CalendarDate.fromLocalJSDate(this._oFormatYyyymm.parse($DomRef.attr("data-sap-month")));
				oDay.setDate(1);
				if (oDay.isSame(oStartDate)) {
					$DomRef.addClass("sapUiCalItemSelStart");
					bStart = true;
					$DomRef.addClass("sapUiCalItemSel");
					$DomRef.attr("aria-selected", "true");
					if (oEndDate && oDay.isSame(oEndDate)) {
						// start day and end day are the same
						$DomRef.addClass("sapUiCalItemSelEnd");
						bEnd = true;
					}
					$DomRef.removeClass("sapUiCalItemSelBetween");
				} else if (oEndDate && CalendarUtils._isBetween(oDay, oStartDate, oEndDate)) {
					$DomRef.addClass("sapUiCalItemSel");
					$DomRef.attr("aria-selected", "true");
					$DomRef.addClass("sapUiCalItemSelBetween");
					$DomRef.removeClass("sapUiCalItemSelStart");
					$DomRef.removeClass("sapUiCalItemSelEnd");
				} else if (oEndDate && oDay.isSame(oEndDate)) {
					$DomRef.addClass("sapUiCalItemSelEnd");
					bEnd = true;
					$DomRef.addClass("sapUiCalItemSel");
					$DomRef.attr("aria-selected", "true");
					$DomRef.removeClass("sapUiCalItemSelStart");
					$DomRef.removeClass("sapUiCalItemSelBetween");
				} else {
					if ($DomRef.hasClass("sapUiCalItemSel")) {
						$DomRef.removeClass("sapUiCalItemSel");
						$DomRef.attr("aria-selected", "false");
					}
					if ($DomRef.hasClass("sapUiCalItemSelStart")) {
						$DomRef.removeClass("sapUiCalItemSelStart");
					} else if ($DomRef.hasClass("sapUiCalItemSelBetween")) {
						$DomRef.removeClass("sapUiCalItemSelBetween");
					} else if ($DomRef.hasClass("sapUiCalItemSelEnd")) {
						$DomRef.removeClass("sapUiCalItemSelEnd");
					}
				}
				_updateARIADesrcibedby.call(this, $DomRef, bStart, bEnd);
			}
		}

	}

	function _updateARIADesrcibedby($DomRef, bStart, bEnd){

		if (!this.getIntervalSelection()) {
			return;
		}

		var sDescribedBy = "";
		var aDescribedBy = [];
		var sId = this.getId();
		var bChanged = false;

		sDescribedBy = $DomRef.attr("aria-describedby");
		if (sDescribedBy) {
			aDescribedBy = sDescribedBy.split(" ");
		}

		var iStartIndex = -1;
		var iEndIndex = -1;
		for (var i = 0; i < aDescribedBy.length; i++) {
			var sDescrId = aDescribedBy[i];
			if (sDescrId == (sId + "-Start")) {
				iStartIndex = i;
			}
			if (sDescrId == (sId + "-End")) {
				iEndIndex = i;
			}
		}

		if (iStartIndex >= 0 && !bStart) {
			aDescribedBy.splice(iStartIndex, 1);
			bChanged = true;
			if (iEndIndex > iStartIndex) {
				iEndIndex--;
			}
		}
		if (iEndIndex >= 0 && !bEnd) {
			aDescribedBy.splice(iEndIndex, 1);
			bChanged = true;
		}

		if (iStartIndex < 0 && bStart) {
			aDescribedBy.push(sId + "-Start");
			bChanged = true;
		}
		if (iEndIndex < 0 && bEnd) {
			aDescribedBy.push(sId + "-End");
			bChanged = true;
		}

		if (bChanged) {
			sDescribedBy = aDescribedBy.join(" ");
			$DomRef.attr("aria-describedby", sDescribedBy);
		}

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
			var aMonthNamesWide = oLocaleData.getMonthsStandAlone("wide");
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
				var aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated");
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

	function _invalidateMonths(){

		this._sInvalidateMonths = undefined;

		_renderRow.call(this, this._bNoFocus);
		this._bDateRangeChanged = undefined;
		this._bNoFocus = undefined; // set in Calendar to prevent focus flickering for multiple months

	}

	function _bindMousemove(){

		jQuery(window.document).bind('mousemove', this._mouseMoveProxy);
		this._bMouseMove = true;

	}

	function _unbindMousemove(){

		jQuery(window.document).unbind('mousemove', this._mouseMoveProxy);
		this._bMouseMove = undefined;

	}

	return MonthsRow;

});