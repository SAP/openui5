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
			return this._get(getCLDRCalendarName(sCalendarType), "months", "format", sWidth);
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
			return this._get(getCLDRCalendarName(sCalendarType), "months", "stand-alone", sWidth);
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
			return this._get(getCLDRCalendarName(sCalendarType), "days", "format",  sWidth);
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
			return this._get(getCLDRCalendarName(sCalendarType), "days", "stand-alone",  sWidth);
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
			return this._get(getCLDRCalendarName(sCalendarType), "quarters", "format",  sWidth);
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
			return this._get(getCLDRCalendarName(sCalendarType), "quarters", "stand-alone",  sWidth);
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
			return this._get(getCLDRCalendarName(sCalendarType), "dayPeriods", "format",  sWidth);
		},

		/**
		 * Get standalone day periods in width "narrow", "abbreviated" or "wide"
		 *
		 * @param {string} sWidth the required width for the day period names
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {array} array of day periods (AM, PM)
		 * @public
		 */
		getDayPeriodsStandAlone : function(sWidth, sCalendarType) {
			jQuery.sap.assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			return this._get(getCLDRCalendarName(sCalendarType), "dayPeriods", "stand-alone",  sWidth);
		},

		/**
		 * Get date pattern in format "short", "medium", "long" or "full"
		 *
		 * @param {string} sStyle the required style for the date pattern
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar. If it's not set, it falls back to the calendar type either set in configuration or calculated from locale.
		 * @returns {string} the selected date pattern
		 * @public
		 */
		getDatePattern : function(sStyle, sCalendarType) {
			jQuery.sap.assert(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			return this._get(getCLDRCalendarName(sCalendarType), "dateFormats", sStyle);
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
			return this._get(getCLDRCalendarName(sCalendarType), "timeFormats", sStyle);
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
			return this._get(getCLDRCalendarName(sCalendarType), "dateTimeFormats", sStyle);
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
		 * @since 1.33.1
		 * @public
		 */
		getCustomDateTimePattern : function(sSkeleton, sCalendarType) {
			var oAvailableFormats = this._get(getCLDRCalendarName(sCalendarType), "dateTimeFormats", "availableFormats");
			return this._getFormatPattern(sSkeleton, oAvailableFormats, sCalendarType);
		},

		_parseSkeletonFormat: function(sSkeleton) {
			var aTokens = [], 
				oToken = {index: -1},
				sSymbol,
				sGroup,
				oGroup;
			for (var i = 0; i < sSkeleton.length; i++) {
				sSymbol = sSkeleton.charAt(i);
				// if the symbol is the same as current token, increase the length
				if (sSymbol == oToken.symbol) {
					oToken.length++;
					continue;
				}
				// get symbol group
				sGroup = mCLDRSymbols[sSymbol];
				oGroup = mCLDRSymbolGroups[sGroup];
				// if group is other, the symbol is not allowed in skeleton tokens
				if (sGroup == "Other") {
					throw new Error("Symbol '" + sSymbol + "' is not allowed in skeleton format '" + sSkeleton + "'");
				}
				// if group index the same or lower, format is invalid
				if (oGroup.index <= oToken.index) {
					throw new Error("Symbol '" + sSymbol + "' at wrong position or duplicate in skeleton format '" + sSkeleton + "'");
				}
				// create token and add it the token array
				oToken = {
					symbol: sSymbol,
					groupName: sGroup,
					group: oGroup,
					index: oGroup.index,
					length: 1
				};
				aTokens.push(oToken);
			}
			return aTokens;
		},

		_getFormatPattern: function(sSkeleton, oAvailableFormats, sCalendarType) {
			var sPattern = oAvailableFormats[sSkeleton];
			if (!sPattern) {
				sPattern = this._createFormatPattern(sSkeleton, oAvailableFormats, sCalendarType);
			}
			return sPattern;
		},
		
		_createFormatPattern: function(sSkeleton, oAvailableFormats, sCalendarType) {
			var aTokens = this._parseSkeletonFormat(sSkeleton),
				aTestTokens,
				aMissingTokens,
				oToken,
				oTestToken,
				iTest,
				iDistance,
				bMatch,
				sBestPattern,
				aBestMissingTokens,
				iBestDistance = 10000,
				sPattern,
				rMixedSkeleton = /^([GyYqQMLwWEecdD]+)([hHkKmszZvVOXx]+)$/;
			// Loop through all available tokens, find matches and calculate distance
			for (var sTestSkeleton in oAvailableFormats) {
				aTestTokens = this._parseSkeletonFormat(sTestSkeleton);
				iDistance = 0;
				aMissingTokens = [];
				bMatch = true;
				// if test format contains more tokens, it cannot be a best match 
				if (aTokens.length < aTestTokens.length) {
					continue;
				}
				var iTest = 0;
				for (var i = 0; i < aTokens.length; i++) {
					oToken = aTokens[i];
					oTestToken = aTestTokens[iTest];
					// if the symbol matches, just add the length difference to the distance
					if (oTestToken && oToken.symbol === oTestToken.symbol) {
						iDistance += Math.abs(oToken.length - oTestToken.length);
						iTest++;
						continue;
					} 
					// if only the group matches, add some more distance in addition to length difference
					if (oTestToken && oToken.group == oTestToken.group) {
						iDistance += Math.abs(oToken.length - oTestToken.length) + 10;
						iTest++;
						continue;
					}
					// if neither symbol or group matched, add it to the missing tokens and add distance
					aMissingTokens.push(oToken);
					iDistance += 50 - i;
				}
				// if not all test tokens have been found, the format does not match
				if (iTest < aTestTokens.length) {
					bMatch = false;
				}
				// if it is a match and the distance is below current best distance, then save it
				if (bMatch && iDistance < iBestDistance) {
					iBestDistance = iDistance;
					aBestMissingTokens = aMissingTokens;
					sBestPattern = oAvailableFormats[sTestSkeleton];
				}
			}
			
			// if there is no exact match, we need to do further processing
			if (iBestDistance == 0) {
				sPattern = sBestPattern;
			} else {
				if (!sBestPattern) {
					// if no best match could been found, just take the skeleton as pattern
					sPattern = sSkeleton;
				} else if (aBestMissingTokens.length > 0) {
					// if tokens are missing create a pattern containing all, otherwise just adjust pattern
					if (rMixedSkeleton.test(sSkeleton)) {
						sPattern = this._getMixedFormatPattern(sSkeleton, oAvailableFormats, sCalendarType);
					} else {
						sPattern = this._expandFields(sBestPattern, aTokens);
						sPattern = this._appendItems(sPattern, aBestMissingTokens, sCalendarType);
					}
				} else {
					sPattern = this._expandFields(sBestPattern, aTokens);
				}
			}
				
			return sPattern;	
		},
		
		_expandFields: function(sPattern, aTokens) {
			var mGroups = {}, 
				sResultPatterm = "",
				bQuoted = false,
				i = 0,
				iSkeletonLength,
				iOldLength,
				iNewLength,
				sGroup,
				sChar;
			// Create a map of group names to length
			aTokens.forEach(function(oToken) {
				mGroups[oToken.groupName] = oToken.length;
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
					sGroup = mCLDRSymbols[sChar];
					// If symbol is a CLDR symbol and is contained in the group, expand length
					if (sGroup && mGroups[sGroup]) {
						iSkeletonLength = mGroups[sGroup];
						iOldLength = 1;	
						while (sPattern.charAt(i + 1) == sChar) {
							i++;
							iOldLength++;
						}
						iNewLength = Math.max(iOldLength, iSkeletonLength);
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
				sAppendPattern = oAppendItems[oToken.groupName];
				sDisplayName = "'" + this.getDisplayName(oToken.group.fieldName) + "'";
				sAppendField = "";
				for (var i = 0; i < oToken.length; i++) {
					sAppendField += oToken.symbol;
				}
				sPattern = sAppendPattern.replace(/\{0\}/, sPattern).replace(/\{1\}/, sAppendField).replace(/\{2\}/, sDisplayName);
			}.bind(this));
			return sPattern;
		},
		
		_getMixedFormatPattern: function(sSkeleton, oAvailableFormats, sCalendarType) {
			var rMixedSkeleton = /^([GyYqQMLwWEecdD]+)([hHkKmszZvVOXx]+)$/,
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
			sTimePattern = this._getFormatPattern(sTimeSkeleton, oAvailableFormats, sCalendarType);
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
		 * @returns {object[]} An array of all relative time patterns
		 * @public
		 * @since 1.33.1
		 */
		getRelativePatterns : function(aScales) {
			var aPatterns = [],
				oScale,
				oTimeEntry,
				iValue,
				iSign;
			
			if (!aScales) {
				aScales = ["year", "month", "week", "day", "hour", "minute", "second"];
			}
			
			aScales.forEach(function(sScale) {
				oScale = this._get("dateFields", sScale);
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
		 * @param {int} iDiff the difference in seconds
		 * @returns {string} the relative format pattern
		 * @public
		 * @since 1.33.1
		 */
		getRelativePattern : function(sScale, iDiff) {
			var sPattern, oTypes;

			sPattern = this._get("dateFields", sScale, "relative-type-" + iDiff);
			
			if (!sPattern) {
				if (iDiff === 0) {
					jQuery.sap.log.warning("sap.ui.core.LocaleData: there's no pattern defined for '" + sScale + "' with 0 difference, please adjust the scale.");
					return null;
				}
				
				oTypes = this._get("dateFields", sScale, "relativeTime-type-" + (iDiff < 0 ? "past" : "future"));
				
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
		 * @returns {string} the relative resource pattern in unit 'second'
		 * @public
		 * @since 1.31.0
		 */
		getRelativeSecond : function(iDiff) {
			return this.getRelativePattern("second", iDiff);
		},

		/**
		 * Returns the relative resource pattern with unit 'minute' (like "in {0} minute(s)", "{0} minute(s) ago" under locale 'en') based on the given
		 * difference value (positive value means in the future and negative value means in the past).
		 *
		 * There's no pattern defined for 0 difference and the function returns null if 0 is given. In the 0 difference case, you can use the getRelativeSecond
		 * function to format the difference using unit 'second'.
		 *
		 * @param {int} iDiff the difference in minutes
		 * @returns {string|null} the relative resource pattern in unit 'minute'. The method returns null if 0 is given as parameter.
		 * @public
		 * @since 1.31.0
		 */
		getRelativeMinute : function(iDiff) {
			return this.getRelativePattern("minute", iDiff);
		},

		/**
		 * Returns the relative resource pattern with unit 'hour' (like "in {0} hour(s)", "{0} hour(s) ago" under locale 'en') based on the given
		 * difference value (positive value means in the future and negative value means in the past).
		 *
		 * There's no pattern defined for 0 difference and the function returns null if 0 is given. In the 0 difference case, you can use the getRelativeMinute or getRelativeSecond
		 * function to format the difference using unit 'minute' or 'second'.
		 *
		 * @param {int} iDiff the difference in hours
		 * @returns {string|null} the relative resource pattern in unit 'hour'. The method returns null if 0 is given as parameter.
		 * @public
		 * @since 1.31.0
		 */
		getRelativeHour : function(iDiff) {
			return this.getRelativePattern("hour", iDiff);
		},

		/**
		 * Returns the relative day resource pattern (like "Today", "Yesterday", "{0} days ago") based on the given
		 * difference of days (0 means today, 1 means tommorrow, -1 means yesterday, ...).
		 *
		 * @param {int} iDiff the difference in days
		 * @returns {string} the relative day resource pattern
		 * @public
		 * @since 1.25.0
		 */
		getRelativeDay : function(iDiff) {
			return this.getRelativePattern("day", iDiff);
		},

		/**
		 * Returns the relative week resource pattern (like "This week", "Last week", "{0} weeks ago") based on the given
		 * difference of weeks (0 means this week, 1 means next week, -1 means last week, ...).
		 *
		 * @param {int} iDiff the difference in weeks
		 * @returns {string} the relative week resource pattern
		 * @public
		 * @since 1.31.0
		 */
		getRelativeWeek : function(iDiff) {
			return this.getRelativePattern("week", iDiff);
		},

		/**
		 * Returns the relative month resource pattern (like "This month", "Last month", "{0} months ago") based on the given
		 * difference of months (0 means this month, 1 means next month, -1 means last month, ...).
		 *
		 * @param {int} iDiff the difference in months
		 * @returns {string} the relative month resource pattern
		 * @public
		 * @since 1.25.0
		 */
		getRelativeMonth : function(iDiff) {
			return this.getRelativePattern("month", iDiff);
		},
		
		/**
		 * Returns the display name for a time unit (second, minute, hour, day, week, month, year)
		 *
		 * @param {string} sType Type (second, minute, hour, day, week, month, year)
		 * returns {string} display name
		 * @public
		 * @since 1.34.0
		 */
		getDisplayName: function(sType) {

			jQuery.sap.assert(sType == "second" || sType == "minute" || sType == "hour" || sType == "day" || sType == "week" || sType == "month" || sType == "year", "sType must be second, minute, hour, day, week, month, year");
			return this._get("dateFields", sType, "displayName");

		},

		/**
		 * Returns the relative year resource pattern (like "This year", "Last year", "{0} year ago") based on the given
		 * difference of years (0 means this year, 1 means next year, -1 means last year, ...).
		 *
		 * @param {int} iDiff the difference in years
		 * @returns {string} the relative year resource pattern
		 * @public
		 * @since 1.25.0
		 */
		getRelativeYear : function(iDiff) {
			return this.getRelativePattern("year", iDiff);
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
		 * Returns array of eras
		 *
		 * @param {string} sWidth the style of the era name. It can be 'wide', 'abbreviated' or 'narrow'
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar
		 * @return {array} the array of eras
		 * @public
		 * @since 1.32.0
		 */
		getEras : function(sWidth, sCalendarType) {
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
		 * Returns the map of era ids to era dates
		 *
		 * @param {sap.ui.core.CalendarType} [sCalendarType] the type of calendar
		 * @return {array} the array of eras containing objects with either an _end or _start property with a date
		 * @public
		 * @since 1.32.0
		 */
		getEraDates : function(sCalendarType) {
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
					if (sCalendarName === getCLDRCalendarName(sType).substring(3)) {
						return sType;
					}
				}
			}

			return sap.ui.core.CalendarType.Gregorian;
		}

	});
	
	var mCLDRSymbolGroups = {
		"Era": { fieldName: "era", index: 0 },
		"Year": { fieldName: "year", index: 1 },
		"Quarter": { fieldName: "quarter", index: 2 },
		"Month": { fieldName: "month", index: 3 },
		"Week": { fieldName: "week", index: 4 },
		"Day-Of-Week": { fieldName: "weekday", index: 5 },
		"Day": { fieldName: "day", index: 6 },
		"Hour": { fieldName: "hour", index: 7 },
		"Minute": { fieldName: "minute", index: 8 },
		"Second": { fieldName: "second", index: 9 },
		"Timezone": { fieldName: "zone", index: 10 }
	};
	
	var mCLDRSymbols = {
		"G": "Era",
		"y": "Year",
		"Y": "Year",
		"Q": "Quarter",
		"q": "Quarter",
		"M": "Month",
		"L": "Month",
		"w": "Week",
		"W": "Week",
		"d": "Day",
		"D": "Day",
		"E": "Day-Of-Week",
		"e": "Day-Of-Week",
		"c": "Day-Of-Week",
		"h": "Hour",
		"H": "Hour",
		"k": "Hour",
		"K": "Hour",
		"m": "Minute",
		"s": "Second",
		"z": "Timezone",
		"Z": "Timezone",
		"O": "Timezone",
		"v": "Timezone",
		"V": "Timezone",
		"X": "Timezone",
		"x": "Timezone",
		"S": "Other",
		"u": "Other",
		"U": "Other",
		"r": "Other",
		"F": "Other",
		"g": "Other",
		"a": "Other",
		"b": "Other",
		"B": "Other",
		"A": "Other"
	};

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
						"intervalFormatFallback":"{0} – {1}"
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
				"year": {
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
				"month": {
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
				"week": {
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
				"day": {
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
				"hour": {
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
				"minute": {
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
				"second": {
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
		_get : function() {
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
