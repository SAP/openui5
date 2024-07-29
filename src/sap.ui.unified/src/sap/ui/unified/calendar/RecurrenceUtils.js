/*!
 * ${copyright}
 */

// package documentation
/**
 * Collection of utility functions to handle recurrence related operations.
 *
 * @namespace
 * @name sap.ui.unified.recurring
 * @public
 */

// Provides class sap.ui.unified.calendar.RecurrenceUtils
sap.ui.define([
	'sap/ui/core/date/UI5Date'
], function(
	UI5Date
) {
	"use strict";

	// Static class

	/**
	 * @alias sap.ui.unified.RecurrenceUtils
	 * @namespace
	 * @private
	 */
	var RecurrenceUtils = {};

	/**
	 * Evaluates whether there is an occurrence for a given date.
	 * The method will be used by <code>RecurringNonWorkingPeriod</code> by changing
	 * the context to that of <code>RecurringNonWorkingPeriod</code>
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate A date instance
	 * @return {boolean} True if there is an occurrence for this day
	 * @private
	 * @ui5-restricted
	 */
	RecurrenceUtils.hasOccurrenceOnDate = function (oDate) {
		if (this.getRecurrenceType() !== "Daily") {
			return false;
		}

		const oStartDate = UI5Date.getInstance(this.getStartDate());
		oStartDate.setHours(0,0,0);

		const iDayInMilliseconds = 24 * 60 * 60 * 1000;
		const isDateInRange = oDate >= oStartDate && oDate <= this.getRecurrenceEndDate();
		const isWithCorrectPattern = ((oDate.getTime() - oStartDate.getTime()) / iDayInMilliseconds) % this.getRecurrencePattern() === 0;

		return  isDateInRange && isWithCorrectPattern;
	};

	return RecurrenceUtils;

});