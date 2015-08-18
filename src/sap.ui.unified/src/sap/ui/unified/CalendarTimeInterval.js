/*!
 * ${copyright}
 */

// Provides control sap.ui.unified.Calendar.
sap.ui.define(['jquery.sap.global', 'sap/ui/core/Control', 'sap/ui/core/LocaleData', 'sap/ui/model/type/Date', 'sap/ui/unified/calendar/CalendarUtils',
               './calendar/Header', './calendar/TimesRow', './calendar/DatesRow', './calendar/MonthPicker', './calendar/YearPicker', 'sap/ui/core/date/UniversalDate', './library'],
	function(jQuery, Control, LocaleData, Date1, CalendarUtils, Header, TimesRow, DatesRow, MonthPicker, YearPicker, UniversalDate, library) {
	"use strict";

	/*
	 * Inside the CalendarTimeInterval UniversalDate objects are used. But in the API JS dates are used.
	 * So conversion must be done on API functions.
	 */

	/**
	 * Constructor for a new CalendarTimeInterval.
	 *
	 * @param {string} [sId] Id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Calendar with granularity of time items displayed in one line.
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.32.0
	 * @alias sap.ui.unified.CalendarTimeInterval
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CalendarTimeInterval = Control.extend("sap.ui.unified.CalendarTimeInterval", /** @lends sap.ui.unified.CalendarTimeInterval.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Width of the <code>CalendarTimeInterval</code>. The width of the single months depends of this width.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Start date of the Interval as JavaScript Date object.
			 * The time interval corresponding to this Date and <code>items</code> and <code>intervalMinutes</code>
			 * will be the first time in the displayed row.
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
			 * Number of time items displayed. Default is 12.
			 */
			items : {type : "int", group : "Misc", defaultValue : 12},

			/**
			 * Size of on time interval in minutes, default is 60 minutes.
			 *
			 * <b>Note:</b> the start of the interval calculation is always on the corresponding date at 00:00.
			 *
			 * A interval longer then 720 minutes is not allowed. Please use the <code>CalendarDateInterval</code> instead.
			 *
			 * A day must be divisible by this interval size. One interval must not include more than one day.
			 */
			intervalMinutes : {type : "int", group : "Misc", defaultValue : 60}
		},
		aggregations : {

			/**
			 * Date ranges for selected dates of the <code>CalendarTimeInterval</code>.
			 *
			 * If <code>singleSelection</code> is set, only the first entry is used.
			 *
			 * <b>Note:</b> Even if only one day is selected, the whole corresponding month is selected.
			 */
			selectedDates : {type : "sap.ui.unified.DateRange", multiple : true, singularName : "selectedDate"},

			/**
			 * Date ranges with type to visualize special months in the <code>CalendarTimeInterval</code>.
			 * If one interval is assigned to more than one type, only the first one will be used.
			 *
			 * <b>Note:</b> Even if only one day is set as special day, the whole corresponding month is displayed in this way.
			 */
			specialDates : {type : "sap.ui.unified.DateTypeRange", multiple : true, singularName : "specialDate"},

			/**
			 * Hidden, for internal use only.
			 */
			header : {type : "sap.ui.unified.calendar.Header", multiple : false, visibility : "hidden"},
			timesRow : {type : "sap.ui.unified.calendar.TimesRow", multiple : false, visibility : "hidden"},
			datesRow : {type : "sap.ui.unified.calendar.DatesRow", multiple : false, visibility : "hidden"},
			monthPicker : {type : "sap.ui.unified.calendar.MonthPicker", multiple : false, visibility : "hidden"},
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
			 * Time selection changed
			 */
			select : {},

			/**
			 * Time selection was cancelled
			 */
			cancel : {}
		}
	}});

	/*
	 * There are different modes (stored in this._iMode)
	 * The standard is 0, that means a calendar showing a calendar with the time items.
	 * If 1 a day picker is shown.
	 * If 2 a month picker is shown.
	 * if 3 a year picker is shown.
	 */

	(function() {

		CalendarTimeInterval.prototype.init = function(){

			this._iMode = 0; // months are shown

			this.data("sap-ui-fastnavgroup", "true", true); // Define group for F6 handling

			this._oMinDate = new UniversalDate(UniversalDate.UTC(1, 0, 1));
			this._oMinDate.setUTCFullYear(1); // otherwise year 1 will be converted to year 1901
			this._oMaxDate = new UniversalDate(UniversalDate.UTC(9999, 11, 31));

			var oHeader = new Header(this.getId() + "--Head", {
				visibleButton0: true,
				visibleButton1: true,
				visibleButton2: true
			});
			oHeader.attachEvent("pressPrevious", this._handlePrevious, this);
			oHeader.attachEvent("pressNext", this._handleNext, this);
			oHeader.attachEvent("pressButton0", _handleButton0, this);
			oHeader.attachEvent("pressButton1", _handleButton1, this);
			oHeader.attachEvent("pressButton2", _handleButton2, this);
			this.setAggregation("header", oHeader);

			var oTimesRow = new TimesRow(this.getId() + "--TimesRow");
			oTimesRow.attachEvent("focus", _handleFocus, this);
			oTimesRow.attachEvent("select", _handleSelect, this);
			oTimesRow._bNoThemeChange = true;
			this.setAggregation("timesRow", oTimesRow);

			var oDatesRow = new DatesRow(this.getId() + "--DatesRow", {
				days: 18,
				selectedDates: [new sap.ui.unified.DateRange(this.getId() + "--Range")]
			});
			oDatesRow.attachEvent("focus", _handleDateFocus, this);
			oDatesRow.attachEvent("select", _handleDateSelect, this);
			//use own aggregations and properties
			oDatesRow.getIntervalSelection = function(){
				return this.getProperty("intervalSelection");
			};
			oDatesRow.getSingleSelection = function(){
				return this.getProperty("singleSelection");
			};
			oDatesRow.getSelectedDates = function(){
				return this.getAggregation("selectedDates", []);
			};
			oDatesRow.getSpecialDates = function(){
				return this.getAggregation("specialDates", []);
			};
			oDatesRow.getAriaLabelledBy = function(){
				return this.getAssociation("ariaLabelledBy", []);
			};
			oDatesRow._bNoThemeChange = true;
			this.setAggregation("datesRow", oDatesRow);

			var oMonthPicker = new MonthPicker(this.getId() + "--MP", {
				columns: 0,
				months: 6
			});
			oMonthPicker.attachEvent("select", _handleSelectMonth, this);
			oMonthPicker._bNoThemeChange = true;
			this.setAggregation("monthPicker", oMonthPicker);

			var oYearPicker = new YearPicker(this.getId() + "--YP", {
				columns: 0,
				years: 6 // default for 12 items
			});
			oYearPicker.attachEvent("select", _handleSelectYear, this);
			this.setAggregation("yearPicker", oYearPicker);

			this._iItemsHead = 15; // if more than this number of items, day information are displayed on top of items

		};

		CalendarTimeInterval.prototype.exit = function(){

			if (this._sInvalidateContent) {
				jQuery.sap.clearDelayedCall(this._sInvalidateContent);
			}

		};

		CalendarTimeInterval.prototype.onBeforeRendering = function(){

			var oTimesRow = this.getAggregation("timesRow");
			var oDate = this._getFocusedDate();

			var that = this;
			_updateHeader(that);

			oTimesRow.setDate(CalendarUtils._createLocalDate(oDate, true));

		};

//		CalendarTimeInterval.prototype.onAfterRendering = function(){
//
//		var that = this;
//
//		// check if day names and month names are too big -> use smaller ones
//		_checkNamesLength(that);
//
//		};

		CalendarTimeInterval.prototype.setStartDate = function(oStartDate){

			if (!(oStartDate instanceof Date)) {
				throw new Error("Date must be a JavaScript date object; " + this);
			}

			var iYear = oStartDate.getFullYear();
			if (iYear < 1 || iYear > 9999) {
				throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + this);
			}

			this.setProperty("startDate", oStartDate, true);
			var oTimesRow = this.getAggregation("timesRow");
			oTimesRow.setStartDate(oStartDate);
			// let the TimesRow calculate the begin of the interval
			this._oUTCStartDate = new UniversalDate(oTimesRow._getStartDate().getTime());

			var that = this;
			_updateHeader(that);

			var oDate = CalendarUtils._createLocalDate(this._getFocusedDate(), true);
			if (!oTimesRow.checkDateFocusable(oDate)) {
				//focused date not longer visible -> focus start date
				this._setFocusedDate(this._oUTCStartDate);
				oTimesRow.setDate(oStartDate);
			}

			return this;

		};

		// overwrite invalidate to recognize changes on selectedDates
		CalendarTimeInterval.prototype.invalidate = function(oOrigin) {

			if (!this._bDateRangeChanged && (!oOrigin || !(oOrigin instanceof sap.ui.unified.DateRange))) {
				if (!oOrigin ||
					  (!(oOrigin instanceof sap.ui.unified.calendar.DatesRow ||
					     oOrigin instanceof sap.ui.unified.calendar.MonthPicker ||
					     oOrigin instanceof sap.ui.unified.calendar.YearPicker ||
					     oOrigin instanceof sap.ui.unified.calendar.Header)
					  )) {
					// do not invalidate if one of the child controls has changed
					Control.prototype.invalidate.apply(this, arguments);
				}
			} else if (this.getDomRef() && this._iMode == 0 && !this._sInvalidateContent) {
				// DateRange changed -> only rerender times
				// do this only once if more DateRanges / Special days are changed
				var that = this;
				this._sInvalidateContent = jQuery.sap.delayedCall(0, that, _invalidateTimesRow, [that]);
			}

		};

		// overwrite removing of date ranged because invalidate don't get information about it
		CalendarTimeInterval.prototype.removeAllSelectedDates = function() {

			this._bDateRangeChanged = true;
			var aRemoved = this.removeAllAggregation("selectedDates");
			return aRemoved;

		};

		CalendarTimeInterval.prototype.destroySelectedDates = function() {

			this._bDateRangeChanged = true;
			var oDestroyed = this.destroyAggregation("selectedDates");
			return oDestroyed;

		};

		CalendarTimeInterval.prototype.removeAllSpecialDates = function() {

			this._bDateRangeChanged = true;
			var aRemoved = this.removeAllAggregation("specialDates");
			return aRemoved;

		};

		CalendarTimeInterval.prototype.destroySpecialDates = function() {

			this._bDateRangeChanged = true;
			var oDestroyed = this.destroyAggregation("specialDates");
			return oDestroyed;

		};

		CalendarTimeInterval.prototype.setIntervalMinutes = function(iMinutes){

			if (iMinutes >= 720) {
				throw new Error("Only intervals < 720 minutes are allowed; " + this);
			}

			if (1440 % iMinutes > 0) {
				throw new Error("A day must be divisible by the interval size; " + this);
			}

			this.setProperty("intervalMinutes", iMinutes, false); // rerender

			// check if focused date still is valid
			var oTimesRow = this.getAggregation("timesRow");
			var oDate = CalendarUtils._createLocalDate(this._getFocusedDate(), true);
			if (!oTimesRow.checkDateFocusable(oDate)) {
				//focused date not longer visible -> focus start date
				var that = this;
				var oStartDate = _getStartDate(that);
				this._setFocusedDate(oStartDate);
				oTimesRow.setDate(CalendarUtils._createLocalDate(oStartDate, true));
			}

			return this;

		};

		/**
		 * sets the locale for the DatePicker
		 * only for internal use
		 * @param {string} sLocale  new value for <code>locale</code>
		 * @returns {sap.ui.unified.Calendar} <code>this</code> to allow method chaining
		 * @private
		 */
		CalendarTimeInterval.prototype.setLocale = function(sLocale){

			if (this._sLocale != sLocale) {
				this._sLocale = sLocale;
				this._oLocaleData = undefined;
				this.invalidate();
			}

			return this;

		};

		/**
		 * gets the used locale for the <code>CalendarTimeInterval</code>
		 * only for internal use
		 * @return {string} sLocale
		 * @private
		 */
		CalendarTimeInterval.prototype.getLocale = function(){

			if (!this._sLocale) {
				this._sLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale().toString();
			}

			return this._sLocale;

		};

		CalendarTimeInterval.prototype._getFocusedDate = function(){

			if (!this._oFocusedDate) {
				var that = this;
				_determineFocusedDate(that);
			}

			return this._oFocusedDate;

		};

		CalendarTimeInterval.prototype._setFocusedDate = function(oDate){

			if (!(oDate instanceof UniversalDate)) {
				throw new Error("Date must be a UniversalDate object " + this);
			}

			this._oFocusedDate = new UniversalDate(oDate.getTime());

		};

		/**
		 * Sets the focused item of the <code>CalendarTimeInterval</code>.
		 *
		 * @param {object} oDate JavaScript date object for focused item.
		 * @returns {sap.ui.unified.Calendar} <code>this</code> to allow method chaining
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		CalendarTimeInterval.prototype.focusDate = function(oDate){

			var oTimesRow = this.getAggregation("timesRow");
			var that = this;
			if (!oTimesRow.checkDateFocusable(oDate)) {
				var oUTCDate = CalendarUtils._createUniversalUTCDate(oDate, true);
				_setStartDateForFocus(that, oUTCDate);
			}

			_displayDate(that, oDate, false);

			return this;

		};

		/**
		 * Displays a item in the <code>CalendarTimeInterval</code> but don't set the focus.
		 *
		 * @param {object} oDate JavaScript date object for displayed item.
		 * @returns {sap.ui.unified.Calendar} <code>this</code> to allow method chaining
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		CalendarTimeInterval.prototype.displayDate = function(oDate){

			var that = this;
			_displayDate(that, oDate, true);

			return this;

		};

		CalendarTimeInterval.prototype.setItems = function(iItems){

			this.setProperty("items", iItems, true);

			iItems = this._getItems(); // to use phone limit

			var oTimesRow = this.getAggregation("timesRow");
			oTimesRow.setItems(iItems);

			// check if focused date still is valid
			var that = this;
			var oDate = CalendarUtils._createLocalDate(this._getFocusedDate(), true);
			if (!oTimesRow.checkDateFocusable(oDate)) {
				//focused date not longer visible -> focus start date
				var oStartDate = _getStartDate(that);
				this._setFocusedDate(oStartDate);
				oTimesRow.setDate(CalendarUtils._createLocalDate(oStartDate, true));
			}

			var oDatesRow = this.getAggregation("datesRow");
			var iDays = Math.floor(iItems * 1.5);
			if (iDays > 31) {
				// to be limited on real month length by opening
				iDays = 31;
			}
			oDatesRow.setDays(iDays);

			var oMonthPicker = this.getAggregation("monthPicker");
			var iMonths = Math.floor(iItems / 2);
			if (iMonths > 12) {
				iMonths = 12;
			}
			oMonthPicker.setMonths(iMonths);

			var oYearPicker = this.getAggregation("yearPicker");
			var iYears = Math.floor(iItems / 2);
			if (iYears > 20) {
				iYears = 20;
			}
			oYearPicker.setYears(iYears);

			_updateHeader(that);

			if (this.getDomRef()) {
				if (this._getShowItemHeader()) {
					this.$().addClass("sapUiCalIntHead");
				}else {
					this.$().removeClass("sapUiCalIntHead");
				}
			}

		};

		CalendarTimeInterval.prototype._getItems = function(){

			var iItems = this.getItems();

			// in phone mode max 6 items are displayed
			if (sap.ui.Device.system.phone && iItems > 6) {
				return 6;
			} else {
				return iItems;
			}

		};

		/*
		 * gets localeData for used locale
		 * if no locale is given use rendered one
		 */
		CalendarTimeInterval.prototype._getLocaleData = function(){

			if (!this._oLocaleData) {
				var sLocale = this.getLocale();
				var oLocale = new sap.ui.core.Locale(sLocale);
				this._oLocaleData = LocaleData.getInstance(oLocale);
			}

			return this._oLocaleData;

		};

		CalendarTimeInterval.prototype.onclick = function(oEvent){

			if (oEvent.isMarked("delayedMouseEvent") ) {
				return;
			}

			if (oEvent.target.id == this.getId() + "-cancel") {
				this.onsapescape(oEvent);
			}

		};

		CalendarTimeInterval.prototype.onmousedown = function(oEvent){

			oEvent.preventDefault(); // to prevent focus set outside of DatePicker
			oEvent.setMark("cancelAutoClose");

		};

		CalendarTimeInterval.prototype.onsapescape = function(oEvent){

			var that = this;

			switch (this._iMode) {
			case 0: // day picker
				this.fireCancel();
				break;

			case 2: // month picker
				_hideMonthPicker(that);
				break;

			case 3: // year picker
				_hideYearPicker(that);
				break;
				// no default
			}

		};

		CalendarTimeInterval.prototype.onsaptabnext = function(oEvent){

			// if tab was pressed on a day it should jump to the month and then to the year button
			var oHeader = this.getAggregation("header");

			if (jQuery.sap.containsOrEquals(this.getDomRef("content"), oEvent.target)) {
				jQuery.sap.focus(oHeader.getDomRef("B0"));

				if (!this._bPoupupMode) {
					// remove Tabindex from day, month, year - to break cycle
					var oTimesRow = this.getAggregation("timesRow");
					var oMonthPicker = this.getAggregation("monthPicker");
					var oYearPicker = this.getAggregation("yearPicker");
					jQuery(oTimesRow._oItemNavigation.getItemDomRefs()[oTimesRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
					if (oMonthPicker.getDomRef()) {
						jQuery(oMonthPicker._oItemNavigation.getItemDomRefs()[oMonthPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
					}
					if (oYearPicker.getDomRef()) {
						jQuery(oYearPicker._oItemNavigation.getItemDomRefs()[oYearPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
					}
				}

				oEvent.preventDefault();
			} else if (oEvent.target.id == oHeader.getId() + "-B0") {
				jQuery.sap.focus(oHeader.getDomRef("B1"));
				oEvent.preventDefault();
			} else if (oEvent.target.id == oHeader.getId() + "-B1") {
				jQuery.sap.focus(oHeader.getDomRef("B2"));
				oEvent.preventDefault();
			}


		};

		CalendarTimeInterval.prototype.onsaptabprevious = function(oEvent){

			var oHeader = this.getAggregation("header");

			if (jQuery.sap.containsOrEquals(this.getDomRef("content"), oEvent.target)) {
				// tab from day or year -> go to header

				if (this._bPoupupMode) {
					jQuery.sap.focus(oHeader.getDomRef("B2"));
					oEvent.preventDefault();
				}
			} else if (oEvent.target.id == oHeader.getId() + "-B0") {
				// focus day or year
				var oTimesRow = this.getAggregation("timesRow");
				var oMonthPicker = this.getAggregation("monthPicker");
				var oYearPicker = this.getAggregation("yearPicker");
				switch (this._iMode) {
				case 0: // day picker
					oTimesRow._oItemNavigation.focusItem(oTimesRow._oItemNavigation.getFocusedIndex());
					break;

				case 2: // month picker
					oMonthPicker._oItemNavigation.focusItem(oMonthPicker._oItemNavigation.getFocusedIndex());
					break;

				case 3: // year picker
					oYearPicker._oItemNavigation.focusItem(oYearPicker._oItemNavigation.getFocusedIndex());
					break;
					// no default
				}

				oEvent.preventDefault();
			} else if (oEvent.target.id == oHeader.getId() + "-B2") {
				jQuery.sap.focus(oHeader.getDomRef("B1"));

				oEvent.preventDefault();
			} else if (oEvent.target.id == oHeader.getId() + "-B1") {
				jQuery.sap.focus(oHeader.getDomRef("B0"));

				oEvent.preventDefault();
			}

		};

		CalendarTimeInterval.prototype.onfocusin = function(oEvent){

			if (oEvent.target.id == this.getId() + "-end") {
				// focus via tab+shift (otherwise not possible to go to this element)
				var oHeader = this.getAggregation("header");
				var oTimesRow = this.getAggregation("timesRow");
				var oMonthPicker = this.getAggregation("monthPicker");
				var oYearPicker = this.getAggregation("yearPicker");

				jQuery.sap.focus(oHeader.getDomRef("B2"));

				if (!this._bPoupupMode) {
					// remove Tabindex from day, month, year - to break cycle
					jQuery(oTimesRow._oItemNavigation.getItemDomRefs()[oTimesRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
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

		CalendarTimeInterval.prototype.onsapfocusleave = function(oEvent){

			if (!oEvent.relatedControlId || !jQuery.sap.containsOrEquals(this.getDomRef(), sap.ui.getCore().byId(oEvent.relatedControlId).getFocusDomRef())) {
				// put dummy element back to tab-chain
				jQuery.sap.byId(this.getId() + "-end").attr("tabindex", "0");

				if (!this._bPoupupMode) {
					// restore Tabindex from day and year
					var oTimesRow = this.getAggregation("timesRow");
					var oMonthPicker = this.getAggregation("monthPicker");
					var oYearPicker = this.getAggregation("yearPicker");
					switch (this._iMode) {
					case 0: // day picker
						jQuery(oTimesRow._oItemNavigation.getItemDomRefs()[oTimesRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
						break;

					case 2: // month picker
						jQuery(oMonthPicker._oItemNavigation.getItemDomRefs()[oMonthPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
						break;

					case 3: // year picker
						jQuery(oYearPicker._oItemNavigation.getItemDomRefs()[oYearPicker._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
						break;
						// no default
					}
				}
			}

		};

		CalendarTimeInterval.prototype._handlePrevious = function(oEvent){

			var that = this;
			var oFocusedDate = this._getFocusedDate();

			switch (this._iMode) {
			case 0: // time picker
				var iItems = this._getItems();
				var oStartDate = new UniversalDate(_getStartDate(that).getTime());
				var iMinutes = this.getIntervalMinutes();
				oStartDate.setUTCMinutes(oStartDate.getUTCMinutes() - iItems * iMinutes);
				oFocusedDate.setUTCMinutes(oFocusedDate.getUTCMinutes() - iItems * iMinutes);
				this._setFocusedDate(oFocusedDate);
				_setStartDate(that, oStartDate, true);

				break;

			case 1: // day picker
				var oDatesRow = this.getAggregation("datesRow");
				var oDate = CalendarUtils._createUniversalUTCDate(oDatesRow.getDate());
				var iDays = oDatesRow.getDays();
				if (oDate.getUTCDate() <= iDays) {
					// stay in month
					oDate.setUTCDate(1);
				}else {
					oDate.setUTCDate(oDate.getUTCDate() - iDays);
				}
				_setDateInDatesRow(that, oDate);

				break;

			case 2: // month picker
				var oMonthPicker = this.getAggregation("monthPicker");
				if (oMonthPicker.getMonths() < 12) {
					oMonthPicker.previousPage();
				} else {
					oFocusedDate.setUTCFullYear(oFocusedDate.getUTCFullYear() - 1);
					_setStartDateForFocus(that, oFocusedDate);
					this._setFocusedDate(oFocusedDate);
					_updateHeader(that);
				}
				break;

			case 3: // year picker
				var oYearPicker = this.getAggregation("yearPicker");
				oYearPicker.previousPage();
				break;
				// no default
			}

		};

		CalendarTimeInterval.prototype._handleNext = function(oEvent){

			var that = this;
			var oFocusedDate = this._getFocusedDate();

			switch (this._iMode) {
			case 0: // day picker
				var iItems = this._getItems();
				var oStartDate = new UniversalDate(_getStartDate(that).getTime());
				var iMinutes = this.getIntervalMinutes();
				oStartDate.setUTCMinutes(oStartDate.getUTCMinutes() + iItems * iMinutes);
				oFocusedDate.setUTCMinutes(oFocusedDate.getUTCMinutes() + iItems * iMinutes);
				this._setFocusedDate(oFocusedDate);
				_setStartDate(that, oStartDate, true);

				break;

			case 1: // day picker
				var oDatesRow = this.getAggregation("datesRow");
				var oDate = CalendarUtils._createUniversalUTCDate(oDatesRow.getDate());
				var oLastDayOfMonth = new UniversalDate(oDate.getTime());
				oLastDayOfMonth.setUTCDate(1);
				oLastDayOfMonth.setUTCMonth(oLastDayOfMonth.getUTCMonth() + 1);
				oLastDayOfMonth.setUTCDate(0);
				var iDays = oDatesRow.getDays();
				if (oDate.getUTCDate() + iDays > oLastDayOfMonth.getUTCDate()) {
					// stay in month
					oDate.setUTCDate(oLastDayOfMonth.getUTCDate());
				}else {
					oDate.setUTCDate(oDate.getUTCDate() + iDays);
				}
				_setDateInDatesRow(that, oDate);

				break;

			case 2: // month picker
				var oMonthPicker = this.getAggregation("monthPicker");
				if (oMonthPicker.getMonths() < 12) {
					oMonthPicker.nextPage();
				} else {
					oFocusedDate.setUTCFullYear(oFocusedDate.getUTCFullYear() + 1);
					_setStartDateForFocus(that, oFocusedDate);
					this._setFocusedDate(oFocusedDate);
					_updateHeader(that);
				}
				break;

			case 3: // year picker
				var oYearPicker = this.getAggregation("yearPicker");
				oYearPicker.nextPage();
				break;
				// no default
			}

		};

		CalendarTimeInterval.prototype._getShowItemHeader = function(){

			var iItems = this.getItems();
			if (iItems > this._iItemsHead) {
				return true;
			}else {
				return false;
			}

		};

		function _setStartDate(oThis, oStartDate, bSetFocusDate){

			var oMaxDate = new UniversalDate(oThis._oMaxDate.getTime());
			oMaxDate.setUTCMonth(oMaxDate.getUTCDate() - oThis._getItems());
			if (oStartDate.getTime() < oThis._oMinDate.getTime()) {
				oStartDate = oThis._oMinDate;
			}else if (oStartDate.getTime() > oMaxDate.getTime()){
				oStartDate = oMaxDate;
			}

			var oTimesRow = oThis.getAggregation("timesRow");
			var oLocalDate = CalendarUtils._createLocalDate(oStartDate, true);
			oTimesRow.setStartDate(oLocalDate);
			// let the TimesRow calculate the begin of the interval
			oThis._oUTCStartDate = new UniversalDate(oTimesRow._getStartDate().getTime());
			oLocalDate = CalendarUtils._createLocalDate(oThis._oUTCStartDate, true);
			oThis.setProperty("startDate", oLocalDate, true);

			_updateHeader(oThis);

			if (bSetFocusDate) {
				var oDate = CalendarUtils._createLocalDate(oThis._getFocusedDate(), true);
				if (!oTimesRow.checkDateFocusable(oDate)) {
					//focused date not longer visible -> focus start date
					oThis._setFocusedDate(oStartDate);
					oTimesRow.setDate(oLocalDate);
				}else {
					oTimesRow.setDate(oDate);
				}
			}

		}

		function _getStartDate(oThis){

			if (!oThis._oUTCStartDate) {
				// no start date set, use focused date
				var oTimesRow = oThis.getAggregation("timesRow");
				oTimesRow.setStartDate(CalendarUtils._createLocalDate(oThis._getFocusedDate(), true));
				// let the TimesRow calculate the begin of the interval
				oThis._oUTCStartDate = new UniversalDate(oTimesRow._getStartDate().getTime());
				oThis._setFocusedDate(oThis._oUTCStartDate);
			}

			return oThis._oUTCStartDate;

		}

		/*
		 * sets the date in the used Month controls
		 * @param {sap.ui.unified.Calendar} oThis Calendar instance
		 * @param {boolean} bNoFolus if set no focus is set to the date
		 */
		function _renderTimesRow(oThis, bNoFocus){

			var oDate = oThis._getFocusedDate();
			var oTimesRow = oThis.getAggregation("timesRow");

			if (!bNoFocus) {
				oTimesRow.setDate(CalendarUtils._createLocalDate(oDate, true));
			} else {
				oTimesRow.displayDate(CalendarUtils._createLocalDate(oDate, true));
			}

			// change header buttons
			_updateHeader(oThis);

		}

		function _determineFocusedDate(oThis){

			var aSelectedDates = oThis.getSelectedDates();
			if (aSelectedDates && aSelectedDates[0] && aSelectedDates[0].getStartDate()) {
				// selected dates are provided -> use first one to focus
				oThis._oFocusedDate = CalendarUtils._createUniversalUTCDate(aSelectedDates[0].getStartDate(), true);
			} else {
				// use current date
				var oNewDate = new Date();
				oThis._oFocusedDate = CalendarUtils._createUniversalUTCDate(oNewDate, true);
			}

		}

		function _showDayPicker(oThis){

			if (oThis._iMode == 3) {
				_hideYearPicker(oThis, true);
			}else if (oThis._iMode == 2) {
				_hideMonthPicker(oThis, true);
			}

			var oDate = oThis._getFocusedDate();
			var iItems = oThis._getItems();
			var oDatesRow = oThis.getAggregation("datesRow");

			// set numbr of days - but max number of days of this month
			var oLastDayOfMonth = new UniversalDate(oDate.getTime());
			oLastDayOfMonth.setUTCDate(1);
			oLastDayOfMonth.setUTCMonth(oLastDayOfMonth.getUTCMonth() + 1);
			oLastDayOfMonth.setUTCDate(0);
			var iLastDay = oLastDayOfMonth.getUTCDate();
			var iDays = Math.floor(iItems * 1.5);
			if (iDays > iLastDay) {
				// to be limited on real month length by opening
				iDays = iLastDay;
			}
			oDatesRow.setDays(iDays);
			var oDateRange = oDatesRow.getSelectedDates()[0];
			oDateRange.setStartDate(CalendarUtils._createLocalDate(oDate, true));

			if (oDatesRow.getDomRef()) {
				// already rendered
				oDatesRow.$().css("display", "");
			} else {
				var oRm = sap.ui.getCore().createRenderManager();
				var $Container = oThis.$("content");
				oRm.renderControl(oDatesRow);
				oRm.flush($Container[0], false, true); // insert it
				oRm.destroy();
			}
			oThis.$("contentOver").css("display", "");

			// set start date and focus date
			_setDateInDatesRow(oThis, oDate);

			if (oThis._iMode == 0) {
				// remove tabindex from item
				var oTimesRow = oThis.getAggregation("timesRow");

				jQuery(oTimesRow._oItemNavigation.getItemDomRefs()[oTimesRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
			}

			oThis._iMode = 1;

			_togglePrevNext(oThis);

		}

		function _hideDayPicker(oThis, bNoFocus){

			oThis._iMode = 0;

			var oDatesRow = oThis.getAggregation("datesRow");
			oDatesRow.$().css("display", "none");
			oThis.$("contentOver").css("display", "none");

			if (!bNoFocus) {
				_renderTimesRow(oThis); // to focus date

				// restore tabindex because if date not changed in _renderTimesRow only the focused date is updated
				var oTimesRow = oThis.getAggregation("timesRow");
				jQuery(oTimesRow._oItemNavigation.getItemDomRefs()[oTimesRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
			}

		}

		function _showMonthPicker(oThis){

			if (oThis._iMode == 3) {
				_hideYearPicker(oThis, true);
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
			oThis.$("contentOver").css("display", "");

			oMonthPicker.setMonth(oDate.getUTCMonth());

			if (oThis._iMode == 0) {
				// remove tabindex from item
				var oTimesRow = oThis.getAggregation("timesRow");

				jQuery(oTimesRow._oItemNavigation.getItemDomRefs()[oTimesRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
			}

			oThis._iMode = 2;

			_togglePrevNext(oThis);

		}

		function _hideMonthPicker(oThis, bNoFocus){

			oThis._iMode = 0;

			var oMonthPicker = oThis.getAggregation("monthPicker");
			oMonthPicker.$().css("display", "none");
			oThis.$("contentOver").css("display", "none");

			if (!bNoFocus) {
				_renderTimesRow(oThis); // to focus date

				// restore tabindex because if date not changed in _renderTimesRow only the focused date is updated
				var oTimesRow = oThis.getAggregation("timesRow");
				jQuery(oTimesRow._oItemNavigation.getItemDomRefs()[oTimesRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
			}

		}

		function _showYearPicker(oThis){

			if (oThis._iMode == 2) {
				_hideMonthPicker(oThis, true);
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
			oThis.$("contentOver").css("display", "");

			oYearPicker.setYear(iYear);

			if (oThis._iMode == 0) {
				// remove tabindex from item
				var oTimesRow = oThis.getAggregation("timesRow");

				jQuery(oTimesRow._oItemNavigation.getItemDomRefs()[oTimesRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "-1");
			}

			oThis._iMode = 3;

		}

		function _hideYearPicker(oThis, bNoFocus){

			oThis._iMode = 0;

			var oYearPicker = oThis.getAggregation("yearPicker");
			oYearPicker.$().css("display", "none");
			oThis.$("contentOver").css("display", "none");

			if (!bNoFocus) {
				_renderTimesRow(oThis); // to focus date

				// restore tabindex because if date not changed in _renderTimesRow only the focused date is updated
				var oTimesRow = oThis.getAggregation("timesRow");
				jQuery(oTimesRow._oItemNavigation.getItemDomRefs()[oTimesRow._oItemNavigation.getFocusedIndex()]).attr("tabindex", "0");
			}

		}

		function _updateHeader(oThis){

			_setHeaderText(oThis);
			_togglePrevNext(oThis);

		}

		function _togglePrevNext (oThis, bCheckMonth){

			var oDate = new UniversalDate(_getStartDate(oThis).getTime());
			var iItems = oThis._getItems();
			var iYear = oDate.getUTCFullYear();
			var iYearMax = oThis._oMaxDate.getUTCFullYear();
			var iYearMin = oThis._oMinDate.getUTCFullYear();
			var iMonth = oDate.getUTCMonth();
			var iMonthMax = oThis._oMaxDate.getUTCMonth();
			var iMonthMin = oThis._oMinDate.getUTCMonth();
			var iDate = oDate.getUTCDate();
			var iDateMax = oThis._oMaxDate.getUTCDate();
			var iDateMin = oThis._oMinDate.getUTCDate();
			var oHeader = oThis.getAggregation("header");

			if (iYear < iYearMin || (iYear == iYearMin && ( !bCheckMonth || ( iMonth < iMonthMin || (iMonth == iMonthMin && iDate <= iDateMin ))))) {
				oHeader.setEnabledPrevious(false);
			}else {
				oHeader.setEnabledPrevious(true);
			}

			oDate.setUTCMinutes(oDate.getUTCMinutes() + iItems * oThis.getIntervalMinutes() - 1);
			iYear = oDate.getUTCFullYear();
			iMonth = oDate.getUTCMonth();
			if (iYear > iYearMax || (iYear == iYearMax && ( !bCheckMonth || ( iMonth > iMonthMax || (iMonth == iMonthMax && iDate >= iDateMax ))))) {
				oHeader.setEnabledNext(false);
			}else {
				oHeader.setEnabledNext(true);
			}

		}

		function _setHeaderText (oThis){

			// sets the text for the day, month and year button to the header
			var oHeader = oThis.getAggregation("header");
			var sText;
			var oStartDate = _getStartDate(oThis);

			oHeader.setTextButton0((oStartDate.getUTCDate()).toString());

			var oLocaleData = oThis._getLocaleData();
			var aMonthNames = [];
			var aMonthNamesWide = [];
			var sAriaLabel;
			var bShort = false;
			if (oThis._bLongMonth || !oThis._bNamesLengthChecked) {
				aMonthNames = oLocaleData.getMonthsStandAlone("wide");
			} else {
				bShort = true;
				aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated");
				aMonthNamesWide = oLocaleData.getMonthsStandAlone("wide");
			}

			var iMonth = oStartDate.getUTCMonth();
			sText = aMonthNames[iMonth];
			if (bShort) {
				sAriaLabel = aMonthNamesWide[aMonthNames[iMonth]];
			}

			oHeader.setTextButton1(sText);
			if (bShort) {
				oHeader.setAriaLabelButton1(sAriaLabel);
			}

			oHeader.setTextButton2((oStartDate.getUTCFullYear()).toString());
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
				_renderTimesRow(oThis, false);
			}

		}

		function _displayDate (oThis, oDate, bNoFocus){

			if (oDate && (!oThis._oFocusedDate || oThis._oFocusedDate.getTime() != oDate.getTime())) {
				if (!(oDate instanceof Date)) {
					throw new Error("Date must be a JavaScript date object; " + oThis);
				}

				oDate = CalendarUtils._createUniversalUTCDate(oDate, true);

				var iYear = oDate.getUTCFullYear();
				if (iYear < 1 || iYear > 9999) {
					throw new Error("Date must not be in valid range (between 0001-01-01 and 9999-12-31); " + oThis);
				}

				oThis._setFocusedDate(oDate);

				if (oThis.getDomRef() && oThis._iMode == 0) {
					_renderTimesRow(oThis, bNoFocus);
				}
			}

		}

		function _handleButton0 (oEvent){

			var that = this;

			if (this._iMode != 1) {
				_showDayPicker(that);
			} else {
				_hideDayPicker(that);
			}

		}

		function _handleButton1 (oEvent){

			var that = this;

			if (this._iMode != 2) {
				_showMonthPicker(that);
			} else {
				_hideMonthPicker(that);
			}

		}

		function _handleButton2 (oEvent){

			var that = this;

			if (this._iMode != 3) {
				_showYearPicker(that);
			} else {
				_hideYearPicker(that);
			}

		}

		function _handleSelect (oEvent){

			this.fireSelect();

		}

		function _handleFocus (oEvent){

			var oDate = CalendarUtils._createUniversalUTCDate(oEvent.getParameter("date"), true);
			var bNotVisible = oEvent.getParameter("notVisible");
			var that = this;

			_focusDate(that, oDate, bNotVisible);

		}

		function _handleDateSelect (oEvent){

			var that = this;
			var oFocusedDate = new UniversalDate(this._getFocusedDate().getTime());
			var oDatesRow = oEvent.oSource;
			var oDateRange = oDatesRow.getSelectedDates()[0];
			var oDate = CalendarUtils._createUniversalUTCDate(oDateRange.getStartDate());

			oFocusedDate.setUTCDate(oDate.getUTCDate());
			oFocusedDate.setUTCMonth(oDate.getUTCMonth());
			oFocusedDate.setUTCFullYear(oDate.getUTCFullYear());

			_focusDate(that, oFocusedDate, true);

			_hideDayPicker(that);

		}

		function _handleDateFocus (oEvent){

			var oFocusedDate = new UniversalDate(this._getFocusedDate().getTime());
			var oDate = CalendarUtils._createUniversalUTCDate(oEvent.getParameter("date"), true);
			var bNotVisible = oEvent.getParameter("otherMonth");
			var that = this;

			if (bNotVisible &&
					oDate.getUTCMonth() == oFocusedDate.getUTCMonth() &&
					oDate.getUTCFullYear() == oFocusedDate.getUTCFullYear()) {
				// only show days in the same month
				// set start date and focus date
				_setDateInDatesRow(that, oDate);
			}

		}

		function _handleSelectMonth (oEvent){

			var oFocusedDate = new UniversalDate(this._getFocusedDate().getTime());
			var oMonthPicker = this.getAggregation("monthPicker");
			var iMonth = oMonthPicker.getMonth();
			var that = this;

			oFocusedDate.setUTCMonth(iMonth);

			if (iMonth != oFocusedDate.getUTCMonth() ) {
				// day did not exist in this month (e.g. 31) -> go to last day of month
				oFocusedDate.setUTCDate(0);
			}

			_focusDate(that, oFocusedDate, true);

			_hideMonthPicker(that);

		}

		function _handleSelectYear (oEvent){

			var oFocusedDate = new UniversalDate(this._getFocusedDate().getTime());
			var oYearPicker = this.getAggregation("yearPicker");
			var iYear = oYearPicker.getYear();
			var that = this;
			var iMonth = oFocusedDate.getUTCMonth();

			oFocusedDate.setUTCFullYear(iYear);

			if (iMonth != oFocusedDate.getUTCMonth() ) {
				// day did not exist in this year (29. Feb) -> go to last day of month
				oFocusedDate.setUTCDate(0);
			}

			_focusDate(that, oFocusedDate, true);

			_hideYearPicker(that);

		}

		function _invalidateTimesRow(oThis){

			oThis._sInvalidateContent = undefined;

			var oTimesRow = oThis.getAggregation("timesRow");
			oTimesRow._bDateRangeChanged = true;
			oTimesRow._bInvalidateSync = true;
			oTimesRow.invalidate();
			oTimesRow._bInvalidateSync = undefined;

			oThis._bDateRangeChanged = undefined;

		}

		function _setStartDateForFocus(oThis, oDate) {

			// set start date according to new focused date
			// only if focused date is not in current rendered month interval
			// new focused date should have the same position like the old one
			var oTimesRow = oThis.getAggregation("timesRow");
			var oStartDate = _getStartDate(oThis);
			var iIndex = oTimesRow._oItemNavigation.getFocusedIndex();
			oStartDate = new UniversalDate(oDate.getTime());
			oStartDate.setUTCMinutes( oStartDate.getUTCMinutes() - iIndex * oThis.getIntervalMinutes());
			_setStartDate(oThis, oStartDate, false);

		}

		function _setDateInDatesRow(oThis, oDate) {

			var oDatesRow = oThis.getAggregation("datesRow");

			// set number of days - but max number of days of this month
			var oLastDayOfMonth = new UniversalDate(oDate.getTime());
			oLastDayOfMonth.setUTCDate(1);
			oLastDayOfMonth.setUTCMonth(oLastDayOfMonth.getUTCMonth() + 1);
			oLastDayOfMonth.setUTCDate(0);
			var iDays = oDatesRow.getDays();

			// set start day and selected day
			var oStartDate = new UniversalDate(oDate.getTime());
			oStartDate.setUTCDate( 1 + (Math.ceil(oDate.getUTCDate() / iDays) - 1) * iDays );
			if (oLastDayOfMonth.getUTCDate() - oStartDate.getUTCDate() < iDays) {
				oStartDate.setUTCDate(oLastDayOfMonth.getUTCDate() - iDays + 1);
			}

			oDatesRow.setStartDate(CalendarUtils._createLocalDate(oStartDate, true));
			oDatesRow.setDate(CalendarUtils._createLocalDate(oDate, true));
		}

	}());

	return CalendarTimeInterval;

}, /* bExport= */ true);
