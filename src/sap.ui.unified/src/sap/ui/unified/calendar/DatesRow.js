/*!
 * ${copyright}
 */

//Provides control sap.ui.unified.Calendar.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/calendar/Month',
	'sap/ui/unified/library',
	"./DatesRowRenderer"
], function(jQuery, CalendarUtils, CalendarDate, Month, library, DatesRowRenderer) {
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
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
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
			showDayNamesLine : {type : "boolean", group : "Appearance", defaultValue : true}

		}
	}});

	DatesRow.prototype.init = function(){

		Month.prototype.init.apply(this, arguments);

		this._iColumns = 1;

		//holds objects describing the weeks of the currently displayed days
		//example: [{ len: 3, number: 12 }, { len: 7, number: 13 }, ...]
		this._aWeekNumbers = [];

	};

	/*
	 * Sets a start date.
	 * @param {Date} oStartDate A JavaScript date
	 * @return {sap.ui.unified.calendar.DatesRow} <code>this</code> for method chaining
	 */
	DatesRow.prototype.setStartDate = function(oStartDate){

		CalendarUtils._checkJSDateObject(oStartDate);

		var iYear = oStartDate.getFullYear();
		CalendarUtils._checkYearInValidRange(iYear);

		this.setProperty("startDate", oStartDate, true);
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
			this._oStartDate = CalendarDate.fromLocalJSDate(new Date(), this.getPrimaryCalendarType());
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
	 * @param {object} oDate JavaScript date object for start date.
	 * @returns {sap.ui.unified.calendar.DatesRow} <code>this</code> to allow method chaining
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
	 * displays the a given date without setting the focus
	 *
	 * Property <code>date</code> date to be focused or displayed. It must be in the displayed date range
	 * beginning with <code>startDate</code> and <code>days</code> days
	 * So set this properties before setting the date.
	 *
	 * @param {object} oDate JavaScript date object for focused date.
	 * @returns {sap.ui.unified.calendar.DatesRow} <code>this</code> to allow method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	DatesRow.prototype.displayDate = function(oDate){

		// check if in visible date range
		if (!this._bNoRangeCheck && !this.checkDateFocusable(oDate)) {
			throw new Error("Date must be in visible date range; " + this);
		}

		Month.prototype.displayDate.apply(this, arguments);

		return this;

	};

	DatesRow.prototype.setPrimaryCalendarType = function(sCalendarType){

		Month.prototype.setPrimaryCalendarType.apply(this, arguments);

		if (this._oStartDate) {
			this._oStartDate = new CalendarDate(this._oStartDate, sCalendarType);
		}

		return this;

	};

	/**
	 * Setter for property <code>firstDayOfWeek</code>.
	 *
	 * Property <code>firstDayOfWeek</code> is not supported in <code>sap.ui.unified.calendar.DatesRow</code> control.
	 *
	 * @protected
	 * @param {int} iFirstDayOfWeek The first day of the week
	 * @returns {sap.ui.unified.calendar.DatesRow} <code>this</code> to allow method chaining
	 */
	DatesRow.prototype.setFirstDayOfWeek = function(iFirstDayOfWeek){

		if (iFirstDayOfWeek == -1) {
			return this.setProperty("firstDayOfWeek", iFirstDayOfWeek, false); // rerender
		} else {
			throw new Error("Property firstDayOfWeek not supported " + this);
		}

	};

	DatesRow.prototype._handleBorderReached = function(oControlEvent){

		var oEvent = oControlEvent.getParameter("event");
		var iDays = this.getDays();
		var oOldDate = this._getDate();
		var oFocusedDate = new CalendarDate(oOldDate, this.getPrimaryCalendarType());

		if (oEvent.type) {
			switch (oEvent.type) {
			case "sapnext":
			case "sapnextmodifiers":
				//go to next day
				oFocusedDate.setDate(oFocusedDate.getDate() + 1);
				break;

			case "sapprevious":
			case "sappreviousmodifiers":
				//go to previous day
				oFocusedDate.setDate(oFocusedDate.getDate() - 1);
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
		oEndDate.setDate(oEndDate.getDate() + this.getDays());
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
				var oRm = sap.ui.getCore().createRenderManager();
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
	 * @returns {Array} Array with objects containing info about the weeks. Example: [{ len: 3, number: 12 }, { len: 7, number: 13 }, ...]
	 * @private
	 */
	DatesRow.prototype.getWeekNumbers = function() {
		var iDays = this.getDays(),
			oLocale = this._getLocale(),
			oLocaleData = this._getLocaleData(),
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
			var iWeekNumber = CalendarUtils.calculateWeekNumber(oDay.toUTCJSDate(), oDay.getYear(), oLocale, oLocaleData);

			if (!aWeekNumbers.length || aWeekNumbers[aWeekNumbers.length - 1].number !== iWeekNumber) {
				aWeekNumbers.push({
					len: 0,
					number: iWeekNumber
				});
			}

			aWeekNumbers[aWeekNumbers.length - 1].len++;

			return aWeekNumbers;
		}, []);

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
