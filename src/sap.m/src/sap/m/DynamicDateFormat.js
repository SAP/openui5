/*!
 * ${copyright}
 */

// Provides class sap.m.DynamicDateFormat
sap.ui.define([
	'sap/ui/core/format/DateFormat',
	'sap/ui/core/format/NumberFormat',
	'sap/ui/core/Locale',
	'sap/ui/core/LocaleData',
	"sap/base/util/deepExtend",
	"sap/ui/unified/calendar/CalendarUtils",
	"./library"
],
	function(DateFormat, NumberFormat, Locale, LocaleData, deepExtend, CalendarUtils, library) {
		"use strict";

		/**
		 * Constructor for DynamicDateFormat - must not be used: To get a DynamicDateFormat instance, please use <code>DynamicDateFormat.getInstance()</code>.
		 *
		 * @class
		 * The DynamicDateFormat is a static class for formatting and parsing an array of strings in a locale-sensitive manner according
		 * to a set of format options.
		 *
		 * @public
		 * @hideconstructor
		 * @alias sap.m.DynamicDateFormat
		 * @experimental Since 1.92. This class is experimental and provides only limited functionality. Also the API might be changed in future.
		 */
		var DynamicDateFormat = function() {
			// Do not use the constructor
			throw new Error();
		};

		var _resourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");
		var _staticParts = {};
		var _dynamicParameterIndexes = {};
		var aParameterTypesByStandardOptionKey = {
			"DATE": ["date"],
			"DATETIME": ["datetime"],
			"DATERANGE": ["date", "date"],
			"DATETIMERANGE": ["datetime", "datetime"],
			"LASTDAYS": ["int"],
			"LASTWEEKS": ["int"],
			"LASTMONTHS": ["int"],
			"LASTQUARTERS": ["int"],
			"LASTYEARS": ["int"],
			"NEXTDAYS": ["int"],
			"NEXTWEEKS": ["int"],
			"NEXTMONTHS": ["int"],
			"NEXTQUARTERS": ["int"],
			"NEXTYEARS": ["int"],
			"FROM": ["date"],
			"TO": ["date"],
			"FROMDATETIME": ["datetime"],
			"TODATETIME": ["datetime"],
			"SPECIFICMONTH": ["month"],
			"SPECIFICMONTHINYEAR": ["month", "int"],
			"TODAYFROMTO": ["int", "int"]
		};
		var aStandardDynamicDateRangeKeysArray = Object.keys(library.StandardDynamicDateRangeKeys);

		for (var i = 0; i < aStandardDynamicDateRangeKeysArray.length; i++) {
			var sKey = aStandardDynamicDateRangeKeysArray[i];
			var sPattern = _resourceBundle.getText("DYNAMIC_DATE_" + sKey.toUpperCase() + "_FORMAT");
			var aStaticParts = sPattern.split('{').map(function(sPart) {
				var iClosingBracket = sPart.indexOf('}');

				if (iClosingBracket !== -1) {
					return sPart.slice(iClosingBracket + 1);
				}

				return sPart;
			});

			_staticParts[sKey] = aStaticParts;

			// indexes of dynamic parts in order of appearance
			var aParams = [];

			var iParamStart = sPattern.indexOf('{');
			var iParamEnd = -1;
			var iParamIndex = -1;

			while (iParamStart !== -1) {
				iParamEnd = sPattern.indexOf('}');
				iParamIndex = parseInt(sPattern.slice(iParamStart + 1, iParamEnd - iParamEnd - 1));

				aParams.push(iParamIndex);

				sPattern = sPattern.slice(iParamEnd + 1);
				iParamStart = sPattern.indexOf('{');
			}

			_dynamicParameterIndexes[sKey] = aParams;
		}

		/**
		 * Get an instance of the DynamicDateFormat which can be used for formatting.
		 *
		 * @param {object} [oFormatOptions] Object which defines the format options
		 * @param {sap.ui.core.Locale} [oLocale] Locale to get the formatter for
		 * @return {sap.m.DynamicDateFormat} Instance of the DynamicDateFormat
		 * @public
		 *
		 */
		DynamicDateFormat.getInstance = function(oFormatOptions, oLocale) {
			return this.createInstance(oFormatOptions, oLocale);
		};

		DynamicDateFormat.oDefaultDynamicDateFormat = {
			"date": {},
			"datetime": {},
			"month": { pattern: "MMMM" },
			"year": { pattern: "yyyy" },
			"int": {}
		};

		/**
		 * Create an instance of the DynamicDateFormat.
		 *
		 * @param {object} [oFormatOptions] Object which defines the format options
		 * @param {sap.ui.core.Locale} [oLocale] Locale to get the formatter for
		 * @return {sap.m.DynamicDateFormat} Instance of the DynamicDateFormat
		 * @private
		 */
		DynamicDateFormat.createInstance = function(oFormatOptions, oLocale) {
			var oFormat = Object.create(this.prototype);

			if (oFormatOptions instanceof Locale) {
				oLocale = oFormatOptions;
				oFormatOptions = undefined;
			}

			if (!oLocale) {
				oLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale();
			}
			oFormat.oLocale = oLocale;
			oFormat.oLocaleData = LocaleData.getInstance(oLocale);
			oFormat.oOriginalFormatOptions = deepExtend({}, DynamicDateFormat.oDefaultDynamicDateFormat, oFormatOptions);
			oFormat._dateFormatter = DateFormat.getInstance(oFormat.oOriginalFormatOptions["date"]);
			oFormat._dateTimeFormatter = DateFormat.getDateTimeInstance(oFormat.oOriginalFormatOptions["datetime"]);
			// hack the date formatter not to parse relative
			// dates like: "next month", "next quarter", "previous week"
			[oFormat._dateFormatter].concat(oFormat._dateFormatter.aFallbackFormats).forEach(function(f) {
				f.parseRelative = function() {
					return null;
				};
			});

			[oFormat._dateTimeFormatter].concat(oFormat._dateTimeFormatter.aFallbackFormats).forEach(function(f) {
				f.parseRelative = function() {
					return null;
				};
			});

			oFormat._monthFormatter = DateFormat.getInstance(oFormat.oOriginalFormatOptions["month"]);
			oFormat._yearFormatter = DateFormat.getInstance(oFormat.oOriginalFormatOptions["year"]);
			oFormat._numberFormatter = NumberFormat.getInstance(oFormat.oOriginalFormatOptions["int"]);
			oFormat._resourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

			return oFormat;
		};

		/**
		 * Formats a list according to the given format options.
		 *
		 * @param {object} oObj The value to format
		 * @param {boolean} bSkipCustomFormatting If set to <code>true</code> the formatter does not format to the equivalent user-friendly string. Instead, the formatter uses the specified option key and parameters.
		 * @return {string} The formatted output value.
		 * @public
		 */
		DynamicDateFormat.prototype.format = function(oObj, bSkipCustomFormatting) {
			var sKey = oObj.operator,
				aParams = oObj.values.slice(0);

			if (sKey === "SPECIFICMONTH") {
				var oDate = new Date();
				oDate.setMonth(aParams[0]);
				aParams[0] = this._monthFormatter.format(oDate);
			} else if (sKey === "SPECIFICMONTHINYEAR") {
				var oDate = new Date();

				oDate.setMonth(aParams[0]);
				oDate.setYear(aParams[1]);

				aParams[0] = this._monthFormatter.format(oDate);
				aParams[1] = this._yearFormatter.format(oDate);
			} else if (sKey === "LASTDAYS" && aParams[0] === 1 && !bSkipCustomFormatting) {
				sKey = "YESTERDAY";
				aParams = [];
			} else if (sKey === "NEXTDAYS" && aParams[0] === 1 && !bSkipCustomFormatting) {
				sKey = "TOMORROW";
				aParams = [];
			} else if ((sKey === "LASTDAYS" || sKey === "NEXTDAYS") && aParams[0] === 0) {
				sKey = "TODAY";
				aParams = [];
			} else if (sKey === "DATETIME") {
				aParams[0] = this._dateTimeFormatter.format(oObj.values[0]);
			} else if (sKey === "TODAYFROMTO") {
				aParams[0] = -aParams[0];
				if (aParams[0] > aParams[1]) {
					// swap two values because first one is bigger than second one
					aParams = [aParams[1], aParams[0]];
				}
			}

			var aFormattedParams = aParams.map(function(param) {
				if (param instanceof Date) {
					if (sKey === "DATETIMERANGE" || sKey === "FROMDATETIME" || sKey === "TODATETIME") {
						return this._dateTimeFormatter.format(param);
					}
					return this._dateFormatter.format(param);
				}

				if (typeof (param) === "number") {
					return this._numberFormatter.format(param);
				} else {
					return param.toString();
				}
			}, this);

			if (sKey === 'TODAYFROMTO') {
				aFormattedParams.forEach(function(item, index, arr) {
					if (item === "0") {
						arr[index] = (index === 0 ? this.oLocaleData.getNumberSymbol("minusSign") : this.oLocaleData.getNumberSymbol("plusSign")) + item;
					} else {
						arr[index] = aParams[index] < 0 ? item.toString() : this.oLocaleData.getNumberSymbol("plusSign") + item;
					}
				}, this);
			}

			return this._resourceBundle.getText("DYNAMIC_DATE_" + sKey.toUpperCase() + "_FORMAT", aFormattedParams);
		};

		/**
		 * Parses a given list string into an array.
		 *
		 * @param {string} sValue String value to be parsed
		 * @param {string} sKey String value of the key we will parse for
		 * @return {object} The parsed output value
		 * @public
		 */
		DynamicDateFormat.prototype.parse = function(sValue, sKey) {
			var aResult,
				aStaticParts = _staticParts[sKey],
				sRegexPattern = "^" + aStaticParts.join("(.*)") + "$",
				rRegex = new RegExp(sRegexPattern, "i"),
				match = sValue.match(rRegex);

			if (match) {
				aResult = {};
				aResult.values = [];

				for (var j = 0; j < _dynamicParameterIndexes[sKey].length; j++) {
					var iIndex = _dynamicParameterIndexes[sKey][j];

					var sType = aParameterTypesByStandardOptionKey[sKey][iIndex];
					var oVal;
					var sCurrentMatch = match[j + 1];

					switch (sType) {
						case "date":
							oVal = this._dateFormatter.parse(sCurrentMatch);
							break;
						case "datetime":
							oVal = this._dateTimeFormatter.parse(sCurrentMatch);
							break;
						case "month":
							var aMonthNames = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function(i) {
								var oDate = new Date();
								oDate.setMonth(i);
								return this._monthFormatter.format(oDate);
							}, this);
							var iMatchIndex = aMonthNames.indexOf(sCurrentMatch);
							oVal = iMatchIndex !== -1 ? iMatchIndex : null;
							break;
						case "int":
							oVal = this._numberFormatter.parse(sCurrentMatch);
							break;
						case "string":
							oVal = sCurrentMatch;
							break;
						default:
							break;
					}

					if (oVal && (sType === "date" || sType === "datetime")) {
						// for date/datetime types, if year is outside the allowed range [1-9999], return null as invalid result
						try {
							CalendarUtils._checkYearInValidRange(oVal.getFullYear());
						} catch (e) {
							oVal = null;
						}
					}

					if (!oVal && oVal !== 0) {
						aResult = null;
						break;
					}

					aResult.values[iIndex] = oVal;
				}

				if (sKey === "TODAYFROMTO" && aResult) {
					if (aResult.values[0] > aResult.values[1]) {
						// swap two values because first one is bigger than second one
						aResult.values = [aResult.values[1], aResult.values[0]];
					}
					aResult.values[0] = -aResult.values[0];
				}

				if (aResult) {
					aResult.operator = sKey;
					return aResult;
				}
			}
		};

		/**
		 * Checks if a UTC flag is set to a specific formatter.
		 *
		 * @param {string} sOption The key of specific option
		 * @return {boolean} If the format for this option has UTC flag set to true
		 * @private
		 */
		DynamicDateFormat.prototype._checkFormatterUTCTimezone = function(sOption) {
			var sType = "";
			if (aParameterTypesByStandardOptionKey[sOption]) {
				sType = aParameterTypesByStandardOptionKey[sOption][0];
			}

			// ensure that in options like last/next days or +/- days we still use correct timezone when formatting the dates.
			if (sType === "" || sType[0] === "int") {
				sType = "date";
			}

			if (this.oOriginalFormatOptions[sType]) {
				return this.oOriginalFormatOptions[sType].UTC;
			}

			return false;
		};

		return DynamicDateFormat;
	});