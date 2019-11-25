/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.Calendar.
sap.ui.define([
	'sap/ui/core/Control',
	'sap/ui/Device',
	'sap/ui/core/LocaleData',
	'sap/ui/core/delegate/ItemNavigation',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/DateRange',
	'sap/ui/unified/library',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/library',
	'sap/ui/core/Locale',
	"./MonthRenderer",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery"
], function(
	Control,
	Device,
	LocaleData,
	ItemNavigation,
	CalendarUtils,
	CalendarDate,
	DateRange,
	library,
	DateFormat,
	coreLibrary,
	Locale,
	MonthRenderer,
	containsOrEquals,
	KeyCodes,
	jQuery
) {
	"use strict";

	// shortcut for sap.ui.core.CalendarType
	var CalendarType = coreLibrary.CalendarType;

	// shortcut for sap.ui.unified.CalendarDayType
	var CalendarDayType = library.CalendarDayType;

	/*
	 * Inside the Month CalendarDate objects are used. But in the API JS dates are used.
	 * So conversion must be done on API functions.
	 */

	/**
	 * Constructor for a new calendar/Month.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * renders a month with ItemNavigation
	 * This is used inside the calendar. Not for stand alone usage
	 * If used inside the calendar the properties and aggregation are directly taken from the parent
	 * (To not duplicate and sync DateRanges and so on...)
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.28.0
	 * @alias sap.ui.unified.calendar.Month
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Month = Control.extend("sap.ui.unified.calendar.Month", /** @lends sap.ui.unified.calendar.Month.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {
			/**
			 * A date as JavaScript Date object.
			 * The month including this date is rendered and this date is focused initially (if no other focus is set).
			 */
			date : {type : "object", group : "Data"},

			/**
			 * If set, interval selection is allowed
			 */
			intervalSelection : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * If set, only a single date or interval, if intervalSelection is enabled, can be selected
			 */
			singleSelection : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * If set, a header with the month name is shown
			 */
			showHeader : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * If set, the first day of the displayed week is this day. Valid values are 0 to 6.
			 * If not a valid value is set, the default of the used locale is used.
			 * @since 1.28.9
			 */
			firstDayOfWeek : {type : "int", group : "Appearance", defaultValue : -1},

			/**
			 * If set, the provided weekdays are displayed as non-working days.
			 * Valid values inside the array are 0 to 6.
			 * If not set, the weekend defined in the locale settings is displayed as non-working days.
			 * @since 1.28.9
			 */
			nonWorkingDays : {type : "int[]", group : "Appearance", defaultValue : null},

			/**
			 * If set, the calendar type is used for display.
			 * If not set, the calendar type of the global configuration is used.
			 * @since 1.34.0
			 */
			primaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance"},

			/**
			 * If set, the days are also displayed in this calendar type
			 * If not set, the dates are only displayed in the primary calendar type
			 * @since 1.34.0
			 */
			secondaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance"},

			/**
			 * Width of Month
			 * @since 1.38.0
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Determines whether the week numbers in the months are displayed.
			 *
			 * <b>Note:</b> For Islamic calendars, the week numbers are not displayed
			 * regardless of what is set to this property.
			 * @since 1.48
			 */
			showWeekNumbers : {type : "boolean", group : "Appearance", defaultValue : true}

		},
		aggregations : {

			/**
			 * Date Ranges for selected dates of the DatePicker
			 */
			selectedDates : {type : "sap.ui.unified.DateRange", multiple : true, singularName : "selectedDate"},

			/**
			 * <code>DateRange</code> with type to visualize special days in the Calendar.
			 *
			 * <b>Note:</b> If one day is assigned to more than one DateTypeRange, only the first one
			 * will be used. The only exception is when one of the types is
			 * <code>NonWorking</code>, then you can have both <code>NonWorking</code>
			 * and the other type.
			 * For example, you can have <code>NonWorking</code> + <code>Type01</code>
			 * but you can't have <code>Type01</code> + <code>Type02</code>.
			 */
			specialDates : {type : "sap.ui.unified.DateTypeRange", multiple : true, singularName : "specialDate"},

			/**
			 * Date Ranges for disabled dates
			 * @since 1.38.0
			 */
			disabledDates : {type : "sap.ui.unified.DateRange", multiple : true, singularName : "disabledDate"}
		},
		associations: {

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
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
			 * Date selection changed
			 */
			select : {},

			/**
			 * Date focus changed
			 */
			focus : {
				parameters : {
					/**
					 * focused date
					 */
					date : {type : "object"},
					/**
					 * focused date is in an other month that the displayed one
					 */
					otherMonth : {type : "boolean"},
					/**
					 * focused date is set to the same as before (date in other month clicked)
					 */
					restoreOldDate : {type : "boolean"}
				}
			},

			/**
			 * Fired when a week number selection is changed. By default, choosing the week number will select the corresponding week.
			 * If the week has already been selected, choosing the week number will deselect it.
			 *
			 * The default behavior can be prevented using the <code>preventDefault</code> method.
			 *
			 * <b>Note:</b> Works for Gregorian calendars only and when <code>intervalSelection</code> is set to <code>true</code>.
			 * @since 1.60
			 */
			weekNumberSelect : {
				allowPreventDefault: true,
				parameters : {
					/**
					 * The selected week number.
					 */
					weekNumber : {type: "int"},
					/**
					 * The days of the corresponding week that are selected or deselected.
					 *
					 * <b>Note:</b> Will be set to <code>null</code> if that week is being deselected.
					 */
					weekDays: {type: "sap.ui.unified.DateRange"}
				}
			}


		}
	}});

	Month.prototype.init = function(){

		// set default calendar type from configuration
		var sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
		this.setProperty("primaryCalendarType", sCalendarType);
		this.setProperty("secondaryCalendarType", sCalendarType);

		this._oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyyMMdd", calendarType: CalendarType.Gregorian});
		this._oFormatLong = DateFormat.getInstance({style: "long", calendarType: sCalendarType});

		this._mouseMoveProxy = jQuery.proxy(this._handleMouseMove, this);

		this._iColumns = 7;

		// Currently visible days
		this._aVisibleDays = [];
	};

	Month.prototype._getAriaRole = function(){
		// the role is always "gridcell" inside Calendar
		return "gridcell";
	};

	Month.prototype.exit = function(){

		if (this._oItemNavigation) {
			this.removeDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			delete this._oItemNavigation;
		}

		if (this._sInvalidateMonth) {
			clearTimeout(this._sInvalidateMonth);
		}

		this._aVisibleDays = null;

	};

	Month.prototype.getFocusDomRef = function(){
		return this._oItemNavigation.getItemDomRefs()[this._oItemNavigation.getFocusedIndex()];
	};

	Month.prototype.onAfterRendering = function(){

		_initItemNavigation.call(this);

		// check if day names are too big -> use smaller ones
		_checkNamesLength.call(this);

	};

	Month.prototype.onmouseover = function(oEvent) {
		var $Target = jQuery(oEvent.target),
			oSelectedDateRange = this.getSelectedDates()[0],
			iDate1,
			iDate2;

		if (!this._isMarkingUnfinishedRangeAllowed()) {
			return;
		}

		if (!$Target.hasClass('sapUiCalItemText') && !$Target.hasClass('sapUiCalItem')) {
			return;
		}

		if ($Target.hasClass('sapUiCalItemText')) {
			$Target = $Target.parent();
		}

		iDate1 = parseInt(this._oFormatYyyymmdd.format(oSelectedDateRange.getStartDate()));
		iDate2 = $Target.data("sapDay");

		if (this.hasListeners("datehovered")) {
			this.fireEvent("datehovered", { date1: iDate1, date2: iDate2 });
		} else {
			this._markDatesBetweenStartAndHoveredDate(iDate1, iDate2);
		}
	};

	Month.prototype._markDatesBetweenStartAndHoveredDate = function(iDate1, iDate2) {
		var aDomRefs,
			$CheckRef,
			iCheckDate,
			i;

		aDomRefs = this.$().find(".sapUiCalItem");

		//swap if necessary
		if (iDate1 > iDate2) {
			iDate1 = iDate1 + iDate2;
			iDate2 = iDate1 - iDate2;
			iDate1 = iDate1 - iDate2;
		}

		for (i = 0; i < aDomRefs.length; i++) {
			$CheckRef = jQuery(aDomRefs[i]);
			iCheckDate = $CheckRef.data('sapDay');

			if (iCheckDate > iDate1 && iCheckDate < iDate2) {
				$CheckRef.addClass('sapUiCalItemSelBetween');
			} else {
				$CheckRef.removeClass('sapUiCalItemSelBetween');
			}
		}
	};

	Month.prototype.onsapfocusleave = function(oEvent){

		if (!oEvent.relatedControlId || !containsOrEquals(this.getDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef())) {
			if (this._bMouseMove) {
				this._unbindMousemove(true);

				var bSelected = this._selectDay(this._getDate());
				if (!bSelected && this._oMoveSelectedDate) {
					this._selectDay(this._oMoveSelectedDate);
				}
				this._bMoveChange = false;
				this._bMousedownChange = false;
				this._oMoveSelectedDate = undefined;
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
	Month.prototype.removeAllSelectedDates = function() {

		this._bDateRangeChanged = true;
		var aRemoved = this.removeAllAggregation("selectedDates");
		return aRemoved;

	};

	Month.prototype.destroySelectedDates = function() {

		this._bDateRangeChanged = true;
		var oDestroyed = this.destroyAggregation("selectedDates");
		return oDestroyed;

	};

	Month.prototype.removeAllSpecialDates = function() {

		this._bDateRangeChanged = true;
		var aRemoved = this.removeAllAggregation("specialDates");
		return aRemoved;

	};

	Month.prototype.destroySpecialDates = function() {

		this._bDateRangeChanged = true;
		var oDestroyed = this.destroyAggregation("specialDates");
		return oDestroyed;

	};

	Month.prototype.removeAllDisabledDates = function() {

		this._bDateRangeChanged = true;
		var aRemoved = this.removeAllAggregation("disabledDates");
		return aRemoved;

	};

	Month.prototype.destroyDisabledDates = function() {

		this._bDateRangeChanged = true;
		var oDestroyed = this.destroyAggregation("disabledDates");
		return oDestroyed;

	};

	/*
	 * Sets a date for the month.
	 * @param {Date} oDate a JavaScript date
	 * @return {sap.ui.unified.calendar.Month} <code>this</code> for method chaining
	 */
	Month.prototype.setDate = function(oDate){
		var oCalDate = CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType());
		_changeDate.call(this, oCalDate, false);

		return this;

	};

	Month.prototype._setDate = function(oDate){

		var oLocaleDate = oDate.toLocalJSDate();
		this.setProperty("date", oLocaleDate, true);
		this._oDate = oDate;

	};

	/**
	 *
	 * @returns {sap.ui.unified.calendar.CalendarDate} the underlying calendar date
	 * @private
	 */
	Month.prototype._getDate = function(){

		if (!this._oDate) {
			this._oDate = CalendarDate.fromLocalJSDate(new Date(), this.getPrimaryCalendarType());
		}

		return this._oDate;

	};

	/**
	 * displays the month of a given date without setting the focus
	 *
	 * @param {object} oDate JavaScript date object for focused date.
	 * @returns {sap.ui.unified.calendar.Month} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Month.prototype.displayDate = function(oDate){
		var oCalDate = CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType());
		_changeDate.call(this, oCalDate, true);

		return this;

	};

	Month.prototype.setPrimaryCalendarType = function(sCalendarType){

		this.setProperty("primaryCalendarType", sCalendarType); // rerender as month can change completely (week numbers can be hidden...)

		this._oFormatLong = DateFormat.getInstance({style: "long", calendarType: sCalendarType});

		if (this._oDate) {
			this._oDate = new CalendarDate(this._oDate, sCalendarType);
		}

		return this;

	};

	Month.prototype.setSecondaryCalendarType = function(sCalendarType){

		this._bSecondaryCalendarTypeSet = true; // as property can not be empty but we use it only if set
		this.setProperty("secondaryCalendarType", sCalendarType); // rerender as month can change completely (class changes on root DOM)
		this.invalidate(); // Invalidate in every case even if the type was set to the default one.

		this._oFormatSecondaryLong = DateFormat.getInstance({style: "long", calendarType: sCalendarType});

		return this;

	};

	Month.prototype._getSecondaryCalendarType = function(){

		var sSecondaryCalendarType;

		if (this._bSecondaryCalendarTypeSet) {
			sSecondaryCalendarType = this.getSecondaryCalendarType();
			var sPrimaryCalendarType = this.getPrimaryCalendarType();
			if (sSecondaryCalendarType == sPrimaryCalendarType) {
				sSecondaryCalendarType = undefined;
			}
		}

		return sSecondaryCalendarType;

	};

	/*
	 * Use rendered locale for stand alone control
	 * But as Calendar can have an own locale, use this one if used inside Calendar
	 */
	Month.prototype._getLocale = function(){

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
	Month.prototype._getLocaleData = function(){

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
	Month.prototype._getFormatLong = function(){

		var sLocale = this._getLocale();

		if (this._oFormatLong.oLocale.toString() != sLocale) {
			var oLocale = new Locale(sLocale);
			this._oFormatLong = DateFormat.getInstance({style: "long", calendarType: this.getPrimaryCalendarType()} , oLocale);
			if (this._oFormatSecondaryLong) {
				this._oFormatSecondaryLong = DateFormat.getInstance({style: "long", calendarType: this._getSecondaryCalendarType()} , oLocale);
			}
		}

		return this._oFormatLong;

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 */
	Month.prototype.getIntervalSelection = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getIntervalSelection) {
			return oParent.getIntervalSelection();
		} else {
			return this.getProperty("intervalSelection");
		}

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 */
	Month.prototype.getSingleSelection = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getSingleSelection) {
			return oParent.getSingleSelection();
		} else {
			return this.getProperty("singleSelection");
		}

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 */
	Month.prototype.getSelectedDates = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getSelectedDates) {
			return oParent.getSelectedDates();
		} else {
			return this.getAggregation("selectedDates", []);
		}

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 */
	Month.prototype.getSpecialDates = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getSpecialDates) {
			return oParent.getSpecialDates();
		} else {
			return this.getAggregation("specialDates", []);
		}

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 */
	Month.prototype.getDisabledDates = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getDisabledDates) {
			return oParent.getDisabledDates();
		} else {
			return this.getAggregation("disabledDates", []);
		}

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 */
	Month.prototype.getPrimaryCalendarType = function() {
		var oParent = this.getParent();

		if (oParent && oParent.getPrimaryCalendarType) {
			return oParent.getPrimaryCalendarType();
		}

		return this.getProperty("primaryCalendarType");
	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 */
	Month.prototype._getShowHeader = function(){

		var oParent = this.getParent();

		if (oParent && oParent._getShowMonthHeader) {
			return oParent._getShowMonthHeader();
		} else {
			return this.getProperty("showHeader");
		}

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 */
	Month.prototype.getAriaLabelledBy = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getAriaLabelledBy) {
			return oParent.getAriaLabelledBy();
		} else {
			return this.getAssociation("ariaLabelledBy", []);
		}

	};

	/*
	 * If this instance is used inside sap.ui.unified.Calendar, the legend from the Calendar will be used.
	 * This avoids any synchronization issues if maintaining a copy of the calendar legend items from Calendar to Month
	 */
	Month.prototype.getLegend = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getLegend) {
			return oParent.getLegend();
		} else {
			return this.getAssociation("legend", []);
		}

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 * If not a valid day, use LocaleData
	 */
	Month.prototype._getFirstDayOfWeek = function(){

		var oParent = this.getParent();
		var iFirstDayOfWeek = 0;

		if (oParent && oParent.getFirstDayOfWeek) {
			iFirstDayOfWeek = oParent.getFirstDayOfWeek();
		} else {
			iFirstDayOfWeek = this.getProperty("firstDayOfWeek");
		}

		if (iFirstDayOfWeek < 0 || iFirstDayOfWeek > 6) {
			var oLocaleData = this._getLocaleData();
			iFirstDayOfWeek = oLocaleData.getFirstDayOfWeek();
		}

		return iFirstDayOfWeek;

	};

	/*
	 * if used inside Calendar get the value from the parent
	 * To don't have sync issues...
	 * If not a valid day, use LocaleData
	 */
	Month.prototype._getNonWorkingDays = function(){

		var oParent = this.getParent();
		var aNonWorkingDays;

		if (oParent && oParent.getNonWorkingDays) {
			aNonWorkingDays = oParent.getNonWorkingDays();
		} else {
			aNonWorkingDays = this.getProperty("nonWorkingDays");
		}

		if (aNonWorkingDays && !Array.isArray(aNonWorkingDays)) {
			aNonWorkingDays = [];
		}

		return aNonWorkingDays;

	};

	/*
	 * Checks if a date is selected and what kind of selected
	 * @return {int} iSelected 0: not selected; 1: single day selected, 2: interval start, 3: interval end, 4: interval between, 5: one day interval (start = end)
	 * @private
	 */
	Month.prototype._checkDateSelected = function(oDate){

		CalendarUtils._checkCalendarDate(oDate);

		var iSelected = 0;
		var aSelectedDates = this.getSelectedDates();
		var oTimeStamp = oDate.toUTCJSDate().getTime();
		var sCalendarType = this.getPrimaryCalendarType();

		for ( var i = 0; i < aSelectedDates.length; i++) {
			// initalize the time part of the start and end time
			var oRange = aSelectedDates[i];
			var oStartDate = oRange.getStartDate();
			var oStartTimeStamp = 0;
			if (oStartDate) {
				oStartDate = CalendarDate.fromLocalJSDate(oStartDate, sCalendarType);
				oStartTimeStamp = oStartDate.toUTCJSDate().getTime();
			}
			var oEndDate = oRange.getEndDate();
			var oEndTimeStamp = 0;
			if (oEndDate) {
				oEndDate = CalendarDate.fromLocalJSDate(oEndDate, sCalendarType);
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
	 * Gets the type of a single date checking the specialDates aggregation
	 * the first hit is used. The only exception is when one of the types is
	 * NonWorking, then you can have both NonWorking and the other type.
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate
	 * @return {object[]} an array that contains maximum 2 objects each with date type and tooltip defined in CalendarDayType
	 * @private
	 */
	Month.prototype._getDateTypes = function(oDate){

		CalendarUtils._checkCalendarDate(oDate);

		var oType, oTypeNW, bNonWorkingType, aTypes = [];
		var aSpecialDates = this.getSpecialDates();
		var oTimeStamp = oDate.toUTCJSDate().getTime();
		// we only need the timestamp of each special date for comparison
		// because it is independent of calendar type, we use native UTC Date
		var oUTCDate = new Date(Date.UTC(0, 0, 1));

		for ( var i = 0; i < aSpecialDates.length; i++) {
			// initialize the time part of the start and end time
			var oRange = aSpecialDates[i];
			var oStartDate = oRange.getStartDate();
			var oStartTimeStamp = CalendarUtils.MAX_MILLISECONDS; //max date
			if (oStartDate) {
				oUTCDate.setUTCFullYear(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate());
				oStartTimeStamp = oUTCDate.getTime();
			}
			var oEndDate = oRange.getEndDate();
			var oEndTimeStamp = -CalendarUtils.MAX_MILLISECONDS; //min date
			if (oEndDate) {
				oUTCDate.setUTCFullYear(oEndDate.getFullYear(), oEndDate.getMonth(), oEndDate.getDate());
				oEndTimeStamp = oUTCDate.getTime();
			}

			bNonWorkingType = oRange.getType() === CalendarDayType.NonWorking;

			// collects non working day with the first occurrence of one of the types01..types20
			if ((oTimeStamp == oStartTimeStamp && !oEndDate) || (oTimeStamp >= oStartTimeStamp && oTimeStamp <= oEndTimeStamp)) {
				if (!bNonWorkingType && !oType) {
					oType = {type: oRange.getType(), tooltip: oRange.getTooltip_AsString()};
					aTypes.push(oType);
				} else if (bNonWorkingType && !oTypeNW) {
						oTypeNW = {type: oRange.getType(), tooltip: oRange.getTooltip_AsString()};
						aTypes.push(oTypeNW);
				}
				if (oType && oTypeNW) {
					break;
				}
			}
		}

		return aTypes;

	};

	/*
	 * Checks if a given date is enabled
	 * beside the disabledDates aggregation the min. and max. date of the Calendar are used
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate the date to check
	 * @return {boolean} Flag if enabled
	 * @private
	 */
	Month.prototype._checkDateEnabled = function(oDate){

		CalendarUtils._checkCalendarDate(oDate);

		var bEnabled = true;
		var aDisabledDates = this.getDisabledDates();
		var oTimeStamp = oDate.toUTCJSDate().getTime();
		var sCalendarType = this.getPrimaryCalendarType();
		var oParent = this.getParent();

		if (oParent && oParent._oMinDate && oParent._oMaxDate) {
			if (oTimeStamp < oParent._oMinDate.valueOf() || oTimeStamp > oParent._oMaxDate.valueOf()) {
				return false;
			}
		}

		for ( var i = 0; i < aDisabledDates.length; i++) {
			// initalize the time part of the start and end time
			var oRange = aDisabledDates[i];
			var oStartDate = oRange.getStartDate();
			var oStartTimeStamp = 0;
			if (oStartDate) {
				oStartDate = CalendarDate.fromLocalJSDate(oStartDate, sCalendarType);
				oStartTimeStamp = oStartDate.toUTCJSDate().getTime();
			}
			var oEndDate = oRange.getEndDate();
			var oEndTimeStamp = 0;
			if (oEndDate) {
				oEndDate = CalendarDate.fromLocalJSDate(oEndDate, sCalendarType);
				oEndTimeStamp = oEndDate.toUTCJSDate().getTime();
			}

			if (oEndDate) {
				// range disabled
				if (oTimeStamp > oStartTimeStamp && oTimeStamp < oEndTimeStamp) {
					bEnabled = false;
					break;
				}
			} else if (oTimeStamp == oStartTimeStamp) {
				// single day disabled
				bEnabled = false;
				break;
			}
		}

		return bEnabled;

	};

	Month.prototype.setWidth = function(sWidth){

		this.setProperty("width", sWidth, true);

		if (this.getDomRef()) {
			sWidth = this.getWidth(); // to get in right type
			this.$().css("width", sWidth);
		}

		return this;

	};

	Month.prototype._handleMouseMove = function(oEvent){

		if (!this.$().is(":visible")) {
			// calendar was closed -> remove mousemove handler
			this._unbindMousemove(true);
		}

		var $Target = jQuery(oEvent.target);

		if ($Target.hasClass("sapUiCalItemText")) {
			$Target = $Target.parent();
		}

		if (this._sLastTargetId && this._sLastTargetId == $Target.attr("id")) {
			// mouse move at same day -> do nothing
			return;
		}
		this._sLastTargetId = $Target.attr("id");

		if ($Target.hasClass("sapUiCalItem")) {
			var oOldFocusedDate = this._getDate();
			if (!containsOrEquals(this.getDomRef(), oEvent.target)) {
				// in multi month mode day can be in other month
				var aSelectedDates = this.getSelectedDates();

				if (aSelectedDates.length > 0 && this.getSingleSelection()) {
					var oStartDate = aSelectedDates[0].getStartDate();
					if (oStartDate) {
						oStartDate = CalendarDate.fromLocalJSDate(oStartDate, this.getPrimaryCalendarType());
					}
					var oEndDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse($Target.attr("data-sap-day")));
					if (oEndDate.isSameOrAfter(oStartDate)) {
						_updateSelection.call(this, oStartDate, oEndDate);
					}else {
						_updateSelection.call(this, oEndDate, oStartDate);
					}
				}
			} else {
				var oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse($Target.attr("data-sap-day")), this.getPrimaryCalendarType());

				if (!oFocusedDate.isSame(oOldFocusedDate)) {
					if ($Target.hasClass("sapUiCalItemOtherMonth")) {
						// in other month -> change month
						this.fireFocus({date: oFocusedDate.toLocalJSDate(), otherMonth: true});
					} else {
						this._setDate(oFocusedDate);
						var bSelected = this._selectDay(oFocusedDate, true);
						if (bSelected) {
							// remember last selected enabled date
							this._oMoveSelectedDate = new CalendarDate(oFocusedDate, this.getPrimaryCalendarType());
						}
						this._bMoveChange = true;
					}
				}
			}
		}

	};

	Month.prototype.onmousedown = function (oEvent) {
		this._oMousedownPosition = {
			clientX: oEvent.clientX,
			clientY: oEvent.clientY
		};
	};

	Month.prototype.onmouseup = function(oEvent){
		// BCP: 1980116734
		// on a combi device right mouse button resulted in a selection (both a week or a single day)
		var bNotRightMouseButton = oEvent.button !== 2;

		// fire select event on mouseup to prevent closing calendar during click

		if (this._bMouseMove) {
			this._unbindMousemove(true);

			// focus now selected day
			var oFocusedDate = this._getDate();
			var aDomRefs = this._oItemNavigation.getItemDomRefs();

			for ( var i = 0; i < aDomRefs.length; i++) {
				var $DomRef = jQuery(aDomRefs[i]);
				if (!$DomRef.hasClass("sapUiCalItemOtherMonth")) {
					if ($DomRef.attr("data-sap-day") == this._oFormatYyyymmdd.format(oFocusedDate.toUTCJSDate(), true)) {
						$DomRef.focus();
						break;
					}
				}
			}

			if (this._bMoveChange) {
				// selection was changed -> make it final
				var bSelected = this._selectDay(oFocusedDate);
				if (!bSelected && this._oMoveSelectedDate) {
					this._selectDay(this._oMoveSelectedDate);
				}
				this._bMoveChange = false;
				this._bMousedownChange = false;
				this._oMoveSelectedDate = undefined;
				_fireSelect.call(this);
			}
		}
		if (this._bMousedownChange) {
			this._bMousedownChange = false;
			_fireSelect.call(this);
		} else if (Device.support.touch && bNotRightMouseButton && this._areMouseEventCoordinatesInThreshold(oEvent.clientX, oEvent.clientY, 10)) {
			var classList = oEvent.target.classList,
				bIsDateSelected = (classList.contains("sapUiCalItemText") || classList.contains("sapUiCalDayName")),
				bIsWeekSelected = classList.contains("sapUiCalWeekNum"),
				oSelectedDate = this._getSelectedDateFromEvent(oEvent);

			if (bIsWeekSelected && this._isWeekSelectionAllowed()) {
				this._handleWeekSelection(oSelectedDate, true);
			} else if (bIsDateSelected && oEvent.shiftKey && this._isConsecutiveDaysSelectionAllowed()) {
				this._handleConsecutiveDaysSelection(oSelectedDate);
			} else if (bIsDateSelected) {
				this._selectDay(oSelectedDate, false, false);
				_fireSelect.call(this);
			}
		}

	};

	Month.prototype.onsapselect = function(oEvent){

		if (this.bSpaceButtonPressed){
			return;
		}
		// focused item must be selected
		var bSelected = this._selectDay(this._getSelectedDateFromEvent(oEvent));
		if (bSelected) {
			_fireSelect.call(this);
		}

		//to prevent bubbling into input field if in DatePicker
		oEvent.stopPropagation();
		oEvent.preventDefault();

	};

	Month.prototype.onkeydown = function(oEvent){
		if (oEvent.which === KeyCodes.SPACE){
			this.bSpaceButtonPressed = true;
		}
	};
	Month.prototype.onkeyup = function(oEvent){
		if (oEvent.which === KeyCodes.SPACE){
			this.bSpaceButtonPressed = false;
		}
	};

	Month.prototype.onsapselectmodifiers = function(oEvent){
		var oSelectedDate = this._getSelectedDateFromEvent(oEvent),
			oFirstWeekDate;

		if (this._isWeekSelectionAllowed() && oEvent.shiftKey && oEvent.keyCode === KeyCodes.SPACE) {
			// Handle Shift + Space, when week selection is allowed
			// We need to get the first week's day, because Shift + Space could be called
			// from any week's day
			oFirstWeekDate = CalendarUtils._getFirstDateOfWeek(oSelectedDate);

			this._handleWeekSelection(oFirstWeekDate, false);
		} else if (this._isConsecutiveDaysSelectionAllowed() && oEvent.shiftKey && oEvent.keyCode === KeyCodes.ENTER) {
			this._handleConsecutiveDaysSelection(oSelectedDate);
		}

		oEvent.preventDefault();
	};

	Month.prototype.onsappageupmodifiers = function(oEvent){

		// not handled by ItemNavigation
		// go one or 10 years back
		var oFocusedDate = new CalendarDate(this._getDate(), this.getPrimaryCalendarType());
		var iYear = oFocusedDate.getYear();

		if (oEvent.metaKey || oEvent.ctrlKey) {
			oFocusedDate.setYear(iYear - 10);
		} else {
			oFocusedDate.setYear(iYear - 1);
		}

		this.fireFocus({date: oFocusedDate.toLocalJSDate(), otherMonth: true});

		// cancel the event otherwise the browser select some text
		oEvent.preventDefault();

	};

	Month.prototype.onsappagedownmodifiers = function(oEvent){

		// not handled by ItemNavigation
		// go one or 10 years forward
		var oFocusedDate = new CalendarDate(this._getDate(), this.getPrimaryCalendarType());
		var iYear = oFocusedDate.getYear();

		if (oEvent.metaKey || oEvent.ctrlKey) {
			oFocusedDate.setYear(iYear + 10);
		} else {
			oFocusedDate.setYear(iYear + 1);
		}

		this.fireFocus({date: oFocusedDate.toLocalJSDate(), otherMonth: true});

		// cancel the event otherwise the browser select some text
		oEvent.preventDefault();

	};

	/*
	 * called from the calendar in multi-month case to update the interval visualization
	 * for all months.
	 */
	Month.prototype._updateSelection = function(){

		var aSelectedDates = this.getSelectedDates();

		if (aSelectedDates.length > 0) {
			var sCalendarType = this.getPrimaryCalendarType();
			var aCalStartDates = aSelectedDates.map(function(oSelectedDate) {
				var oStartDate = oSelectedDate.getStartDate();
				if (oStartDate) {
					return CalendarDate.fromLocalJSDate(oStartDate, sCalendarType);
				}
			});
			var oEndDate = aSelectedDates[0].getEndDate();
			if (oEndDate) {
				oEndDate = CalendarDate.fromLocalJSDate(oEndDate, sCalendarType);
			}
			_updateSelection.call(this, aCalStartDates, oEndDate);
		}

	};

	/**
	 * Returns if value is in predefined threshold.
	 *
	 * @private
	 */
	Month.prototype._isValueInThreshold = function (iReference, iValue, iThreshold) {
		var iLowerThreshold = iReference - iThreshold,
			iUpperThreshold = iReference + iThreshold;

		return iValue >= iLowerThreshold && iValue <= iUpperThreshold;
	};

	/**
	 * Determines if the mouse event coordinates were in a specific threshold.
	 *
	 * @param {int} clientX Mouse's horizontal coordinates
	 * @param {int} clientY Mouse's vertical coordinates
	 * @param {int} iThreshold Desired threshold
	 * @returns {boolean} Coordinates are in that threshold
	 * @private
	 */
	Month.prototype._areMouseEventCoordinatesInThreshold = function (clientX, clientY, iThreshold) {
		return this._isValueInThreshold(this._oMousedownPosition.clientX, clientX, iThreshold)
			&& this._isValueInThreshold(this._oMousedownPosition.clientY, clientY, iThreshold);
	};

	/*
	 * in Calendar with more than one months, other months must handle mousemove too
	 */
	Month.prototype._bindMousemove = function( bFireEvent ){

		jQuery(window.document).bind('mousemove', this._mouseMoveProxy);
		this._bMouseMove = true;

		if (bFireEvent) {
			// fire internal event for Calendar. In MultiMonth case all months must react on mousemove
			this.fireEvent("_bindMousemove");
		}

	};

	Month.prototype._unbindMousemove = function( bFireEvent ){

		jQuery(window.document).unbind('mousemove', this._mouseMoveProxy);
		this._bMouseMove = undefined;
		this._sLastTargetId = undefined;

		if (bFireEvent) {
			// fire internal event for Calendar. In MultiMonth case all months must react on mousemove
			this.fireEvent("_unbindMousemove");
		}

	};

	Month.prototype.onThemeChanged = function(){

		if (this._bNoThemeChange) {
			// already called from Calendar
			return;
		}

		this._bNamesLengthChecked = undefined;
		this._bLongWeekDays = undefined;
		var aWeekHeaders = this.$().find(".sapUiCalWH");
		var oLocaleData = this._getLocaleData();
		var iStartDay = this._getFirstWeekDay();
		var aDayNames = oLocaleData.getDaysStandAlone("abbreviated", this.getPrimaryCalendarType());
		for (var i = 0; i < aWeekHeaders.length; i++) {
			var oWeekDay = aWeekHeaders[i];
			jQuery(oWeekDay).text(aDayNames[(i + iStartDay) % 7]);
		}

		_checkNamesLength.call(this);

	};

	Month.prototype._handleBorderReached = function(oControlEvent){

		var oEvent = oControlEvent.getParameter("event");
		var iMonth = 0;
		var oOldDate = this._getDate();
		var oFocusedDate = new CalendarDate(oOldDate, this.getPrimaryCalendarType());

		if (oEvent.type) {
			switch (oEvent.type) {
			case "sapnext":
			case "sapnextmodifiers":
				// last day in month reached
				if (oEvent.keyCode == KeyCodes.ARROW_DOWN) {
					//goto same day next week
					oFocusedDate.setDate(oFocusedDate.getDate() + 7);
				} else {
					//go to next day
					oFocusedDate.setDate(oFocusedDate.getDate() + 1);
				}
				break;

			case "sapprevious":
			case "sappreviousmodifiers":
				// first day in month reached
				if (oEvent.keyCode == KeyCodes.ARROW_UP) {
					//goto same day previous week
					oFocusedDate.setDate(oFocusedDate.getDate() - 7);
				} else {
					//go to previous day
					oFocusedDate.setDate(oFocusedDate.getDate() - 1);
				}
				break;

			case "sappagedown":
				// go to same day next month
				iMonth = oFocusedDate.getMonth() + 1;
				oFocusedDate.setMonth(iMonth);
				// but if the day doesn't exist in this month, go to last day of the month
				if (iMonth % 12 != oFocusedDate.getMonth()) {
					while (iMonth != oFocusedDate.getMonth()) {
						oFocusedDate.setDate(oFocusedDate.getDate() - 1);
					}
				}
				break;

			case "sappageup":
				// go to same day previous month
				iMonth = oFocusedDate.getMonth() - 1;
				oFocusedDate.setMonth(iMonth);
				if (iMonth < 0) {
					iMonth = 11;
				}
				// but if the day doesn't exist in this month, go to last day of the month
				if (iMonth != oFocusedDate.getMonth()) {
					while (iMonth != oFocusedDate.getMonth()) {
						oFocusedDate.setDate(oFocusedDate.getDate() - 1);
					}
				}
				break;

			default:
				break;
			}

			this.fireFocus({date: oFocusedDate.toLocalJSDate(), otherMonth: true});

			// If the user is in single interval selection mode and he/she has selected interval's startingDate,
			// but no end date yet, then any date between startingDate and the currently focused date must be marked
			// as part of the new interval.
			if (this._isMarkingUnfinishedRangeAllowed()) {
				var oIntervalStart = this.getSelectedDates()[0],
					iParsedStartDate = parseInt(this._oFormatYyyymmdd.format(oIntervalStart.getStartDate())),
					iParsedEndDate = parseInt(this._oFormatYyyymmdd.format(oFocusedDate.toLocalJSDate()));

				this._markDatesBetweenStartAndHoveredDate(iParsedStartDate, iParsedEndDate);
			}
		}

	};

	/**
	 * checks if a date is focusable in the current rendered output.
	 * So if not rendered or in other month it is not focusable.
	 *
	 * @param {object} oDate JavaScript date object for focused date.
	 * @returns {boolean} flag if focusable
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Month.prototype.checkDateFocusable = function(oDate){

		CalendarUtils._checkJSDateObject(oDate);

		var oMonthDate = this._getDate();
		var oCalDate = CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType());

		return CalendarUtils._isSameMonthAndYear(oCalDate, oMonthDate);
	};

	/**
	 * Overrides the applyFocusInfo in order to focus the given html element.
	 * Focus handler does not work with DOM elements, but with UI5 controls only. That's why we need to take care that
	 * when focus is being restored back (e.g. after rerendering), we focus the needed DOM element (in this case day)
	 *
	 * @param {object} oInfo the focus info
	 * @returns {sap.ui.unified.calendar.Month} <code>this</code> for method chaining.
	 */
	Month.prototype.applyFocusInfo = function(oInfo){
		this._oItemNavigation.focusItem(this._oItemNavigation.getFocusedIndex());
		return this;
	};

	Month.prototype._renderHeader = function(){

		if (this._getShowHeader()) {
			var oDate = this._getDate();
			var oLocaleData = this._getLocaleData();
			var aMonthNames = oLocaleData.getMonthsStandAlone("wide", this.getPrimaryCalendarType());
			this.$("Head").text(aMonthNames[oDate.getMonth()]);
		}

	};

	/*
	 * returns the first displayed week day. Needed to change week days if too long
	 */
	Month.prototype._getFirstWeekDay = function(){

		return this._getFirstDayOfWeek();

	};

	/*
	 * returns whether the month names are too long to fit in the "boxes"
	 */
	Month.prototype._isMonthNameLong = function(aWeekHeaders){
		// check day names
		var i;
		var oWeekDay;

		for (i = 0; i < aWeekHeaders.length; i++) {
			oWeekDay = aWeekHeaders[i];
			// since browsers return different values of clientWidth and scrollWidth we give a tolerance before truncating
			// and we don't give this tolerance if we are in Compact mode
			if (Math.abs(oWeekDay.clientWidth - oWeekDay.scrollWidth) > 1) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Generates an array with all the days that should be rendered for given month to display a correct month square matrix.
	 * If no oStartDate is passed to the method will not generate new ones but will return the previously generated dates.
	 * @param {sap.ui.unified.calendar.CalendarDate} oStartDate calendar start date of the month
	 * @param {boolean} bIncludeBCDates should days before 0001-01-01 be included in the returned array. They are only
	 * needed for correct rendering of the square month matrix.
	 * @returns {Array} days to be rendered
	 * @private
	 */
	Month.prototype._getVisibleDays = function (oStartDate, bIncludeBCDates) {
		var iNextMonth,
			oDay,
			oCalDate,
			iDaysOldMonth,
			oFirstDay,
			iFirstDayOfWeek,
			iYear;

		// If date passed generate days for new start date else return the current one
		if (!oStartDate) {
			return this._aVisibleDays;
		}

		this._aVisibleDays = [];
		iFirstDayOfWeek = this._getFirstDayOfWeek();

		// determine weekday of first day in month
		oFirstDay = new CalendarDate(oStartDate, this.getPrimaryCalendarType());
		oFirstDay.setDate(1);
		iDaysOldMonth = oFirstDay.getDay() - iFirstDayOfWeek;
		if (iDaysOldMonth < 0) {
			iDaysOldMonth = 7 + iDaysOldMonth;
		}

		if (iDaysOldMonth > 0) {
			// determine first day for display
			oFirstDay.setDate(1 - iDaysOldMonth);
		}

		oDay = new CalendarDate(oFirstDay);
		iNextMonth = (oStartDate.getMonth() + 1) % 12;
		do {
			iYear = oDay.getYear();
			oCalDate = new CalendarDate(oDay, this.getPrimaryCalendarType());
			if (bIncludeBCDates && iYear < 1) {
				// For dates before 0001-01-01 we should render only empty squares to keep the month square matrix correct.
				oCalDate._bBeforeFirstYear = true;
				this._aVisibleDays.push(oCalDate);
			} else if (iYear > 0 && iYear < 10000) { // Days before 0001-01-01 or after 9999-12-31 should not be rendered.
				this._aVisibleDays.push(oCalDate);
			}
			oDay.setDate(oDay.getDate() + 1);
		} while (oDay.getMonth() !== iNextMonth || oDay.getDay() !== iFirstDayOfWeek);

		return this._aVisibleDays;
	};

	Month.prototype._handleMousedown = function(oEvent, oFocusedDate){
		var bWeekNumberPressed = oEvent.target.classList.contains("sapUiCalWeekNum"),
			bLeftMouseButton = !oEvent.button,
			oSelectedDate = this._getSelectedDateFromEvent(oEvent);

		if (!bLeftMouseButton || Device.support.touch) {
			// don't select date:
			// - if other than left button is pressed
			// - on touch device in order to avoid date selection when scrolling
			return this;
		}

		if (bWeekNumberPressed) {
			this._isWeekSelectionAllowed() && this._handleWeekSelection(oSelectedDate, true);

			return this;
		} else if (oEvent.shiftKey && this._isConsecutiveDaysSelectionAllowed()) {
			this._handleConsecutiveDaysSelection(oSelectedDate);

			return this;
		}

		var bSelected = this._selectDay(oFocusedDate);
		if (bSelected) {
			this._bMousedownChange = true;
		}

		if (this._bMouseMove) {
			// a mouseup must be happened outside of control -> just end move
			this._unbindMousemove(true);
			this._bMoveChange = false;
			this._oMoveSelectedDate = undefined;
		}else if (bSelected && this.getIntervalSelection() && this.$().is(":visible")) {
			// if calendar was closed in select event, do not add mousemove handler
			this._bindMousemove(true);
			this._oMoveSelectedDate = new CalendarDate(oFocusedDate, this.getPrimaryCalendarType());
		}

		oEvent.preventDefault(); // to prevent focus set outside of DatePicker
		oEvent.setMark("cancelAutoClose");

	};

	/**
	 * Gets what date was selected.
	 * @param oEvent Selection event
	 * @returns {sap.ui.unified.calendar.CalendarDate} Clicked date
	 * @private
	 */
	Month.prototype._getSelectedDateFromEvent = function (oEvent) {
		var $oEventTarget = jQuery(oEvent.target),
			// The date will be either on the element itself when selected via KB,
			// or on the internal span (which contains the date number) if selected via mouse
			oExtractedDate = $oEventTarget.attr("data-sap-day") || $oEventTarget.parent().attr("data-sap-day"),
			oParsedDate = this._oFormatYyyymmdd.parse(oExtractedDate);

		// Return null for cases like user clicking on an empty space, today's border, etc...
		return oParsedDate ? CalendarDate.fromLocalJSDate(oParsedDate, this.getPrimaryCalendarType()) : null;
	};

	/**
	 * Decides if selecting/deselecting week's days should be done individually for each day or as one interval.
	 * In addition to this, depending on user's decision, this method either refocuses or keeps the focus.
	 * @param {sap.ui.unified.calendar.CalendarDate} oStartDate The first date of a given week
	 * @param {boolean} bFocusStartDate
	 * 			Whether or not the first date should be focused.
	 * 			<b>Note:</b> This should be set to <code>true</code> if week number is selected,
	 * 			since that isn't a focusable element.
	 * @returns {sap.ui.unified.calendar.Month} this For chaining
	 * @private
	 */
	Month.prototype._handleWeekSelection = function (oStartDate, bFocusStartDate) {
		var iSelectedWeekNumber = CalendarUtils.calculateWeekNumber(oStartDate.toUTCJSDate(), oStartDate.getYear(), this._getLocale(), this._getLocaleData()),
			oEndDate = this._getLastWeekDate(oStartDate),
			bSingleSelection = this.getSingleSelection(),
			bIntervalSelection = this.getIntervalSelection();

		if (!bSingleSelection && !bIntervalSelection) {
			// Selecting each day separately
			this._handleWeekSelectionByMultipleDays(iSelectedWeekNumber, oStartDate, oEndDate);
		} else if (bSingleSelection && bIntervalSelection) {
			// Selecting the week as a whole interval
			this._handleWeekSelectionBySingleInterval(iSelectedWeekNumber, oStartDate, oEndDate);
		}

		// When this method is called due to a week number's press, then focus
		// should be moved to the first date, since the week number itself isn't focusable
		bFocusStartDate && this._focusDate(oStartDate);

		return this;
	};

	/**
	 * Selects N-count independent consecutive days from the last selected date,
	 * or deselects them if they are already selected.
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oEndDate The last of those days to be selected
	 * @returns {sap.ui.unified.calendar.Month} this For chaining
	 * @private
	 */
	Month.prototype._handleConsecutiveDaysSelection = function (oEndDate) {
		var aSelectedDates = this.getSelectedDates(),
			oLastSelectedDate = aSelectedDates.length && aSelectedDates[aSelectedDates.length - 1].getStartDate(),
			oStartDate = oLastSelectedDate ? CalendarDate.fromLocalJSDate(oLastSelectedDate) : oEndDate,
			bShouldDeselectDays;

		bShouldDeselectDays = this._areAllDaysBetweenSelected(oStartDate, oEndDate);

		this._toggleDaysBetween(oStartDate, oEndDate, !bShouldDeselectDays);

		return this;
	};

	/**
	 * Determines if week selection is allowed.
	 * @returns {boolean} Week selection is allowed
	 * @private
	 */
	Month.prototype._isWeekSelectionAllowed = function () {
		var bSingleSelection = this.getSingleSelection(),
			bIntervalSelection = this.getIntervalSelection(),
			sCalendarType = this.getPrimaryCalendarType(),
			bCustomFirstDayOfWeekSet = this.getFirstDayOfWeek() !== -1,
			bIsMultipleDaySelection = !bSingleSelection && !bIntervalSelection,
			bIsSingleIntervalSelection = bSingleSelection && bIntervalSelection,
			bAllowedSelection = bIsSingleIntervalSelection || bIsMultipleDaySelection;

		// Week selection is allowed only for Gregorian calendar when:
		// 1) We have multiple day selection
		// 2) We don't have custom firstDayOfWeek set
		// 3) We have single interval selection
		return sCalendarType === CalendarType.Gregorian
			&& !bCustomFirstDayOfWeekSet
			&& bAllowedSelection;
	};

	/**
	 * Determines if selecting consecutive days using SHIFT is allowed.
	 * @returns {boolean} Such selection is allowed
	 * @private
	 */
	Month.prototype._isConsecutiveDaysSelectionAllowed = function () {
		var bSingleSelection = this.getSingleSelection(),
			bIntervalSelection = this.getIntervalSelection();

		return !bSingleSelection && !bIntervalSelection;
	};

	/**
	 * Determines if indication for unfinished interval selection should be displayed.
	 * @returns {boolean}
	 * @private
	 */
	Month.prototype._isMarkingUnfinishedRangeAllowed = function () {
		// Method should return 'true' only when 'intervalSelection' is set to 'true', the user has selected
		// the range's startDate, but hasn't selected its endDate yet
		var oSelectedRange = this.getSelectedDates()[0],
			bValidRangeForMarking = !!(oSelectedRange && oSelectedRange.getStartDate() && !oSelectedRange.getEndDate());

		return (this.getIntervalSelection() && bValidRangeForMarking);
	};

	/**
	 * Selects week's days individually, or deselects them if they were already selected.
	 *
	 * @param {int} iWeekNumber Week's number
	 * @param {sap.ui.unified.calendar.CalendarDate} oStartDate Week's start date
	 * @param {sap.ui.unified.calendar.CalendarDate} oEndDate Week's end date
	 * @returns {sap.ui.unified.calendar.Month} this For chaining
	 * @private
	 */
	Month.prototype._handleWeekSelectionByMultipleDays = function (iWeekNumber, oStartDate, oEndDate) {
		var oSelectedWeekDays,
			bExecuteDefault;

		if (this._areAllDaysBetweenSelected(oStartDate, oEndDate)) {
			oSelectedWeekDays = null;
		} else {
			oSelectedWeekDays = new DateRange({ startDate: oStartDate.toLocalJSDate(), endDate: oEndDate.toLocalJSDate() });
		}

		bExecuteDefault = this.fireWeekNumberSelect({
			weekNumber: iWeekNumber,
			weekDays: oSelectedWeekDays
		});

		if (bExecuteDefault) {
			this._toggleDaysBetween(oStartDate, oEndDate, !!oSelectedWeekDays);
		}

		return this;
	};

	/**
	 * Selects week's days as a single interval, or deselects that interval if it already exists.
	 *
	 * @param {int} iWeekNumber Week's number
	 * @param {sap.ui.unified.calendar.CalendarDate} oStartDate Week's start date
	 * @param {sap.ui.unified.calendar.CalendarDate} oEndDate Week's end date
	 * @returns {sap.ui.unified.calendar.Month} this For chaining
	 * @private
	 */
	Month.prototype._handleWeekSelectionBySingleInterval = function(iWeekNumber, oStartDate, oEndDate) {
		var oDateRange = new DateRange({ startDate: oStartDate.toLocalJSDate(), endDate: oEndDate.toLocalJSDate() }),
			oMonthParent = this.getParent(),
			oAggOwner = this,
			bExecuteDefault;

		if (oMonthParent && oMonthParent.getSelectedDates) {
			oAggOwner = oMonthParent;
		}

		if (this._isIntervalSelected(oDateRange)) {
			oDateRange = null;
		}

		bExecuteDefault = this.fireWeekNumberSelect({
			weekNumber: iWeekNumber,
			weekDays: oDateRange
		});

		if (bExecuteDefault) {
			// when intervalSelection: true, only one range can be selected at a time, so
			// destroy the old selected dates and select the new ones except one case -
			// when again clicked on a same week number - then remove the selections
			oAggOwner.removeAllSelectedDates();
			oAggOwner.addSelectedDate(oDateRange);
		}

		return this;
	};

	/**
	 * Determines if a selected interval with the same start and end already exists.
	 *
	 * @param {sap.ui.unified.DateRange} oDateRangeInterval The interval we want to check
	 * @returns {boolean} Interval was selected
	 * @private
	 */
	Month.prototype._isIntervalSelected = function(oDateRangeInterval) {
		var aSelectedDates = this.getSelectedDates(),
			aSelectedInterval = aSelectedDates.length && aSelectedDates[0],
			aSelectedIntervalEndDate = aSelectedInterval && aSelectedInterval.getEndDate();

		return aSelectedInterval
			&& aSelectedInterval.getStartDate().getTime() === oDateRangeInterval.getStartDate().getTime()
			&& aSelectedIntervalEndDate
			&& aSelectedInterval.getEndDate().getTime() === oDateRangeInterval.getEndDate().getTime();
	};

	/**
	 * Returns the last week's date based on that week's start date.
	 * @param {sap.ui.unified.calendar.CalendarDate} oStartDate Week's start date
	 * @returns {sap.ui.unified.calendar.CalendarDate} Last week's date
	 * @private
	 */
	Month.prototype._getLastWeekDate = function (oWeekStartDate) {
		return new CalendarDate(oWeekStartDate).setDate(oWeekStartDate.getDate() + 6);
	};

	/**
	 * Selects/deselects all dates between other two dates.
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oStartDate Starting date
	 * @param {sap.ui.unified.calendar.CalendarDate} oEndDate End date
	 * @param {boolean} bSelect [bSelect=false] Whether to select or deselect the days
	 * @returns {sap.ui.unified.calendar.Month} this For chaining
	 * @private
	 */
	Month.prototype._toggleDaysBetween = function (oStartDate, oEndDate, bSelect) {
		var oArrangedDates = this._arrangeStartAndEndDates(oStartDate, oEndDate),
			oDateToBeToggled = new CalendarDate(oArrangedDates.startDate),
			bDateIsAlreadySelected;

		do {
			bDateIsAlreadySelected = this._checkDateSelected(oDateToBeToggled);
			// Add only dates, which are not selected already, in order to avoid duplicates
			// TODO: Maybe deselect them and then select them again, so that their order is kept the same?
			if ((!bDateIsAlreadySelected && bSelect) || (bDateIsAlreadySelected && !bSelect)) {
				this._selectDay(oDateToBeToggled);
				_fireSelect.call(this);
			}

			oDateToBeToggled.setDate(oDateToBeToggled.getDate() + 1);
		} while (oDateToBeToggled.isSameOrBefore(oArrangedDates.endDate));

		return this;
	};

	/**
	 * Determines if all dates between two dates are already selected.
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oStartDate Starting date
	 * @param {sap.ui.unified.calendar.CalendarDate} oEndDate End date
	 * @returns {boolean} All dates are selected
	 * @private
	 */
	Month.prototype._areAllDaysBetweenSelected = function (oStartDate, oEndDate) {
		var oArrangedDates = this._arrangeStartAndEndDates(oStartDate, oEndDate),
			oCurrentDate = new CalendarDate(oArrangedDates.startDate),
			bAllDaysAreSelected = true;

		do {
			// If we find an unselected date in our range, then immediately break the loop
			// and return false
			if (!this._checkDateSelected(oCurrentDate)) {
				bAllDaysAreSelected = false;
				break;
			}

			oCurrentDate.setDate(oCurrentDate.getDate() + 1);
		} while (oCurrentDate.isSameOrBefore(oArrangedDates.endDate));

		return bAllDaysAreSelected;
	};

	/**
	 * Arranges two dates in such a way, that the starting date precedes (or is at least equal to)
	 * the endingDate.
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oStartDate Provided starting date
	 * @param {sap.ui.unified.calendar.CalendarDate} oEndDate Provided end date
	 * @returns {Object} The correctly arranged dates
	 * @private
	 */
	Month.prototype._arrangeStartAndEndDates = function (oStartDate, oEndDate) {
		var bAreInitiallyArranged = oStartDate.isSameOrBefore(oEndDate);

		return {
			startDate: bAreInitiallyArranged ? oStartDate : oEndDate,
			endDate: bAreInitiallyArranged ? oEndDate : oStartDate
		};
	};

	/**
	 * Selects a given date.
	 * @param{sap.ui.unified.calendar.CalendarDate} oDate the date to select
	 * @param {boolean} bMove Whether there is move mode
	 * @return {boolean} true if the date was really selected, false otherwise
	 * @private
	 */
	Month.prototype._selectDay = function(oDate, bMove) {

		if (!this._checkDateEnabled(oDate)) {
			// date is disabled -> do not select it
			return false;
		}

		var aSelectedDates = this.getSelectedDates();
		var oDateRange;
		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var $DomRef;
		var sYyyymmdd;
		var i = 0;
		var oParent = this.getParent();
		var oAggOwner = this;
		var oStartDate;
		var sCalendarType = this.getPrimaryCalendarType();

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
					oStartDate = CalendarDate.fromLocalJSDate(oStartDate, sCalendarType);
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
						// in move mode do not set date. this bring problems if on backward move the start date would be cahnged
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
						if (oStartDate && oDate.isSame(CalendarDate.fromLocalJSDate(oStartDate, sCalendarType))) {
							oAggOwner.removeAggregation("selectedDates", i, true); // no re-rendering
							break;
						}
					}
				} else {
					// not selected -> select
					oDateRange = new DateRange({startDate: oDate.toLocalJSDate()});
					oAggOwner.addAggregation("selectedDates", oDateRange, true); // no re-rendering
				}
				sYyyymmdd = this._oFormatYyyymmdd.format(oDate.toUTCJSDate(), true);
				for ( i = 0; i < aDomRefs.length; i++) {
					$DomRef = jQuery(aDomRefs[i]);
					if ($DomRef.attr("data-sap-day") == sYyyymmdd) {
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

	};

	function _initItemNavigation(){

		var sYyyymmdd = this._oFormatYyyymmdd.format(this._getDate().toUTCJSDate(), true);
		var iIndex = 0;

		var oRootDomRef = this.$("days").get(0);
		var aDomRefs = this.$("days").find(".sapUiCalItem");

		for ( var i = 0; i < aDomRefs.length; i++) {
			var $DomRef = jQuery(aDomRefs[i]);
			if ($DomRef.attr("data-sap-day") === sYyyymmdd) {
				iIndex = i;
				break;
			}
		}

		if (!this._oItemNavigation) {
			this._oItemNavigation = new ItemNavigation();
			this._oItemNavigation.attachEvent(ItemNavigation.Events.AfterFocus, _handleAfterFocus, this);
			this._oItemNavigation.attachEvent(ItemNavigation.Events.FocusAgain, _handleFocusAgain, this);
			this._oItemNavigation.attachEvent(ItemNavigation.Events.BorderReached, this._handleBorderReached, this);
			this.addDelegate(this._oItemNavigation);
			if (this._iColumns > 1) {
				this._oItemNavigation.setHomeEndColumnMode(true, true);
			}
			this._oItemNavigation.setDisabledModifiers({
				sapnext : ["alt"],
				sapprevious : ["alt"],
				saphome : ["alt"],
				sapend : ["alt"]
			});
			this._oItemNavigation.setCycling(false);
			this._oItemNavigation.setColumns(this._iColumns, true);
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
		var oFocusedDate = new CalendarDate(oOldDate, this.getPrimaryCalendarType());
		var bOtherMonth = false;
		var bFireFocus = true;

		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var i = 0;

		// find out what day was focused
		var $DomRef = jQuery(aDomRefs[iIndex]);
		var $DomRefDay;
		/* eslint-disable no-lonely-if */
		if ($DomRef.hasClass("sapUiCalItemOtherMonth")) {
			if (oEvent.type == "saphomemodifiers" && (oEvent.metaKey || oEvent.ctrlKey)) {
				// on ctrl+home key focus first day of month
				oFocusedDate.setDate(1);
				this._focusDate(oFocusedDate);
			} else if (oEvent.type == "sapendmodifiers" && (oEvent.metaKey || oEvent.ctrlKey)) {
				// on ctrl+end key focus last day of month
				for ( i = aDomRefs.length - 1; i > 0; i--) {
					$DomRefDay = jQuery(aDomRefs[i]);
					if (!$DomRefDay.hasClass("sapUiCalItemOtherMonth")) {
						oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse($DomRefDay.attr("data-sap-day")), this.getPrimaryCalendarType());
						break;
					}
				}
				this._focusDate(oFocusedDate);
			} else {
				// focus old date again, but tell parent about the new date
				bOtherMonth = true;
				oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse($DomRef.attr("data-sap-day")), this.getPrimaryCalendarType());
				if (!oFocusedDate) {
					oFocusedDate = new CalendarDate(oOldDate); // e.g. year > 9999
				}
				this._focusDate(oOldDate);

				if (oEvent.type == "mousedown" ||
						(this._sTouchstartYyyyMMdd && oEvent.type == "focusin" && this._sTouchstartYyyyMMdd == $DomRef.attr("data-sap-day"))) {
					// don't focus date in other month via mouse -> don't switch month in calendar while selecting day
					bFireFocus = false;
					this.fireFocus({date: oOldDate.toLocalJSDate(), otherMonth: false, restoreOldDate: true});
				}

				// on touch devices a focusin is fired asyncrounously after the touch/mouse handling on DOM element if the focus was changed in the meantime
				// focus old date again and do not fire focus event
				if (oEvent.originalEvent && oEvent.originalEvent.type == "touchstart") {
					this._sTouchstartYyyyMMdd = $DomRef.attr("data-sap-day");
				} else {
					this._sTouchstartYyyyMMdd = undefined;
				}
			}
		} else {
			// day in current month focused
			if (jQuery(oEvent.target).hasClass("sapUiCalWeekNum")) {
				// click on week number - focus old date
				this._focusDate(oFocusedDate);
			}else {
				// not if clicked on week number
				oFocusedDate = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse($DomRef.attr("data-sap-day")), this.getPrimaryCalendarType());
				this._setDate(oFocusedDate);
			}
			this._sTouchstartYyyyMMdd = undefined;
		}

		if (oEvent.type == "mousedown" && this.getIntervalSelection()) {
			// as in the focus event the month can be changed, store the last target here
			this._sLastTargetId = $DomRef.attr("id");
		}

		if (bFireFocus) {
			this.fireFocus({date: oFocusedDate.toLocalJSDate(), otherMonth: bOtherMonth});
		}

		if (oEvent.type == "mousedown") {
			// as no click event is fired in some cases, e.g. if month is changed (because of changing DOM) select the day on mousedown
			this._handleMousedown(oEvent, oFocusedDate, iIndex);
		}

		if (oEvent.type === "sapnext" || oEvent.type === "sapprevious") {
			var oSelectedDateRange = this.getSelectedDates()[0],
				iIntervalStartDate,
				iIntervalEndDate;

			if (!this._isMarkingUnfinishedRangeAllowed()) {
				return;
			}

			iIntervalStartDate = parseInt(this._oFormatYyyymmdd.format(oSelectedDateRange.getStartDate()));
			iIntervalEndDate = $DomRef.data("sapDay");

			this._markDatesBetweenStartAndHoveredDate(iIntervalStartDate, iIntervalEndDate);
		}
	}

	function _handleFocusAgain(oControlEvent){

		var iIndex = oControlEvent.getParameter("index");
		var oEvent = oControlEvent.getParameter("event");

		if (!oEvent) {
			return; // happens if focus is set via ItemNavigation.focusItem directly
		}

		if (oEvent.type == "mousedown") {
			// as no click event is fired in some cases, e.g. if month is changed (because of changing DOM) select the day on mousedown
			var oFocusedDate = this._getDate();
			if (this.getIntervalSelection()) {
				var aDomRefs = this._oItemNavigation.getItemDomRefs();
				this._sLastTargetId = aDomRefs[iIndex].id;
			}
			this._handleMousedown(oEvent, oFocusedDate, iIndex);
		}

	}

	/**
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate the calendar date
	 * @param {boolean} bNoFocus Will the focusing of the date be skipped (true) or not (false)
	 * @private
	 */
	function _changeDate (oDate, bNoFocus){

		CalendarUtils._checkCalendarDate(oDate);

		var iYear = oDate.getYear();
		CalendarUtils._checkYearInValidRange(iYear);

		var bFocusable = true; // if date not changed it is still focusable
		if (!this.getDate() || !oDate.isSame(CalendarDate.fromLocalJSDate(this.getDate(), oDate.getCalendarType()))) {
			var oCalDate = new CalendarDate(oDate);
			bFocusable = this.checkDateFocusable(oDate.toLocalJSDate());
			this.setProperty("date", oDate.toLocalJSDate(), true);
			this._oDate = oCalDate;
		}

		if (this.getDomRef()) {
			if (bFocusable) {
				this._focusDate(this._oDate, true, bNoFocus);
			} else {
				_renderMonth.call(this, bNoFocus);
			}
		}

	}

	/**
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate the calendar date to focus
	 * @param {boolean} bSkipSetDate if true, this function will skip setting the public property "date"
	 * @param {boolean} bSkipFocus if true, item navigator's focus won't be set, but just the index will so.
	 * @private
	 */
	Month.prototype._focusDate = function(oDate, bSkipSetDate, bSkipFocus){

		if (!bSkipSetDate) {
			// use JS date as public function is called
			this.setDate(oDate.toLocalJSDate());
		}

		var sYyyymmdd = this._oFormatYyyymmdd.format(oDate.toUTCJSDate(), true);
		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var $DomRefDay;
		for ( var i = 0; i < aDomRefs.length; i++) {
			$DomRefDay = jQuery(aDomRefs[i]);
			if ($DomRefDay.attr("data-sap-day") == sYyyymmdd) {
				if (document.activeElement != aDomRefs[i]) {
					if (bSkipFocus) {
						this._oItemNavigation.setFocusedIndex(i);
					} else {
						this._oItemNavigation.focusItem(i);
					}
				}
				break;
			}
		}

	};

	function _renderMonth(bNoFocus){

		var oDate = this.getRenderer().getStartDate(this);
		var $Container = this.$("days");
		var $Weeks = this.$("weeks");
		var aDomRefs;
		var $DomRef;
		var i = 0;
		var iLastIndex = 0;

		if (this._sLastTargetId) {
			// new month during mousemove -> get index of last moving taget to ignore move on same area
			aDomRefs = this._oItemNavigation.getItemDomRefs();
			for ( i = 0; i < aDomRefs.length; i++) {
				$DomRef = jQuery(aDomRefs[i]);
				if ($DomRef.attr("id") == this._sLastTargetId) {
					iLastIndex = i;
					break;
				}
			}
		}

		if ($Container.length > 0) {
			var oRm = sap.ui.getCore().createRenderManager();
			this.getRenderer().renderDays(oRm, this, oDate);
			oRm.flush($Container[0]);

			if ($Weeks.length) {
				this.getRenderer().renderWeekNumbers(oRm, this);
				oRm.flush($Weeks[0]);
			}

			oRm.destroy();
		}

		this._renderHeader();

		// fire internal event for DatePicker for with number of rendered days. If Calendar becomes larger maybe popup must change position
		this.fireEvent("_renderMonth", {days: $Container.find(".sapUiCalItem").length});

		_initItemNavigation.call(this);
		if (!bNoFocus) {
			this._oItemNavigation.focusItem(this._oItemNavigation.getFocusedIndex());
		}

		if (this._sLastTargetId) {
			// new month during mousemove -> get index of last moving taget to ignore move on same area
			aDomRefs = this._oItemNavigation.getItemDomRefs();
			if (iLastIndex <= aDomRefs.length - 1) {
				$DomRef = jQuery(aDomRefs[iLastIndex]);
				this._sLastTargetId = $DomRef.attr("id");
			}
		}

	}

	/*
	 * Toggles the selected class for the currently selected date.
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate[]} aStartDate multiple selected dates or a single start date of a range
	 * @param {sap.ui.unified.calendar.CalendarDate} oEndDate end of a range
	 * @private
	 */

	function _updateSelection(aStartDate, oEndDate){
		if (!Array.isArray(aStartDate)) {
			aStartDate = [aStartDate];
		}

		var aDomRefs = this._oItemNavigation.getItemDomRefs();
		var $DomRef;
		var i = 0;
		var bStart = false;
		var bEnd = false;

		if (!oEndDate) {
			// start of interval, single date or multiple dates
			var aCalFormattedStartDates = aStartDate.map(function(oSD) {
				return this._oFormatYyyymmdd.format(oSD.toUTCJSDate(), true);
			}, this);
			for ( i = 0; i < aDomRefs.length; i++) {
				$DomRef = jQuery(aDomRefs[i]);
				bStart = false;
				bEnd = false;
				if (aCalFormattedStartDates.indexOf($DomRef.attr("data-sap-day")) > -1) {
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
				oDay = CalendarDate.fromLocalJSDate(this._oFormatYyyymmdd.parse($DomRef.attr("data-sap-day")), CalendarType.Gregorian);
				if (oDay.isSame(aStartDate[0])) {
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
				} else if (oEndDate && CalendarUtils._isBetween(oDay, aStartDate[0], oEndDate)) {
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
			this._unbindMousemove(true);
		}

		this.fireSelect();

	}

	function _checkNamesLength(){

		if (!this._bNamesLengthChecked) {
			// only once - cannot change by rerendering - only by theme change
			var oWeekDay;
			var aWeekHeaders = this.$().find(".sapUiCalWH");
			var bTooLong = this._isMonthNameLong(aWeekHeaders);
			var i = 0;

			if (bTooLong) {
				this._bLongWeekDays = false;
				var oLocaleData = this._getLocaleData();
				var iStartDay = this._getFirstWeekDay();
				var aDayNames = oLocaleData.getDaysStandAlone("narrow", this.getPrimaryCalendarType());
				for ( i = 0; i < aWeekHeaders.length; i++) {
					oWeekDay = aWeekHeaders[i];
					jQuery(oWeekDay).text(aDayNames[(i + iStartDay) % 7]);
				}
			} else {
				this._bLongWeekDays = true;
			}

			this._bNamesLengthChecked = true;
		}

	}

	return Month;

});