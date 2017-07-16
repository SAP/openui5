/*!
 * ${copyright}
 */

//Provides the locale object sap.ui.core.LocaleData
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', './Configuration', './Locale'],
	function(jQuery, BaseObject, Configuration, Locale) {
	"use strict";

	/**
	 * Creates an instance of LocaleData for the given locale.
	 *
	 * @class Provides access to locale-specific data, like date formats, number formats, currencies, etc.
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

		_get: function() {
			return this._getDeep(this.mData, arguments);
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
			jQuery.sap.assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
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
			jQuery.sap.assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
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
			jQuery.sap.assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide" || sWidth == "short", "sWidth must be narrow, abbreviate, wide or short");
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
			jQuery.sap.assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide" || sWidth == "short", "sWidth must be narrow, abbreviated, wide or short");
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
			jQuery.sap.assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
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
			jQuery.sap.assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
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
			jQuery.sap.assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
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
			jQuery.sap.assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
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
			jQuery.sap.assert(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
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
			jQuery.sap.assert(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
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
			jQuery.sap.assert(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
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
			jQuery.sap.assert(sDateStyle == "short" || sDateStyle == "medium" || sDateStyle == "long" || sDateStyle == "full", "sStyle must be short, medium, long or full");
			jQuery.sap.assert(sTimeStyle == "short" || sTimeStyle == "medium" || sTimeStyle == "long" || sTimeStyle == "full", "sStyle must be short, medium, long or full");
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
		 * @param {string} sGreatestDiff the symbol matching the greatest difference in the two dates to format
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {string} the best matching interval pattern
		 * @since 1.46
		 * @public
		 */
		getCustomIntervalPattern : function(sSkeleton, sGreatestDiff, sCalendarType) {
			var oAvailableFormats = this._get(getCLDRCalendarName(sCalendarType), "dateTimeFormats", "intervalFormats");
			return this._getFormatPattern(sSkeleton, oAvailableFormats, sCalendarType, sGreatestDiff);
		},

		/* Helper functions for skeleton pattern processing */
		_getFormatPattern: function(sSkeleton, oAvailableFormats, sCalendarType, sIntervalDiff) {
			var sPattern, oIntervalFormats;
			if (sIntervalDiff) {
				if (sIntervalDiff == "j" || sIntervalDiff == "J") {
					sIntervalDiff = this.getPreferredHourSymbol();
				}
				oIntervalFormats = oAvailableFormats[sSkeleton];
				sPattern = oIntervalFormats && oIntervalFormats[sIntervalDiff];
			} else {
				sPattern = oAvailableFormats[sSkeleton];
			}
			if (!sPattern) {
				sPattern = this._createFormatPattern(sSkeleton, oAvailableFormats, sCalendarType, sIntervalDiff);
			}
			return sPattern;
		},

		_createFormatPattern: function(sSkeleton, oAvailableFormats, sCalendarType, sIntervalDiff) {
			var aTokens = this._parseSkeletonFormat(sSkeleton),
				oBestMatch = this._findBestMatch(aTokens, sSkeleton, oAvailableFormats),
				sPattern, sSinglePattern,
				oAvailableDateTimeFormats,
				rMixedSkeleton = /^([GyYqQMLwWEecdD]+)([hHkKjJmszZvVOXx]+)$/;
			var bSymbolFound;

			var sDiffGroup = sIntervalDiff;
			var oGroup;
			if (sDiffGroup) {
				if (sDiffGroup === "a") {
					sDiffGroup = "Hour";
				}

				if (sDiffGroup.length === 1) {
					sDiffGroup = mCLDRSymbols[sDiffGroup] ? mCLDRSymbols[sDiffGroup].group : "";
				}

				if (sDiffGroup) {
					oGroup = mCLDRSymbolGroups[sDiffGroup];
					if (oGroup.index > aTokens[aTokens.length - 1].index) {
						// if the index of interval diff is greater than the index of the last field
						// in the sSkeleton, which means the diff unit is smaller than all units in
						// the skeleton, return a single date pattern which is generated using the
						// given skeleton
						return this.getCustomDateTimePattern(sSkeleton, sCalendarType);
					}
				}
			}

			if (sIntervalDiff) {
				// FieldGroup
				if (sIntervalDiff.length > 1) {
					// Find out the symbol of the given group
					// and set the interval diff
					bSymbolFound = aTokens.some(function(oToken) {
						if (oToken.group === sIntervalDiff) {
							sIntervalDiff = oToken.symbol;
							return true;
						}
					});

					// When no symbol is found
					// an empty interval diff will be set
					if (!bSymbolFound) {
						sIntervalDiff = "";
					}
				}

				// Special handling of "a" (Dayperiod)
				if (sIntervalDiff === "a") {
					// Find out whether dayperiod is needed
					// If not, set the internal diff with the actual 'Hour' symbol
					bSymbolFound = aTokens.some(function(oToken) {
						if (oToken.group === "Hour") {
							if (oToken.symbol !== "h" && oToken.symbol !== "K") {
								sIntervalDiff = oToken.symbol;
							}
							return true;
						}
					});

					// When no symbol is found
					// an empty interval diff will be set
					if (!bSymbolFound) {
						sIntervalDiff = "";
					}
				}

				// Only use best match, if there are no missing tokens, as there is no possibility
				// to append items on interval formats
				if (oBestMatch && oBestMatch.missingTokens.length === 0) {
					sPattern = oBestMatch.pattern[sIntervalDiff];
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
					if (rMixedSkeleton.test(sSkeleton) && "ahHkKjJms".indexOf(sIntervalDiff) >= 0) {
						sPattern = this._getMixedFormatPattern(sSkeleton, oAvailableDateTimeFormats, sCalendarType, sIntervalDiff);
					} else {
						sSinglePattern = this._getFormatPattern(sSkeleton, oAvailableDateTimeFormats, sCalendarType);
						sPattern = this.getCombinedIntervalPattern(sSinglePattern, sCalendarType);
					}
				}
			} else if (!oBestMatch) {
				sPattern = sSkeleton;
			} else {
				sPattern = oBestMatch.pattern;
				// if there is no exact match, we need to do further processing
				if (oBestMatch.distance > 0) {
					if (oBestMatch.missingTokens.length > 0) {
						// if tokens are missing create a pattern containing all, otherwise just adjust pattern
						if (rMixedSkeleton.test(sSkeleton)) {
							sPattern = this._getMixedFormatPattern(sSkeleton, oAvailableFormats, sCalendarType);
						} else {
							sPattern = this._expandFields(oBestMatch.pattern, oBestMatch.patternTokens, aTokens);
							sPattern = this._appendItems(sPattern, oBestMatch.missingTokens, sCalendarType);
						}
					} else {
						sPattern = this._expandFields(oBestMatch.pattern, oBestMatch.patternTokens, aTokens);
					}
				}
			}
			// If special input token "J" was used, remove dayperiod from pattern
			if (sSkeleton.indexOf("J") >= 0) {
				sPattern = sPattern.replace(/ ?[abB](?=([^']*'[^']*')*[^']*)$/g, "");
			}

			return sPattern;
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
				if (oSymbol.group == "Other") {
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
				if (sTestSkeleton === "intervalFormatFallback") {
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

		_expandFields: function(sPattern, aPatternTokens, aTokens) {
			var mGroups = {},
				mPatternGroups = {},
				sResultPatterm = "",
				bQuoted = false,
				i = 0,
				iSkeletonLength,
				iPatternLength,
				iOldLength,
				iNewLength,
				oSkeletonToken,
				oBestToken,
				oSymbol,
				oSkeletonSymbol,
				oBestSymbol,
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
						oSkeletonSymbol = mCLDRSymbols[oSkeletonToken.symbol];
						oBestSymbol = mCLDRSymbols[oBestToken.symbol];

						iSkeletonLength = oSkeletonToken.length;
						iPatternLength = oBestToken.length;

						iOldLength = 1;
						while (sPattern.charAt(i + 1) == sChar) {
							i++;
							iOldLength++;
						}

						// Prevent expanding the length of the field when:
						// 1. The length in the best matching skeleton (iPatternLength) matches the length of the application provided skeleton (iSkeletonLength) or
						// 2. The length of the provided skeleton (iSkeletonLength) and the length of the result pattern (iOldLength) are not in the same category (numeric or text)
						//	because switching between numeric to text representation is wrong in all cases
						if (iSkeletonLength === iPatternLength ||
							((iSkeletonLength < oSkeletonSymbol.numericCeiling) ?
								(iPatternLength >= oBestSymbol.numericCeiling) : (iPatternLength < oBestSymbol.numericCeiling)
							)) {
							iNewLength = iOldLength;
						} else {
							iNewLength = Math.max(iOldLength, iSkeletonLength);
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
		},

		_appendItems: function(sPattern, aMissingTokens, sCalendarType) {
			var oAppendItems = this._get(getCLDRCalendarName(sCalendarType), "dateTimeFormats", "appendItems"),
				sDisplayName,
				sAppendPattern,
				sAppendField;
			aMissingTokens.forEach(function(oToken) {
				sAppendPattern = oAppendItems[oToken.group];
				sDisplayName = "'" + this.getDisplayName(oToken.field) + "'";
				sAppendField = "";
				for (var i = 0; i < oToken.length; i++) {
					sAppendField += oToken.symbol;
				}
				sPattern = sAppendPattern.replace(/\{0\}/, sPattern).replace(/\{1\}/, sAppendField).replace(/\{2\}/, sDisplayName);
			}.bind(this));
			return sPattern;
		},

		_getMixedFormatPattern: function(sSkeleton, oAvailableFormats, sCalendarType, sIntervalDiff) {
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
			if (sIntervalDiff) {
				sTimePattern = this.getCustomIntervalPattern(sTimeSkeleton, sIntervalDiff, sCalendarType);
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
			jQuery.sap.assert(sType == "decimal" || sType == "group" || sType == "plusSign" || sType == "minusSign" || sType == "percentSign", "sType must be decimal, group, plusSign, minusSign or percentSign");
			return this._get("symbols-latn-" + sType);
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
		 * @param {string} sContext the context of the currency pattern (standard or accounting)
		 * @returns {string} The pattern
		 * @public
		 */
		getCurrencyPattern: function(sContext) {
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
		 * Returns the number of digits of the specified currency.
		 *
		 * @param {string} sCurrency ISO 4217 currency code
		 * @returns {int} digits of the currency
		 * @public
		 * @since 1.21.1
		 */
		getCurrencyDigits: function(sCurrency) {
			var oCurrencyDigits = this._get("currencyDigits");
			var iDigits = 2;
			if (oCurrencyDigits) {
				if (oCurrencyDigits[sCurrency] != undefined) {
					iDigits = oCurrencyDigits[sCurrency];
				} else {
					iDigits = oCurrencyDigits["DEFAULT"];
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
		 * difference of days (0 means today, 1 means tommorrow, -1 means yesterday, ...).
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
			jQuery.sap.assert(sType == "second" || sType == "minute" || sType == "hour" || sType == "zone" || sType == "day"
				|| sType == "weekday" || sType == "week" || sType == "month" || sType == "quarter" || sType == "year" || sType == "era",
				"sType must be second, minute, hour, zone, day, weekday, week, month, quarter, year, era");

			if (sStyle === undefined) {
				sStyle = "wide";
			}

			jQuery.sap.assert(sStyle === "wide" || sStyle === "short" || sStyle === "narrow", "sStyle is only allowed to be set with 'wide', 'short' or 'narrow'");

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
		 * Returns array of eras.
		 *
		 * @param {string} sWidth the style of the era name. It can be 'wide', 'abbreviated' or 'narrow'
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar
		 * @return {array} the array of eras
		 * @public
		 * @since 1.32.0
		 */
		getEras: function(sWidth, sCalendarType) {
			jQuery.sap.assert(sWidth == "wide" || sWidth == "abbreviated" || sWidth == "narrow" , "sWidth must be wide, abbreviate or narrow");

			//TODO Adapt generation so that eras are an array instead of object
			var oEras = this._get(getCLDRCalendarName(sCalendarType), "era-" + sWidth),
				aEras = [];
			for (var i in oEras) {
				aEras[parseInt(i, 10)] = oEras[i];
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
				aEraDates[parseInt(i, 10)] = oEraDates[i];
			}
			return aEraDates;
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
		getCalendarWeek: function(sStyle, iWeekNumber) {
			jQuery.sap.assert(sStyle == "wide" || sStyle == "narrow" , "sStyle must be wide or narrow");

			var oMessageBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core", this.oLocale.toString()),
				sKey = "date.week.calendarweek." + sStyle;

			return oMessageBundle.getText(sKey, iWeekNumber);
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

			// lazy load of sap.ui.core library to avoid cyclic dependencies
			sap.ui.getCore().loadLibrary('sap.ui.core');
			var CalendarType = sap.ui.require("sap/ui/core/library").CalendarType;

			for ( i = 0 ; i < aCalendars.length ; i++ ) {
				sCalendarName = aCalendars[i];
				for (sType in CalendarType) {
					if (sCalendarName === getCLDRCalendarName(sType).substring(3)) {
						return sType;
					}
				}
			}

			return CalendarType.Gregorian;
		},

		/**
		 * Returns the preferred hour pattern symbol (h for 12, H for 24 hours) for the current locale.
		 *
		 * returns {string} the preferred hour symbol
		 * @public
		 * @since 1.34
		 */
		getPreferredHourSymbol: function() {
			return this._get("timeData", "_preferred");
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
		"Hour": { field: "hour", index: 7 },
		"Minute": { field: "minute", index: 8 },
		"Second": { field: "second", index: 9 },
		"Timezone": { field: "zone", index: 10 }
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
		"a": { group: "Other", numericCeiling: 1},
		"b": { group: "Other", numericCeiling: 1},
		"B": { group: "Other", numericCeiling: 1},
		"A": { group: "Other", numericCeiling: 100}
	};

	/**
	 * Default data, in case neither the region specific, nor the language specific fallback can be found.
	 *
	 * @private
	 */
	var M_DEFAULT_DATA = {
			"orientation":"left-to-right",
			"languages":{},
			"scripts":{},
			"territories":{},
			"ca-gregorian": {
				"dateFormats": {
					"full":"EEEE, MMMM d, y",
					"long":"MMMM d, y",
					"medium":"MMM d, y",
					"short":"M/d/yy"
				},
				"timeFormats": {
					"full":"h:mm:ss a zzzz",
					"long":"h:mm:ss a z",
					"medium":"h:mm:ss a",
					"short":"h:mm a"
				},
				"dateTimeFormats": {
					"full":"{1} 'at' {0}",
					"long":"{1} 'at' {0}",
					"medium":"{1}, {0}",
					"short":"{1}, {0}",
					"availableFormats": {
						"d": "d",
						"E": "ccc",
						"Ed": "d E",
						"Ehm": "E h:mm a",
						"EHm": "E HH:mm",
						"Ehms": "E h:mm:ss a",
						"EHms": "E HH:mm:ss",
						"Gy": "y G",
						"GyMMM": "MMM y G",
						"GyMMMd": "MMM d, y G",
						"GyMMMEd": "E, MMM d, y G",
						"h": "h a",
						"H": "HH",
						"hm": "h:mm a",
						"Hm": "HH:mm",
						"hms": "h:mm:ss a",
						"Hms": "HH:mm:ss",
						"hmsv": "h:mm:ss a v",
						"Hmsv": "HH:mm:ss v",
						"hmv": "h:mm a v",
						"Hmv": "HH:mm v",
						"M": "L",
						"Md": "M/d",
						"MEd": "E, M/d",
						"MMM": "LLL",
						"MMMd": "MMM d",
						"MMMEd": "E, MMM d",
						"MMMMd": "MMMM d",
						"ms": "mm:ss",
						"y": "y",
						"yM": "M/y",
						"yMd": "M/d/y",
						"yMEd": "E, M/d/y",
						"yMMM": "MMM y",
						"yMMMd": "MMM d, y",
						"yMMMEd": "E, MMM d, y",
						"yMMMM": "MMMM y",
						"yQQQ": "QQQ y",
						"yQQQQ": "QQQQ y"
					},
					"appendItems": {
						"Day": "{0} ({2}: {1})",
						"Day-Of-Week": "{0} {1}",
						"Era": "{0} {1}",
						"Hour": "{0} ({2}: {1})",
						"Minute": "{0} ({2}: {1})",
						"Month": "{0} ({2}: {1})",
						"Quarter": "{0} ({2}: {1})",
						"Second": "{0} ({2}: {1})",
						"Timezone": "{0} {1}",
						"Week": "{0} ({2}: {1})",
						"Year": "{0} {1}"
					},
					"intervalFormats": {
						"intervalFormatFallback":"{0} – {1}",
						"d": {
							"d": "d – d"
						},
						"h": {
							"a": "h a – h a",
							"h": "h – h a"
						},
						"H": {
							"H": "HH – HH"
						},
						"hm": {
							"a": "h:mm a – h:mm a",
							"h": "h:mm – h:mm a",
							"m": "h:mm – h:mm a"
						},
						"Hm": {
							"H": "HH:mm – HH:mm",
							"m": "HH:mm – HH:mm"
						},
						"hmv": {
							"a": "h:mm a – h:mm a v",
							"h": "h:mm – h:mm a v",
							"m": "h:mm – h:mm a v"
						},
						"Hmv": {
							"H": "HH:mm – HH:mm v",
							"m": "HH:mm – HH:mm v"
						},
						"hv": {
							"a": "h a – h a v",
							"h": "h – h a v"
						},
						"Hv": {
							"H": "HH – HH v"
						},
						"M": {
							"M": "M – M"
						},
						"Md": {
							"d": "M/d – M/d",
							"M": "M/d – M/d"
						},
						"MEd": {
							"d": "E, M/d – E, M/d",
							"M": "E, M/d – E, M/d"
						},
						"MMM": {
							"M": "MMM – MMM"
						},
						"MMMd": {
							"d": "MMM d – d",
							"M": "MMM d – MMM d"
						},
						"MMMEd": {
							"d": "E, MMM d – E, MMM d",
							"M": "E, MMM d – E, MMM d"
						},
						"y": {
							"y": "y – y"
						},
						"yM": {
							"M": "M/y – M/y",
							"y": "M/y – M/y"
						},
						"yMd": {
							"d": "M/d/y – M/d/y",
							"M": "M/d/y – M/d/y",
							"y": "M/d/y – M/d/y"
						},
						"yMEd": {
							"d": "E, M/d/y – E, M/d/y",
							"M": "E, M/d/y – E, M/d/y",
							"y": "E, M/d/y – E, M/d/y"
						},
						"yMMM": {
							"M": "MMM – MMM y",
							"y": "MMM y – MMM y"
						},
						"yMMMd": {
							"d": "MMM d – d, y",
							"M": "MMM d – MMM d, y",
							"y": "MMM d, y – MMM d, y"
						},
						"yMMMEd": {
							"d": "E, MMM d – E, MMM d, y",
							"M": "E, MMM d – E, MMM d, y",
							"y": "E, MMM d, y – E, MMM d, y"
						},
						"yMMMM": {
							"M": "MMMM – MMMM y",
							"y": "MMMM y – MMMM y"
						}
					}
				},
				"months": {
					"format": {
						"abbreviated": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
						"narrow": ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
						"wide": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
					},
					"stand-alone": {
						"abbreviated": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
						"narrow": ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
						"wide": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
					}
				},
				"days": {
					"format": {
						"abbreviated": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
						"narrow": ["S", "M", "T", "W", "T", "F", "S"],
						"short": ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
						"wide": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
					},
					"stand-alone": {
						"abbreviated": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
						"narrow": ["S", "M", "T", "W", "T", "F", "S"],
						"short": ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
						"wide": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
					}
				},
				"quarters": {
					"format": {
						"abbreviated": ["Q1", "Q2", "Q3", "Q4"],
						"narrow": ["1", "2", "3", "4"],
						"wide": ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
					},
					"stand-alone": {
						"abbreviated": ["Q1", "Q2", "Q3", "Q4"],
						"narrow": ["1", "2", "3", "4"],
						"wide": ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
					}
				},
				"dayPeriods": {
					"format": {
						"abbreviated": ["AM", "PM"],
						"narrow": ["a", "p"],
						"wide": ["AM", "PM"]
					},
					"stand-alone": {
						"abbreviated": ["AM", "PM"],
						"narrow": ["AM", "PM"],
						"wide": ["AM", "PM"]
					}
				},
				"era-wide":{"0":"Before Christ","1":"Anno Domini"},
				"era-abbreviated":{"0":"BC","1":"AD"},
				"era-narrow":{"0":"B","1":"A"}
			},
			"eras-gregorian": {
				"0":{"_end":"0-12-31"},
				"1":{"_start":"1-01-01"}
			},
			"dateFields": {
				"era": {
					"displayName": "era"
				},
				"year-wide": {
					"displayName": "year",
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
					"displayName": "quarter",
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
					"displayName": "month",
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
					"displayName": "week",
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
					"displayName": "day",
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
					"displayName": "day of the week"
				},
				"hour-wide": {
					"displayName": "hour",
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
					"displayName": "minute",
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
					"displayName": "second",
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
					"displayName": "time zone"
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
			"weekData-weekendEnd":0,
			"timeData": {
				_allowed: "H h",
				_preferred: "H"
			}
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
			return this.mCustomData[sKey] || this._getDeep(this.mData, arguments);
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
