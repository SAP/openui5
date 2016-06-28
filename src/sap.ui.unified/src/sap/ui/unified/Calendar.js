/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.Calendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', 'sap/ui/model/type/Date', 'sap/ui/unified/calendar/CalendarUtils',
               './calendar/Header', './calendar/Month', './calendar/MonthPicker', './calendar/YearPicker', 'sap/ui/core/date/UniversalDate', './library'],
               function(jQuery, Control, LocaleData, Date1, CalendarUtils, Header, Month, MonthPicker, YearPicker, UniversalDate, library) {
	"use strict";

	/*
	 * Inside the Calendar UniversalDate objects are used. But in the API JS dates are used.
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
			secondaryCalendarType : {type : "sap.ui.core.CalendarType", group : "Appearance", defaultValue : null}
		},
		aggregations : {

			/**
			 * Date Ranges for selected dates of the DatePicker
			 */
			selectedDates : {type : "sap.ui.unified.DateRange", multiple : true, singularName : "selectedDate"},

			/**
			 * Date Range with type to visualize special days in the Calendar.
			 * If one day is assigned to more than one Type, only the first one will be used.
			 * @since 1.24.0
			 */
			specialDates : {type : "sap.ui.unified.DateTypeRange", multiple : true, singularName : "specialDate"},

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
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
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

		// set default calendar type from configuration
		var sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
		this.setProperty("primaryCalendarType", sCalendarType);
		this.setProperty("secondaryCalendarType", sCalendarType);

		this._iMode = 0; // days are shown

		// to format year with era in Japanese
		this._oYearFormat = sap.ui.core.format.DateFormat.getDateInstance({format: "y", calendarType: sCalendarType});

		this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

		this._oMinDate = this._newUniversalDate(new Date(Date.UTC(1, 0, 1)));
		this._oMinDate.getJSDate().setUTCFullYear(1); // otherwise year 1 will be converted to year 1901
		this._oMaxDate = this._newUniversalDate(new Date(Date.UTC(9999, 11, 31)));

		var oHeader = new Header(this.getId() + "--Head");
		oHeader.attachEvent("pressPrevious", this._handlePrevious, this);
		oHeader.attachEvent("pressNext", this._handleNext, this);
		oHeader.attachEvent("pressButton1", _handleButton1, this);
		oHeader.attachEvent("pressButton2", _handleButton2, this);
		this.setAggregation("header",oHeader);

		var oMonth = this._createMonth(this.getId() + "--Month0");
		oMonth.attachEvent("focus", _handleFocus, this);
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

	};

	Calendar.prototype.exit = function(){

		if (this._sInvalidateMonth) {
			jQuery.sap.clearDelayedCall(this._sInvalidateMonth);
		}

	};

	Calendar.prototype._createMonth = function(sId){

		var oMonth = new Month(sId);

		return oMonth;

	};

	Calendar.prototype.onBeforeRendering = function(){

		var aMonths = this.getAggregation("month");
		var oDate;
		var oMonthDate = aMonths[0].getDate();
		var oFocusedDate = this._getFocusedDate();

		if (aMonths.length > 1 && oMonthDate) {
			// for more than one month - re-render same months (if already rendered once)
			oDate = CalendarUtils._createUniversalUTCDate(oMonthDate, this.getPrimaryCalendarType());
		}else if (aMonths.length > 1) {
			oDate = _determineFirstMonthDate.call(this, this._getFocusedDate());
		}else {
			oDate = oFocusedDate;
		}

		for (var i = 0; i < aMonths.length; i++) {
			var oMonth = aMonths[i];
			oMonthDate = this._newUniversalDate(oDate);
			if (i > 0) {
				oMonthDate.setUTCDate(1);
				oMonthDate.setUTCMonth(oMonthDate.getUTCMonth() + i);
			}
			if (oFocusedDate.getUTCFullYear() == oMonthDate.getUTCFullYear() && oFocusedDate.getUTCMonth() == oMonthDate.getUTCMonth()) {
				oMonth.setDate(CalendarUtils._createLocalDate(oFocusedDate));
			} else {
				oMonth.displayDate(CalendarUtils._createLocalDate(oMonthDate));
			}
		}

		this._updateHeader(oDate);

	};

	Calendar.prototype.onAfterRendering = function(){

		// check if day names and month names are too big -> use smaller ones
		_checkNamesLength.call(this);

	};

	// overwrite invalidate to recognize changes on selectedDates
	Calendar.prototype.invalidate = function(oOrigin) {

		if (!this._bDateRangeChanged && (!oOrigin || !(oOrigin instanceof sap.ui.unified.DateRange))) {
			Control.prototype.invalidate.apply(this, arguments);
		} else if (this.getDomRef() && this._iMode == 0 && !this._sInvalidateMonth) {
			// DateRange changed -> only rerender days
			// do this only once if more DateRanges / Special days are changed
			this._sInvalidateMonth = jQuery.sap.delayedCall(0, this, _invalidateMonth, [this]);
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

	Calendar.prototype._getFocusedDate = function(){

		if (!this._oFocusedDate) {
			_determineFocusedDate.call(this);
		}

		return this._oFocusedDate;

	};

	Calendar.prototype._setFocusedDate = function(oDate){

		if (!(oDate instanceof UniversalDate)) {
			throw new Error("Date must be a UniversalDate object " + this);
		}

		this._oFocusedDate = this._newUniversalDate(oDate);

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

		_displayDate.call(this, oDate, false);

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
	Calendar.prototype.displayDate = function(oDate){

		_displayDate.call(this, oDate, true);

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
			oStartDate = CalendarUtils._createUniversalUTCDate(aMonths[0].getDate(), this.getPrimaryCalendarType());
		} else {
			// if not rendered use the focused date
			oStartDate = this._newUniversalDate(this._getFocusedDate());
		}

		oStartDate.setUTCDate(1);

		return CalendarUtils._createLocalDate(oStartDate);

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

		this.setProperty("months", iMonths, false); // rerender
		iMonths = _getMonths.call(this); // to use validation

		var aMonths = this.getAggregation("month");
		var i = 0;
		var oMonth;

		if (aMonths.length < iMonths) {
			for (i = aMonths.length; i < iMonths; i++) {
				oMonth = this._createMonth(this.getId() + "--Month" + i);
				oMonth.attachEvent("focus", _handleFocus, this);
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
			this._oFocusedDate = UniversalDate.getInstance(this._oFocusedDate.getJSDate(), sCalendarType);
		}
		this._oMinDate = UniversalDate.getInstance(this._oMinDate.getJSDate(), sCalendarType);
		this._oMaxDate = UniversalDate.getInstance(this._oMaxDate.getJSDate(), sCalendarType);

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

	Calendar.prototype._newUniversalDate = function(oDate){

		var oJSDate;

		if ((oDate instanceof UniversalDate)) {
			oJSDate = new Date(oDate.getJSDate().getTime()); // use getTime() because IE and FF can not parse dates < 0100.01.01
		} else {
			oJSDate = new Date(oDate.getTime());
		}

		return UniversalDate.getInstance(oJSDate, this.getPrimaryCalendarType());

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
					var oMonthDate = CalendarUtils._createUniversalUTCDate(oMonth.getDate(), this.getPrimaryCalendarType());
					if (oFocusedDate.getTime() == oMonthDate.getTime()) {
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

		var oDate;
		if (aMonths.length > 1) {
			oDate = CalendarUtils._createUniversalUTCDate(aMonths[0].getDate(), this.getPrimaryCalendarType());
		}else {
			oDate = this._getFocusedDate();
		}
		_setHeaderText.call(this, oDate);

		// check if day names and month names are too big -> use smaller ones
		_checkNamesLength.call(this);

	};

	Calendar.prototype._updateHeader = function(oDate){

		_setHeaderText.call(this, oDate);
		_togglePrevNext.call(this, oDate, true);

	};

	Calendar.prototype._handlePrevious = function(oEvent){

		var oFocusedDate = this._getFocusedDate();
		var oHeader = this.getAggregation("header");
		var oYearPicker = this.getAggregation("yearPicker");
		var iMonths = _getMonths.call(this);
		var oFirstMonthDate;
		var bNoFocus = false;

		switch (this._iMode) {
		case 0: // day picker
			if (iMonths > 1) {
				oFirstMonthDate = CalendarUtils._createUniversalUTCDate(this.getAggregation("month")[0].getDate(), this.getPrimaryCalendarType());
				oFirstMonthDate.setUTCDate(1);
				this._setFocusedDate(oFirstMonthDate);
				oFocusedDate = this._getFocusedDate();
			}else {
				oFocusedDate.setUTCDate(1);
			}

			oFocusedDate.setUTCDate(oFocusedDate.getUTCDate() - 1);
			_renderMonth.call(this, bNoFocus, true);
			break;

		case 1: // month picker
			oFocusedDate.setUTCFullYear(oFocusedDate.getUTCFullYear() - 1);
			oHeader.setTextButton2(this._oYearFormat.format(oFocusedDate, true));
			var sSecondaryCalendarType = this._getSecondaryCalendarType();
			if (sSecondaryCalendarType) {
				var oDate = UniversalDate.getInstance(new Date(oFocusedDate.getJSDate()), sSecondaryCalendarType);
				oDate.setUTCMonth(0, 1);
				oHeader.setAdditionalTextButton2(this._oYearFormatSecondary.format(oDate, true));
			} else {
				oHeader.setAdditionalTextButton2();
			}
			_togglePrevNext.call(this, oFocusedDate);
			break;

		case 2: // year picker
			oYearPicker.previousPage();
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

		switch (this._iMode) {
		case 0: // day picker
			if (iMonths > 1) {
				oFirstMonthDate = CalendarUtils._createUniversalUTCDate(this.getAggregation("month")[0].getDate(), this.getPrimaryCalendarType());
				this._setFocusedDate(oFirstMonthDate);
				oFocusedDate = this._getFocusedDate();
			}
			oFocusedDate.setUTCMonth(oFocusedDate.getUTCMonth() + iMonths, 1);
			_renderMonth.call(this);
			break;

		case 1: // month picker
			oFocusedDate.setUTCFullYear(oFocusedDate.getUTCFullYear() + 1);
			oHeader.setTextButton2(this._oYearFormat.format(oFocusedDate, true));
			var sSecondaryCalendarType = this._getSecondaryCalendarType();
			if (sSecondaryCalendarType) {
				var oDate = UniversalDate.getInstance(new Date(oFocusedDate.getJSDate()), sSecondaryCalendarType);
				oDate.setUTCMonth(0, 1);
				oHeader.setAdditionalTextButton2(this._oYearFormatSecondary.format(oDate, true));
			} else {
				oHeader.setAdditionalTextButton2();
			}
			_togglePrevNext.call(this, oFocusedDate);
			break;

		case 2: // year picker
			oYearPicker.nextPage();
			break;
			// no default
		}

	};

	/*
	 * returns the displayed months rendered for a start date
	 */
	Calendar.prototype._getDisplayedMonths = function(oDate){

		var aMonths = [];
		var iMonth = oDate.getUTCMonth();
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
		var oFirstDate = CalendarUtils._createUniversalUTCDate(aMonths[0].getDate(), sPrimaryCalendarType);
		oFirstDate.setUTCDate(1);
		oFirstDate = UniversalDate.getInstance(oFirstDate.getJSDate(), sSecondaryCalendarType);
		var iStartMonth = oFirstDate.getUTCMonth();

		var oLastDate = CalendarUtils._createUniversalUTCDate(aMonths[aMonths.length - 1].getDate(), sPrimaryCalendarType);
		oLastDate.setUTCMonth(oLastDate.getUTCMonth() + 1, 0);
		oLastDate = UniversalDate.getInstance(oLastDate.getJSDate(), sSecondaryCalendarType);
		var iEndMonth = oLastDate.getUTCMonth();

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

	/*
	 * sets the date in the used Month controls
	 * @param {sap.ui.unified.Calendar} this Calendar instance
	 * @param {boolean} bNoFolus if set no focus is set to the date
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
			if (oMonth.checkDateFocusable(CalendarUtils._createLocalDate(oDate))) {
				bFound = true;
			}
			if (bFound || aMonths.length == 1) {
				// if only 1 month, date must be set in it any way
				if (!bNoFocus) {
					oMonth.setDate(CalendarUtils._createLocalDate(oDate));
				} else {
					oMonth.displayDate(CalendarUtils._createLocalDate(oDate));
				}
				break;
			}
		}

		if (!bFound) {
			// date not found in existing months - render new ones
			oFirstDate = this._newUniversalDate(oDate);

			if (aMonths.length > 1) {
				oFirstDate = _determineFirstMonthDate.call(this, oFirstDate);

				for (i = 0; i < aMonths.length; i++) {
					oMonth = aMonths[i];
					oMonthDate = this._newUniversalDate(oFirstDate);
					oMonthDate.setUTCMonth(oFirstDate.getUTCMonth() + i);
					if (!bNoFocus && oMonthDate.getUTCFullYear() == oDate.getUTCFullYear() && oMonthDate.getUTCMonth() == oDate.getUTCMonth()) {
						oMonth.setDate(CalendarUtils._createLocalDate(oDate));
					}else {
						oMonth.displayDate(CalendarUtils._createLocalDate(oMonthDate));
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
			this._oFocusedDate = CalendarUtils._createUniversalUTCDate(aSelectedDates[0].getStartDate(), sCalendarType);
		} else {
			// use current date
			var oNewDate = new Date();
			this._oFocusedDate = CalendarUtils._createUniversalUTCDate(oNewDate, sCalendarType);
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
			oMonthPicker.setMonth(oDate.getUTCMonth());

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

		_togglePrevNext.call(this, oDate, false);

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

			if (this.getMonths() > 1) {
				// restore tabindex because if date not changed in _renderMonth only the focused date is updated
				var aMonths = this.getAggregation("month");
				for (var i = 0; i < aMonths.length; i++) {
					var oMonth = aMonths[i];
					jQuery(oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
				}
			}
		}

		_togglePrevNext.call(this, this._getFocusedDate(), true);

	}

	function _showYearPicker(){

		if (this._iMode == 1) {
			_hideMonthPicker.call(this, true);
		}

		var oDate = this._getFocusedDate();
		var iYear = oDate.getJSDate().getUTCFullYear();
		var iYearMax = this._oMaxDate.getJSDate().getUTCFullYear();
		var iYearMin = this._oMinDate.getJSDate().getUTCFullYear();

		if (iYearMax - iYearMin <= 20) {
			return;
		}

		var oHeader = this.getAggregation("header");

		if (iYear > ( iYearMax - 10 )) {
			iYear = iYearMax - 9;
			oHeader.setEnabledNext(false);
		} else {
			oHeader.setEnabledNext(true);
		}
		if (iYear < ( iYearMin + 9 )) {
			iYear = iYearMin + 10;
			oHeader.setEnabledPrevious(false);
		} else {
			oHeader.setEnabledPrevious(true);
		}

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

		oYearPicker.setDate(oDate.getJSDate());

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

			if (this.getMonths() > 1) {
				// restore tabindex because if date not changed in _renderMonth only the focused date is updated
				var aMonths = this.getAggregation("month");
				for (var i = 0; i < aMonths.length; i++) {
					var oMonth = aMonths[i];
					jQuery(oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
				}
			}
		}

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
					oDate = CalendarUtils._createUniversalUTCDate(aMonths[0].getDate(), this.getPrimaryCalendarType());
				}else {
					oDate = this._getFocusedDate();
				}

				_setHeaderText.call(this, oDate);
			}
		}else if (this.getMonths() > 1) {
			// on rerendering focus might be set on wrong month
			_focusDate.call(this, this._getFocusedDate(), true, true);
		}

	}

	function _togglePrevNext (oDate, bCheckMonth){

		var iYearMax = this._oMaxDate.getJSDate().getUTCFullYear();
		var iYearMin = this._oMinDate.getJSDate().getUTCFullYear();
		var iMonthMax = this._oMaxDate.getJSDate().getUTCMonth();
		var iMonthMin = this._oMinDate.getJSDate().getUTCMonth();
		var oHeader = this.getAggregation("header");

		var oCheckDate = this._newUniversalDate(oDate);
		oCheckDate.setUTCMonth(oCheckDate.getUTCMonth() + 1, 0); // check the last day of the month for next (needed for islamic date)
		var iYear = oCheckDate.getJSDate().getUTCFullYear();
		var iMonth = oCheckDate.getJSDate().getUTCMonth();

		if (iYear > iYearMax || (iYear == iYearMax && ( !bCheckMonth || iMonth >= iMonthMax ))
				|| (this._iMode == 1 && this.getPickerPopup && this.getPickerPopup())) {
			oHeader.setEnabledNext(false);
		}else {
			oHeader.setEnabledNext(true);
		}

		oCheckDate.setUTCDate(1); // check the first day of the month for previous (needed for islamic date)
		iYear = oCheckDate.getJSDate().getUTCFullYear();
		iMonth = oCheckDate.getJSDate().getUTCMonth();

		if (iYear < iYearMin || (iYear == iYearMin && ( !bCheckMonth || iMonth <= iMonthMin ))
				|| (this._iMode == 1 && this.getPickerPopup && this.getPickerPopup())) {
			oHeader.setEnabledPrevious(false);
		}else {
			oHeader.setEnabledPrevious(true);
		}

	}

	function _focusDate (oDate, bOtherMonth, bNoEvent){

		// if a date should be focused thats out of the borders -> focus the border
		var oFocusedDate;
		var bChanged = false;
		var bFireStartDateChange = false;
		if (oDate.getTime() < this._oMinDate.getTime()) {
			oFocusedDate = this._oMinDate;
			bChanged = true;
		}else if (oDate.getTime() > this._oMaxDate.getTime()){
			oFocusedDate = this._oMaxDate;
			bChanged = true;
		}else {
			oFocusedDate = oDate;
		}

		if (this._focusDateExtend) {
			// hook for CalenarDateInterval
			bFireStartDateChange = this._focusDateExtend(oDate, bOtherMonth, bNoEvent);
		}

		var bInLastMonth = oFocusedDate.getTime() < this._getFocusedDate().getTime();

		this._setFocusedDate(oFocusedDate);

		if (bChanged || bOtherMonth) {
			_renderMonth.call(this, false, bInLastMonth, bNoEvent);
		}

		if (bFireStartDateChange) {
			this.fireStartDateChange();
		}

	}

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
		if (aMonths.length > 1) {
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

		var oFirstDate = this._newUniversalDate(oDate);
		oFirstDate.setUTCDate(1); // always use the first of the month to have stabel year in Japanese calendar
		oHeader.setTextButton2(this._oYearFormat.format(oFirstDate, true));

		if (sSecondaryCalendarType) {
			oFirstDate = UniversalDate.getInstance(oFirstDate.getJSDate(), sSecondaryCalendarType);
			oHeader.setAdditionalTextButton2(this._oYearFormatSecondary.format(oFirstDate, true));
		} else {
			oHeader.setAdditionalTextButton2();
		}

	}

	function _displayDate (oDate, bNoFocus){

		if (oDate && (!this._oFocusedDate || this._oFocusedDate.getTime() != oDate.getTime())) {
			if (!(oDate instanceof Date)) {
				throw new Error("Date must be a JavaScript date object; " + this);
			}

			oDate = CalendarUtils._createUniversalUTCDate(oDate, this.getPrimaryCalendarType());

			var iYear = oDate.getUTCFullYear();
			if (iYear < 1 || iYear > 9999) {
				throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + this);
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

	function _handleFocus (oEvent){

		var oDate = CalendarUtils._createUniversalUTCDate(oEvent.getParameter("date"), this.getPrimaryCalendarType());
		var bOtherMonth = oEvent.getParameter("otherMonth");
		var bRestoreOldDate = oEvent.getParameter("restoreOldDate");

		if (bRestoreOldDate) {
			// in multimonth mode stay at the last focused date
			if (!jQuery.sap.equal(this._getFocusedDate(), oDate)) {
				_renderMonth.call(this, false, false, true);
			}
		} else {
			_focusDate.call(this, oDate, bOtherMonth);
		}

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

		var oFocusedDate = this._newUniversalDate(this._getFocusedDate());
		var oMonthPicker = this.getAggregation("monthPicker");
		var iMonth = oMonthPicker.getMonth();

		oFocusedDate.setUTCMonth(iMonth);

		if (iMonth != oFocusedDate.getUTCMonth() ) {
			// day did not exist in this month (e.g. 31) -> go to last day of month
			oFocusedDate.setUTCDate(0);
		}

		_focusDate.call(this, oFocusedDate, true);

		_hideMonthPicker.call(this);

	}

	function _handleSelectYear (oEvent){

		var oFocusedDate = this._newUniversalDate(this._getFocusedDate());
		var oYearPicker = this.getAggregation("yearPicker");
		var oDate = CalendarUtils._createUniversalUTCDate(oYearPicker.getDate(), this.getPrimaryCalendarType());

		oDate.setUTCMonth(oFocusedDate.getUTCMonth(), oFocusedDate.getUTCDate()); // to keep day and month stable also for islamic date
		oFocusedDate = oDate;

		_focusDate.call(this, oFocusedDate, true);

		_hideYearPicker.call(this);

	}

	function _invalidateMonth(){

		this._sInvalidateMonth = undefined;

		var aMonths = this.getAggregation("month");
		for (var i = 0; i < aMonths.length; i++) {
			var oMonth = aMonths[i];
			oMonth._bDateRangeChanged = true;
			oMonth._bInvalidateSync = true;
			if (aMonths.length > 1) {
				oMonth._bNoFocus = true;
			}
			oMonth.invalidate();
			oMonth._bInvalidateSync = undefined;
		}

		if (aMonths.length > 1) {
			// restore focus
			_focusDate.call(this, this._getFocusedDate(), true, true);
		}
		this._bDateRangeChanged = undefined;

	}

	function _determineFirstMonthDate(oDate){

		var oFirstDate = this._newUniversalDate(oDate);
		oFirstDate.setUTCDate(1);

		var iMonths = _getMonths.call(this); // to use validation
		if (iMonths <= 12) {
			// only if intervals fit into a year -> otherwise just display the months according to the date
			var iMonth = oDate.getUTCMonth();
			iMonth = iMonth - iMonth % iMonths;
			if (12 % iMonths > 0 && iMonth + iMonths > 11) {
				// do not show months over year borders if possible
				iMonth = 12 - iMonths;
			}
			oFirstDate.setUTCMonth(iMonth);
		}

		return oFirstDate;

	}

	return Calendar;

}, /* bExport= */ true);
