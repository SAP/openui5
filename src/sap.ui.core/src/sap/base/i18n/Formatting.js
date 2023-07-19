/*!
* ${copyright}
*/
sap.ui.define([
	"sap/base/assert",
	"sap/base/config",
	"sap/base/Log",
	"sap/base/Eventing",
	"sap/base/i18n/Localization",
	"sap/base/i18n/LanguageTag",
	"sap/base/i18n/date/CalendarType",
	"sap/base/i18n/date/CalendarWeekNumbering",
	"sap/base/util/deepEqual",
	"sap/base/util/extend",
	"sap/base/util/isEmptyObject"
], function(
	assert,
	BaseConfig,
	Log,
	Eventing,
	Localization,
	LanguageTag,
	CalendarType,
	CalendarWeekNumbering,
	deepEqual,
	extend,
	isEmptyObject
) {
	"use strict";

	var mChanges,
		mSettings = {};

	var M_ABAP_DATE_FORMAT_PATTERN = {
		"" : {pattern: null},
		"1": {pattern: "dd.MM.yyyy"},
		"2": {pattern: "MM/dd/yyyy"},
		"3": {pattern: "MM-dd-yyyy"},
		"4": {pattern: "yyyy.MM.dd"},
		"5": {pattern: "yyyy/MM/dd"},
		"6": {pattern: "yyyy-MM-dd"},
		"7": {pattern: "Gyy.MM.dd"},
		"8": {pattern: "Gyy/MM/dd"},
		"9": {pattern: "Gyy-MM-dd"},
		"A": {pattern: "yyyy/MM/dd"},
		"B": {pattern: "yyyy/MM/dd"},
		"C": {pattern: "yyyy/MM/dd"}
	};

	var M_ABAP_TIME_FORMAT_PATTERN = {
		"" : {"short": null,      medium:  null,        dayPeriods: null},
		"0": {"short": "HH:mm",   medium: "HH:mm:ss",   dayPeriods: null},
		"1": {"short": "hh:mm a", medium: "hh:mm:ss a", dayPeriods: ["AM", "PM"]},
		"2": {"short": "hh:mm a", medium: "hh:mm:ss a", dayPeriods: ["am", "pm"]},
		"3": {"short": "KK:mm a", medium: "KK:mm:ss a", dayPeriods: ["AM", "PM"]},
		"4": {"short": "KK:mm a", medium: "KK:mm:ss a", dayPeriods: ["am", "pm"]}
	};

	var M_ABAP_NUMBER_FORMAT_SYMBOLS = {
		"" : {groupingSeparator: null, decimalSeparator: null},
		" ": {groupingSeparator: ".", decimalSeparator: ","},
		"X": {groupingSeparator: ",", decimalSeparator: "."},
		"Y": {groupingSeparator: " ", decimalSeparator: ","}
	};

	function check(bCondition, sMessage) {
		if ( !bCondition ) {
			throw new Error(sMessage);
		}
	}

	/**
	 * Helper that creates a LanguageTag object from the given language
	 * or, throws an error for non BCP-47 compliant languages.
	 *
	 * @param {string} sLanguageTag A BCP-47 compliant language tag
	 * @return {sap.base.i18n.LanguageTag} The resulting LanguageTag
	 * @throws {TypeError} Throws a TypeError for unknown languages
	 * @private
	 */
	function createLanguageTag(sLanguageTag) {
		var oLanguageTag;
		if (sLanguageTag && typeof sLanguageTag === 'string') {
			try {
				oLanguageTag = new LanguageTag( sLanguageTag );
			} catch (e) {
				// ignore
			}
		}
		return oLanguageTag;
	}

	var oWritableConfig = BaseConfig.getWritableInstance();

	/**
	 * Configuration for formatting specific parameters
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @alias module:sap/base/i18n/Formatting
	 * @namespace
	 * @mixes module:sap/base/Eventing
	 * @borrows module:sap/base/Eventing#attachEvent as attachEvent
	 * @borrows module:sap/base/Eventing#attachEventOnce as attachEventOnce
	 * @borrows module:sap/base/Eventing#detachEvent as detachEvent
	 * @borrows module:sap/base/Eventing#fireEvent as fireEvent
	 * @borrows module:sap/base/Eventing#hasListeners as hasListeners
	 * @borrows module:sap/base/Eventing#getEventingParent as getEventingParent
	 * @borrows module:sap/base/Eventing#toString as toString
	 */
	var Formatting = {
		/**
		 * The <code>change</code> event is fired, when the configuration options are changed.
		 *
		 * @name module:sap/base/i18n/Formatting.change
		 * @event
		 * @private
		 * @ui5-restricted sap.ui.core
		 */

		/**
		 * Attaches the <code>fnFunction</code> event handler to the {@link #event:change change} event
		 * of <code>sap.base.i18n.Formatting</code>.
		 *
		 * @param {function} fnFunction
		 *   The function to be called when the event occurs
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		attachChange: function(fnFunction) {
			Formatting.attachEvent("change", fnFunction);
		},

		/**
		 * Detaches event handler <code>fnFunction</code> from the {@link #event:change change} event of
		 * this <code>sap.base.i18n.Formatting</code>.
		 *
		 * @param {function} fnFunction Function to be called when the event occurs
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		detachChange: function(fnFunction) {
			Formatting.detachEvent("change", fnFunction);
		},

		/**
		 * Returns the LanguageTag to be used for formatting.
		 *
		 * If no such LanguageTag has been defined, this method falls back to the language,
		 * see {@link module:sap/base/i18n/Localization.getLanguage Localization.getLanguage()}.
		 *
		 * If any user preferences for date, time or number formatting have been set,
		 * and if no format LanguageTag has been specified, then a special private use subtag
		 * is added to the LanguageTag, indicating to the framework that these user preferences
		 * should be applied.
		 *
		 * @return {sap.base.i18n.LanguageTag} the format LanguageTag
		 * @public
		 */
		getLanguageTag : function() {
			function fallback(oFormatSettings) {
				var oLanguageTag = new LanguageTag(Localization.getLanguage());
				// if any user settings have been defined, add the private use subtag "sapufmt"
				if (!isEmptyObject(mSettings)
						|| oFormatSettings.getCalendarWeekNumbering() !== CalendarWeekNumbering.Default) {
					var l = oLanguageTag.toString();
					if ( l.indexOf("-x-") < 0 ) {
						l = l + "-x-sapufmt";
					} else if ( l.indexOf("-sapufmt") <= l.indexOf("-x-") ) {
						l = l + "-sapufmt";
					}
					oLanguageTag = new LanguageTag(l);
				}
				return oLanguageTag;
			}
			return oWritableConfig.get({
				name: "sapUiFormatLocale",
				type: function(sFormatLocale) {return new LanguageTag(sFormatLocale);},
				defaultValue: fallback.bind(Formatting, this),
				external: true
			});
		},

		/**
		 * Sets a new language tag to be used from now on for retrieving language
		 * specific formatters. Modifying this setting does not have an impact on
		 * the retrieval of translated texts!
		 *
		 * Can either be set to a concrete value (a BCP47 or Java locale compliant
		 * language tag) or to <code>null</code>. When set to <code>null</code> (default
		 * value) then locale specific formatters are retrieved for the current language.
		 *
		 * After changing the format locale, the framework tries to update localization
		 * specific parts of the UI. See the documentation of
		 * {@link module:sap/base/i18n/Localization.getLanguage Localization.getLanguage()}
		 * for details and restrictions.
		 *
		 * <b>Note</b>: When a language tag is set, it has higher priority than a number,
		 * date or time format defined with a call to <code>setLegacyNumberFormat</code>,
		 * <code>setLegacyDateFormat</code> or <code>setLegacyTimeFormat</code>.
		 *
		 * <b>Note</b>: See documentation of
		 * {@link module:sap/base/i18n/Localization.getLanguage Localization.getLanguage()}
		 * for restrictions.
		 *
		 * @param {string|null} sLanguageTag the new BCP47 compliant language tag;
		 *   case doesn't matter and underscores can be used instead of dashes to separate
		 *   components (compatibility with Java Locale IDs)
		 * @return {this} <code>this</code> to allow method chaining
		 * @public
		 * @throws {Error} When <code>sLanguageTag</code> is given, but is not a valid BCP47 language
		 *   tag or Java locale identifier
		 */
		setLanguageTag : function(sLanguageTag) {
			var oLanguageTag = createLanguageTag(sLanguageTag);
			check(sLanguageTag == null || typeof sLanguageTag === "string" && oLanguageTag, "sLanguageTag must be a BCP47 language tag or Java Locale id or null");
			sLanguageTag = sLanguageTag === null ? undefined : sLanguageTag;
			var oOldLanguageTag = Formatting.getLanguageTag();
			oWritableConfig.set("sapUiFormatLocale", sLanguageTag);
			var oCurrentLanguageTag = Formatting.getLanguageTag();
			if (oOldLanguageTag.toString() !== oCurrentLanguageTag.toString()) {
				var bFireEvent = !mChanges;
				mChanges = mChanges || {};
				mChanges.languageTag = oCurrentLanguageTag.toString();
				if (bFireEvent) {
					fireChange();
				}
			}
			return this;
		},

		_set : function(sKey, oValue) {
			BaseConfig._.invalidate();
			var oOldValue = mSettings[sKey];
			if ( oValue != null ) {
				mSettings[sKey] = oValue;
			} else {
				delete mSettings[sKey];
			}
			// report a change only if old and new value differ (null/undefined are treated as the same value)
			if ( (oOldValue != null || oValue != null) && !deepEqual(oOldValue, oValue) ) {
				var bFireEvent = !mChanges;
				mChanges = mChanges || {};
				mChanges[sKey] = oValue;
				if (bFireEvent) {
					fireChange();
				}
			}
		},

		/**
		 * Retrieves the custom units.
		 * These custom units are set by {@link #setCustomUnits} and {@link #addCustomUnits}
		 * @return {object} custom units object
		 * @see #setCustomUnits
		 * @see #addCustomUnits
		 */
		getCustomUnits: function () {
			return mSettings["units"] ? mSettings["units"]["short"] : undefined;
		},

		/**
		 * Sets custom units which can be used to do Unit Formatting.
		 *
		 * The custom unit object consists of:
		 * * a custom unit key which can then be referenced to use this unit.
		 * * <code>displayName</code> which represents the name of the unit.
		 * * <code>unitPattern-count-&lt;pluralName&gt;</code> which represents the plural category of the locale for the given value.
		 * The plural category is defined within the locale, e.g. in the 'en' locale:
		 * <code>unitPattern-count-one</code> for <code>1</code>,
		 * <code>unitPattern-count-zero</code> for <code>0</code>,
		 * <code>unitPattern-count-other</code> for all the res
		 * To retrieve all plural categories defined for a locale use <code>sap.ui.core.LocaleData.prototype.getPluralCategories</code>.
		 *
		 * A Sample custom unit definition could look like this:
		 * <code>
		 * {
		 *  "BAG": {
		 *      "displayName": "Bag",
		 *		"unitPattern-count-one": "{0} bag",
		 *		"unitPattern-count-other": "{0} bags"
		 *  }
		 * }
		 * </code>
		 * In the above snippet:
		 * * <code>"BAG"</code> represent the unit key which is used to reference it.
		 * * <code>"unitPattern-count-one"</code> represent the unit pattern for the form "one", e.g. the number <code>1</code> in the 'en' locale.
		 * * <code>"unitPattern-count-other"</code> represent the unit pattern for all other numbers which do not
		 *   match the plural forms of the previous patterns.
		 * * In the patterns <code>{0}</code> is replaced by the number
		 *
		 * E.g. In locale 'en' value <code>1</code> would result in <code>1 Bag</code>, while <code>2</code> would result in <code>2 Bags</code>
		 * @param {object} mUnits custom unit object which replaces the current custom unit definition. Call with <code>null</code> to delete custom units.
		 * @returns {this} The config for chaining
		 * @private
		 */
		setCustomUnits: function (mUnits) {
			// add custom units, or remove the existing ones if none are given
			var mUnitsshort = null;
			if (mUnits) {
				mUnitsshort = {
					"short": mUnits
				};
			}
			Formatting._set("units", mUnitsshort);
			return this;
		},

		/**
		 * Adds custom units.
		 * Similar to {@link #setCustomUnits} but instead of setting the custom units, it will add additional ones.
		 * @param {object} mUnits custom unit object which replaces the current custom unit definition. Call with <code>null</code> to delete custom units.
		 * @returns {this} The config for chaining
		 * @see #setCustomUnits
		 * @private
		 */
		addCustomUnits: function (mUnits) {
			// add custom units, or remove the existing ones if none are given
			var mExistingUnits = Formatting.getCustomUnits();
			if (mExistingUnits){
				mUnits = extend({}, mExistingUnits, mUnits);
			}
			Formatting.setCustomUnits(mUnits);
			return this;
		},

		/**
		 * Sets custom unit mappings.
		 * Unit mappings contain key value pairs (both strings)
		 * * {string} key: a new entry which maps to an existing unit key
		 * * {string} value: an existing unit key
		 *
		 * Example:
		 * <code>
		 * {
		 *  "my": "my-custom-unit",
		 *  "cm": "length-centimeter"
		 * }
		 * </code>
		 * Note: It is possible to create multiple entries per unit key.
		 * Call with <code>null</code> to delete unit mappings.
		 * @param {object} mUnitMappings unit mappings
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 */
		setUnitMappings: function (mUnitMappings) {
			Formatting._set("unitMappings", mUnitMappings);
			return this;
		},

		/**
		 * Adds unit mappings.
		 * Similar to {@link #setUnitMappings} but instead of setting the unit mappings, it will add additional ones.
		 * @param {object} mUnitMappings unit mappings
		 * @returns {this} The config for chaining
		 * @see #setUnitMappings
		 * @private
		 */
		addUnitMappings: function (mUnitMappings) {
			// add custom units, or remove the existing ones if none are given
			var mExistingUnits = Formatting.getUnitMappings();
			if (mExistingUnits){
				mUnitMappings = extend({}, mExistingUnits, mUnitMappings);
			}
			Formatting.setUnitMappings(mUnitMappings);
			return this;
		},

		/**
		 * Retrieves the unit mappings.
		 * These unit mappings are set by {@link #setUnitMappings} and {@link #addUnitMappings}
		 * @returns {object} unit mapping object
		 * @see #setUnitMappings
		 * @see #addUnitMappings
		 */
		getUnitMappings: function () {
			return mSettings["unitMappings"];
		},

		/**
		 * Returns the currently set date pattern or undefined if no pattern has been defined.
		 * @param {string} sStyle The date style (short, medium, long or full)
		 * @return {string} The resulting date pattern
		 * @public
		 */
		getDatePattern : function(sStyle) {
			assert(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			return mSettings["dateFormats-" + sStyle];
		},

		/**
		 * Defines the preferred format pattern for the given date format style.
		 *
		 * Calling this method with a null or undefined pattern removes a previously set pattern.
		 *
		 * If a pattern is defined, it will be preferred over patterns derived from the current locale.
		 *
		 * See class {@link sap.ui.core.format.DateFormat} for details about the pattern syntax.
		 *
		 * After changing the date pattern, the framework tries to update localization
		 * specific parts of the UI. See the documentation of {@link module:sap/base/i18n/Localization.getLanguage Localization.getLanguage()}
		 * for details and restrictions.
		 *
		 * @param {string} sStyle must be one of short, medium, long or full.
		 * @param {string} sPattern the format pattern to be used in LDML syntax.
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 */
		setDatePattern : function(sStyle, sPattern) {
			check(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			Formatting._set("dateFormats-" + sStyle, sPattern);
			return this;
		},

		/**
		 * Returns the currently set time pattern or undefined if no pattern has been defined.
		 * @param {string} sStyle The time style (short, medium, long or full)
		 * @return {string} The resulting time pattern
		 * @public
		 */
		getTimePattern : function(sStyle) {
			assert(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			return mSettings["timeFormats-" + sStyle];
		},

		/**
		 * Defines the preferred format pattern for the given time format style.
		 *
		 * Calling this method with a null or undefined pattern removes a previously set pattern.
		 *
		 * If a pattern is defined, it will be preferred over patterns derived from the current locale.
		 *
		 * See class {@link sap.ui.core.format.DateFormat} for details about the pattern syntax.
		 *
		 * After changing the time pattern, the framework tries to update localization
		 * specific parts of the UI. See the documentation of
		 * {@link module:sap/base/i18n/Localization.getLanguage Localization.getLanguage()}
		 * for details and restrictions.
		 *
		 * @param {string} sStyle must be one of short, medium, long or full.
		 * @param {string} sPattern the format pattern to be used in LDML syntax.
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 */
		setTimePattern : function(sStyle, sPattern) {
			check(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			Formatting._set("timeFormats-" + sStyle, sPattern);
			return this;
		},

		/**
		 * Returns the currently set number symbol of the given type or undefined if no symbol has been defined.
		 *
		 * @param {"group"|"decimal"|"plusSign"|"minusSign"} sType the type of symbol
		 * @return {string} A non-numerical symbol used as part of a number for the given type,
		 *   e.g. for locale de_DE:
		 *     <ul>
		 *       <li>"group": "." (grouping separator)</li>
		 *       <li>"decimal": "," (decimal separator)</li>
		 *       <li>"plusSign": "+" (plus sign)</li>
		 *       <li>"minusSign": "-" (minus sign)</li>
		 *     </ul>
		 * @public
		 */
		getNumberSymbol : function(sType) {
			assert(["group", "decimal", "plusSign", "minusSign"].includes(sType), "sType must be decimal, group, plusSign or minusSign");
			return mSettings["symbols-latn-" + sType];
		},

		/**
		 * Defines the string to be used for the given number symbol.
		 *
		 * Calling this method with a null or undefined symbol removes a previously set symbol string.
		 * Note that an empty string is explicitly allowed.
		 *
		 * If a symbol is defined, it will be preferred over symbols derived from the current locale.
		 *
		 * See class {@link sap.ui.core.format.NumberFormat} for details about the symbols.
		 *
		 * After changing the number symbol, the framework tries to update localization
		 * specific parts of the UI. See the documentation of
		 * {@link module:sap/base/i18n/Localization.getLanguage Localization.getLanguage()}
		 * for details and restrictions.
		 *
		 * @param {"group"|"decimal"|"plusSign"|"minusSign"} sType the type of symbol
		 * @param {string} sSymbol will be used to represent the given symbol type
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 */
		setNumberSymbol : function(sType, sSymbol) {
			check(["group", "decimal", "plusSign", "minusSign"].includes(sType), "sType must be decimal, group, plusSign or minusSign");
			Formatting._set("symbols-latn-" + sType, sSymbol);
			return this;
		},

		/**
		 * Retrieves the custom currencies.
		 * E.g.
		 * <code>
		 * {
		 *  "KWD": {"digits": 3},
		 *  "TND" : {"digits": 3}
		 * }
		 * </code>
		 * @public
		 * @returns {object} the mapping between custom currencies and its digits
		 */
		getCustomCurrencies : function() {
			return mSettings["currency"];
		},

		/**
		 * Sets custom currencies and replaces existing entries.
		 *
		 * There is a special currency code named "DEFAULT" that is optional.
		 * In case it is set it will be used for all currencies not contained
		 * in the list, otherwise currency digits as defined by the CLDR will
		 * be used as a fallback.
		 *
		 * Example:
		 * To use CLDR, but override single currencies
		 * <code>
		 * {
		 *  "KWD": {"digits": 3},
		 *  "TND" : {"digits": 3}
		 * }
		 * </code>
		 *
		 * To replace the CLDR currency digits completely
		 * <code>
		 * {
		 *   "DEFAULT": {"digits": 2},
		 *   "ADP": {"digits": 0},
		 *   ...
		 *   "XPF": {"digits": 0}
		 * }
		 * </code>
		 *
		 * Note: To unset the custom currencies: call with <code>undefined</code>
		 * Custom currencies must not only consist of digits but contain at least one non-digit character, e.g. "a",
		 * so that the measure part can be distinguished from the number part.
		 * @public
		 * @param {object} mCurrencies currency map which is set
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 */
		setCustomCurrencies : function(mCurrencies) {
			check(typeof mCurrencies === "object" || mCurrencies == null, "mCurrencyDigits must be an object");
			Object.keys(mCurrencies || {}).forEach(function(sCurrencyDigit) {
				check(typeof sCurrencyDigit === "string");
				check(typeof mCurrencies[sCurrencyDigit] === "object");
			});
			Formatting._set("currency", mCurrencies);
			return this;
		},

		/**
		 * Adds custom currencies to the existing entries.
		 * E.g.
		 * <code>
		 * {
		 *  "KWD": {"digits": 3},
		 *  "TND" : {"digits": 3}
		 * }
		 * </code>
		 *
		 * @public
		 * @param {object} mCurrencies adds to the currency map
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @see #setCustomCurrencies
		 */
		addCustomCurrencies: function (mCurrencies) {
			// add custom units, or remove the existing ones if none are given
			var mExistingCurrencies = Formatting.getCustomCurrencies();
			if (mExistingCurrencies){
				mCurrencies = extend({}, mExistingCurrencies, mCurrencies);
			}
			Formatting.setCustomCurrencies(mCurrencies);
			return this;
		},

		_setDayPeriods : function(sWidth, aTexts) {
			assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			Formatting._set("dayPeriods-format-" + sWidth, aTexts);
			return this;
		},

		/**
		 * Returns the currently set legacy ABAP date format (its id) or undefined if none has been set.
		 *
		 * @return {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"A"|"B"|"C"|undefined} ID of the ABAP date format,
		 *   if not set or set to <code>""</code>, <code>undefined</code> will be returned
		 * @public
		 */
		getLegacyDateFormat : function() {
			var sLegacyDateFormat = oWritableConfig.get({
				name: "sapUiLegacyDateFormat",
				type: BaseConfig.Type.String,
				external: true
			});
			return sLegacyDateFormat ? sLegacyDateFormat.toUpperCase() : undefined;
		},

		/**
		 * Allows to specify one of the legacy ABAP date formats.
		 *
		 * This method modifies the date patterns for 'short' and 'medium' style with the corresponding ABAP
		 * format. When called with a null or undefined format id, any previously applied format will be removed.
		 *
		 * After changing the legacy date format, the framework tries to update localization
		 * specific parts of the UI. See the documentation of
		 * {@link module:sap/base/i18n/Localization.getLanguage Localization.getLanguage()}
		 * for details and restrictions.
		 *
		 * @param {""|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"A"|"B"|"C"} [sFormatId=""] ID of the ABAP date format,
		 *   <code>""</code> will reset the date patterns for 'short' and 'medium' style to the
		 *   locale-specific ones.
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 */
		setLegacyDateFormat : function(sFormatId) {
			sFormatId = sFormatId ? String(sFormatId).toUpperCase() : "";
			check(M_ABAP_DATE_FORMAT_PATTERN.hasOwnProperty(sFormatId), "sFormatId must be one of ['1','2','3','4','5','6','7','8','9','A','B','C'] or empty");
			var bFireEvent = !mChanges;
			var sOldFormat = Formatting.getLegacyDateFormat();
			if (sOldFormat !== sFormatId) {
				mChanges = mChanges || {};
				oWritableConfig.set("sapUiLegacyDateFormat", sFormatId);
				mChanges.legacyDateFormat = sFormatId;
				Formatting.setDatePattern("short", M_ABAP_DATE_FORMAT_PATTERN[sFormatId].pattern);
				Formatting.setDatePattern("medium", M_ABAP_DATE_FORMAT_PATTERN[sFormatId].pattern);
				if (bFireEvent) {
					fireChange();
				}
			}
			return this;
		},

		/**
		 * Returns the currently set legacy ABAP time format (its id) or undefined if none has been set.
		 *
		 * @return {"0"|"1"|"2"|"3"|"4"|undefined} ID of the ABAP date format,
		 *   if not set or set to <code>""</code>, <code>undefined</code> will be returned
		 * @public
		 */
		getLegacyTimeFormat : function() {
			var sLegacyTimeFormat = oWritableConfig.get({
				name: "sapUiLegacyTimeFormat",
				type: BaseConfig.Type.String,
				external: true
			});
			return sLegacyTimeFormat ? sLegacyTimeFormat.toUpperCase() : undefined;
		},

		/**
		 * Allows to specify one of the legacy ABAP time formats.
		 *
		 * This method sets the time patterns for 'short' and 'medium' style to the corresponding ABAP
		 * formats and sets the day period texts to "AM"/"PM" or "am"/"pm" respectively. When called
		 * with a null or undefined format id, any previously applied format will be removed.
		 *
		 * After changing the legacy time format, the framework tries to update localization
		 * specific parts of the UI. See the documentation of
		 * {@link module:sap/base/i18n/Localization.getLanguage Localization.getLanguage()}
		 * for details and restrictions.
		 *
		 * @param {""|"0"|"1"|"2"|"3"|"4"} [sFormatId=""] ID of the ABAP time format,
		 *   <code>""</code> will reset the time patterns for 'short' and 'medium' style and the day
		 *   period texts to the locale-specific ones.
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 */
		setLegacyTimeFormat : function(sFormatId) {
			sFormatId = sFormatId || "";
			check(M_ABAP_TIME_FORMAT_PATTERN.hasOwnProperty(sFormatId), "sFormatId must be one of ['0','1','2','3','4'] or empty");
			var bFireEvent = !mChanges;
			var sOldFormat = Formatting.getLegacyTimeFormat();
			if (sOldFormat !== sFormatId) {
				mChanges = mChanges || {};
				oWritableConfig.set("sapUiLegacyTimeFormat", sFormatId);
				mChanges.legacyTimeFormat = sFormatId;
				Formatting.setTimePattern("short", M_ABAP_TIME_FORMAT_PATTERN[sFormatId]["short"]);
				Formatting.setTimePattern("medium", M_ABAP_TIME_FORMAT_PATTERN[sFormatId]["medium"]);
				Formatting._setDayPeriods("abbreviated", M_ABAP_TIME_FORMAT_PATTERN[sFormatId].dayPeriods);
				if (bFireEvent) {
					fireChange();
				}
			}
			return this;
		},

		/**
		 * Returns the currently set legacy ABAP number format (its id) or undefined if none has been set.
		 *
		 * @return {" "|"X"|"Y"|undefined} ID of the ABAP number format,
		 *   if not set or set to <code>""</code>, <code>undefined</code> will be returned
		 * @public
		 */
		getLegacyNumberFormat : function() {
			var sLegacyNumberFormat = oWritableConfig.get({
				name: "sapUiLegacyNumberFormat",
				type: BaseConfig.Type.String,
				external: true
			});
			return sLegacyNumberFormat ? sLegacyNumberFormat.toUpperCase() : undefined;
		},

		/**
		 * Allows to specify one of the legacy ABAP number format.
		 *
		 * This method will modify the 'group' and 'decimal' symbols. When called with a null
		 * or undefined format id, any previously applied format will be removed.
		 *
		 * After changing the legacy number format, the framework tries to update localization
		 * specific parts of the UI. See the documentation of
		 * {@link module:sap/base/i18n/Localization.getLanguage Localization.getLanguage()}
		 * for details and restrictions.
		 *
		 * @param {""|" "|"X"|"Y"} [sFormatId=""] ID of the ABAP number format set,
		 *   <code>""</code> will reset the 'group' and 'decimal' symbols to the locale-specific
		 *   ones.
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 */
		setLegacyNumberFormat : function(sFormatId) {
			sFormatId = sFormatId ? sFormatId.toUpperCase() : "";
			check(M_ABAP_NUMBER_FORMAT_SYMBOLS.hasOwnProperty(sFormatId), "sFormatId must be one of [' ','X','Y'] or empty");
			var bFireEvent = !mChanges;
			var sOldFormat = Formatting.getLegacyNumberFormat();
			if (sOldFormat !== sFormatId) {
				mChanges = mChanges || {};
				oWritableConfig.set("sapUiLegacyNumberFormat", sFormatId);
				mChanges.legacyNumberFormat = sFormatId;
				Formatting.setNumberSymbol("group", M_ABAP_NUMBER_FORMAT_SYMBOLS[sFormatId].groupingSeparator);
				Formatting.setNumberSymbol("decimal", M_ABAP_NUMBER_FORMAT_SYMBOLS[sFormatId].decimalSeparator);
				if (bFireEvent) {
					fireChange();
				}
			}
			return this;
		},

		/**
		 * Allows to specify the customizing data for Islamic calendar support
		 *
		 * @param {object[]} aMappings contains the customizing data for the support of Islamic calendar.
		 * @param {string} aMappings[].dateFormat The date format
		 * @param {string} aMappings[].islamicMonthStart The Islamic date
		 * @param {string} aMappings[].gregDate The corresponding Gregorian date
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 */
		setLegacyDateCalendarCustomizing : function(aMappings) {
			check(Array.isArray(aMappings), "aMappings must be an Array");
			var bFireEvent = !mChanges;
			mChanges = mChanges || {};
			Formatting.aLegacyDateCalendarCustomizing = mChanges.legacyDateCalendarCustomizing = aMappings.slice();
			if (bFireEvent) {
				fireChange();
			}
			return this;
		},

		/**
		 * Returns the currently set customizing data for Islamic calendar support
		 *
		 * @return {object[]} Returns an array contains the customizing data. Each element in the array has properties: dateFormat, islamicMonthStart, gregDate. For details, please see {@link #setLegacyDateCalendarCustomizing}
		 * @public
		 */
		getLegacyDateCalendarCustomizing : function() {
			var aLegacyDateCalendarCustomizing = Formatting.aLegacyDateCalendarCustomizing;
			if (aLegacyDateCalendarCustomizing) {
				aLegacyDateCalendarCustomizing = aLegacyDateCalendarCustomizing.slice();
			}
			return aLegacyDateCalendarCustomizing;
		},

		/**
		 * Define whether the NumberFormatter shall always place the currency code after the numeric value, with
		 * the only exception of right-to-left locales, where the currency code shall be placed before the numeric value.
		 * Default configuration setting is <code>true</code>.
		 *
		 * When set to <code>false</code> the placement of the currency code is done dynamically, depending on the
		 * configured locale using data provided by the Unicode Common Locale Data Repository (CLDR).
		 *
		 * Each currency instance ({@link sap.ui.core.format.NumberFormat.getCurrencyInstance}) will be created
		 * with this setting unless overwritten on instance level.
		 *
		 * @param {boolean} bTrailingCurrencyCode Whether currency codes shall always be placed after the numeric value
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @since 1.75.0
		 * @public
		 */
		setTrailingCurrencyCode : function(bTrailingCurrencyCode) {
			check(typeof bTrailingCurrencyCode === "boolean", "bTrailingCurrencyCode must be a boolean");
			oWritableConfig.set("sapUiTrailingCurrencyCode", bTrailingCurrencyCode);
			return this;
		},

		/**
		 * Returns current trailingCurrencyCode configuration for new NumberFormatter instances
		 *
		 * @return {boolean} Whether currency codes shall always be placed after the numeric value
		 * @since 1.75.0
		 * @public
		 */
		getTrailingCurrencyCode : function() {
			return oWritableConfig.get({
				name: "sapUiTrailingCurrencyCode",
				type: BaseConfig.Type.Boolean,
				defaultValue: true,
				external: true
			});
		},

		/**
		 * Returns a live object with the current settings
		 * TODO this method is part of the facade to be accessible from LocaleData, but it shouldn't be
		 *
		 * @return {mSettings} The custom LocaleData settings object
		 * @private
		 */
		getCustomLocaleData : function() {
			return mSettings;
		},

		/**
		 * Returns the calendar week numbering algorithm used to determine the first day of the week
		 * and the first calendar week of the year, see {@link sap.base.i18n.CalendarWeekNumbering}.
		 *
		 * @returns {sap.base.i18n.CalendarWeekNumbering} The calendar week numbering algorithm
		 *
		 * @public
		 * @since 1.113.0
		 */
		getCalendarWeekNumbering: function() {
			var oCalendarWeekNumbering = CalendarWeekNumbering.Default;

			try {
				oCalendarWeekNumbering = oWritableConfig.get({
					name: "sapUiCalendarWeekNumbering",
					type: CalendarWeekNumbering,
					defaultValue: CalendarWeekNumbering.Default,
					external: true
				});
			} catch  (err) {
				//nothing to do, return default;
			}
			return oCalendarWeekNumbering;
		},

		/**
		 * Sets the calendar week numbering algorithm which is used to determine the first day of the week
		 * and the first calendar week of the year, see {@link sap.base.i18n.CalendarWeekNumbering}.
		 *
		 * @param {sap.base.i18n.CalendarWeekNumbering} sCalendarWeekNumbering
		 *   The calendar week numbering algorithm
		 * @returns {this}
		 *   <code>this</code> to allow method chaining
		 * @throws {Error}
		 *   If <code>sCalendarWeekNumbering</code> is not a valid calendar week numbering algorithm,
		 *   defined in {@link sap.base.i18n.CalendarWeekNumbering}
		 *
		 * @public
		 * @since 1.113.0
		 */
		setCalendarWeekNumbering: function(sCalendarWeekNumbering) {
			BaseConfig._.checkEnum(CalendarWeekNumbering, sCalendarWeekNumbering, "calendarWeekNumbering");
			var sCurrentWeekNumbering = oWritableConfig.get({
				name: "sapUiCalendarWeekNumbering",
				type: CalendarWeekNumbering,
				defaultValue: CalendarWeekNumbering.Default,
				external: true
			});
			if (sCurrentWeekNumbering !== sCalendarWeekNumbering) {
				var bFireEvent = !mChanges;
				mChanges = mChanges || {};
				oWritableConfig.set("sapUiCalendarWeekNumbering", sCalendarWeekNumbering);
				mChanges.calendarWeekNumbering = sCalendarWeekNumbering;
				if (bFireEvent) {
					fireChange();
				}
			}
			return this;
		},

		/**
		 * Returns the calendar type which is being used in locale dependent functionality.
		 *
		 * When it's explicitly set by calling <code>setCalendar</code>, the set calendar type is returned.
		 * Otherwise, the calendar type is determined by checking the format settings and current locale.
		 *
		 * @return {sap.base.i18n.CalendarType} the current calendar type, e.g. <code>Gregorian</code>
		 * @since 1.28.6
		 */
		getCalendarType: function() {
			var sName,
				sCalendarType = oWritableConfig.get({
					name: "sapUiCalendarType",
					type: BaseConfig.Type.String,
					external: true
				});

			sCalendarType = sCalendarType || null;

			if (sCalendarType) {
				for (sName in CalendarType) {
					if (sName.toLowerCase() === sCalendarType.toLowerCase()) {
						return sName;
					}
				}
				Log.warning("Parameter 'calendarType' is set to " + sCalendarType + " which isn't a valid value and therefore ignored. The calendar type is determined from format setting and current locale");
			}

			var sLegacyDateFormat = Formatting.getLegacyDateFormat();

			switch (sLegacyDateFormat) {
				case "1":
				case "2":
				case "3":
				case "4":
				case "5":
				case "6":
					return CalendarType.Gregorian;
				case "7":
				case "8":
				case "9":
					return CalendarType.Japanese;
				case "A":
				case "B":
					return CalendarType.Islamic;
				case "C":
					return CalendarType.Persian;
				default:
					return Localization.getPreferredCalendarType();
			}
		},

		/**
		 * Sets the new calendar type to be used from now on in locale dependent functionality (for example,
		 * formatting, translation texts, etc.).
		 *
		 * @param {sap.base.i18n.CalendarType|null} sCalendarType the new calendar type. Set it with null to clear the calendar type
		 *   and the calendar type is calculated based on the format settings and current locale.
		 * @return {this} <code>this</code> to allow method chaining
		 * @public
		 * @since 1.28.6
		 */
		setCalendarType : function(sCalendarType) {
			var sOldCalendarType = Formatting.getCalendarType();
			oWritableConfig.set("sapUiCalendarType", sCalendarType);
			var sCurrentCalendarType = Formatting.getCalendarType();
			if (sOldCalendarType !== sCurrentCalendarType) {
				var bFireEvent = !mChanges;
				mChanges = mChanges || {};
				mChanges.calendarType = sCurrentCalendarType;
				if (bFireEvent) {
					fireChange();
				}
			}
			return this;
		}
	};

	function fireChange() {
		Formatting.fireEvent("change", mChanges);
		mChanges = undefined;
	}

	function init() {
		// init legacy formats
		var sLegacyDateFormat = Formatting.getLegacyDateFormat();
		if (sLegacyDateFormat !== undefined) {
			Formatting.setLegacyDateFormat(sLegacyDateFormat);
		}
		var sLegacyNumberFormat = Formatting.getLegacyNumberFormat();
		if (sLegacyNumberFormat !== undefined) {
			Formatting.setLegacyNumberFormat(sLegacyNumberFormat);
		}
		var sLegacyTimeFormat = Formatting.getLegacyTimeFormat();
		if (sLegacyTimeFormat !== undefined) {
			Formatting.setLegacyTimeFormat(sLegacyTimeFormat);
		}
	}

	Eventing.apply(Formatting);

	init();

	return Formatting;
});
