/*!
 * ${copyright}
 */

//Provides the locale object sap.ui.core.LocaleData
sap.ui.define(['sap/base/util/extend', 'sap/ui/base/Object', './CalendarType', './Locale', 'sap/base/assert', 'sap/base/util/LoaderExtensions'],
	function(extend, BaseObject, CalendarType, Locale, assert, LoaderExtensions) {
	"use strict";

	/**
	 * Creates an instance of LocaleData for the given locale.
	 *
	 * @class Provides access to locale-specific data, such as, date formats, number formats, and currencies.
	 *
	 * @param {sap.ui.core.Locale} oLocale the locale
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @public
	 * @alias sap.ui.core.LocaleData
	 */
	var LocaleData = BaseObject.extend("sap.ui.core.LocaleData", /** @lends sap.ui.core.LocaleData.prototype */ {

		constructor: function(oLocale) {
			this.oLocale = oLocale;
			BaseObject.apply(this);
			this.mData = getData(oLocale);
		},

		/**
		 * @private
		 * @ui5-restricted UI5 Web Components
		 */
		_get: function() {
			return this._getDeep(this.mData, arguments);
		},

		/**
		 * Retrieves merged object if overlay data is available
		 * @private
		 * @return {object} merged object
		 */
		_getMerged: function() {
			return this._get.apply(this, arguments);
		},

		_getDeep: function(oObject, aPropertyNames) {
			var oResult = oObject;
			for (var i = 0; i < aPropertyNames.length; i++) {
				oResult = oResult[aPropertyNames[i]];
				if (oResult === undefined) {
					break;
				}
			}
			return oResult;
		},

		/**
		 * Get orientation (left-to-right or right-to-left).
		 *
		 * @returns {string} character orientation for this locale
		 * @public
		 */
		getOrientation: function() {
			return this._get("orientation");
		},

		/**
		 * Get a display name for the language of the Locale of this LocaleData, using
		 * the CLDR display names for languages.
		 *
		 * The lookup logic works as follows:
		 * 1. language code and region is checked (e.g. "en-GB")
		 * 2. If not found: language code and script is checked (e.g. "zh-Hant")
		 * 3. If not found language code is checked (e.g. "en")
		 * 4. If it is then still not found <code>undefined</code> is returned.
		 *
		 * @returns {string} language name, e.g. "English", "British English", "American English"
		 *  or <code>undefined</code> if language cannot be found
		 * @private
		 * @ui5-restricted sap.ushell
		 */
		getCurrentLanguageName: function() {
			var oLanguages = this.getLanguages();
			var sCurrentLanguage;
			var sLanguage = this.oLocale.getModernLanguage();
			var sScript = this.oLocale.getScript();
			// special case for "sr_Latn" language: "sh" should then be used
			// the key used in the languages object for serbian latin is "sh"
			if (sLanguage === "sr" && sScript === "Latn") {
				sLanguage = "sh";
				sScript = null;
			}
			if (this.oLocale.getRegion()) {
				// fall back to language and region, e.g. "en_GB"
				sCurrentLanguage = oLanguages[sLanguage + "_" + this.oLocale.getRegion()];
			}

			if (!sCurrentLanguage && sScript) {
				// fall back to language and script, e.g. "zh_Hant"
				sCurrentLanguage = oLanguages[sLanguage + "_" + sScript];
			}

			if (!sCurrentLanguage) {
				// fall back to language only, e.g. "en"
				sCurrentLanguage = oLanguages[sLanguage];
			}
			return sCurrentLanguage;
		},

		/**
		 * Get locale specific language names.
		 *
		 * @returns {object} map of locale specific language names
		 * @public
		 */
		getLanguages: function() {
			return this._get("languages");
		},

		/**
		 * Get locale specific script names.
		 *
		 * @returns {object} map of locale specific script names
		 * @public
		 */
		getScripts: function() {
			return this._get("scripts");
		},

		/**
		 * Get locale specific territory names.
		 *
		 * @returns {object} map of locale specific territory names
		 * @public
		 */
		getTerritories: function() {
			return this._get("territories");
		},

		/**
		 * Get month names in width "narrow", "abbreviated" or "wide".
		 *
		 * @param {string} sWidth the required width for the month names
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {array} array of month names (starting with January)
		 * @public
		 */
		getMonths: function(sWidth, sCalendarType) {
			assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			return this._get(getCLDRCalendarName(sCalendarType), "months", "format", sWidth);
		},

		/**
		 * Get stand alone month names in width "narrow", "abbreviated" or "wide".
		 *
		 * @param {string} sWidth the required width for the month names
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {array} array of month names (starting with January)
		 * @public
		 */
		getMonthsStandAlone: function(sWidth, sCalendarType) {
			assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			return this._get(getCLDRCalendarName(sCalendarType), "months", "stand-alone", sWidth);
		},

		/**
		 * Get day names in width "narrow", "abbreviated" or "wide".
		 *
		 * @param {string} sWidth the required width for the day names
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {array} array of day names (starting with Sunday)
		 * @public
		 */
		getDays: function(sWidth, sCalendarType) {
			assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide" || sWidth == "short", "sWidth must be narrow, abbreviate, wide or short");
			return this._get(getCLDRCalendarName(sCalendarType), "days", "format",  sWidth);
		},

		/**
		 * Get stand alone day names in width "narrow", "abbreviated" or "wide".
		 *
		 * @param {string} sWidth the required width for the day names
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {array} array of day names (starting with Sunday)
		 * @public
		 */
		getDaysStandAlone: function(sWidth, sCalendarType) {
			assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide" || sWidth == "short", "sWidth must be narrow, abbreviated, wide or short");
			return this._get(getCLDRCalendarName(sCalendarType), "days", "stand-alone",  sWidth);
		},

		/**
		 * Get quarter names in width "narrow", "abbreviated" or "wide".
		 *
		 * @param {string} sWidth the required width for the quarter names
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {array} array of quarters
		 * @public
		 */
		getQuarters: function(sWidth, sCalendarType) {
			assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			return this._get(getCLDRCalendarName(sCalendarType), "quarters", "format",  sWidth);
		},

		/**
		 * Get stand alone quarter names in width "narrow", "abbreviated" or "wide".
		 *
		 * @param {string} sWidth the required width for the quarter names
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {array} array of quarters
		 * @public
		 */
		getQuartersStandAlone: function(sWidth, sCalendarType) {
			assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			return this._get(getCLDRCalendarName(sCalendarType), "quarters", "stand-alone",  sWidth);
		},

		/**
		 * Get day periods in width "narrow", "abbreviated" or "wide".
		 *
		 * @param {string} sWidth the required width for the day period names
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {array} array of day periods (AM, PM)
		 * @public
		 */
		getDayPeriods: function(sWidth, sCalendarType) {
			assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			return this._get(getCLDRCalendarName(sCalendarType), "dayPeriods", "format",  sWidth);
		},

		/**
		 * Get standalone day periods in width "narrow", "abbreviated" or "wide".
		 *
		 * @param {string} sWidth the required width for the day period names
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {array} array of day periods (AM, PM)
		 * @public
		 */
		getDayPeriodsStandAlone: function(sWidth, sCalendarType) {
			assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			return this._get(getCLDRCalendarName(sCalendarType), "dayPeriods", "stand-alone",  sWidth);
		},

		/**
		 * Get date pattern in format "short", "medium", "long" or "full".
		 *
		 * @param {string} sStyle the required style for the date pattern
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {string} the selected date pattern
		 * @public
		 */
		getDatePattern: function(sStyle, sCalendarType) {
			assert(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			return this._get(getCLDRCalendarName(sCalendarType), "dateFormats", sStyle);
		},

		/**
		 * Get time pattern in style "short", "medium", "long" or "full".
		 *
		 * @param {string} sStyle the required style for the date pattern
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {string} the selected time pattern
		 * @public
		 */
		getTimePattern: function(sStyle, sCalendarType) {
			assert(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			return this._get(getCLDRCalendarName(sCalendarType), "timeFormats", sStyle);
		},

		/**
		 * Get datetime pattern in style "short", "medium", "long" or "full".
		 *
		 * @param {string} sStyle the required style for the datetime pattern
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {string} the selected datetime pattern
		 * @public
		 */
		getDateTimePattern: function(sStyle, sCalendarType) {
			assert(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			return this._get(getCLDRCalendarName(sCalendarType), "dateTimeFormats", sStyle);
		},

		/**
		 * Get combined datetime pattern with given date and and time style.
		 *
		 * @param {string} sDateStyle the required style for the date part
		 * @param {string} sTimeStyle the required style for the time part
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {string} the combined datetime pattern
		 * @public
		 */
		getCombinedDateTimePattern: function(sDateStyle, sTimeStyle, sCalendarType) {
			assert(sDateStyle == "short" || sDateStyle == "medium" || sDateStyle == "long" || sDateStyle == "full", "sStyle must be short, medium, long or full");
			assert(sTimeStyle == "short" || sTimeStyle == "medium" || sTimeStyle == "long" || sTimeStyle == "full", "sStyle must be short, medium, long or full");
			var sDateTimePattern = this.getDateTimePattern(sDateStyle, sCalendarType),
				sDatePattern = this.getDatePattern(sDateStyle, sCalendarType),
				sTimePattern = this.getTimePattern(sTimeStyle, sCalendarType);
			return sDateTimePattern.replace("{0}", sTimePattern).replace("{1}", sDatePattern);
		},

		/**
		 * Get custom datetime pattern for a given skeleton format.
		 *
		 * The format string does contain pattern symbols (e.g. "yMMMd" or "Hms") and will be converted into the pattern in the used
		 * locale, which matches the wanted symbols best. The symbols must be in canonical order, that is:
		 * Era (G), Year (y/Y), Quarter (q/Q), Month (M/L), Week (w/W), Day-Of-Week (E/e/c), Day (d/D),
		 * Hour (h/H/k/K/), Minute (m), Second (s), Timezone (z/Z/v/V/O/X/x)
		 *
		 * See http://unicode.org/reports/tr35/tr35-dates.html#availableFormats_appendItems
		 *
		 * @param {string} sSkeleton the wanted skeleton format for the datetime pattern
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {string} the best matching datetime pattern
		 * @since 1.34
		 * @public
		 */
		getCustomDateTimePattern: function(sSkeleton, sCalendarType) {
			var oAvailableFormats = this._get(getCLDRCalendarName(sCalendarType), "dateTimeFormats", "availableFormats");
			return this._getFormatPattern(sSkeleton, oAvailableFormats, sCalendarType);
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
			var oIntervalFormats = this._get(getCLDRCalendarName(sCalendarType), "dateTimeFormats", "intervalFormats"),
				aIdParts, sIntervalId, sDifference, oInterval, sPattern;
			if (sId) {
				aIdParts = sId.split("-");
				sIntervalId = aIdParts[0];
				sDifference = aIdParts[1];
				oInterval = oIntervalFormats[sIntervalId];
				if (oInterval) {
					sPattern = oInterval[sDifference];
					if (sPattern) {
						return sPattern;
					}
				}
			}
			return oIntervalFormats.intervalFormatFallback;
		},

		/**
		 * Get combined interval pattern using a given pattern and the fallback interval pattern.
		 *
		 * If a skeleton based pattern is not available or not wanted, this method can be used to create an interval
		 * pattern based on a given pattern, using the fallback interval pattern.
		 *
		 * @param {string} sPattern the single date pattern to use within the interval pattern
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {string} the calculated interval pattern
		 * @since 1.46
		 * @public
		 */
		getCombinedIntervalPattern : function(sPattern, sCalendarType) {
			var oIntervalFormats = this._get(getCLDRCalendarName(sCalendarType), "dateTimeFormats", "intervalFormats"),
				sFallbackPattern = oIntervalFormats.intervalFormatFallback;
			return sFallbackPattern.replace(/\{(0|1)\}/g, sPattern);
		},

		/**
		 * Get interval pattern for a given skeleton format.
		 *
		 * The format string does contain pattern symbols (e.g. "yMMMd" or "Hms") and will be converted into the pattern in the used
		 * locale, which matches the wanted symbols best. The symbols must be in canonical order, that is:
		 * Era (G), Year (y/Y), Quarter (q/Q), Month (M/L), Week (w/W), Day-Of-Week (E/e/c), Day (d/D),
		 * Hour (h/H/k/K/), Minute (m), Second (s), Timezone (z/Z/v/V/O/X/x)
		 *
		 * See http://unicode.org/reports/tr35/tr35-dates.html#availableFormats_appendItems
		 *
		 * @param {string} sSkeleton the wanted skeleton format for the datetime pattern
		 * @param {object|string} vGreatestDiff is either a string which represents the symbol matching the greatest difference in the two dates to format or an object which contains key-value pairs.
		 *  The value is always true. The key is one of the date field symbol groups whose value are different between the two dates. The key can only be set with 'Year', 'Quarter', 'Month', 'Week',
		 *  'Day', 'DayPeriod', 'Hour', 'Minute', or 'Second'.
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {string|string[]} the best matching interval pattern if interval difference is given otherwise an array with all possible interval patterns which match the given skeleton format
		 * @since 1.46
		 * @public
		 */
		getCustomIntervalPattern : function(sSkeleton, vGreatestDiff, sCalendarType) {
			var oAvailableFormats = this._get(getCLDRCalendarName(sCalendarType), "dateTimeFormats", "intervalFormats");
			return this._getFormatPattern(sSkeleton, oAvailableFormats, sCalendarType, vGreatestDiff);
		},

		/* Helper functions for skeleton pattern processing */
		_getFormatPattern: function(sSkeleton, oAvailableFormats, sCalendarType, vDiff) {
			var vPattern, aPatterns, oIntervalFormats;

			if (!vDiff) {
				// the call is from getCustomDateTimePattern
				vPattern = oAvailableFormats[sSkeleton];
			} else if (typeof vDiff === "string") {
				// vDiff is given as a symbol
				if (vDiff == "j" || vDiff == "J") {
					vDiff = this.getPreferredHourSymbol();
				}
				oIntervalFormats = oAvailableFormats[sSkeleton];
				vPattern = oIntervalFormats && oIntervalFormats[vDiff];
			}

			if (vPattern) {
				if (typeof vPattern === "object") {
					aPatterns = Object.keys(vPattern).map(function(sKey) {
						return vPattern[sKey];
					});
				} else {
					return vPattern;
				}
			}

			if (!aPatterns) {
				aPatterns = this._createFormatPattern(sSkeleton, oAvailableFormats, sCalendarType, vDiff);
			}

			if (aPatterns && aPatterns.length === 1) {
				return aPatterns[0];
			}

			return aPatterns;
		},

		_createFormatPattern: function(sSkeleton, oAvailableFormats, sCalendarType, vDiff) {
			var aTokens = this._parseSkeletonFormat(sSkeleton), aPatterns,
				oBestMatch = this._findBestMatch(aTokens, sSkeleton, oAvailableFormats),
				oToken, oAvailableDateTimeFormats, oSymbol, oGroup,
				sPattern, sSinglePattern, sDiffSymbol, sDiffGroup,
				rMixedSkeleton = /^([GyYqQMLwWEecdD]+)([hHkKjJmszZvVOXx]+)$/,
				bSingleDate,
				i;


			if (vDiff) {
				if (typeof vDiff === "string") {
					sDiffGroup = mCLDRSymbols[vDiff] ? mCLDRSymbols[vDiff].group : "";
					if (sDiffGroup) {
							// if the index of interval diff is greater than the index of the last field
							// in the sSkeleton, which means the diff unit is smaller than all units in
							// the skeleton, return a single date pattern which is generated using the
							// given skeleton
							bSingleDate = mCLDRSymbolGroups[sDiffGroup].index > aTokens[aTokens.length - 1].index;
					}
					sDiffSymbol = vDiff;
				} else {
					bSingleDate = true;
					// Special handling of "y" (Year) in case patterns contains also "G" (Era)
					if (aTokens[0].symbol === "y" && oBestMatch && oBestMatch.pattern.G) {
						oSymbol = mCLDRSymbols["G"];
						oGroup = mCLDRSymbolGroups[oSymbol.group];
						aTokens.splice(0, 0, {
							symbol: "G",
							group: oSymbol.group,
							match: oSymbol.match,
							index: oGroup.index,
							field: oGroup.field,
							length: 1
						});
					}

					// Check if at least one token's group appears in the interval diff
					// If not, a single date pattern is returned
					for (i = aTokens.length - 1; i >= 0; i--){
						oToken = aTokens[i];

						if (vDiff[oToken.group]) {
							bSingleDate = false;
							break;
						}
					}

					// select the greatest diff symbol
					for (i = 0; i < aTokens.length; i++){
						oToken = aTokens[i];

						if (vDiff[oToken.group]) {
							sDiffSymbol = oToken.symbol;
							break;
						}
					}
					// Special handling of "a" (Dayperiod)
					// Find out whether dayperiod is different between the dates
					// If yes, set the  diff symbol with 'a' Dayperiod symbol
					if ((sDiffSymbol == "h" || sDiffSymbol == "K") && vDiff.DayPeriod) {
						sDiffSymbol = "a";
					}
				}

				if (bSingleDate) {
					return [this.getCustomDateTimePattern(sSkeleton, sCalendarType)];
				}

				// Only use best match, if there are no missing tokens, as there is no possibility
				// to append items on interval formats
				if (oBestMatch && oBestMatch.missingTokens.length === 0) {
					sPattern = oBestMatch.pattern[sDiffSymbol];
					// if there is no exact match, we need to do further processing
					if (sPattern && oBestMatch.distance > 0) {
						sPattern = this._expandFields(sPattern, oBestMatch.patternTokens, aTokens);
					}
				}
				// If no pattern could be found, get the best availableFormat for the skeleton
				// and use the fallbackIntervalFormat to create the pattern
				if (!sPattern) {
					oAvailableDateTimeFormats = this._get(getCLDRCalendarName(sCalendarType), "dateTimeFormats", "availableFormats");
					// If it is a mixed skeleton and the greatest interval on time, create a mixed pattern
					if (rMixedSkeleton.test(sSkeleton) && "ahHkKjJms".indexOf(sDiffSymbol) >= 0) {
						sPattern = this._getMixedFormatPattern(sSkeleton, oAvailableDateTimeFormats, sCalendarType, vDiff);
					} else {
						sSinglePattern = this._getFormatPattern(sSkeleton, oAvailableDateTimeFormats, sCalendarType);
						sPattern = this.getCombinedIntervalPattern(sSinglePattern, sCalendarType);
					}
				}

				aPatterns = [sPattern];

			} else if (!oBestMatch) {
				sPattern = sSkeleton;
				aPatterns = [sPattern];
			} else {
				if (typeof oBestMatch.pattern === "string") {
					aPatterns = [oBestMatch.pattern];
				} else if (typeof oBestMatch.pattern === "object") {
					aPatterns = [];

					for (var sKey in oBestMatch.pattern) {
						sPattern = oBestMatch.pattern[sKey];
						aPatterns.push(sPattern);
					}
				}
				// if there is no exact match, we need to do further processing
				if (oBestMatch.distance > 0) {
					if (oBestMatch.missingTokens.length > 0) {
						// if tokens are missing create a pattern containing all, otherwise just adjust pattern
						if (rMixedSkeleton.test(sSkeleton)) {
							aPatterns = [this._getMixedFormatPattern(sSkeleton, oAvailableFormats, sCalendarType)];
						} else {
							aPatterns = this._expandFields(aPatterns, oBestMatch.patternTokens, aTokens);
							aPatterns = this._appendItems(aPatterns, oBestMatch.missingTokens, sCalendarType);
						}
					} else {
						aPatterns = this._expandFields(aPatterns, oBestMatch.patternTokens, aTokens);
					}
				}
			}

			// If special input token "J" was used, remove dayperiod from pattern
			if (sSkeleton.indexOf("J") >= 0) {
				aPatterns.forEach(function(sPattern, iIndex) {
					aPatterns[iIndex] = sPattern.replace(/ ?[abB](?=([^']*'[^']*')*[^']*)$/g, "");
				});
			}

			return aPatterns;
		},

		_parseSkeletonFormat: function(sSkeleton) {
			var aTokens = [],
				oToken = {index: -1},
				sSymbol,
				oSymbol,
				oGroup;
			for (var i = 0; i < sSkeleton.length; i++) {
				sSymbol = sSkeleton.charAt(i);
				// Handle special input symbols
				if (sSymbol == "j" || sSymbol == "J") {
					sSymbol = this.getPreferredHourSymbol();
				}
				// if the symbol is the same as current token, increase the length
				if (sSymbol == oToken.symbol) {
					oToken.length++;
					continue;
				}
				// get symbol group
				oSymbol = mCLDRSymbols[sSymbol];
				oGroup = mCLDRSymbolGroups[oSymbol.group];
				// if group is other, the symbol is not allowed in skeleton tokens
				if (oSymbol.group == "Other" || oGroup.diffOnly) {
					throw new Error("Symbol '" + sSymbol + "' is not allowed in skeleton format '" + sSkeleton + "'");
				}
				// if group index the same or lower, format is invalid
				if (oGroup.index <= oToken.index) {
					throw new Error("Symbol '" + sSymbol + "' at wrong position or duplicate in skeleton format '" + sSkeleton + "'");
				}
				// create token and add it the token array
				oToken = {
					symbol: sSymbol,
					group: oSymbol.group,
					match: oSymbol.match,
					index: oGroup.index,
					field: oGroup.field,
					length: 1
				};
				aTokens.push(oToken);
			}
			return aTokens;
		},

		_findBestMatch: function(aTokens, sSkeleton, oAvailableFormats) {
			var aTestTokens,
				aMissingTokens,
				oToken,
				oTestToken,
				iTest,
				iDistance,
				bMatch,
				iFirstDiffPos,
				oTokenSymbol,
				oTestTokenSymbol,
				oBestMatch = {
					distance: 10000,
					firstDiffPos: -1
				};
			// Loop through all available tokens, find matches and calculate distance
			for (var sTestSkeleton in oAvailableFormats) {
				// Skip patterns with symbol "B" (which is introduced from CLDR v32.0.0) which isn't supported in DateFormat yet
				if (sTestSkeleton === "intervalFormatFallback" || sTestSkeleton.indexOf("B") > -1) {
					continue;
				}
				aTestTokens = this._parseSkeletonFormat(sTestSkeleton);
				iDistance = 0;
				aMissingTokens = [];
				bMatch = true;
				// if test format contains more tokens, it cannot be a best match
				if (aTokens.length < aTestTokens.length) {
					continue;
				}
				iTest = 0;
				iFirstDiffPos = aTokens.length;
				for (var i = 0; i < aTokens.length; i++) {
					oToken = aTokens[i];
					oTestToken = aTestTokens[iTest];
					if (iFirstDiffPos === aTokens.length) {
						iFirstDiffPos = i;
					}
					if (oTestToken) {
						oTokenSymbol = mCLDRSymbols[oToken.symbol];
						oTestTokenSymbol = mCLDRSymbols[oTestToken.symbol];
						// if the symbol matches, just add the length difference to the distance
						if (oToken.symbol === oTestToken.symbol) {
							if (oToken.length === oTestToken.length) {
								// both symbol and length match, check the next token
								// clear the first difference position
								if (iFirstDiffPos === i) {
									iFirstDiffPos = aTokens.length;
								}
							} else {
								if (oToken.length < oTokenSymbol.numericCeiling ? oTestToken.length < oTestTokenSymbol.numericCeiling : oTestToken.length >= oTestTokenSymbol.numericCeiling) {
									// if the symbols are in the same category (either numeric or text representation), add the length diff
									iDistance += Math.abs(oToken.length - oTestToken.length);
								} else {
									// otherwise add 5 which is bigger than any length difference
									iDistance += 5;
								}
							}
							iTest++;
							continue;
						} else {
							// if only the group matches, add some more distance in addition to length difference
							if (oToken.match == oTestToken.match) {
								iDistance += Math.abs(oToken.length - oTestToken.length) + 10;
								iTest++;
								continue;
							}
						}
					}
					// if neither symbol or group matched, add it to the missing tokens and add distance
					aMissingTokens.push(oToken);
					iDistance += 50 - i;
				}

				// if not all test tokens have been found, the format does not match
				if (iTest < aTestTokens.length) {
					bMatch = false;
				}

				// The current pattern is saved as the best pattern when there is a match and
				//  1. the distance is smaller than the best distance or
				//  2. the distance equals the best distance and the position of the token in the given skeleton which
				//   isn't the same between the given skeleton and the available skeleton is bigger than the best one's.
				if (bMatch && (iDistance < oBestMatch.distance || (iDistance === oBestMatch.distance && iFirstDiffPos > oBestMatch.firstDiffPos))) {
					oBestMatch.distance = iDistance;
					oBestMatch.firstDiffPos = iFirstDiffPos;
					oBestMatch.missingTokens = aMissingTokens;
					oBestMatch.pattern = oAvailableFormats[sTestSkeleton];
					oBestMatch.patternTokens = aTestTokens;
				}
			}
			if (oBestMatch.pattern) {
				return oBestMatch;
			}
		},

		_expandFields: function(vPattern, aPatternTokens, aTokens) {
			var bSinglePattern = (typeof vPattern === "string");

			var aPatterns;
			if (bSinglePattern) {
				aPatterns = [vPattern];
			} else {
				aPatterns = vPattern;
			}

			var aResult = aPatterns.map(function(sPattern) {
				var mGroups = {},
					mPatternGroups = {},
					sResultPatterm = "",
					bQuoted = false,
					i = 0,
					iSkeletonLength,
					iPatternLength,
					iBestLength,
					iNewLength,
					oSkeletonToken,
					oBestToken,
					oSymbol,
					sChar;

				// Create a map of group names to token
				aTokens.forEach(function(oToken) {
					mGroups[oToken.group] = oToken;
				});
				// Create a map of group names to token in best pattern
				aPatternTokens.forEach(function(oToken) {
					mPatternGroups[oToken.group] = oToken;
				});
				// Loop through pattern and adjust symbol length
				while (i < sPattern.length) {
					sChar = sPattern.charAt(i);
					if (bQuoted) {
						sResultPatterm += sChar;
						if (sChar == "'") {
							bQuoted = false;
						}
					} else {
						oSymbol = mCLDRSymbols[sChar];
						// If symbol is a CLDR symbol and is contained in the group, expand length
						if (oSymbol && mGroups[oSymbol.group] && mPatternGroups[oSymbol.group]) {
							oSkeletonToken = mGroups[oSymbol.group];
							oBestToken = mPatternGroups[oSymbol.group];

							iSkeletonLength = oSkeletonToken.length;
							iBestLength = oBestToken.length;

							iPatternLength = 1;
							while (sPattern.charAt(i + 1) == sChar) {
								i++;
								iPatternLength++;
							}

							// Prevent expanding the length of the field when:
							// 1. The length in the best matching skeleton (iBestLength) matches the length of the application provided skeleton (iSkeletonLength) or
							// 2. The length of the provided skeleton (iSkeletonLength) and the length of the result pattern (iPatternLength) are not in the same category (numeric or text)
							//	because switching between numeric to text representation is wrong in all cases
							if (iSkeletonLength === iBestLength ||
								((iSkeletonLength < oSymbol.numericCeiling) ?
									(iPatternLength >= oSymbol.numericCeiling) : (iPatternLength < oSymbol.numericCeiling)
								)) {
								iNewLength = iPatternLength;
							} else {
								iNewLength = Math.max(iPatternLength, iSkeletonLength);
							}

							for (var j = 0; j < iNewLength; j++) {
								sResultPatterm += sChar;
							}
						} else {
							sResultPatterm += sChar;
							if (sChar == "'") {
								bQuoted = true;
							}
						}
					}
					i++;
				}
				return sResultPatterm;
			});

			return bSinglePattern ? aResult[0] : aResult;
		},

		_appendItems: function(aPatterns, aMissingTokens, sCalendarType) {
			var oAppendItems = this._get(getCLDRCalendarName(sCalendarType), "dateTimeFormats", "appendItems");
			aPatterns.forEach(function(sPattern, iIndex) {
				var sDisplayName,
					sAppendPattern,
					sAppendField;

				aMissingTokens.forEach(function(oToken) {
					sAppendPattern = oAppendItems[oToken.group];
					sDisplayName = "'" + this.getDisplayName(oToken.field) + "'";
					sAppendField = "";
					for (var i = 0; i < oToken.length; i++) {
						sAppendField += oToken.symbol;
					}
					aPatterns[iIndex] = sAppendPattern.replace(/\{0\}/, sPattern).replace(/\{1\}/, sAppendField).replace(/\{2\}/, sDisplayName);
				}.bind(this));
			}.bind(this));

			return aPatterns;
		},

		_getMixedFormatPattern: function(sSkeleton, oAvailableFormats, sCalendarType, vDiff) {
			var rMixedSkeleton = /^([GyYqQMLwWEecdD]+)([hHkKjJmszZvVOXx]+)$/,
				rWideMonth = /MMMM|LLLL/,
				rAbbrevMonth = /MMM|LLL/,
				rWeekDay = /E|e|c/,
				oResult, sDateSkeleton, sTimeSkeleton, sStyle,
				sDatePattern, sTimePattern, sDateTimePattern, sResultPattern;

			// Split skeleton into date and time part
			oResult = rMixedSkeleton.exec(sSkeleton);
			sDateSkeleton = oResult[1];
			sTimeSkeleton = oResult[2];
			// Get patterns for date and time separately
			sDatePattern = this._getFormatPattern(sDateSkeleton, oAvailableFormats, sCalendarType);
			if (vDiff) {
				sTimePattern = this.getCustomIntervalPattern(sTimeSkeleton, vDiff, sCalendarType);
			} else {
				sTimePattern = this._getFormatPattern(sTimeSkeleton, oAvailableFormats, sCalendarType);
			}
			// Combine patterns with datetime pattern, dependent on month and weekday
			if (rWideMonth.test(sDateSkeleton)) {
				sStyle = rWeekDay.test(sDateSkeleton) ? "full" : "long";
			} else if (rAbbrevMonth.test(sDateSkeleton)) {
				sStyle = "medium";
			} else {
				sStyle = "short";
			}
			sDateTimePattern = this.getDateTimePattern(sStyle, sCalendarType);
			sResultPattern = sDateTimePattern.replace(/\{1\}/, sDatePattern).replace(/\{0\}/, sTimePattern);
			return sResultPattern;
		},

		/**
		 * Get number symbol "decimal", "group", "plusSign", "minusSign", "percentSign".
		 *
		 * @param {string} sType the required type of symbol
		 * @returns {string} the selected number symbol
		 * @public
		 */
		getNumberSymbol: function(sType) {
			assert(sType == "decimal" || sType == "group" || sType == "plusSign" || sType == "minusSign" || sType == "percentSign", "sType must be decimal, group, plusSign, minusSign or percentSign");
			return this._get("symbols-latn-" + sType);
		},

		/**
		 * Get lenient number symbols for "plusSign" or "minusSign".
		 *
		 * @param {string} sType the required type of symbol
		 * @returns {string} the selected lenient number symbols, e.g. "-‒⁻₋−➖﹣"
		 * @public
		 */
		getLenientNumberSymbols: function(sType) {
			assert(sType == "plusSign" || sType == "minusSign", "sType must be plusSign or minusSign");
			return this._get("lenient-scope-number")[sType];
		},

		/**
		 * Get decimal format pattern.
		 *
		 * @returns {string} The pattern
		 * @public
		 */
		getDecimalPattern: function() {
			return this._get("decimalFormat").standard;
		},

		/**
		 * Get currency format pattern.
		 *
		 * CLDR format pattern:
		 *
		 * @example standard with currency symbol in front of the number
		 * ¤#,##0.00
		 * $100,000.00
		 * $-100,000.00
		 *
		 * @example accounting with negative number pattern after the semicolon
		 * ¤#,##0.00;(¤#,##0.00)
		 * $100,000.00
		 * ($100,000.00)
		 *
		 * @see http://cldr.unicode.org/translation/numbers-currency/number-patterns
		 *
		 * @param {string} sContext the context of the currency pattern (standard or accounting)
		 * @returns {string} The pattern
		 * @public
		 */
		getCurrencyPattern: function(sContext) {
			// Undocumented contexts for NumberFormat internal use: "sap-standard" and "sap-accounting"
			return this._get("currencyFormat")[sContext] || this._get("currencyFormat").standard;
		},

		getCurrencySpacing: function(sPosition) {
			return this._get("currencyFormat", "currencySpacing", sPosition === "after" ? "afterCurrency" : "beforeCurrency");
		},

		/**
		 * Get percent format pattern.
		 *
		 * @returns {string} The pattern
		 * @public
		 */
		getPercentPattern: function() {
			return this._get("percentFormat").standard;
		},

		/**
		 * Get miscellaneous pattern.
		 *
		 * @param {string} sName the name of the misc pattern, can be "approximately", "atLeast", "atMost" or "range"
		 * @returns {string} The pattern
		 * @public
		 */
		getMiscPattern: function(sName) {
			assert(sName == "approximately" || sName == "atLeast" || sName == "atMost" || sName == "range", "sName must be approximately, atLeast, atMost or range");
			return this._get("miscPattern")[sName];
		},

		/**
		 * Returns the required minimal number of days for the first week of a year.
		 *
		 * This is the minimal number of days of the week which must be contained in the new year
		 * for the week to become the first week of the year. Depending on the country, this
		 * is just a single day (in the US) or at least 4 days (in most of Europe).
		 *
		 * All week data information in the CLDR is provided for territories (countries).
		 * If the locale of this LocaleData doesn't contain country information (e.g. if it
		 * contains only a language), then the "likelySubtag" information of the CLDR
		 * is taken into account to guess the "most likely" territory for the locale.
		 *
		 * @returns {int} minimal number of days
		 * @public
		 */
		getMinimalDaysInFirstWeek: function() {
			return this._get("weekData-minDays");
		},

		/**
		 * Returns the day that usually is regarded as the first day
		 * of a week in the current locale.
		 *
		 * Days are encoded as integer where Sunday=0, Monday=1 etc.
		 *
		 * All week data information in the CLDR is provided for territories (countries).
		 * If the locale of this LocaleData doesn't contain country information (e.g. if it
		 * contains only a language), then the "likelySubtag" information of the CLDR
		 * is taken into account to guess the "most likely" territory for the locale.
		 *
		 * @returns {int} first day of week
		 * @public
		 */
		getFirstDayOfWeek: function() {
			return this._get("weekData-firstDay");
		},

		/**
		 * Returns the first day of a weekend for the given locale.
		 *
		 * Days are encoded in the same way as for {@link #getFirstDayOfWeek}.
		 *
		 * All week data information in the CLDR is provided for territories (countries).
		 * If the locale of this LocaleData doesn't contain country information (e.g. if it
		 * contains only a language), then the "likelySubtag" information of the CLDR
		 * is taken into account to guess the "most likely" territory for the locale.
		 *
		 * @returns {int} first day of weekend
		 * @public
		 */
		getWeekendStart: function() {
			return this._get("weekData-weekendStart");
		},

		/**
		 * Returns the last day of a weekend for the given locale.
		 *
		 * Days are encoded in the same way as for {@link #getFirstDayOfWeek}.
		 *
		 * All week data information in the CLDR is provided for territories (countries).
		 * If the locale of this LocaleData doesn't contain country information (e.g. if it
		 * contains only a language), then the "likelySubtag" information of the CLDR
		 * is taken into account to guess the "most likely" territory for the locale.
		 *
		 * @returns {int} last day of weekend
		 * @public
		 */
		getWeekendEnd: function() {
			return this._get("weekData-weekendEnd");
		},

		/**
		 * Returns a map of custom currency codes, defined via global configuration.
		 * @returns {object} map of custom currency codes, e.g.
		 * {
		 *     "AUD": "AUD",
		 *     "BRL": "BRL",
		 *     "EUR": "EUR",
		 *     "GBP": "GBP",
		 * }
		 * @private
		 * @ui5-restricted sap.ui.core.format.NumberFormat
		 * @since 1.63
		 */
		getCustomCurrencyCodes: function () {
			var mCustomCurrencies = this._get("currency") || {},
				mCustomCurrencyCodes = {};

			Object.keys(mCustomCurrencies).forEach(function (sCurrencyKey) {
				mCustomCurrencyCodes[sCurrencyKey] = sCurrencyKey;
			});

			return mCustomCurrencyCodes;
		},

		/**
		 * Returns the number of digits of the specified currency.
		 *
		 * @param {string} sCurrency ISO 4217 currency code
		 * @returns {int} digits of the currency
		 * @public
		 * @since 1.21.1
		 */
		getCurrencyDigits: function(sCurrency) {

			// try to lookup currency digits from custom currencies
			var mCustomCurrencies = this._get("currency");
			if (mCustomCurrencies) {
				if (mCustomCurrencies[sCurrency] && mCustomCurrencies[sCurrency].hasOwnProperty("digits")) {
					return mCustomCurrencies[sCurrency].digits;
				} else if (mCustomCurrencies["DEFAULT"] && mCustomCurrencies["DEFAULT"].hasOwnProperty("digits")) {
					return mCustomCurrencies["DEFAULT"].digits;
				}
			}

			var iDigits = this._get("currencyDigits", sCurrency);
			if (iDigits == null) {
				iDigits = this._get("currencyDigits", "DEFAULT");

				if (iDigits == null) {
					iDigits = 2; // default
				}
			}
			return iDigits;
		},

		/**
		 * Returns the currency symbol for the specified currency, if no symbol is found the ISO 4217 currency code is returned.
		 *
		 * @param {string} sCurrency ISO 4217 currency code
		 * @returns {string} the currency symbol
		 * @public
		 * @since 1.21.1
		 */
		getCurrencySymbol: function(sCurrency) {
			var oCurrencySymbols = this.getCurrencySymbols();
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
		getCurrencyCodeBySymbol: function(sCurrencySymbol) {
			var oCurrencySymbols = this._get("currencySymbols"), sCurrencyCode;
			for (sCurrencyCode in oCurrencySymbols) {
				if (oCurrencySymbols[sCurrencyCode] === sCurrencySymbol) {
					return sCurrencyCode;
				}
			}
			return sCurrencySymbol;
		},

		/**
		 * Returns the currency symbols available for this locale.
		 * Currency symbols get accumulated by custom currency symbols.
		 *
		 * @returns {object} the map of all currency symbols available in this locale, e.g.
		 * {
		 *     "AUD": "A$",
		 *     "BRL": "R$",
		 *     "EUR": "€",
		 *     "GBP": "£",
		 * }
		 * @public
		 * @since 1.60
		 */
		getCurrencySymbols: function() {
			// Lookup into global Config
			var mCustomCurrencies = this._get("currency"),
				mCustomCurrencySymbols = {},
				sIsoCode;

			for (var sCurrencyKey in mCustomCurrencies) {
				sIsoCode = mCustomCurrencies[sCurrencyKey].isoCode;

				if (mCustomCurrencies[sCurrencyKey].symbol) {
					mCustomCurrencySymbols[sCurrencyKey] = mCustomCurrencies[sCurrencyKey].symbol;
				} else if (sIsoCode) {
					mCustomCurrencySymbols[sCurrencyKey] = this._get("currencySymbols")[sIsoCode];
				}
			}

			return Object.assign({}, this._get("currencySymbols"), mCustomCurrencySymbols);
		},

		/**
		 * Retrieves the localized display name of a unit by sUnit, e.g. "duration-hour".
		 * @param {string} sUnit the unit key, e.g. "duration-hour"
		 * @return {string} The localized display name for the requested unit, e.g. <code>"Hour"</code>. Return empty string <code>""</code> if not found
		 * @public
		 * @since 1.54
		 */
		getUnitDisplayName: function(sUnit) {
			var mUnitFormat = this.getUnitFormat(sUnit);
			return (mUnitFormat && mUnitFormat["displayName"]) || "";
		},


		/**
		 * Returns relative time patterns for the given scales as an array of objects containing scale, value and pattern.
		 *
		 * The array may contain the following values: "year", "month", "week", "day", "hour", "minute" and "second". If
		 * no scales are given, patterns for all available scales will be returned.
		 *
		 * The return array will contain objects looking like:
		 * <pre>
		 * {
		 *     scale: "minute",
		 *     sign: 1,
		 *     pattern: "in {0} minutes"
		 * }
		 * </pre>
		 *
		 * @param {string[]} aScales The scales for which the available patterns should be returned
		 * @param {string} [sStyle="wide"] @since 1.32.10, 1.34.4 The style of the scale patterns. The valid values are "wide", "short" and "narrow".
		 * @returns {object[]} An array of all relative time patterns
		 * @public
		 * @since 1.34
		 */
		getRelativePatterns: function(aScales, sStyle) {
			if (sStyle === undefined) {
				sStyle = "wide";
			}

			assert(sStyle === "wide" || sStyle === "short" || sStyle === "narrow", "sStyle is only allowed to be set with 'wide', 'short' or 'narrow'");

			var aPatterns = [],
				aPluralCategories = this.getPluralCategories(),
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
						iValue = parseInt(sEntry.substr(14));
						aPatterns.push({
							scale: sScale,
							value: iValue,
							pattern: oScale[sEntry]
						});
					} else if (sEntry.indexOf("relativeTime-type-") == 0) {
						oTimeEntry = oScale[sEntry];
						iSign = sEntry.substr(18) === "past" ? -1 : 1;
						aPluralCategories.forEach(function(sKey) { // eslint-disable-line no-loop-func
							aPatterns.push({
								scale: sScale,
								sign: iSign,
								pattern: oTimeEntry["relativeTimePattern-count-" + sKey]
							});
						});
					}
				}
			}.bind(this));

			return aPatterns;
		},

		/**
		 * Returns the relative format pattern with given scale (year, month, week, ...) and difference value.
		 *
		 * @param {string} sScale the scale the relative pattern is needed for
		 * @param {int} iDiff the difference in the given scale unit
		 * @param {boolean} [bFuture] whether a future or past pattern should be used
		 * @param {string} [sStyle="wide"] @since 1.32.10, 1.34.4 the style of the pattern. The valid values are "wide", "short" and "narrow"
		 * @returns {string} the relative format pattern
		 * @public
		 * @since 1.34
		 */
		getRelativePattern: function(sScale, iDiff, bFuture, sStyle) {
			var sPattern, oTypes, sKey, sPluralCategory;

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

			assert(sStyle === "wide" || sStyle === "short" || sStyle === "narrow", "sStyle is only allowed to be set with 'wide', 'short' or 'narrow'");

			sKey = sScale + "-" + sStyle;

			if (iDiff === 0 || iDiff === -2 || iDiff === 2) {
				sPattern = this._get("dateFields", sKey, "relative-type-" + iDiff);
			}

			if (!sPattern) {
				oTypes = this._get("dateFields", sKey, "relativeTime-type-" + (bFuture ? "future" : "past"));
				sPluralCategory = this.getPluralCategory(Math.abs(iDiff).toString());
				sPattern = oTypes["relativeTimePattern-count-" + sPluralCategory];
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
		getRelativeSecond: function(iDiff, sStyle) {
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
		getRelativeMinute: function(iDiff, sStyle) {
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
		 * @returns {string|null} the relative resource pattern in unit 'hour'. The method returns null if 0 is given as parameter.
		 * @public
		 * @since 1.31.0
		 */
		getRelativeHour: function(iDiff, sStyle) {
			if (iDiff == 0) {
				return null;
			}
			return this.getRelativePattern("hour", iDiff, sStyle);
		},

		/**
		 * Returns the relative day resource pattern (like "Today", "Yesterday", "{0} days ago") based on the given
		 * difference of days (0 means today, 1 means tomorrow, -1 means yesterday, ...).
		 *
		 * @param {int} iDiff the difference in days
		 * @param {string} [sStyle="wide"] @since 1.32.10, 1.34.4 the style of the pattern. The valid values are "wide", "short" and "narrow"
		 * @returns {string} the relative day resource pattern
		 * @public
		 * @since 1.25.0
		 */
		getRelativeDay: function(iDiff, sStyle) {
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
		getRelativeWeek: function(iDiff, sStyle) {
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
		getRelativeMonth: function(iDiff, sStyle) {
			return this.getRelativePattern("month", iDiff, sStyle);
		},

		/**
		 * Returns the display name for a time unit (second, minute, hour, day, week, month, year).
		 *
		 * @param {string} sType Type (second, minute, hour, day, week, month, year)
		 * @param {string} [sStyle="wide"] @since 1.32.10, 1.34.4 the style of the pattern. The valid values are "wide", "short" and "narrow"
		 * returns {string} display name
		 * @public
		 * @since 1.34.0
		 */
		getDisplayName: function(sType, sStyle) {
			assert(sType == "second" || sType == "minute" || sType == "hour" || sType == "zone" || sType == "day"
				|| sType == "weekday" || sType == "week" || sType == "month" || sType == "quarter" || sType == "year" || sType == "era",
				"sType must be second, minute, hour, zone, day, weekday, week, month, quarter, year, era");

			if (sStyle === undefined) {
				sStyle = "wide";
			}

			assert(sStyle === "wide" || sStyle === "short" || sStyle === "narrow", "sStyle is only allowed to be set with 'wide', 'short' or 'narrow'");

			var aSingleFormFields = ["era", "weekday", "zone"],
				sKey = aSingleFormFields.indexOf(sType) === -1 ? sType + "-" + sStyle : sType;

			return this._get("dateFields", sKey, "displayName");
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
		getRelativeYear: function(iDiff, sStyle) {
			return this.getRelativePattern("year", iDiff, sStyle);
		},

		/**
		 * Returns the short decimal formats (like 1K, 1M....).
		 *
		 * @param {string} sStyle short or long
		 * @param {string} sNumber 1000, 10000 ...
		 * @param {string} sPlural one or other (if not exists other is used)
		 * @returns {string} decimal format
		 * @public
		 * @since 1.25.0
		 */
		getDecimalFormat: function(sStyle, sNumber, sPlural) {

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
		 * Returns the short currency formats (like 1K USD, 1M USD....).
		 *
		 * @param {string} sStyle short
		 * @param {string} sNumber 1000, 10000 ...
		 * @param {string} sPlural one or other (if not exists other is used)
		 * @returns {string} decimal format
		 * @public
		 * @since 1.51.0
		 */
		getCurrencyFormat: function(sStyle, sNumber, sPlural) {

			var sFormat;
			var oFormats = this._get("currencyFormat-" + sStyle);

			// Defaults to "short" if not found
			if (!oFormats) {
				if (sStyle === "sap-short") {
					throw new Error("Failed to get CLDR data for property \"currencyFormat-sap-short\"");
				}
				oFormats = this._get("currencyFormat-short");
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
		 * Returns a map containing patterns for formatting lists
		 *
		 *@param {string} [sType='standard'] The type of the list pattern. It can be 'standard' or 'or'.
		 *@param {string} [sStyle='wide'] The style of the list pattern. It can be 'wide' or 'short'.
		* @return {object} Map with list patterns
		 */
		getListFormat: function (sType, sStyle) {
			var oFormats = this._get("listPattern-" + (sType || "standard") + "-" + (sStyle || "wide"));

			if (oFormats) {
				return oFormats;
			}

			return {};
		},

		/**
		 * Retrieves the unit format pattern for a specific unit name considering the unit mappings.
		 * @param {string} sUnit unit name, e.g. "duration-hour" or "my"
		 * @return {object} The unit format configuration for the given unit name
		 * @public
		 * @since 1.54
		 * @see sap.ui.core.LocaleData#getUnitFromMapping
		 */
		getResolvedUnitFormat: function (sUnit) {
			sUnit = this.getUnitFromMapping(sUnit) || sUnit;
			return this.getUnitFormat(sUnit);
		},

		/**
		 * Retrieves the unit format pattern for a specific unit name.
		 *
		 * Note: Does not take unit mapping into consideration.
		 * @param {string} sUnit unit name, e.g. "duration-hour"
		 * @return {object} The unit format configuration for the given unit name
		 * @public
		 * @since 1.54
		 */
		getUnitFormat: function (sUnit) {
			return this._get("units", "short", sUnit);
		},

		/**
		 * Retrieves all unit format patterns merged.
		 *
		 * Note: Does not take unit mapping into consideration.
		 * @return {object} The unit format patterns
		 * @public
		 * @since 1.54
		 */
		getUnitFormats: function() {
			return this._getMerged("units", "short");
		},

		/**
		 * Looks up the unit from defined unit mapping.
		 * E.g. for defined unit mapping
		 * <code>
		 * {
		 *  "my": "my-custom-unit",
		 *  "cm": "length-centimeter"
		 * }
		 * </code>
		 *
		 * Call:
		 * <code>getUnitFromMapping("my")</code> would result in <code>"my-custom-unit"</code>
		 * @return {string} unit from the mapping
		 * @public
		 * @since 1.54
		 */
		getUnitFromMapping: function (sMapping) {
			return this._get("unitMappings", sMapping);
		},


		/**
		 * Returns array of eras.
		 *
		 * @param {string} sWidth the style of the era name. It can be 'wide', 'abbreviated' or 'narrow'
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar
		 * @return {array} the array of eras
		 * @public
		 * @since 1.32.0
		 */
		getEras: function(sWidth, sCalendarType) {
			assert(sWidth == "wide" || sWidth == "abbreviated" || sWidth == "narrow" , "sWidth must be wide, abbreviate or narrow");

			//TODO Adapt generation so that eras are an array instead of object
			var oEras = this._get(getCLDRCalendarName(sCalendarType), "era-" + sWidth),
				aEras = [];
			for (var i in oEras) {
				aEras[parseInt(i)] = oEras[i];
			}
			return aEras;
		},

		/**
		 * Returns the map of era IDs to era dates.
		 *
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar
		 * @return {array} the array of eras containing objects with either an _end or _start property with a date
		 * @public
		 * @since 1.32.0
		 */
		getEraDates: function(sCalendarType) {
			//TODO Adapt generation so that eradates are an array instead of object
			var oEraDates = this._get("eras-" + sCalendarType.toLowerCase()),
				aEraDates = [];
			for (var i in oEraDates) {
				aEraDates[parseInt(i)] = oEraDates[i];
			}
			return aEraDates;
		},

		/**
		 * Returns the defined pattern for representing the calendar week number.
		 *
		 * @param {string} sStyle the style of the pattern. It can only be either "wide" or "narrow".
		 * @param {int} iWeekNumber the week number
		 * @return {string} the week number string
		 *
		 * @public
		 * @since 1.32.0
		 */
		getCalendarWeek: function(sStyle, iWeekNumber) {
			assert(sStyle == "wide" || sStyle == "narrow" , "sStyle must be wide or narrow");

			var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core", this.oLocale.toString()),
				sKey = "date.week.calendarweek." + sStyle;

			return oMessageBundle.getText(sKey, iWeekNumber);
		},

		/**
		 * Whether 1 January is the first day of the first calendar week.
		 * This is the definition of the calendar week in the US.
		 *
		 * @return {boolean} true if the first week of the year starts with 1 January.
		 * @public
		 * @since 1.92.0
		 */
		firstDayStartsFirstWeek: function() {
			return this.oLocale.getLanguage() === "en" && this.oLocale.getRegion() === "US";
		},

		/**
		 * Returns the preferred calendar type for the current locale which exists in {@link sap.ui.core.CalendarType}
		 *
		 * @returns {sap.ui.core.CalendarType} the preferred calendar type
		 * @public
		 * @since 1.28.6
		 */
		getPreferredCalendarType: function() {
			var sCalendarPreference = this._get("calendarPreference"),
				aCalendars = sCalendarPreference ? sCalendarPreference.split(" ") : [],
				sCalendarName, sType, i;

			for ( i = 0 ; i < aCalendars.length ; i++ ) {
				// No support for calendar subtypes (islamic) yet, so ignore part after -
				sCalendarName = aCalendars[i].split("-")[0];
				for (sType in CalendarType) {
					if (sCalendarName === sType.toLowerCase()) {
						return sType;
					}
				}
			}

			return CalendarType.Gregorian;
		},

		/**
		 * Returns the preferred hour pattern symbol (h for 12, H for 24 hours) for the current locale.
		 *
		 * @returns {string} the preferred hour symbol
		 * @public
		 * @since 1.34
		 */
		getPreferredHourSymbol: function() {
			return this._get("timeData", "_preferred");
		},

		/**
		 * Returns an array of all plural categories available in this language.
		 *
		 * @returns {array} The array of plural categories
		 * @public
		 * @since 1.50
		 */
		getPluralCategories: function() {
			var oPlurals = this._get("plurals"),
				aCategories =  Object.keys(oPlurals);
			aCategories.push("other");
			return aCategories;
		},

		/**
		 * Returns the plural category (zero, one, two, few, many or other) for the given number value.
		 * The number should be passed as a string with dot as decimal separator and the number of decimal/fraction digits
		 * as used in the final output. This is needed in order to preserve trailing zeros which are relevant to
		 * determine the right plural category.
		 *
		 * @param {string|number} sNumber The number to find the plural category for
		 * @returns {string} The plural category
		 * @public
		 * @since 1.50
		 */
		getPluralCategory: function(sNumber) {
			var oPlurals = this._get("plurals");
			if (typeof sNumber === "number") {
				sNumber = sNumber.toString();
			}
			if (!this._pluralTest) {
				this._pluralTest = {};
			}
			for (var sCategory in oPlurals) {
				var fnTest = this._pluralTest[sCategory];
				if (!fnTest) {
					fnTest = this._parsePluralRule(oPlurals[sCategory]);
					this._pluralTest[sCategory] = fnTest;
				}
				if (fnTest(sNumber)) {
					return sCategory;
				}
			}
			return "other";
		},

		_parsePluralRule: function(sRule) {

			var OP_OR = "or",
				OP_AND = "and",
				OP_MOD = "%",
				OP_EQ = "=",
				OP_NEQ = "!=",
				OPD_N = "n",
				OPD_I = "i",
				OPD_F = "f",
				OPD_T = "t",
				OPD_V = "v",
				OPD_W = "w",
				RANGE = "..",
				SEP = ",";

			var i = 0,
				aTokens;

			aTokens = sRule.split(" ");

			function accept(sToken) {
				if (aTokens[i] === sToken) {
					i++;
					return true;
				}
				return false;
			}

			function consume() {
				var sToken = aTokens[i];
				i++;
				return sToken;
			}

			function or_condition() {
				var fnAnd, fnOr;
				fnAnd = and_condition();
				if (accept(OP_OR)) {
					fnOr = or_condition();
					return function(o) {
						return fnAnd(o) || fnOr(o);
					};
				}
				return fnAnd;
			}

			function and_condition() {
				var fnRelation, fnAnd;
				fnRelation = relation();
				if (accept(OP_AND)) {
					fnAnd = and_condition();
					return function(o) {
						return fnRelation(o) && fnAnd(o);
					};
				}
				return fnRelation;
			}

			function relation() {
				var fnExpr, fnRangeList, bEq;
				fnExpr = expr();
				if (accept(OP_EQ)) {
					bEq = true;
				} else if (accept(OP_NEQ)) {
					bEq = false;
				} else {
					throw new Error("Expected '=' or '!='");
				}
				fnRangeList = range_list();
				if (bEq) {
					return function(o) {
						return fnRangeList(o).indexOf(fnExpr(o)) >= 0;
					};
				} else {
					return function(o) {
						return fnRangeList(o).indexOf(fnExpr(o)) === -1;
					};
				}
			}

			function expr() {
				var fnOperand;
				fnOperand = operand();
				if (accept(OP_MOD)) {
					var iDivisor = parseInt(consume());
					return function(o) {
						return fnOperand(o) % iDivisor;
					};
				}
				return fnOperand;
			}

			function operand() {
				if (accept(OPD_N)) {
					return function(o) {
						return o.n;
					};
				} else if (accept(OPD_I)) {
					return function(o) {
						return o.i;
					};
				} else if (accept(OPD_F)) {
					return function(o) {
						return o.f;
					};
				} else if (accept(OPD_T)) {
					return function(o) {
						return o.t;
					};
				} else if (accept(OPD_V)) {
					return function(o) {
						return o.v;
					};
				} else if (accept(OPD_W)) {
					return function(o) {
						return o.w;
					};
				} else {
					throw new Error("Unknown operand: " + consume());
				}
			}

			function range_list() {
				var aValues = [],
					sRangeList = consume(),
					aParts = sRangeList.split(SEP),
					aRange, iFrom, iTo;
				aParts.forEach(function(sPart) {
					aRange = sPart.split(RANGE);
					if (aRange.length === 1) {
						aValues.push(parseInt(sPart));
					} else {
						iFrom = parseInt(aRange[0]);
						iTo = parseInt(aRange[1]);
						for (var i = iFrom; i <= iTo; i++) {
							aValues.push(i);
						}
					}
				});
				return function(o) {
					return aValues;
				};
			}

			var fnOr = or_condition();
			if (i != aTokens.length) {
				throw new Error("Not completely parsed");
			}
			return function(sValue) {
				var iDotPos = sValue.indexOf("."),
					sDecimal, sFraction, sFractionNoZeros, o;

				if (iDotPos === -1) {
					sDecimal = sValue;
					sFraction = "";
					sFractionNoZeros = "";
				} else {
					sDecimal = sValue.substr(0, iDotPos);
					sFraction = sValue.substr(iDotPos + 1);
					sFractionNoZeros = sFraction.replace(/0+$/, '');
				}

				o = {
					n: parseFloat(sValue),
					i: parseInt(sDecimal),
					v: sFraction.length,
					w: sFractionNoZeros.length,
					f: parseInt(sFraction),
					t: parseInt(sFractionNoZeros)
				};
				return fnOr(o);
			};
		}
	});

	var mCLDRSymbolGroups = {
		"Era": { field: "era", index: 0 },
		"Year": { field: "year", index: 1 },
		"Quarter": { field: "quarter", index: 2 },
		"Month": { field: "month", index: 3 },
		"Week": { field: "week", index: 4 },
		"Day-Of-Week": { field: "weekday", index: 5 },
		"Day": { field: "day", index: 6 },
		"DayPeriod": { field: "hour", index: 7, diffOnly: true },
		"Hour": { field: "hour", index: 8 },
		"Minute": { field: "minute", index: 9 },
		"Second": { field: "second", index: 10 },
		"Timezone": { field: "zone", index: 11 }
	};

	var mCLDRSymbols = {
		"G": { group: "Era", match: "Era", numericCeiling: 1},
		"y": { group: "Year", match: "Year", numericCeiling: 100},
		"Y": { group: "Year", match: "Year", numericCeiling: 100},
		"Q": { group: "Quarter", match: "Quarter", numericCeiling: 3},
		"q": { group: "Quarter", match: "Quarter", numericCeiling: 3},
		"M": { group: "Month", match: "Month", numericCeiling: 3},
		"L": { group: "Month", match: "Month", numericCeiling: 3},
		"w": { group: "Week", match: "Week", numericCeiling: 100},
		"W": { group: "Week", match: "Week", numericCeiling: 100},
		"d": { group: "Day", match: "Day", numericCeiling: 100},
		"D": { group: "Day", match: "Day", numericCeiling: 100},
		"E": { group: "Day-Of-Week", match: "Day-Of-Week", numericCeiling: 1},
		"e": { group: "Day-Of-Week", match: "Day-Of-Week", numericCeiling: 3},
		"c": { group: "Day-Of-Week", match: "Day-Of-Week", numericCeiling: 2},
		"h": { group: "Hour", match: "Hour12", numericCeiling: 100},
		"H": { group: "Hour", match: "Hour24", numericCeiling: 100},
		"k": { group: "Hour", match: "Hour24", numericCeiling: 100},
		"K": { group: "Hour", match: "Hour12", numericCeiling: 100},
		"m": { group: "Minute", match: "Minute", numericCeiling: 100},
		"s": { group: "Second", match: "Second", numericCeiling: 100},
		"z": { group: "Timezone", match: "Timezone", numericCeiling: 1},
		"Z": { group: "Timezone", match: "Timezone", numericCeiling: 1},
		"O": { group: "Timezone", match: "Timezone", numericCeiling: 1},
		"v": { group: "Timezone", match: "Timezone", numericCeiling: 1},
		"V": { group: "Timezone", match: "Timezone", numericCeiling: 1},
		"X": { group: "Timezone", match: "Timezone", numericCeiling: 1},
		"x": { group: "Timezone", match: "Timezone", numericCeiling: 1},
		"S": { group: "Other", numericCeiling: 100},
		"u": { group: "Other", numericCeiling: 100},
		"U": { group: "Other", numericCeiling: 1},
		"r": { group: "Other", numericCeiling: 100},
		"F": { group: "Other", numericCeiling: 100},
		"g": { group: "Other", numericCeiling: 100},
		"a": { group: "DayPeriod", numericCeiling: 1},
		"b": { group: "Other", numericCeiling: 1},
		"B": { group: "Other", numericCeiling: 1},
		"A": { group: "Other", numericCeiling: 100}
	};

	var M_ISO639_OLD_TO_NEW = {
			"iw" : "he",
			"ji" : "yi"
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
	 * Locale data cache.
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
	 * Load LocaleData data from the CLDR generated files.
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
				var data = mLocaleDatas[sId] = LoaderExtensions.loadResource("sap/ui/core/cldr/" + sId + ".json", {
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
		// Special case 1: in an SAP context, the inclusive language code "no" always means Norwegian Bokmal ("nb")
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

		// Special case 3: for Serbian, there is script cyrillic and latin, "sh" and "sr-latn" map to "latin", "sr" maps to cyrillic
		// CLDR files: sr.json (cyrillic) and sr_Latn.json (latin)
		if (sLanguage === "sh" || (sLanguage === "sr" && sScript === "Latn")) {
			sLanguage = "sr_Latn";
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
		// last try: load data for default language "en" (english)
		mLocaleDatas[sId] = mData || getOrLoad("en");

		return mLocaleDatas[sId];
	}


	/**
	 * @classdesc A specialized subclass of LocaleData that merges custom settings.
	 * @extends sap.ui.core.LocaleData
	 * @alias sap.ui.core.CustomLocaleData
	 * @private
	 */
	var CustomLocaleData = LocaleData.extend("sap.ui.core.CustomLocaleData", {
		constructor: function(oLocale) {
			LocaleData.apply(this, arguments);
			this.mCustomData = sap.ui.getCore().getConfiguration().getFormatSettings().getCustomLocaleData();
		},

		/**
		 * Retrieves the value for the given arguments by checking first <code>mCustomData</code> and if not
		 * found <code>mData</code>
		 * @returns {*} value
		 * @private
		 */
		_get: function() {
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
			// first try customdata with special formatted key
			// afterwards try customdata lookup
			// afterwards try mData lookup
			var vValue = this.mCustomData[sKey];
			if (vValue == null) {
				vValue = this._getDeep(this.mCustomData, arguments);
				if (vValue == null) {
					vValue = this._getDeep(this.mData, arguments);
				}
			}

			return vValue;
		},

		/**
		 * Retrieves merged object from <code>mData</code> extended with <code>mCustomData</code>.
		 * This function merges the content of <code>mData</code> and <code>mCustomData</code> instead of returning one or the other like <code>_get()</code> does.
		 *
		 * Note: Properties defined in <code>mCustomData</code> overwrite the ones from <code>mData</code>.
		 * @private
		 * @return {object} merged object
		 */
		_getMerged: function () {
			var mData = this._getDeep(this.mData, arguments);
			var mCustomData = this._getDeep(this.mCustomData, arguments);

			return extend({}, mData, mCustomData);
		}
	});

	/**
	 *
	 */
	LocaleData.getInstance = function(oLocale) {
		return oLocale.hasPrivateUseSubtag("sapufmt") ? new CustomLocaleData(oLocale) : new LocaleData(oLocale);
	};

	return LocaleData;

});
