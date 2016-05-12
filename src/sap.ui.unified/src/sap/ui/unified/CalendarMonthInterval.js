/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.Calendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', 'sap/ui/model/type/Date', 'sap/ui/unified/calendar/CalendarUtils',
               './calendar/Header', './calendar/MonthsRow', './calendar/MonthPicker', './calendar/YearPicker', 'sap/ui/core/date/UniversalDate', './library'],
               function(jQuery, Control, LocaleData, Date1, CalendarUtils, Header, MonthsRow, MonthPicker, YearPicker, UniversalDate, library) {
	"use strict";

	/*
	 * Inside the CalendarMonthInterval UniversalDate objects are used. But in the API JS dates are used.
	 * So conversion must be done on API functions.
	 */

	/**
	 * Constructor for a new <code>CalendarMonthInterval</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
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
			yearPicker : {type : "sap.ui.unified.calendar.YearPicker", multiple : false, visibility : "hidden"}

		},
		associations: {

			/**
			 * Association to controls / IDs which label this control (see WAI-ARIA attribute aria-labelledby).
			 */
			ariaLabelledBy: { type: "sap.ui.core.Control", multiple: true, singularName: "ariaLabelledBy" }
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
		this._oYearFormat = sap.ui.core.format.DateFormat.getDateInstance({format: "y"});

		this._oMinDate = new UniversalDate(new Date(Date.UTC(1, 0, 1)));
		this._oMinDate.getJSDate().setUTCFullYear(1); // otherwise year 1 will be converted to year 1901
		this._oMaxDate = new UniversalDate(new Date(Date.UTC(9999, 11, 31)));

		var oHeader = new Header(this.getId() + "--Head", {
			visibleButton0: false,
			visibleButton1: false,
			visibleButton2: true
		});
		oHeader.attachEvent("pressPrevious", this._handlePrevious, this);
		oHeader.attachEvent("pressNext", this._handleNext, this);
		oHeader.attachEvent("pressButton2", _handleButton2, this);
		this.setAggregation("header",oHeader);

		var oMonthsRow = new MonthsRow(this.getId() + "--MonthsRow");
		oMonthsRow.attachEvent("focus", _handleFocus, this);
		oMonthsRow.attachEvent("select", _handleSelect, this);
		oMonthsRow._bNoThemeChange = true;
		this.setAggregation("monthsRow",oMonthsRow);

		var oYearPicker = new YearPicker(this.getId() + "--YP", {
			columns: 0,
			years: 6 // default for 12 months
		});
		oYearPicker.attachEvent("select", _handleSelectYear, this);
		oYearPicker.attachEvent("pageChange", _handleYearPickerPageChange, this);
		this.setAggregation("yearPicker",oYearPicker);

		this._iDaysMonthsHead = 15; // if more than this number of months, year numbers are displayed on top of months

	};

	CalendarMonthInterval.prototype.exit = function(){

		if (this._sInvalidateContent) {
			jQuery.sap.clearDelayedCall(this._sInvalidateContent);
		}

	};

	CalendarMonthInterval.prototype.onBeforeRendering = function(){

		var oMonthsRow = this.getAggregation("monthsRow");
		var oDate = this._getFocusedDate();

		_updateHeader.call(this);

		oMonthsRow.setDate(CalendarUtils._createLocalDate(oDate));

	};

//	CalendarMonthInterval.prototype.onAfterRendering = function(){

