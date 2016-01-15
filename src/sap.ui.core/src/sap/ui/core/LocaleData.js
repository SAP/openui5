/*!
 * ${copyright}
 */

//Provides the locale object sap.ui.core.LocaleData
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', './Configuration', './Locale'],
	function(jQuery, BaseObject, Configuration, Locale) {
	"use strict";

	/**
	 * Creates an instance of the Data.
	 *
	 * @class Data provides access to locale-specific data, like date formats, number formats, currencies, etc.
	 *
	 * @param {sap.ui.core.Locale} oLocale the locale
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @public
	 * @alias sap.ui.core.LocaleData
	 */
	var LocaleData = BaseObject.extend("sap.ui.core.LocaleData", /** @lends sap.ui.core.LocaleData.prototype */ {

		constructor : function(oLocale) {
			BaseObject.apply(this);
			this.mData = getData(oLocale);
		},

		_get : function() {
			return this._getDeep(this.mData, arguments);
		},

		_getDeep : function(oObject, aPropertyNames) {
			var oResult = oObject;
			for (var i = 0; i < aPropertyNames.length; i++) {
				oResult = oResult[aPropertyNames[i]];
				if (oResult === undefined) {
					break;
				}
			}
			return oResult;
		},

		_getCalendarData :  function(sKey, sCalendarType) {
			if (!sCalendarType) {
				sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
			}

			return this._get(getCLDRCalendarName(sCalendarType), sKey);
		},

		/**
		 * Get orientation (left-to-right or right-to-left)
		 *
		 * @returns {string} character orientation for this locale
		 * @public
		 */
		getOrientation : function() {
			return this._get("orientation");
		},

		/**
		 * Get locale specific language names
		 *
		 * @returns {object} map of locale specific language names
		 * @public
		 */
		getLanguages : function() {
			return this._get("languages");
		},

		/**
		 * Get locale specific script names
		 *
		 * @returns {object} map of locale specific script names
		 * @public
		 */
		getScripts : function() {
			return this._get("scripts");
		},

		/**
		 * Get locale specific territory names
		 *
		 * @returns {object} map of locale specific territory names
		 * @public
		 */
		getTerritories : function() {
			return this._get("territories");
		},

		/**
		 * Get month names in width "narrow", "abbreviated" or "wide"
		 *
		 * @param {string} sWidth the required width for the month names
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {array} array of month names (starting with January)
		 * @public
		 */
		getMonths : function(sWidth, sCalendarType) {
			jQuery.sap.assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			return this._getCalendarData("months-format-" + sWidth, sCalendarType);
		},

		/**
		 * Get stand alone month names in width "narrow", "abbreviated" or "wide"
		 *
		 * @param {string} sWidth the required width for the month names
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {array} array of month names (starting with January)
		 * @public
		 */
		getMonthsStandAlone : function(sWidth, sCalendarType) {
			jQuery.sap.assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			return this._getCalendarData("months-standAlone-" + sWidth, sCalendarType);
		},

		/**
		 * Get day names in width "narrow", "abbreviated" or "wide"
		 *
		 * @param {string} sWidth the required width for the day names
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {array} array of day names (starting with Sunday)
		 * @public
		 */
		getDays : function(sWidth, sCalendarType) {
			jQuery.sap.assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			return this._getCalendarData("days-format-" + sWidth, sCalendarType);
		},

		/**
		 * Get stand alone day names in width "narrow", "abbreviated" or "wide"
		 *
		 * @param {string} sWidth the required width for the day names
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {array} array of day names (starting with Sunday)
		 * @public
		 */
		getDaysStandAlone : function(sWidth, sCalendarType) {
			jQuery.sap.assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			return this._getCalendarData("days-standAlone-" + sWidth, sCalendarType);
		},

		/**
		 * Get quarter names in width "narrow", "abbreviated" or "wide"
		 *
		 * @param {string} sWidth the required width for the quarter names
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {array} array of quarters
		 * @public
		 */
		getQuarters : function(sWidth, sCalendarType) {
			jQuery.sap.assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			return this._getCalendarData("quarters-format-" + sWidth, sCalendarType);
		},

		/**
		 * Get stand alone quarter names in width "narrow", "abbreviated" or "wide"
		 *
		 * @param {string} sWidth the required width for the quarter names
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {array} array of quarters
		 * @public
		 */
		getQuartersStandAlone : function(sWidth, sCalendarType) {
			jQuery.sap.assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			return this._getCalendarData("quarters-standAlone-" + sWidth, sCalendarType);
		},

		/**
		 * Get day periods in width "narrow", "abbreviated" or "wide"
		 *
		 * @param {string} sWidth the required width for the day period names
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {array} array of day periods (AM, PM)
		 * @public
		 */
		getDayPeriods : function(sWidth, sCalendarType) {
			jQuery.sap.assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			return this._getCalendarData("dayPeriods-format-" + sWidth, sCalendarType);
		},

		/**
		 * Get date pattern in style "short", "medium", "long" or "full"
		 *
		 * @param {string} sStyle the required style for the date pattern
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {string} the selected date pattern
		 * @public
		 */
		getDatePattern : function(sStyle, sCalendarType) {
			jQuery.sap.assert(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			return this._getCalendarData("dateFormat-" + sStyle, sCalendarType);
		},

		/**
		 * Get time pattern in style "short", "medium", "long" or "full"
		 *
		 * @param {string} sStyle the required style for the date pattern
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {string} the selected time pattern
		 * @public
		 */
		getTimePattern : function(sStyle, sCalendarType) {
			jQuery.sap.assert(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			return this._getCalendarData("timeFormat-" + sStyle, sCalendarType);
		},

		/**
		 * Get datetime pattern in style "short", "medium", "long" or "full"
		 *
		 * @param {string} sStyle the required style for the datetime pattern
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {string} the selected datetime pattern
		 * @public
		 */
		getDateTimePattern : function(sStyle, sCalendarType) {
			jQuery.sap.assert(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			return this._getCalendarData("dateTimeFormat-" + sStyle, sCalendarType);
		},

		/**
		 * Get number symbol "decimal", "group", "plusSign", "minusSign", "percentSign"
		 *
		 * @param {string} sType the required type of symbol
		 * @returns {string} the selected number symbol
		 * @public
		 */
		getNumberSymbol : function(sType) {
			jQuery.sap.assert(sType == "decimal" || sType == "group" || sType == "plusSign" || sType == "minusSign" || sType == "percentSign", "sType must be decimal, group, plusSign, minusSign or percentSign");
			return this._get("symbols-latn-" + sType);
		},

		/**
		 * Get decimal format pattern
		 *
		 * @returns {string} The pattern
		 * @public
		 */
		getDecimalPattern : function() {
			return this._get("decimalFormat").standard;
		},

		/**
		 * Get currency format pattern
		 *
		 * @param {string} sContext the context of the currency pattern (standard or accounting)
		 * @returns {string} The pattern
		 * @public
		 */
		getCurrencyPattern : function(sContext) {
			return this._get("currencyFormat")[sContext] || this._get("currencyFormat").standard;
		},

		/**
		 * Get percent format pattern
		 *
		 * @returns {string} The pattern
		 * @public
		 */
		getPercentPattern : function() {
			return this._get("percentFormat").standard;
		},

		/**
		 * Returns the day that usually is regarded as the first day
		 * of a week in the current locale. Days are encoded as integer
		 * where sunday=0, monday=1 etc.
		 *
		 *
		 * All week data information in the CLDR is provides for territories (countries).
		 * If the locale of this LocaleData doesn't contain country information (e.g. if it
		 * contains only a language), then the "likelySubtag" information of the CLDR
		 * is taken into account to guess the "most likely" territory for the locale.
		 *
		 * @returns {int} first day of week
		 * @public
		 */
		getFirstDayOfWeek : function() {
			return this._get("weekData-firstDay");
		},

		/**
		 * Returns the first day of a weekend for the given locale.
		 *
		 * Days are encoded in the same way as for {@link #getFirstDayOfWeek}.
		 *
		 * All week data information in the CLDR is provides for territories (countries).
		 * If the locale of this LocaleData doesn't contain country information (e.g. if it
		 * contains only a language), then the "likelySubtag" information of the CLDR
		 * is taken into account to guess the "most likely" territory for the locale.
		 *
		 * @returns {int} first day of weekend
		 * @public
		 */
		getWeekendStart : function() {
			return this._get("weekData-weekendStart");
		},

		/**
		 * Returns the last day of a weekend for the given locale.
		 *
		 * Days are encoded in the same way as for {@link #getFirstDayOfWeek}.
		 *
		 * All week data information in the CLDR is provides for territories (countries).
		 * If the locale of this LocaleData doesn't contain country information (e.g. if it
		 * contains only a language), then the "likelySubtag" information of the CLDR
		 * is taken into account to guess the "most likely" territory for the locale.
		 *
		 * @returns {int} last day of weekend
		 * @public
		 */
		getWeekendEnd : function() {
			return this._get("weekData-weekendEnd");
		},

		/**
		 * Returns the interval format with the given Id (see CLDR documentation for valid Ids)
		 * or the fallback format if no interval format with that Id is known.
		 *
		 * The empty Id ("") might be used to retrieve the interval format fallback.
		 *
		 * @param {string} sId Id of the interval format, e.g. "d-d"
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {string} interval format string with placeholders {0} and {1}
		 * @public
		 * @since 1.17.0
		 */
		getIntervalPattern : function(sId, sCalendarType) {
			return (sId && this._getCalendarData("intervalFormat-" + sId, sCalendarType)) || this._getCalendarData("intervalFormatFallback", sCalendarType);
		},

		/**
		 * Returns the number of digits of the specified currency
		 *
		 * @param {string} sCurrency ISO 4217 currency code
		 * @returns {int} digits of the currency
		 * @public
		 * @since 1.21.1
		 */
		getCurrencyDigits : function(sCurrency) {
			var oCurrencyDigits = this._get("currencyDigits");
			var iDigits = 2;
			if (oCurrencyDigits) {
				if (oCurrencyDigits[sCurrency] != undefined) {
					iDigits = oCurrencyDigits[sCurrency];
				} else {
					iDigits = oCurrencyDigits["DEFAULT"];
				}
			}
			// Temporary workaround for HUF digit mismatch between CLDR data and backend systems
			// TODO: Remove when customizing of currency digits is possible in format settings
			if (sCurrency === "HUF") {
				iDigits = 0;
			}
			return iDigits;
		},

		/**
		 * Returns the currency symbol for the specified currency, if no symbol is found the ISO 4217 currency code is returned
		 *
		 * @param {string} sCurrency ISO 4217 currency code
		 * @returns {string} the currency symbol
		 * @public
		 * @since 1.21.1
		 */
		getCurrencySymbol : function(sCurrency) {
			var oCurrencySymbols = this._get("currencySymbols");
			return (oCurrencySymbols && oCurrencySymbols[sCurrency]) || sCurrency;
		},

		/**
		 * Returns the currency code which is corresponded with the given currency symbol.
		 *
		 * @param {string} sCurrencySymbol The currency symbol which needs to be converted to currency code
		 * @return {string} The corresponded currency code defined for the given currency symbol. The given currency symbol is returned if no currency code can be found by using the given currency symbol.
		 * @public
		 * @since 1.27.0
		 */
		getCurrencyCodeBySymbol : function(sCurrencySymbol) {
			var oCurrencySymbols = this._get("currencySymbols"), sCurrencyCode;
			for (sCurrencyCode in oCurrencySymbols) {
				if (oCurrencySymbols[sCurrencyCode] === sCurrencySymbol) {
					return sCurrencyCode;
				}
			}
			return sCurrencySymbol;
		},

		/**
		 * Returns relative time patterns for the given scales as an array of objects containing scale, value and pattern.
		 *
		 * The array may contain the following values: "year", "month", "week", "day", "hour", "minute" and "second". If
		 * no scales are given, patterns for all available scales will be returned.
		 *
		 * The return array will contain objects looking like:
		 * {
		 *     scale: "minute",
		 *     sign: 1,
		 *     pattern: "in {0} minutes"
		 * }
		 *
		 * @param {string[]} aScales The scales for which the available patterns should be returned
		 * @param {string} [sStyle="wide"] @since 1.32.10, 1.34.4 The style of the scale patterns. The valid values are "wide", "short" and "narrow".
		 * @returns {object[]} An array of all relative time patterns
		 */
		getRelativePatterns : function(aScales, sStyle) {
			if (sStyle === undefined) {
				sStyle = "wide";
			}

			jQuery.sap.assert(sStyle === "wide" || sStyle === "short" || sStyle === "narrow", "sStyle is only allowed to be set with 'wide', 'short' or 'narrow'");

			var aPatterns = [],
				oScale,
				oTimeEntry,
				iValue,
				iSign;

			if (!aScales) {
				aScales = ["year", "month", "week", "day", "hour", "minute", "second"];
			}

			aScales.forEach(function(sScale) {
				oScale = this._get("dateFields", sScale + "-" + sStyle);
				for (var sEntry in oScale) {
					if (sEntry.indexOf("relative-type-") === 0) {
						iValue = parseInt(sEntry.substr(14), 10);
						aPatterns.push({
							scale: sScale,
							value: iValue,
							pattern: oScale[sEntry]
						});
					} else if (sEntry.indexOf("relativeTime-type-") == 0) {
						oTimeEntry = oScale[sEntry];
						iSign = sEntry.substr(18) === "past" ? -1 : 1;
						if (oTimeEntry["relativeTimePattern-count-one"]) {
							aPatterns.push({
								scale: sScale,
								sign: iSign,
								pattern: oTimeEntry["relativeTimePattern-count-one"]
							});
						}
						aPatterns.push({
							scale: sScale,
							sign: iSign,
							pattern: oTimeEntry["relativeTimePattern-count-other"]
						});
					}
				}
			}.bind(this));

			return aPatterns;
		},

		/**
		 * Returns the relative format pattern with given scale (year, month, week, ...) and difference value
		 *
		 * @param {string} sScale the scale the relative pattern is needed for
		 * @param {int} iDiff the difference in the given scale unit
		 * @param {boolean} [bFuture] whether a future or past pattern should be used
		 * @param {string} [sStyle="wide"] @since 1.32.10, 1.34.4 the style of the pattern. The valid values are "wide", "short" and "narrow"
		 * @returns {string} the relative format pattern
		 */
		getRelativePattern : function(sScale, iDiff, bFuture, sStyle) {
			var sPattern, oTypes, sKey;

			if (typeof bFuture === "string") {
				sStyle = bFuture;
				bFuture = undefined;
			}

			if (bFuture === undefined) {
				bFuture = iDiff > 0;
			}

			if (sStyle === undefined) {
				sStyle = "wide";
			}

			jQuery.sap.assert(sStyle === "wide" || sStyle === "short" || sStyle === "narrow", "sStyle is only allowed to be set with 'wide', 'short' or 'narrow'");

			sKey = sScale + "-" + sStyle;

			sPattern = this._get("dateFields", sKey, "relative-type-" + iDiff);

			if (!sPattern) {
				oTypes = this._get("dateFields", sKey, "relativeTime-type-" + (bFuture ? "future" : "past"));

				if (Math.abs(iDiff) === 1) {
					sPattern = oTypes["relativeTimePattern-count-one"];
				}

				if (!sPattern) {
					sPattern = oTypes["relativeTimePattern-count-other"];
				}
			}

			return sPattern;
		},

		/**
		 * Returns the relative resource pattern with unit 'second' (like now, "in {0} seconds", "{0} seconds ago" under locale 'en') based on the given
		 * difference value (0 means now, positive value means in the future and negative value means in the past).
		 *
		 * @param {int} iDiff the difference in seconds
		 * @param {string} [sStyle="wide"] @since 1.32.10, 1.34.4 the style of the pattern. The valid values are "wide", "short" and "narrow"
		 * @returns {string} the relative resource pattern in unit 'second'
		 * @public
		 * @since 1.31.0
		 */
		getRelativeSecond : function(iDiff, sStyle) {
			return this.getRelativePattern("second", iDiff, sStyle);
		},

		/**
		 * Returns the relative resource pattern with unit 'minute' (like "in {0} minute(s)", "{0} minute(s) ago" under locale 'en') based on the given
		 * difference value (positive value means in the future and negative value means in the past).
		 *
		 * There's no pattern defined for 0 difference and the function returns null if 0 is given. In the 0 difference case, you can use the getRelativeSecond
		 * function to format the difference using unit 'second'.
		 *
		 * @param {int} iDiff the difference in minutes
		 * @param {string} [sStyle="wide"] @since 1.32.10, 1.34.4 the style of the pattern. The valid values are "wide", "short" and "narrow"
		 * @returns {string|null} the relative resource pattern in unit 'minute'. The method returns null if 0 is given as parameter.
		 * @public
		 * @since 1.31.0
		 */
		getRelativeMinute : function(iDiff, sStyle) {
			if (iDiff == 0) {
				return null;
			}
			return this.getRelativePattern("minute", iDiff, sStyle);
		},

		/**
		 * Returns the relative resource pattern with unit 'hour' (like "in {0} hour(s)", "{0} hour(s) ago" under locale 'en') based on the given
		 * difference value (positive value means in the future and negative value means in the past).
		 *
		 * There's no pattern defined for 0 difference and the function returns null if 0 is given. In the 0 difference case, you can use the getRelativeMinute or getRelativeSecond
		 * function to format the difference using unit 'minute' or 'second'.
		 *
		 * @param {int} iDiff the difference in hours
		 * @param {string} [sStyle="wide"] @since 1.32.10, 1.34.4 the style of the pattern. The valid values are "wide", "short" and "narrow"
		 * @returns {string|null} the relative resource pattern in unit 'minute'. The method returns null if 0 is given as parameter.
		 * @public
		 * @since 1.31.0
		 */
		getRelativeHour : function(iDiff, sStyle) {
			if (iDiff == 0) {
				return null;
			}
			return this.getRelativePattern("hour", iDiff, sStyle);
		},

		/**
		 * Returns the relative day resource pattern (like "Today", "Yesterday", "{0} days ago") based on the given
		 * difference of days (0 means today, 1 means tommorrow, -1 means yesterday, ...).
		 *
		 * @param {int} iDiff the difference in days
		 * @param {string} [sStyle="wide"] @since 1.32.10, 1.34.4 the style of the pattern. The valid values are "wide", "short" and "narrow"
		 * @returns {string} the relative day resource pattern
		 * @public
		 * @since 1.25.0
		 */
		getRelativeDay : function(iDiff, sStyle) {
			return this.getRelativePattern("day", iDiff, sStyle);
		},

		/**
		 * Returns the relative week resource pattern (like "This week", "Last week", "{0} weeks ago") based on the given
		 * difference of weeks (0 means this week, 1 means next week, -1 means last week, ...).
		 *
		 * @param {int} iDiff the difference in weeks
		 * @param {string} [sStyle="wide"] @since 1.32.10, 1.34.4 the style of the pattern. The valid values are "wide", "short" and "narrow"
		 * @returns {string} the relative week resource pattern
		 * @public
		 * @since 1.31.0
		 */
		getRelativeWeek : function(iDiff, sStyle) {
			return this.getRelativePattern("week", iDiff, sStyle);
		},

		/**
		 * Returns the relative month resource pattern (like "This month", "Last month", "{0} months ago") based on the given
		 * difference of months (0 means this month, 1 means next month, -1 means last month, ...).
		 *
		 * @param {int} iDiff the difference in months
		 * @param {string} [sStyle="wide"] @since 1.32.10, 1.34.4 the style of the pattern. The valid values are "wide", "short" and "narrow"
		 * @returns {string} the relative month resource pattern
		 * @public
		 * @since 1.25.0
		 */
		getRelativeMonth : function(iDiff, sStyle) {
			return this.getRelativePattern("month", iDiff, sStyle);
		},

		/**
		 * Returns the relative year resource pattern (like "This year", "Last year", "{0} year ago") based on the given
		 * difference of years (0 means this year, 1 means next year, -1 means last year, ...).
		 *
		 * @param {int} iDiff the difference in years
		 * @param {string} [sStyle="wide"] @since 1.32.10, 1.34.4 the style of the pattern. The valid values are "wide", "short" and "narrow"
		 * @returns {string} the relative year resource pattern
		 * @public
		 * @since 1.25.0
		 */
		getRelativeYear : function(iDiff, sStyle) {
			return this.getRelativePattern("year", iDiff, sStyle);
		},

		/**
		 * Returns the short decimal formats (like 1K, 1M....)
		 *
		 * @param {string} sStyle short or long
		 * @param {string} sNumber 1000, 10000 ...
		 * @param {string} sPlural one or other (if not exists other is used)
		 * @returns {string} decimal format
		 * @public
		 * @since 1.25.0
		 */
		getDecimalFormat : function(sStyle, sNumber, sPlural) {

			var sFormat;
			var oFormats;

			switch (sStyle) {
			case "long":
				oFormats = this._get("decimalFormat-long");
				break;

			default: //short
				oFormats = this._get("decimalFormat-short");
				break;
			}

			if (oFormats) {
				var sName = sNumber + "-" + sPlural;
				sFormat = oFormats[sName];
				if (!sFormat) {
					sName = sNumber + "-other";
					sFormat = oFormats[sName];
				}
			}

			return sFormat;

		},

		/**
		 * Returns the era name.
		 *
		 * @param {string} sStyle the style of the era name. It can be 'wide', 'abbreviated' or 'narrow'
		 * @param {int} [iIndex] the index of the era name in era name set. If this isn't set, the last element in era name set is returned
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @return {string} the era name
		 * @public
		 * @since 1.28.6
		 */
		getEra : function(sStyle, iIndex, sCalendarType) {
			jQuery.sap.assert(sStyle == "wide" || sStyle == "abbreviated" || sStyle == "narrow" , "sStyle must be wide, abbreviate or narrow");

			if (typeof iIndex === "string") {
				sCalendarType = iIndex;
				iIndex = undefined;
			}

			var oEras = this._getCalendarData("era-" + sStyle, sCalendarType),
				sName, iMax = 0, iName;
			if (iIndex !== undefined && iIndex !== null) {
				return oEras["" + iIndex];
			} else {
				for (sName in oEras) {
					iName = parseInt(sName, 10);
					if (iName > iMax) {
						iMax = iName;
					}
				}
				return oEras["" + iMax];
			}
		},

		/**
		 * Returns the defined pattern for representing the calendar week number.
		 *
		 * @param {string} sStyle the style of the pattern. It can only be either "wide" or "narrow".
		 * @param {number} iWeekNumber the week number
		 * @return {string} the week number string
		 *
		 * @public
		 * @since 1.32.0
		 */
		getCalendarWeek : function(sStyle, iWeekNumber) {
			jQuery.sap.assert(sStyle == "wide" || sStyle == "narrow" , "sStyle must be wide or narrow");

			var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core"),
				sKey = "date.week.calendarweek." + sStyle;

			return oMessageBundle.getText(sKey, iWeekNumber);
		},

		/**
		 * Returns the preferred calendar type for the current locale which exists in {@link sap.ui.core.CalendarType}
		 *
		 * returns {sap.ui.core.CalendarType} the preferred calendar type
		 * @public
		 * @since 1.28.6
		 */
		getPreferredCalendarType: function() {
			var sCalendarPreference = this._get("calendarPreference"),
				aCalendars = sCalendarPreference ? sCalendarPreference.split(" ") : [],
				sCalendarName, sType, i;

			for ( i = 0 ; i < aCalendars.length ; i++ ) {
				sCalendarName = aCalendars[i];
				for (sType in sap.ui.core.CalendarType) {
					if (sCalendarName === getCLDRCalendarName(sType).substring(3).toLowerCase()) {
						return sType;
					}
				}
			}

			return sap.ui.core.CalendarType.Gregorian;
		}
	});

	/**
	 * Default data, in case neither the region specific, nor the language specific fallback can be found
	 *
	 * @private
	 */
	var M_DEFAULT_DATA = {
			"orientation":"left-to-right",
			"languages":{},
			"scripts":{},
			"territories":{},
			"ca-gregorian": {
				"dateFormat-full":"EEEE, MMMM d, y",
				"dateFormat-long":"MMMM d, y",
				"dateFormat-medium":"MMM d, y",
				"dateFormat-short":"M/d/yy",
				"timeFormat-full":"h:mm:ss a zzzz",
				"timeFormat-long":"h:mm:ss a z",
				"timeFormat-medium":"h:mm:ss a",
				"timeFormat-short":"h:mm a",
				"dateTimeFormat-full":"{1} 'at' {0}",
				"dateTimeFormat-long":"{1} 'at' {0}",
				"dateTimeFormat-medium":"{1}, {0}",
				"dateTimeFormat-short":"{1}, {0}",
				"intervalFormatFallback":"{0} – {1}",
				"months-format-abbreviated":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
				"months-format-wide":["January","February","March","April","May","June","July","August","September","October","November","December"],
				"months-format-narrow":["1","2","3","4","5","6","7","8","9","10","11","12"],
				"months-standAlone-abbreviated":["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
				"months-standAlone-wide":["January","February","March","April","May","June","July","August","September","October","November","December"],
				"months-standAlone-narrow":["1","2","3","4","5","6","7","8","9","10","11","12"],
				"days-format-abbreviated":["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
				"days-format-wide":["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
				"days-format-narrow":["S","M","T","W","T","F","S"],
				"days-standAlone-abbreviated":["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
				"days-standAlone-wide":["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
				"days-standAlone-narrow":["S","M","T","W","T","F","S"],
				"quarters-format-narrow":["1","2","3","4"],
				"quarters-format-abbreviated":["Q1","Q2","Q3","Q4"],
				"quarters-format-wide":["1st quarter","2nd quarter","3rd quarter","4th quarter"],
				"quarters-standAlone-narrow":["1","2","3","4"],
				"quarters-standAlone-abbreviated":["Q1","Q2","Q3","Q4"],
				"quarters-standAlone-wide":["1st quarter","2nd quarter","3rd quarter","4th quarter"],
				"dayPeriods-format-narrow":["AM","PM"],
				"dayPeriods-format-wide":["AM","PM"],
				"dayPeriods-format-abbreviated":["AM","PM"],
				"era-wide":"Anno Domini",
				"era-abbreviated":"AD",
				"era-narrow":"A"
			},
			"dateFields": {
				"era": {
					"displayName": "Era"
				},
				"year-wide": {
					"displayName": "Year",
					"relative-type--1": "last year",
					"relative-type-0": "this year",
					"relative-type-1": "next year",
					"relativeTime-type-future": {
						"relativeTimePattern-count-one": "in {0} year",
						"relativeTimePattern-count-other": "in {0} years"
					},
					"relativeTime-type-past": {
						"relativeTimePattern-count-one": "{0} year ago",
						"relativeTimePattern-count-other": "{0} years ago"
					}
				},
				"quarter-wide": {
					"displayName": "Quarter",
					"relative-type--1": "last quarter",
					"relative-type-0": "this quarter",
					"relative-type-1": "next quarter",
					"relativeTime-type-future": {
						"relativeTimePattern-count-one": "in {0} quarter",
						"relativeTimePattern-count-other": "in {0} quarters"
					},
					"relativeTime-type-past": {
						"relativeTimePattern-count-one": "{0} quarter ago",
						"relativeTimePattern-count-other": "{0} quarters ago"
					}
				},
				"month-wide": {
					"displayName": "Month",
					"relative-type--1": "last month",
					"relative-type-0": "this month",
					"relative-type-1": "next month",
					"relativeTime-type-future": {
						"relativeTimePattern-count-one": "in {0} month",
						"relativeTimePattern-count-other": "in {0} months"
					},
					"relativeTime-type-past": {
						"relativeTimePattern-count-one": "{0} month ago",
						"relativeTimePattern-count-other": "{0} months ago"
					}
				},
				"week-wide": {
					"displayName": "Week",
					"relative-type--1": "last week",
					"relative-type-0": "this week",
					"relative-type-1": "next week",
					"relativeTime-type-future": {
						"relativeTimePattern-count-one": "in {0} week",
						"relativeTimePattern-count-other": "in {0} weeks"
					},
					"relativeTime-type-past": {
						"relativeTimePattern-count-one": "{0} week ago",
						"relativeTimePattern-count-other": "{0} weeks ago"
					}
				},
				"day-wide": {
					"displayName": "Day",
					"relative-type--1": "yesterday",
					"relative-type-0": "today",
					"relative-type-1": "tomorrow",
					"relativeTime-type-future": {
						"relativeTimePattern-count-one": "in {0} day",
						"relativeTimePattern-count-other": "in {0} days"
					},
					"relativeTime-type-past": {
						"relativeTimePattern-count-one": "{0} day ago",
						"relativeTimePattern-count-other": "{0} days ago"
					}
				},
				"weekday": {
					"displayName": "Day of the Week"
				},
				"hour-wide": {
					"displayName": "Hour",
					"relativeTime-type-future": {
						"relativeTimePattern-count-one": "in {0} hour",
						"relativeTimePattern-count-other": "in {0} hours"
					},
					"relativeTime-type-past": {
						"relativeTimePattern-count-one": "{0} hour ago",
						"relativeTimePattern-count-other": "{0} hours ago"
					}
				},
				"minute-wide": {
					"displayName": "Minute",
					"relativeTime-type-future": {
						"relativeTimePattern-count-one": "in {0} minute",
						"relativeTimePattern-count-other": "in {0} minutes"
					},
					"relativeTime-type-past": {
						"relativeTimePattern-count-one": "{0} minute ago",
						"relativeTimePattern-count-other": "{0} minutes ago"
					}
				},
				"second-wide": {
					"displayName": "Second",
					"relative-type-0": "now",
					"relativeTime-type-future": {
						"relativeTimePattern-count-one": "in {0} second",
						"relativeTimePattern-count-other": "in {0} seconds"
					},
					"relativeTime-type-past": {
						"relativeTimePattern-count-one": "{0} second ago",
						"relativeTimePattern-count-other": "{0} seconds ago"
					}
				},
				"zone": {
					"displayName": "Time Zone"
				}
			},
			"decimalFormat": { "standard": "#,##0.###" },
			"currencyFormat": { "standard": "¤#,##0.00"},
			"percentFormat": { "standard": "#,##0%"},
			"symbols-latn-decimal":".",
			"symbols-latn-group":",",
			"symbols-latn-plusSign":"+",
			"symbols-latn-minusSign":"-",
			"symbols-latn-percentSign":"%",
			"weekData-minDays":4,
			"weekData-firstDay":1,
			"weekData-weekendStart":6,
			"weekData-weekendEnd":0
	};

	var M_ISO639_OLD_TO_NEW = {
			"iw" : "he",
			"ji" : "yi",
			"in" : "id",
			"sh" : "sr"
	};

	/**
	 * A set of locales for which the UI5 runtime contains a CLDR JSON file.
	 *
	 * Helps to avoid unsatisfiable backend calls.
	 *
	 * @private
	 */
	var M_SUPPORTED_LOCALES = (function() {
		var LOCALES = Locale._cldrLocales,
			result = {},
			i;

		if ( LOCALES ) {
			for (i = 0; i < LOCALES.length; i++) {
				result[LOCALES[i]] = true;
			}
		}

		return result;
	}());

	/**
	 * Locale data cache
	 *
	 * @private
	 */
	var mLocaleDatas = {};

	/**
	 * Returns the corresponding calendar name in CLDR of the given calendar type, or the calendar type
	 * from the configuration, in case sCalendarType is undefined.
	 *
	 * @param {sap.ui.core.CalendarType} sCalendarType the type defined in {@link sap.ui.core.CalendarType}.
	 * @private
	 */
	function getCLDRCalendarName(sCalendarType) {
		if (!sCalendarType) {
			sCalendarType = sap.ui.getCore().getConfiguration().getCalendarType();
		}
		return "ca-" + sCalendarType.toLowerCase();
	}

	/**
	 * Load LocaleData data from the CLDR generated files
	 */
	function getData(oLocale) {

		var sLanguage = oLocale.getLanguage() || "",
			sScript = oLocale.getScript() || "",
			sRegion = oLocale.getRegion() || "",
			mData;

		/*
		 * Merge a CLDR delta file and a CLDR fallback file.
		 *
		 * Note: the contract of this method reg. null values differs from both,
		 * jQuery.extend as well as jQuery.sap.extend.
		 */
		function merge(obj, fallbackObj) {
			var name, value, fallbackValue;

			if ( !fallbackObj ) {
				return;
			}

			for ( name in fallbackObj ) {

				if ( fallbackObj.hasOwnProperty(name) ) {

					value = obj[ name ];
					fallbackValue = fallbackObj[ name ];

					if ( value === undefined ) {
						// 'undefined': value doesn't exist in delta, so take it from the fallback object
						// Note: undefined is not a valid value in JSON, so we can't misunderstand an existing undefined
						obj[name] = fallbackValue;
					} else if ( value === null ) {
						// 'null' is used by the delta tooling as a marker that a value must not be taken form the fallback
						delete obj[name];
					} else if ( typeof value === 'object' && typeof fallbackValue === 'object' ) {
						// both values are objects, merge them recursively
						merge(value, fallbackValue);
					}

				}

			}

		}

		function getOrLoad(sId) {
			if ( !mLocaleDatas[sId] && (!M_SUPPORTED_LOCALES || M_SUPPORTED_LOCALES[sId] === true) ) {
				var data = mLocaleDatas[sId] = jQuery.sap.loadResource("sap/ui/core/cldr/" + sId + ".json", {
					dataType: "json",
					failOnError : false
				});

				// check if the data is a minified delta file.
				// If so, load the corresponding fallback data as well, merge it and remove the fallback marker
				if ( data && data.__fallbackLocale ) {
					merge(data, getOrLoad(data.__fallbackLocale));
					delete data.__fallbackLocale;
				}

				// if load fails, null is returned
				// -> caller will process the fallback chain, in the end a result is identified and stored in mDatas under the originally requested ID
			}
			return mLocaleDatas[sId];
		}

		// normalize language and handle special cases
		sLanguage = (sLanguage && M_ISO639_OLD_TO_NEW[sLanguage]) || sLanguage;
		// Special case 1: in a SAP context, the inclusive language code "no" always means Norwegian Bokmal ("nb")
		if ( sLanguage === "no" ) {
			sLanguage = "nb";
		}
		// Special case 2: for Chinese, derive a default region from the script (this behavior is inherited from Java)
		if ( sLanguage === "zh" && !sRegion ) {
			if ( sScript === "Hans" ) {
				sRegion = "CN";
			} else if ( sScript === "Hant" ) {
				sRegion = "TW";
			}
		}

		var sId = sLanguage + "_" + sRegion; // the originally requested locale; this is the key under which the result (even a fallback one) will be stored in the end
		// first try: load CLDR data for specific language / region combination
		if ( sLanguage && sRegion ) {
			mData = getOrLoad(sId);
		}
		// second try: load data for language only
		if ( !mData && sLanguage ) {
			mData = getOrLoad(sLanguage);
		}
		// last try: use fallback data
		mLocaleDatas[sId] = mData || M_DEFAULT_DATA;

		return mLocaleDatas[sId];
	}


	/**
	 * A specialized subclass of LocaleData that merges custom settings.
	 * @private
	 */
	LocaleData.extend("sap.ui.core.CustomLocaleData", {
		constructor : function(oLocale) {
			LocaleData.apply(this, arguments);
			this.mCustomData = sap.ui.getCore().getConfiguration().getFormatSettings().getCustomLocaleData();
		},
		_get : function(sId) {
			var aArguments = Array.prototype.slice.call(arguments),
				sCalendar, sKey;
			// Calendar data needs special handling, as CustomLocaleData does have one version of calendar data only
			if (aArguments[0].indexOf("ca-") == 0) {
				sCalendar = aArguments[0];
				if (sCalendar == getCLDRCalendarName()) {
					aArguments = aArguments.slice(1);
				}
			}
			sKey = aArguments.join("-");
			return this.mCustomData[sKey] || this._getDeep(this.mData, arguments);
		}
	});

	/**
	 *
	 */
	LocaleData.getInstance = function(oLocale) {
		return oLocale.hasPrivateUseSubtag("sapufmt") ? new sap.ui.core.CustomLocaleData(oLocale) : new LocaleData(oLocale);
	};

	return LocaleData;

});
