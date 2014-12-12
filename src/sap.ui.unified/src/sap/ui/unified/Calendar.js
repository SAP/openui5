/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.Calendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', 'sap/ui/model/type/Date', 'sap/ui/unified/calendar/CalendarUtils',
               './calendar/Header', './calendar/Month', './calendar/MonthPicker', './calendar/YearPicker', './library'],
	function(jQuery, Control, LocaleData, Date1, CalendarUtils, Header, Month, MonthPicker, YearPicker, library) {
	"use strict";

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
			intervalSelection : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * If set, only a single date or interval, if intervalSelection is enabled, can be selected
			 */
			singleSelection : {type : "boolean", group : "Misc", defaultValue : true}
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
			month : {type : "sap.ui.unified.calendar.Month", multiple : false, visibility : "hidden"},
			monthPicker : {type : "sap.ui.unified.calendar.MonthPicker", multiple : false, visibility : "hidden"},
			yearPicker : {type : "sap.ui.unified.calendar.YearPicker", multiple : false, visibility : "hidden"}

		},
		events : {

			/**
			 * Date selection changed
			 */
			select : {},

			/**
			 * Date selection was cancelled
			 */
			cancel : {}
		}
	}});

	/*
	 * There are different modes (stored in this._iMode)
	 * The standard is 0, that means a calendar showing a calendar with the days of one month.
	 * If 1 a month picker is shown.
	 * if 2 a year picker is shown.
	 */

	(function() {

		Calendar.prototype.init = function(){

			this._iMode = 0; // days are shown

			this._oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyyMMdd"});

			this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

			this._oMinDate = new Date(Date.UTC(1, 0, 1));
			this._oMinDate.setUTCFullYear(1); // otherwise year 1 will be converted to year 1901
			this._oMaxDate = new Date(Date.UTC(9999, 11, 31));

			var oHeader = new Header(this.getId() + "--Head");
			oHeader.attachEvent("pressPrevious", _handlePrevious, this);
			oHeader.attachEvent("pressNext", _handleNext, this);
			oHeader.attachEvent("pressButton1", _handleButton1, this);
			oHeader.attachEvent("pressButton2", _handleButton2, this);
			this.setAggregation("header",oHeader);

			var oMonth = new Month(this.getId() + "--Month");
			oMonth.attachEvent("focus", _handleFocus, this);
			oMonth.attachEvent("select", _handleSelect, this);
			oMonth.attachEvent("_renderMonth", _handleRenderMonth, this);
			this.setAggregation("month",oMonth);

			var oMonthPicker = new MonthPicker(this.getId() + "--MP");
			oMonthPicker.attachEvent("select", _handleSelectMonth, this);
			this.setAggregation("monthPicker",oMonthPicker);

			var oYearPicker = new YearPicker(this.getId() + "--YP");
			oYearPicker.attachEvent("select", _handleSelectYear, this);
			this.setAggregation("yearPicker",oYearPicker);

		};

		Calendar.prototype.exit = function(){

		};

		sap.ui.unified.Calendar.prototype.onBeforeRendering = function(){

			var oDate = this._getFocusedDate();
			var oLocaleData = this._getLocaleData();
			var iMonth = oDate.getUTCMonth();
			var aMonthNames = [];
			if (this._bLongMonth || !this._bNamesLengthChecked) {
				aMonthNames = oLocaleData.getMonthsStandAlone("wide");
			} else {
				aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated");
			}

			// get text for month and year button
			var oHeader = this.getAggregation("header");
			oHeader.setTextButton1(aMonthNames[iMonth]);
			oHeader.setTextButton2((oDate.getUTCFullYear()).toString());

			var oMonth = this.getAggregation("month");
			oMonth.setDate(oDate);

		};

		Calendar.prototype.onAfterRendering = function(){

			var that = this;

			// check if day names and month names are too big -> use smaller ones
			_checkNamesLength(that);

			_togglePrevNext(that, this._getFocusedDate(), true);

		};

		// overwrite invalidate to recognize changes on selectedDates
		Calendar.prototype.invalidate = function(oOrigin) {

			if (!oOrigin || !(oOrigin instanceof sap.ui.unified.DateRange)) {
				Control.prototype.invalidate.apply(this, arguments);
			} else if (this.getDomRef() && this._iMode == 0) {
				// DateRange changed -> only rerender days
				var oMonth = this.getAggregation("month");
				oMonth.invalidate(oOrigin);
			}

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
				var that = this;
				_determineFocusedDate(that);
			}

			return this._oFocusedDate;

		};

		Calendar.prototype._setFocusedDate = function(oDate){

			this._oFocusedDate = new Date(oDate);

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

			if (oDate && (!this._oFocusedDate || this._oFocusedDate.getTime() != oDate.getTime())) {
				if (!(oDate instanceof Date)) {
					throw new Error("Date must be a JavaScript date object; " + this);
				}

				var iYear = oDate.getFullYear();
				if (iYear < 1 || iYear > 9999) {
					throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + this);
				}

				this._setFocusedDate(CalendarUtils._createUTCDate(oDate));

				if (this.getDomRef() && this._iMode == 0) {
					var that = this;
					_renderMonth(that);
				}
			}

			return this;

		};

		/**
		 * sets the Popup mode
		 * e.G. Tab-chain should not leave calendar
		 * only for internal use
		 * @param {boolean} bPoupupMode <code>PopupMode</code>
		 * @private
		 */
		Calendar.prototype.setPopupMode = function(bPoupupMode){

			this._bPoupupMode = bPoupupMode;

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

			var that = this;

			switch (this._iMode) {
			case 0: // day picker
				this.fireCancel();
				break;

			case 1: // month picker
				_hideMonthPicker(that);
				break;

			case 2: // year picker
				_hideYearPicker(that);
				break;
				// no default
			}

		};

		Calendar.prototype.onsapshow = function(oEvent){

			if (this._bPoupupMode) {
				var that = this;
				switch (this._iMode) {
				case 1: // month picker
					_hideMonthPicker(that);
					break;

				case 2: // year picker
					_hideYearPicker(that);
					break;
					// no default
				}
				this.fireCancel();

				oEvent.preventDefault(); // otherwise IE opens the address bar history

			}

		};

		Calendar.prototype.onsaphide = Calendar.prototype.onsapshow;

		Calendar.prototype.onsaptabnext = function(oEvent){

			// if tab was pressed on a day it should jump to the month and then to the year button
			var oHeader = this.getAggregation("header");
			var oMonth = this.getAggregation("month");
			var oMonthPicker = this.getAggregation("monthPicker");
			var oYearPicker = this.getAggregation("yearPicker");

			if (jQuery.sap.containsOrEquals(oMonth.getDomRef(), oEvent.target) ||
					jQuery.sap.containsOrEquals(oMonthPicker.getDomRef(), oEvent.target) ||
					jQuery.sap.containsOrEquals(oYearPicker.getDomRef(), oEvent.target)) {
				// tab from Day, month or year -> go to header
				jQuery.sap.focus(oHeader.getDomRef("B1"));

				if (!this._bPoupupMode) {
					// remove Tabindex from day, month, year - to break cycle
					jQuery(oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
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
			var oMonth = this.getAggregation("month");
			var oMonthPicker = this.getAggregation("monthPicker");
			var oYearPicker = this.getAggregation("yearPicker");

			if (jQuery.sap.containsOrEquals(oMonth.getDomRef(), oEvent.target) ||
					jQuery.sap.containsOrEquals(oMonthPicker.getDomRef(), oEvent.target) ||
					jQuery.sap.containsOrEquals(oYearPicker.getDomRef(), oEvent.target)) {
				// tab from day, month or year -> go to header

				if (this._bPoupupMode) {
					jQuery.sap.focus(oHeader.getDomRef("B2"));
					oEvent.preventDefault();
				}
			} else if (oEvent.target.id == oHeader.getId() + "-B1") {
				// focus day, month or year
				switch (this._iMode) {
				case 0: // day picker
					oMonth._oItemNavigation.focusItem(oMonth._oItemNavigation.getFocusedIndex());
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
				var oMonth = this.getAggregation("month");
				var oMonthPicker = this.getAggregation("monthPicker");
				var oYearPicker = this.getAggregation("yearPicker");

				jQuery.sap.focus(oHeader.getDomRef("B2"));

				if (!this._bPoupupMode) {
					// remove Tabindex from day, month, year - to break cycle
					jQuery(oMonth._oItemNavigation.getItemDomRefs()[oMonth._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
					if (oMonthPicker.getDomRef()) {
						jQuery(oMonthPicker._oItemNavigation.getItemDomRefs()[oMonthPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
					}
					if (oYearPicker.getDomRef()) {
						jQuery(oYearPicker._oItemNavigation.getItemDomRefs()[oYearPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
					}
				}
			}

			// remove tabindex of dummy element if focus is inside calendar
			jQuery.sap.byId(this.getId() + "-end").attr("tabindex", "-1");

		};

		Calendar.prototype.onsapfocusleave = function(oEvent){

			if (!oEvent.relatedControlId || !jQuery.sap.containsOrEquals(this.getDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef())) {
				// put dummy element back to tab-chain
				jQuery.sap.byId(this.getId() + "-end").attr("tabindex", "0");
			}

		};

		function _renderMonth(oThis){

			var oDate = oThis._getFocusedDate();
			var oMonth = oThis.getAggregation("month");
			oMonth.setDate(oDate);

			// change month and year
			var aMonthNames = [];
			if (oThis._bLongMonth || !oThis._bNamesLengthChecked) {
				aMonthNames = oThis._getLocaleData().getMonthsStandAlone("wide");
			} else {
				aMonthNames = oThis._getLocaleData().getMonthsStandAlone("abbreviated");
			}
			var oHeader = oThis.getAggregation("header");
			oHeader.setTextButton1(aMonthNames[oDate.getUTCMonth()]);
			oHeader.setTextButton2((oDate.getUTCFullYear()).toString());

			_togglePrevNext(oThis, oDate, true);

		}

		function _determineFocusedDate(oThis){

			var aSelectedDates = oThis.getSelectedDates();
			if (aSelectedDates && aSelectedDates[0] && aSelectedDates[0].getStartDate()) {
				// selected dates are provided -> use first one to focus
				oThis._oFocusedDate = CalendarUtils._createUTCDate(aSelectedDates[0].getStartDate());
			} else {
				// use current date
				var newDate = new Date();
				oThis._oFocusedDate = CalendarUtils._createUTCDate(newDate);
			}

		}

		function _showMonthPicker(oThis){

			if (oThis._iMode == 2) {
				_hideYearPicker(oThis);
			}

			var oDate = oThis._getFocusedDate();
			var oMonthPicker = oThis.getAggregation("monthPicker");
			if (oMonthPicker.getDomRef()) {
				// already rendered
				oMonthPicker.$().css("display", "");
			} else {
				var oRm = sap.ui.getCore().createRenderManager();
				var $Container = oThis.$("content");
				oRm.renderControl(oMonthPicker);
				oRm.flush($Container[0], false, true); // insert it
				oRm.destroy();
			}

			oMonthPicker.setMonth(oDate.getUTCMonth());
			oThis._iMode = 1;

			_togglePrevNext(oThis, oDate, false);

		}

		function _hideMonthPicker(oThis){

			oThis._iMode = 0;

			var oMonthPicker = oThis.getAggregation("monthPicker");
			oMonthPicker.$().css("display", "none");

			var oFocusedDate = oThis._getFocusedDate();
			var oMonth = oThis.getAggregation("month");
			oMonth.setDate(new Date(oFocusedDate.getTime()));
			_togglePrevNext(oThis, oFocusedDate, true);

		}

		function _showYearPicker(oThis){

			if (oThis._iMode == 1) {
				_hideMonthPicker(oThis);
			}

			var oDate = oThis._getFocusedDate();
			var iYear = oDate.getUTCFullYear();
			var iYearMax = oThis._oMaxDate.getUTCFullYear();
			var iYearMin = oThis._oMinDate.getUTCFullYear();

			if (iYearMax - iYearMin <= 20) {
				return;
			}

			var oHeader = oThis.getAggregation("header");

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

			var oYearPicker = oThis.getAggregation("yearPicker");
			if (oYearPicker.getDomRef()) {
				// already rendered
				oYearPicker.$().css("display", "");
			} else {
				var oRm = sap.ui.getCore().createRenderManager();
				var $Container = oThis.$("content");
				oRm.renderControl(oYearPicker);
				oRm.flush($Container[0], false, true); // insert it
				oRm.destroy();
			}

			oYearPicker.setYear(iYear);

			// check special case if only 4 weeks are displayed (e.g. February 2021) -> top padding must be removed
			var oMonth = oThis.getAggregation("month");
			var aDomRefs = oMonth.$("days").children(".sapUiCalDay");
			if (aDomRefs.length == 28) {
				oYearPicker.$().addClass("sapUiCalYearNoTop");
			}else {
				oYearPicker.$().removeClass("sapUiCalYearNoTop");
			}

			oThis._iMode = 2;

		}

		function _hideYearPicker(oThis){

			oThis._iMode = 0;

			var oYearPicker = oThis.getAggregation("yearPicker");
			oYearPicker.$().css("display", "none");

			var oFocusedDate = oThis._getFocusedDate();
			var oMonth = oThis.getAggregation("month");
			oMonth.setDate(new Date(oFocusedDate.getTime()));
			_togglePrevNext(oThis, oFocusedDate, true);

		}

		function _checkNamesLength(oThis){

			if (!oThis._bNamesLengthChecked) {
				// check month names
				_showMonthPicker(oThis);
				_hideMonthPicker(oThis);

				var oMonthPicker = oThis.getAggregation("monthPicker");
				oThis._bLongMonth = oMonthPicker._bLongMonth;

				oThis._bNamesLengthChecked = true;

				if (!oThis._bLongMonth) {
					// update short month name (long name used by default)
					var oDate = oThis._getFocusedDate();
					var oLocaleData = oThis._getLocaleData();
					var iMonth = oDate.getUTCMonth();
					var aMonthNames = [];
					aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated");

					// get text for month and year button
					var oHeader = oThis.getAggregation("header");
					oHeader.setTextButton1(aMonthNames[iMonth]);
				}
			}

		}

		function _togglePrevNext (oThis, oDate, bCheckMonth){

			var iYear = oDate.getUTCFullYear();
			var iYearMax = oThis._oMaxDate.getUTCFullYear();
			var iYearMin = oThis._oMinDate.getUTCFullYear();
			var iMonth = oDate.getUTCMonth();
			var iMonthMax = oThis._oMaxDate.getUTCMonth();
			var iMonthMin = oThis._oMinDate.getUTCMonth();
			var oHeader = oThis.getAggregation("header");

			if (iYear > iYearMax || (iYear == iYearMax && ( !bCheckMonth || iMonth >= iMonthMax ))) {
				oHeader.setEnabledNext(false);
			}else {
				oHeader.setEnabledNext(true);
			}

			if (iYear < iYearMin || (iYear == iYearMin && ( !bCheckMonth || iMonth <= iMonthMin ))) {
				oHeader.setEnabledPrevious(false);
			}else {
				oHeader.setEnabledPrevious(true);
			}

		}

		function _focusDate (oThis, oDate){

			// if a date should be focused thats out of the borders -> focus the border
			var oFocusedDate;
			if (oDate.getTime() < oThis._oMinDate.getTime()) {
				oFocusedDate = oThis._oMinDate;
			}else if (oDate.getTime() > oThis._oMaxDate.getTime()){
				oFocusedDate = oThis._oMaxDate;
			}else {
				oFocusedDate = oDate;
			}

			oThis._setFocusedDate(oFocusedDate);

			var oMonth = oThis.getAggregation("month");
			oMonth.setDate(new Date(oFocusedDate.getTime()));

		}

		// handlers for sub-controls
		function _handlePrevious (oEvent){

			var that = this;
			var oFocusedDate = this._getFocusedDate();
			var oHeader = this.getAggregation("header");
			var oYearPicker = this.getAggregation("yearPicker");

			switch (this._iMode) {
			case 0: // day picker
				oFocusedDate.setUTCDate(1);
				oFocusedDate.setUTCDate(oFocusedDate.getUTCDate() - 1);
				_renderMonth(that);
				break;

			case 1: // month picker
				oFocusedDate.setUTCFullYear(oFocusedDate.getUTCFullYear() - 1);
				oHeader.setTextButton2((oFocusedDate.getUTCFullYear()).toString());
				_togglePrevNext(that, oFocusedDate);
				break;

			case 2: // year picker
				oYearPicker.previousPage();
				break;
				// no default
			}

		}

		function _handleNext (oEvent){

			var that = this;
			var oFocusedDate = this._getFocusedDate();
			var oHeader = this.getAggregation("header");
			var oYearPicker = this.getAggregation("yearPicker");

			switch (this._iMode) {
			case 0: // day picker
				oFocusedDate.setUTCMonth(oFocusedDate.getUTCMonth() + 1, 1);
				_renderMonth(that);
				break;

			case 1: // month picker
				oFocusedDate.setUTCFullYear(oFocusedDate.getUTCFullYear() + 1);
				oHeader.setTextButton2((oFocusedDate.getUTCFullYear()).toString());
				_togglePrevNext(that, oFocusedDate);
				break;

			case 2: // year picker
				oYearPicker.nextPage();
				break;
				// no default
			}

		}

		function _handleButton1 (oEvent){

			var that = this;

			if (this._iMode != 1) {
				_showMonthPicker(that);
			} else {
				_hideMonthPicker(that);
			}

		}

		function _handleButton2 (oEvent){

			var that = this;

			if (this._iMode != 2) {
				_showYearPicker(that);
			} else {
				_hideYearPicker(that);
			}

		}

		function _handleRenderMonth (oEvent){

			// fire internal event for DatePicker for with number of rendered days. If Calendar becomes larger maybe popup must change position
			this.fireEvent("_renderMonth", {days: oEvent.getParameter("days")});

		}

		function _handleSelect (oEvent){

			this.fireSelect();

		}

		function _handleFocus (oEvent){

			var oDate = oEvent.getParameter("date");
			var bOtherMonth = oEvent.getParameter("otherMonth");
			var that = this;

			_focusDate(that, oDate);

			if (bOtherMonth) {
				var aMonthNames = [];
				if (this._bLongMonth || !this._bNamesLengthChecked) {
					aMonthNames = this._getLocaleData().getMonthsStandAlone("wide");
				} else {
					aMonthNames = this._getLocaleData().getMonthsStandAlone("abbreviated");
				}
				var oHeader = this.getAggregation("header");
				oHeader.setTextButton1(aMonthNames[oDate.getUTCMonth()]);
				oHeader.setTextButton2((oDate.getUTCFullYear()).toString());
			}

		}

		function _handleSelectMonth (oEvent){

			var oFocusedDate = this._getFocusedDate();
			var oMonthPicker = this.getAggregation("monthPicker");
			var iMonth = oMonthPicker.getMonth();
			var that = this;

			oFocusedDate.setUTCMonth(iMonth);

			if (iMonth != oFocusedDate.getUTCMonth() ) {
				// day did not exist in this month (e.g. 31) -> go to last day of month
				oFocusedDate.setUTCDate(0);
			}

			if (oFocusedDate.getTime() < this._oMinDate.getTime()) {
				this._setFocusedDate(this._oMinDate);
			}else if (oFocusedDate.getTime() > this._oMaxDate.getTime()){
				this._setFocusedDate(this._oMaxDate);
			}

			_renderMonth(that);

			_hideMonthPicker(that);

		}

		function _handleSelectYear (oEvent){

			var oFocusedDate = this._getFocusedDate();
			var oYearPicker = this.getAggregation("yearPicker");
			var iYear = oYearPicker.getYear();
			var that = this;

			oFocusedDate.setUTCFullYear(iYear);

			if (oFocusedDate.getTime() < this._oMinDate.getTime()) {
				this._setFocusedDate(this._oMinDate);
			}else if (oFocusedDate.getTime() > this._oMaxDate.getTime()){
				this._setFocusedDate(this._oMaxDate);
			}

			_renderMonth(that);

			_hideYearPicker(that);

		}

	}());

	return Calendar;

}, /* bExport= */ true);
