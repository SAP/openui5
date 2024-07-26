/*!
 * ${copyright}
 */
//Provides control sap.ui.unified.NonWorkingPeriod.
sap.ui.define([
	'sap/ui/core/Element',
	'sap/ui/core/date/UI5Date',
	'./TimeRange'
],
	function(
		Element,
		UI5Date
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
			date : {type : "object", defaultValue : null}
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
	 * @public
	 * @returns {Date|module:sap/ui/core/date/UI5Date} Returns a date that is composed of the start date to which the non-working period refers,
	 * replacing the hours, minutes, and seconds, respectively with the current hours, minutes, and seconds.
	 */
	NonWorkingPeriod.prototype.getStartDate = function(){
		const oStartDate = UI5Date.getInstance(this.getDate());
		const oTimeRangeStartDate = this.getTimeRange().getStartDate();

		oStartDate.setHours(oTimeRangeStartDate.getHours(), oTimeRangeStartDate.getMinutes(), oTimeRangeStartDate.getMilliseconds());
		return oStartDate;
	};

	/**
	 * Returns a composed end date.
	 * @public
	 * @returns {Date|module:sap/ui/core/date/UI5Date} Returns a date that is composed of the end date to which the non-working period refers,
	 * replacing the hours, minutes, and seconds, respectively with the current hours, minutes, and seconds.
	 */
	NonWorkingPeriod.prototype.getEndDate = function(){
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

	return NonWorkingPeriod;
});