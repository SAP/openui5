/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/date/UniversalDate",
	"sap/f/cards/Utils"
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
	var oDateTimeFormatters = {

		/**
		 * Formats date and time.
		 * @param {string|number|object} vDate Any string and number from which Date object can be created, or a Date object.
		 * @param {object} [oFormatOptions] All format options which sap.ui.core.format.DateFormat.getDateTimeInstance accepts.
		 * @param {string} [sLocale] A string representing the desired locale. If skipped the current locale of the user is taken
		 * @returns {string} The formatted date time.
		 */
		dateTime: function (vDate, oFormatOptions, sLocale) {

			var oArguments = Utils.processFormatArguments(oFormatOptions, sLocale),
				oDateFormat = DateFormat.getDateTimeInstance(oArguments.formatOptions, oArguments.locale),
				oParsedDate = Utils.parseJsonDateTime(vDate);

			// Calendar is determined base on sap.ui.getCore().getConfiguration().getCalendarType()
			var oUniversalDate = new UniversalDate(oParsedDate);
			var sFormattedDate = oDateFormat.format(oUniversalDate);

			return sFormattedDate;
		},

		/**
		 * Formats date and time.
		 * @param {string|number|object} vDate Any string and number from which Date object can be created, or a Date object.
		 * @param {object} [oFormatOptions] All format options which sap.ui.core.format.DateFormat.getDateTimeInstance accepts.
		 * @param {string} [sLocale] A string representing the desired locale. If skipped the current locale of the user is taken
		 * @returns {string} The formatted date time.
		 * @deprecated Since version 1.74
		 * Use dateTime instead
		 */
		date: function (vDate, oFormatOptions, sLocale) {
			return oDateTimeFormatters.dateTime.apply(this, arguments);
		}
	};

	return oDateTimeFormatters;
});