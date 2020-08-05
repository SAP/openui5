/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/unified/calendar/DatesRow',
	'sap/ui/unified/calendar/CalendarUtils',
	'sap/ui/unified/calendar/CalendarDate',
	'sap/ui/unified/library',
	"./OneMonthDatesRowRenderer"
],
	function(DatesRow, CalendarUtils, CalendarDate, library, OneMonthDatesRowRenderer) {
		"use strict";

	/*
	 * Inside the OneMonthDatesRow CalendarDate objects are used. But in the API JS dates are used.
	 * So conversion must be done on API functions.
	 */

	/**
	 * Constructor for a new <code>OneMonthDatesRow</code>.
	 *
	 * @param {string} [sID] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * This control is a private and used internally for the purposes of the PlanningCalendar 1 month view. It supports
	 * the following rendering depending on the parent's container width:
	 * <ul>
	 * <li>a calendar like rows for S & M sizes </li>
	 * <li>a single row for all other sizes </li>
	 * </ul>
	 * Other usages are not supported.
	 *
	 * @extends sap.ui.unified.calendar.DatesRow
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.44
	 * @alias sap.ui.unified.calendar.OneMonthDatesRow
	 */
	var OneMonthDatesRow = DatesRow.extend("sap.ui.unified.calendar.OneMonthDatesRow", /** @lends sap.ui.unified.calendar.OneMonthDatesRow.prototype */ {
		metadata : {
			library : "sap.ui.unified"
		}
	});

	OneMonthDatesRow.apiVersion = 2;

	OneMonthDatesRow.prototype.init = function() {
		DatesRow.prototype.init.apply(this, arguments);
		this.iMode = 2; //default corresponds to size L
	};

	OneMonthDatesRow.prototype.setMode = function(iMode) {
		var oSelectedDates = this.getSelectedDates(),
			oStartDate,
			bChanged = this.iMode !== iMode;

		this.iMode = iMode;


		if (bChanged && oSelectedDates.length) {
			if (this.iMode < 2) {
				oStartDate = this.getStartDate();
			}

			//clear or set to first of the month
			oSelectedDates[0].setProperty('startDate', oStartDate);
		}

		return this;
	};

	/**
	 * Obtains the rendering mode.
	 * @returns {number|*} the mode - 0 - Tablet, 1 - Phone, 2 - Desktop
	 */
	OneMonthDatesRow.prototype.getMode = function () {
		return this.iMode;
	};

	/**
	 * Selects a given date.
	 * @param {Date} oDate a JavaScript date
	 * @return {sap.ui.unified.calendar.OneMonthDatesRow} <code>this</code> for method chaining
	 */
	OneMonthDatesRow.prototype.selectDate = function(oDate) {
		if (this.iMode < 2 && this.getSelectedDates().length) {
			this.getSelectedDates()[0].setStartDate(oDate);
		}
		return this;
	};

	/**
	 * Sets a given date.
	 * @param {Date} oDate a JavaScript date
	 * @return {sap.ui.unified.calendar.OneMonthDatesRow} <code>this</code> for method chaining
	 */
	OneMonthDatesRow.prototype.setDate = function(oDate) {
		// check if in visible date range
		if (!this._bNoRangeCheck && !this.checkDateFocusable(oDate)) {
			return this;
		}

		DatesRow.prototype.setDate.apply(this, arguments);

		return this;
	};

	OneMonthDatesRow.prototype.getDays = function() {
		if (this.iMode === 2) {
			return 31;
		} else {
			return CalendarUtils._daysInMonth(CalendarDate.fromLocalJSDate(this.getStartDate()));
		}
	};

	/**
	 * Displays a given date.
	 * @param {Date} oDate a JavaScript date
	 * @return {sap.ui.unified.calendar.OneMonthDatesRow} <code>this</code> for method chaining
	 */
	OneMonthDatesRow.prototype.displayDate = function(oDate){
		// check if in visible date range
		if (!this._bNoRangeCheck && !this.checkDateFocusable(oDate)) {
			return this;
		}

		DatesRow.prototype.displayDate.apply(this, arguments);

		return this;

	};

	/**
	 * Handles [HOME] key to focus the 1st day of the month regardless any dates from other months
	 * @param {Object} oEvent the event
	 */
	OneMonthDatesRow.prototype.onsaphome = function(oEvent) {
		var oCalStartDate = CalendarDate.fromLocalJSDate(this.getStartDate());

		//prevent item navigation to focus the 1st visible item, because this item may correspond to an item from other month
		interruptEvent(oEvent);

		this._setDate(oCalStartDate);//Can we reuse setDate (see checkDateFocusable that prevents setting the date).
		this._focusDate(oCalStartDate);

		this.fireFocus({date: oCalStartDate.toLocalJSDate(), otherMonth: false});
	};

	/**
	 * Handles [END] key to focus the last day of the month regardless any dates from other months
	 * @param {Object} oEvent the event
	 */
	OneMonthDatesRow.prototype.onsapend = function (oEvent) {
		var oStartDate = this.getStartDate(),
			oLastDay;

		oLastDay = CalendarDate.fromLocalJSDate(oStartDate);
		oLastDay.setDate(CalendarUtils._daysInMonth(oLastDay));

		//prevent item navigation to focus the last visible item, because this item may correspond to an item from other month
		interruptEvent(oEvent);

		this._setDate(oLastDay); //Can we reuse setDate (see checkDateFocusable that prevents setting the date).
		this._focusDate(oLastDay);

		this.fireFocus({date: oLastDay.toLocalJSDate(), otherMonth: false});
	};

	function interruptEvent(oEvent) {
		oEvent.stopPropagation();
		oEvent.preventDefault();
		oEvent.stopImmediatePropagation(true);
	}

	return OneMonthDatesRow;

});