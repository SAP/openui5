/*!
 * ${copyright}
 */
//Provides control sap.ui.unified.Calendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', 'sap/ui/model/type/Date', 'sap/ui/unified/calendar/CalendarUtils',
		'./calendar/Header', './calendar/Month', './calendar/MonthPicker', './calendar/YearPicker', './calendar/CalendarDate', './library'],
	function (jQuery, Control, LocaleData, Date1, CalendarUtils, Header, Month, MonthPicker, YearPicker, CalendarDate, library) {
	"use strict";

	/*
	 * Inside the Calendar CalendarDate objects are used. But in the API JS dates are used.
	 * So conversion must be done on API functions.
	 */

	/**
	 * Constructor for a new Calendar.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
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
			 * number of months displayed
			 * on phones always only one month is displayed
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
			startDateChange : {}
		}
	}});

	/*
	 * There are different modes (stored in this._iMode)
	 * The standard is 0, that means a calendar showing a calendar with the days of one month.
	 * If 1 a month picker is shown.
	 * if 2 a year picker is shown.
	 */

	Calendar.prototype.init = function(){

		this._iBreakPointTablet = sap.ui.Device.media._predefinedRangeSets[sap.ui.Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0];
		this._iBreakPointDesktop = sap.ui.Device.media._predefinedRangeSets[sap.ui.Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1];
		this._iBreakPointLargeDesktop = sap.ui.Device.media._predefinedRangeSets[sap.ui.Device.media.RANGESETS.SAP_STANDARD_EXTENDED].points[2];

		// set default calendar type from configuration
		var sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
		this.setProperty("primaryCalendarType", sCalendarType);
		this.setProperty("secondaryCalendarType", sCalendarType);

		this._iMode = 0; // days are shown

		// to format year with era in Japanese
		this._oYearFormat = sap.ui.core.format.DateFormat.getDateInstance({format: "y", calendarType: sCalendarType});

		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

		this._oMinDate = CalendarUtils._minDate(this.getPrimaryCalendarType());
		this._oMaxDate = CalendarUtils._maxDate(this.getPrimaryCalendarType());

		var oHeader = new Header(this.getId() + "--Head");
		oHeader.attachEvent("pressPrevious", this._handlePrevious, this);
		oHeader.attachEvent("pressNext", this._handleNext, this);
		oHeader.attachEvent("pressButton1", _handleButton1, this);
		oHeader.attachEvent("pressButton2", _handleButton2, this);
		this.setAggregation("header",oHeader);

		var oMonth = this._createMonth(this.getId() + "--Month0");
		oMonth.attachEvent("focus", this._handleFocus, this);
		oMonth.attachEvent("select", _handleSelect, this);
		oMonth.attachEvent("_renderMonth", _handleRenderMonth, this);
		oMonth.attachEvent("_bindMousemove", _handleBindMousemove, this);
		oMonth.attachEvent("_unbindMousemove", _handleUnbindMousemove, this);
		oMonth._bNoThemeChange = true;
		this.addAggregation("month",oMonth);

		var oMonthPicker = new MonthPicker(this.getId() + "--MP");
		oMonthPicker.attachEvent("select", _handleSelectMonth, this);
		oMonthPicker._bNoThemeChange = true;
		this.setAggregation("monthPicker",oMonthPicker);

		var oYearPicker = new YearPicker(this.getId() + "--YP");
		oYearPicker.attachEvent("select", _handleSelectYear, this);
		this.setAggregation("yearPicker",oYearPicker);

		this._resizeProxy = jQuery.proxy(_handleResize, this);
	};

	Calendar.prototype.exit = function(){

		if (this._sInvalidateMonth) {
			jQuery.sap.clearDelayedCall(this._sInvalidateMonth);
		}

		if (this._sResizeListener) {
			sap.ui.core.ResizeHandler.deregister(this._sResizeListener);
			this._sResizeListener = undefined;
		}

	};

	Calendar.prototype._createMonth = function(sId){
		var oMonth = new Month(sId, {width: "100%"});

		return oMonth;

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
		_checkNamesLength.call(this);

		if (_getMonths.call(this) > 1 || this._bInitMonth) {
			// check if size is right and adopt it if necessary
			oEvent.size = {width: this.getDomRef().offsetWidth};
			_handleResize.call(this, oEvent, true);
			if (!this._sResizeListener) {
				this._sResizeListener = sap.ui.core.ResizeHandler.register(this, this._resizeProxy);
			}
			this._bInitMonth = undefined;
		}

	};

	// overwrite invalidate to recognize changes on selectedDates
	Calendar.prototype.invalidate = function(oOrigin) {

		if (!this._bDateRangeChanged && (!oOrigin || !(oOrigin instanceof sap.ui.unified.DateRange))) {
			Control.prototype.invalidate.apply(this, arguments);
		} else if (this.getDomRef() && this._iMode == 0 && !this._sInvalidateMonth) {
			// DateRange changed -> only rerender days
			// do this only once if more DateRanges / Special days are changed
			this._sInvalidateMonth = jQuery.sap.delayedCall(0, this, this._invalidateMonth, [oOrigin]);
		}

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
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate
	 * @private
	 */
	Calendar.prototype._setFocusedDate = function(oDate){
		CalendarUtils._checkCalendarDate(oDate);
		this._oFocusedDate = new CalendarDate(oDate, this.getPrimaryCalendarType());
	};

	/**
	 * Sets the focused date of the calendar.
	 *
	 * @param {object} oDate
	 *         JavaScript date object for focused date.
	 * @returns {sap.ui.unified.Calendar} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Calendar.prototype.focusDate = function(oDate){
		var oCalDate = CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType());

		_displayDate.call(this, oCalDate, false);

		return this;

	};

	/**
	 * Displays a date in the calendar but don't set the focus.
	 *
	 * @param {object} oDate
	 *         JavaScript date object for focused date.
	 * @returns {sap.ui.unified.Calendar} <code>this</code> to allow method chaining
	 * @since 1.28.0
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	Calendar.prototype.displayDate = function (oDate) {

		var oCalDate = CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType());
		_displayDate.call(this, oCalDate, true);

		return this;

	};

	/**
	 * Returns the first day of the displayed month.
	 *
	 * There might be some days of the previous month shown, but they can not be focused.
	 *
	 * @returns {object} JavaScript date object for start date.
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

		this._oYearFormat = sap.ui.core.format.DateFormat.getDateInstance({format: "y", calendarType: sCalendarType});

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

		var oMonthPicker = this.getAggregation("monthPicker");
		oMonthPicker.setPrimaryCalendarType(sCalendarType);
		var oYearPicker = this.getAggregation("yearPicker");
		oYearPicker.setPrimaryCalendarType(sCalendarType);

		if (this.getDomRef()) {
			this._updateHeader(this._oFocusedDate);

			if (this.iMode != 1 && oMonthPicker.getDomRef()) {
				// remove DOM as rerendering only needed if displayed
				oMonthPicker.$().remove();
			}
			if (this.iMode != 2 && oYearPicker.getDomRef()) {
				// remove DOM as rerendering only needed if displayed
				oYearPicker.$().remove();
			}
		}

		return this;

	};

	Calendar.prototype.setSecondaryCalendarType = function(sCalendarType){

		this._bSecondaryCalendarTypeSet = true; // as property can not be empty but we use it only if set
		this.setProperty("secondaryCalendarType", sCalendarType, true);

		this._oYearFormatSecondary = sap.ui.core.format.DateFormat.getDateInstance({format: "y", calendarType: sCalendarType});

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

		var oYearPicker = this.getAggregation("yearPicker");
		oYearPicker._oMinDate.setYear(this._oMinDate.getYear());

		return this;

	};

	/**
	 * Sets a maximum date for the calendar.
	 * @param {Date} oDate a JavaScript date
	 * @return {sap.ui.unified.Calendar} <code>this</code> for method chaining
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

		var oYearPicker = this.getAggregation("yearPicker");
		oYearPicker._oMaxDate.setYear(this._oMaxDate.getYear());

		return this;

	};

	/**
	 * Provides default behavior for setting min & max date.
	 * It is also a hook for the sap.ui.unified.CalendarDateInterval.
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate
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
			var oLocale = new sap.ui.core.Locale(sLocale);
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

		if (oEvent.isMarked("delayedMouseEvent") ) {
			return;
		}

		if (oEvent.target.id == this.getId() + "-cancel") {
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
			jQuery.sap.focus(oHeader.getDomRef("B1"));

			if (!this._bPoupupMode) {
				// remove Tabindex from day, month, year - to break cycle
				var aMonths = this.getAggregation("month");
				var oMonthPicker = this.getAggregation("monthPicker");
				var oYearPicker = this.getAggregation("yearPicker");
				for (var i = 0; i < aMonths.length; i++) {
					var oMonth = aMonths[i];
					jQuery(oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
				}
				if (oMonthPicker.getDomRef()) {
					jQuery(oMonthPicker._oItemNavigation.getItemDomRefs()[oMonthPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
				}
				if (oYearPicker.getDomRef()) {
					jQuery(oYearPicker._oItemNavigation.getItemDomRefs()[oYearPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
				}
			}

			oEvent.preventDefault();
		} else if (oEvent.target.id == oHeader.getId() + "-B1") {
			jQuery.sap.focus(oHeader.getDomRef("B2"));

			oEvent.preventDefault();
			//} else if (oEvent.target.id == oHeader.getId() + "-B2") {
			// go to next element on page, in Popup mode to day, month or year
		}

	};

	Calendar.prototype.onsaptabprevious = function(oEvent){

		var oHeader = this.getAggregation("header");

		if (jQuery.sap.containsOrEquals(this.getDomRef("content"), oEvent.target)) {
			// tab from day, month or year -> go to header

			if (this._bPoupupMode) {
				jQuery.sap.focus(oHeader.getDomRef("B2"));
				oEvent.preventDefault();
			}
		} else if (oEvent.target.id == oHeader.getId() + "-B1") {
			// focus day, month or year
			var aMonths = this.getAggregation("month");
			var oMonthPicker = this.getAggregation("monthPicker");
			var oYearPicker = this.getAggregation("yearPicker");
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
				oMonthPicker._oItemNavigation.focusItem(oMonthPicker._oItemNavigation.getFocusedIndex());
				break;

			case 2: // year picker
				oYearPicker._oItemNavigation.focusItem(oYearPicker._oItemNavigation.getFocusedIndex());
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
			var oHeader = this.getAggregation("header");
			var aMonths = this.getAggregation("month");
			var oMonthPicker = this.getAggregation("monthPicker");
			var oYearPicker = this.getAggregation("yearPicker");

			jQuery.sap.focus(oHeader.getDomRef("B2"));

			if (!this._bPoupupMode) {
				// remove Tabindex from day, month, year - to break cycle
				for (var i = 0; i < aMonths.length; i++) {
					var oMonth = aMonths[i];
					jQuery(oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
				}
				if (oMonthPicker.getDomRef()) {
					jQuery(oMonthPicker._oItemNavigation.getItemDomRefs()[oMonthPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
				}
				if (oYearPicker.getDomRef()) {
					jQuery(oYearPicker._oItemNavigation.getItemDomRefs()[oYearPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
				}
			}
		}

		// remove tabindex of dummy element if focus is inside calendar
		this.$("end").attr("tabindex", "-1");

	};

	Calendar.prototype.onsapfocusleave = function(oEvent){

		if (!oEvent.relatedControlId || !jQuery.sap.containsOrEquals(this.getDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef())) {
			// put dummy element back to tab-chain
			this.$("end").attr("tabindex", "0");

			if (!this._bPoupupMode) {
				// restore Tabindex from day, month, year
				var aMonths = this.getAggregation("month");
				var oMonthPicker = this.getAggregation("monthPicker");
				var oYearPicker = this.getAggregation("yearPicker");
				switch (this._iMode) {
				case 0: // day picker
					for (var i = 0; i < aMonths.length; i++) {
						var oMonth = aMonths[i];
						jQuery(oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
					}
					break;

				case 1: // month picker
					jQuery(oMonthPicker._oItemNavigation.getItemDomRefs()[oMonthPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
					break;

				case 2: // year picker
					jQuery(oYearPicker._oItemNavigation.getItemDomRefs()[oYearPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
					break;
					// no default
				}
			}
		}

	};

	Calendar.prototype.getFocusDomRef = function(){

		// set focus on the day
		var aMonths = this.getAggregation("month");
		var oMonth = aMonths[0];
		return oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()];

	};

	Calendar.prototype.onThemeChanged = function() {

		//If the calendar is not yet rendered we cannot perform the theme change operations, which include DOM manipulation
		if (!this.getDomRef()) {
			return;
		}

		this._bNamesLengthChecked = undefined;
		var oMonthPicker = this.getAggregation("monthPicker");
		_showMonthPicker.call(this, true);
		oMonthPicker._bNoThemeChange = false;
		oMonthPicker.onThemeChanged( arguments );
		oMonthPicker._bNoThemeChange = true;
		this._bLongMonth = oMonthPicker._bLongMonth;
		_hideMonthPicker.call(this, true);

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
		}else {
			oCalDate = this._getFocusedDate();
		}
		_setHeaderText.call(this, oCalDate);

		// check if day names and month names are too big -> use smaller ones
		_checkNamesLength.call(this);

	};

	/**
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate
	 * @private
	 */
	Calendar.prototype._updateHeader = function(oDate){

		_setHeaderText.call(this, oDate);
		this._togglePrevNext(oDate, true);

	};

	/**
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate
	 * @param {boolean} bCheckMonth
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
				|| (this._iMode == 1 && this.getPickerPopup && this.getPickerPopup())) {
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
				|| (this._iMode == 1 && this.getPickerPopup && this.getPickerPopup())) {
			oHeader.setEnabledPrevious(false);
		}else {
			oHeader.setEnabledPrevious(true);
		}

	};

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

	Calendar.prototype._handlePrevious = function(oEvent){

		var oFocusedDate = this._getFocusedDate();
		var oHeader = this.getAggregation("header");
		var oYearPicker = this.getAggregation("yearPicker");
		var iMonths = _getMonths.call(this);
		var oFirstMonthDate;
		var oDate;
		var bNoFocus = false;

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
			_renderMonth.call(this, bNoFocus, true);
			break;

		case 1: // month picker
			oFocusedDate.setYear(oFocusedDate.getYear() - 1);
			oHeader.setTextButton2(this._oYearFormat.format(oFocusedDate.toUTCJSDate(), true));
			var sSecondaryCalendarType = this._getSecondaryCalendarType();
			if (sSecondaryCalendarType) {
				oDate = new CalendarDate(oFocusedDate, sSecondaryCalendarType);
				oDate.setMonth(0);
				oDate.setDate(1);
				oHeader.setAdditionalTextButton2(this._oYearFormatSecondary.format(oDate.toUTCJSDate(), true));
			} else {
				oHeader.setAdditionalTextButton2();
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

	Calendar.prototype._handleNext = function(oEvent){

		var oFocusedDate = this._getFocusedDate();
		var oHeader = this.getAggregation("header");
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
			_renderMonth.call(this);
			break;

		case 1: // month picker
			oFocusedDate.setYear(oFocusedDate.getYear() + 1);
			oHeader.setTextButton2(this._oYearFormat.format(oFocusedDate.toUTCJSDate(), true));
			var sSecondaryCalendarType = this._getSecondaryCalendarType();
			if (sSecondaryCalendarType) {
				oDate = new CalendarDate(oFocusedDate, sSecondaryCalendarType);
				oDate.setMonth(0);
				oDate.setDate(1);
				oHeader.setAdditionalTextButton2(this._oYearFormatSecondary.format(oDate.toUTCJSDate(), true));
			} else {
				oHeader.setAdditionalTextButton2();
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
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate
	 * returns the displayed months rendered for a start date
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

	Calendar.prototype._closedPickers = function(){

		switch (this._iMode) {
		case 0: // date picker
			break;

		case 1: // month picker
			_hideMonthPicker.call(this);
			break;

		case 2: // year picker
			_hideYearPicker.call(this);
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
	* @param {object} oEvent the event
	* @private
	*/
	Calendar.prototype._handleFocus = function (oEvent) {

		var oDate = CalendarDate.fromLocalJSDate(oEvent.getParameter("date"), this.getPrimaryCalendarType());
		var bOtherMonth = oEvent.getParameter("otherMonth");
		var bRestoreOldDate = oEvent.getParameter("restoreOldDate");

		if (bRestoreOldDate) {
			// in multimonth mode stay at the last focused date
			if (!jQuery.sap.equal(this._getFocusedDate(), oDate)) {
				_renderMonth.call(this, false, false, true);
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
	 * @param {boolean} bNoFocus if set no focus is set to the date
	 * @param {boolean} bInLastMont if more than one month is used, date is rendered in last month
	 * @param {boolean} bNoEvent if set, no startDateChange event is fired
	 */
	function _renderMonth(bNoFocus, bInLastMonth, bNoEvent){

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
				if (!bNoFocus) {
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
					if (!bNoFocus && CalendarUtils._isSameMonthAndYear(oMonthDate, oDate)) {
						oMonth.setDate(oDate.toLocalJSDate());
					}else {
						oMonth.displayDate(oMonthDate.toLocalJSDate());
					}
				}
			}

			// change month and year
			this._updateHeader(oFirstDate);

			if (!bNoEvent) {
				this.fireStartDateChange();
			}
		}

	}

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

	function _showMonthPicker(bNoFocus){

		if (this._iMode == 2) {
			_hideYearPicker.call(this, true);
		}

		var oDate = this._getFocusedDate();
		var oMonthPicker = this.getAggregation("monthPicker");

		if (!this.getPickerPopup || !this.getPickerPopup()) {
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
		}else {
			this._openPickerPopup(oMonthPicker);
		}

		this.$("contentOver").css("display", "");

		if (!bNoFocus) {
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

	}

	function _hideMonthPicker(bNoFocus){

		this._iMode = 0;

		if (!this.getPickerPopup || !this.getPickerPopup()) {
			var oMonthPicker = this.getAggregation("monthPicker");
			oMonthPicker.$().css("display", "none");
		}else if (this._oPopup.isOpen()) {
			this._oPopup.close();
		}
		this.$("contentOver").css("display", "none");

		if (!bNoFocus) {
			_renderMonth.call(this); // to focus date

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

	}

	function _showYearPicker(){

		if (this._iMode == 1) {
			_hideMonthPicker.call(this, true);
		}

		var oDate = this._getFocusedDate();

		var oYearPicker = this.getAggregation("yearPicker");
		if (!this.getPickerPopup || !this.getPickerPopup()) {
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
		}else {
			this._openPickerPopup(oYearPicker);
		}

		this.$("contentOver").css("display", "");

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

	}

	function _hideYearPicker(bNoFocus){

		this._iMode = 0;

		if (!this.getPickerPopup || !this.getPickerPopup()) {
			var oYearPicker = this.getAggregation("yearPicker");
			oYearPicker.$().css("display", "none");
		}else if (this._oPopup.isOpen()) {
			this._oPopup.close();
		}
		this.$("contentOver").css("display", "none");

		if (!bNoFocus) {
			_renderMonth.call(this); // to focus date

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

	}

	function _checkNamesLength(){

		if (!this._bNamesLengthChecked) {
			// check month names (don't change focus)
			_showMonthPicker.call(this, true);
			_hideMonthPicker.call(this, true);

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

				_setHeaderText.call(this, oDate);
			}
		}else if (_getMonths.call(this) > 1) {
			// on rerendering focus might be set on wrong month
			this._focusDate(this._getFocusedDate(), true, true);
		}

	}

	/**
	 *
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate
	 * @param {boolean{ bOtherMonth
	 * @param {boolean} bNoEvent
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
		}else if (oDate.isAfter(this._oMaxDate)){
			oFocusedDate = this._oMaxDate;
			bChanged = true;
		}else {
			oFocusedDate = oDate;
		}

		if (this._focusDateExtend) {
			// hook for CalenarDateInterval
			bFireStartDateChange = this._focusDateExtend(oDate, bOtherMonth, bNoEvent);
		}

		var bInLastMonth = oFocusedDate.isBefore(this._getFocusedDate());

		this._setFocusedDate(oFocusedDate);

		if (bChanged || bOtherMonth) {
			_renderMonth.call(this, false, bInLastMonth, bNoEvent);
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
				if (aMonths.length > 1) {
					oMonth._bNoFocus = true;
				}
				oMonth.invalidate(oOrigin);
				oMonth._bInvalidateSync = undefined;
			}

			if (aMonths.length > 1) {
				// restore focus
				this._focusDate(this._getFocusedDate(), true, true);
			}
		}

		this._bDateRangeChanged = undefined;

	};

	/**
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate
	 * @private
	 */
	function _setHeaderText (oDate){

		// sets the text for the month and the year button to the header

		var oHeader = this.getAggregation("header");
		var oLocaleData = this._getLocaleData();
		var aMonthNames = [];
		var aMonthNamesWide = [];
		var aMonthNamesSecondary = [];
		var sAriaLabel;
		var bShort = false;
		var sText;
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

		var aMonths = this._getDisplayedMonths(oDate);
		if (aMonths.length > 1 && !this._bShowOneMonth) {
			if (!sPattern) {
				sPattern = oLocaleData.getIntervalPattern();
			}
			sText = sPattern.replace(/\{0\}/, aMonthNames[aMonths[0]]).replace(/\{1\}/, aMonthNames[aMonths[aMonths.length - 1]]);
			if (bShort) {
				sAriaLabel = sPattern.replace(/\{0\}/, aMonthNamesWide[aMonths[0]]).replace(/\{1\}/, aMonthNamesWide[aMonths[aMonths.length - 1]]);
			}
		}else {
			sText = aMonthNames[aMonths[0]];
			if (bShort) {
				sAriaLabel = aMonthNamesWide[aMonths[0]];
			}
		}

		oHeader.setTextButton1(sText);
		if (bShort) {
			oHeader.setAriaLabelButton1(sAriaLabel);
		}

		var oFirstDate = new CalendarDate(oDate, sPrimaryCalendarType);
		oFirstDate.setDate(1); // always use the first of the month to have stable year in Japanese calendar
		oHeader.setTextButton2(this._oYearFormat.format(oFirstDate.toUTCJSDate(), true));

		if (sSecondaryCalendarType) {
			oFirstDate = new CalendarDate(oFirstDate, sSecondaryCalendarType);
			oHeader.setAdditionalTextButton2(this._oYearFormatSecondary.format(oFirstDate.toUTCJSDate(), true));
		} else {
			oHeader.setAdditionalTextButton2();
		}

	}

	/**
	 * @param {sap.ui.unified.calendar.CalendarDate} oDate
	 * @param {boolean} bNoFocus
	 * @private
	 */
	function _displayDate (oDate, bNoFocus){

		if (oDate && (!this._oFocusedDate || !this._oFocusedDate.isSame(oDate))) {

			var iYear = oDate.getYear();
			CalendarUtils._checkYearInValidRange(iYear);

			if (CalendarUtils._isOutside(oDate, this._oMinDate, this._oMaxDate)) {
				throw new Error("Date must not be in valid range (minDate and maxDate); " + this);
			}

			this._setFocusedDate(oDate);

			if (this.getDomRef() && this._iMode == 0) {
				_renderMonth.call(this, bNoFocus, false, true); // fire no startDateChange event on programmatical change
			}
		}

	}

	function _getMonths (){

		// in phone mode always only one month is displayed
		if (sap.ui.Device.system.phone) {
			return 1;
		} else {
			return this.getMonths();
		}

	}

	// handlers for sub-controls
	function _handleButton1 (oEvent){

		if (this._iMode != 1) {
			_showMonthPicker.call(this);
		} else {
			_hideMonthPicker.call(this);
		}

	}

	function _handleButton2 (oEvent){

		if (this._iMode != 2) {
			_showYearPicker.call(this);
		} else {
			_hideYearPicker.call(this);
		}

	}

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

	function _handleSelectMonth (oEvent){

		var oFocusedDate = new CalendarDate(this._getFocusedDate(), this.getPrimaryCalendarType()),
				oMonthPicker = this.getAggregation("monthPicker"),
				iMonth = oMonthPicker.getMonth();

		if (this._adjustFocusedDateUponMonthChange) {//hook (currently used by PlanningCalendar)
			this._adjustFocusedDateUponMonthChange(oFocusedDate, iMonth);
		} else {
			oFocusedDate.setMonth(iMonth);
			if (iMonth != oFocusedDate.getMonth()){
				// day did not exist in this month (e.g. 31) -> go to last day of month
				oFocusedDate.setDate(0);
			}
		}

		this._focusDate(oFocusedDate, true);

		_hideMonthPicker.call(this);

	}

	function _handleSelectYear (oEvent){

		var oFocusedDate = new CalendarDate(this._getFocusedDate(), this.getPrimaryCalendarType());
		var oYearPicker = this.getAggregation("yearPicker");
		var oDate = CalendarDate.fromLocalJSDate(oYearPicker.getDate(), this.getPrimaryCalendarType());
		var iYear = oYearPicker.getYear();
		var oModifiedFocusedDate;

		if (this._adjustFocusedDateUponYearChange) {//hook (currently used by PlanningCalendar)
			oModifiedFocusedDate = this._adjustFocusedDateUponYearChange(oFocusedDate, iYear);
			if (oModifiedFocusedDate) {
				oFocusedDate = oModifiedFocusedDate;
			}
		} else {
			// to keep day and month stable also for islamic date
			oDate.setMonth(oFocusedDate.getMonth());
			oDate.setDate(oFocusedDate.getDate());
			oFocusedDate = oDate;
		}

		this._focusDate(oFocusedDate, true);

		_hideYearPicker.call(this);

	}

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
		var iColumns;

		if (iOldSize != this._iSize || this._bInitMonth) {
			switch (this._iSize) {
			case 1: // tablet
				iColumns = 2;
				break;

			case 2: // desktop
				iColumns = 3;
				break;

			case 3: // large desktop
				iColumns = 4;
				break;

			default:
				iColumns = 1;
				break;
			}

			if (iMonths < iColumns) {
				iColumns = iMonths;
			}

			// determine best fitting colums
			if (iColumns > 2 && iMonths > iColumns) {
				var iCheckColumns = iColumns;
				var fUseage = 0.0;
				var iUseColumns = iColumns;
				while (iCheckColumns >= 2) {
					var iMod = iMonths % iCheckColumns;
					if (iMod == 0) {
						iUseColumns = iCheckColumns;
						break;
					}else {
						var fNewUseage = iMod / iCheckColumns;
						if (fNewUseage > fUseage) {
							fUseage = fNewUseage;
							iUseColumns = iCheckColumns;
						}
					}
					iCheckColumns--;
				}
				iColumns = iUseColumns;
			}

			var sWidth;
			var aMonths = this.getAggregation("month");

			if (iColumns > 1) {
				sWidth = 100 / iColumns + "%";
				this.$("content").removeClass("sapUiCalContentSingle");
			}else {
				sWidth = "100%";
				this.$("content").addClass("sapUiCalContentSingle");
			}

			for (var i = 0; i < aMonths.length; i++) {
				var oMonth = aMonths[i];
				oMonth.setWidth(sWidth);
			}
		}

	}
	/**
	 * @return {sap.ui.unified.calendar.CalendarDate} the focused date.
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

}, /* bExport= */ true);
