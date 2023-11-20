/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/strings/formatMessage"
], function (
	Log,
	formatMessage
) {
	"use strict";

	var rDate = /(\d+Y)?(\d+M)?(\d+W)?(\d+D)?/;
	var rTime = /(?:T(?=.)(\d+H)?(\d+M)?(\d+S)?)?/;
	var rISODuration = new RegExp("^P(?=.)" + rDate.source + rTime.source + "$");

	var Duration = {};
	Duration._INVALID_DURATION = "Invalid duration: {0}";
	Duration._UNSUPPORTED_DATE = "Duration {0} contains unsupported date part";
	Duration._UNSUPPORTED_SECONDS = "Duration {0} contains unsupported seconds part";
	Duration._MINUTES_OUT_OF_RANGE = "Minutes of duration {0} are out of supported range [0-59]";
	Duration._HOURS_OUT_OF_RANGE = "Hours of duration {0} are out of supported range [0-24]";

	/**
	 * Parses ISO duration string.
	 * Decimal fractions are not supported.
	 * Duration balancing is not performed.
	 * Negative durations are not supported
	 *
	 * @param {string} sValue ISO duration string
	 * @returns {string} Duration in HH:mm format
	 */
	Duration.fromISO = function (sValue) {
		if (!sValue) {
			return "";
		}

		var aParsed = rISODuration.exec(sValue);

		if (!aParsed) {
			Log.error(formatMessage(Duration._INVALID_DURATION, sValue), "sap.ui.integration.widgets.Card");
			return "";
		}

		var sYears = aParsed[1];
		var sMonths = aParsed[2];
		var sWeeks = aParsed[3];
		var sDays = aParsed[4];
		var sHours = aParsed[5];
		var sMins =  aParsed[6];
		var sSeconds =  aParsed[7];

		if (sYears || sMonths || sWeeks || sDays) {
			Log.error(formatMessage(Duration._UNSUPPORTED_DATE, sValue), "sap.ui.integration.widgets.Card");
			return "";
		}

		if (sSeconds) {
			Log.error(formatMessage(Duration._UNSUPPORTED_SECONDS, sValue), "sap.ui.integration.widgets.Card");
			return "";
		}

		var iHours = sHours ? parseInt(sHours) : 0;
		var iMins = sMins ? parseInt(sMins) : 0;

		if (iHours > 24) {
			Log.error(formatMessage(Duration._HOURS_OUT_OF_RANGE, sValue), "sap.ui.integration.widgets.Card");
			return "";
		}

		if (iMins > 59) {
			Log.error(formatMessage(Duration._MINUTES_OUT_OF_RANGE, sValue), "sap.ui.integration.widgets.Card");
			return "";
		}

		return iHours + ":" + iMins.toString().padStart(2, "0");
	};

	Duration.toISO = function (sValue) {
		var aParts = sValue.split(":");
		var iHours = parseInt(aParts[0]);
		var iMinutes = parseInt(aParts[1]);
		var sISOvalue = "PT";

		if (iHours) {
			sISOvalue += iHours + "H";
		}

		if (iMinutes) {
			sISOvalue += iMinutes + "M";
		}

		if (!iHours && !iMinutes) {
			sISOvalue += "0S";
		}

		return sISOvalue;
	};

	return Duration;
});