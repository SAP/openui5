/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.Calendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', 'sap/ui/model/type/Date', 'sap/ui/unified/calendar/CalendarUtils',
               './calendar/Header', './calendar/MonthsRow', './calendar/MonthPicker', './calendar/YearPicker', 'sap/ui/core/date/UniversalDate', './library'],
	function(jQuery, Control, LocaleData, Date1, CalendarUtils, Header, MonthsRow, MonthPicker, YearPicker, UniversalDate, library) {
	"use strict";

	/*
	 * Inside the CalendarMonthInterval UniversalDate objects are used. But in the API JS dates are used.
	 * So conversion must be done on API functions.
	 */

	/**
	 * Constructor for a new CalendarMonthInterval.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Calendar with granularity of months displayed in one line.
	 *
	 * <b>Note:</b> JavaScript Date objects are used to set and return the months, mark them as selected or as special type.
	 * But the date part of the DateObject is not used. If a Date object is returned the date will be set to the 1st of the corresponding month.
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
			 * Width of the <code>CalendarMonthInterval</code>. The width of the single months depends of this width.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Start date of the Interval as JavaScript Date object.
			 * The month of this Date will be the first month in the displayed row.
			 */
			startDate : {type : "object", group : "Misc"},

			/**
			 * If set, interval selection is allowed
			 */
			intervalSelection : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * If set, only a single date or interval, if intervalSelection is enabled, can be selected
			 *
			 * <b>Note:</b> Selection of multiple intervals is not supported in the current version.
			 */
			singleSelection : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Number of months displayed
			 *
			 * <b>Note:</b> On phones always maximum 6 months are displayed in the row.
			 */
			months : {type : "int", group : "Misc", defaultValue : 12}
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
			 * <b>Note:</b> Even if only one day is set as special day, the whole corresponding month is displayed in this way.
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
			 * Association to controls / ids which label this control (see WAI-ARIA attribute aria-labelledby).
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
			cancel : {}
		}
	}});

	/*
	 * There are different modes (stored in this._iMode)
	 * The standard is 0, that means a calendar showing a calendar with the days of one month.
	 * If 1 a year picker is shown.
	 */

	(function() {

		CalendarMonthInterval.prototype.init = function(){

			this._iMode = 0; // months are shown

			this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

			this._oMinDate = new UniversalDate(UniversalDate.UTC(1, 0, 1));
			this._oMinDate.setUTCFullYear(1); // otherwise year 1 will be converted to year 1901
			this._oMaxDate = new UniversalDate(UniversalDate.UTC(9999, 11, 31));

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

			var that = this;
			_updateHeader(that);

			oMonthsRow.setDate(CalendarUtils._createLocalDate(oDate));

		};

//		CalendarMonthInterval.prototype.onAfterRendering = function(){
//
//		};

		CalendarMonthInterval.prototype.setStartDate = function(oStartDate){

			if (!(oStartDate instanceof Date)) {
				throw new Error("Date must be a JavaScript date object; " + this);
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

			var that = this;
			_updateHeader(that);

			var oDate = CalendarUtils._createLocalDate(this._getFocusedDate());
			if (!oMonthsRow.checkDateFocusable(oDate)) {
				//focused date not longer visible -> focus start date
				this._setFocusedDate(this._oUTCStartDate);
				oMonthsRow.setDate(oStartDate);
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
				var that = this;
				this._sInvalidateContent = jQuery.sap.delayedCall(0, that, _invalidateMonthsRow, [that]);
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
		 * sets the locale for the DatePicker
		 * only for internal use
		 * @param {string} sLocale  new value for <code>locale</code>
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
		 * gets the used locale for the <code>CalendarMonthInterval</code>
		 * only for internal use
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
				var that = this;
				_determineFocusedDate(that);
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

			var oMonthsRow = this.getAggregation("monthsRow");
			var that = this;
			if (!oMonthsRow.checkDateFocusable(oDate)) {
				var oUTCDate = CalendarUtils._createUniversalUTCDate(oDate);
				_setStartDateForFocus(that, oUTCDate);
			}

			_displayDate(that, oDate, false);

			return this;

		};

		/**
		 * Displays a month in the <code>CalendarMonthInterval</code> but don't set the focus.
		 *
		 * @param {object} oDate JavaScript date object for displayed date. (The month of this date will be displayed.)
		 * @returns {sap.ui.unified.Calendar} <code>this</code> to allow method chaining
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		CalendarMonthInterval.prototype.displayDate = function(oDate){

			var that = this;
			_displayDate(that, oDate, true);

			return this;

		};

		CalendarMonthInterval.prototype.setMonths = function(iMonths){

			this.setProperty("months", iMonths, true);

			iMonths = this._getMonths(); // to use phone limit

			var oMonthsRow = this.getAggregation("monthsRow");
			oMonthsRow.setMonths(iMonths);

			// check if focused date still is valid
			var that = this;
			var oDate = CalendarUtils._createLocalDate(this._getFocusedDate());
			if (!oMonthsRow.checkDateFocusable(oDate)) {
				//focused date not longer visible -> focus start date
				var oStartDate = _getStartDate(that);
				this._setFocusedDate(this._oUTCStartDate);
				oMonthsRow.setDate(CalendarUtils._createLocalDate(oStartDate));
			}

			var oYearPicker = this.getAggregation("yearPicker");
			var iYears = Math.floor(iMonths / 2);
			if (iYears > 20) {
				iYears = 20;
			}
			oYearPicker.setYears(iYears);

			var that = this;
			_updateHeader(that);

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

			var that = this;

			switch (this._iMode) {
			case 0: // day picker
				this.fireCancel();
				break;

			case 1: // year picker
				_hideYearPicker(that);
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
			jQuery.sap.byId(this.getId() + "-end").attr("tabindex", "-1");

		};

		CalendarMonthInterval.prototype.onsapfocusleave = function(oEvent){

			if (!oEvent.relatedControlId || !jQuery.sap.containsOrEquals(this.getDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef())) {
				// put dummy element back to tab-chain
				jQuery.sap.byId(this.getId() + "-end").attr("tabindex", "0");

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

			var that = this;
			var oFocusedDate = this._getFocusedDate();
			var oYearPicker = this.getAggregation("yearPicker");
			var iMonths = this._getMonths();
			var oStartDate = new UniversalDate(_getStartDate(that).getTime());

			switch (this._iMode) {
			case 0: // month picker
				oStartDate.setUTCMonth(oStartDate.getUTCMonth() - iMonths);
				oFocusedDate.setUTCMonth(oFocusedDate.getUTCMonth() - iMonths);
				this._setFocusedDate(oFocusedDate);
				_setStartDate(that, oStartDate, true);

				break;

			case 1: // year picker
				oYearPicker.previousPage();
				break;
				// no default
			}

		};

		CalendarMonthInterval.prototype._handleNext = function(oEvent){

			var that = this;
			var oFocusedDate = this._getFocusedDate();
			var oYearPicker = this.getAggregation("yearPicker");
			var iMonths = this._getMonths();
			var oStartDate = new UniversalDate(_getStartDate(that).getTime());

			switch (this._iMode) {
			case 0: // month picker
				oStartDate.setUTCMonth(oStartDate.getUTCMonth() + iMonths);
				oFocusedDate.setUTCMonth(oFocusedDate.getUTCMonth() + iMonths);
				this._setFocusedDate(oFocusedDate);
				_setStartDate(that, oStartDate, true);

				break;

			case 1: // year picker
				oYearPicker.nextPage();
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

		function _setStartDate(oThis, oStartDate, bSetFocusDate){

			var oMaxDate = new UniversalDate(oThis._oMaxDate.getTime());
			oMaxDate.setUTCMonth(oMaxDate.getUTCDate() - oThis._getMonths());
			if (oStartDate.getTime() < oThis._oMinDate.getTime()) {
				oStartDate = oThis._oMinDate;
			}else if (oStartDate.getTime() > oMaxDate.getTime()){
				oStartDate = oMaxDate;
			}

			oStartDate.setUTCDate(1); // always use begin of month
			var oLocaleDate = CalendarUtils._createLocalDate(oStartDate);
			oThis.setProperty("startDate", oLocaleDate, true);
			oThis._oUTCStartDate = oStartDate;

			var oMonthsRow = oThis.getAggregation("monthsRow");
			oMonthsRow.setStartDate(oLocaleDate);

			_updateHeader(oThis);

			if (bSetFocusDate) {
				var oDate = CalendarUtils._createLocalDate(oThis._getFocusedDate());
				if (!oMonthsRow.checkDateFocusable(oDate)) {
					//focused date not longer visible -> focus start date
					oThis._setFocusedDate(oStartDate);
					oMonthsRow.setDate(oLocaleDate);
				}else {
					oMonthsRow.setDate(oDate);
				}
			}

		}

		function _getStartDate(oThis){

			if (!oThis._oUTCStartDate) {
				// no start date set, use focused date
				oThis._oUTCStartDate = oThis._getFocusedDate();
				oThis._oUTCStartDate.setUTCDate(1); // always use begin of month
			}

			return oThis._oUTCStartDate;

		}

		/*
		 * sets the date in the used Month controls
		 * @param {sap.ui.unified.Calendar} oThis Calendar instance
		 * @param {boolean} bNoFolus if set no focus is set to the date
		 */
		function _renderMonthsRow(oThis, bNoFocus){

			var oDate = oThis._getFocusedDate();
			var oMonthsRow = oThis.getAggregation("monthsRow");

			if (!bNoFocus) {
				oMonthsRow.setDate(CalendarUtils._createLocalDate(oDate));
			} else {
				oMonthsRow.displayDate(CalendarUtils._createLocalDate(oDate));
			}

			// change month and year
			_updateHeader(oThis);

		}

		function _determineFocusedDate(oThis){

			var aSelectedDates = oThis.getSelectedDates();
			if (aSelectedDates && aSelectedDates[0] && aSelectedDates[0].getStartDate()) {
				// selected dates are provided -> use first one to focus
				oThis._oFocusedDate = CalendarUtils._createUniversalUTCDate(aSelectedDates[0].getStartDate());
				oThis._oFocusedDate.setUTCDate(1); // always use begin of month
			} else {
				// use current date
				var oNewDate = new Date();
				oThis._oFocusedDate = CalendarUtils._createUniversalUTCDate(oNewDate);
				oThis._oFocusedDate.setUTCDate(1); // always use begin of month
			}

		}

		function _showYearPicker(oThis){

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
			oThis.$("contentOver").css("display", "");

			oYearPicker.setYear(iYear);

			if (oThis._iMode == 0) {
				// remove tabindex from month
				var oMonthsRow = oThis.getAggregation("monthsRow");

				jQuery(oMonthsRow._oItemNavigation.getItemDomRefs()[oMonthsRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
			}

			oThis._iMode = 1;

		}

		function _hideYearPicker(oThis, bNoFocus){

			oThis._iMode = 0;

			var oYearPicker = oThis.getAggregation("yearPicker");
			oYearPicker.$().css("display", "none");
			oThis.$("contentOver").css("display", "none");

			if (!bNoFocus) {
				_renderMonthsRow(oThis); // to focus date

					// restore tabindex because if date not changed in _renderMonthsRow only the focused date is updated
				var oMonthsRow = oThis.getAggregation("monthsRow");
				jQuery(oMonthsRow._oItemNavigation.getItemDomRefs()[oMonthsRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
			}

		}

		function _updateHeader(oThis){

			_setHeaderText(oThis);
			_togglePrevNext(oThis);

		}

		function _togglePrevNext (oThis){

			var oDate = new UniversalDate(_getStartDate(oThis).getTime());
			var iMonths = oThis._getMonths();
			var iYear = oDate.getUTCFullYear();
			var iYearMax = oThis._oMaxDate.getUTCFullYear();
			var iYearMin = oThis._oMinDate.getUTCFullYear();
			var iMonth = oDate.getUTCMonth();
			var iMonthMax = oThis._oMaxDate.getUTCMonth();
			var iMonthMin = oThis._oMinDate.getUTCMonth();
			var oHeader = oThis.getAggregation("header");

			if (iYear < iYearMin || (iYear == iYearMin && iMonth <= iMonthMin )) {
				oHeader.setEnabledPrevious(false);
			}else {
				oHeader.setEnabledPrevious(true);
			}

			oDate.setUTCMonth(oDate.getUTCMonth() + iMonths - 1);
			iYear = oDate.getUTCFullYear();
			iMonth = oDate.getUTCMonth();
			if (iYear > iYearMax || (iYear == iYearMax && iMonth >= iMonthMax)) {
				oHeader.setEnabledNext(false);
			}else {
				oHeader.setEnabledNext(true);
			}

		}

		function _setHeaderText (oThis){

			// sets the text for the year button to the header
			var sText;
			var oStartDate = _getStartDate(oThis);
			var iStartYear = oStartDate.getUTCFullYear();
			var oEndDate = new UniversalDate(oStartDate.getTime());
			oEndDate.setUTCMonth(oEndDate.getUTCMonth() + oThis._getMonths() - 1);
			var iEndYear = oEndDate.getUTCFullYear();
			if (iStartYear != iEndYear) {
				var oLocaleData = oThis._getLocaleData();
				var sPattern = oLocaleData.getIntervalPattern();
				sText = sPattern.replace(/\{0\}/, iStartYear.toString()).replace(/\{1\}/, iEndYear.toString());
			} else {
				sText = iStartYear.toString();
			}

			var oHeader = oThis.getAggregation("header");
			oHeader.setTextButton2(sText);

		}

		function _focusDate (oThis, oDate, bNotVisible){

			// if a date should be focused thats out of the borders -> focus the border
			var oFocusedDate;
			var bChanged = false;
			if (oDate.getTime() < oThis._oMinDate.getTime()) {
				oFocusedDate = oThis._oMinDate;
				bChanged = true;
			}else if (oDate.getTime() > oThis._oMaxDate.getTime()){
				oFocusedDate = oThis._oMaxDate;
				bChanged = true;
			}else {
				oFocusedDate = oDate;
			}

			oThis._setFocusedDate(oFocusedDate);

			if (bChanged || bNotVisible) {
				_setStartDateForFocus(oThis, oFocusedDate);
				_renderMonthsRow(oThis, false);
			}

		}

		function _displayDate (oThis, oDate, bNoFocus){

			if (oDate && (!oThis._oFocusedDate || oThis._oFocusedDate.getTime() != oDate.getTime())) {
				if (!(oDate instanceof Date)) {
					throw new Error("Date must be a JavaScript date object; " + oThis);
				}

				oDate = CalendarUtils._createUniversalUTCDate(oDate);

				var iYear = oDate.getUTCFullYear();
				if (iYear < 1 || iYear > 9999) {
					throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + oThis);
				}

				oThis._setFocusedDate(oDate);

				if (oThis.getDomRef() && oThis._iMode == 0) {
					_renderMonthsRow(oThis, bNoFocus);
				}
			}

		}

		function _handleButton2 (oEvent){

			var that = this;

			if (this._iMode != 1) {
				_showYearPicker(that);
			} else {
				_hideYearPicker(that);
			}

		}

		function _handleSelect (oEvent){

			this.fireSelect();

		}

		function _handleFocus (oEvent){

			var oDate = CalendarUtils._createUniversalUTCDate(oEvent.getParameter("date"));
			var bNotVisible = oEvent.getParameter("notVisible");
			var that = this;

			_focusDate(that, oDate, bNotVisible);

		}

		function _handleSelectYear (oEvent){

			var oFocusedDate = new UniversalDate(this._getFocusedDate().getTime());
			var oYearPicker = this.getAggregation("yearPicker");
			var iYear = oYearPicker.getYear();
			var that = this;

			oFocusedDate.setUTCFullYear(iYear);

			_focusDate(that, oFocusedDate, true);

			_hideYearPicker(that);

		}

		function _invalidateMonthsRow(oThis){

			oThis._sInvalidateContent = undefined;

			var oMonthsRow = oThis.getAggregation("monthsRow");
			oMonthsRow._bDateRangeChanged = true;
			oMonthsRow._bInvalidateSync = true;
			oMonthsRow.invalidate();
			oMonthsRow._bInvalidateSync = undefined;

			oThis._bDateRangeChanged = undefined;

		}

		function _setStartDateForFocus(oThis, oDate) {

			// set start date according to new focused date
			// only if focused date is not in current rendered month interval
			// new focused date should have the same position like the old one
			var oMonthsRow = oThis.getAggregation("monthsRow");
			var oStartDate = _getStartDate(oThis);
			var iMonth = oMonthsRow._oItemNavigation.getFocusedIndex();
			oStartDate = new UniversalDate(oDate.getTime());
			oStartDate.setUTCMonth( oStartDate.getUTCMonth() - iMonth);
			_setStartDate(oThis, oStartDate, false);

		}

	}());

	return CalendarMonthInterval;

}, /* bExport= */ true);
