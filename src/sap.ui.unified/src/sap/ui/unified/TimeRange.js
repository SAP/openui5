
/*!
 * ${copyright}
 */
//Provides control sap.ui.unified.TimeRange.
sap.ui.define([
 'sap/ui/core/Element',
 'sap/ui/core/format/DateFormat',
 "sap/base/i18n/Formatting",
 'sap/ui/core/Locale'
],
	function(Element, DateFormat, Formatting, Locale) {
	"use strict";
	/**
	 * Constructor for a new TimeRange.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Time range for use in <code>NonWorkingPeriod</code>
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.127.0
	 * @experimental Since version 1.127.0.
	 * @alias sap.ui.unified.TimeRange
	 */
	var TimeRange = Element.extend("sap.ui.unified.TimeRange", /** @lends sap.ui.unified.TimeRange.prototype */ { metadata : {
		library : "sap.ui.unified",
		properties : {
			/**
			 * Start time for a time range. This must be a String.
			 */
			start: {type : "string", group : "Misc", defaultValue : null},
			/**
			 * End time  for a time range. This must be a String.
			 */
			end : {type : "string", group : "Misc", defaultValue : null},
			/**
			 * Determines the format of the startTime and endTime
			 *
			 * <b>Note:</b> a time pattern in LDML format. It is not verified whether the pattern only represents a time.
			 */
			valueFormat : {type: "string", group : "Misc", defaultValue: "hh:mm"}
		}
	}});


	TimeRange.prototype._getFormatInstance = function(){
		const oArguments = {pattern: this.getValueFormat(), strictParsing: true};
		return DateFormat.getTimeInstance(oArguments, new Locale(Formatting.getLanguageTag()));
	};

	/**
	 * Get start date for a time range.
	 * From this date, only hours, minutes, seconds, and milliseconds are used.
	 * @public
	 * @returns {Date|module:sap/ui/core/date/UI5Date} [oDate] A date instance
	 */
	TimeRange.prototype.getStartDate = function () {
		return this._getFormatInstance().parse(this.getStart());
	};

	/**
	 * Get end date for a time range.
	 * From this date, only hours, minutes, seconds, and milliseconds are used.
	 * @public
	 * @returns {Date|module:sap/ui/core/date/UI5Date} [oDate] A date instance
	 */
	TimeRange.prototype.getEndDate = function () {
		return this._getFormatInstance().parse(this.getEnd());
	};

	return TimeRange;
});