//	};

	CalendarMonthInterval.prototype.setStartDate = function(oStartDate){

		if (!(oStartDate instanceof Date)) {
			throw new Error("Date must be a JavaScript date object; " + this);
		}

		if (jQuery.sap.equal(this.getStartDate(), oStartDate)) {
			return this;
		}

		var iYear = oStartDate.getFullYear();
		if (iYear < 1 || iYear > 9999) {
			throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + this);
		}

		var oUTCDate = CalendarUtils._createUniversalUTCDate(oStartDate);
		this.setProperty("startDate", oStartDate, true);
		this._oUTCStartDate = oUTCDate;
		this._oUTCStartDate.setUTCDate(1); // always use begin of month

		var oMonthsRow = this.getAggregation("monthsRow");
		oMonthsRow.setStartDate(oStartDate);

		_updateHeader.call(this);

		var oDate = CalendarUtils._createLocalDate(this._getFocusedDate());
		if (!oMonthsRow.checkDateFocusable(oDate)) {
			//focused date not longer visible -> focus start date
			this._setFocusedDate(this._oUTCStartDate);
			oMonthsRow.displayDate(oStartDate);
		}

		return this;

	};

	// overwrite invalidate to recognize changes on selectedDates
	CalendarMonthInterval.prototype.invalidate = function(oOrigin) {

		if (!this._bDateRangeChanged && (!oOrigin || !(oOrigin instanceof sap.ui.unified.DateRange))) {
			Control.prototype.invalidate.apply(this, arguments);
		} else if (this.getDomRef() && this._iMode == 0 && !this._sInvalidateContent) {
			// DateRange changed -> only rerender days
			// do this only once if more DateRanges / Special days are changed
			this._sInvalidateContent = jQuery.sap.delayedCall(0, this, _invalidateMonthsRow);
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

	CalendarMonthInterval.prototype._getFocusedDate = function(){

		if (!this._oFocusedDate) {
			_determineFocusedDate.call(this);
		}

		return this._oFocusedDate;

	};

	CalendarMonthInterval.prototype._setFocusedDate = function(oDate){

		if (!(oDate instanceof UniversalDate)) {
			throw new Error("Date must be a UniversalDate object " + this);
		}

		this._oFocusedDate = new UniversalDate(oDate.getTime());

	};

	/**
	 * Sets the focused month of the <code>CalendarMonthInterval</code>.
	 *
	 * @param {object} oDate JavaScript date object for focused date. (The month of this date will be focused.)
	 * @returns {sap.ui.unified.Calendar} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	CalendarMonthInterval.prototype.focusDate = function(oDate){

		var bFireStartDateChange = false;
		var oMonthsRow = this.getAggregation("monthsRow");
		if (!oMonthsRow.checkDateFocusable(oDate)) {
			var oUTCDate = CalendarUtils._createUniversalUTCDate(oDate);
			_setStartDateForFocus.call(this, oUTCDate);
			bFireStartDateChange = true;
		}

		_displayDate.call(this, oDate, false);

		if (bFireStartDateChange) {
			this.fireStartDateChange();
		}

		return this;

	};

	/**
	 * Displays a month in the <code>CalendarMonthInterval</code> but doesn't set the focus.
	 *
	 * @param {object} oDate JavaScript date object for displayed date. (The month of this date will be displayed.)
	 * @returns {sap.ui.unified.Calendar} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	CalendarMonthInterval.prototype.displayDate = function(oDate){

		_displayDate.call(this, oDate, true);

		return this;

	};

	CalendarMonthInterval.prototype.setMonths = function(iMonths){

		this.setProperty("months", iMonths, true);

		iMonths = this._getMonths(); // to use phone limit

		var oMonthsRow = this.getAggregation("monthsRow");
		oMonthsRow.setMonths(iMonths);

		// check if focused date still is valid
		var oDate = CalendarUtils._createLocalDate(this._getFocusedDate());
		if (!oMonthsRow.checkDateFocusable(oDate)) {
			//focused date not longer visible -> focus start date
			var oStartDate = _getStartDate.call(this);
			this._setFocusedDate(this._oUTCStartDate);
			oMonthsRow.setDate(CalendarUtils._createLocalDate(oStartDate));
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

	};

	CalendarMonthInterval.prototype._getMonths = function(){

		var iMonths = this.getMonths();

		// in phone mode max 6 Months are displayed
		if (sap.ui.Device.system.phone && iMonths > 6) {
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
			var oLocale = new sap.ui.core.Locale(sLocale);
			this._oLocaleData = LocaleData.getInstance(oLocale);
		}

		return this._oLocaleData;

	};

	CalendarMonthInterval.prototype.setPickerPopup = function(bPickerPopup){

		this.setProperty("pickerPopup", bPickerPopup, true);

		var oYearPicker = this.getAggregation("yearPicker");

		if (bPickerPopup) {
			oYearPicker.setColumns(4);
			oYearPicker.setYears(20);
		} else {
			oYearPicker.setColumns(0);
			oYearPicker.setYears(6);
		}

	};

	CalendarMonthInterval.prototype.setMinDate = function(oDate){

		if (jQuery.sap.equal(oDate, this.getMinDate())) {
			return this;
		}

		if (!oDate) {
			// restore default
			this._oMinDate.getJSDate().setUTCFullYear(1);
			this._oMinDate.getJSDate().setUTCMonth(0);
			this._oMinDate.getJSDate().setUTCDate(1);
		} else {
			if (!(oDate instanceof Date)) {
				throw new Error("Date must be a JavaScript date object; " + this);
			}

			this._oMinDate = CalendarUtils._createUniversalUTCDate(oDate);

			var iYear = this._oMinDate.getUTCFullYear();
			if (iYear < 1 || iYear > 9999) {
				throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + this);
			}

			if (this._oMaxDate.getTime() < this._oMinDate.getTime()) {
				jQuery.sap.log.warning("minDate > maxDate -> maxDate set to end of the month", this);
				this._oMaxDate = CalendarUtils._createUniversalUTCDate(oDate);
				this._oMaxDate.setUTCMonth(this._oMaxDate.getUTCMonth() + 1, 0);
				this.setProperty("maxDate", CalendarUtils._createLocalDate(this._oMaxDate), true);
			}

			if (this._oFocusedDate) {
				// check if still in valid range
				if (this._oFocusedDate.getTime() < this._oMinDate.getTime()) {
					jQuery.sap.log.warning("focused date < minDate -> minDate focused", this);
					this.focusDate(oDate);
				}
			}

			if (this._oUTCStartDate && this._oUTCStartDate.getTime() < this._oMinDate.getTime()) {
				jQuery.sap.log.warning("start date < minDate -> minDate set as start date", this);
				_setStartDate.call(this, new UniversalDate(this._oMinDate.getTime()), true, true);
			}

		}

		this.setProperty("minDate", oDate, false); // re-render MonthsRow because visualization can change

		var oYearPicker = this.getAggregation("yearPicker");
		oYearPicker._oMinDate.setUTCFullYear(this._oMinDate.getUTCFullYear());

		return this;

	};

	CalendarMonthInterval.prototype.setMaxDate = function(oDate){

		if (jQuery.sap.equal(oDate, this.getMaxDate())) {
			return this;
		}

		if (!oDate) {
			// restore default
			this._oMaxDate.getJSDate().setUTCFullYear(9999);
			this._oMaxDate.getJSDate().setUTCMonth(11);
			this._oMaxDate.getJSDate().setUTCDate(31);
		} else {
			if (!(oDate instanceof Date)) {
				throw new Error("Date must be a JavaScript date object; " + this);
			}

			this._oMaxDate = CalendarUtils._createUniversalUTCDate(oDate);

			var iYear = this._oMaxDate.getUTCFullYear();
			if (iYear < 1 || iYear > 9999) {
				throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + this);
			}

			if (this._oMinDate.getTime() > this._oMaxDate.getTime()) {
				jQuery.sap.log.warning("maxDate < minDate -> minDate set to begin of the month", this);
				this._oMinDate = CalendarUtils._createUniversalUTCDate(oDate);
				this._oMinDate.setUTCDate(1);
				this.setProperty("minDate", CalendarUtils._createLocalDate(this._oMinDate), true);
			}

			if (this._oFocusedDate) {
				// check if still in valid range
				if (this._oFocusedDate.getTime() > this._oMaxDate.getTime()) {
					jQuery.sap.log.warning("focused date > maxDate -> maxDate focused", this);
					this.focusDate(oDate);
				}
			}

			if (this._oUTCStartDate) {
				var oEndDate = new UniversalDate(this._oUTCStartDate.getTime());
				oEndDate.setUTCDate(1);
				oEndDate.setUTCMonth(oEndDate.getUTCMonth() + this._getMonths());
				oEndDate.setUTCDate(0);
				if (oEndDate.getTime() > this._oMaxDate.getTime()) {
					var oStartDate = new UniversalDate(this._oMaxDate.getTime());
					oStartDate.setUTCDate(1);
					oStartDate.setUTCMonth(oStartDate.getUTCMonth() - this._getMonths() + 1);
					if (oStartDate.getTime() >= this._oMinDate.getTime()) {
						// minDate wins if range is too short
						jQuery.sap.log.warning("end date > maxDate -> maxDate set as end date", this);
						_setStartDate.call(this, oStartDate, true, true);
					}
				}
			}
		}

		this.setProperty("maxDate", oDate, false); // re-render MonthsRow because visualization can change

		var oYearPicker = this.getAggregation("yearPicker");
		oYearPicker._oMaxDate.setUTCFullYear(this._oMaxDate.getUTCFullYear());

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

		switch (this._iMode) {
		case 0: // day picker
			this.fireCancel();
			break;

		case 1: // year picker
			_hideYearPicker.call(this);
			break;
			// no default
		}

	};

	CalendarMonthInterval.prototype.onsaptabnext = function(oEvent){

		// if tab was pressed on a day it should jump to the year button
		var oHeader = this.getAggregation("header");

		if (jQuery.sap.containsOrEquals(this.getDomRef("content"), oEvent.target)) {
			jQuery.sap.focus(oHeader.getDomRef("B2"));

			if (!this._bPoupupMode) {
				// remove Tabindex from day, month, year - to break cycle
				var oMonthsRow = this.getAggregation("monthsRow");
				var oYearPicker = this.getAggregation("yearPicker");
				jQuery(oMonthsRow._oItemNavigation.getItemDomRefs()[oMonthsRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
				if (oYearPicker.getDomRef()) {
					jQuery(oYearPicker._oItemNavigation.getItemDomRefs()[oYearPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
				}
			}

			oEvent.preventDefault();
		}

	};

	CalendarMonthInterval.prototype.onsaptabprevious = function(oEvent){

		var oHeader = this.getAggregation("header");

		if (jQuery.sap.containsOrEquals(this.getDomRef("content"), oEvent.target)) {
			// tab from day or year -> go to header

			if (this._bPoupupMode) {
				jQuery.sap.focus(oHeader.getDomRef("B2"));
				oEvent.preventDefault();
			}
		} else if (oEvent.target.id == oHeader.getId() + "-B2") {
			// focus day or year
			var oMonthsRow = this.getAggregation("monthsRow");
			var oYearPicker = this.getAggregation("yearPicker");
			switch (this._iMode) {
			case 0: // day picker
				oMonthsRow._oItemNavigation.focusItem(oMonthsRow._oItemNavigation.getFocusedIndex());
				break;

			case 1: // year picker
				oYearPicker._oItemNavigation.focusItem(oYearPicker._oItemNavigation.getFocusedIndex());
				break;
				// no default
			}

			oEvent.preventDefault();
		}
	};

	CalendarMonthInterval.prototype.onfocusin = function(oEvent){

		if (oEvent.target.id == this.getId() + "-end") {
			// focus via tab+shift (otherwise not possible to go to this element)
			var oHeader = this.getAggregation("header");
			var oMonthsRow = this.getAggregation("monthsRow");
			var oYearPicker = this.getAggregation("yearPicker");

			jQuery.sap.focus(oHeader.getDomRef("B2"));

			if (!this._bPoupupMode) {
				// remove Tabindex from day, month, year - to break cycle
				jQuery(oMonthsRow._oItemNavigation.getItemDomRefs()[oMonthsRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
				if (oYearPicker.getDomRef()) {
					jQuery(oYearPicker._oItemNavigation.getItemDomRefs()[oYearPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
				}
			}
		}

		// remove tabindex of dummy element if focus is inside calendar
		this.$("end").attr("tabindex", "-1");

	};

	CalendarMonthInterval.prototype.onsapfocusleave = function(oEvent){

		if (!oEvent.relatedControlId || !jQuery.sap.containsOrEquals(this.getDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef())) {
			// put dummy element back to tab-chain
			this.$("end").attr("tabindex", "0");

			if (!this._bPoupupMode) {
				// restore Tabindex from day and year
				var oMonthsRow = this.getAggregation("monthsRow");
				var oYearPicker = this.getAggregation("yearPicker");
				switch (this._iMode) {
				case 0: // day picker
					jQuery(oMonthsRow._oItemNavigation.getItemDomRefs()[oMonthsRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
					break;

				case 1: // year picker
					jQuery(oYearPicker._oItemNavigation.getItemDomRefs()[oYearPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
					break;
					// no default
				}
			}
		}

	};

	CalendarMonthInterval.prototype._handlePrevious = function(oEvent){

		var oFocusedDate = this._getFocusedDate();
		var oYearPicker = this.getAggregation("yearPicker");
		var iMonths = this._getMonths();
		var oStartDate = new UniversalDate(_getStartDate.call(this).getTime());

		switch (this._iMode) {
		case 0: // month picker
			oStartDate.setUTCMonth(oStartDate.getUTCMonth() - iMonths);
			oFocusedDate.setUTCMonth(oFocusedDate.getUTCMonth() - iMonths);
			this._setFocusedDate(oFocusedDate);
			_setStartDate.call(this, oStartDate, true);

			break;

		case 1: // year picker
			oYearPicker.previousPage();
			_togglePrevNexYearPicker.call(this);
			break;
			// no default
		}

	};

	CalendarMonthInterval.prototype._handleNext = function(oEvent){

		var oFocusedDate = this._getFocusedDate();
		var oYearPicker = this.getAggregation("yearPicker");
		var iMonths = this._getMonths();
		var oStartDate = new UniversalDate(_getStartDate.call(this).getTime());

		switch (this._iMode) {
		case 0: // month picker
			oStartDate.setUTCMonth(oStartDate.getUTCMonth() + iMonths);
			oFocusedDate.setUTCMonth(oFocusedDate.getUTCMonth() + iMonths);
			this._setFocusedDate(oFocusedDate);
			_setStartDate.call(this, oStartDate, true);

			break;

		case 1: // year picker
			oYearPicker.nextPage();
			_togglePrevNexYearPicker.call(this);
			break;
			// no default
		}

	};

	CalendarMonthInterval.prototype._getShowItemHeader = function(){

		var iMonths = this.getMonths();
		if (iMonths > this._iDaysMonthsHead) {
			return true;
		}else {
			return false;
		}

	};

	function _setStartDate(oStartDate, bSetFocusDate, bNoEvent){

		var oMaxDate = new UniversalDate(this._oMaxDate.getTime());
		oMaxDate.setUTCDate(1);
		oMaxDate.setUTCMonth(oMaxDate.getUTCMonth() - this._getMonths() + 1);
		if (oMaxDate.getTime() < this._oMinDate.getTime()) {
			// min and max smaller than interval
			oMaxDate = new UniversalDate(this._oMinDate.getTime());
			oMaxDate.setUTCMonth(oMaxDate.getUTCMonth() + this._getMonths() - 1);
		}
		if (oStartDate.getTime() < this._oMinDate.getTime()) {
			oStartDate = this._oMinDate;
		}else if (oStartDate.getTime() > oMaxDate.getTime()){
			oStartDate = oMaxDate;
		}

		oStartDate.setUTCDate(1); // always use begin of month
		var oLocaleDate = CalendarUtils._createLocalDate(oStartDate);
		this.setProperty("startDate", oLocaleDate, true);
		this._oUTCStartDate = oStartDate;

		var oMonthsRow = this.getAggregation("monthsRow");
		oMonthsRow.setStartDate(oLocaleDate);

		_updateHeader.call(this);

		if (bSetFocusDate) {
			var oDate = CalendarUtils._createLocalDate(this._getFocusedDate());
			if (!oMonthsRow.checkDateFocusable(oDate)) {
				//focused date not longer visible -> focus start date
				this._setFocusedDate(oStartDate);
				oMonthsRow.setDate(oLocaleDate);
			}else {
				oMonthsRow.setDate(oDate);
			}
		}

		if (!bNoEvent) {
			this.fireStartDateChange();
		}

	}

	function _getStartDate(){

		if (!this._oUTCStartDate) {
			// no start date set, use focused date
			this._oUTCStartDate = this._getFocusedDate();
			this._oUTCStartDate.setUTCDate(1); // always use begin of month
		}

		return this._oUTCStartDate;

	}

	/*
	 * sets the date in the used Month controls
	 * @param {boolean} bNoFolus if set no focus is set to the date
	 */
	function _renderMonthsRow(bNoFocus){

		var oDate = this._getFocusedDate();
		var oMonthsRow = this.getAggregation("monthsRow");

		if (!bNoFocus) {
			oMonthsRow.setDate(CalendarUtils._createLocalDate(oDate));
		} else {
			oMonthsRow.displayDate(CalendarUtils._createLocalDate(oDate));
		}

		// change month and year
		_updateHeader.call(this);

	}

	function _determineFocusedDate(){

		var aSelectedDates = this.getSelectedDates();
		if (aSelectedDates && aSelectedDates[0] && aSelectedDates[0].getStartDate()) {
			// selected dates are provided -> use first one to focus
			this._oFocusedDate = CalendarUtils._createUniversalUTCDate(aSelectedDates[0].getStartDate());
			this._oFocusedDate.setUTCDate(1); // always use begin of month
		} else {
			// use current date
			var oNewDate = new Date();
			this._oFocusedDate = CalendarUtils._createUniversalUTCDate(oNewDate);
			this._oFocusedDate.setUTCDate(1); // always use begin of month
		}

		if (this._oFocusedDate.getTime() < this._oMinDate.getTime()) {
			this._oFocusedDate = new UniversalDate(this._oMinDate.getTime());
		}else if (this._oFocusedDate.getTime() > this._oMaxDate.getTime()){
			this._oFocusedDate = new UniversalDate(this._oMaxDate.getTime());
		}

	}

	function _showYearPicker(){

		var oDate = this._getFocusedDate();
		var oYearPicker = this.getAggregation("yearPicker");
		if (!this.getPickerPopup()) {
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
			_openPickerPopup.call(this, oYearPicker);
		}
		this.$("contentOver").css("display", "");

		oYearPicker.setDate(oDate.getJSDate());

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

		if (!this.getPickerPopup()) {
			var oYearPicker = this.getAggregation("yearPicker");
			oYearPicker.$().css("display", "none");
		}else if (this._oPopup.isOpen()) {
			this._oPopup.close();
		}
		this.$("contentOver").css("display", "none");

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

		var oDate = new UniversalDate(_getStartDate.call(this).getTime());
		var iMonths = this._getMonths();
		var iYear = oDate.getJSDate().getUTCFullYear();
		var iYearMax = this._oMaxDate.getJSDate().getUTCFullYear();
		var iYearMin = this._oMinDate.getJSDate().getUTCFullYear();
		var iMonth = oDate.getJSDate().getUTCMonth();
		var iMonthMax = this._oMaxDate.getJSDate().getUTCMonth();
		var iMonthMin = this._oMinDate.getJSDate().getUTCMonth();
		var oHeader = this.getAggregation("header");

		if (iYear < iYearMin || (iYear == iYearMin && iMonth <= iMonthMin )) {
			oHeader.setEnabledPrevious(false);
		}else {
			oHeader.setEnabledPrevious(true);
		}

		oDate.setUTCMonth(oDate.getUTCMonth() + iMonths - 1);
		iYear = oDate.getJSDate().getUTCFullYear();
		iMonth = oDate.getJSDate().getUTCMonth();
		if (iYear > iYearMax || (iYear == iYearMax && iMonth >= iMonthMax)) {
			oHeader.setEnabledNext(false);
		}else {
			oHeader.setEnabledNext(true);
		}

	}

	function _togglePrevNexYearPicker(){

		var oYearPicker = this.getAggregation("yearPicker");
		var iYears = oYearPicker.getYears();
		var oDate = CalendarUtils._createUniversalUTCDate(oYearPicker.getFirstRenderedDate());
		oDate.setUTCFullYear(oDate.getUTCFullYear() + Math.floor(iYears / 2));
		var oHeader = this.getAggregation("header");
		var oMaxDate = new UniversalDate(this._oMaxDate);
		oMaxDate.setUTCFullYear(oMaxDate.getUTCFullYear() - Math.ceil(iYears / 2));
		oMaxDate.setUTCMonth(11, 31);
		var oMinDate = new UniversalDate(this._oMinDate);
		oMinDate.setUTCFullYear(oMinDate.getUTCFullYear() + Math.floor(iYears / 2) + 1);
		oMinDate.setUTCMonth(0, 1);

		if (oDate.getTime() > oMaxDate.getTime()) {
			oHeader.setEnabledNext(false);
		} else {
			oHeader.setEnabledNext(true);
		}
		if (oDate.getTime() < oMinDate.getTime()) {
			oHeader.setEnabledPrevious(false);
		} else {
			oHeader.setEnabledPrevious(true);
		}

	}

	function _setHeaderText(){

		// sets the text for the year button to the header
		var sText;
		var oStartDate = _getStartDate.call(this);
		var sStartYear = this._oYearFormat.format(oStartDate, true);
		var oEndDate = new UniversalDate(oStartDate.getTime());
		oEndDate.setUTCMonth(oEndDate.getUTCMonth() + this._getMonths() - 1);
		var sEndYear = this._oYearFormat.format(oEndDate, true);
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

	function _focusDate(oDate, bNotVisible){

		// if a date should be focused thats out of the borders -> focus the border
		var oFocusedDate;
		var bChanged = false;
		if (oDate.getTime() < this._oMinDate.getTime()) {
			oFocusedDate = this._oMinDate;
			bChanged = true;
		}else if (oDate.getTime() > this._oMaxDate.getTime()){
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

	function _displayDate(oDate, bNoFocus){

		if (oDate && (!this._oFocusedDate || this._oFocusedDate.getTime() != oDate.getTime())) {
			if (!(oDate instanceof Date)) {
				throw new Error("Date must be a JavaScript date object; " + this);
			}

			oDate = CalendarUtils._createUniversalUTCDate(oDate);

			var iYear = oDate.getUTCFullYear();
			if (iYear < 1 || iYear > 9999) {
				throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + this);
			}

			if (oDate.getTime() < this._oMinDate.getTime() || oDate.getTime() > this._oMaxDate.getTime()) {
				throw new Error("Date must not be in valid range (minDate and maxDate); " + this);
			}

			this._setFocusedDate(oDate);

			if (this.getDomRef() && this._iMode == 0) {
				_renderMonthsRow.call(this, bNoFocus);
			}
		}

	}

	function _handleButton2(oEvent){

		if (this._iMode != 1) {
			_showYearPicker.call(this);
		} else {
			_hideYearPicker.call(this);
		}

	}

	function _handleSelect(oEvent){

		this.fireSelect();

	}

	function _handleFocus(oEvent){

		var oDate = CalendarUtils._createUniversalUTCDate(oEvent.getParameter("date"));
		var bNotVisible = oEvent.getParameter("notVisible");

		_focusDate.call(this, oDate, bNotVisible);

	}

	function _handleSelectYear(oEvent){

		var oFocusedDate = new UniversalDate(this._getFocusedDate().getTime());
		var oYearPicker = this.getAggregation("yearPicker");
		var oDate = CalendarUtils._createUniversalUTCDate(oYearPicker.getDate());

		oDate.setUTCMonth(oFocusedDate.getUTCMonth(), oFocusedDate.getUTCDate()); // to keep day and month stable also for islamic date
		oFocusedDate = oDate;

		_focusDate.call(this, oFocusedDate, true);

		_hideYearPicker.call(this);

	}

	function _invalidateMonthsRow(){

		this._sInvalidateContent = undefined;

		var oMonthsRow = this.getAggregation("monthsRow");
		oMonthsRow._bDateRangeChanged = true;
		oMonthsRow._bInvalidateSync = true;
		oMonthsRow.invalidate();
		oMonthsRow._bInvalidateSync = undefined;

		this._bDateRangeChanged = undefined;

	}

	function _setStartDateForFocus(oDate) {

		// set start date according to new focused date
		// only if focused date is not in current rendered month interval
		// new focused date should have the same position like the old one
		var oMonthsRow = this.getAggregation("monthsRow");
		var oStartDate = _getStartDate.call(this);
		var iMonth = oMonthsRow._oItemNavigation.getFocusedIndex();
		oStartDate = new UniversalDate(oDate.getTime());
		oStartDate.setUTCMonth( oStartDate.getUTCMonth() - iMonth);
		_setStartDate.call(this, oStartDate, false, true);

	}

	function _openPickerPopup(oPicker){

		if (!this._oPopup) {
			jQuery.sap.require("sap.ui.core.Popup");
			this._oPopup = new sap.ui.core.Popup();
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
		var eDock = sap.ui.core.Popup.Dock;
		this._oPopup.open(0, eDock.CenterTop, eDock.CenterBottom, oHeader, null, "flipfit", true);

	}

	function _handlePopupClosed(oEvent) {

		switch (this._iMode) {
		case 0: // month picker
			break;

		case 1: // year picker
			_hideYearPicker.call(this);
			break;
			// no default
		}

	}

	function _handleYearPickerPageChange(oEvent) {

		_togglePrevNexYearPicker.call(this);

	}

	return CalendarMonthInterval;

}, /* bExport= */ true);
