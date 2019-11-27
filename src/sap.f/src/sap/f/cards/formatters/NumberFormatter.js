/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/format/NumberFormat",
	"sap/f/cards/Utils"
], function (
	NumberFormat,
	Utils
) {
	"use strict";

	/**
	 * Contains functions that can format numbers
	 *
	 * @namespace
	 * @private
	 */
	var oNumberFormatters = {

		/**
		 * Formats currency.
		 * @param {string|number} vCurrencyValue Any string or number(value) of currency to be formatted.
		 * @param {string} sCurrencyCode A string that represents the currency iso code
		 * @param {object} [oFormatOptions] All format options which sap.ui.core.format.NumberFormat.getCurrencyInstance accepts.
		 * @param {string} [sLocale] A string representing the desired locale. If skipped the current locale of the user is taken
 		 * @returns {string} The formatted currency.
		 */
		currency: function (vCurrencyValue, sCurrencyCode, oFormatOptions, sLocale) {

			var oShiftedArguments = Utils.processFormatArguments(oFormatOptions, sLocale),
				oCurrencyFormat = NumberFormat.getCurrencyInstance(oShiftedArguments.formatOptions, oShiftedArguments.locale);

			return oCurrencyFormat.format(vCurrencyValue, sCurrencyCode);
		},

		/**
		 * Formats floating-point numbers.
		 * @param {string|number} vFloatValue Any string or number representing the value of the floating-point number to be formatted.
		 * @param {object} [oFormatOptions] All format options which sap.ui.core.format.NumberFormat.getFloatInstance accepts.
		 * @param {string} [sLocale] A string representing the desired locale. If skipped the current locale of the user is taken
 		 * @returns {string} The formatted floating-point number.
		 */
		"float": function (vFloatValue, oFormatOptions, sLocale) {

			var oShiftedArguments = Utils.processFormatArguments(oFormatOptions, sLocale),
				oFloatFormat = NumberFormat.getFloatInstance(oShiftedArguments.formatOptions, oShiftedArguments.locale);

			return oFloatFormat.format(vFloatValue);
		},

		/**
		 * Formats integers.
		 * @param {string|number} vIntegerValue Any string or number representing the value of the integer to be formatted.
		 * @param {object} [oFormatOptions] All format options which sap.ui.core.format.NumberFormat.getIntegerInstance accepts.
		 * @param {string} [sLocale] A string representing the desired locale. If skipped the current locale of the user is taken
 		 * @returns {string} The formatted integer.
		 */
		integer: function (vIntegerValue, oFormatOptions, sLocale) {

			var oShiftedArguments = Utils.processFormatArguments(oFormatOptions, sLocale),
				oIntegerFormat = NumberFormat.getIntegerInstance(oShiftedArguments.formatOptions, oShiftedArguments.locale);

			return oIntegerFormat.format(vIntegerValue);
		},

		/**
		 * Formats percentage.
		 * @param {string|number} vPercentValue Any string or number representing the value of the percentage to be formatted.
		 * @param {object} [oFormatOptions] All format options which sap.ui.core.format.NumberFormat.getPercentInstance accepts.
		 * @param {string} [sLocale] A string representing the desired locale. If skipped the current locale of the user is taken
 		 * @returns {string} The formatted percentage.
		 */
		percent: function (vPercentValue, oFormatOptions, sLocale) {

			var oShiftedArguments = Utils.processFormatArguments(oFormatOptions, sLocale),
				oPercentFormat = NumberFormat.getPercentInstance(oShiftedArguments.formatOptions, oShiftedArguments.locale);

			return oPercentFormat.format(vPercentValue);
		},

		/**
		 * Formats units of measurement.
		 * @param {string|number} vUnitValue Any string or number representing the value of the unit of measurement to be formatted.
		 * @param {string} sUnitType A string that represents the unit of measurement's type according to CLDR
		 * @param {object} [oFormatOptions] All format options which sap.ui.core.format.NumberFormat.getUnitInstance accepts.
		 * @param {string} [sLocale] A string representing the desired locale. If skipped the current locale of the user is taken
 		 * @returns {string} The formatted unit.
		 */
		unit: function (vUnitValue, sUnitType, oFormatOptions, sLocale) {

			var oShiftedArguments = Utils.processFormatArguments(oFormatOptions, sLocale),
				oUnitFormat = NumberFormat.getUnitInstance(oShiftedArguments.formatOptions, oShiftedArguments.locale);

			return oUnitFormat.format(vUnitValue, sUnitType);
		}
	};

	return oNumberFormatters;
});