/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.Calendar.
sap.ui.define([
	'sap/ui/Device',
	'sap/ui/core/Control',
	'sap/ui/core/Locale',
	'sap/ui/core/LocaleData',
	'sap/ui/core/Renderer',
	'sap/ui/core/format/DateFormat',
	'./calendar/CalendarUtils',
	'./calendar/CustomYearPicker',
	'./calendar/Header',
	'./calendar/MonthsRow',
	'./calendar/YearPicker',
	'./calendar/CalendarDate',
	'./CalendarMonthIntervalRenderer',
	"sap/ui/dom/containsOrEquals",
	"sap/base/util/deepEqual",
	"sap/ui/core/Popup",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery",
	"sap/ui/unified/DateRange"
], function(
	Device,
	Control,
	Locale,
	LocaleData,
	Renderer,
	DateFormat,
	CalendarUtils,
	CustomYearPicker,
	Header,
	MonthsRow,
	YearPicker,
	CalendarDate,
	CalendarMonthIntervalRenderer,
	containsOrEquals,
	deepEqual,
	Popup,
	Log,
	jQuery,
	DateRange
) {
		"use strict";

	/*
	 * Inside the CalendarMonthInterval CalendarDate objects are used. But in the API JS dates are used.
	 * So conversion must be done on API functions.
	 */

	/**
	 * Constructor for a new <code>CalendarMonthInterval</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {Object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Calendar with granularity of months displayed in one line.
	 *
	 * <b>Note:</b> JavaScript Date objects are used to set and return the months, mark them as selected or as a special type.
	 * But the date part of the Date object is not used. If a Date object is returned the date will be set to the 1st of the corresponding month.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.32.0
	 * @alias sap.ui.unified.CalendarMonthInterval
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CalendarMonthInterval = Control.extend("sap.ui.unified.CalendarMonthInterval", /** @lends sap.ui.unified.CalendarMonthInterval.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Width of the <code>CalendarMonthInterval</code>. The width of the single months depends on this width.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Start date of the Interval as JavaScript Date object.
			 * The month of this Date will be the first month in the displayed row.
			 */
			startDate : {type : "object", group : "Data"},

			/**
			 * If set, interval selection is allowed
			 */
			intervalSelection : {type : "boolean", group : "Behavior", defaultValue : false},

			/**
			 * If set, only a single date or interval, if <code>intervalSelection</code> is enabled, can be selected
			 *
			 * <b>Note:</b> Selection of multiple intervals is not supported in the current version.
			 */
			singleSelection : {type : "boolean", group : "Behavior", defaultValue : true},

			/**
			 * Number of months displayed
			 *
			 * <b>Note:</b> On phones, the maximum number of months displayed in the row is always 6.
			 */
			months : {type : "int", group : "Appearance", defaultValue : 12},

			/**
			 * If set, the yearPicker opens on a popup
			 * @since 1.34.0
			 */
			pickerPopup : {type : "boolean", group : "Appearance", defaultValue : false},

			/**
			 * Minimum date that can be shown and selected in the Calendar. This must be a JavaScript date object.
			 *
			 * <b>Note:</b> If the <code>minDate</code> is set to be after the <code>maxDate</code>,
			 * the <code>maxDate</code> is set to the end of the month of the <code>minDate</code>.
			 * @since 1.38.0
			 */
			minDate : {type : "object", group : "Misc", defaultValue : null},

			/**
			 * Maximum date that can be shown and selected in the Calendar. This must be a JavaScript date object.
			 *
			 * <b>Note:</b> If the <code>maxDate</code> is set to be before the <code>minDate</code>,
			 * the <code>minDate</code> is set to the begin of the month of the <code>maxDate</code>.
			 * @since 1.38.0
			 */
			maxDate : {type : "object", group : "Misc", defaultValue : null}
		},
		aggregations : {

			/**
			 * Date ranges for selected dates of the <code>CalendarMonthInterval</code>.
			 *
			 * If <code>singleSelection</code> is set, only the first entry is used.
			 *
			 * <b>Note:</b> Even if only one day is selected, the whole corresponding month is selected.
			 */
			selectedDates : {type : "sap.ui.unified.DateRange", multiple : true, singularName : "selectedDate"},

			/**
			 * Date ranges with type to visualize special months in the <code>CalendarMonthInterval</code>.
			 * If one day is assigned to more than one type, only the first one will be used.
			 *
			 * <b>Note:</b> Even if only one day is set as a special day, the whole corresponding month is displayed in this way.
			 */
			specialDates : {type : "sap.ui.unified.DateTypeRange", multiple : true, singularName : "specialDate"},

			/**
			 * Hidden, for internal use only.
			 */
			header : {type : "sap.ui.unified.calendar.Header", multiple : false, visibility : "hidden"},
			monthsRow : {type : "sap.ui.unified.calendar.MonthsRow", multiple : false, visibility : "hidden"},
			yearPicker : {type : "sap.ui.unified.calendar.YearPicker", multiple : false, visibility : "hidden"},
			calendarPicker : {type : "sap.ui.unified.Calendar", multiple : false, visibility : "hidden"}

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
			 * Month selection was cancelled
			 */
			cancel : {},

			/**
			 * <code>startDate</code> was changed while navigation in <code>CalendarMonthInterval</code>
			 * @since 1.34.0
			 */
			startDateChange : {}
		}
	}});

	/*
	 * There are different modes (stored in this._iMode)
	 * The standard is 0, that means a calendar showing a calendar with the days of one month.
	 * If 1 a year picker is shown.
	 */

	CalendarMonthInterval.prototype.init = function(){

		this._iMode = 0; // months are shown

		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

		// to format year with era in Japanese
		this._oYearFormat = DateFormat.getDateInstance({format: "y"});

		this._oMinDate = CalendarUtils._minDate();
		this._oMaxDate = CalendarUtils._maxDate();

		this._initializeHeader();

		this._initializeMonthsRow();

		this._initilizeYearPicker();

		this._iDaysMonthsHead = 15; // if more than this number of months, year numbers are displayed on top of months

	};

	CalendarMonthInterval.prototype.exit = function(){

		if (this._sInvalidateContent) {
			clearTimeout(this._sInvalidateContent);
		}

	};

	CalendarMonthInterval.prototype.onBeforeRendering = function(){

		var oMonthsRow = this.getAggregation("monthsRow");
		var oDate = this._getFocusedDate();

		_updateHeader.call(this);

		//Do not focus the date. If this is needed after the control rendering, the MonthsRow.applyFocusInto will focus it.
		oMonthsRow.displayDate(oDate.toLocalJSDate());

	};

	CalendarMonthInterval.prototype._setAriaRole = function(sRole){
		var oMonthsRow = this.getAggregation("monthsRow");

		oMonthsRow._setAriaRole(sRole);
		oMonthsRow.invalidate();

		return this;
	};

	CalendarMonthInterval.prototype._initializeHeader = function() {
		var oHeader = new Header(this.getId() + "--Head", {
			visibleButton0: false,
			visibleButton1: false,
			visibleButton2: true
		});
		oHeader.attachEvent("pressPrevious", this._handlePrevious, this);
		oHeader.attachEvent("pressNext", this._handleNext, this);
		oHeader.attachEvent("pressButton2", _handleButton2, this);
		this.setAggregation("header",oHeader);
	};

	CalendarMonthInterval.prototype._initializeMonthsRow = function() {
		var oMonthsRow = new MonthsRow(this.getId() + "--MonthsRow");
		oMonthsRow.attachEvent("focus", _handleFocus, this);
		oMonthsRow.attachEvent("select", _handleSelect, this);
		oMonthsRow._bNoThemeChange = true;
		this.setAggregation("monthsRow", oMonthsRow);
	};

	CalendarMonthInterval.prototype._initilizeYearPicker = function() {
		var oYearPicker =  this._createYearPicker();
		this.setAggregation("yearPicker", oYearPicker);

		oYearPicker._setSelectedDatesControlOrigin(this);
	};

	CalendarMonthInterval.prototype._createYearPicker = function() {
		var oYearPicker = new YearPicker(this.getId() + "--YP", {
			columns: 0,
			years: 6 // default for 12 months
		});
		oYearPicker.attachEvent("select", _handleSelectYear, this);
		oYearPicker.attachEvent("pageChange", _handleYearPickerPageChange, this);

		oYearPicker._oMinDate.setYear(this._oMinDate.getYear());
		oYearPicker._oMaxDate.setYear(this._oMaxDate.getYear());

		return oYearPicker;
	};
	/**
	 * Lazily initializes the <code>Calendar</code> aggregation.
	 * @private
	 * @returns {sap.ui.unified.Calendar} The newly created control
	 */
	CalendarMonthInterval.prototype._getCalendarPicker = function (){
		var oCalPicker = this.getAggregation("calendarPicker");

		if (!oCalPicker) {
			oCalPicker = new CustomYearPicker(this.getId() + "--Cal");
			oCalPicker.setPopupMode(true);
			oCalPicker.attachEvent("select", _handleCalendarDateSelect, this);
			oCalPicker.attachEvent("cancel", function (oEvent) {
				this._oPopup.close();
				var oDomRefB2 = this.getAggregation("header").getDomRef("B2");
				if (oDomRefB2) {
					oDomRefB2.focus();
				}
			}, this);
			this.setAggregation("calendarPicker", oCalPicker, true);
		}
		return oCalPicker;
	};

	/*
	 * Sets a start date.
	 * @param {Date} oStartDate A JavaScript date
	 * @return {sap.ui.unified.CalendarMonthInterval} <code>this</code> for method chaining
	 */
	CalendarMonthInterval.prototype.setStartDate = function(oStartDate){

		CalendarUtils._checkJSDateObject(oStartDate);

		if (deepEqual(this.getStartDate(), oStartDate)) {
			return this;
		}

		var iYear = oStartDate.getFullYear();
		CalendarUtils._checkYearInValidRange(iYear);

		this.setProperty("startDate", oStartDate, true);
		this._oStartDate = CalendarDate.fromLocalJSDate(oStartDate);
		this._oStartDate.setDate(1); // always use begin of month

		var oMonthsRow = this.getAggregation("monthsRow");
		oMonthsRow.setStartDate(oStartDate);

		_updateHeader.call(this);

		var oDate = this._getFocusedDate().toLocalJSDate();
		if (!oMonthsRow.checkDateFocusable(oDate)) {
			//focused date not longer visible -> focus start date
			this._setFocusedDate(this._oStartDate);
			oMonthsRow.displayDate(oStartDate);
		}

		return this;

	};

	// overwrite invalidate to recognize changes on selectedDates
	CalendarMonthInterval.prototype.invalidate = function(oOrigin) {

		if (!this._bDateRangeChanged && (!oOrigin || !(oOrigin instanceof DateRange))) {
			Control.prototype.invalidate.apply(this, arguments);
		} else if (this.getDomRef() && this._iMode == 0 && !this._sInvalidateContent) {
			// DateRange changed -> only rerender days
			// do this only once if more DateRanges / Special days are changed
			this._sInvalidateContent = setTimeout(_invalidateMonthsRow.bind(this), 0);
		}

	};

	// overwrite removing of date ranged because invalidate don't get information about it
	CalendarMonthInterval.prototype.removeAllSelectedDates = function() {

		this._bDateRangeChanged = true;
		var aRemoved = this.removeAllAggregation("selectedDates");
		return aRemoved;

	};

	CalendarMonthInterval.prototype.destroySelectedDates = function() {

		this._bDateRangeChanged = true;
		var oDestroyed = this.destroyAggregation("selectedDates");
		return oDestroyed;

	};

	CalendarMonthInterval.prototype.removeAllSpecialDates = function() {

		this._bDateRangeChanged = true;
		var aRemoved = this.removeAllAggregation("specialDates");
		return aRemoved;

	};

	CalendarMonthInterval.prototype.destroySpecialDates = function() {

		this._bDateRangeChanged = true;
		var oDestroyed = this.destroyAggregation("specialDates");
		return oDestroyed;

	};

	/**
	 * Sets the locale for the <code>CalendarMonthInterval</code>.
	 * Only for internal use
	 * @param {string} sLocale  New value for <code>locale</code>
	 * @returns {sap.ui.unified.Calendar} <code>this</code> to allow method chaining
	 * @private
	 */
	CalendarMonthInterval.prototype.setLocale = function(sLocale){

		if (this._sLocale != sLocale) {
			this._sLocale = sLocale;
			this._oLocaleData = undefined;
			this.invalidate();
		}

		return this;

	};

	/**
	 * Gets the used locale for the <code>CalendarMonthInterval</code>
	 * Only for internal use
	 * @return {string} sLocale
	 * @private
	 */
	CalendarMonthInterval.prototype.getLocale = function(){

		if (!this._sLocale) {
			this._sLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();
		}

		return this._sLocale;

	};

	/**
	 *
	 * @return {sap.ui.unified.calendar.CalendarDate} the focused date
	 * @private
	 */
	CalendarMonthInterval.prototype._getFocusedDate = function(){

		if (!this._oFocusedDate) {
			_determineFocusedDate.call(this);
		}

		return this._oFocusedDate;

	};

	/**
	 * Sets the focused date.
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date which will be set in focus
	 * @private
	 */
	CalendarMonthInterval.prototype._setFocusedDate = function(oDate){

		CalendarUtils._checkCalendarDate(oDate);

		this._oFocusedDate = new CalendarDate(oDate);

	};

	/**
	 * Sets the focused month of the <code>CalendarMonthInterval</code>.
	 *
	 * @param {Object} oDatetime JavaScript date object for focused date. (The month of this date will be focused.)
	 * @returns {sap.ui.unified.Calendar} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	CalendarMonthInterval.prototype.focusDate = function(oDatetime){

		var bFireStartDateChange = false;
		var oMonthsRow = this.getAggregation("monthsRow");

		if (oDatetime && !oMonthsRow.checkDateFocusable(oDatetime)) {
			_setStartDateForFocus.call(this, CalendarDate.fromLocalJSDate(oDatetime));
			bFireStartDateChange = true;
		}

		_displayDate.call(this, oDatetime, false);

		if (bFireStartDateChange) {
			this.fireStartDateChange();
		}

		return this;

	};

	/**
	 * Displays a month in the <code>CalendarMonthInterval</code> but doesn't set the focus.
	 *
	 * @param {Object} oDatetime JavaScript date object for displayed date. (The month of this date will be displayed.)
	 * @returns {sap.ui.unified.CalendarMonthInterval} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	CalendarMonthInterval.prototype.displayDate = function(oDatetime){

		_displayDate.call(this, oDatetime, true);

		return this;

	};

	CalendarMonthInterval.prototype.setMonths = function(iMonths){

		this.setProperty("months", iMonths, true);

		iMonths = this._getMonths(); // to use phone limit

		var oMonthsRow = this.getAggregation("monthsRow");
		oMonthsRow.setMonths(iMonths);

		// check if focused date still is valid
		if (!oMonthsRow.checkDateFocusable(this._getFocusedDate().toLocalJSDate())) {
			//focused date not longer visible -> focus start date
			var oStartDate = _getStartDate.call(this);
			this._setFocusedDate(this._oStartDate);
			oMonthsRow.setDate(oStartDate.toLocalJSDate());
		}

		if (!this.getPickerPopup()) {
			var oYearPicker = this.getAggregation("yearPicker");
			var iYears = Math.floor(iMonths / 2);
			if (iYears > 20) {
				iYears = 20;
			}
			oYearPicker.setYears(iYears);
		}

		_updateHeader.call(this);

		if (this.getDomRef()) {
			if (this._getShowItemHeader()) {
				this.$().addClass("sapUiCalIntHead");
			}else {
				this.$().removeClass("sapUiCalIntHead");
			}
		}

		return this;

	};

	CalendarMonthInterval.prototype._getMonths = function(){

		var iMonths = this.getMonths();

		// in phone mode max 6 Months are displayed
		if (Device.system.phone && iMonths > 6) {
			return 6;
		} else {
			return iMonths;
		}

	};

	/*
	 * gets localeData for used locale
	 * if no locale is given use rendered one
	 */
	CalendarMonthInterval.prototype._getLocaleData = function(){

		if (!this._oLocaleData) {
			var sLocale = this.getLocale();
			var oLocale = new Locale(sLocale);
			this._oLocaleData = LocaleData.getInstance(oLocale);
		}

		return this._oLocaleData;

	};

	CalendarMonthInterval.prototype.setPickerPopup = function(bPickerPopup){
		var oYearPicker;
		this.setProperty("pickerPopup", bPickerPopup, true);

		if (bPickerPopup) {
			if (this.getAggregation("yearPicker")) {
				this.getAggregation("yearPicker").destroy();
			}
		} else {
			if (!this.getAggregation("yearPicker")) {
				this.setAggregation("yearPicker", this._createYearPicker());
			}
			oYearPicker = this.getAggregation("yearPicker");
			oYearPicker.setColumns(0);
			oYearPicker.setYears(6);
		}
		return this;

	};

	/*
	 * Sets a minimum date for the calendar.
	 * @param {Date} oDate a JavaScript date
	 * @return {sap.ui.unified.Calendar} <code>this</code> for method chaining
	 */
	CalendarMonthInterval.prototype.setMinDate = function(oDate){

		if (deepEqual(oDate, this.getMinDate())) {
			return this;
		}

		if (!oDate) {
			// restore default
			this._oMinDate = CalendarUtils._minDate();
		} else {
			CalendarUtils._checkJSDateObject(oDate);

			this._oMinDate = CalendarDate.fromLocalJSDate(oDate);
			this._oMinDate.setDate(1); // always start at begin of month

			var iYear = this._oMinDate.getYear();
			CalendarUtils._checkYearInValidRange(iYear);

			if (this._oMaxDate.isBefore(this._oMinDate)) {
				Log.warning("minDate > maxDate -> maxDate set to end of the month", this);
				this._oMaxDate = CalendarDate.fromLocalJSDate(oDate);
				this._oMaxDate.setDate(CalendarUtils._daysInMonth(this._oMaxDate));
				this.setProperty("maxDate", this._oMaxDate.toLocalJSDate(), true);
			}

			if (this._oFocusedDate) {
				// check if still in valid range
				if (this._oFocusedDate.isBefore(this._oMinDate)) {
					Log.warning("focused date < minDate -> minDate focused", this);
					this.focusDate(oDate);
				}
			}

			if (this._oStartDate && this._oStartDate.isBefore(this._oMinDate)) {
				Log.warning("start date < minDate -> minDate set as start date", this);
				_setStartDate.call(this, new CalendarDate(this._oMinDate), true, true);
			}

		}

		this.setProperty("minDate", oDate, false); // re-render MonthsRow because visualization can change

		if (this.getPickerPopup()) {
			var oCalendar = this._getCalendarPicker();
			oCalendar.setMinDate(oDate);
		} else {
			var oYearPicker = this.getAggregation("yearPicker");
			oYearPicker._oMinDate.setYear(this._oMinDate.getYear());
		}

		return this;

	};

	/*
	 * Sets a maximum date for the calendar.
	 * @param {Date} oDate a JavaScript date
	 * @return {sap.ui.unified.CalendarMonthInterval} <code>this</code> for method chaining
	 */
	CalendarMonthInterval.prototype.setMaxDate = function(oDate){

		if (deepEqual(oDate, this.getMaxDate())) {
			return this;
		}

		if (!oDate) {
			// restore default
			this._oMaxDate = CalendarUtils._maxDate();
		} else {
			CalendarUtils._checkJSDateObject(oDate);

			this._oMaxDate = CalendarDate.fromLocalJSDate(oDate);
			this._oMaxDate.setDate(CalendarUtils._daysInMonth(this._oMaxDate)); // always end on end of month

			var iYear = this._oMaxDate.getYear();
			CalendarUtils._checkYearInValidRange(iYear);

			if (this._oMinDate.isAfter(this._oMaxDate)) {
				Log.warning("maxDate < minDate -> minDate set to begin of the month", this);
				this._oMinDate = CalendarDate.fromLocalJSDate(oDate);
				this._oMinDate.setDate(1);
				this.setProperty("minDate", this._oMinDate.toLocalJSDate(), true);
			}

			if (this._oFocusedDate) {
				// check if still in valid range
				if (this._oFocusedDate.isAfter(this._oMaxDate)) {
					Log.warning("focused date > maxDate -> maxDate focused", this);
					this.focusDate(oDate);
				}
			}

			if (this._oStartDate) {
				var oEndDate = new CalendarDate(this._oStartDate);
				oEndDate.setDate(1);
				oEndDate.setMonth(oEndDate.getMonth() + this._getMonths());
				oEndDate.setDate(0);
				if (oEndDate.isAfter(this._oMaxDate)) {
					var oStartDate = new CalendarDate(this._oMaxDate);
					oStartDate.setDate(1);
					oStartDate.setMonth(oStartDate.getMonth() - this._getMonths() + 1);
					if (oStartDate.isSameOrAfter(this._oMinDate)) {
						// minDate wins if range is too short
						Log.warning("end date > maxDate -> maxDate set as end date", this);
						_setStartDate.call(this, oStartDate, true, true);
					}
				}
			}
		}

		this.setProperty("maxDate", oDate, false); // re-render MonthsRow because visualization can change

		if (this.getPickerPopup()) {
			var oCalendar = this._getCalendarPicker();
			oCalendar.setMaxDate(oDate);
		} else {
			var oYearPicker = this.getAggregation("yearPicker");
			oYearPicker._oMaxDate.setYear(this._oMaxDate.getYear());
		}

		return this;

	};

	CalendarMonthInterval.prototype.onclick = function(oEvent){

		if (oEvent.isMarked("delayedMouseEvent") ) {
			return;
		}

		if (oEvent.target.id == this.getId() + "-cancel") {
			this.onsapescape(oEvent);
		}

	};

	CalendarMonthInterval.prototype.onmousedown = function(oEvent){

		oEvent.preventDefault(); // to prevent focus set outside of DatePicker
		oEvent.setMark("cancelAutoClose");

	};

	CalendarMonthInterval.prototype.onsapescape = function(oEvent){
		if (this.getPickerPopup()) {
			_closeCalendarPicker.call(this);
			this.fireCancel();
		} else {
			switch (this._iMode) {
			case 0: // day picker
				this.fireCancel();
				break;

			case 1: // year picker
				_hideYearPicker.call(this);
				break;
				// no default
			}
		}
	};

	CalendarMonthInterval.prototype.onsaptabnext = function(oEvent){

		// if tab was pressed on a day it should jump to the year button
		var oHeader = this.getAggregation("header"),
			oYearPicker, oMonthsRow;

		if (containsOrEquals(this.getDomRef("content"), oEvent.target)) {
			if (oHeader.getDomRef("B2")){
				oHeader.getDomRef("B2").focus();
			}

			if (!this._bPoupupMode) {
				// remove Tabindex from day, month, year - to break cycle
				oMonthsRow = this.getAggregation("monthsRow");
				jQuery(oMonthsRow._oItemNavigation.getItemDomRefs()[oMonthsRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");

				if (!this.getPickerPopup()) {
					oYearPicker = this.getAggregation("yearPicker");
					if (oYearPicker.getDomRef()) {
						jQuery(oYearPicker._oItemNavigation.getItemDomRefs()[oYearPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
					}
				}
			}

			oEvent.preventDefault();
		}

	};

	CalendarMonthInterval.prototype.onsaptabprevious = function(oEvent){

		var oHeader = this.getAggregation("header"),
			oMonthsRow, oYearPicker;

		if (containsOrEquals(this.getDomRef("content"), oEvent.target)) {
			// tab from day or year -> go to header

			if (this._bPoupupMode) {
				if (oHeader.getDomRef("B2")){
					oHeader.getDomRef("B2").focus();
				}
				oEvent.preventDefault();
			}
		} else if (oEvent.target.id == oHeader.getId() + "-B2") {

			switch (this._iMode) {
			case 0: // day picker
				oMonthsRow = this.getAggregation("monthsRow");
				oMonthsRow._oItemNavigation.focusItem(oMonthsRow._oItemNavigation.getFocusedIndex());
				break;
			case 1: // year picker
				if (!this.getPickerPopup()) {
					oYearPicker = this.getAggregation("yearPicker");
					oYearPicker._oItemNavigation.focusItem(oYearPicker._oItemNavigation.getFocusedIndex());
				}
				break;
				// no default
			}

			oEvent.preventDefault();
		}
	};

	CalendarMonthInterval.prototype.onfocusin = function(oEvent){

		if (oEvent.target.id == this.getId() + "-end") {
			// focus via tab+shift (otherwise not possible to go to this element)
			var oHeader = this.getAggregation("header"),
				oMonthsRow, oYearPicker;
			if (oHeader.getDomRef("B2")){
				oHeader.getDomRef("B2").focus();
			}

			if (!this._bPoupupMode) {
				oMonthsRow = this.getAggregation("monthsRow");
				// remove Tabindex from day, month, year - to break cycle
				jQuery(oMonthsRow._oItemNavigation.getItemDomRefs()[oMonthsRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");

				if (!this.getPickerPopup()) {
					oYearPicker = this.getAggregation("yearPicker");

					if (oYearPicker.getDomRef()) {
						jQuery(oYearPicker._oItemNavigation.getItemDomRefs()[oYearPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
					}
				}
			}
		}

		// remove tabindex of dummy element if focus is inside calendar
	this.$("end").attr("tabindex", "-1");

	};

	CalendarMonthInterval.prototype.onsapfocusleave = function(oEvent){
		var oMonthsRow,
			oYearPicker;

		if (!oEvent.relatedControlId || !containsOrEquals(this.getDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef())) {
			// put dummy element back to tab-chain
			this.$("end").attr("tabindex", "0");

			if (!this._bPoupupMode) {
				// restore Tabindex from day and year
				switch (this._iMode) {
				case 0: // day picker
					oMonthsRow = this.getAggregation("monthsRow");
					jQuery(oMonthsRow._oItemNavigation.getItemDomRefs()[oMonthsRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
					break;
				case 1: // year picker
					if (!this.getPickerPopup()) {
						oYearPicker = this.getAggregation("yearPicker");
						jQuery(oYearPicker._oItemNavigation.getItemDomRefs()[oYearPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
					}
					break;
					// no default
				}
			}
		}

	};

	CalendarMonthInterval.prototype._handlePrevious = function(oEvent){
		var oFocusedDate,
			iMonths,
			oStartDate,
			oYearPicker;

		switch (this._iMode) {
		case 0: // month picker
			oFocusedDate = this._getFocusedDate();
			iMonths = this._getMonths();
			oStartDate = new CalendarDate(_getStartDate.call(this));

			oStartDate.setMonth(oStartDate.getMonth() - iMonths);
			oFocusedDate.setMonth(oFocusedDate.getMonth() - iMonths);

			this._setFocusedDate(oFocusedDate);
			_setStartDate.call(this, oStartDate, true);
			break;

		case 1: // year picker
			if (!this.getPickerPopup()) {
				oYearPicker = this.getAggregation("yearPicker");
				oYearPicker.previousPage();
				_togglePrevNexYearPicker.call(this);
			}
			break;
			// no default
		}

	};

	CalendarMonthInterval.prototype._handleNext = function(oEvent){
		var oFocusedDate,
			iMonths,
			oStartDate,
			oYearPicker;

		switch (this._iMode) {
		case 0: // month picker
			oFocusedDate = this._getFocusedDate();
			iMonths = this._getMonths();
			oStartDate = new CalendarDate(_getStartDate.call(this));

			oStartDate.setMonth(oStartDate.getMonth() + iMonths);
			oFocusedDate.setMonth(oFocusedDate.getMonth() + iMonths);
			this._setFocusedDate(oFocusedDate);
			_setStartDate.call(this, oStartDate, true);

			break;

		case 1: // year picker
			if (!this.getPickerPopup()) {
				oYearPicker = this.getAggregation("yearPicker");
				oYearPicker.nextPage();
				_togglePrevNexYearPicker.call(this);
			}
			break;
			// no default
		}

	};

	CalendarMonthInterval.prototype._showOverlay = function () {
		this.$("contentOver").css("display", "");
	};

	CalendarMonthInterval.prototype._hideOverlay = function () {
		this.$("contentOver").css("display", "none");
	};

	CalendarMonthInterval.prototype._getShowItemHeader = function(){

		var iMonths = this.getMonths();
		if (iMonths > this._iDaysMonthsHead) {
			return true;
		}else {
			return false;
		}

	};

	/**
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oStartDate The date to be set to start date
	 * @param {boolean} bSetFocusDate Whether the date will be focused
	 * @param {boolean} bSkipEvent Whether startDateChange event should be skipped
	 * @private
	 */
	function _setStartDate(oStartDate, bSetFocusDate, bSkipEvent){

		var oMaxDate = new CalendarDate(this._oMaxDate);
		oMaxDate.setDate(1);
		oMaxDate.setMonth(oMaxDate.getMonth() - this._getMonths() + 1);
		if (oMaxDate.isBefore(this._oMinDate)) {
			// min and max smaller than interval
			oMaxDate = new CalendarDate(this._oMinDate);
			oMaxDate.setMonth(oMaxDate.getMonth() + this._getMonths() - 1);
		}
		if (oStartDate.isBefore(this._oMinDate)) {
			oStartDate = new CalendarDate(this._oMinDate);
		}else if (oStartDate.isAfter(oMaxDate)){
			oStartDate = oMaxDate;
		}

		oStartDate.setDate(1); // always use begin of month
		var oLocaleDate = oStartDate.toLocalJSDate();
		this.setProperty("startDate", oLocaleDate, true);
		this._oStartDate = oStartDate;

		var oMonthsRow = this.getAggregation("monthsRow");
		oMonthsRow.setStartDate(oLocaleDate);

		_updateHeader.call(this);

		if (bSetFocusDate) {
			var oDateTime = this._getFocusedDate().toLocalJSDate();
			if (!oMonthsRow.checkDateFocusable(oDateTime)) {
				//focused date not longer visible -> focus start date
				this._setFocusedDate(oStartDate);
				oMonthsRow.setDate(oLocaleDate);
			}else {
				oMonthsRow.setDate(oDateTime);
			}
		}

		if (!bSkipEvent) {
			this.fireStartDateChange();
		}

	}

	/**
	 * Retrieves the start date as calendar date
	 * @return {sap.ui.unified.calendar.CalendarDate} the start date
	 * @private
	 */
	function _getStartDate(){

		if (!this._oStartDate) {
			// no start date set, use focused date
			this._oStartDate = this._getFocusedDate();
			this._oStartDate.setDate(1); // always use begin of month
		}

		return this._oStartDate;

	}

	/*
	 * sets the date in the used Month controls
	 * @param {boolean} bNoFolus if set no focus is set to the date
	 */
	function _renderMonthsRow(bNoFocus){

		var oDate = this._getFocusedDate();
		var oMonthsRow = this.getAggregation("monthsRow");

		if (!bNoFocus) {
			oMonthsRow.setDate(oDate.toLocalJSDate());
		} else {
			oMonthsRow.displayDate(oDate.toLocalJSDate());
		}

		// change month and year
		_updateHeader.call(this);

	}

	function _determineFocusedDate(){

		var aSelectedDates = this.getSelectedDates();
		if (aSelectedDates && aSelectedDates[0] && aSelectedDates[0].getStartDate()) {
			// selected dates are provided -> use first one to focus
			this._oFocusedDate = CalendarDate.fromLocalJSDate(aSelectedDates[0].getStartDate());
		} else {
			// use current date
			this._oFocusedDate = new CalendarDate();
		}
		this._oFocusedDate.setDate(1); // always use begin of month

		if (this._oFocusedDate.isBefore(this._oMinDate)) {
			this._oFocusedDate = new CalendarDate(this._oMinDate);
		}else if (this._oFocusedDate.isAfter(this._oMaxDate)){
			this._oFocusedDate = new CalendarDate(this._oMaxDate);
		}

	}

	/**
	 * Opens the year picker.
	 * This function assumes its called when a yearPicker aggregation is available, so the caller must take care for it.
	 * @private
	 * @returns {void}
	 */
	function _showYearPicker(){

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

		if (this._iMode == 0) {
			// remove tabindex from month
			var oMonthsRow = this.getAggregation("monthsRow");

			jQuery(oMonthsRow._oItemNavigation.getItemDomRefs()[oMonthsRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
		}

		_togglePrevNexYearPicker.call(this);
		this._iMode = 1;
	}

	function _hideYearPicker(bNoFocus){
		this._iMode = 0;

		var oYearPicker = this.getAggregation("yearPicker");
		oYearPicker.$().css("display", "none");

		this._hideOverlay();

		if (!bNoFocus) {
			_renderMonthsRow.call(this); // to focus date

			// restore tabindex because if date not changed in _renderMonthsRow only the focused date is updated
			var oMonthsRow = this.getAggregation("monthsRow");
			jQuery(oMonthsRow._oItemNavigation.getItemDomRefs()[oMonthsRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
		}

	}

	function _updateHeader(){

		_setHeaderText.call(this);
		_togglePrevNext.call(this);

	}

	function _togglePrevNext(){

		var oDate = new CalendarDate(_getStartDate.call(this));
		var iMonths = this._getMonths();
		var iYear = oDate.getYear();
		var iYearMax = this._oMaxDate.getYear();
		var iYearMin = this._oMinDate.getYear();
		var iMonth = oDate.getMonth();
		var iMonthMax = this._oMaxDate.getMonth();
		var iMonthMin = this._oMinDate.getMonth();
		var oHeader = this.getAggregation("header");

		if (iYear < iYearMin || (iYear == iYearMin && iMonth <= iMonthMin )) {
			oHeader.setEnabledPrevious(false);
		}else {
			oHeader.setEnabledPrevious(true);
		}

		oDate.setMonth(oDate.getMonth() + iMonths - 1);
		iYear = oDate.getYear();
		iMonth = oDate.getMonth();
		if (iYear > iYearMax || (iYear == iYearMax && iMonth >= iMonthMax)) {
			oHeader.setEnabledNext(false);
		}else {
			oHeader.setEnabledNext(true);
		}

	}

	function _togglePrevNexYearPicker(){

		var oYearPicker = this.getAggregation("yearPicker");
		var iYears = oYearPicker.getYears();
		var oDate = CalendarDate.fromLocalJSDate(oYearPicker.getFirstRenderedDate());
		oDate.setYear(oDate.getYear() + Math.floor(iYears / 2));
		var oHeader = this.getAggregation("header");
		var oMaxDate = new CalendarDate(this._oMaxDate);
		oMaxDate.setYear(oMaxDate.getYear() - Math.ceil(iYears / 2));
		oMaxDate.setMonth(11, 31);
		var oMinDate = new CalendarDate(this._oMinDate);
		oMinDate.setYear(oMinDate.getYear() + Math.floor(iYears / 2) + 1);
		oMinDate.setMonth(0, 1);

		oHeader.setEnabledNext(!oDate.isAfter(oMaxDate));
		oHeader.setEnabledPrevious(!oDate.isBefore(oMinDate));

	}

	function _setHeaderText(){

		// sets the text for the year button to the header
		var sText;
		var oStartDate = _getStartDate.call(this);
		var sStartYear = this._oYearFormat.format(oStartDate.toUTCJSDate(), true);
		var oEndDate = new CalendarDate(oStartDate);
		oEndDate.setMonth(oEndDate.getMonth() + this._getMonths() - 1);
		var sEndYear = this._oYearFormat.format(oEndDate.toUTCJSDate(), true);
		if (sStartYear != sEndYear) {
			var oLocaleData = this._getLocaleData();
			var sPattern = oLocaleData.getIntervalPattern();
			sText = sPattern.replace(/\{0\}/, sStartYear).replace(/\{1\}/, sEndYear);
		} else {
			sText = sStartYear;
		}

		var oHeader = this.getAggregation("header");
		oHeader.setTextButton2(sText);

	}

	/**
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date to be focused
	 * @param {boolean} bNotVisible Whether the date is not visible
	 * @private
	 */
	function _focusDate(oDate, bNotVisible){

		// if a date should be focused thats out of the borders -> focus the border
		var oFocusedDate;
		var bChanged = false;
		if (oDate.isBefore(this._oMinDate)) {
			oFocusedDate = this._oMinDate;
			bChanged = true;
		}else if (oDate.isAfter(this._oMaxDate)){
			oFocusedDate = this._oMaxDate;
			bChanged = true;
		}else {
			oFocusedDate = oDate;
		}

		this._setFocusedDate(oFocusedDate);

		if (bChanged || bNotVisible) {
			_setStartDateForFocus.call(this, oFocusedDate);
			_renderMonthsRow.call(this, false);
			this.fireStartDateChange();
		}

	}

	/**
	 * @param {Object} oDate The date to be displayed
	 * @param {boolean} bSkipFocus Whether the date should be skipped
	 * @private
	 */
	function _displayDate(oDate, bSkipFocus) {

		if (!oDate) {
			return;
		}

		var oCalDate = CalendarDate.fromLocalJSDate(oDate);

		if (this._oFocusedDate && this._oFocusedDate.isSame(oCalDate)) {
			return;
		}

		var iYear = oCalDate.getYear();
		CalendarUtils._checkYearInValidRange(iYear);

		if (CalendarUtils._isOutside(oCalDate, this._oMinDate, this._oMaxDate)) {
			throw new Error("Date must not be in valid range (minDate and maxDate); " + this);
		}

		this._setFocusedDate(oCalDate);

		if (this.getDomRef() && this._iMode == 0) {
			_renderMonthsRow.call(this, bSkipFocus);
		}

	}

	function _handleButton2(oEvent){
		if (this.getPickerPopup()) {
			this._showCalendarPicker();
		} else {
			// check if go inside this
			if (this._iMode != 1) {
				_showYearPicker.call(this);
			} else {
				_hideYearPicker.call(this);
			}
		}

	}

	CalendarMonthInterval.prototype._showCalendarPicker = function() {
		var oDate = this._getFocusedDate(true).toLocalJSDate();
		var oCalPicker = this._getCalendarPicker();
		var oSelectedDate = new DateRange({ startDate: oDate });

		oCalPicker.displayDate(oDate, false);
		oCalPicker.removeAllSelectedDates();
		oCalPicker.addSelectedDate(oSelectedDate);

		oCalPicker.setMinDate(this.getMinDate());
		oCalPicker.setMaxDate(this.getMaxDate());

		_openPickerPopup.call(this, oCalPicker);
		this._showOverlay();
	};

	function _closeCalendarPicker(bNoFocus) {
		if (this._oPopup && this._oPopup.isOpen()) {
			this._oPopup.close();
		}
		this._hideOverlay();
		if (!bNoFocus) {
			_renderMonthsRow.call(this); // to focus date

			// restore tabindex because if date not changed in _renderMonthsRow only the focused date is updated
			var oMonthsRow = this.getAggregation("monthsRow");
			jQuery(oMonthsRow._oItemNavigation.getItemDomRefs()[oMonthsRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
		}
	}

	function _handleSelect(oEvent){

		this.fireSelect();

	}

	function _handleFocus(oEvent){

		var oDate = CalendarDate.fromLocalJSDate(oEvent.getParameter("date"));
		var bNotVisible = oEvent.getParameter("notVisible");

		_focusDate.call(this, oDate, bNotVisible);

	}

	function _handleCalendarDateSelect(oEvent) {
		var oFocusedDate = new CalendarDate(this._getFocusedDate());
		var oCalendar = this._getCalendarPicker();
		var oSelectedDate = oCalendar.getSelectedDates()[0].getStartDate();
		var oNewCalFocusDate = CalendarDate.fromLocalJSDate(oSelectedDate);

		// to keep day and month stable also for islamic date
		oNewCalFocusDate.setMonth(oFocusedDate.getMonth());
		oNewCalFocusDate.setDate(oFocusedDate.getDate());

		_focusDate.call(this, oNewCalFocusDate, true);
		_closeCalendarPicker.call(this);
	}

	function _handleSelectYear(oEvent){

		var oFocusedDate = new CalendarDate(this._getFocusedDate());
		var oYearPicker = this.getAggregation("yearPicker");
		var oDate = CalendarDate.fromLocalJSDate(oYearPicker.getDate());

		// to keep day and month stable also for islamic date
		oDate.setMonth(oFocusedDate.getMonth());
		oDate.setDate(oFocusedDate.getDate());

		oFocusedDate = oDate;

		_focusDate.call(this, oFocusedDate, true);

		_hideYearPicker.call(this);

	}

	function _invalidateMonthsRow(){

		this._sInvalidateContent = undefined;

		var oMonthsRow = this.getAggregation("monthsRow");
		if (oMonthsRow) {
			oMonthsRow._bDateRangeChanged = true;
			oMonthsRow._bInvalidateSync = true;
			oMonthsRow.invalidate();
			oMonthsRow._bInvalidateSync = undefined;
		}

		this._bDateRangeChanged = undefined;

	}

	/**
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate The date which will be set to start date
	 * @private
	 */
	function _setStartDateForFocus(oDate) {

		// set start date according to new focused date
		// only if focused date is not in current rendered month interval
		// new focused date should have the same position like the old one
		var oMonthsRow = this.getAggregation("monthsRow");
		var oStartDate = _getStartDate.call(this);
		var iMonth = oMonthsRow._oItemNavigation.getFocusedIndex();
		oStartDate = new CalendarDate(oDate);
		oStartDate.setMonth( oStartDate.getMonth() - iMonth);
		_setStartDate.call(this, oStartDate, false, true);

	}

	function _openPickerPopup(oPicker){

		if (!this._oPopup) {
			this._oPopup = new Popup();
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
		var eDock = Popup.Dock;
		this._oPopup.open(0, eDock.CenterTop, eDock.CenterTop, oHeader, null, "flipfit", true);

	}

	function _handlePopupClosed(oEvent) {
		_closeCalendarPicker.call(this);
	}

	function _handleYearPickerPageChange(oEvent) {

		_togglePrevNexYearPicker.call(this);

	}

	return CalendarMonthInterval;

});