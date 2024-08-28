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

	const PERIOD_TYPE = {
		"WORKING_PERIOD" : "working",
		"NON_WORKING_PERIOD": "non-working"
	};

	/**
	 * Evaluates whether there is an occurrence for a given date.
	 * The method will be used by <code>RecurringNonWorkingPeriod</code> by changing
	 * the context to that of <code>RecurringNonWorkingPeriod</code>
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate A date instance
	 * @return {boolean} True if there is an occurrence for this day
	 * @private
	 * @ui5-restricted sap.ui.unified.RecurringNonWorkingPeriod
	 */
	RecurrenceUtils.hasOccurrenceOnDate = function (oDate) {
		if (this.getRecurrenceType() !== "Daily") {
			return false;
		}

		const oStartDate = UI5Date.getInstance(this.getStartDate());
		const oCurrentDate = UI5Date.getInstance(oDate);
		oStartDate.setHours(0,0,0,0);
		oCurrentDate.setHours(0,0,0,0);

		const iDayInMilliseconds = 24 * 60 * 60 * 1000;
		const isDateInRange = oCurrentDate >= oStartDate && oCurrentDate <= this.getRecurrenceEndDate();
		const isWithCorrectPattern = ((oCurrentDate.getTime() - oStartDate.getTime()) / iDayInMilliseconds) % this.getRecurrencePattern() === 0;

		return  isDateInRange && isWithCorrectPattern;
	};

	RecurrenceUtils.calculateDurationInCell = function (oNonWorkingPart, oCellStartDate, iCurrentPointInMinutes){
		const oNonWorkingPartDate = oNonWorkingPart.getStartDate();
		const iMinutesInOneHours = 60;
		let iDuration = oNonWorkingPart.getDurationInMinutes();

		if (oNonWorkingPartDate.getHours() < oCellStartDate.getHours()) {
			const iTimeCell = oCellStartDate.getHours() * iMinutesInOneHours + oCellStartDate.getMinutes();
			const iTimePart = oNonWorkingPartDate.getHours() * iMinutesInOneHours + oNonWorkingPartDate.getMinutes();
			iDuration -= (iTimeCell - iTimePart);
		} else if (oNonWorkingPartDate.getHours() === oCellStartDate.getHours() && oNonWorkingPartDate.getMinutes() > 0) {
			iDuration = oNonWorkingPart.getDurationInMinutes() + iCurrentPointInMinutes > 60 ? iMinutesInOneHours - iCurrentPointInMinutes : oNonWorkingPart.getDurationInMinutes();
		} else {
			iDuration = iMinutesInOneHours - iCurrentPointInMinutes;
		}

		return iDuration;
	};

	/**
	 * Determines what portion of a calendar cell (representing one hour) is filled with non-working time and what portion is filled with working time.
	 * @param {Date|module:sap/ui/core/date/UI5Date} oCellStartDate A date instance for the current cell
	 * @param {Array<sap.ui.unified.NonWorkingPeriod | sap.ui.unified.RecurringNonWorkingPeriod>} aNonWorkingForCurrentHours An array of non-working periods
	 * @return {Array} An array of objects containing information about the type and duration of each part of the cell.
	 * @private
	 * @ui5-restricted sap.ui.unified.RecurringNonWorkingPeriod
	 */
	RecurrenceUtils.getWorkingAndNonWorkingSegments = function (oCellStartDate, aNonWorkingForCurrentHours) {
		const aCellInfo = [];
		const iMinutesInOneHours = 60;

		let iCurrentPointInMinutes = 0;
		let index = 0;

		while (iCurrentPointInMinutes < iMinutesInOneHours) {
			const oNonWorkingPart = aNonWorkingForCurrentHours[index];
			const oNonWorkingPartDate = oNonWorkingPart?.getStartDate();

			if (!oNonWorkingPart) {
				const iCurrentDuration = iMinutesInOneHours - iCurrentPointInMinutes;
				aCellInfo.push({
					type: PERIOD_TYPE.WORKING_PERIOD,
					duration: iCurrentDuration
				});

				return aCellInfo;
			}

			let iDuration = this.calculateDurationInCell(oNonWorkingPart, oCellStartDate, iCurrentPointInMinutes);
			const iStartTimeInMin = oNonWorkingPartDate.getMinutes();

			if (iDuration > iMinutesInOneHours && oNonWorkingPartDate.getHours() < oCellStartDate.getHours()) {
				aCellInfo.push({
					type: PERIOD_TYPE.NON_WORKING_PERIOD,
					duration: iMinutesInOneHours
				});

				return aCellInfo;
			}

			if (iStartTimeInMin === iCurrentPointInMinutes || oNonWorkingPartDate.getHours() < oCellStartDate.getHours()) {
				aCellInfo.push({
					type: PERIOD_TYPE.NON_WORKING_PERIOD,
					duration: iDuration
				});
				index++;
			} else {
				iDuration = iStartTimeInMin - iCurrentPointInMinutes;
				aCellInfo.push({
					type: PERIOD_TYPE.WORKING_PERIOD,
					duration: iDuration
				});
			}

			iCurrentPointInMinutes += iDuration;
		}

		return aCellInfo;
	};

	return RecurrenceUtils;

});