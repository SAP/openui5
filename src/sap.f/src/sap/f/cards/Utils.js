/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Locale",
	'sap/base/util/isPlainObject',
	"sap/base/Log"
], function (
	Locale,
	isPlainObject,
	Log
) {
	"use strict";

	/**
	 * Utility class for sap.ui.integration.widgets.Card helping with formatters.
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @private
	 * @alias sap.f.cards.Utils
	 */
	var Utils = {};

	/**
	 * Shifts formatter options and locale.
	 * @param {object} formatOptions The format options.
	 * @param {string} locale Custom locale
	 * @returns {object} Locale
	 */
	Utils.processFormatArguments = function (formatOptions, locale) {

		var oFormatOptions = isPlainObject(formatOptions) ? formatOptions : {},
			oLocale = typeof formatOptions === "string" ? new Locale(formatOptions) : (locale && new Locale(locale));

		return {
			formatOptions: oFormatOptions,
			locale: oLocale
		};
	};

	/**
	 * Parses the JSON Date representation into a Date object.
	 * @param {string|number|object} vDate Any string and number from which Date object can be created, or a Date object.
	 * @returns {object} A Date object if the vDate matches one else the vDate itself
	 */

	var JSON_DATE_TICKS = 1,
		JSON_DATE_SIGN = 2,
		JSON_DATE_MINUTES = 3;

	Utils.parseJsonDateTime = function (vDate) {
		var rJSONDateFormat = /^\/Date\((-?\d+)(\+|-)?(\d+)?\)\/$/,
			aJSONDateParts;
		if (typeof vDate === "string") {
			aJSONDateParts = rJSONDateFormat.exec(vDate);
		}

		if (aJSONDateParts) {
			// 0 - complete results; 1 - ticks; 2 - sign; 3 - minutes
			var oResult = new Date(parseInt(aJSONDateParts[JSON_DATE_TICKS]));
			if (aJSONDateParts[JSON_DATE_SIGN]) {
				var iMins = parseInt(aJSONDateParts[JSON_DATE_MINUTES]);
				if (aJSONDateParts[JSON_DATE_SIGN] === "-") {
					iMins = -iMins;
				}

				// The offset is reversed to get back the UTC date, which is
				// what the API will eventually have.
				var iCurrentMinutes = oResult.getUTCMinutes();
				oResult.setUTCMinutes(iCurrentMinutes - iMins);

			}
			if (isNaN(oResult.valueOf())) {
				Log.error("Invalid JSON Date format - " + vDate);
			} else {
				vDate = oResult;
			}
		}

		return vDate;
	};

	return Utils;
});