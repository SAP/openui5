/*!
 * ${copyright}
 */
//Provides control sap.ui.unified.Calendar.
sap.ui.define([
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	'sap/ui/core/CalendarType',
	'sap/ui/core/Control',
	"sap/ui/core/Element",
	'sap/ui/core/LocaleData',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/DateTypeRange',
	'./calendar/Header',
	'./calendar/Month',
	'./calendar/MonthPicker',
	'./calendar/YearPicker',
	'./calendar/YearRangePicker',
	'./calendar/CalendarDate',
	'sap/ui/core/date/UniversalDate',
	'sap/ui/core/date/UI5Date',
	'./library',
	'sap/ui/Device',
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/ResizeHandler',
	'sap/ui/core/Locale',
	'sap/ui/events/KeyCodes',
	"./CalendarRenderer",
	"sap/ui/dom/containsOrEquals",
	"sap/base/util/deepEqual",
	"sap/base/Log",
	"sap/ui/core/date/CalendarWeekNumbering"
], function(
	Formatting,
	Localization,
	CalendarType,
	Control,
	Element,
	LocaleData,
	CalendarUtils,
	DateTypeRange,
	Header,
	Month,
	MonthPicker,
	YearPicker,
	YearRangePicker,
	CalendarDate,
	UniversalDate,
	UI5Date,
	library,
	Device,
	DateFormat,
	ResizeHandler,
	Locale,
	KeyCodes,
	CalendarRenderer,
	containsOrEquals,
	deepEqual,
	Log,
	CalendarWeekNumbering
) {
	"use strict";

	/*
	 * Inside the Calendar CalendarDate, UI5Date or JavaScript Date objects are used. But in the API only UI5Date or JavaScript Date object are used.
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
			 * If the property is set, this day marks the start of the displayed week. Valid values are 0 to 6.
			 * If no valid property is set, the current locale's default is applied.
			 * Note: This property should not be used with the calendarWeekNumbering property.
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
			primaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance"},

			/**
			 * If set, the days are also displayed in this calendar type
			 * If not set, the dates are only displayed in the primary calendar type
			 * @since 1.34.0
			 */
			secondaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance"},

			/**
			 * Width of Calendar
			 *
			 * <b>Note:</b> There is a theme depending minimum width, so the calendar can not be set smaller.
			 * @since 1.38.0
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Minimum date that can be shown and selected in the Calendar. This must be a UI5Date or JavaScript Date object.
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
			 * Maximum date that can be shown and selected in the Calendar. This must be a UI5Date or JavaScript Date object.
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
			showWeekNumbers : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Determines whether there is a shortcut navigation to Today. When used in Month, Year or
			 * Year-range picker view, the calendar navigates to Day picker view.
			 *
			 * @since 1.95
			 */
			showCurrentDateButton : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * Holds a reference to the currently shown picker. Possible values: month, monthPicker, yearPicker and yearRangePicker.
			 *
			 * @since 1.84.0
			 */
			_currentPicker : {type : "string", group : "Appearance", visibility: "hidden"},

			/**
			 * If set, the calendar week numbering is used for display.
			 * If not set, the calendar week numbering of the global configuration is used.
			 * Note: This property should not be used with firstDayOfWeek property.
			 * @since 1.108.0
			 */
			calendarWeekNumbering : { type : "sap.ui.core.date.CalendarWeekNumbering", group : "Appearance", defaultValue: null},

			/**
			 * Holds a reference to a UI5Date or JavaScript Date object to define the initially navigated date in the calendar.
			 *
			 * @since 1.111
			 */
			initialFocusedDate: {type: "object", group: "Data", defaultValue: null}

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
			 * Dates or date ranges with type, to visualize special days.
			 *
			 * To set a single date (instead of a range), set only the <code>startDate</code> property
			 * of the {@link sap.ui.unified.DateTypeRange} class.
			 *
			 * <b>Note:</b> If you need a weekly-reccuring non-working days
			 * (weekend), you should use the <code>nonWorkingDays</code> property. Both the non-working
			 * days (from property) and dates (from aggregation) are visualized the same.
			 *
			 * <b>Note:</b> In case there are multiple <code>sap.ui.unified.DateTypeRange</code> instances given for a single date,
			 * only the first <code>sap.ui.unified.DateTypeRange</code> instance will be used.
			 * For example, using the following sample, the 1st of November will be displayed as a working day of type "Type10":
			 *
			 *
			 *	<pre>
			 *	new DateTypeRange({
			 *		startDate: UI5Date.getInstance(2023, 10, 1),
			 *		type: CalendarDayType.Type10,
			 *	}),
			 *	new DateTypeRange({
			 *		startDate: UI5Date.getInstance(2023, 10, 1),
			 *		type: CalendarDayType.NonWorking
			 *	})
			 *	</pre>
			 *
			 * If you want the first of November to be displayed as a non-working day and also as "Type10," the following should be done:
			 *	<pre>
			 *	new DateTypeRange({
			 *		startDate: UI5Date.getInstance(2023, 10, 1),
			 *		type: CalendarDayType.Type10,
			 *		secondaryType: CalendarDayType.NonWorking
			 *	})
			 *	</pre>
			 *
			 * You can use only one of the following types for a given date: <code>sap.ui.unified.CalendarDayType.NonWorking</code>,
			 * <code>sap.ui.unified.CalendarDayType.Working</code> or <code>sap.ui.unified.CalendarDayType.None</code>.
			 * Assigning more than one of these values in combination for the same date will lead to unpredictable results.
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
			header : {type : "sap.ui.core.Control", multiple : false, visibility : "hidden"},
			secondMonthHeader : {type : "sap.ui.unified.calendar.Header", multiple : false, visibility : "hidden"},
			month : {type : "sap.ui.unified.calendar.Month", multiple : true, visibility : "hidden"},
			monthPicker : {type : "sap.ui.unified.calendar.MonthPicker", multiple : false, visibility : "hidden"},
			yearPicker : {type : "sap.ui.unified.calendar.YearPicker", multiple : false, visibility : "hidden"},
			yearRangePicker : {type : "sap.ui.unified.calendar.YearPicker", multiple : false, visibility : "hidden"}

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
			 * Week number selection changed. By default, clicking on the week number will select the corresponding week.
			 * If the week has already been selected, clicking the week number will deselect it.
			 *
			 * The default behavior can be prevented using the <code>preventDefault</code> method.
			 *
			 * <b>Note</b> Works for Gregorian calendars only and when <code>intervalSelection</code> is set to 'true'.
			 * @since 1.56
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
					 */
					weekDays: {type: "sap.ui.unified.DateRange"}
				}
			}
		}
	}, renderer: CalendarRenderer});

	/*
	 * There are different modes (stored in this._iMode)
	 * The standard is 0, that means a calendar showing a calendar with the days of one month.
	 * If 1 a month picker is shown.
	 * if 2 a year picker is shown.
	 * If 3 a year range picker is shown.
	 */

	// Holds the possible values for the "_currentPicker" property.
	var CURRENT_PICKERS = {
		MONTH: "month", // represents the "month" aggregation
		MONTH_PICKER: "monthPicker",  // represents the "monthPicker" aggregation
		YEAR_PICKER: "yearPicker",  // represents the "yearPicker" aggregation
		YEAR_RANGE_PICKER: "yearRangePicker"  // represents the "yearRangePicker" aggregation
	};

	Calendar.prototype.init = function(){
		this._iBreakPointTablet = Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0];
		this._iBreakPointDesktop = Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1];
		this._iBreakPointLargeDesktop = Device.media._predefinedRangeSets[Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[2];

		this._iColumns = 1; // default columns for the calendar

		// Render the monthPicker first to get the length of the current month name. The _currentPicker property will
		// be aligned to month in the first onAfterRendering.
		this.setProperty("_currentPicker", CURRENT_PICKERS.MONTH_PICKER);

		// to format year with era in Japanese
		this._oYearFormat = DateFormat.getDateInstance({format: "y", calendarType: this._getPrimaryCalendarType()});

		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

		this._oMinDate = CalendarUtils._minDate(this._getPrimaryCalendarType());
		this._oMaxDate = CalendarUtils._maxDate(this._getPrimaryCalendarType());

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
		this._initializeMonthPicker();
		this._initializeYearPicker();
		this._initializeYearRangePicker();

		this._resizeProxy = _handleResize.bind(this);
		//marker, controlled from the DatePicker & checked in the CalendarRenderer
		//when used in a DatePicker, in mobile there is no cancel button
		this._bSkipCancelButtonRendering = false;
		this._bActionTriggeredFromSecondHeader = false;
	};

	Calendar.prototype.exit = function(){

		if (this._sInvalidateMonth) {
			clearTimeout(this._sInvalidateMonth);
		}

		if (this._afterHeaderRenderAdjustCSS) {
			this.removeDelegate(this._afterHeaderRenderAdjustCSS);
			this._afterHeaderRenderAdjustCSS = null;
		}

		if (this._afterSecondHeaderRenderAdjustCSS) {
			this.removeDelegate(this._afterSecondHeaderRenderAdjustCSS);
			this._afterSecondHeaderRenderAdjustCSS = null;
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
		oHeader.attachEvent("pressCurrentDate", this._handleCurrentDate, this);
		oHeader.attachEvent("pressButton1", this._handleButton1, this);
		oHeader.attachEvent("pressButton2", this._handleButton2, this);
		oHeader.attachEvent("pressButton3", this._handleButton1, this);
		oHeader.attachEvent("pressButton4", this._handleButton2, this);

		this._afterHeaderRenderAdjustCSS = this._createOnAfterRenderingDelegate(oHeader);

		oHeader.addDelegate(this._afterHeaderRenderAdjustCSS);

		this.setAggregation("header",oHeader);
	};

	Calendar.prototype._createOnAfterRenderingDelegate = function(oHeader) {
		return {
			onAfterRendering: function() {
				if (oHeader.getVisible() && !oHeader.getVisibleButton1()) {
					oHeader.$().find(".sapUiCalHeadB2").addClass("sapUiCalSingleYearButton");
				}

				if (oHeader.getVisible() && !oHeader._getVisibleButton3()) {
					this._isTwoMonthsInTwoColumns() && oHeader.$().find(".sapUiCalHeadB4").addClass("sapUiCalSingleYearButton");
				}
			}.bind(this)
		};
	};

	Calendar.prototype._initializeSecondMonthHeader = function() {
		// TODO: move the for initializing the second month header in the setMonths
		// and init it only if it is needed (2 months in calendar) not its ancestors.
		var oSecondMonthHeader = new Header(this.getId() + "--SecondMonthHead", {visible: false});

		oSecondMonthHeader.addStyleClass("sapUiCalHeadSecondMonth");
		oSecondMonthHeader.attachEvent("pressPrevious", this._handlePrevious, this);
		oSecondMonthHeader.attachEvent("pressNext", this._handleNext, this);
		oSecondMonthHeader.attachEvent("pressButton1", this._handleButton1, this);
		oSecondMonthHeader.attachEvent("pressButton2", this._handleButton2, this);

		this._afterSecondHeaderRenderAdjustCSS = this._createOnAfterRenderingDelegate(oSecondMonthHeader);

		oSecondMonthHeader.addDelegate(this._afterSecondHeaderRenderAdjustCSS);

		this.setAggregation("secondMonthHeader", oSecondMonthHeader);
	};

	Calendar.prototype._initializeMonthPicker = function() {
		var oMonthPicker = new MonthPicker(this.getId() + "--MP");
		oMonthPicker._bCalendar = true;
		oMonthPicker.attachEvent("select", this._selectMonth, this);
		oMonthPicker.attachEvent("pageChange", _handleMonthPickerPageChange, this);
		oMonthPicker._bNoThemeChange = true;
		this.setAggregation("monthPicker", oMonthPicker);

		oMonthPicker._setSelectedDatesControlOrigin(this);
	};

	Calendar.prototype._initializeYearPicker = function() {
		var oYearPicker = new YearPicker(this.getId() + "--YP");
		oYearPicker._bCalendar = true;
		oYearPicker.attachEvent("select", this._selectYear, this);
		oYearPicker.attachEvent("pageChange", _handleYearPickerPageChange, this);
		this.setAggregation("yearPicker", oYearPicker);

		oYearPicker._setSelectedDatesControlOrigin(this);
	};

	Calendar.prototype._initializeYearRangePicker = function() {
		var oYearRangePicker = new YearRangePicker(this.getId() + "--YRP");
		oYearRangePicker.attachEvent("select", this._selectYearRange, this);
		oYearRangePicker.setPrimaryCalendarType(this._getPrimaryCalendarType());
		this.setAggregation("yearRangePicker", oYearRangePicker); // do not invalidate
	};

	Calendar.prototype._createMonth = function(sId){
		var oMonth = new Month(sId, {width: "100%", calendarWeekNumbering: this.getCalendarWeekNumbering()});
		oMonth._bCalendar = true;
		oMonth.attachEvent("datehovered", this._handleDateHovered, this);
		oMonth.attachEvent("weekNumberSelect", this._handleWeekNumberSelect, this);

		return oMonth;
	};

	Calendar.prototype._handleWeekNumberSelect = function (oEvent) {
		const oWeekDays = oEvent.getParameter("weekDays"),
			bExecuteDefault = this.fireWeekNumberSelect({
				weekNumber: oEvent.getParameter("weekNumber"),
				weekDays: oWeekDays
			}),
			iSelectedWeekMonth = oWeekDays.getStartDate() && oWeekDays.getStartDate().getMonth(),
			iCurrentMonth = oEvent.getSource().getDate() && oEvent.getSource().getDate().getMonth();
		const bOtherMonth = iSelectedWeekMonth !== iCurrentMonth;

		this._focusDate(CalendarDate.fromLocalJSDate(oWeekDays.getStartDate(), this._getPrimaryCalendarType()), bOtherMonth, false, false);

		if (!bExecuteDefault) {
			oEvent.preventDefault();
		}

		return this;
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

		var aMonths = this.getAggregation("month"),
			oCalDate,
			oMonthDate = aMonths[0].getDate(),
			oFocusedDate = this._getFocusedDate();

		if (this.getFirstDayOfWeek() !== -1 && this.getCalendarWeekNumbering() !== "Default") {
			Log.warning("Both properties firstDayOfWeek and calendarWeekNumbering should not be used at the same time!");
		}

		if (aMonths.length > 1 && oMonthDate) {
			// for more than one month - re-render same months (if already rendered once)
			oCalDate = CalendarDate.fromLocalJSDate(oMonthDate, this._getPrimaryCalendarType());
		} else if (aMonths.length > 1) {
			oCalDate = _determineFirstMonthDate.call(this, this._getFocusedDate());
		} else  {
			oCalDate = oFocusedDate;
		}

		for (var i = 0; i < aMonths.length; i++) {
			oMonthDate = new CalendarDate(oCalDate);
			if (i > 0) {
				oMonthDate.setMonth(oMonthDate.getMonth() + i, 1);
			}
			var oDisplayDate = oMonthDate;
			if (oFocusedDate.getYear() === oMonthDate.getYear() && oFocusedDate.getMonth() === oMonthDate.getMonth()) {
				oDisplayDate = oFocusedDate;
			}
			aMonths[i].displayDate(oDisplayDate.toLocalJSDate());
			aMonths[i].setShowWeekNumbers(this.getShowWeekNumbers());
		}

		if (this._getMonthPicker()) {
			this._setDisabledMonths(oFocusedDate.getYear(), this._getMonthPicker());
		}

		this._updateHeader(oCalDate);

		this._updateHeadersButtons();
		this._adjustYearRangeDisplay();

		this._updateLegendParent();
		if (this.getInitialFocusedDate()) {
			this.focusDate(this.getInitialFocusedDate());
		}
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

	/**
	 * Sets the parent control instance which contains the specialDates
	 * to the Calendar control instance
	 * @ui5-restricted sap.m.DatePicker
	 * @private
	 * @param {*} oControl containing the special dates
	 */
	Calendar.prototype._setSpecialDatesControlOrigin = function (oControl) {
		this._oSpecialDatesControlOrigin = oControl;
	};

	/**
	 * If used inside DatePicker get the value from the parent
	 * To not have sync issues...
	 * @returns {sap.ui.unified.DateTypeRange[]} Array with special dates
	 */
	Calendar.prototype.getSpecialDates = function(){

		var oParent = this.getParent();

		if (this._oSpecialDatesControlOrigin) {
			return this._oSpecialDatesControlOrigin.getSpecialDates();
		}

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
	 * Sets the locale for the DatePicker
	 * only for internal use
	 * @param {string} sLocale  new value for <code>locale</code>
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @private
	 */
	Calendar.prototype.setLocale = function(sLocale){

		if (this._sLocale != sLocale) {
			this._sLocale = sLocale;
			this._oLocaleData = undefined;
			this.invalidate();
			this._toggleTwoMonthsInTwoColumnsCSS();
		}

		return this;

	};

	/**
	 * Gets the used locale for the DatePicker
	 * only for internal use
	 * @returns {string} sLocale
	 * @private
	 */
	Calendar.prototype.getLocale = function(){

		if (!this._sLocale) {
			this._sLocale = new Locale(Formatting.getLanguageTag()).toString();
		}

		return this._sLocale;

	};
	/**
	 * Gets the focused date
	 * @returns {sap.ui.unified.calendar.CalendarDate} The focused date
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
		this._oFocusedDate = new CalendarDate(oDate, this._getPrimaryCalendarType());
	};

	/**
	 * Displays and sets the focused date of the calendar.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate A date instance for focused date
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	Calendar.prototype.focusDate = function(oDate) {

		_displayDate.call(this, oDate, false);
		this._addMonthFocusDelegate();

		return this;

	};

	/**
	 * Displays a date in the calendar but doesn't set the focus.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate date instance for focused date
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @since 1.28.0
	 * @public
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
	 * @returns {Date|module:sap/ui/core/date/UI5Date} date instance for start date
	 * @since 1.34.1
	 * @public
	 */
	Calendar.prototype.getStartDate = function() {

		var oStartDate;

		if (this.getDomRef()) {
			// if rendered just use the date of the first month
			var aMonths = this.getAggregation("month");
			oStartDate = CalendarDate.fromLocalJSDate(aMonths[0].getDate(), this._getPrimaryCalendarType());
		} else {
			// if not rendered use the focused date
			oStartDate = new CalendarDate(this._getFocusedDate());
		}

		oStartDate.setDate(1);

		return oStartDate.toLocalJSDate();

	};

	Calendar.prototype.setCalendarWeekNumbering = function(sCalendarWeekNumbering) {
		var aMonths = this.getAggregation("month");

		this.setProperty("calendarWeekNumbering", sCalendarWeekNumbering);

		for (var i = 0; i < aMonths.length; i++) {
			aMonths[i].setProperty("calendarWeekNumbering", sCalendarWeekNumbering);
		}

		return this;
	};

	Calendar.prototype.setMonths = function(iMonths) {

		this._bDateRangeChanged = undefined; // to force rerendering
		this.setProperty("months", iMonths); // rerender
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
				oMonth.setCalendarWeekNumbering(this.getCalendarWeekNumbering());
				oMonth.setSecondaryCalendarType(this._getSecondaryCalendarType());
				this.addAggregation("month", oMonth);
			}
			this._toggleTwoMonthsInTwoColumnsCSS();
		} else if (aMonths.length > iMonths){
			for (i = aMonths.length; i > iMonths; i--) {
				oMonth = this.removeAggregation("month", i - 1);
				oMonth.destroy();
			}
			if (iMonths == 1) {
				// back to standard case -> initialize month width
				this._bInitMonth = true;
			}
			this._toggleTwoMonthsInTwoColumnsCSS();
		}

		if (iMonths > 1 && aMonths[0].getDate()) {
			// remove date from first month to recalculate months date before rendering
			aMonths[0].setProperty("date", null, true);
		}

		aMonths = this.getAggregation("month");
		aMonths.forEach((oMonth) => oMonth.setProperty("_renderMonthWeeksOnly", iMonths > 1));

		return this;

	};

	Calendar.prototype.setPrimaryCalendarType = function(sCalendarType) {

		var aMonths = this.getAggregation("month"),
			oMonth,
			oMonthPicker,
			oYearPicker,
			oYearRangePicker,
			i;

		this.setProperty("primaryCalendarType", sCalendarType);

		this._oYearFormat = DateFormat.getDateInstance({format: "y", calendarType: sCalendarType});

		if (this._oFocusedDate) {
			this._oFocusedDate = new CalendarDate(this._oFocusedDate, sCalendarType);
		}
		this._oMinDate =  new CalendarDate(this._oMinDate, sCalendarType);
		this._oMaxDate =  new CalendarDate(this._oMaxDate, sCalendarType);

		// set Months property directly to force rerender
		for (i = 0; i < aMonths.length; i++) {
			oMonth = aMonths[i];
			oMonth.setPrimaryCalendarType(sCalendarType);
		}

		if (!this._getSucessorsPickerPopup()) {
			oMonthPicker = this._getMonthPicker();
			oMonthPicker.setPrimaryCalendarType(sCalendarType);

			oYearPicker = this._getYearPicker();
			oYearPicker.setPrimaryCalendarType(sCalendarType);

			oYearRangePicker = this.getAggregation("yearRangePicker");
			oYearRangePicker.setPrimaryCalendarType(sCalendarType);
		}

		return this;

	};

	Calendar.prototype.setSecondaryCalendarType = function(sCalendarType){
		var iColumnsPerRow = sCalendarType ? 2 : 3, // when there are two calendar types, the months should be displayed in two columns
			oMonthPicker = this._getMonthPicker();

		this.setProperty("secondaryCalendarType", sCalendarType);

		this._oYearFormatSecondary = DateFormat.getDateInstance({format: "y", calendarType: sCalendarType});

		// set Months property directly to force rerender
		var aMonths = this.getAggregation("month");
		for (var i = 0; i < aMonths.length; i++) {
			var oMonth = aMonths[i];
			oMonth.setSecondaryCalendarType(sCalendarType);
		}

		oMonthPicker.setSecondaryCalendarType(sCalendarType);
		oMonthPicker.setColumns(iColumnsPerRow);
		this._getYearPicker().setSecondaryCalendarType(sCalendarType);
		this._getYearRangePicker().setSecondaryCalendarType(sCalendarType);

		return this;

	};

	Calendar.prototype._getPrimaryCalendarType = function(){
		return this.getProperty("primaryCalendarType") || Formatting.getCalendarType();
	};

	/**
	 * Returns if there is secondary calendar type set and if it is different from the primary one.
	 * @returns {string} if there is secondary calendar type set and if it is different from the primary one
	 */
	Calendar.prototype._getSecondaryCalendarType = function(){
		var sSecondaryCalendarType = this.getSecondaryCalendarType();

		if (sSecondaryCalendarType === this._getPrimaryCalendarType()) {
			return undefined;
		}

		return sSecondaryCalendarType;
	};

	/**
	 * Returns the aggregation of the active Header.
	 *
	 * @returns {Object} Aggregation of Header.
	 * @private
	 */
	Calendar.prototype._getActiveHeaderAggregation = function(){

		if (this._bActionTriggeredFromSecondHeader && this._isTwoMonthsInOneColumn()) {
			return this.getAggregation("secondMonthHeader");
		} else {
			return this.getAggregation("header");
		}
	};


	Calendar.prototype._saveTriggeredHeader = function(oEvent){

		if (oEvent.getSource().sParentAggregationName === "secondMonthHeader" || oEvent.sId === "pressButton3" || oEvent.sId === "pressButton4") {
			this._bActionTriggeredFromSecondHeader = true;
		} else {
			this._bActionTriggeredFromSecondHeader = false;
		}
	};

	/**
	 * Sets a minimum date for the calendar.
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate a date instance
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	Calendar.prototype.setMinDate = function(oDate){
		var aMonths = this.getAggregation("month"),
			sPrimaryCalendarType = this._getPrimaryCalendarType(),
			iMinYear;

		if (deepEqual(oDate, this.getMinDate())) {
			return this;
		}

		if (!oDate) {
			// restore default
			this._oMinDate = CalendarUtils._minDate(sPrimaryCalendarType);

		} else {
			CalendarUtils._checkJSDateObject(oDate);

			this._oMinDate = CalendarDate.fromLocalJSDate(oDate, sPrimaryCalendarType);

			var iYear = this._oMinDate.getYear();
			CalendarUtils._checkYearInValidRange(iYear, sPrimaryCalendarType);

			if (this._oMaxDate.isBefore(this._oMinDate)) {
				Log.warning("minDate > maxDate -> maxDate set to end of the month", this);
				this._oMaxDate = CalendarDate.fromLocalJSDate(oDate, sPrimaryCalendarType);
				this._oMaxDate.setDate(CalendarUtils._daysInMonth(this._oMaxDate));
				this.setProperty("maxDate", this._oMaxDate.toLocalJSDate(), true);
			}

			this._setMinMaxDateExtend(CalendarDate.fromLocalJSDate(oDate, sPrimaryCalendarType));
		}

		this.setProperty("minDate", oDate, false); // re-render months because visualization can change

		if (!this._getSucessorsPickerPopup()) {
			iMinYear = this._oMinDate.getYear();

			this._getYearPicker()._oMinDate.setYear(iMinYear);
			this._getYearRangePicker()._oMinDate.setYear(iMinYear);
		}

		for (var i = 0; i < aMonths.length; i++) {
			aMonths[i]._oMinDate = new CalendarDate(this._oMinDate);
		}

		return this;

	};

	/**
	 * Sets a maximum date for the calendar.
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate a date instance
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	Calendar.prototype.setMaxDate = function(oDate){

		var aMonths = this.getAggregation("month"),
			sPrimaryCalendarType = this._getPrimaryCalendarType(),
			iMaxYear;

		if (deepEqual(oDate, this.getMaxDate())) {
			return this;
		}

		if (!oDate) {
			// restore default
			this._oMaxDate = CalendarUtils._maxDate(sPrimaryCalendarType);
		} else {
			CalendarUtils._checkJSDateObject(oDate);

			this._oMaxDate = CalendarDate.fromLocalJSDate(oDate, sPrimaryCalendarType);

			var iYear = this._oMaxDate.getYear();
			CalendarUtils._checkYearInValidRange(iYear, sPrimaryCalendarType);

			if (this._oMinDate.isAfter(this._oMaxDate)) {
				Log.warning("maxDate < minDate -> minDate set to begin of the month", this);
				this._oMinDate = CalendarDate.fromLocalJSDate(oDate, sPrimaryCalendarType);
				this._oMinDate.setDate(1);
				this.setProperty("minDate", this._oMinDate.toLocalJSDate(), true);
			}

			this._setMinMaxDateExtend(CalendarDate.fromLocalJSDate(oDate, sPrimaryCalendarType));
		}

		this.setProperty("maxDate", oDate, false); // re-render months because visualization can change
		if (!this._getSucessorsPickerPopup()) {
			iMaxYear = this._oMaxDate.getYear();

			this._getYearPicker()._oMaxDate.setYear(iMaxYear);
			this._getYearRangePicker()._oMaxDate.setYear(iMaxYear);
		}

		for (var i = 0; i < aMonths.length; i++) {
			aMonths[i]._oMaxDate = new CalendarDate(this._oMaxDate);
		}

		return this;

	};

	/**
	 * Sets the visibility of the Current date button in the calendar.
	 *
	 * @param {boolean} bShow whether the Today button will be displayed
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	Calendar.prototype.setShowCurrentDateButton = function(bShow){
		this.getAggregation("header").setVisibleCurrentDateButton(bShow);
		return this.setProperty("showCurrentDateButton", bShow);
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
				Log.warning("focused date is not between [minDate - maxDate] -> refocus to the new max/min date: " + oDate.toString(), this);
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
		} else  {
			return false;
		}

	};

	/**
	 * Getter for monthPicker aggregation.
	 * @returns {sap.ui.unified.calendar.MonthPicker} The monthPicker control instance
	 * @private
	 */
	Calendar.prototype._getMonthPicker = function () {
		return this.getAggregation("monthPicker");
	};

	/**
	 * Getter for yearPicker aggregation.
	 * @returns {sap.ui.unified.calendar.YearPicker} The yearPicker control instance
	 * @private
	 */
	Calendar.prototype._getYearPicker = function () {
		return this.getAggregation("yearPicker");
	};

	/**
	 * Getter for yearPicker aggregation.
	 * @returns {sap.ui.unified.calendar.YearRangePicker} The yearRangePicker control instance
	 * @private
	 */
	Calendar.prototype._getYearRangePicker = function () {
		return this.getAggregation("yearRangePicker");
	};

	Calendar.prototype.onclick = function(oEvent){
		var oEventTarget = oEvent.target;

		if (oEvent.isMarked("delayedMouseEvent") ) {
			return;
		}

		if (oEventTarget.id == this.getId() + "-cancel") {
			this.onsapescape(oEvent);
		}

	};

	Calendar.prototype.onmousedown = function(oEvent){

		if (oEvent.cancelable) {
			oEvent.preventDefault(); // to prevent focus set outside of DatePicker
		}
		oEvent.setMark("cancelAutoClose");

	};

	Calendar.prototype.onsapescape = function(oEvent) {

		this.fireCancel();
		this._closePickers();
		this._addMonthFocusDelegate();

		if (!this._getSucessorsPickerPopup()) {
			this._setHeaderText(this._getFocusedDate());
		}
	};

	Calendar.prototype.onsapshow = function(oEvent){
		var iKC = oEvent.which || oEvent.keyCode;

		if (this._bPoupupMode && iKC !== KeyCodes.F4) {
			this._closePickers();
			this._addMonthFocusDelegate();
			this.fireCancel();

			oEvent.preventDefault(); // otherwise IE opens the address bar history

		}

	};

	// Handles F4 (Opens Month Picker) or Shift+F4(Opens Year Picker)
	Calendar.prototype.onkeydown = function(oEvent) {
		var iKC = oEvent.which || oEvent.keyCode,
			bShift = oEvent.shiftKey;

		// if there is a popup for picking dates, we should not handle F4
		if (iKC !== KeyCodes.F4) {
			return;
		}

		oEvent.preventDefault(); //ie expands the address bar on F4

		switch (this._iMode) {
			case 0:
				if (bShift) {
					this._showYearPicker();
				} else {
					this._showMonthPicker();
				}
				break;
			case 1:
				if (bShift) {
					this._showYearPicker();
				}
				break;
			case 2:
				if (bShift) {
					this._showYearRangePicker();
				}
				break;
			default:
		}
	};


	Calendar.prototype.onsaphide = Calendar.prototype.onsapshow;

	Calendar.prototype.getFocusDomRef = function(){

		// set focus on the day
		var oMonth = this._oSelectedMonth ? this._oSelectedMonth : this.getAggregation("month")[0],
			oMonthPicker = this._getMonthPicker(),
			oYearPicker = this._getYearPicker(),
			oYearRangePicker = this._getYearRangePicker();

		switch (this._iMode) {
			case 0: return oMonth.getFocusDomRef();
			case 1: return oMonthPicker.getFocusDomRef();
			case 2: return oYearPicker.getFocusDomRef();
			case 3: return oYearRangePicker.getFocusDomRef();
			default: return;
		}

	};

	Calendar.prototype.onThemeChanged = function() {
		var oMonthPicker,
			args = arguments;
		//If the calendar is not yet rendered we cannot perform the theme change operations, which include DOM manipulation
		if (!this.getDomRef()) {
			return;
		}

		this._bNamesLengthChecked = undefined;
		if (!this._getSucessorsPickerPopup()) {
			var fnCheckNamesLengthAfterRendering = {
				onAfterRendering: function () {
					oMonthPicker.onThemeChanged( args );
					oMonthPicker._bNoThemeChange = true;
					_checkNamesLength.call(this);
					this._bLongMonth = oMonthPicker._bLongMonth;
					this._closePickers();
					oMonthPicker.removeEventDelegate(fnCheckNamesLengthAfterRendering);
				}
			};
			oMonthPicker = this._getMonthPicker();
			this._showMonthPicker(true);
			oMonthPicker._bNoThemeChange = false;
			oMonthPicker.addEventDelegate(fnCheckNamesLengthAfterRendering, this);
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
			oCalDate = CalendarDate.fromLocalJSDate(aMonths[0].getDate(), this._getPrimaryCalendarType());
		} else {
			oCalDate = this._getFocusedDate();
		}
		this._setHeaderText(oCalDate);
		this._setPrimaryHeaderMonthButtonText();
		this._toggleTwoMonthsInTwoColumnsCSS();
	};

	Calendar.prototype._updateLegendParent = function(){
		var sLegend = this.getLegend(),
			oLegend = Element.getElementById(sLegend);

		oLegend && oLegend._setParent(this);
	};

	/**
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate A date to be used for the header buttons
	 * @private
	 */
	Calendar.prototype._updateHeader = function(oDate){

		this._setHeaderText(oDate);
		switch (this._iMode) {
			case 0: // date picker
				this._togglePrevNext(oDate, true);
				break;
			case 1: // month picker
				this._togglePrevNext(oDate, false);
				break;
			case 2: // year picker
			case 3: // year range picker
				this._togglePrevNexYearPicker();
				break;
			// no default
		}

	};

	/**
	 * Enables/Disables previous and next buttons in month or month picker header.
	 *
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

		var oCheckDate = new CalendarDate(oDate, this._getPrimaryCalendarType());

		if (this._iMode === 1 && iMonths > 1) {
			oCheckDate = _determineFirstMonthDate.call(this, oDate);
			oCheckDate.setMonth(oCheckDate.getMonth() + iMonths - 1);
			oCheckDate.setDate(CalendarUtils._daysInMonth(oCheckDate));
		} else {
			oCheckDate.setDate(CalendarUtils._daysInMonth(oCheckDate));
		}

		var iYear = oCheckDate.getYear();
		var iMonth = oCheckDate.getMonth();

		if ((this._iMode === 0 || this._iMode === 1) && iMonths > 1) {
			iMonth += iMonths - 1;
		}

		if (iYear > iYearMax || (iYear === iYearMax && ( !bCheckMonth || iMonth >= iMonthMax ))
				|| ((this._iMode === 0 || this._iMode === 1) && this._getSucessorsPickerPopup())) {
			oHeader.setEnabledNext(false);
		} else {
			oHeader.setEnabledNext(true);
		}

		if (this._iMode === 1 && iMonths > 1) {
			oCheckDate.setMonth(oCheckDate.getMonth() - iMonths + 1, 1);
		} else {
			oCheckDate.setDate(1); // check the first day of the month for previous (needed for islamic date)
		}

		iYear = oCheckDate.getYear();
		iMonth = oCheckDate.getMonth();

		if (iYear < iYearMin || (iYear == iYearMin && ( !bCheckMonth || iMonth <= iMonthMin ))
				|| (this._iMode == 1 && this._getSucessorsPickerPopup())) {
			oHeader.setEnabledPrevious(false);
		} else  {
			oHeader.setEnabledPrevious(true);
		}

	};

	/**
	 * Enables/Disables previous and next buttons in the year picker header.
	 * This function assumes there is a "yearPicker" aggregation.
	 * So callers must take care.
	 * @returns {void}
	 * @private
	 */
	Calendar.prototype._togglePrevNexYearPicker = function(){
		var oYearRangePicker = this.getAggregation("yearRangePicker"),
			oYearPicker = this._getYearPicker(),
			sPrimaryType = this._getPrimaryCalendarType(),
			oMinDate = new CalendarDate(this._oMinDate, sPrimaryType),
			oMaxDate = new CalendarDate(this._oMaxDate, sPrimaryType),
			oHeader = this.getAggregation("header"),
			iRangeSize = 1,
			oLowDate,
			oHighDate,
			iYears,
			oDate;

		if (this._iMode === 3) {
			iYears = oYearRangePicker.getYears();
			iRangeSize = oYearRangePicker.getRangeSize();
			oLowDate = new CalendarDate(oYearRangePicker.getProperty("_middleDate"));
			oHighDate = new CalendarDate(oLowDate);

			oLowDate.setYear(oLowDate.getYear() - (iRangeSize * iYears) / 2);
			oHighDate.setYear(oHighDate.getYear() + (iRangeSize * iYears) / 2 - 1);
		} else {
			iYears = oYearPicker.getYears();
			oDate = oYearPicker.getProperty("_middleDate") ? oYearPicker.getProperty("_middleDate") : CalendarDate.fromLocalJSDate(UI5Date.getInstance());
			oLowDate = new CalendarDate(oDate);
			oHighDate = new CalendarDate(oDate);

			oLowDate.setYear(oLowDate.getYear() - (iYears / 2));
			oHighDate.setYear(oHighDate.getYear() + (iYears / 2) - 1);
		}

		oHeader.setEnabledNext(oHighDate.getYear() < oMaxDate.getYear());
		oHeader.setEnabledPrevious(oLowDate.getYear() > oMinDate.getYear());
	};

	/**
	 * Handles navigation to previous date.
	 * This function assumes there are both "yearPicker" & "monthPicker" aggregation available.
	 * So callers must take care.
	 * @returns {void}
	 * @private
	 */
	Calendar.prototype._handlePrevious = function(){

		var oFocusedDate = this._getFocusedDate(),
			iMonths = _getMonths.call(this),
			oFirstMonthDate,
			bSkipFocus = false;

		switch (this._iMode) {
		case 0: // day picker
			if (iMonths > 1) {
				oFirstMonthDate = CalendarDate.fromLocalJSDate(this.getAggregation("month")[0].getDate(), this._getPrimaryCalendarType());
				oFirstMonthDate.setDate(1);
				this._setFocusedDate(oFirstMonthDate);
				oFocusedDate = this._getFocusedDate();
			} else  {
				oFocusedDate.setDate(1);
			}

			oFocusedDate.setDate(oFocusedDate.getDate() - 1);
			this._renderMonth(bSkipFocus, false);
			this._addMonthFocusDelegate();
			break;

		case 1: // month picker
			oFocusedDate.setYear(oFocusedDate.getYear() - 1);
			this._updateHeadersYearPrimaryText(this._oYearFormat.format(oFocusedDate.toUTCJSDate(), true));
			this._updateHeadersYearAdditionalTextHelper();
			this._togglePrevNext(oFocusedDate);
			this._setDisabledMonths(oFocusedDate.getYear());
			var oMonthPicker = this._getMonthPicker();
			oMonthPicker._setYear(oFocusedDate.getYear());
			oMonthPicker._setDate(oFocusedDate);
			oMonthPicker.invalidate();
			this.setProperty("_currentPicker", CURRENT_PICKERS.MONTH_PICKER);
			break;

		case 2: // year picker
			this._getYearPicker().previousPage();
			this._togglePrevNexYearPicker();
			this._updateHeadersYearPrimaryText(this._getYearString());
			this._updateHeadersYearAdditionalTextHelper();
			break;

		case 3: // year range picker
			this.getAggregation("yearRangePicker").previousPage();
			this._togglePrevNexYearPicker();
			this._updateHeadersYearPrimaryText(this._getYearString());
			break;
			// no default
		}

	};

	/**
	 * Handles navigation to next date.
	 * This function assumes there are both "yearPicker" & "monthPicker" aggregation available.
	 * So callers must take care.
	 * @returns {void}
	 * @private
	 */
	Calendar.prototype._handleNext = function(){

		var oFocusedDate = this._getFocusedDate(),
			iMonths = _getMonths.call(this),
			oFirstMonthDate;

		switch (this._iMode) {
		case 0: // day picker
			if (iMonths > 1) {
				oFirstMonthDate = CalendarDate.fromLocalJSDate(this.getAggregation("month")[0].getDate(), this._getPrimaryCalendarType());
				oFirstMonthDate.setMonth(oFirstMonthDate.getMonth(),1);
				this._setFocusedDate(oFirstMonthDate);
				oFocusedDate = this._getFocusedDate();
			}
			oFocusedDate.setMonth(oFocusedDate.getMonth() + 1, 1);
			this._renderMonth(false, false);
			this._addMonthFocusDelegate();
			break;

			case 1: // month picker
			oFocusedDate.setYear(oFocusedDate.getYear() + 1);
			this._updateHeadersYearPrimaryText(this._oYearFormat.format(oFocusedDate.toUTCJSDate(), true));
			this._updateHeadersYearAdditionalTextHelper();
			this._togglePrevNext(oFocusedDate);
			this._setDisabledMonths(oFocusedDate.getYear());
			var oMonthPicker = this._getMonthPicker();
			oMonthPicker._setYear(oFocusedDate.getYear());
			oMonthPicker._setDate(oFocusedDate);
			oMonthPicker.invalidate();
			this.setProperty("_currentPicker", CURRENT_PICKERS.MONTH_PICKER);
			break;

		case 2: // year picker
			this._getYearPicker().nextPage();
			this._togglePrevNexYearPicker();
			this._updateHeadersYearPrimaryText(this._getYearString());
			this._updateHeadersYearAdditionalTextHelper();
			break;

		case 3: // year range picker
			this.getAggregation("yearRangePicker").nextPage();
			this._togglePrevNexYearPicker();
			this._updateHeadersYearPrimaryText(this._getYearString());
			break;
			// no default
		}

	};

	/**
	 * Calculates the year picker button text in secondary calendar type.
	 * @private
	 */
	Calendar.prototype._updateHeadersYearAdditionalTextHelper = function() {
		if (!this._getSecondaryCalendarType()){
			return;
		}
		var oSecondaryYears = this._getDisplayedSecondaryYears();
		if (oSecondaryYears.start.getYear() === oSecondaryYears.end.getYear()) {
			this._updateHeadersYearAdditionalText(this._oYearFormatSecondary.format(oSecondaryYears.start.toUTCJSDate(), true));
		} else {
			var oLocaleData = this._getLocaleData();
			var sPattern = oLocaleData.getIntervalPattern();
			var sSecondaryMonthInfo = sPattern.replace(/\{0\}/, this._oYearFormatSecondary.format(oSecondaryYears.start.toUTCJSDate(), true))
				.replace(/\{1\}/, this._oYearFormatSecondary.format(oSecondaryYears.end.toUTCJSDate(), true));
			this._updateHeadersYearAdditionalText(sSecondaryMonthInfo);
		}
	};

	/**
	 * Handles navigation to today.
	 *
	 * @private
	 */
	Calendar.prototype._handleCurrentDate = function() {
		var oNow = UI5Date.getInstance(),
			oMaxDate = this.getMaxDate(),
			oMinDate = this.getMinDate();

		this.setProperty("_currentPicker", CURRENT_PICKERS.MONTH);

		if (oMaxDate && oMaxDate.getTime() < oNow.getTime()) {
			this.focusDate(oMaxDate);
		} else if (oMinDate && oMinDate.getTime() > oNow.getTime()) {
			this.focusDate(oMinDate);
		} else {
			this.focusDate(oNow);
		}
	};

	Calendar.prototype._getYearString = function () {
		var oYearPicker = this._getYearPicker(),
			oYearPickerDomRef = oYearPicker.getDomRef(),
			oFocusedDate = this._getFocusedDate();

		if (oYearPicker && oYearPickerDomRef && oYearPickerDomRef.style.display === "") {
			oFocusedDate = oYearPicker.getProperty("_middleDate");
			oFocusedDate.setDate(1); // always use the first of the month to have stable year in Japanese calendar
		}
		// to render era in Japanese, UniversalDate is used, since CalendarDate.toUTCJSDate() will convert the date in Gregorian
		return this._oYearFormat.format(UniversalDate.getInstance(oFocusedDate.toUTCJSDate(), oFocusedDate.getCalendarType()), true);
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
		} else  {
			aMonths.push(iMonth);
		}

		return aMonths;

	};

	Calendar.prototype._getDisplayedSecondaryMonths = function(){

		var sPrimaryCalendarType = this._getPrimaryCalendarType(),
			sSecondaryCalendarType = this._getSecondaryCalendarType(),
			aMonths = this.getAggregation("month"),
			oFirstDate = CalendarDate.fromLocalJSDate(aMonths[0].getDate(), sPrimaryCalendarType),
			oLastDate = CalendarDate.fromLocalJSDate(aMonths[aMonths.length - 1].getDate(), sPrimaryCalendarType),
			iStartMonth, iEndMonth;

		oFirstDate.setDate(1);
		oFirstDate = new CalendarDate(oFirstDate, sSecondaryCalendarType);
		iStartMonth = oFirstDate.getMonth();

		oLastDate = CalendarDate.fromLocalJSDate(aMonths[aMonths.length - 1].getDate(), sPrimaryCalendarType);
		oLastDate.setDate(CalendarUtils._daysInMonth(oLastDate));
		oLastDate = new CalendarDate(oLastDate, sSecondaryCalendarType);
		iEndMonth = oLastDate.getMonth();

		return {start: iStartMonth, end: iEndMonth};

	};

	/**
	 * Calculates the first and last displayed date.
	 * @returns {object} two values - start and end date
	 */
	Calendar.prototype._getDisplayedSecondaryYears = function(){
		var sPrimaryCalendarType = this._getPrimaryCalendarType(),
			sSecondaryCalendarType = this._getSecondaryCalendarType(),
			oFirstDate, oLastDate, oFocusedDate, oDate, aMonths, oYearPicker, iHalfRange;
		switch (this._iMode) {
			case 0:
				aMonths = this.getAggregation("month");

				oFirstDate = CalendarDate.fromLocalJSDate(aMonths[0].getDate(), sPrimaryCalendarType);
				oFirstDate.setDate(1);
				oFirstDate = new CalendarDate(oFirstDate, sSecondaryCalendarType);

				oLastDate = CalendarDate.fromLocalJSDate(aMonths[aMonths.length - 1].getDate(), sPrimaryCalendarType);
				oLastDate.setDate(CalendarUtils._daysInMonth(oLastDate));
				oLastDate = new CalendarDate(oLastDate, sSecondaryCalendarType);

				break;
			case 1:
				oFocusedDate = this._getFocusedDate();
				oDate = new CalendarDate(oFocusedDate, sPrimaryCalendarType);
				oDate.setMonth(0, 1);
				oFirstDate = new CalendarDate(oDate, sPrimaryCalendarType);
				oFirstDate = new CalendarDate(oFirstDate, sSecondaryCalendarType);

				oDate.setYear(oDate.getYear() + 1); // move to first day of next year
				oDate.setDate(oDate.getDate() - 1); // go back one day to receive last day in previous year
				oLastDate = new CalendarDate(oDate, sPrimaryCalendarType);
				oLastDate = new CalendarDate(oLastDate, sSecondaryCalendarType);

				break;
			case 2:
				oYearPicker = this._getYearPicker();
				iHalfRange = oYearPicker.getYears() / 2 - 1;
				oFocusedDate = oYearPicker.getProperty("_middleDate");

				oFirstDate = new CalendarDate(oFocusedDate, sPrimaryCalendarType);
				oFirstDate.setYear(oFocusedDate.getYear() - iHalfRange - 1);
				oFirstDate.setMonth(0, 1);
				oFirstDate = new CalendarDate(oFirstDate, sSecondaryCalendarType);

				oLastDate = new CalendarDate(oFocusedDate, sPrimaryCalendarType);
				oLastDate.setYear(oLastDate.getYear() + iHalfRange + 1); // adjust year
				oFirstDate.setMonth(0, 1);
				oLastDate.setDate(oLastDate.getDate() - 1); // go back one day to receive last day in previous year
				oLastDate = new CalendarDate(oLastDate, sSecondaryCalendarType);

				break;
			default:
		}

		return {start: oFirstDate, end: oLastDate};
	};

	Calendar.prototype._closePickers = function () {
		this.setProperty("_currentPicker", CURRENT_PICKERS.MONTH);
		// show again hidden month button
		this._togglePrevNext(this._getFocusedDate(), true);

		if (this.getAggregation("month").length > 1) {
			this.getAggregation("month").forEach(function(oMonth) {
				oMonth._oItemNavigation.iActiveTabIndex = 0;
			});
		}
	};

	Calendar.prototype._setDisabledMonths = function(iYear, oMonthPicker) {

		var iMinMonth = 0;
		var iMaxMonth = 11;

		if (iYear === this._oMinDate.getYear()) {
			iMinMonth = this._oMinDate.getMonth();
		}


		if (iYear === this._oMaxDate.getYear()) {
			iMaxMonth = this._oMaxDate.getMonth();
		}

		if (!oMonthPicker) {
			oMonthPicker = this._getMonthPicker();
		}
		oMonthPicker.setMinMax(iMinMonth, iMaxMonth);

	};

	/**
	* Handles focusing of a date by clicking on it or with keyboard navigation.
	* @param {Object} oEvent the event
	* @private
	*/
	Calendar.prototype._handleFocus = function (oEvent) {

		var oDate = CalendarDate.fromLocalJSDate(oEvent.getParameter("date"), this._getPrimaryCalendarType()),
			bOtherMonth = oEvent.getParameter("otherMonth"),
			bRestoreOldDate = oEvent.getParameter("restoreOldDate");

		if (this.getIntervalSelection()) {
			this.getAggregation("month").forEach(function(oMonth) {
				oMonth.setProperty("_focusedDate", oDate);
			});
		}

		if (bRestoreOldDate) {
			// in multimonth mode stay at the last focused date
			if (!deepEqual(this._getFocusedDate(), oDate)) {
				this._renderMonth(false, true);
			}
		} else {
			this._focusDate(oDate, bOtherMonth, false, true);
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
	 * @param {boolean} bNoEvent if set, no startDateChange event is fired
	 */
	Calendar.prototype._renderMonth = function (bSkipFocus, bNoEvent){
		var oDate = this._getFocusedDate(),
			aMonths = this.getAggregation("month"),
			oMonth,
			oMonthDate,
			oFirstDate = _determineFirstMonthDate.call(this, new CalendarDate(oDate, this._getPrimaryCalendarType())),
			i = 0,
			bMonthContainsDate = aMonths[0].checkDateFocusable(oDate.toLocalJSDate()),
			bFireStartDateChange = !bNoEvent && !bMonthContainsDate;

		for (i = 0; i < aMonths.length; i++) {
			oMonth = aMonths[i];
			oMonthDate = new CalendarDate(oFirstDate, this._getPrimaryCalendarType());
			oMonthDate.setMonth(oFirstDate.getMonth() + i);
			if (!bSkipFocus && CalendarUtils._isSameMonthAndYear(oMonthDate, oDate)) {
				oMonth.setDate(oDate.toLocalJSDate());
			} else {
				oMonth.displayDate(oMonthDate.toLocalJSDate());
			}
		}

		// change month and year
		this._updateHeader(oFirstDate);
		this._setPrimaryHeaderMonthButtonText();
		this._toggleTwoMonthsInTwoColumnsCSS();

		if (bFireStartDateChange) {
			this.fireStartDateChange();
		}

	};

	/**
	 * Updates visibility of active Header month button
	 * Only for internal use
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @private
	 */
	Calendar.prototype._updateMonthButtonVisibility = function(){
		var oHeader = this._getActiveHeaderAggregation();
		if (this._bActionTriggeredFromSecondHeader) {
			this._isTwoMonthsInOneColumn() ?
				oHeader.setVisibleButton1(!oHeader.getVisibleButton1()) : oHeader._setVisibleButton3(!oHeader._getVisibleButton3());

		} else {
			oHeader.setVisibleButton1(false);
		}
		return this;
	};

	/**
	 * Shows an embedded Month Picker.
	 * This function assumes there is a "monthPicker" & "yearPicker" aggregation.
	 * So callers must take care.
	 * @param {boolean} bSkipFocus determines whether to skip focusing
	 * @returns {void}
	 * @private
	 */
	Calendar.prototype._showMonthPicker = function (bSkipFocus) {

		var oDate = this._getFocusedDate(),
			oMonthPicker = this._getMonthPicker(),
			oSecondDate = new CalendarDate(this._getFocusedDate());

		// hide month button
		this._updateActiveHeaderYearButtonVisibility();
		this._updateMonthButtonVisibility();

		this.setProperty("_currentPicker", CURRENT_PICKERS.MONTH_PICKER);

		if (this._bActionTriggeredFromSecondHeader) {
			oSecondDate.setDate(1);
			oSecondDate.setMonth(oSecondDate.getMonth() + 1);
			oMonthPicker._setYear(oSecondDate.getYear());
			oMonthPicker._setDate(oSecondDate);
		} else {
			oMonthPicker._setYear(oDate.getYear());
			oMonthPicker._setDate(oDate);
		}

		if (!bSkipFocus && this._bActionTriggeredFromSecondHeader) {
			oMonthPicker.setMonth(oSecondDate.getMonth());
			this._setDisabledMonths(oSecondDate.getYear(), oMonthPicker);
		} else if (!bSkipFocus){
			oMonthPicker.setMonth(oDate.getMonth());
			this._setDisabledMonths(oDate.getYear(), oMonthPicker);
		}

		if (this.getAggregation("month").length > 1 && this.getProperty("_currentPicker") == CURRENT_PICKERS.MONTH_PICKER) {
			this.getAggregation("month").forEach(function(oMonth) {
				oMonth._oItemNavigation.iActiveTabIndex = -1;
			});
		}

		this._togglePrevNext(oDate, true);
		this._setHeaderText(this._getFocusedDate());
	};

	/**
	 * Shows an embedded year Picker.
	 * This function assumes there is a "yearPicker" aggregation.
	 * So callers must take care.
	 * @returns {void}
	 * @private
	 */
	Calendar.prototype._showYearPicker = function () {
		var oDate = this._getFocusedDate(),
			oYearPicker = this._getYearPicker();

		this.setProperty("_currentPicker", CURRENT_PICKERS.YEAR_PICKER);

		oYearPicker.setDate(oDate.toLocalJSDate());

		this._togglePrevNexYearPicker();

		// hide year button
		if (this._isTwoMonthsInOneColumn()) {
			this._updateActiveHeaderYearButtonVisibility();
		} else {
			this._updateActiveHeaderYearButtonVisibility();
		}

		if (this._bActionTriggeredFromSecondHeader && this.getAggregation("month")[1].getDate().getFullYear() > this._getFocusedDate().getYear()) {
			var oSecondHeaderDate = oDate.toLocalJSDate();
			oSecondHeaderDate.setFullYear(oSecondHeaderDate.getFullYear() + 1);
			oYearPicker.setDate(oSecondHeaderDate);
			this._updateHeadersYearPrimaryText(this._getYearString());
		} else {
			oYearPicker.setDate(oDate.toLocalJSDate());
			this._updateHeadersYearPrimaryText(this._getYearString());
		}

		if (this.getAggregation("month").length > 1 && this.getProperty("_currentPicker") == CURRENT_PICKERS.YEAR_PICKER) {
			this.getAggregation("month").forEach(function(oMonth) {
				oMonth._oItemNavigation.iActiveTabIndex = -1;
			});
		}
	};

	/**
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date to be focused
	 * @param {boolean} bOtherMonth Whether the date to be focused is outside the visible date range
	 * @param {boolean} bNoEvent Whether startDateChange event should be fired
	 * @param {boolean} bAfterFocus Whether function call is triggered from a focus event
	 * @private
	 */
	Calendar.prototype._focusDate = function (oDate, bOtherMonth, bNoEvent, bAfterFocus){

		// if a date should be focused thats out of the borders -> focus the border
		var oFocusedDate,
			bChanged = false,
			bFireStartDateChange = false,
			aMonths = this.getAggregation("month"),
			i;

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

		this._setFocusedDate(oFocusedDate);

		if (bAfterFocus && !this._focusDateExtend) {
			for (i = 0; i < aMonths.length; ++i) {
				if (aMonths[i].checkDateFocusable(oFocusedDate.toLocalJSDate())) {
					aMonths[i].setDate(oFocusedDate.toLocalJSDate());
					aMonths[i]._focusDate(oFocusedDate);
					return;
				}
			}
		}

		if (bChanged || bOtherMonth) {
			this._renderMonth(false, bNoEvent);
			this._addMonthFocusDelegate();
		}

		if (bFireStartDateChange) {
			this.fireStartDateChange();
		}

	};

	/**
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate A date to be used for the header buttons
	 * @private
	 * @return {object} text for the month and the year button to the header
	 */
	Calendar.prototype._setHeaderText = function(oDate){

		// sets the text for the month and the year button to the header

		var oHeader = this.getAggregation("header");
		var oSecondMonthHeader = this.getAggregation("secondMonthHeader");
		var oLocaleData = this._getLocaleData();
		var aMonthNames = [];
		var aMonthNamesWide = [];
		var aMonthNamesSecondary = [];
		var aMonthNamesSecondaryWide = [];
		var sAriaLabel;
		var bShort = false;
		var sFirstMonthName;
		var sLastMonthName;
		var sText;
		var sYear;
		var sPattern;
		var sPrimaryCalendarType = this._getPrimaryCalendarType();
		var sSecondaryCalendarType = this._getSecondaryCalendarType();
		var sSecondaryMonthInfo = "";

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

			// always use wide month names for the screen reader
			aMonthNamesSecondaryWide = oLocaleData.getMonthsStandAlone("wide", sSecondaryCalendarType);

			var oSecondaryMonths = this._getDisplayedSecondaryMonths();
			if (oSecondaryMonths.start === oSecondaryMonths.end) {
				sText = aMonthNamesSecondary[oSecondaryMonths.start];
				sSecondaryMonthInfo = aMonthNamesSecondaryWide[oSecondaryMonths.start];
			} else {
				sPattern = oLocaleData.getIntervalPattern();
				sText = sPattern.replace(/\{0\}/, aMonthNamesSecondary[oSecondaryMonths.start]).replace(/\{1\}/, aMonthNamesSecondary[oSecondaryMonths.end]);
				sSecondaryMonthInfo = sPattern.replace(/\{0\}/, aMonthNamesSecondaryWide[oSecondaryMonths.start]).replace(/\{1\}/, aMonthNamesSecondaryWide[oSecondaryMonths.end]);
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
			if (this._isTwoMonthsInTwoColumns() || this._isTwoMonthsInOneColumn()) {
				// set single month if the calendar displays 2 months in one or two column(s)
				sText = sFirstMonthName;
			}
		} else {
			sText = sFirstMonthName;
			sAriaLabel = aMonthNamesWide[aMonths[0]] || sText;
		}

		if (!this._getSucessorsPickerPopup() && sSecondaryMonthInfo) {
			// Add info for the secondary month
			sAriaLabel += ", " + sSecondaryMonthInfo;
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
		if (oFirstDate.getMonth() === 11){
			this._updateHeadersYearPrimaryText(sYear, (parseInt(sYear) + 1).toString() );
		} else {
			this._updateHeadersYearPrimaryText(sYear, sYear);
		}

		if (sSecondaryCalendarType && this._iMode !== 3) { // in year range picker there is no header buttons, so no need to update their text
			this._updateHeadersYearAdditionalTextHelper();
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

	// handlers for sub-controls
	Calendar.prototype._handleButton1 = function(oEvent) {
		if (this._iMode != 1) {
			this._saveTriggeredHeader(oEvent);
			this._showMonthPicker();
		} else {
			this.setProperty("_currentPicker", CURRENT_PICKERS.MONTH);
			this._addMonthFocusDelegate();
		}
	};

	Calendar.prototype._addMonthFocusDelegate = function() {
		var aMonths = this.getAggregation("month"),
			oCalDate = aMonths[0].getDate(),
			oFocusedDate = this._getFocusedDate(),
			oFocusMonthDelegate = {
				onAfterRendering: function() {
					this._oItemNavigation.focusItem(this._oItemNavigation.getFocusedIndex(), undefined, true);
					this.removeDelegate(oFocusMonthDelegate);
				}
			},
			oMonthDate,
			oFocusedMonth;

		if (aMonths.length > 1 && oMonthDate) {
			// for more than one month - re-render same months (if already rendered once)
			oCalDate = CalendarDate.fromLocalJSDate(oMonthDate, this._getPrimaryCalendarType());
		} else if (aMonths.length > 1) {
			oCalDate = _determineFirstMonthDate.call(this, this._getFocusedDate());
		} else {
			oCalDate = oFocusedDate;
		}

		for (var i = 0; i < aMonths.length; i++) {
			oMonthDate = new CalendarDate(oCalDate);
			if (i > 0) {
				oMonthDate.setMonth(oMonthDate.getMonth() + i, 1);
			}
			if (oFocusedDate.getYear() === oMonthDate.getYear() && oFocusedDate.getMonth() === oMonthDate.getMonth()) {
				oFocusedMonth = this.getAggregation("month")[i];
				oFocusedMonth.addDelegate(oFocusMonthDelegate, oFocusedMonth);
			}
		}
	};

	Calendar.prototype._handleButton2 = function(oEvent) {
		if (this._iMode <= 1) {
			this._saveTriggeredHeader(oEvent);
			this._showYearPicker();
		 } else {
			this._showYearRangePicker();
		}
	};

	Calendar.prototype._selectMonth = function () {
		var oFocusedDate = new CalendarDate(this._getFocusedDate(), this._getPrimaryCalendarType()),
			oMonthPicker = this._getMonthPicker(),
			iFocusedMonth = oMonthPicker.getProperty("_focusedMonth"),
			iMonth = (iFocusedMonth || iFocusedMonth === 0) ? iFocusedMonth : oMonthPicker.getMonth(),
			oSecondCalDate = CalendarDate.fromLocalJSDate(UI5Date.getInstance(), this._getPrimaryCalendarType());

			oSecondCalDate = oMonthPicker._iYear ?
				oSecondCalDate
					.setYear(oMonthPicker._iYear)
					.setMonth(iMonth - 1, 1) :
				new CalendarDate(this._getFocusedDate().getYear(), iMonth - 1, 1);

		if (_getMonths.call(this) > 1) {
			if (this._bActionTriggeredFromSecondHeader && oSecondCalDate.getYear() >= CalendarUtils._minDate(this._getPrimaryCalendarType()).getYear()) {
				oFocusedDate.setYear(oSecondCalDate.getYear());
				iMonth = oSecondCalDate.getMonth();
			} else if (oFocusedDate.getYear() === CalendarUtils._maxDate(this._getPrimaryCalendarType()).getYear() && iMonth === 11) {
				iMonth -= 1;
			}
		}

		oFocusedDate.setMonth(iMonth);

		if (iMonth != oFocusedDate.getMonth()){
			// day did not exist in this month (e.g. 31) -> go to last day of month
			oFocusedDate.setDate(0);
		}

		this._focusDate(oFocusedDate, true, false, false);
		this._closePickers();
		this._addMonthFocusDelegate();

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
		var oFocusedDate = new CalendarDate(this._getFocusedDate(), this._getPrimaryCalendarType()),
			oFocusedMonth = oFocusedDate.getMonth(),
			oYearPicker = this._getYearPicker(),
			oDate = CalendarDate.fromLocalJSDate(oYearPicker.getDate(), this._getPrimaryCalendarType());

		// to keep day and month stable also for islamic date
		if (!this._bActionTriggeredFromSecondHeader){
			oDate.setMonth(oFocusedMonth, oFocusedDate.getDate());
		} else {
			oDate.setYear(oFocusedMonth === 11 ? oDate.getYear() - 1 : oDate.getYear());
			oDate.setMonth(oFocusedMonth, oFocusedDate.getDate());
		}

		oFocusedDate = oDate;

		this._focusDate(oFocusedDate, true, false, false);
		this._closePickers();
		this._addMonthFocusDelegate();
		this._setHeaderText(this._getFocusedDate());
	};

	Calendar.prototype.setProperty = function () {
		var sPropName = arguments[0],
			sPropValue = arguments[1];

		Control.prototype.setProperty.apply(this, arguments);

		if (sPropName === "_currentPicker") {
			switch (sPropValue) {
				case "month": this._iMode = 0; break;
				case "monthPicker": this._iMode = 1; break;
				case "yearPicker": this._iMode = 2; break;
				case "yearRangePicker": this._iMode = 3; break;
				default: return;
			}
		}

		return this;
	};

	Calendar.prototype._selectYearRange = function() {
		var oYearRangePicker = this.getAggregation("yearRangePicker"),
			oHeader = this.getAggregation("header"),
			iRangeSize = oYearRangePicker.getRangeSize(),
			sPrimaryCalendarType = this._getPrimaryCalendarType(),
			oStartDate = CalendarDate.fromLocalJSDate(oYearRangePicker.getDate(), sPrimaryCalendarType),
			oEndDate = new CalendarDate(oStartDate.getYear() + iRangeSize - 1, 0, 1, sPrimaryCalendarType),
			oFocusedDate = this._getFocusedDate(),
			sStartDate, sEndDate;

		oFocusedDate.setYear(oStartDate.getYear() + iRangeSize / 2);
		oStartDate.setMonth(0, 1); // always use the first of the month to have stable year in Japanese calendar
		if (oFocusedDate.isBefore(this._oMinDate)) {
			oFocusedDate = new CalendarDate(this._oMinDate, this._getPrimaryCalendarType());
		} else if (oFocusedDate.isAfter(this._oMaxDate)){
			oFocusedDate = new CalendarDate(this._oMaxDate, this._getPrimaryCalendarType());
		}
		this._setFocusedDate(oFocusedDate);

		this._showYearPicker();

		// to render era in Japanese, UniversalDate is used, since CalendarDate.toUTCJSDate() will convert the date in Gregorian
		sStartDate = this._oYearFormat.format(UniversalDate.getInstance(oStartDate.toUTCJSDate(), oStartDate.getCalendarType()), true);
		sEndDate = this._oYearFormat.format(UniversalDate.getInstance(oEndDate.toUTCJSDate(), oEndDate.getCalendarType()), true);

		oHeader.setTextButton2(sStartDate + " - " + sEndDate);
		oHeader._setTextButton4(sStartDate + " - " + sEndDate);
	};

	Calendar.prototype._showYearRangePicker = function () {
		var oYearRangePicker = this.getAggregation("yearRangePicker"),
			oYearPicker = this._getYearPicker(),
			oRangeMidDate = CalendarDate.fromLocalJSDate(oYearPicker.getFirstRenderedDate(), this._getPrimaryCalendarType());

		this.setProperty("_currentPicker", CURRENT_PICKERS.YEAR_RANGE_PICKER);

		oRangeMidDate.setYear(oRangeMidDate.getYear() + Math.floor(oYearRangePicker.getRangeSize() / 2));
		oYearRangePicker.setDate(oRangeMidDate.toLocalJSDate());
		this._togglePrevNexYearPicker();
	};

	/**
	 * Sets columns to display
	 * @param iColumns Number of columns to display
	 * @private
	 * @return {this} Reference to <code>this</code> for method chaining
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
	 * Updates visibility of active Header Year button
	 * Only for internal use
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @private
	 */
	Calendar.prototype._updateActiveHeaderYearButtonVisibility = function(){
		var oHeader = this._getActiveHeaderAggregation();
		if (this._bActionTriggeredFromSecondHeader) {
			this._isTwoMonthsInOneColumn() ?
				oHeader.setVisibleButton1(!oHeader.getVisibleButton1()) : oHeader._setVisibleButton3(!oHeader._getVisibleButton3());
		} else {
			oHeader.setVisibleButton1(!oHeader.getVisibleButton1());
		}
		return this;
	};

	Calendar.prototype._updateHeadersButtonsHelper = function (bButton1, bButton2, bButton3, bButton4) {
		var oHeader = this.getAggregation("header"),
			oSecondMonthHeader = this.getAggregation("secondMonthHeader");

		oHeader.setVisibleButton1(bButton1);
		oHeader.setVisibleButton2(bButton2);
		oHeader._setVisibleButton3(bButton3);
		oHeader._setVisibleButton4(bButton4);

		if (oSecondMonthHeader.getVisible()) {
			oSecondMonthHeader.setVisibleButton1(bButton1);
			oSecondMonthHeader.setVisibleButton2(bButton2);
			oSecondMonthHeader._setVisibleButton3(bButton3);
			oSecondMonthHeader._setVisibleButton4(bButton4);
		}
	};

	/**
	 * Update visibility of the Buttons in the Header depending on the number of columns and months
	 * @private
	 */
	Calendar.prototype._updateHeadersButtons = function () {
		var oSecondMonthHeader = this.getAggregation("secondMonthHeader");

		if (this._isTwoMonthsInOneColumn()) {
			// Two months displayed in one column
			// Than we need the second header
			// and hide the third and fourth buttons of the first header
			oSecondMonthHeader.setVisible(true);

			if (this._iMode === 2) {
				this._updateHeadersButtonsHelper(false, true, false, false);
			} else if (this._iMode === 3) {
				this._updateHeadersButtonsHelper(false, false, false, false);
			} else {
				this._updateHeadersButtonsHelper(true, true, false, false);
			}
		} else if (this._isTwoMonthsInTwoColumns()) {
			// Two months displayed in two columns
			// Than we need to hide the second header
			// and show third and fourth buttons of the first
			oSecondMonthHeader.setVisible(false);
			if (this._iMode === 2) {
				this._bActionTriggeredFromSecondHeader ?
					this._updateHeadersButtonsHelper(true, true, false, true) :
					this._updateHeadersButtonsHelper(false, true, true, true);
			} else if (this._iMode === 3) {
				this._updateHeadersButtonsHelper(false, false, false, false);
			} else if (this._iMode === 1) {
				this._bActionTriggeredFromSecondHeader ?
					this._updateHeadersButtonsHelper(true, true, false, true) :
					this._updateHeadersButtonsHelper(false, true, true, true);
			} else {
				this._updateHeadersButtonsHelper(true, true, true, true);
			}
		} else {
			// Keep the other use cases untouched
			// No second header
			// No third and fourth button
			oSecondMonthHeader.setVisible(false);
			if (this._iMode === 1) {
				this._updateHeadersButtonsHelper(false, true, false, false);
			} else if (this._iMode === 2) {
				this._updateHeadersButtonsHelper(false, true, false, false);
			} else if (this._iMode === 3) {
				this._updateHeadersButtonsHelper(false, false, false, false);
			} else {
				this._updateHeadersButtonsHelper(true, true, false, false);
			}
		}

		if (this._getSucessorsPickerPopup()) {
			this.getAggregation("header").setVisibleButton2(false);
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
			if (new Locale(Localization.getLanguageTag()).getLanguage().toLowerCase() === "ja" ||
				new Locale(Localization.getLanguageTag()).getLanguage().toLowerCase() === "zh") {
				this.addStyleClass("sapUiCalTwoMonthsTwoColumnsJaZh");
				this.removeStyleClass("sapUiCalTwoMonthsTwoColumns");
			} else {
				this.addStyleClass("sapUiCalTwoMonthsTwoColumns");
				this.removeStyleClass("sapUiCalTwoMonthsTwoColumnsJaZh");
			}
		} else {
			this.removeStyleClass("sapUiCalTwoMonthsTwoColumnsJaZh");
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

	Calendar.prototype._updateHeadersYearPrimaryText = function (sFirstHeaderYear, sSecondHeaderYear) {
		var oYearPicker = this._getYearPicker(),
			oHeader = this.getAggregation("header"),
			oSecondMonthHeader = this.getAggregation("secondMonthHeader"),
			sFirstHeaderText = sFirstHeaderYear,
			sSecondHeaderText = sSecondHeaderYear || sFirstHeaderYear,
			sPrimaryCalendarType = this._getPrimaryCalendarType();

		if (this._iMode === 2 && oYearPicker) {

			var oDate = oYearPicker.getProperty("_middleDate") ? oYearPicker.getProperty("_middleDate") : oYearPicker._getDate(),
				oFirstDate = new CalendarDate(oDate, sPrimaryCalendarType),
				oMinYear = CalendarUtils._minDate(this._getPrimaryCalendarType()).getYear(),
				oMaxYear = CalendarUtils._maxDate(this._getPrimaryCalendarType()).getYear(),
				oSecondDate,
				sFirstYear,
				sSecondYear;

				oFirstDate.setDate(1); // always use the first of the month to have stable year in Japanese calendar
				oFirstDate.setYear(oFirstDate.getYear() - Math.floor(oYearPicker.getYears() / 2));
				if (oFirstDate.getYear() < oMinYear) {
					oFirstDate.setYear(oMinYear);
				} else if (oFirstDate.getYear() + oYearPicker.getYears() > oMaxYear) {
					oFirstDate.setYear(oMaxYear - oYearPicker.getYears() + 1);
				}

				oSecondDate = new CalendarDate(oFirstDate, sPrimaryCalendarType);
				oSecondDate.setYear(oSecondDate.getYear() + oYearPicker.getYears() - 1);

				// to render era in Japanese, UniversalDate is used, since CalendarDate.toUTCJSDate() will convert the date in Gregorian
				sFirstYear = this._oYearFormat.format(UniversalDate.getInstance(oFirstDate.toUTCJSDate(), oFirstDate.getCalendarType()), true);
				sSecondYear = this._oYearFormat.format(UniversalDate.getInstance(oSecondDate.toUTCJSDate(), oSecondDate.getCalendarType()), true);

				if (this._bActionTriggeredFromSecondHeader) {
					sSecondHeaderText = sFirstYear + " - " + sSecondYear;
				} else {
					sFirstHeaderText = sFirstYear + " - " + sSecondYear;
				}
		}

		oHeader._setTextButton4(sSecondHeaderText);
		oHeader._setAriaLabelButton4(sSecondHeaderText);
		oSecondMonthHeader.setTextButton2(sSecondHeaderText);
		oHeader.setTextButton2(sFirstHeaderText);
	};

	Calendar.prototype._updateHeadersYearAdditionalText = function (sYear) {
		var oHeader = this.getAggregation("header"),
			oSecondMonthHeader = this.getAggregation("secondMonthHeader");

		oHeader.setAdditionalTextButton2(sYear);
		oHeader._setAdditionalTextButton4(sYear);
		oSecondMonthHeader.setAdditionalTextButton2(sYear);
	};

	Calendar.prototype._adjustYearRangeDisplay = function() {
		var oYearRangePicker = this.getAggregation("yearRangePicker"),
			sLang = Localization.getLanguage().toLocaleLowerCase(),
			sPrimaryCalendarType = this._getPrimaryCalendarType(),
			sSecondaryCalendarType = this._getSecondaryCalendarType(),
			bKorean = sLang == "ko" || sLang == "ko-kr",
			bJapaneseCalendar = sPrimaryCalendarType === CalendarType.Japanese || sSecondaryCalendarType === CalendarType.Japanese,
			bGregorianCalendar = sPrimaryCalendarType === CalendarType.Gregorian
				&& (sSecondaryCalendarType === CalendarType.Gregorian || !sSecondaryCalendarType);

		if (!this._getSucessorsPickerPopup()) {
			// An evaluation about the count of year cells that could fit in the sap.ui.unified.calendar.YearRangePicker
			// has to be made based not only on the sap.ui.core.CalendarType, but also on the language configuration.
			// Based on those two criteria a couple of groups with different year cells count would be indicated and we
			// could cover those scenarios with visual tests afterwards. Currently only the scenario with korean language
			// is covered.
			if (bJapaneseCalendar) {
				oYearRangePicker.setColumns(1);
				oYearRangePicker.setYears(4);
			} else if (bKorean || !bGregorianCalendar) {
				oYearRangePicker.setColumns(2);
				oYearRangePicker.setYears(8);
			} else if (bGregorianCalendar) {
				oYearRangePicker.setColumns(3);
				oYearRangePicker.setYears(9);
			}
		}
	};

	Calendar.prototype._getSpecialDates = function(){
		var oParent = this.getParent();

		if (this._oSpecialDatesControlOrigin) {
			return this._oSpecialDatesControlOrigin._getSpecialDates();
		}

		if (oParent && oParent._getSpecialDates) {
			return oParent._getSpecialDates();
		} else {
			var specialDates = this.getSpecialDates();
			for (var i = 0; i < specialDates.length; i++) {
				var bNeedsSecondTypeAdding = specialDates[i].getSecondaryType() === library.CalendarDayType.NonWorking
					&& specialDates[i].getType() !== library.CalendarDayType.NonWorking;
				if (bNeedsSecondTypeAdding) {
					var newSpecialDate = new DateTypeRange();
					newSpecialDate.setType(specialDates[i].getSecondaryType());
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

	function _determineFocusedDate(){

		var aSelectedDates = this.getSelectedDates();
		var sCalendarType = this._getPrimaryCalendarType();
		if (aSelectedDates && aSelectedDates[0] && aSelectedDates[0].getStartDate()) {
			// selected dates are provided -> use first one to focus
			this._oFocusedDate = CalendarDate.fromLocalJSDate(aSelectedDates[0].getStartDate(), sCalendarType);
		} else {
			// use current date
			this._oFocusedDate = CalendarDate.fromLocalJSDate(UI5Date.getInstance(), sCalendarType);
		}

		if (this._oFocusedDate.isBefore(this._oMinDate)) {
			this._oFocusedDate = new CalendarDate(this._oMinDate, sCalendarType);
		} else if (this._oFocusedDate.isAfter(this._oMaxDate)){
			this._oFocusedDate = new CalendarDate(this._oMaxDate, sCalendarType);
		}

	}

	function _handleResize(oEvent){
		var iWidth = oEvent.size.width;

		if (iWidth <= 0) {
			// only if visible at all
			return;
		}

		if (iWidth === this._iPrevWidth) {
			return;
		}

		this._iPrevWidth = iWidth;

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

			this.invalidate();
		}

		this._setPrimaryHeaderMonthButtonText();
		this._toggleTwoMonthsInTwoColumnsCSS();
	}

	/**
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date, which first date of month will be determined
	 * @returns {sap.ui.unified.calendar.CalendarDate} The first date of the month
	 * @private
	 */
	function _determineFirstMonthDate(oDate){

		var oFirstDate = new CalendarDate(oDate, this._getPrimaryCalendarType());
		oFirstDate.setDate(1);

		var iMonths = _getMonths.call(this); // to use validation
		if (iMonths <= 12) {
			// only if intervals fit into a year -> otherwise just display the months according to the date
			var iMonth = oDate.getMonth();
			if (12 % iMonths > 0 && iMonth + iMonths > 11) {
				// do not show months over year borders if possible
				iMonth = 12 - iMonths;
			}
			oFirstDate.setMonth(iMonth);
		}

		return oFirstDate;

	}

	function _checkNamesLength(){

		var oMonthPicker,
			aMonths,
			oDate;

		if (!this._bNamesLengthChecked) {
			// check month names (don't change focus)
			oMonthPicker = this._getMonthPicker();
			this._bLongMonth = oMonthPicker._bLongMonth;
			this._bNamesLengthChecked = true;

			this.setProperty("_currentPicker", CURRENT_PICKERS.MONTH);

			if (!this._bLongMonth) {
				// update short month name (long name used by default)
				aMonths = this.getAggregation("month");

				if (aMonths.length > 1) {
					oDate = CalendarDate.fromLocalJSDate(aMonths[0].getDate(), this._getPrimaryCalendarType());
				} else {
					oDate = this._getFocusedDate();
				}

				this._setHeaderText(oDate);
				this._setPrimaryHeaderMonthButtonText();
				this._toggleTwoMonthsInTwoColumnsCSS();
			}
		}

	}

	/**
	 * @param {Object} oDate The date to be displayed
	 * @param {boolean} bSkipFocus Whether the date is focused
	 * @private
	 */
	function _displayDate(oDate, bSkipFocus) {

		var oCalDate,
			sPrimaryCalendarType = this._getPrimaryCalendarType(),
			iYear;

		if (!oDate) {
			return;
		}

		oCalDate = CalendarDate.fromLocalJSDate(oDate, sPrimaryCalendarType);

		iYear = oCalDate.getYear();
		CalendarUtils._checkYearInValidRange(iYear, sPrimaryCalendarType);

		if (CalendarUtils._isOutside(oCalDate, this._oMinDate, this._oMaxDate)) {
			throw new Error("Date must not be in valid range (minDate and maxDate); " + this);
		}

		this._setFocusedDate(oCalDate);

		if (this.getDomRef() && this._iMode == 0) {
			this._renderMonth(bSkipFocus, true); // fire no startDateChange event on programmatical change
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

	function _handleRenderMonth (oEvent){

		// fire internal event for DatePicker for with number of rendered days. If Calendar becomes larger maybe popup must change position
		this.fireEvent("_renderMonth", {days: oEvent.getParameter("days")});

	}

	function _handleSelect (oEvent){
		this._oSelectedMonth = oEvent.oSource;
		this.fireSelect();
	}


	function _handleBindMousemove (oEvent){
		var aMonths,
			oMonth,
			i;

		if (_getMonths.call(this) > 1) {
			aMonths = this.getAggregation("month");
			for (i = 0; i < aMonths.length; i++) {
				oMonth = aMonths[i];
				if (oMonth.getId() != oEvent.oSource.getId()) {
					oMonth._bindMousemove();
				}
			}
		}

	}

	function _handleUnbindMousemove (oEvent){
		var aMonths,
			oMonth,
			i;

		if (_getMonths.call(this) > 1) {
			aMonths = this.getAggregation("month");
			for (i = 0; i < aMonths.length; i++) {
				oMonth = aMonths[i];
				if (oMonth.getId() != oEvent.oSource.getId()) {
					oMonth._unbindMousemove();
				}
			}
		}

	}

	function _handleMonthPickerPageChange(oEvent) {
		var iOffset = oEvent.getParameter("offset");

		if (iOffset > 0) {
			this._handleNext(oEvent);
		}

		if (iOffset < 0) {
			this._handlePrevious(oEvent);
		}
	}

	function _handleYearPickerPageChange() {
		this._updateHeadersYearPrimaryText(this._getYearString());
	}

	return Calendar;

});