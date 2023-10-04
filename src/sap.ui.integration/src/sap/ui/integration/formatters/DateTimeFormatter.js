/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/integration/util/Utils"
], function (
	DateFormat,
	UniversalDate,
	Utils
) {
	"use strict";

	/**
	 * Contains functions that can format date and time
	 *
	 * @namespace
	 * @private
	 */
	const oDateTimeFormatters = {

		/**
		 * Formats date and time.
		 * @param {string|integer|Date|Array<string|integer|Date>} vDate The date or dates to be formatted. Accepts date string, timestamp, Date instance, or array of the same.
		 * @param {object} [oFormatOptions] All format options which sap.ui.core.format.DateFormat.getDateTimeInstance accepts.
		 * @param {string} [sLocale] A string representing the desired locale. If skipped the current locale of the user is taken
		 * @returns {string} The formatted date time.
		 */
		dateTime(vDate, oFormatOptions, sLocale) {
			const oArguments = Utils.processFormatArguments(oFormatOptions, sLocale);
			const oDateTimeFormatter = DateFormat.getDateTimeInstance(oArguments.formatOptions, oArguments.locale);
			let vUniversalDate;

			if (Array.isArray(vDate)) {
				vUniversalDate = vDate.map((date) => new UniversalDate(Utils.parseJsonDateTime(date)));
			} else if (vDate !== undefined) {
				vUniversalDate = new UniversalDate(Utils.parseJsonDateTime(vDate));
			}

			if (vUniversalDate) {
				return oDateTimeFormatter.format(vUniversalDate);
			}

			return "";
		},

		/**
		 * Formats date.
		 * @param {string|integer|Date|Array<string|integer|Date>} vDate The date or dates to be formatted. Accepts date string, timestamp, Date instance, or array of the same.
		 * @param {object} [oFormatOptions] All format options which sap.ui.core.format.DateFormat.getDateTimeInstance accepts.
		 * @param {string} [sLocale] A string representing the desired locale. If skipped the current locale of the user is taken
		 * @returns {string} The formatted date.
		 */
		date(vDate, oFormatOptions, sLocale) {
			const oArguments = Utils.processFormatArguments(oFormatOptions, sLocale);
			const oDateFormatter = DateFormat.getDateInstance(oArguments.formatOptions, oArguments.locale);
			let vUniversalDate;

			if (Array.isArray(vDate)) {
				vUniversalDate = vDate.map((date) => new UniversalDate(Utils.parseJsonDateTime(date)));
			} else if (vDate !== undefined) {
				vUniversalDate = new UniversalDate(Utils.parseJsonDateTime(vDate));
			}

			if (vUniversalDate) {
				return oDateFormatter.format(vUniversalDate);
			}

			return "";
		}
	};

	return oDateTimeFormatters;
});