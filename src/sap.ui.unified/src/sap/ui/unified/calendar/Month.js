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
	'sap/ui/unified/DateTypeRange',
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
	DateTypeRange,
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
			showWeekNumbers : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * The value of this property is set trough the sap.ui.unified.Calendar control,
			 * in order for the current sap.ui.unified.calendar.Month control to know which
			 * is the focused date even if this date is out of the visible date range
			 *
			 * @since 1.90
			 */
			_focusedDate : {type : "object", group : "Data", visibility: "hidden", defaultValue: null}

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
					 * focused date is in an other month than the displayed one
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
	}, renderer: MonthRenderer});

	Month.prototype.init = function(){

		// set default calendar type from configuration
		var sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
		this.setProperty("primaryCalendarType", sCalendarType);
		this.setProperty("secondaryCalendarType", sCalendarType);

		this._oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyyMMdd", calendarType: CalendarType.Gregorian});
		this._oFormatLong = DateFormat.getInstance({style: "long", calendarType: sCalendarType});

		this._mouseMoveProxy = this._handleMouseMove.bind(this);

		this._iColumns = 7;

		this._oMinDate = CalendarUtils._minDate(this.getPrimaryCalendarType());
		this._oMaxDate = CalendarUtils._maxDate(this.getPrimaryCalendarType());

		// Currently visible days
		this._aVisibleDays = [];

		this._bAlwaysShowSpecialDates = false;
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
		this._bAlwaysShowSpecialDates = null;

	};

	Month.prototype.getFocusDomRef = function(){
		return this.getDomRef() && this._oItemNavigation.getItemDomRefs()[this._oItemNavigation.getFocusedIndex()];
	};

	Month.prototype.onAfterRendering = function(){
		this.bSpaceButtonPressed = false;
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

			if (iCheckDate > iDate1 && iCheckDate < iDate2 && this._isInAllowedRange(iCheckDate)) {
				$CheckRef.addClass('sapUiCalItemSelBetween');
			} else {
				$CheckRef.removeClass('sapUiCalItemSelBetween');
				if (iCheckDate != iDate1 && iCheckDate != iDate2) {
					$CheckRef.removeClass('sapUiCalItemSel');
				}
			}
		}
	};

	Month.prototype._isInAllowedRange = function(iCheckDate) {
		return this._oFormatYyyymmdd.parse(iCheckDate).getTime() > this._oMinDate.toLocalJSDate().getTime()
			&& this._oFormatYyyymmdd.parse(iCheckDate).getTime() < this._oMaxDate.toLocalJSDate().getTime();
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
	 * @return {this} <code>this</code> for method chaining
	 */
	Month.prototype.setDate = function(oDate){
		if (oDate) {
			var oCalDate = CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType());
			_changeDate.call(this, oCalDate);
		}

		return this.setProperty("date", oDate);

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
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Month.prototype.displayDate = function(oDate){
		var oCalDate = CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType());
		_changeDate.call(this, oCalDate);

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
		this.setProperty("secondaryCalendarType", sCalendarType);

		this._oFormatSecondaryLong = DateFormat.getInstance({style: "long", calendarType: sCalendarType});

		return this;

	};

	Month.prototype._getSecondaryCalendarType = function(){

		var sSecondaryCalendarType;

		if (this._bSecondaryCalendarTypeSet) {
			sSecondaryCalendarType = this.getSecondaryCalendarType();
			var sPrimaryCalendarType = this.getPrimaryCalendarType();
			if (sSecondaryCalendarType === sPrimaryCalendarType) {
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

		if (this._oFormatLong.oLocale.toString() !== sLocale) {
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
	 * Checks if a date have to be rendered as special date.
	 *
	 * In Month and OneMonthDatesRow on small screen scenarios only the special dates inside current month are marked as special.
	 * In DatesRow and OneMonthDatesRow on large screen scenarios all special dates are rendered as such.
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} the date to be checked
	 * @return {boolean} if the given date should be rendered as special date
	 * @private
	 */
	Month.prototype._isSpecialDateMarkerEnabled = function(oDay) {
		var oMonthDate;
		if (this.getStartDate) {
			oMonthDate = this.getStartDate();
		} else if (this.getDate()) {
			oMonthDate = this.getDate();
		} else {
			oMonthDate = new Date();
		}

		return this._bAlwaysShowSpecialDates || CalendarUtils._isSameMonthAndYear(oDay, CalendarDate.fromLocalJSDate(oMonthDate));
	};

	/*
	 * Checks if a date is selected and what kind of selected
	 * @return {int} iSelected 0: not selected; 1: single day selected, 2: interval start, 3: interval end, 4: interval between, 5: one day interval (start = end)
	 * @private
	 */
	Month.prototype._checkDateSelected = function(oDate){

		CalendarUtils._checkCalendarDate(oDate);

		var iSelected = 0,
			aSelectedDates = this.getSelectedDates(),
			sCalendarType = this.getPrimaryCalendarType(),
			i = 0,
			oFocusedDate = this.getProperty("_focusedDate"),
			bSelectionBetween = false,
			oArrangedDates;

		for (i = 0; i < aSelectedDates.length; i++) {
			var oRange = aSelectedDates[i],
				oStartDate = oRange.getStartDate() ? CalendarDate.fromLocalJSDate(oRange.getStartDate(), sCalendarType) : undefined,
				oEndDate = oRange.getEndDate() ? CalendarDate.fromLocalJSDate(oRange.getEndDate(), sCalendarType) : undefined;

			if (oStartDate && oEndDate) {
				oArrangedDates = this._arrangeStartAndEndDates(oStartDate, oEndDate);
				oStartDate = oArrangedDates.startDate;
				oEndDate = oArrangedDates.endDate;
			}

			bSelectionBetween = this._isMarkingUnfinishedRangeAllowed() && oFocusedDate &&
				(CalendarUtils._isBetween(oDate, oStartDate, oFocusedDate, true) || CalendarUtils._isBetween(oDate, oFocusedDate, oStartDate, true));

			if (oStartDate && !oEndDate && oDate.isSame(oStartDate)) {
				iSelected = 1; // single day selected
				break;
			} else if (oEndDate && oDate.isSame(oStartDate)) {
				iSelected = 2; // interval start
				if (oDate.isSame(oEndDate)) {
					iSelected = 5; // one day interval
				}
				break;
			} else if (oEndDate && oDate.isSame(oEndDate)) {
				iSelected = 3; // interval _getend
				break;
			} else if ((oEndDate && oDate.isAfter(oStartDate) && oDate.isBefore(oEndDate)) || bSelectionBetween) {
				iSelected = 4; // interval between
				break;
			}

			if (this.getSingleSelection()) {
				break; // if single selection only check the first range
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
		var aSpecialDates = this._getSpecialDates();
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
			if ((oTimeStamp === oStartTimeStamp && !oEndDate) || (oTimeStamp >= oStartTimeStamp && oTimeStamp <= oEndTimeStamp)) {
				if (!bNonWorkingType && !oType) {
					oType = {type: oRange.getType(), tooltip: oRange.getTooltip_AsString(), color: oRange.getColor()};
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
			} else if (oTimeStamp === oStartTimeStamp) {
				// single day disabled
				bEnabled = false;
				break;
			}
		}

		return bEnabled;

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

		if (this._sLastTargetId && this._sLastTargetId === $Target.attr("id")) {
			// mouse move at same day -> do nothing
			return;
		}
		this._sLastTargetId = $Target.attr("id");

		if ($Target.hasClass("sapUiCalItem")) {
			var oOldFocusedDate = this._getDate();
			if (containsOrEquals(this.getDomRef(), oEvent.target)) {
				var oFocusedDate = CalendarDate.fromUTCDate(this._oFormatYyyymmdd.parse($Target.attr("data-sap-day"), true), this.getPrimaryCalendarType());

				if (!oFocusedDate.isSame(oOldFocusedDate)) {
					this._oDate = oFocusedDate;
					var bSelected = this._selectDay(oFocusedDate, true);
					if (bSelected) {
						// remember last selected enabled date
						this._oMoveSelectedDate = new CalendarDate(oFocusedDate, this.getPrimaryCalendarType());
					}
					this._bMoveChange = true;
				}
			}
		}

	};

	Month.prototype.onmousedown = function (oEvent) {
		this._oMousedownPosition = {
			clientX: oEvent.clientX,
			clientY: oEvent.clientY
		};

		// handle only mouse down on a week number
		if (oEvent.button
			|| Device.support.touch
			|| !this._isWeekSelectionAllowed()
			|| !oEvent.target.classList.contains("sapUiCalWeekNum")) {
			return;
		}

		var $oEventTarget = jQuery(oEvent.target),
			oExtractedDate = $oEventTarget.siblings().eq(0).attr("data-sap-day"),
			oParsedDate = this._oFormatYyyymmdd.parse(oExtractedDate, true),
			oFirstDayOfWeekCalendarDate = CalendarDate.fromUTCDate(oParsedDate, this.getPrimaryCalendarType());

		this._handleWeekSelection(oFirstDayOfWeekCalendarDate, true);
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
					if ($DomRef.attr("data-sap-day") === this._oFormatYyyymmdd.format(oFocusedDate.toUTCJSDate(), true)) {
						$DomRef.trigger("focus");
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
		return this._oMousedownPosition // because of BCP 2080183678 - check for this._oMousedownPosition
			&& this._isValueInThreshold(this._oMousedownPosition.clientX, clientX, iThreshold)
			&& this._isValueInThreshold(this._oMousedownPosition.clientY, clientY, iThreshold)
			? true : false;
	};

	/*
	 * in Calendar with more than one months, other months must handle mousemove too
	 */
	Month.prototype._bindMousemove = function( bFireEvent ){

		jQuery(window.document).on('mousemove', this._mouseMoveProxy);
		this._bMouseMove = true;

		if (bFireEvent) {
			// fire internal event for Calendar. In MultiMonth case all months must react on mousemove
			this.fireEvent("_bindMousemove");
		}

	};

	Month.prototype._unbindMousemove = function( bFireEvent ){

		jQuery(window.document).off('mousemove', this._mouseMoveProxy);
		this._bMouseMove = undefined;
		this._sLastTargetId = undefined;

		if (bFireEvent) {
			// fire internal event for Calendar. In MultiMonth case all months must react on mousemove
			this.fireEvent("_unbindMousemove");
		}

	};

	Month.prototype.onThemeChanged = function(){

		if (this._bNoThemeChange || !this.getDomRef()) {
			// already called from Calendar or not candidate for rendering yet
			return;
		}

		var aWeekHeaders = this.getDomRef().querySelectorAll(".sapUiCalWH:not(.sapUiCalDummy)"),
			oLocaleData = this._getLocaleData(),
			iStartDay = this._getFirstWeekDay(),
			aDayNames = oLocaleData.getDaysStandAlone("abbreviated", this.getPrimaryCalendarType()),
			oWeekDay, i;

		this._bNamesLengthChecked = undefined;
		this._bLongWeekDays = undefined;

		for (i = 0; i < aWeekHeaders.length; i++) {
			oWeekDay = aWeekHeaders[i];
			oWeekDay.textContent = aDayNames[(i + iStartDay) % 7];
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
				if (oEvent.keyCode === KeyCodes.ARROW_DOWN) {
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
				if (oEvent.keyCode === KeyCodes.ARROW_UP) {
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
				if (iMonth % 12 !== oFocusedDate.getMonth()) {
					while (iMonth !== oFocusedDate.getMonth()) {
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
				if (iMonth !== oFocusedDate.getMonth()) {
					while (iMonth !== oFocusedDate.getMonth()) {
						oFocusedDate.setDate(oFocusedDate.getDate() - 1);
					}
				}
				break;

			default:
				break;
			}

			this.fireFocus({date: oFocusedDate.toLocalJSDate(), otherMonth: true});

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
	 * @returns {this} <code>this</code> for method chaining.
	 */
	Month.prototype.applyFocusInfo = function(oInfo){
		return this;
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
		} else if (bSelected && this.getIntervalSelection() && this.$().is(":visible")) {
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
		var oTarget = oEvent.target,
			sExtractedDate, oParsedDate;

		if (oTarget.classList.contains("sapUiCalWeekNum")) {
			sExtractedDate = oTarget.nextSibling.getAttribute("data-sap-day");
		} else {
			// The date will be either on the element itself when selected via KB,
			// or on the internal span (which contains the date number) if selected via mouse
			sExtractedDate = oTarget.getAttribute("data-sap-day") || oTarget.parentNode.getAttribute("data-sap-day");
		}

		oParsedDate = this._oFormatYyyymmdd.parse(sExtractedDate, true);

		// Return null for cases like user clicking on an empty space, today's border, etc...
		return oParsedDate ? CalendarDate.fromUTCDate(oParsedDate, this.getPrimaryCalendarType()) : null;
	};

	/**
	 * Decides if selecting/deselecting week's days should be done individually for each day or as one interval.
	 * In addition to this, depending on user's decision, this method either refocuses or keeps the focus.
	 * @param {sap.ui.unified.calendar.CalendarDate} oStartDate The first date of a given week
	 * @param {boolean} bFocusStartDate
	 * 			Whether or not the first date should be focused.
	 * 			<b>Note:</b> This should be set to <code>true</code> if week number is selected,
	 * 			since that isn't a focusable element.
	 * @returns {this} this For chaining
	 * @private
	 */
	Month.prototype._handleWeekSelection = function (oStartDate, bFocusStartDate) {
		var iSelectedWeekNumber = this._calculateWeekNumber(oStartDate),
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
	 * @returns {this} this For chaining
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
	 * Calculates week number.
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate Start date of the week
	 * @returns {int} Week number
	 * @private
	 */
	Month.prototype._calculateWeekNumber = function (oDate) {
		var oEndDate = this._getLastWeekDate(oDate);
		var oLocale = new Locale(this._getLocale());
		var oLocaleData = this._getLocaleData();
		var oDateFormat = DateFormat.getInstance({pattern: "w", calendarType: this.getPrimaryCalendarType()}, oLocale);
		var iWeekNumber;

		// Because the date we use to calculate the week number may be in one year and in the same time
		// includes days in a new month into a new year, we explicitly changed the week number
		// US calendar weeks overlap Jan 1st is always week 1 while Dec 31st is always last week number
		var bIsRegionUS = oLocaleData.firstDayStartsFirstWeek();

		if (oEndDate.getMonth() === 0 && this._oDate.getMonth() === 0  && bIsRegionUS) {
			iWeekNumber = oDateFormat.format(oEndDate.toUTCJSDate(), true);
		} else {
			iWeekNumber = oDateFormat.format(oDate.toUTCJSDate(), true);
		}

		return iWeekNumber;
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
	 * @returns {this} this For chaining
	 * @private
	 */
	Month.prototype._handleWeekSelectionByMultipleDays = function (iWeekNumber, oStartDate, oEndDate) {
		var oSelectedWeekDays,
			bExecuteDefault,
			bSelect;

		oSelectedWeekDays = this._areAllDaysBetweenSelected(oStartDate, oEndDate) ?
			new DateRange({
				startDate: oStartDate.toLocalJSDate()
			}) :
			new DateRange({
				startDate: oStartDate.toLocalJSDate(),
				endDate: oEndDate.toLocalJSDate()
			});

		bExecuteDefault = this.fireWeekNumberSelect({
			weekNumber: iWeekNumber,
			weekDays: oSelectedWeekDays
		});

		bSelect = oSelectedWeekDays.getEndDate() ? true : false;

		if (bExecuteDefault) {
			this._toggleDaysBetween(oStartDate, oEndDate, bSelect);
		}

		return this;
	};

	/**
	 * Selects week's days as a single interval, or deselects that interval if it already exists.
	 *
	 * @param {int} iWeekNumber Week's number
	 * @param {sap.ui.unified.calendar.CalendarDate} oStartDate Week's start date
	 * @param {sap.ui.unified.calendar.CalendarDate} oEndDate Week's end date
	 * @returns {this} this For chaining
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
			&& aSelectedInterval.getStartDate()
			&& aSelectedInterval.getStartDate().getTime() === oDateRangeInterval.getStartDate().getTime()
			&& aSelectedIntervalEndDate
			&& aSelectedInterval.getEndDate()
			&& aSelectedInterval.getEndDate().getTime() === oDateRangeInterval.getEndDate().getTime();
	};

	/**
	 * Returns the last week's date based on that week's start date.
	 * @param {sap.ui.unified.calendar.CalendarDate} oWeekStartDate Week's start date
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
	 * @returns {this} this For chaining
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
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate the date to select
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
						oDateRange.setProperty("startDate", oStartDate.toLocalJSDate()); // no-rerendering
						oDateRange.setProperty("endDate", oEndDate.toLocalJSDate()); // no-rerendering
					}
				} else if (oDate.isSameOrAfter(oStartDate)) {
					// single day ranges are allowed
					oEndDate = oDate;
					if (!bMove) {
						oDateRange.setProperty("endDate", oEndDate.toLocalJSDate()); // no-rerendering
					}
				}
			} else {
				oDateRange.setProperty("startDate", oDate.toLocalJSDate()); // no-rerendering
				oDateRange.setProperty("endDate", undefined); // no-rerendering
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
					if ($DomRef.attr("data-sap-day") === sYyyymmdd) {
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

	Month.prototype._getSpecialDates = function(){
		var oParent = this.getParent();

		if (oParent && oParent._getSpecialDates) {
			return oParent._getSpecialDates();
		} else {
			var specialDates = this.getSpecialDates();
			for (var i = 0; i < specialDates.length; i++) {
				var bNeedsSecondTypeAdding = specialDates[i].getSecondaryType() === library.CalendarDayType.NonWorking
					&& specialDates[i].getType() !== library.CalendarDayType.NonWorking;
				if (bNeedsSecondTypeAdding) {
					var newSpecialDate = new DateTypeRange();
					newSpecialDate.setType(library.CalendarDayType.NonWorking);
					newSpecialDate.setStartDate(specialDates[i].getStartDate());
					if (specialDates[i].getEndDate()) {
						newSpecialDate.setEndDate(specialDates[i].getEndDate());
					}
					specialDates.push(newSpecialDate);
				}
			}
			return specialDates;
		}
	};

	function _initItemNavigation(){

		var sYyyymmdd = this._oFormatYyyymmdd.format(this._getDate().toUTCJSDate(), true),
			iIndex = 0,
			oRootDomRef = this.getDomRef(),
			aDomRefs = oRootDomRef.querySelectorAll(".sapUiCalItem");

		for ( var i = 0; i < aDomRefs.length; i++) {
			if (aDomRefs[i].getAttribute("data-sap-day") === sYyyymmdd) {
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

		var iIndex = oControlEvent.getParameter("index"),
			oEvent = oControlEvent.getParameter("event"),
			oOldDate = this._getDate(),
			oFocusedDate = new CalendarDate(oOldDate, this.getPrimaryCalendarType()),
			bOtherMonth = false,
			bFireFocus = true,
			aDomRefs = this._oItemNavigation.getItemDomRefs(),
			// find out what day was focused
			oDomRef = aDomRefs[iIndex],
			sDayAttribute = oDomRef.getAttribute("data-sap-day"),
			oDomRefDay;

		if (!oEvent) {
			return; // happens if focus is set via ItemNavigation.focusItem directly
		}

		/* eslint-disable no-lonely-if */
		if (oDomRef.classList.contains("sapUiCalItemOtherMonth") || oDomRef.classList.contains("sapUiCalItemDsbl")) {
			if (oEvent.type === "saphomemodifiers" && (oEvent.metaKey || oEvent.ctrlKey)) {
				// on ctrl+home key focus first day of month
				for (var i = 0; i < aDomRefs.length; ++i) {
					oDomRefDay = aDomRefs[i];
					if (!(oDomRefDay.classList.contains("sapUiCalItemOtherMonth") || oDomRefDay.classList.contains("sapUiCalItemDsbl"))) {
						oFocusedDate = CalendarDate.fromUTCDate(this._oFormatYyyymmdd.parse(oDomRefDay.getAttribute("data-sap-day"), true), this.getPrimaryCalendarType());
						break;
					}
				}
				this._focusDate(oFocusedDate);
			} else if (oEvent.type === "sapendmodifiers" && (oEvent.metaKey || oEvent.ctrlKey)) {
				// on ctrl+end key focus last day of month
				for (var i = aDomRefs.length - 1; i > 0; --i) {
					oDomRefDay = aDomRefs[i];
					if (!(oDomRefDay.classList.contains("sapUiCalItemOtherMonth") || oDomRefDay.classList.contains("sapUiCalItemDsbl"))) {
						oFocusedDate = CalendarDate.fromUTCDate(this._oFormatYyyymmdd.parse(oDomRefDay.getAttribute("data-sap-day"), true), this.getPrimaryCalendarType());
						break;
					}
				}
				this._focusDate(oFocusedDate);
			} else {
				// focus old date again, but tell parent about the new date
				bOtherMonth = true;
				oFocusedDate = CalendarDate.fromUTCDate(this._oFormatYyyymmdd.parse(sDayAttribute, true), this.getPrimaryCalendarType());
				if (!oFocusedDate) {
					oFocusedDate = new CalendarDate(oOldDate); // e.g. year > 9999
				}
				this._focusDate(oOldDate);

				if (oEvent.type === "mousedown" ||
						(this._sTouchstartYyyyMMdd && oEvent.type === "focusin" && this._sTouchstartYyyyMMdd === sDayAttribute)
					|| oDomRef.classList.contains("sapUiCalItemDsbl")) {
					// don't focus date in other month via mouse -> don't switch month in calendar while selecting day
					bFireFocus = false;
					this.fireFocus({date: oOldDate.toLocalJSDate(), otherMonth: false, restoreOldDate: true});
				}

				// on touch devices a focusin is fired asyncrounously after the touch/mouse handling on DOM element if the focus was changed in the meantime
				// focus old date again and do not fire focus event
				this._sTouchstartYyyyMMdd = oEvent.originalEvent && (oEvent.originalEvent.type === "touchstart")
					? sDayAttribute
					: undefined;
			}
		} else {
			// day in current month focused
			if (oEvent.target.classList.contains("sapUiCalWeekNum")) {
				// click on week number - focus old date
				this._focusDate(oFocusedDate);
			} else  {
				// not if clicked on week number
				oFocusedDate = CalendarDate.fromUTCDate(this._oFormatYyyymmdd.parse(sDayAttribute, true), this.getPrimaryCalendarType());
				this._oDate = oFocusedDate;
			}
			this._sTouchstartYyyyMMdd = undefined;
		}

		if (oEvent.type === "mousedown" && this.getIntervalSelection()) {
			// as in the focus event the month can be changed, store the last target here
			this._sLastTargetId = oDomRef.id;
		}

		if (bFireFocus) {
			this.fireFocus({date: oFocusedDate.toLocalJSDate(), otherMonth: bOtherMonth});
		}

		if (oEvent.type === "mousedown") {
			// as no click event is fired in some cases, e.g. if month is changed (because of changing DOM) select the day on mousedown
			this._handleMousedown(oEvent, oFocusedDate, iIndex);
		}
	}

	function _handleFocusAgain(oControlEvent){

		var iIndex = oControlEvent.getParameter("index");
		var oEvent = oControlEvent.getParameter("event");

		if (!oEvent) {
			return; // happens if focus is set via ItemNavigation.focusItem directly
		}

		if (oEvent.type === "mousedown") {
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
	 * @private
	 */
	function _changeDate (oDate){

		CalendarUtils._checkCalendarDate(oDate);

		var iYear = oDate.getYear();
		CalendarUtils._checkYearInValidRange(iYear);

		if (!this.getDate() || !oDate.isSame(CalendarDate.fromLocalJSDate(this.getDate(), oDate.getCalendarType()))) {
			var oCalDate = new CalendarDate(oDate);
			this.setProperty("date", oDate.toLocalJSDate());
			this._oDate = oCalDate;
		} else {
			this.invalidate();
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

		var sYyyymmdd = this._oFormatYyyymmdd.format(oDate.toUTCJSDate(), true),
			aDomRefs = this._oItemNavigation.getItemDomRefs(),
			oDomRefDay;

		for (var i = 0; i < aDomRefs.length; i++) {
			oDomRefDay = aDomRefs[i];
			if (oDomRefDay.getAttribute("data-sap-day") === sYyyymmdd) {
				if (document.activeElement !== aDomRefs[i]) {
					if (bSkipFocus || Device.system.phone) {
						this._oItemNavigation.setFocusedIndex(i);
					} else {
						this._oItemNavigation.focusItem(i);
					}
				}
				break;
			}
		}

	};

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
			var oWeekDay,
				aWeekHeaders = this.getDomRef().querySelectorAll(".sapUiCalWH:not(.sapUiCalDummy)"),
				bTooLong = this._isMonthNameLong(aWeekHeaders),
				oLocaleData, iStartDay, aDayNames, i;

			if (bTooLong) {
				this._bLongWeekDays = false;
				oLocaleData = this._getLocaleData();
				iStartDay = this._getFirstWeekDay();
				aDayNames = oLocaleData.getDaysStandAlone("narrow", this.getPrimaryCalendarType());
				for ( i = 0; i < aWeekHeaders.length; i++) {
					oWeekDay = aWeekHeaders[i];
					oWeekDay.textContent = aDayNames[(i + iStartDay) % 7];
				}
			} else {
				this._bLongWeekDays = true;
			}

			this._bNamesLengthChecked = true;
		}

	}

	return Month;

});