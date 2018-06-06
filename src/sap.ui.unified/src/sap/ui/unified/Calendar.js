/*!
 * ${copyright}
 */
//Provides control sap.ui.unified.Calendar.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/ui/core/LocaleData',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/DateRange',
	'./calendar/Header',
	'./calendar/Month',
	'./calendar/MonthPicker',
	'./calendar/YearPicker',
	'./calendar/CalendarDate',
	'./library',
	'sap/ui/Device',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/Locale',
	"./CalendarRenderer"
], function(
	jQuery,
	Control,
	LocaleData,
	CalendarUtils,
	DateRange,
	Header,
	Month,
	MonthPicker,
	YearPicker,
	CalendarDate,
	library,
	Device,
	DateFormat,
	ResizeHandler,
	Locale,
	CalendarRenderer
) {
	"use strict";

	/*
	 * Inside the Calendar CalendarDate objects are used. But in the API JS dates are used.
	 * So conversion must be done on API functions.
	 */

	/**
	 * Constructor for a new Calendar.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {Object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Basic Calendar.
	 * This calendar is used for DatePickers
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.22.0
	 * @alias sap.ui.unified.Calendar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Calendar = Control.extend("sap.ui.unified.Calendar", /** @lends sap.ui.unified.Calendar.prototype */ { metadata : {

		library : "sap.ui.unified",
		designtime: "sap/ui/unified/designtime/Calendar.designtime",
		properties : {

			/**
			 * If set, interval selection is allowed
			 */
			intervalSelection : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * If set, only a single date or interval, if intervalSelection is enabled, can be selected
			 */
			singleSelection : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Determines the number of months displayed.
			 *
			 * As of version 1.50, the duplicated dates are not displayed if there are
			 * multiple months.
			 *
			 * <b>Note:</b> On phones, only one month is displayed.
			 * @since 1.28.0
			 */
			months : {type : "int", group : "Appearance", defaultValue : 1},

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
			 *
			 * <b>Note:</b> Keep in mind that this property sets only weekly-recurring days
			 * as non-working. If you need specific dates or dates ranges, such as national
			 * holidays, use the <code>specialDates</code> aggregation to set them.
			 * Both the non-working days (from property) and dates (from aggregation) are
			 * visualized the same.
			 *
			 * @since 1.28.9
			 */
			nonWorkingDays : {type : "int[]", group : "Appearance", defaultValue : null},

			/**
			 * If set, the calendar type is used for display.
			 * If not set, the calendar type of the global configuration is used.
			 * @since 1.34.0
			 */
			primaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance", defaultValue : null},

			/**
			 * If set, the days are also displayed in this calendar type
			 * If not set, the dates are only displayed in the primary calendar type
			 * @since 1.34.0
			 */
			secondaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance", defaultValue : null},

			/**
			 * Width of Calendar
			 *
			 * <b>Note:</b> There is a theme depending minimum width, so the calendar can not be set smaller.
			 * @since 1.38.0
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Minimum date that can be shown and selected in the Calendar. This must be a JavaScript date object.
			 *
			 * <b>Note:</b> if the date is inside of a month the complete month is displayed,
			 * but dates outside the valid range can not be selected.
			 *
			 * <b>Note:</b> If the <code>minDate</code> is set to be after the <code>maxDate</code>,
			 * the <code>maxDate</code> is set to the end of the month of the <code>minDate</code>.
			 * @since 1.38.0
			 */
			minDate : {type : "object", group : "Misc", defaultValue : null},

			/**
			 * Maximum date that can be shown and selected in the Calendar. This must be a JavaScript date object.
			 *
			 * <b>Note:</b> if the date is inside of a month the complete month is displayed,
			 * but dates outside the valid range can not be selected.
			 *
			 * <b>Note:</b> If the <code>maxDate</code> is set to be before the <code>minDate</code>,
			 * the <code>minDate</code> is set to the begin of the month of the <code>maxDate</code>.
			 * @since 1.38.0
			 */
			maxDate : {type : "object", group : "Misc", defaultValue : null},

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
			 * Dates or date ranges for selected dates.
			 *
			 * To set a single date (instead of a range), set only the <code>startDate</code> property
			 * of the {@link sap.ui.unified.DateRange} class.
			 */
			selectedDates : {type : "sap.ui.unified.DateRange", multiple : true, singularName : "selectedDate"},

			/**
			 * Dates or date ranges with type, to visualize special days in the <code>Calendar</code>.
			 * If one day is assigned to more than one Type, only the first one will be used.
			 *
			 * To set a single date (instead of a range), set only the <code>startDate</code> property
			 * of the {@link sap.ui.unified.DateRange} class.
			 *
			 * <b>Note:</b> Keep in mind that the <code>NonWorking</code> type is for marking specific
			 * dates or date ranges as non-working, where if you need a weekly-reccuring non-working days
			 * (weekend), you should use the <code>nonWorkingDays</code> property. Both the non-working
			 * days (from property) and dates (from aggregation) are visualized the same.
			 *
			 * @since 1.24.0
			 */
			specialDates : {type : "sap.ui.unified.DateTypeRange", multiple : true, singularName : "specialDate"},

			/**
			 * Dates or date ranges for disabled dates.
			 *
			 * To set a single date (instead of a range), set only the <code>startDate</code> property
			 * of the {@link sap.ui.unified.DateRange} class.
			 *
			 * @since 1.38.0
			 */
			disabledDates : {type : "sap.ui.unified.DateRange", multiple : true, singularName : "disabledDate"},

			/**
			 * Hidden, for internal use only.
			 */
			header : {type : "sap.ui.unified.calendar.Header", multiple : false, visibility : "hidden"},
			secondMonthHeader : {type : "sap.ui.unified.calendar.Header", multiple : false, visibility : "hidden"},
			month : {type : "sap.ui.unified.calendar.Month", multiple : true, visibility : "hidden"},
			monthPicker : {type : "sap.ui.unified.calendar.MonthPicker", multiple : false, visibility : "hidden"},
			yearPicker : {type : "sap.ui.unified.calendar.YearPicker", multiple : false, visibility : "hidden"}

		},
		associations: {

			/**
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
			 * @since 1.28.0
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
			 * Date selection was cancelled
			 */
			cancel : {},

			/**
			 * <code>startDate</code> was changed while navigation in <code>Calendar</code>
			 *
			 * Use <code>getStartDate</code> function to determine the current start date
			 * @since 1.34.0
			 */
			startDateChange : {},

			/**
			 * Week selection. Works for Gregorian calendars only and when <code>intervalSelection</code> is set to 'true'.
			 * @since 1.56
			 */
			weekNumberSelect : {
				parameters : {
					/**
					 * The selected week number.
					 */
					weekNumber : {type: "int"},
					/**
					 * The days of the corresponding week.
					 */
					weekDays: {type: "sap.ui.unified.DateRange"}
				}
			}
		}
	}});

	/*
	 * There are different modes (stored in this._iMode)
	 * The standard is 0, that means a calendar showing a calendar with the days of one month.
	 * If 1 a month picker is shown.
	 * if 2 a year picker is shown.
	 */

	Calendar.prototype.init = function(){

		this._iBreakPointTablet = Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0];
		this._iBreakPointDesktop = Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1];
		this._iBreakPointLargeDesktop = Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[2];

		// set default calendar type from configuration
		var sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
		this.setProperty("primaryCalendarType", sCalendarType);
		this.setProperty("secondaryCalendarType", sCalendarType);

		this._iMode = 0; // days are shown
		this._iColumns = 1; // default columns for the calendar

		// to format year with era in Japanese
		this._oYearFormat = DateFormat.getDateInstance({format: "y", calendarType: sCalendarType});

		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

		this._oMinDate = CalendarUtils._minDate(this.getPrimaryCalendarType());
		this._oMaxDate = CalendarUtils._maxDate(this.getPrimaryCalendarType());

		this._initializeHeader();
		this._initializeSecondMonthHeader();

		var oMonth = this._createMonth(this.getId() + "--Month0");
		oMonth.attachEvent("focus", this._handleFocus, this);
		oMonth.attachEvent("select", _handleSelect, this);
		oMonth.attachEvent("_renderMonth", _handleRenderMonth, this);
		oMonth.attachEvent("_bindMousemove", _handleBindMousemove, this);
		oMonth.attachEvent("_unbindMousemove", _handleUnbindMousemove, this);
		oMonth._bNoThemeChange = true;
		this.addAggregation("month",oMonth);

		this._initilizeMonthPicker();
		this._initilizeYearPicker();

		this._resizeProxy = jQuery.proxy(_handleResize, this);
		this._oSelectedMonth; //needed to transfer the selected month from _handleSelect to getFocusDomRef
	};

	Calendar.prototype.exit = function(){

		if (this._sInvalidateMonth) {
			jQuery.sap.clearDelayedCall(this._sInvalidateMonth);
		}

		if (this._sResizeListener) {
			ResizeHandler.deregister(this._sResizeListener);
			this._sResizeListener = undefined;
		}

		this._oSelectedMonth = null;
	};

	Calendar.prototype._initializeHeader = function() {
		var oHeader = new Header(this.getId() + "--Head");

		oHeader.attachEvent("pressPrevious", this._handlePrevious, this);
		oHeader.attachEvent("pressNext", this._handleNext, this);
		oHeader.attachEvent("pressButton1", this._handleButton1, this);
		oHeader.attachEvent("pressButton2", this._handleButton2, this);
		oHeader.attachEvent("pressButton3", this._handleButton1, this);
		oHeader.attachEvent("pressButton4", this._handleButton2, this);
		this.setAggregation("header",oHeader);
	};

	Calendar.prototype._initializeSecondMonthHeader = function() {
		// TODO: move the for initializing the second month header in the setMonths
		// and init it only if it is needed (2 months in calendar) not its ancestors.
		var oSecondMonthHeader = new Header(this.getId() + "--SecondMonthHead");

		oSecondMonthHeader.addStyleClass("sapUiCalHeadSecondMonth");
		oSecondMonthHeader.attachEvent("pressPrevious", this._handlePrevious, this);
		oSecondMonthHeader.attachEvent("pressNext", this._handleNext, this);
		oSecondMonthHeader.attachEvent("pressButton1", this._handleButton1, this);
		oSecondMonthHeader.attachEvent("pressButton2", this._handleButton2, this);
		this.setAggregation("secondMonthHeader", oSecondMonthHeader);
	};

	Calendar.prototype._initilizeMonthPicker = function() {
		var oMonthPicker = new MonthPicker(this.getId() + "--MP");
		oMonthPicker.attachEvent("select", this._selectMonth, this);
		oMonthPicker._bNoThemeChange = true;
		this.setAggregation("monthPicker",oMonthPicker);
	};

	Calendar.prototype._initilizeYearPicker = function() {
		var oYearPicker = new YearPicker(this.getId() + "--YP");
		oYearPicker.attachEvent("select", this._selectYear, this);
		this.setAggregation("yearPicker",oYearPicker);
	};

	Calendar.prototype._createMonth = function(sId){
		var oMonth = new Month(sId, {width: "100%"});

		oMonth.attachEvent("datehovered", this._handleDateHovered, this);

		return oMonth;
	};

	Calendar.prototype._handleDateHovered = function(oEvent) {
		var aMonths = this.getAggregation("month"),
			oDate1 = oEvent.getParameter("date1"),
			oDate2 = oEvent.getParameter("date2"),
			i;

		for (i = 0; i < aMonths.length; i++) {
			aMonths[i]._markDatesBetweenStartAndHoveredDate(oDate1, oDate2);
		}
	};

	Calendar.prototype.onBeforeRendering = function(){

		var aMonths = this.getAggregation("month");
		var oCalDate;
		var oMonthDate = aMonths[0].getDate();
		var oFocusedDate = this._getFocusedDate();

		if (aMonths.length > 1 && oMonthDate) {
			// for more than one month - re-render same months (if already rendered once)
			oCalDate = CalendarDate.fromLocalJSDate(oMonthDate, this.getPrimaryCalendarType());
		}else if (aMonths.length > 1) {
			oCalDate = _determineFirstMonthDate.call(this, this._getFocusedDate());
		}else {
			oCalDate = oFocusedDate;
		}

		for (var i = 0; i < aMonths.length; i++) {
			oMonthDate = new CalendarDate(oCalDate);
			if (i > 0) {
				oMonthDate.setDate(1);
				oMonthDate.setMonth(oMonthDate.getMonth() + i);
			}
			var oDisplayDate = oMonthDate;
			if (oFocusedDate.getYear() === oMonthDate.getYear() && oFocusedDate.getMonth() === oMonthDate.getMonth()) {
				oDisplayDate = oFocusedDate;
			}
			aMonths[i].displayDate(oDisplayDate.toLocalJSDate());
			aMonths[i].setShowWeekNumbers(this.getShowWeekNumbers());
		}

		this._updateHeader(oCalDate);

		this._iSize = 0; // initialize to recalculate new after rendering

	};

	Calendar.prototype.onAfterRendering = function(oEvent){

		// check if day names and month names are too big -> use smaller ones
		if (!this._getSucessorsPickerPopup()) {
			_checkNamesLength.call(this);
		}

		if (_getMonths.call(this) > 1 || this._bInitMonth) {
			// check if size is right and adopt it if necessary
			oEvent.size = {width: this.getDomRef().offsetWidth};
			_handleResize.call(this, oEvent, true);
			if (!this._sResizeListener) {
				this._sResizeListener = ResizeHandler.register(this, this._resizeProxy);
			}
			this._bInitMonth = undefined;
		}
	};

	// overwrite invalidate to recognize changes on selectedDates
	Calendar.prototype.invalidate = function(oOrigin) {

		if (!this._bDateRangeChanged && (!oOrigin || !(oOrigin instanceof DateRange))) {
			Control.prototype.invalidate.apply(this, arguments);
		} else if (this.getDomRef() && this._iMode == 0 && !this._sInvalidateMonth) {
			// DateRange changed -> only rerender days
			// do this only once if more DateRanges / Special days are changed
			this._sInvalidateMonth = jQuery.sap.delayedCall(0, this, this._invalidateMonth, [oOrigin]);
		}

	};

	Calendar.prototype.removeSelectedDate = function(oSelectedDate) {
		this._bDateRangeChanged = true;
		return this.removeAggregation("selectedDates", oSelectedDate);
	};

	// overwrite removing of date ranged because invalidate don't get information about it
	Calendar.prototype.removeAllSelectedDates = function() {
		this._bDateRangeChanged = true;
		var aRemoved = this.removeAllAggregation("selectedDates");
		return aRemoved;

	};

	Calendar.prototype.destroySelectedDates = function() {

		this._bDateRangeChanged = true;
		var oDestroyed = this.destroyAggregation("selectedDates");
		return oDestroyed;

	};

	Calendar.prototype.removeAllSpecialDates = function() {

		this._bDateRangeChanged = true;
		var aRemoved = this.removeAllAggregation("specialDates");
		return aRemoved;

	};

	Calendar.prototype.destroySpecialDates = function() {

		this._bDateRangeChanged = true;
		var oDestroyed = this.destroyAggregation("specialDates");
		return oDestroyed;

	};

	/*
	 * if used inside DatePicker get the value from the parent
	 * To don't have sync issues...
	 */
	Calendar.prototype.getSpecialDates = function(){

		var oParent = this.getParent();

		if (oParent && oParent.getSpecialDates) {
			return oParent.getSpecialDates();
		} else {
			return this.getAggregation("specialDates", []);
		}

	};

	Calendar.prototype.removeAllDisabledDates = function() {

		this._bDateRangeChanged = true;
		var aRemoved = this.removeAllAggregation("disabledDates");
		return aRemoved;

	};

	Calendar.prototype.destroyDisabledDates = function() {

		this._bDateRangeChanged = true;
		var oDestroyed = this.destroyAggregation("disabledDates");
		return oDestroyed;

	};

	/**
	 * sets the locale for the DatePicker
	 * only for internal use
	 * @param {string} sLocale  new value for <code>locale</code>
	 * @returns {sap.ui.unified.Calendar} <code>this</code> to allow method chaining
	 * @private
	 */
	Calendar.prototype.setLocale = function(sLocale){

		if (this._sLocale != sLocale) {
			this._sLocale = sLocale;
			this._oLocaleData = undefined;
			this.invalidate();
		}

		return this;

	};

	/**
	 * gets the used locale for the DatePicker
	 * only for internal use
	 * @return {string} sLocale
	 * @private
	 */
	Calendar.prototype.getLocale = function(){

		if (!this._sLocale) {
			this._sLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();
		}

		return this._sLocale;

	};
	/**
	 * gets the focused date
	 * @return {sap.ui.unified.calendar.CalendarDate} the focused date.
	 * @private
	 */
	Calendar.prototype._getFocusedDate = function(){

		if (!this._oFocusedDate) {
			_determineFocusedDate.call(this);
		}

		return this._oFocusedDate;

	};

	/**
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate A date to be focused
	 * @private
	 */
	Calendar.prototype._setFocusedDate = function(oDate){
		CalendarUtils._checkCalendarDate(oDate);
		this._oFocusedDate = new CalendarDate(oDate, this.getPrimaryCalendarType());
	};

	/**
	 * Sets the focused date of the calendar.
	 *
	 * @param {Object} oDate
	 *         JavaScript date object for focused date.
	 * @returns {sap.ui.unified.Calendar} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Calendar.prototype.focusDate = function(oDate) {

		_displayDate.call(this, oDate, false);

		return this;

	};

	/**
	 * Displays a date in the calendar but don't set the focus.
	 *
	 * @param {Object} oDate
	 *         JavaScript date object for focused date.
	 * @returns {sap.ui.unified.Calendar} <code>this</code> to allow method chaining
	 * @since 1.28.0
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Calendar.prototype.displayDate = function (oDate) {

		_displayDate.call(this, oDate, true);

		return this;

	};

	/**
	 * Returns the first day of the displayed month.
	 *
	 * There might be some days of the previous month shown, but they can not be focused.
	 *
	 * @returns {Object} JavaScript date object for start date.
	 * @since 1.34.1
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Calendar.prototype.getStartDate = function(){

		var oStartDate;

		if (this.getDomRef()) {
			// if rendered just use the date of the first month
			var aMonths = this.getAggregation("month");
			oStartDate = CalendarDate.fromLocalJSDate(aMonths[0].getDate(), this.getPrimaryCalendarType());
		} else {
			// if not rendered use the focused date
			oStartDate = new CalendarDate(this._getFocusedDate());
		}

		oStartDate.setDate(1);

		return oStartDate.toLocalJSDate();

	};

	/**
	 * sets the Popup mode
	 * e.G. Tab-chain should not leave calendar
	 * only for internal use
	 * @param {boolean} bPoupupMode <code>PopupMode</code>
	 * @returns {sap.ui.unified.Calendar} <code>this</code> to allow method chaining
	 * @private
	 */
	Calendar.prototype.setPopupMode = function(bPoupupMode){

		this._bPoupupMode = bPoupupMode;

		return this;

	};

	Calendar.prototype.setMonths = function(iMonths){

		this._bDateRangeChanged = undefined; // to force rerendering
		this.setProperty("months", iMonths, false); // rerender
		iMonths = _getMonths.call(this); // to use validation

		var aMonths = this.getAggregation("month");
		var i = 0;
		var oMonth;

		if (aMonths.length < iMonths) {
			for (i = aMonths.length; i < iMonths; i++) {
				oMonth = this._createMonth(this.getId() + "--Month" + i);
				oMonth.attachEvent("focus", this._handleFocus, this);
				oMonth.attachEvent("select", _handleSelect, this);
				oMonth.attachEvent("_renderMonth", _handleRenderMonth, this);
				oMonth.attachEvent("_bindMousemove", _handleBindMousemove, this);
				oMonth.attachEvent("_unbindMousemove", _handleUnbindMousemove, this);
				oMonth._bNoThemeChange = true;
				this.addAggregation("month",oMonth);
			}
		}else if (aMonths.length > iMonths){
			for (i = aMonths.length; i > iMonths; i--) {
				oMonth = this.removeAggregation("month", i - 1);
				oMonth.destroy();
			}
			if (iMonths == 1) {
				// back to standard case -> initialize month width
				this._bInitMonth = true;
			}
		}

		if (iMonths > 1 && aMonths[0].getDate()) {
			// remove date from first month to recalculate months date before rendering
			aMonths[0].setProperty("date", null, true);
		}

		return this;

	};

	Calendar.prototype.setPrimaryCalendarType = function(sCalendarType){

		var aMonths = this.getAggregation("month");
		var bRerender = false;
		if (aMonths.length > 1) {
			bRerender = true; // as start dates of month can change
		}

		this.setProperty("primaryCalendarType", sCalendarType, !bRerender);

		this._oYearFormat = DateFormat.getDateInstance({format: "y", calendarType: sCalendarType});

		if (this._oFocusedDate) {
			this._oFocusedDate = new CalendarDate(this._oFocusedDate, sCalendarType);
		}
		this._oMinDate =  new CalendarDate(this._oMinDate, sCalendarType);
		this._oMaxDate =  new CalendarDate(this._oMaxDate, sCalendarType);

		// set Months property directly to force rerender
		for (var i = 0; i < aMonths.length; i++) {
			var oMonth = aMonths[i];
			oMonth.setPrimaryCalendarType(sCalendarType);
		}

		if (!this._getSucessorsPickerPopup()) {
			var oMonthPicker = this.getAggregation("monthPicker");
			oMonthPicker.setPrimaryCalendarType(sCalendarType);

			var oYearPicker = this.getAggregation("yearPicker");
			oYearPicker.setPrimaryCalendarType(sCalendarType);
		}

		if (this.getDomRef()) {
			this._updateHeader(this._oFocusedDate);

			if (!this._getSucessorsPickerPopup()) {
				if (this.iMode != 1 && oMonthPicker.getDomRef()) {
					// remove DOM as rerendering only needed if displayed
					oMonthPicker.$().remove();
				}
				if (this.iMode != 2 && oYearPicker.getDomRef()) {
					// remove DOM as rerendering only needed if displayed
					oYearPicker.$().remove();
				}
			}
		}

		return this;

	};

	Calendar.prototype.setSecondaryCalendarType = function(sCalendarType){

		this._bSecondaryCalendarTypeSet = true; // as property can not be empty but we use it only if set
		this.setProperty("secondaryCalendarType", sCalendarType, true);

		this._oYearFormatSecondary = DateFormat.getDateInstance({format: "y", calendarType: sCalendarType});

		// set Months property directly to force rerender
		var aMonths = this.getAggregation("month");
		for (var i = 0; i < aMonths.length; i++) {
			var oMonth = aMonths[i];
			oMonth.setSecondaryCalendarType(sCalendarType);
		}

		if (this.getDomRef()) {
			this._updateHeader(this._getFocusedDate());
			this.$().toggleClass("sapUiCalSecType", !!this._getSecondaryCalendarType());
		}

		return this;

	};

	Calendar.prototype._getSecondaryCalendarType = function(){

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

	/**
	 * Sets a minimum date for the calendar.
	 * @param {Date} oDate a JavaScript date
	 * @return {sap.ui.unified.Calendar} <code>this</code> for method chaining
	 * @public
	 */
	Calendar.prototype.setMinDate = function(oDate){

		if (jQuery.sap.equal(oDate, this.getMinDate())) {
			return this;
		}

		if (!oDate) {
			// restore default
			this._oMinDate = CalendarUtils._minDate(this.getPrimaryCalendarType());

		} else {
			CalendarUtils._checkJSDateObject(oDate);

			this._oMinDate = CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType());

			var iYear = this._oMinDate.getYear();
			CalendarUtils._checkYearInValidRange(iYear);

			if (this._oMaxDate.isBefore(this._oMinDate)) {
				jQuery.sap.log.warning("minDate > maxDate -> maxDate set to end of the month", this);
				this._oMaxDate = CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType());
				this._oMaxDate.setDate(CalendarUtils._daysInMonth(this._oMaxDate));
				this.setProperty("maxDate", this._oMaxDate.toLocalJSDate(), true);
			}

			this._setMinMaxDateExtend(CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType()));
		}

		this.setProperty("minDate", oDate, false); // re-render months because visualization can change

		if (!this._getSucessorsPickerPopup()) {
			var oYearPicker = this.getAggregation("yearPicker");
			oYearPicker._oMinDate.setYear(this._oMinDate.getYear());
		}

		return this;

	};

	/**
	 * Sets a maximum date for the calendar.
	 * @param {Date} oDate a JavaScript date
	 * @return {sap.ui.unified.Calendar} <code>this</code> for method chaining
	 * @public
	 */
	Calendar.prototype.setMaxDate = function(oDate){

		if (jQuery.sap.equal(oDate, this.getMaxDate())) {
			return this;
		}

		if (!oDate) {
			// restore default
			this._oMaxDate = CalendarUtils._maxDate(this.getPrimaryCalendarType());
		} else {
			CalendarUtils._checkJSDateObject(oDate);

			this._oMaxDate = CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType());

			var iYear = this._oMaxDate.getYear();
			CalendarUtils._checkYearInValidRange(iYear);

			if (this._oMinDate.isAfter(this._oMaxDate)) {
				jQuery.sap.log.warning("maxDate < minDate -> minDate set to begin of the month", this);
				this._oMinDate = CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType());
				this._oMinDate.setDate(1);
				this.setProperty("minDate", this._oMinDate.toLocalJSDate(), true);
			}

			this._setMinMaxDateExtend(CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType()));
		}

		this.setProperty("maxDate", oDate, false); // re-render months because visualization can change
		if (!this._getSucessorsPickerPopup()) {
			var oYearPicker = this.getAggregation("yearPicker");
			oYearPicker._oMaxDate.setYear(this._oMaxDate.getYear());
		}

		return this;

	};

	/**
	 * Provides default behavior for setting min & max date.
	 * It is also a hook for the sap.ui.unified.CalendarDateInterval.
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate A date
	 * @private
	 */
	Calendar.prototype._setMinMaxDateExtend = function(oDate){

		if (this._oFocusedDate) {
			// check if still in valid range
			if (CalendarUtils._isOutside(this._oFocusedDate, this._oMinDate, this._oMaxDate)) {
				jQuery.sap.log.warning("focused date is not between [minDate - maxDate] -> refocus to the new max/min date: " + oDate.toString(), this);
				this.focusDate(oDate.toLocalJSDate());
			}
		}

	};

	/*
	 * gets localeData for used locale
	 * if no locale is given use rendered one
	 */
	Calendar.prototype._getLocaleData = function(){

		if (!this._oLocaleData) {
			var sLocale = this.getLocale();
			var oLocale = new Locale(sLocale);
			this._oLocaleData = LocaleData.getInstance(oLocale);
		}

		return this._oLocaleData;

	};

	/*
	 * gets the information if month headers should be shown
	 * used by Month controls instead of updating the controls on every change
	 */
	Calendar.prototype._getShowMonthHeader = function(){

		var iMonths = _getMonths.call(this);
		if (iMonths > 2) {
			return true;
		}else {
			return false;
		}

	};

	Calendar.prototype.setWidth = function(sWidth){

		this.setProperty("width", sWidth, true);
		if (this.getDomRef()) {
			sWidth = this.getWidth(); // to get in right type
			this.$().css("width", sWidth);

			if (sWidth) {
				this.$().addClass("sapUiCalWidth");
			} else {
				this.$().removeClass("sapUiCalWidth");
			}
		}

		return this;

	};

	Calendar.prototype.onclick = function(oEvent){
		var oEventTarget = oEvent.target,
			bTargetClassList = oEventTarget.classList.contains("sapUiCalWeekNum");

		if (this.getIntervalSelection() && this.getPrimaryCalendarType() === sap.ui.core.CalendarType.Gregorian && bTargetClassList) {
			this._handleWeekSelection(oEventTarget);
		}

		if (oEvent.isMarked("delayedMouseEvent") ) {
			return;
		}

		if (oEventTarget.id == this.getId() + "-cancel") {
			this.onsapescape(oEvent);
		}

	};

	Calendar.prototype.onmousedown = function(oEvent){

		oEvent.preventDefault(); // to prevent focus set outside of DatePicker
		oEvent.setMark("cancelAutoClose");

	};

	Calendar.prototype.onsapescape = function(oEvent){

		if (this._iMode == 0) {
			this.fireCancel();
		}

		this._closedPickers();

	};

	Calendar.prototype.onsapshow = function(oEvent){

		if (this._bPoupupMode) {
			this._closedPickers();
			this.fireCancel();

			oEvent.preventDefault(); // otherwise IE opens the address bar history

		}

	};

	Calendar.prototype.onsaphide = Calendar.prototype.onsapshow;

	Calendar.prototype.onsaptabnext = function(oEvent){

		// if tab was pressed on a day it should jump to the month and then to the year button
		var oHeader = this.getAggregation("header");

		if (jQuery.sap.containsOrEquals(this.getDomRef("content"), oEvent.target)) {
			if (this._shouldFocusB2OnTabNext(oEvent)) {
				jQuery.sap.focus(oHeader.getDomRef("B2"));
			} else {
				jQuery.sap.focus(oHeader.getDomRef("B1"));
			}

			if (!this._bPoupupMode) {
				// remove Tabindex from day, month, year - to break cycle
				var aMonths = this.getAggregation("month");

				for (var i = 0; i < aMonths.length; i++) {
					var oMonth = aMonths[i];
					jQuery(oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
				}

				if (!this._getSucessorsPickerPopup()) {
					var oMonthPicker = this.getAggregation("monthPicker");
					var oYearPicker = this.getAggregation("yearPicker");

					if (oMonthPicker.getDomRef()) {
						jQuery(oMonthPicker._oItemNavigation.getItemDomRefs()[oMonthPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
					}
					if (oYearPicker.getDomRef()) {
						jQuery(oYearPicker._oItemNavigation.getItemDomRefs()[oYearPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
					}
				}
			}

			oEvent.preventDefault();
		} else if (this._shouldFocusB2OnTabNext(oEvent)) {
			jQuery.sap.focus(oHeader.getDomRef("B2"));

			oEvent.preventDefault();
			//} else if (oEvent.target.id == oHeader.getId() + "-B2") {
			// go to next element on page, in Popup mode to day, month or year
		}

	};

	Calendar.prototype._shouldFocusB2OnTabNext = function(oEvent){
		var oHeader = this.getAggregation("header");

		return (oEvent.target.id == oHeader.getId() + "-B1");
	};

	Calendar.prototype._shouldFocusB2OnTabPrevious = function(oEvent) {
		return this._bPoupupMode;
	};

	Calendar.prototype.onsaptabprevious = function(oEvent){

		var oHeader = this.getAggregation("header");

		if (jQuery.sap.containsOrEquals(this.getDomRef("content"), oEvent.target)) {
			// tab from day, month or year -> go to header

			if (this._shouldFocusB2OnTabPrevious()) {
				jQuery.sap.focus(oHeader.getDomRef("B2"));
				oEvent.preventDefault();
			}
		} else if (oEvent.target.id == oHeader.getId() + "-B1") {
			// focus day, month or year
			var aMonths = this.getAggregation("month");

			var oFocusedDate;
			switch (this._iMode) {
			case 0: // day picker
				oFocusedDate = this._getFocusedDate();
				for (var i = 0; i < aMonths.length; i++) {
					var oMonth = aMonths[i];
					var oMonthDate = CalendarDate.fromLocalJSDate(oMonth.getDate(), this.getPrimaryCalendarType());
					if (oFocusedDate.isSame(oMonthDate)) {
						oMonth._oItemNavigation.focusItem(oMonth._oItemNavigation.getFocusedIndex());
					} else {
						jQuery(oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
					}
				}
				break;

			case 1: // month picker
				if (!this._getSucessorsPickerPopup()) {
					var oMonthPicker = this.getAggregation("monthPicker");
					oMonthPicker._oItemNavigation.focusItem(oMonthPicker._oItemNavigation.getFocusedIndex());
				}
				break;

			case 2: // year picker
				if (!this._getSucessorsPickerPopup()) {
					var oYearPicker = this.getAggregation("yearPicker");
					oYearPicker._oItemNavigation.focusItem(oYearPicker._oItemNavigation.getFocusedIndex());
				}
				break;
				// no default
			}

			oEvent.preventDefault();
		} else if (oEvent.target.id == oHeader.getId() + "-B2") {
			jQuery.sap.focus(oHeader.getDomRef("B1"));

			oEvent.preventDefault();
		}
	};

	Calendar.prototype.onfocusin = function(oEvent){

		if (oEvent.target.id == this.getId() + "-end") {
			// focus via tab+shift (otherwise not possible to go to this element)
			var aMonths = this.getAggregation("month");

			this._focusOnShiftTab();

			if (!this._bPoupupMode) {
				// remove Tabindex from day, month, year - to break cycle
				for (var i = 0; i < aMonths.length; i++) {
					var oMonth = aMonths[i];
					jQuery(oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
				}
				if (!this._getSucessorsPickerPopup()) {
					var oMonthPicker = this.getAggregation("monthPicker");
					var oYearPicker = this.getAggregation("yearPicker");
					if (oMonthPicker.getDomRef()) {
						jQuery(oMonthPicker._oItemNavigation.getItemDomRefs()[oMonthPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
					}
					if (oYearPicker.getDomRef()) {
						jQuery(oYearPicker._oItemNavigation.getItemDomRefs()[oYearPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
					}
				}
			}
		}

		// remove tabindex of dummy element if focus is inside calendar
		this.$("end").attr("tabindex", "-1");

	};

	Calendar.prototype._focusOnShiftTab = function() {
		var oHeader = this.getAggregation("header");

		jQuery.sap.focus(oHeader.getDomRef("B2"));
	};

	Calendar.prototype.onsapfocusleave = function(oEvent){
		var aMonths,
			oMonth,
			oMonthPicker,
			oYearPicker;

		if (!oEvent.relatedControlId || !jQuery.sap.containsOrEquals(this.getDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef())) {
			// put dummy element back to tab-chain
			this.$("end").attr("tabindex", "0");

			if (!this._bPoupupMode) {
				// restore Tabindex from day, month, year
				aMonths = this.getAggregation("month");

				switch (this._iMode) {
				case 0: // day picker
					for (var i = 0; i < aMonths.length; i++) {
						oMonth = aMonths[i];
						jQuery(oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
					}
					break;

				case 1: // month picker
					if (!this._getSucessorsPickerPopup()) {
						oMonthPicker = this.getAggregation("monthPicker");
						jQuery(oMonthPicker._oItemNavigation.getItemDomRefs()[oMonthPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
					}
					break;

				case 2: // year picker
					if (!this._getSucessorsPickerPopup()) {
						oYearPicker = this.getAggregation("yearPicker");
						jQuery(oYearPicker._oItemNavigation.getItemDomRefs()[oYearPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
					}
					break;
					// no default
				}
			}
		}

	};

	Calendar.prototype.getFocusDomRef = function(){

		// set focus on the day
		var oMonth = this._oSelectedMonth ? this._oSelectedMonth : this.getAggregation("month")[0];
		return oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()];

	};

	Calendar.prototype.onThemeChanged = function() {
		var oMonthPicker;
		//If the calendar is not yet rendered we cannot perform the theme change operations, which include DOM manipulation
		if (!this.getDomRef()) {
			return;
		}

		this._bNamesLengthChecked = undefined;
		if (!this._getSucessorsPickerPopup()) {
			oMonthPicker = this.getAggregation("monthPicker");
			this._showMonthPicker(true);
			oMonthPicker._bNoThemeChange = false;
			oMonthPicker.onThemeChanged( arguments );
			oMonthPicker._bNoThemeChange = true;
			this._bLongMonth = oMonthPicker._bLongMonth;
			this._hideMonthPicker(true);
		}

		var aMonths = this.getAggregation("month");
		for (var i = 0; i < aMonths.length; i++) {
			var oMonth = aMonths[i];
			oMonth._bNoThemeChange = false;
			oMonth.onThemeChanged( arguments );
			oMonth._bNoThemeChange = true;
		}

		var oCalDate;
		if (aMonths.length > 1) {
			oCalDate = CalendarDate.fromLocalJSDate(aMonths[0].getDate(), this.getPrimaryCalendarType());
		} else {
			oCalDate = this._getFocusedDate();
		}
		this._setHeaderText(oCalDate);
		this._updateHeadersButtons();
		this._setPrimaryHeaderMonthButtonText();
		this._toggleTwoMonthsInTwoColumnsCSS();

		if (!this._getSucessorsPickerPopup()) {
			// check if day names and month names are too big -> use smaller ones
			_checkNamesLength.call(this);
		}
	};

	/**
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate A date to be used for the header buttons
	 * @private
	 */
	Calendar.prototype._updateHeader = function(oDate){

		this._setHeaderText(oDate);
		this._togglePrevNext(oDate, true);

	};

	/**
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The currently focused date
	 * @param {boolean} bCheckMonth Whether the month must be checked
	 * @private
	 */
	Calendar.prototype._togglePrevNext = function(oDate, bCheckMonth){

		var iYearMax = this._oMaxDate.getYear();
		var iYearMin = this._oMinDate.getYear();
		var iMonthMax = this._oMaxDate.getMonth();
		var iMonthMin = this._oMinDate.getMonth();

		var oHeader = this.getAggregation("header");
		var iMonths = _getMonths.call(this);

		var oCheckDate = new CalendarDate(oDate, this.getPrimaryCalendarType());

		if (this._iMode == 0 && iMonths > 1) {
			oCheckDate = _determineFirstMonthDate.call(this, oDate);
			oCheckDate.setMonth(oCheckDate.getMonth() + iMonths - 1);
			oCheckDate.setDate(CalendarUtils._daysInMonth(oCheckDate));
		} else {
			oCheckDate.setDate(CalendarUtils._daysInMonth(oCheckDate));
		}

		var iYear = oCheckDate.getYear();
		var iMonth = oCheckDate.getMonth();

		if (iYear > iYearMax || (iYear == iYearMax && ( !bCheckMonth || iMonth >= iMonthMax ))
				|| (this._iMode == 1 && this._getSucessorsPickerPopup())) {
			oHeader.setEnabledNext(false);
		} else {
			oHeader.setEnabledNext(true);
		}

		if (this._iMode == 0 && iMonths > 1) {
			oCheckDate.setMonth(oCheckDate.getMonth() - iMonths + 1);
			oCheckDate.setDate(1);
		} else {
			oCheckDate.setDate(1); // check the first day of the month for previous (needed for islamic date)
		}

		iYear = oCheckDate.getYear();
		iMonth = oCheckDate.getMonth();

		if (iYear < iYearMin || (iYear == iYearMin && ( !bCheckMonth || iMonth <= iMonthMin ))
				|| (this._iMode == 1 && this._getSucessorsPickerPopup())) {
			oHeader.setEnabledPrevious(false);
		}else {
			oHeader.setEnabledPrevious(true);
		}

	};

	/**
	 * Enables/Disables previous and next buttons in the year picker header.
	 * This function assumes there is a "yearPicker" aggregation.
	 * So callers must take care.
	 * @return {void}
	 * @private
	 */
	Calendar.prototype._togglePrevNexYearPicker = function(){

		var oYearPicker = this.getAggregation("yearPicker");
		var iYears = oYearPicker.getYears();
		var oCalDate = CalendarDate.fromLocalJSDate(oYearPicker.getFirstRenderedDate());
		oCalDate.setYear(oCalDate.getYear() + Math.floor(iYears / 2));
		var oHeader = this.getAggregation("header");
		var oMaxDate = new CalendarDate(this._oMaxDate, this.getPrimaryCalendarType());
		oMaxDate.setYear(oMaxDate.getYear() - Math.ceil(iYears / 2));
		oMaxDate.setMonth(11);
		oMaxDate.setDate(31);
		var oMinDate = new CalendarDate(this._oMinDate, this.getPrimaryCalendarType());
		oMinDate.setYear(oMinDate.getYear() + Math.floor(iYears / 2) + 1);
		oMinDate.setMonth(0);
		oMinDate.setDate(1);

		oHeader.setEnabledNext(oCalDate.isSameOrBefore(oMaxDate));
		oHeader.setEnabledPrevious(oCalDate.isSameOrAfter(oMinDate));
	};

	/**
	 * Handles navigation to previous date.
	 * This function assumes there are both "yearPicker" & "monthPicker" aggregation available.
	 * So callers must take care.
	 * @return {void}
	 * @private
	 */
	Calendar.prototype._handlePrevious = function(oEvent){

		var oFocusedDate = this._getFocusedDate();
		var oYearPicker = this.getAggregation("yearPicker");
		var iMonths = _getMonths.call(this);
		var oFirstMonthDate;
		var oDate;
		var bSkipFocus = false;

		switch (this._iMode) {
		case 0: // day picker
			if (iMonths > 1) {
				oFirstMonthDate = CalendarDate.fromLocalJSDate(this.getAggregation("month")[0].getDate(), this.getPrimaryCalendarType());
				oFirstMonthDate.setDate(1);
				this._setFocusedDate(oFirstMonthDate);
				oFocusedDate = this._getFocusedDate();
			}else {
				oFocusedDate.setDate(1);
			}

			oFocusedDate.setDate(oFocusedDate.getDate() - 1);
			this._renderMonth(bSkipFocus, true);
			break;

		case 1: // month picker
			oFocusedDate.setYear(oFocusedDate.getYear() - 1);
			this._updateHeadersYearPrimaryText(this._oYearFormat.format(oFocusedDate.toUTCJSDate(), true));
			var sSecondaryCalendarType = this._getSecondaryCalendarType();
			if (sSecondaryCalendarType) {
				oDate = new CalendarDate(oFocusedDate, sSecondaryCalendarType);
				oDate.setMonth(0);
				oDate.setDate(1);
				this._updateHeadersYearAdditionalText(this._oYearFormatSecondary.format(oDate.toUTCJSDate(), true));
			} else {
				this._updateHeadersYearAdditionalText();
			}
			this._togglePrevNext(oFocusedDate);
			this._setDisabledMonths(oFocusedDate.getYear());
			break;

		case 2: // year picker
			oYearPicker.previousPage();
			this._togglePrevNexYearPicker();
			break;
			// no default
		}

	};

	/**
	 * Handles navigation to next date.
	 * This function assumes there are both "yearPicker" & "monthPicker" aggregation available.
	 * So callers must take care.
	 * @return {void}
	 * @private
	 */
	Calendar.prototype._handleNext = function(oEvent){

		var oFocusedDate = this._getFocusedDate();
		var oYearPicker = this.getAggregation("yearPicker");
		var iMonths = _getMonths.call(this);
		var oFirstMonthDate;
		var oDate;

		switch (this._iMode) {
		case 0: // day picker
			if (iMonths > 1) {
				oFirstMonthDate = CalendarDate.fromLocalJSDate(this.getAggregation("month")[0].getDate(), this.getPrimaryCalendarType());
				this._setFocusedDate(oFirstMonthDate);
				oFocusedDate = this._getFocusedDate();
			}
			oFocusedDate.setDate(1);
			oFocusedDate.setMonth(oFocusedDate.getMonth() + iMonths);
			this._renderMonth();
			break;

		case 1: // month picker
			oFocusedDate.setYear(oFocusedDate.getYear() + 1);
			this._updateHeadersYearPrimaryText(this._oYearFormat.format(oFocusedDate.toUTCJSDate(), true));
			var sSecondaryCalendarType = this._getSecondaryCalendarType();
			if (sSecondaryCalendarType) {
				oDate = new CalendarDate(oFocusedDate, sSecondaryCalendarType);
				oDate.setMonth(0);
				oDate.setDate(1);
				this._updateHeadersYearAdditionalText(this._oYearFormatSecondary.format(oDate.toUTCJSDate(), true));
			} else {
				this._updateHeadersYearAdditionalText();
			}
			this._togglePrevNext(oFocusedDate);
			this._setDisabledMonths(oFocusedDate.getYear());
			break;

		case 2: // year picker
			oYearPicker.nextPage();
			this._togglePrevNexYearPicker();
			break;
			// no default
		}

	};

	/**
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate A date to determine the first of the displayed months
	 * @returns {array} The displayed months rendered for a given date
	 */
	Calendar.prototype._getDisplayedMonths = function(oDate){

		var aMonths = [];
		var iMonth = oDate.getMonth();
		var iMonths = _getMonths.call(this);

		if (iMonths > 1) {
			for (var i = 0; i < iMonths; i++) {
				aMonths.push((iMonth + i) % 12);
			}
		}else {
			aMonths.push(iMonth);
		}

		return aMonths;

	};

	Calendar.prototype._getDisplayedSecondaryMonths = function(sPrimaryCalendarType, sSecondaryCalendarType){

		var aMonths = this.getAggregation("month");
		var oFirstDate = CalendarDate.fromLocalJSDate(aMonths[0].getDate(), sPrimaryCalendarType);
		oFirstDate.setDate(1);
		oFirstDate = new CalendarDate(oFirstDate, sSecondaryCalendarType);
		var iStartMonth = oFirstDate.getMonth();

		var oLastDate = CalendarDate.fromLocalJSDate(aMonths[aMonths.length - 1].getDate(), sPrimaryCalendarType);
		oLastDate.setDate(CalendarUtils._daysInMonth(oLastDate));
		oLastDate = new CalendarDate(oLastDate, sSecondaryCalendarType);
		var iEndMonth = oLastDate.getMonth();

		return {start: iStartMonth, end: iEndMonth};

	};

	/**
	 * Closes a month or year picker depending of the <code>this._iMode</code>.
	 * This function assumes there is a "yearPicker" & "monthPicker" aggregation available.
	 * So callers must take care.
	 * @return {void}
	 * @private
	 */
	Calendar.prototype._closedPickers = function(){

		switch (this._iMode) {
		case 0: // date picker
			break;

		case 1: // month picker
			this._hideMonthPicker();
			break;

		case 2: // year picker
			this._hideYearPicker();
			break;
			// no default
		}

	};

	Calendar.prototype._setDisabledMonths = function(iYear, oMonthPicker) {

		var iMinMonth = 0;
		var iMaxMonth = 11;

		if (iYear == this._oMinDate.getYear()) {
			iMinMonth = this._oMinDate.getMonth();
		}


		if (iYear == this._oMaxDate.getYear()) {
			iMaxMonth = this._oMaxDate.getMonth();
		}

		if (!oMonthPicker) {
			oMonthPicker = this.getAggregation("monthPicker");
		}
		oMonthPicker.setMinMax(iMinMonth, iMaxMonth);

	};

	/**
	* Handles focusing of a date by clicking on it or with keyboard navigation.
	* @param {Object} oEvent the event
	* @private
	*/
	Calendar.prototype._handleFocus = function (oEvent) {

		var oDate = CalendarDate.fromLocalJSDate(oEvent.getParameter("date"), this.getPrimaryCalendarType());
		var bOtherMonth = oEvent.getParameter("otherMonth");
		var bRestoreOldDate = oEvent.getParameter("restoreOldDate");

		if (bRestoreOldDate) {
			// in multimonth mode stay at the last focused date
			if (!jQuery.sap.equal(this._getFocusedDate(), oDate)) {
				this._renderMonth(false, false, true);
			}
		} else {
			this._focusDate(oDate, bOtherMonth);
		}
	};

	/**
	* Returns an array of currently visible days
	* @returns {sap.ui.unified.calendar.CalendarDate} visible days
	* @private
	*/
	Calendar.prototype._getVisibleDays = function () {
	   var oMonth = this.getAggregation("month")[0];
	   return oMonth._getVisibleDays(oMonth._getDate(), false);
	};

	/*
	 * sets the date in the used Month controls
	 * @param {sap.ui.unified.Calendar} this Calendar instance
	 * @param {boolean} bSkipFocus if set no focus is set to the date
	 * @param {boolean} bInLastMont if more than one month is used, date is rendered in last month
	 * @param {boolean} bNoEvent if set, no startDateChange event is fired
	 */
	Calendar.prototype._renderMonth = function (bSkipFocus, bInLastMonth, bNoEvent){

		var oDate = this._getFocusedDate();
		var aMonths = this.getAggregation("month");
		var bFound = false;
		var oMonth;
		var oMonthDate;
		var oFirstDate;
		var i = 0;
		for (i = 0; i < aMonths.length; i++) {
			oMonth = aMonths[i];
			if (oMonth.checkDateFocusable(oDate.toLocalJSDate())) {
				bFound = true;
			}
			if (bFound || aMonths.length == 1) {
				// if only 1 month, date must be set in it any way
				if (!bSkipFocus) {
					oMonth.setDate(oDate.toLocalJSDate());
				} else {
					oMonth.displayDate(oDate.toLocalJSDate());
				}
				break;
			}
		}

		if (!bFound) {
			// date not found in existing months - render new ones

			oFirstDate = new CalendarDate(oDate, this.getPrimaryCalendarType());

			if (aMonths.length > 1) {
				oFirstDate = _determineFirstMonthDate.call(this, oFirstDate);

				for (i = 0; i < aMonths.length; i++) {
					oMonth = aMonths[i];
					oMonthDate = new CalendarDate(oFirstDate, this.getPrimaryCalendarType());
					oMonthDate.setMonth(oFirstDate.getMonth() + i);
					if (!bSkipFocus && CalendarUtils._isSameMonthAndYear(oMonthDate, oDate)) {
						oMonth.setDate(oDate.toLocalJSDate());
					}else {
						oMonth.displayDate(oMonthDate.toLocalJSDate());
					}
				}
			}

			// change month and year
			this._updateHeader(oFirstDate);
			this._updateHeadersButtons();
			this._setPrimaryHeaderMonthButtonText();
			this._toggleTwoMonthsInTwoColumnsCSS();

			if (!bNoEvent) {
				this.fireStartDateChange();
			}
		}

	};

	function _determineFocusedDate(){

		var aSelectedDates = this.getSelectedDates();
		var sCalendarType = this.getPrimaryCalendarType();
		if (aSelectedDates && aSelectedDates[0] && aSelectedDates[0].getStartDate()) {
			// selected dates are provided -> use first one to focus
			this._oFocusedDate = CalendarDate.fromLocalJSDate(aSelectedDates[0].getStartDate(), sCalendarType);
		} else {
			// use current date
			this._oFocusedDate = CalendarDate.fromLocalJSDate(new Date(), sCalendarType);
		}

		if (this._oFocusedDate.isBefore(this._oMinDate)) {
			this._oFocusedDate = new CalendarDate(this._oMinDate, sCalendarType);
		}else if (this._oFocusedDate.isAfter(this._oMaxDate)){
			this._oFocusedDate = new CalendarDate(this._oMaxDate, sCalendarType);
		}

	}


	/**
	 * Shows an embedded Month Picker.
	 * This function assumes there is a "monthPicker" & "yearPicker" aggregation.
	 * So callers must take care.
	 * @return {void}
	 * @private
	 */
	Calendar.prototype._showMonthPicker = function (bSkipFocus) {

		if (this._iMode == 2) {
			this._hideYearPicker(true);
		}

		var oDate = this._getFocusedDate();
		var oMonthPicker = this.getAggregation("monthPicker");

		if (oMonthPicker.getDomRef()) {
			// already rendered
			oMonthPicker.$().css("display", "");
		} else {
			var oRm = sap.ui.getCore().createRenderManager();
			var $Container = this.$("content");
			oRm.renderControl(oMonthPicker);
			oRm.flush($Container[0], false, true); // insert it
			oRm.destroy();
		}

		this._showOverlay();

		if (!bSkipFocus) {
			oMonthPicker.setMonth(oDate.getMonth());
			this._setDisabledMonths(oDate.getYear(), oMonthPicker);

			if (this._iMode == 0) {
				// remove tabindex from month
				var aMonths = this.getAggregation("month");

				for (var i = 0; i < aMonths.length; i++) {
					var oMonth = aMonths[i];
					jQuery(oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
				}
			}
		}

		this._iMode = 1;

		this._togglePrevNext(oDate, false);

	};

	/**
	 * Hides an embedded Month Picker.
	 * This function assumes there is a "monthPicker" aggregation.
	 * So callers must take care.
	 * @return {void}
	 * @private
	 */
	Calendar.prototype._hideMonthPicker = function (bSkipFocus) {

		this._iMode = 0;

		var oMonthPicker = this.getAggregation("monthPicker");
		oMonthPicker.$().css("display", "none");

		this._hideOverlay();

		if (!bSkipFocus) {
			this._renderMonth(); // to focus date

			if (_getMonths.call(this) > 1) {
				// restore tabindex because if date not changed in _renderMonth only the focused date is updated
				var aMonths = this.getAggregation("month");
				for (var i = 0; i < aMonths.length; i++) {
					var oMonth = aMonths[i];
					jQuery(oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
				}
			}
		}

		this._togglePrevNext(this._getFocusedDate(), true);

	};

	/**
	 * Shows an embedded year Picker.
	 * This function assumes there is a "yearPicker" aggregation.
	 * So callers must take care.
	 * @return {void}
	 * @private
	 */
	Calendar.prototype._showYearPicker = function () {

		if (this._iMode == 1) {
			this._hideMonthPicker(true);
		}

		var oDate = this._getFocusedDate();

		var oYearPicker = this.getAggregation("yearPicker");

		if (oYearPicker.getDomRef()) {
			// already rendered
			oYearPicker.$().css("display", "");
		} else {
			var oRm = sap.ui.getCore().createRenderManager();
			var $Container = this.$("content");
			oRm.renderControl(oYearPicker);
			oRm.flush($Container[0], false, true); // insert it
			oRm.destroy();
		}

		this._showOverlay();

		oYearPicker.setDate(oDate.toLocalJSDate());

		// check special case if only 4 weeks are displayed (e.g. February 2021) -> top padding must be removed
		// can only happen if only one month is displayed -> otherwise at least one month has more than 28 days.
		var oMonth;
		if (_getMonths.call(this) == 1) {
			oMonth = this.getAggregation("month")[0];
			var aDomRefs = oMonth.$("days").find(".sapUiCalItem");
			if (aDomRefs.length == 28) {
				oYearPicker.$().addClass("sapUiCalYearNoTop");
			}else {
				oYearPicker.$().removeClass("sapUiCalYearNoTop");
			}
		}

		if (this._iMode == 0) {
			// remove tabindex from month
			var aMonths = this.getAggregation("month");

			for (var i = 0; i < aMonths.length; i++) {
				oMonth = aMonths[i];
				jQuery(oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
			}
		}

		this._togglePrevNexYearPicker();

		this._iMode = 2;

	};

	/**
	 * Hides an embedded Year Picker.
	 * This function assumes there is a "yearPicker" aggregation.
	 * So callers must take care.
	 * @return {void}
	 * @private
	 */
	Calendar.prototype._hideYearPicker = function (bSkipFocus) {

		this._iMode = 0;

		var oYearPicker = this.getAggregation("yearPicker");
		oYearPicker.$().css("display", "none");

		this._hideOverlay();

		if (!bSkipFocus) {
			this._renderMonth(); // to focus date

			if (_getMonths.call(this) > 1) {
				// restore tabindex because if date not changed in _renderMonth only the focused date is updated
				var aMonths = this.getAggregation("month");
				for (var i = 0; i < aMonths.length; i++) {
					var oMonth = aMonths[i];
					jQuery(oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
				}
			}
		}

		this._togglePrevNext(this._getFocusedDate(), true);

	};

	function _checkNamesLength(){

		if (!this._bNamesLengthChecked) {
			// check month names (don't change focus)
			this._showMonthPicker(true);
			this._hideMonthPicker(true);

			var oMonthPicker = this.getAggregation("monthPicker");
			this._bLongMonth = oMonthPicker._bLongMonth;

			this._bNamesLengthChecked = true;

			if (!this._bLongMonth) {
				// update short month name (long name used by default)
				var aMonths = this.getAggregation("month");
				var oDate;

				if (aMonths.length > 1) {
					oDate = CalendarDate.fromLocalJSDate(aMonths[0].getDate(), this.getPrimaryCalendarType());
				}else {
					oDate = this._getFocusedDate();
				}

				this._setHeaderText(oDate);
				this._updateHeadersButtons();
				this._setPrimaryHeaderMonthButtonText();
				this._toggleTwoMonthsInTwoColumnsCSS();
			}
		}else if (_getMonths.call(this) > 1) {
			// on rerendering focus might be set on wrong month
			this._focusDate(this._getFocusedDate(), true, true);
		}

	}

	/**
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date to be focused
	 * @param {boolean} bOtherMonth Whether the date to be focused is outside the visible date range
	 * @param {boolean} bNoEvent Whether startDateChange event should be fired
	 * @private
	 */
	Calendar.prototype._focusDate = function (oDate, bOtherMonth, bNoEvent){

		// if a date should be focused thats out of the borders -> focus the border
		var oFocusedDate;
		var bChanged = false;
		var bFireStartDateChange = false;
		if (oDate.isBefore(this._oMinDate)) {
			oFocusedDate = this._oMinDate;
			bChanged = true;
		} else if (oDate.isAfter(this._oMaxDate)){
			oFocusedDate = this._oMaxDate;
			bChanged = true;
		} else {
			oFocusedDate = oDate;
		}

		if (this._focusDateExtend) {
			// hook for CalenarDateInterval
			bFireStartDateChange = this._focusDateExtend(oDate, bOtherMonth, bNoEvent);
		}

		var bInLastMonth = oFocusedDate.isBefore(this._getFocusedDate());

		this._setFocusedDate(oFocusedDate);

		if (bChanged || bOtherMonth) {
			this._renderMonth(false, bInLastMonth, bNoEvent);
		}

		if (bFireStartDateChange) {
			this.fireStartDateChange();
		}

	};

	Calendar.prototype._invalidateMonth = function(oOrigin) {
		this._sInvalidateMonth = undefined;

		var aMonths = this.getAggregation("month");
		if (aMonths) {
			for (var i = 0; i < aMonths.length; i++) {
				var oMonth = aMonths[i];
				oMonth._bDateRangeChanged = true;
				oMonth._bInvalidateSync = true;
				oMonth._bNoFocus = true;
				oMonth.invalidate(oOrigin);
				oMonth._bInvalidateSync = undefined;
			}
		}

		this._bDateRangeChanged = undefined;

	};

	/**
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate A date to be used for the header buttons
	 * @private
	 */
	Calendar.prototype._setHeaderText = function(oDate){

		// sets the text for the month and the year button to the header

		var oHeader = this.getAggregation("header");
		var oSecondMonthHeader = this.getAggregation("secondMonthHeader");
		var oLocaleData = this._getLocaleData();
		var aMonthNames = [];
		var aMonthNamesWide = [];
		var aMonthNamesSecondary = [];
		var sAriaLabel;
		var bShort = false;
		var sFirstMonthName;
		var sLastMonthName;
		var sText;
		var sYear;
		var sPattern;
		var sPrimaryCalendarType = this.getPrimaryCalendarType();
		var sSecondaryCalendarType = this._getSecondaryCalendarType();
		if (this._bLongMonth || !this._bNamesLengthChecked) {
			aMonthNames = oLocaleData.getMonthsStandAlone("wide", sPrimaryCalendarType);
		} else {
			bShort = true;
			aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated", sPrimaryCalendarType);
			aMonthNamesWide = oLocaleData.getMonthsStandAlone("wide", sPrimaryCalendarType);
		}

		if (sSecondaryCalendarType) {
			// always use short month names because in most cases 2 months are displayed
			aMonthNamesSecondary = oLocaleData.getMonthsStandAlone("abbreviated", sSecondaryCalendarType);

			var oSecondaryMonths = this._getDisplayedSecondaryMonths(sPrimaryCalendarType, sSecondaryCalendarType);
			if (oSecondaryMonths.start == oSecondaryMonths.end) {
				sText = aMonthNamesSecondary[oSecondaryMonths.start];
			} else {
				sPattern = oLocaleData.getIntervalPattern();
				sText = sPattern.replace(/\{0\}/, aMonthNamesSecondary[oSecondaryMonths.start]).replace(/\{1\}/, aMonthNamesSecondary[oSecondaryMonths.end]);
			}
		}
		oHeader.setAdditionalTextButton1(sText);
		oHeader._setAdditionalTextButton3(sText);
		oSecondMonthHeader.setAdditionalTextButton1(sText);

		var aMonths = this._getDisplayedMonths(oDate);
		this._sFirstMonthName = sFirstMonthName = aMonthNames[aMonths[0]];
		sLastMonthName = aMonthNames[aMonths[aMonths.length - 1]];

		if (aMonths.length > 1 && !this._bShowOneMonth) {
			if (!sPattern) {
				sPattern = oLocaleData.getIntervalPattern();
			}
			sText = sPattern.replace(/\{0\}/, sFirstMonthName).replace(/\{1\}/, sLastMonthName);
			sAriaLabel = aMonthNamesWide.length ? sPattern.replace(/\{0\}/, aMonthNamesWide[aMonths[0]]).replace(/\{1\}/, aMonthNamesWide[aMonths[aMonths.length - 1]]) : sText;
		} else {
			sText = sFirstMonthName;
			sAriaLabel = aMonthNamesWide[aMonths[0]] || sText;
		}

		oHeader.setTextButton1(sText);
		oHeader.setAriaLabelButton1(sAriaLabel);
		oHeader._setTextButton3(sLastMonthName);
		oHeader._setAriaLabelButton3(sLastMonthName);
		oSecondMonthHeader.setTextButton1(sLastMonthName);
		oSecondMonthHeader.setAriaLabelButton1(sLastMonthName);

		var oFirstDate = new CalendarDate(oDate, sPrimaryCalendarType);
		oFirstDate.setDate(1); // always use the first of the month to have stable year in Japanese calendar
		sYear = this._oYearFormat.format(oFirstDate.toUTCJSDate(), true);
		this._updateHeadersYearPrimaryText(sYear);

		if (sSecondaryCalendarType) {
			oFirstDate = new CalendarDate(oFirstDate, sSecondaryCalendarType);
			this._updateHeadersYearAdditionalText(this._oYearFormatSecondary.format(oFirstDate.toUTCJSDate(), true));
		} else {
			this._updateHeadersYearAdditionalText();
		}

		return {
			sMonth: sText,
			sYear: sYear,
			sAriaLabel: sAriaLabel,
			bShort: bShort
		};
	};

	/**
	 * @param {Object} oDate The date to be displayed
	 * @param {boolean} bSkipFocus Whether the date is focused
	 * @private
	 */
	function _displayDate(oDate, bSkipFocus) {

		if (!oDate) {
			return;
		}

		var oCalDate = CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType());

		var iYear = oCalDate.getYear();
		CalendarUtils._checkYearInValidRange(iYear);

		if (CalendarUtils._isOutside(oCalDate, this._oMinDate, this._oMaxDate)) {
			throw new Error("Date must not be in valid range (minDate and maxDate); " + this);
		}

		this._setFocusedDate(oCalDate);

		if (this.getDomRef() && this._iMode == 0) {
			this._renderMonth(bSkipFocus, false, true); // fire no startDateChange event on programmatical change
		}

	}

	function _getMonths (){

		// in phone mode always only one month is displayed
		if (Device.system.phone) {
			return 1;
		} else {
			return this.getMonths();
		}

	}

	// handlers for sub-controls
	Calendar.prototype._handleButton1 = function(oEvent) {

		if (this._iMode != 1) {
			this._showMonthPicker();
		} else {
			this._hideMonthPicker();
		}

	};

	Calendar.prototype._handleButton2 = function(oEvent) {

		if (this._iMode != 2) {
			this._showYearPicker();
		} else {
			this._hideYearPicker();
		}

	};

	function _handleRenderMonth (oEvent){

		// fire internal event for DatePicker for with number of rendered days. If Calendar becomes larger maybe popup must change position
		this.fireEvent("_renderMonth", {days: oEvent.getParameter("days")});

	}

	function _handleSelect (oEvent){
		if (_getMonths.call(this) > 1) {
			var aMonths = this.getAggregation("month");
			for (var i = 0; i < aMonths.length; i++) {
				var oMonth = aMonths[i];

				if (oMonth.getId() != oEvent.oSource.getId()) {
					oMonth._updateSelection();
				}
			}
		}
		this._oSelectedMonth = oEvent.oSource;

		this.fireSelect();

	}


	function _handleBindMousemove (oEvent){

		if (_getMonths.call(this) > 1) {
			var aMonths = this.getAggregation("month");
			for (var i = 0; i < aMonths.length; i++) {
				var oMonth = aMonths[i];
				if (oMonth.getId() != oEvent.oSource.getId()) {
					oMonth._bindMousemove();
				}
			}
		}

	}

	function _handleUnbindMousemove (oEvent){

		if (_getMonths.call(this) > 1) {
			var aMonths = this.getAggregation("month");
			for (var i = 0; i < aMonths.length; i++) {
				var oMonth = aMonths[i];
				if (oMonth.getId() != oEvent.oSource.getId()) {
					oMonth._unbindMousemove();
				}
			}
		}

	}

	Calendar.prototype._selectMonth = function () {
		var oFocusedDate = new CalendarDate(this._getFocusedDate(), this.getPrimaryCalendarType()),
				oMonthPicker = this.getAggregation("monthPicker"),
				iMonth = oMonthPicker.getMonth();

		oFocusedDate.setMonth(iMonth);
		if (iMonth != oFocusedDate.getMonth()){
			// day did not exist in this month (e.g. 31) -> go to last day of month
			oFocusedDate.setDate(0);
		}

		this._focusDate(oFocusedDate, true);

		this._hideMonthPicker();

	};

	/**
	 * Verifies if subclasses has set a pickerPopup
	 * @private
	 * @returns {boolean} true of the subclasses provides such property and its value is true, false otherwise
	 */
	Calendar.prototype._getSucessorsPickerPopup = function() {
		return this.getPickerPopup && this.getPickerPopup();
	};

	/**
	 * Handler for selecting an year from the YearPicker.
	 * @private
	 * @returns {void}
	 */
	Calendar.prototype._selectYear = function () {
		var oFocusedDate = new CalendarDate(this._getFocusedDate(), this.getPrimaryCalendarType());
		var oYearPicker = this.getAggregation("yearPicker");
		var oDate = CalendarDate.fromLocalJSDate(oYearPicker.getDate(), this.getPrimaryCalendarType());

		// to keep day and month stable also for islamic date
		oDate.setMonth(oFocusedDate.getMonth());
		oDate.setDate(oFocusedDate.getDate());
		oFocusedDate = oDate;

		this._focusDate(oFocusedDate, true);

		this._hideYearPicker();

	};

	Calendar.prototype._showOverlay = function () {
		this.$("contentOver").css("display", "");
	};

	Calendar.prototype._hideOverlay = function () {
		this.$("contentOver").css("display", "none");
	};

	/**
	 * Sets columns to display
	 * @param iColumns Number of columns to display
	 * @private
	 */
	Calendar.prototype._setColumns = function (iColumns) {
		this._iColumns = iColumns;

		return this;
	};

	/**
	 * Gets columns to display
	 *
	 * @returns {number} Number of columns to display
	 * @private
	 */
	Calendar.prototype._getColumns = function () {
		return this._iColumns;
	};

	/**
	 * Update visibility of the Buttons in the Header depending on the number of columns and months
	 * @private
	 */
	Calendar.prototype._updateHeadersButtons = function () {
		var oHeader = this.getAggregation("header"),
			oSecondMonthHeader = this.getAggregation("secondMonthHeader");

		if (this._isTwoMonthsInOneColumn()) {
			// Two months displayed in one column
			// Than we need the second header
			// and hide the third and fourth buttons of the first header
			oSecondMonthHeader.setVisible(true);
			oHeader._setVisibleButton3(false);
			oHeader._setVisibleButton4(false);
		} else if (this._isTwoMonthsInTwoColumns()) {
			// Two months displayed in two columns
			// Than we need to hide the second header
			// and show third and fourth buttons of the first
			oSecondMonthHeader.setVisible(false);
			oHeader._setVisibleButton3(true);
			oHeader._setVisibleButton4(true);
		} else {
			// Keep the other use cases untouched
			// No second header
			// No third and fourth button
			oSecondMonthHeader.setVisible(false);
			oHeader._setVisibleButton3(false);
			oHeader._setVisibleButton4(false);
		}
	};

	/**
	 * Update text of the Month button in the Header depending on the number of columns and months
	 * @private
	 */
	Calendar.prototype._setPrimaryHeaderMonthButtonText = function () {
		var oHeader = this.getAggregation("header");

		if (this._isTwoMonthsInOneColumn() || this._isTwoMonthsInTwoColumns()) {
			// Two months displayed in one column than the month button should display only the first month
			oHeader.setTextButton1(this._sFirstMonthName);
		}
	};

	/**
	 * Toggle On or Off CSS class for indicating if calendar is in two columns with two calendars mode
	 * @private
	 */
	Calendar.prototype._toggleTwoMonthsInTwoColumnsCSS = function () {
		if (this._isTwoMonthsInTwoColumns()) {
			this.addStyleClass("sapUiCalTwoMonthsTwoColumns");
		} else {
			this.removeStyleClass("sapUiCalTwoMonthsTwoColumns");
		}
	};

	/**
	 *
	 * @returns {boolean} if there are two months in one column
	 * @private
	 */
	Calendar.prototype._isTwoMonthsInOneColumn = function () {
		var iMonths = _getMonths.call(this);

		return this._getColumns() === 1 && iMonths === 2;
	};

	/**
	 *
	 * @returns {boolean} if there are two months in two columns
	 * @private
	 */
	Calendar.prototype._isTwoMonthsInTwoColumns = function () {
		var iMonths = _getMonths.call(this);

		return this._getColumns() === 2 && iMonths === 2;
	};

	Calendar.prototype._updateHeadersYearPrimaryText = function (sYear) {
		var oHeader = this.getAggregation("header"),
			oSecondMonthHeader = this.getAggregation("secondMonthHeader");

		oHeader.setTextButton2(sYear);
		oHeader.setAriaLabelButton2(sYear);
		oHeader._setTextButton4(sYear);
		oHeader._setAriaLabelButton4(sYear);
		oSecondMonthHeader.setTextButton2(sYear);
		oSecondMonthHeader.setAriaLabelButton2(sYear);
	};

	Calendar.prototype._updateHeadersYearAdditionalText = function (sYear) {
		var oHeader = this.getAggregation("header"),
			oSecondMonthHeader = this.getAggregation("secondMonthHeader");

		oHeader.setAdditionalTextButton2(sYear);
		oHeader._setAdditionalTextButton4(sYear);
		oSecondMonthHeader.setAdditionalTextButton2(sYear);
	};

	/*
	 * Fires a <code>weekNumberSelect</code> event when a week number is clicked.
	 * @param {object} oEventTarget The clicked week number.
	 * @private
	 */
	Calendar.prototype._handleWeekSelection = function (oEventTarget) {
		var oSelectedWeekNumber = parseInt(oEventTarget.innerText, 10),
			sStartDate = jQuery(oEventTarget.parentElement).attr("data-sap-day"),
			oFormatter = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyyMMdd"}),
			oStartDate = oFormatter.parse(sStartDate),
			oEndDate = new Date(oStartDate.getFullYear(), oStartDate.getMonth(), oStartDate.getDate() + 6),
			oDateRange = new DateRange({startDate: oStartDate, endDate: oEndDate});

		this.fireEvent("weekNumberSelect", {weekNumber: oSelectedWeekNumber, weekDays: oDateRange});
		this.focusDate(oStartDate);
	};

	function _handleResize(oEvent){
		var iWidth = oEvent.size.width;

		if (iWidth <= 0) {
			// only if visible at all
			return;
		}

		var iOldSize = this._iSize;
		if (iWidth < this._iBreakPointTablet) {
			this._iSize = 0; // phone
		} else if (iWidth < this._iBreakPointDesktop) {
			this._iSize = 1; // tablet
		} else if (iWidth < this._iBreakPointLargeDesktop) {
			this._iSize = 2; // desktop
		} else {
			this._iSize = 3; // large desktop
		}

		var iMonths = _getMonths.call(this);

		if (iOldSize != this._iSize || this._bInitMonth) {
			switch (this._iSize) {
			case 1: // tablet
				this._setColumns(2);
				break;

			case 2: // desktop
				this._setColumns(3);
				break;

			case 3: // large desktop
				this._setColumns(4);
				break;

			default:
				this._setColumns(1);
				break;
			}

			if (iMonths < this._getColumns()) {
				this._setColumns(iMonths);
			}

			// determine best fitting colums
			if (this._getColumns() > 2 && iMonths > this._getColumns()) {
				var iCheckColumns = this._getColumns();
				var fUseage = 0.0;
				var iUseColumns = this._getColumns();
				while (iCheckColumns >= 2) {
					var iMod = iMonths % iCheckColumns;
					if (iMod == 0) {
						iUseColumns = iCheckColumns;
						break;
					} else {
						var fNewUseage = iMod / iCheckColumns;
						if (fNewUseage > fUseage) {
							fUseage = fNewUseage;
							iUseColumns = iCheckColumns;
						}
					}
					iCheckColumns--;
				}
				this._setColumns(iUseColumns);
			}

			var sWidth;
			var aMonths = this.getAggregation("month");

			if (this._getColumns() > 1) {
				sWidth = 100 / this._getColumns() + "%";
				this.$("content").removeClass("sapUiCalContentSingle");
			} else {
				sWidth = "100%";
				this.$("content").addClass("sapUiCalContentSingle");
			}

			for (var i = 0; i < aMonths.length; i++) {
				var oMonth = aMonths[i];
				oMonth.setWidth(sWidth);
			}
		}

		this._updateHeadersButtons();
		this._setPrimaryHeaderMonthButtonText();
		this._toggleTwoMonthsInTwoColumnsCSS();
	}

	/**
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date, which first date of month will be determined
	 * @returns {sap.ui.unified.calendar.CalendarDate} The first date of the month
	 * @private
	 */
	function _determineFirstMonthDate(oDate){

		var oFirstDate = new CalendarDate(oDate, this.getPrimaryCalendarType());
		oFirstDate.setDate(1);

		var iMonths = _getMonths.call(this); // to use validation
		if (iMonths <= 12) {
			// only if intervals fit into a year -> otherwise just display the months according to the date
			var iMonth = oDate.getMonth();
			iMonth = iMonth - iMonth % iMonths;
			if (12 % iMonths > 0 && iMonth + iMonths > 11) {
				// do not show months over year borders if possible
				iMonth = 12 - iMonths;
			}
			oFirstDate.setMonth(iMonth);
		}

		return oFirstDate;

	}

	return Calendar;

});
