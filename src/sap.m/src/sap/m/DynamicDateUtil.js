/*!
 * ${copyright}
 */

// Provides utility class sap.m.DynamicDateUtil
sap.ui.define([
	"./StandardDynamicDateOption",
	"sap/base/Log",
	"./library",
	'sap/ui/core/format/TimezoneUtil',
	'sap/ui/core/Core'
], function(
	StandardDynamicDateOption, Log, library, TimezoneUtil, Core) {
	"use strict";

	var STANDARD_KEYS_ARRAY = [
		"DATE",
		"TODAY",
		"YESTERDAY",
		"TOMORROW",

		"FIRSTDAYWEEK",
		"LASTDAYWEEK",
		"FIRSTDAYMONTH",
		"LASTDAYMONTH",
		"FIRSTDAYQUARTER",
		"LASTDAYQUARTER",
		"FIRSTDAYYEAR",
		"LASTDAYYEAR",
		"DATETIMERANGE",
		"FROMDATETIME",
		"TODATETIME",
		"DATERANGE",
		"FROM",
		"TO",
		"YEARTODATE",
		"DATETOYEAR",
		"LASTDAYS",
		"LASTWEEKS",
		"LASTMONTHS",
		"LASTQUARTERS",
		"LASTYEARS",
		"NEXTDAYS",
		"NEXTWEEKS",
		"NEXTMONTHS",
		"NEXTQUARTERS",
		"NEXTYEARS",
		"TODAYFROMTO",

		"THISWEEK",
		"LASTWEEK",
		"NEXTWEEK",

		"SPECIFICMONTH",
		"THISMONTH",
		"LASTMONTH",
		"NEXTMONTH",

		"THISQUARTER",
		"LASTQUARTER",
		"NEXTQUARTER",
		"QUARTER1",
		"QUARTER2",
		"QUARTER3",
		"QUARTER4",

		"THISYEAR",
		"LASTYEAR",
		"NEXTYEAR"
	];

	/**
	 * The DynamicDateUtil is a utility class for working with the DynamicDateOption instances.
	 *
	 * @namespace
	 * @alias sap.m.DynamicDateUtil
	 * @public
	 * @experimental Since 1.92. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var DynamicDateUtil = {
		_options: {
			"TODAY": new StandardDynamicDateOption({ key: "TODAY", valueTypes: [] }),
			"YESTERDAY": new StandardDynamicDateOption({ key: "YESTERDAY", valueTypes: [] }),
			"TOMORROW": new StandardDynamicDateOption({ key: "TOMORROW", valueTypes: [] }),
			"FIRSTDAYWEEK": new StandardDynamicDateOption({ key: "FIRSTDAYWEEK", valueTypes: [] }),
			"LASTDAYWEEK": new StandardDynamicDateOption({ key: "LASTDAYWEEK", valueTypes: [] }),
			"FIRSTDAYMONTH":new StandardDynamicDateOption({ key: "FIRSTDAYMONTH", valueTypes: [] }),
			"LASTDAYMONTH":new StandardDynamicDateOption({ key: "LASTDAYMONTH", valueTypes: [] }),
			"FIRSTDAYQUARTER":new StandardDynamicDateOption({ key: "FIRSTDAYQUARTER", valueTypes: [] }),
			"LASTDAYQUARTER":new StandardDynamicDateOption({ key: "LASTDAYQUARTER", valueTypes: [] }),
			"FIRSTDAYYEAR":new StandardDynamicDateOption({ key: "FIRSTDAYYEAR", valueTypes: [] }),
			"LASTDAYYEAR":new StandardDynamicDateOption({ key: "LASTDAYYEAR", valueTypes: [] }),
			"THISWEEK": new StandardDynamicDateOption({ key: "THISWEEK", valueTypes: [] }),
			"THISMONTH": new StandardDynamicDateOption({ key: "THISMONTH", valueTypes: [] }),
			"THISQUARTER": new StandardDynamicDateOption({ key: "THISQUARTER", valueTypes: [] }),
			"THISYEAR": new StandardDynamicDateOption({ key: "THISYEAR", valueTypes: [] }),
			"LASTWEEK": new StandardDynamicDateOption({ key: "LASTWEEK", valueTypes: [] }),
			"LASTMONTH": new StandardDynamicDateOption({ key: "LASTMONTH", valueTypes: [] }),
			"LASTQUARTER": new StandardDynamicDateOption({ key: "LASTQUARTER", valueTypes: [] }),
			"LASTYEAR": new StandardDynamicDateOption({ key: "LASTYEAR", valueTypes: [] }),
			"NEXTWEEK": new StandardDynamicDateOption({ key: "NEXTWEEK", valueTypes: [] }),
			"NEXTMONTH": new StandardDynamicDateOption({ key: "NEXTMONTH", valueTypes: [] }),
			"NEXTQUARTER": new StandardDynamicDateOption({ key: "NEXTQUARTER", valueTypes: [] }),
			"NEXTYEAR": new StandardDynamicDateOption({ key: "NEXTYEAR", valueTypes: [] }),
			"LASTDAYS": new StandardDynamicDateOption({ key: "LASTDAYS", valueTypes: ["int"] }),
			"LASTWEEKS": new StandardDynamicDateOption({ key: "LASTWEEKS", valueTypes: ["int"] }),
			"LASTMONTHS": new StandardDynamicDateOption({ key: "LASTMONTHS", valueTypes: ["int"] }),
			"LASTQUARTERS": new StandardDynamicDateOption({ key: "LASTQUARTERS", valueTypes: ["int"] }),
			"LASTYEARS": new StandardDynamicDateOption({ key: "LASTYEARS", valueTypes: ["int"] }),
			"NEXTDAYS": new StandardDynamicDateOption({ key: "NEXTDAYS", valueTypes: ["int"] }),
			"NEXTWEEKS": new StandardDynamicDateOption({ key: "NEXTWEEKS", valueTypes: ["int"] }),
			"NEXTMONTHS": new StandardDynamicDateOption({ key: "NEXTMONTHS", valueTypes: ["int"] }),
			"NEXTQUARTERS": new StandardDynamicDateOption({ key: "NEXTQUARTERS", valueTypes: ["int"] }),
			"NEXTYEARS": new StandardDynamicDateOption({ key: "NEXTYEARS", valueTypes: ["int"] }),
			"FROM": new StandardDynamicDateOption({ key: "FROM", valueTypes: ["date"] }),
			"TO": new StandardDynamicDateOption({ key: "TO", valueTypes: ["date"] }),
			"FROMDATETIME": new StandardDynamicDateOption({ key: "FROMDATETIME", valueTypes: ["datetime"] }),
			"TODATETIME": new StandardDynamicDateOption({ key: "TODATETIME", valueTypes: ["datetime"] }),
			"YEARTODATE": new StandardDynamicDateOption({ key: "YEARTODATE", valueTypes: [] }),
			"DATETOYEAR": new StandardDynamicDateOption({ key: "DATETOYEAR", valueTypes: [] }),
			"TODAYFROMTO": new StandardDynamicDateOption({ key: "TODAYFROMTO", valueTypes: ["int", "int"] }),
			"QUARTER1": new StandardDynamicDateOption({ key: "QUARTER1", valueTypes: [] }),
			"QUARTER2": new StandardDynamicDateOption({ key: "QUARTER2", valueTypes: [] }),
			"QUARTER3": new StandardDynamicDateOption({ key: "QUARTER3", valueTypes: [] }),
			"QUARTER4": new StandardDynamicDateOption({ key: "QUARTER4", valueTypes: [] }),
			"SPECIFICMONTH": new StandardDynamicDateOption({ key: "SPECIFICMONTH", valueTypes: ["int"] }),
			"SPECIFICMONTHINYEAR": new StandardDynamicDateOption({ key: "SPECIFICMONTHINYEAR", valueTypes: ["int", "int"] }),
			"DATERANGE": new StandardDynamicDateOption({ key: "DATERANGE", valueTypes: ["date", "date"] }),
			"DATE": new StandardDynamicDateOption({ key: "DATE", valueTypes: ["date"] }),
			"DATETIME": new StandardDynamicDateOption({ key: "DATETIME", valueTypes: ["datetime"] }),
			"DATETIMERANGE": new StandardDynamicDateOption({ key: "DATETIMERANGE", valueTypes: ["datetime", "datetime"] })
		},
		_allKeys: STANDARD_KEYS_ARRAY.slice(0)
	};

	/**
	 * Adds an option to be reused as a global object.
	 *
	 * @param {sap.m.DynamicDateOption} option The option to be added
	 * @static
	 * @public
	 */
	DynamicDateUtil.addOption = function(option) {
		if (!option || !option.getKey()) {
			return;
		}

		var sKey = option.getKey();

		DynamicDateUtil._options[sKey] = option;

		if (DynamicDateUtil._allKeys.indexOf(sKey) === -1) {
			DynamicDateUtil._allKeys.push(sKey);
		}
	};

	/**
	 * Gets all available standard and custom dynamic date option keys.
	 *
	 * @static
	 * @public
	 * @returns {string[]} An array of all option keys
	 */
	DynamicDateUtil.getAllOptionKeys = function() {
		return DynamicDateUtil._allKeys.slice(0);
	};

	/**
	 * Gets an option by its key.
	 *
	 * @param {string} sKey The option key
	 * @returns {sap.m.DynamicDateOption} The option
	 * @static
	 * @public
	 */
	DynamicDateUtil.getOption = function(sKey) {
		return DynamicDateUtil._options[sKey];
	};

	/**
	 * Gets sorted array of all standard keys.
	 *
	 * @returns {string[]} An array of standard option keys
	 * @static
	 * @public
	 */
	DynamicDateUtil.getStandardKeys = function () {
		return STANDARD_KEYS_ARRAY.slice(0);
	};

	/**
	 * Parses a string to an array of objects in the DynamicDateRange's value format.
	 * Uses the provided formatter.
	 *
	 * @param {string} sValue The string to be parsed
	 * @param {sap.m.DynamicDateFormat} oFormatter A dynamic date formatter
	 * @param {array} aOptionKeys array of option names
	 * @returns {object[]} An array of value objects in the DynamicDateRange's value format
	 * @static
	 * @public
	 */
	DynamicDateUtil.parse = function(sValue, oFormatter, aOptionKeys) {
		if (typeof sValue !== 'string') {
			Log.error("DynamicDateFormat can only parse a String.");
			return [];
		}

		var aResults = [],
			oResult,
			aStandardDynamicDateRangeKeysArray = DynamicDateUtil.getStandardKeys();

		aOptionKeys = aOptionKeys || Object.keys(DynamicDateUtil._options);

		var aOptions = aOptionKeys.sort(function(sKey1, sKey2) {
			return aStandardDynamicDateRangeKeysArray.indexOf(sKey1) - aStandardDynamicDateRangeKeysArray.indexOf(sKey2);
		}).map(function(sKey) {
			return DynamicDateUtil._options[sKey];
		});

		for (var i = 0; i < aOptions.length; i++) {
			oResult = aOptions[i] && aOptions[i].parse(sValue.trim(), oFormatter);

			if (oResult) {
				oResult.operator = aOptions[i].getKey();
				aResults.push(oResult);
			}
		}

		return aResults;
	};

	/**
	 * Calculates a date range from a provided object in the format of the DynamicDateRange's value.
	 *
	 * @param {string} oValue The provided value
	 * @returns {sap.ui.core.date.UniversalDate[]} An array of two date objects - start and end date
	 * @static
	 * @public
	 */
	DynamicDateUtil.toDates = function(oValue) {
		var sKey = oValue.operator;
		return DynamicDateUtil._options[sKey].toDates(oValue);
	};


	/**
	 * Returns a date in machine timezone setting, removing the offset added by the application configuration.
	 *
	 * @param {Object} oDate A local JS date with added offset
	 * @returns {Object} A local JS date with removed offset
	 * @static
	 * @public
	 */
	DynamicDateUtil.removeTimezoneOffset = function(oDate) {
		var oNewDate = new Date(oDate);
		var sTimezone = Core.getConfiguration().getTimezone();
		var iOffsetInSeconds = TimezoneUtil.calculateOffset(oNewDate, sTimezone) - oNewDate.getTimezoneOffset() * 60;

		oNewDate.setSeconds(oNewDate.getSeconds() - iOffsetInSeconds);

		return oNewDate;
	};

	return DynamicDateUtil;

}, true);
