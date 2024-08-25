/*!
 * ${copyright}
 */
//Provides control sap.ui.unified.NonWorkingPeriod.
sap.ui.define([
	'sap/ui/core/Element',
	'sap/ui/core/date/UI5Date',
	'sap/base/Log'
],
	function(
		Element,
		UI5Date,
		Log
		) {
	"use strict";
	/**
	 * Constructor for a new NonWorkingPeriod.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * NonWorkingPeriod
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.27.0
	 * @experimental Since version 1.127.0.
	 * @alias sap.ui.unified.NonWorkingPeriod
	 */
	var NonWorkingPeriod = Element.extend("sap.ui.unified.NonWorkingPeriod", /** @lends sap.ui.unified.NonWorkingPeriod.prototype */ { metadata : {
		library : "sap.ui.unified",
		properties : {
			/**
			 * Determines the day to which the timeRange refers. This object must be a UI5Date or JavaScript Date object.
			 */
			date : {type : "object", group : "Data"}
		},
		defaultAggregation: "timeRange",
		aggregations: {
			/**
			 * Defines the hours range for the non-working period.
			 */
			timeRange: {
				type: "sap.ui.unified.TimeRange",
				multiple: false
			}
		}
	}});

	/**
	 * Returns a composed start date.
	 * @private
	 * @returns {Date|module:sap/ui/core/date/UI5Date} Returns a date that is composed of the start date to which the non-working period refers,
	 * replacing the hours, minutes, and seconds, respectively with the current hours, minutes, and seconds.
	 */
	NonWorkingPeriod.prototype.getStartDate = function(){
		if (!this.getDate()) {
			return Log.error("Enter a valid date.");
		}

		const oStartDate = UI5Date.getInstance(this.getDate());
		const oTimeRangeStartDate = this.getTimeRange().getStartDate();

		oStartDate.setHours(oTimeRangeStartDate.getHours(), oTimeRangeStartDate.getMinutes(), oTimeRangeStartDate.getMilliseconds());
		return oStartDate;
	};

	/**
	 * Returns a composed end date.
	 * @private
	 * @returns {Date|module:sap/ui/core/date/UI5Date} Returns a date that is composed of the end date to which the non-working period refers,
	 * replacing the hours, minutes, and seconds, respectively with the current hours, minutes, and seconds.
	 */
	NonWorkingPeriod.prototype.getEndDate = function(){
		if (!this.getDate()) {
			return Log.error("Enter a valid date.");
		}

		const oEndDate = UI5Date.getInstance(this.getDate());
		const oEndDateTimeRange = this.getTimeRange().getEndDate();

		oEndDate.setHours(oEndDateTimeRange.getHours(), oEndDateTimeRange.getMinutes(), oEndDateTimeRange.getMilliseconds());
		return oEndDate;
	};

	/**
	 * Returns the duration of the non-working period.
	 * @public
	 * @returns {int} returns a number that represents the duration of a calendar item in minutes
	 */
	NonWorkingPeriod.prototype.getDurationInMinutes = function () {
		return Math.abs(this.getStartDate().getTime() - this.getEndDate().getTime()) / 1000 / 60;
	};

	/**
	 * Determines whether the current instance has recurrence or not.
	 * @return {boolean} The result is <code>false</code> when the instance has no recurrence.
	 * @private
	 */
	NonWorkingPeriod.prototype.isRecurring = function () {
		return false;
	};

	/**
	 * Evaluates whether there is an non working period for a given date.
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate A date instance
	 * @return {boolean} True if there is an occurrence for this day
	 */
	NonWorkingPeriod.prototype.hasNonWorkingAtDate = function (oDate) {
		const oStartDate = UI5Date.getInstance(this.getStartDate());
		const oCurrentDate = UI5Date.getInstance(oDate);
		oStartDate.setHours(0,0,0);
		oCurrentDate.setHours(0,0,0);

		const isDateInRange = oCurrentDate >= oStartDate && oCurrentDate <= this.getEndDate();

		return  isDateInRange;
	};

	/**
	 * Evaluates whether there is an occurrence for the given date and hours.
	 * @param {Date|module:sap/ui/core/date/UI5Date} oDate A date instance
	 * @return {boolean} True if there is an occurrence for these hours
	 * @private
	 */
	NonWorkingPeriod.prototype.hasNonWorkingAtHour = function (oDate) {
		const iStartHours = this.getStartDate().getHours();
		const iTimeCalendarItem = iStartHours + (this.getStartDate().getMinutes() + this.getDurationInMinutes()) / 60;
		const iTimeData = oDate.getHours() + oDate.getMinutes() / 60;

		return oDate.getHours() === iStartHours || (iTimeCalendarItem >= iTimeData && iStartHours <= oDate.getHours());
	};

	return NonWorkingPeriod;
});