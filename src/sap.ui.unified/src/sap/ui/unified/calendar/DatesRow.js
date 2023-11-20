/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.Calendar.
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/core/RenderManager",
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/calendar/Month',
	'sap/ui/unified/library',
	"./DatesRowRenderer",
	"sap/ui/thirdparty/jquery",
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/Locale',
	'sap/ui/core/date/UI5Date',
	'sap/ui/core/InvisibleText'
], function(Library, RenderManager, CalendarUtils, CalendarDate, Month, library, DatesRowRenderer, jQuery, DateFormat, Locale, UI5Date, InvisibleText) {
	"use strict";

	/*
	* Inside the DatesRow CalendarDate objects are used. But in the API JS dates are used.
	* So conversion must be done on API functions.
	*/

	/**
	 * Constructor for a new calendar/DatesRow.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * renders a row of days with ItemNavigation
	 * This is used inside the calendar. Not for stand alone usage
	 * If used inside the calendar the properties and aggregation are directly taken from the parent
	 * (To not duplicate and sync DateRanges and so on...)
	 * @extends sap.ui.unified.calendar.Month
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.30.0
	 * @alias sap.ui.unified.calendar.DatesRow
	 */
	var DatesRow = Month.extend("sap.ui.unified.calendar.DatesRow", /** @lends sap.ui.unified.calendar.DatesRow.prototype */ { metadata : {

		library : "sap.ui.unified",
		properties : {

			/**
			 * Start date of the row
			 * If in rendering phase the date property is not in the range startDate + days,
			 * it is set to the start date
			 * So after setting the start date the date should be set to be in the range of the start date
			 */
			startDate : {type : "object", group : "Data"},

			/**
			 * number of days displayed
			 */
			days : {type : "int", group : "Appearance", defaultValue : 7},

			/**
			 * If set the day names are shown in a separate line.
			 * If not set the day names are shown inside the single days.
			 * @since 1.34.0
			 */
			showDayNamesLine : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * If set, the calendar week numbering is used for display.
			 * If not set, the calendar week numbering of the global configuration is used.
			 * Note: This property should not be used with <code>Month.prototype.firstDayOfWeek</code> property.
			 * @since 1.110.0
			 */
			 calendarWeekNumbering : { type : "sap.ui.core.date.CalendarWeekNumbering", group : "Appearance", defaultValue: null}

		}
	}, renderer: DatesRowRenderer});

	DatesRow.prototype.init = function(){

		Month.prototype.init.apply(this, arguments);

		this._iColumns = 1;

		//holds objects describing the weeks of the currently displayed days
		//example: [{ len: 3, number: 12 }, { len: 7, number: 13 }, ...]
		this._aWeekNumbers = [];

		this._bAlwaysShowSpecialDates = true;

	};

	DatesRow.prototype.exit = function() {
		Month.prototype.exit(this, arguments);
		if (this._invisibleDayHint) {
			this._invisibleDayHint.destroy();
			this._invisibleDayHint = null;
		}
	};

	DatesRow.prototype._setAriaRole = function(sRole){
		this._ariaRole = sRole;

		return this;
	};

	DatesRow.prototype._getAriaRole = function(){

		return this._ariaRole ? this._ariaRole : "gridcell";
	};

	DatesRow.prototype._getDayDescription = function() {
		return this._fnInvisibleHintFactory().getId();
	};

	DatesRow.prototype._fnInvisibleHintFactory = function() {
		if (!this._invisibleDayHint) {
			this._invisibleDayHint = new InvisibleText({
				text: Library.getResourceBundleFor("sap.m").getText("SLIDETILE_ACTIVATE")
			}).toStatic();
		}

		return this._invisibleDayHint;
	};

	/**
	 * Sets start date of the row.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date} oStartDate A date instance
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	DatesRow.prototype.setStartDate = function(oStartDate){

		CalendarUtils._checkJSDateObject(oStartDate);

		var iYear = oStartDate.getFullYear();
		CalendarUtils._checkYearInValidRange(iYear);

		this.setProperty("startDate", oStartDate);
		this._oStartDate = CalendarDate.fromLocalJSDate(oStartDate, this.getPrimaryCalendarType());

		if (this.getDomRef()) {
			var oOldDate = this._getDate().toLocalJSDate();
			this._bNoRangeCheck = true;
			this.displayDate(oStartDate); // don't set focus
			this._bNoRangeCheck = false;
			if (oOldDate && this.checkDateFocusable(oOldDate)) {
				this.displayDate(oOldDate);
			}
		}
		return this;

	};

	/**
	 *
	 * @returns {sap.ui.unified.calendar.CalendarDate} the start date (timezone agnostic)
	 * @private
	 */
	DatesRow.prototype._getStartDate = function(){

		if (!this._oStartDate) {
			this._oStartDate = CalendarDate.fromLocalJSDate(UI5Date.getInstance(), this.getPrimaryCalendarType());
		}

		return this._oStartDate;
	};

	/**
	 * Setter for property <code>date</code>.
	 *
	 * Property <code>date</code> date to be focused or displayed. It must be in the displayed date range
	 * beginning with <code>startDate</code> and <code>days</code> days
	 * So set this properties before setting the date.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate date instance for start date.
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	DatesRow.prototype.setDate = function(oDate){

		// check if in visible date range
		if (!this._bNoRangeCheck && !this.checkDateFocusable(oDate)) {
			throw new Error("Date must be in visible date range; " + this);
		}

		Month.prototype.setDate.apply(this, arguments);

		return this;

	};

	/**
	 * Displays the given date without setting the focus
	 *
	 * Property <code>date</code> date to be focused or displayed. It must be in the displayed date range
	 * beginning with <code>startDate</code> and <code>days</code> days
	 * So set this properties before setting the date.
	 *
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate date instance for focused date.
	 * @returns {this} Reference to <code>this</code> for method chaining
	 * @public
	 */
	DatesRow.prototype.displayDate = function(oDate){

		// check if in visible date range
		if (!this._bNoRangeCheck && !this.checkDateFocusable(oDate)) {
			throw new Error("Date must be in visible date range; " + this);
		}

		Month.prototype.displayDate.apply(this, arguments);

		return this;

	};

	DatesRow.prototype._setTopPosition = function(iTop){

		this._iTopPosition = iTop;

	};

	DatesRow.prototype.setPrimaryCalendarType = function(sCalendarType){

		Month.prototype.setPrimaryCalendarType.apply(this, arguments);

		if (this._oStartDate) {
			this._oStartDate = new CalendarDate(this._oStartDate, sCalendarType);
		}

		return this;

	};

	DatesRow.setSecondaryCalendarType = function(sCalendarType){
		this._bSecondaryCalendarTypeSet = true;
		Month.prototype.setSecondaryCalendarType.apply(this, arguments);

		return this;
	};

	/**
	 * Handler used for controling the behaviour when border is reached.
	 *
	 * The method this._getRelativeInfo provides information from the PlanningCalendar about the relative views.
	 *
	 * @private
	 * @param {int} oControlEvent The control event.
	 */
	DatesRow.prototype._handleBorderReached = function(oControlEvent){

		var oEvent = oControlEvent.getParameter("event");
		var iDays = this._getRelativeInfo ? this.getDays() * this._getRelativeInfo().iIntervalSize : this.getDays();
		var iStep = this._getRelativeInfo ? this._getRelativeInfo().iIntervalSize : 1;
		var oOldDate = this._getDate();
		var oFocusedDate = new CalendarDate(oOldDate, this.getPrimaryCalendarType());

		if (oEvent.type) {
			switch (oEvent.type) {
			case "sapnext":
			case "sapnextmodifiers":
				//go to next day
				oFocusedDate.setDate(oFocusedDate.getDate() + iStep);
				break;

			case "sapprevious":
			case "sappreviousmodifiers":
				//go to previous day
				oFocusedDate.setDate(oFocusedDate.getDate() - iStep);
				break;

			case "sappagedown":
				// go getDays() days forward
				oFocusedDate.setDate(oFocusedDate.getDate() + iDays);
				break;

			case "sappageup":
				// go getDays() days backwards
				oFocusedDate.setDate(oFocusedDate.getDate() - iDays);
				break;

			default:
				break;
			}

			this.fireFocus({date: oFocusedDate.toLocalJSDate(), otherMonth: true, _outsideBorder: true});

		}

	};

	/**
	 * Checks if given date is focusable.
	 *
	 * @param {Date} oDate JavaScript (local) date.
	 * @returns {boolean} true if the date is focusable, false otherwise.
	 */
	DatesRow.prototype.checkDateFocusable = function(oDate){

		CalendarUtils._checkJSDateObject(oDate);

		if (this._bNoRangeCheck) {
			// to force to render days if start date is changed
			return false;
		}

		var oStartDate = this._getStartDate();

		var oEndDate = new CalendarDate(oStartDate, this.getPrimaryCalendarType());
		var iAdditionalDays = this.getDays();

		if (this._getRelativeInfo && this._getRelativeInfo().bIsRelative) {
			iAdditionalDays = this.getDays() * this._getRelativeInfo().iIntervalSize;
		}

		oEndDate.setDate(oEndDate.getDate() + iAdditionalDays);
		var oCalDate = CalendarDate.fromLocalJSDate(oDate, this.getPrimaryCalendarType());

		return oCalDate.isSameOrAfter(oStartDate) && oCalDate.isBefore(oEndDate);
	};

	DatesRow.prototype._renderHeader = function(){

		var oStartDate = this._getStartDate();
		var iStartDay = oStartDate.getDay();
		var oLocaleData = this._getLocaleData();
		var aWeekHeader = this.$("Names").children();

		var aWeekDays = [];
		if (this._bLongWeekDays || !this._bNamesLengthChecked) {
			aWeekDays = oLocaleData.getDaysStandAlone("abbreviated");
		} else {
			aWeekDays = oLocaleData.getDaysStandAlone("narrow");
		}
		var aWeekDaysWide = oLocaleData.getDaysStandAlone("wide");
		var i = 0;

		for (i = 0; i < aWeekHeader.length; i++) {
			var $WeekHeader = jQuery(aWeekHeader[i]);
			$WeekHeader.text(aWeekDays[(i + iStartDay) % 7]);
			$WeekHeader.attr("aria-label", aWeekDaysWide[(i + iStartDay) % 7]);
		}

		if (this._getShowHeader()) {
			var $Container = this.$("Head");

			if ($Container.length > 0) {
				var oRm = new RenderManager().getInterface();
				this.getRenderer().renderHeaderLine(oRm, this, oLocaleData, oStartDate);
				oRm.flush($Container[0]);
				oRm.destroy();
			}
		}

	};

	/*
	 * returns the first displayed week day. Needed to change week days if too long
	 */
	DatesRow.prototype._getFirstWeekDay = function(){

		return this._getStartDate().getDay();

	};

	/**
	 * Returns the weeks with their length and number for the displayed dates.
	 *
	 * @returns {Array} Array with objects containing info about the weeks. Example: [{ len: 3, number: 12 }, { len: 7, number: 13 }, ...]
	 * @private
	 */
	DatesRow.prototype.getWeekNumbers = function() {
		var iDays = this.getDays(),
			sLocale = this._getLocale(),
			oCalType = this.getPrimaryCalendarType(),
			oStartDate = this._getStartDate(),
			oDate = new CalendarDate(oStartDate, oCalType),
			oEndDate = new CalendarDate(oStartDate, oCalType).setDate(oDate.getDate() + iDays),
			aDisplayedDates = [];

		while (oDate.isBefore(oEndDate)) {
			aDisplayedDates.push(new CalendarDate(oDate, oCalType));
			oDate.setDate(oDate.getDate() + 1);
		}

		this._aWeekNumbers = aDisplayedDates.reduce(function (aWeekNumbers, oDay) {
			var oDateFormat = DateFormat.getInstance({pattern: "w", calendarType: this.getPrimaryCalendarType(), calendarWeekNumbering: this.getCalendarWeekNumbering()}, new Locale(sLocale));

			var iWeekNumber = Number(oDateFormat.format(oDay.toUTCJSDate(), true));

			if (!aWeekNumbers.length || aWeekNumbers[aWeekNumbers.length - 1].number !== iWeekNumber) {
				aWeekNumbers.push({
					len: 0,
					number: iWeekNumber
				});
			}

			aWeekNumbers[aWeekNumbers.length - 1].len++;

			return aWeekNumbers;
		}.bind(this), []);

		return this._aWeekNumbers;
	};

	/**
	 * Returns the cached week numbers.
	 * @returns {Array} Array with objects containing info about the weeks. Example: [{ len: 3, number: 12 }, { len: 7, number: 13 }, ...]
	 * @private
	 */
	DatesRow.prototype._getCachedWeekNumbers = function() {
		return this._aWeekNumbers;
	};

	return DatesRow;

});