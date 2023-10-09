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
], (
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
) => {
	"use strict";

	const oEventing = new Eventing();
	const mSettings = {};
	let mChanges;

	const M_ABAP_DATE_FORMAT_PATTERN = {
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

	const M_ABAP_TIME_FORMAT_PATTERN = {
		"" : {"short": null,      medium:  null,        dayPeriods: null},
		"0": {"short": "HH:mm",   medium: "HH:mm:ss",   dayPeriods: null},
		"1": {"short": "hh:mm a", medium: "hh:mm:ss a", dayPeriods: ["AM", "PM"]},
		"2": {"short": "hh:mm a", medium: "hh:mm:ss a", dayPeriods: ["am", "pm"]},
		"3": {"short": "KK:mm a", medium: "KK:mm:ss a", dayPeriods: ["AM", "PM"]},
		"4": {"short": "KK:mm a", medium: "KK:mm:ss a", dayPeriods: ["am", "pm"]}
	};

	const M_ABAP_NUMBER_FORMAT_SYMBOLS = {
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
	 * @returns {module:sap/base/i18n/LanguageTag} The resulting LanguageTag
	 * @private
	 * @since 1.116.0
	 */
	function createLanguageTag(sLanguageTag) {
		let oLanguageTag;
		if (sLanguageTag && typeof sLanguageTag === 'string') {
			try {
				oLanguageTag = new LanguageTag( sLanguageTag );
			} catch (e) {
				// ignore
			}
		}
		return oLanguageTag;
	}

	const oWritableConfig = BaseConfig.getWritableInstance();

	/**
	 * Configuration for formatting specific parameters
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @alias module:sap/base/i18n/Formatting
	 * @namespace
	 * @since 1.116.0
	 */
	const Formatting = {
		/**
		 * The <code>change</code> event is fired, when the configuration options are changed.
		 * For the event parameters please refer to {@link module:sap/base/i18n/Formatting$ChangeEvent}.
		 *
		 * @name module:sap/base/i18n/Formatting.change
		 * @event
		 * @param {module:sap/base/i18n/Formatting$ChangeEvent} oEvent
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.116.0
		 */

		/**
		 * The formatting change event. Contains only the parameters which were changed.
		 *
		 * The list below shows the possible combinations of parameters available as part of the change event.
		 *
		 * <ul>
		 * <li>{@link module:sap/base/i18n/Formatting.setLanguageTag Formatting.setLanguageTag}:
		 * <ul>
		 * <li><code>languageTag</code></li>
		 * </ul>
		 * </li>
		 * <li>{@link module:sap/base/i18n/Formatting.setLegacyDateCalendarCustomizing Formatting.setLegacyDateCalendarCustomizing}:
		 * <ul>
		 * <li><code>legacyDateCalendarCustomizing</code></li>
		 * </ul>
		 * </li>
		 * <li>{@link module:sap/base/i18n/Formatting.setCalendarWeekNumbering Formatting.setCalendarWeekNumbering}:
		 * <ul>
		 * <li><code>calendarWeekNumbering</code></li>
		 * </ul>
		 * </li>
		 * <li>{@link module:sap/base/i18n/Formatting.setCalendarType Formatting.setCalendarType}:
		 * <ul>
		 * <li><code>calendarType</code></li>
		 * </ul>
		 * </li>
		 * <li>{@link module:sap/base/i18n/Formatting.addCustomCurrencies Formatting.addCustomCurrencies} / {@link module:sap/base/i18n/Formatting.setCustomCurrencies Formatting.setCustomCurrencies}:
		 * <ul>
		 * <li><code>currency</code></li>
		 * </ul>
		 * </li>
		 * <li>{@link module:sap/base/i18n/Formatting.setLegacyDateFormat Formatting.setLegacyDateFormat} (all parameters listed below):
		 * <ul>
		 * <li><code>legacyDateFormat</code></li>
		 * <li><code>"dateFormats-short"</code></li>
		 * <li><code>"dateFormats-medium"</code></li>
		 * </ul>
		 * </li>
		 * <li>{@link module:sap/base/i18n/Formatting.setLegacyTimeFormat Formatting.setLegacyTimeFormat} (all parameters listed below):
		 * <ul>
		 * <li><code>legacyTimeFormat</code></li>
		 * <li><code>"timeFormats-short"</code></li>
		 * <li><code>"timeFormats-medium"</code></li>
		 * <li><code>"dayPeriods-format-abbreviated"</code></li>
		 * </ul>
		 * </li>
		 * <li>{@link module:sap/base/i18n/Formatting.setLegacyNumberFormat Formatting.setLegacyNumberFormat} (all parameters listed below):
		 * <ul>
		 * <li><code>legacyNumberFormat</code></li>
		 * <li><code>"symbols-latn-group"</code></li>
		 * <li><code>"symbols-latn-decimal"</code></li>
		 * </ul>
		 * </li>
		 * <li>{@link module:sap/base/i18n/Formatting.setDatePattern Formatting.setDatePattern} (one of the parameters listed below):
		 * <ul>
		 * <li><code>"dateFormats-short"</code></li>
		 * <li><code>"dateFormats-medium"</code></li>
		 * <li><code>"dateFormats-long"</code></li>
		 * <li><code>"dateFormats-full"</code></li>
		 * </ul>
		 * </li>
		 * <li>{@link module:sap/base/i18n/Formatting.setTimePattern Formatting.setTimePattern} (one of the parameters listed below):
		 * <ul>
		 * <li><code>"timeFormats-short"</code></li>
		 * <li><code>"timeFormats-medium"</code></li>
		 * <li><code>"timeFormats-long"</code></li>
		 * <li><code>"timeFormats-full"</code></li>
		 * </ul>
		 * </li>
		 * <li>{@link module:sap/base/i18n/Formatting.setNumberSymbol Formatting.setNumberSymbol} (one of the parameters listed below):
		 * <ul>
		 * <li><code>"symbols-latn-group"</code></li>
		 * <li><code>"symbols-latn-decimal"</code></li>
		 * <li><code>"symbols-latn-plusSign"</code></li>
		 * <li><code>"symbols-latn-minusSign"</code></li>
		 * </ul>
		 * </li>
		 * </ul>
		 *
		 * @typedef {object} module:sap/base/i18n/Formatting$ChangeEvent
		 * @property {string} [languageTag] The formatting language tag.
		 * @property {string} [legacyDateFormat] The legacy date format.
		 * @property {string} [legacyTimeFormat] The legacy time format.
		 * @property {string} [legacyNumberFormat] The legacy number format.
		 * @property {object[]} [legacyDateCalendarCustomizing] The legacy date calendar customizing.
		 * @property {object} [calendarWeekNumbering] The calendar week numbering.
		 * @property {object} [calendarType] The calendar type.
		 * @property {Object<string,string>} [units] The units.
		 * @property {Object<string,string>} [unitMappings] The unit mapping.
		 * @property {string} ["dateFormats-short"] The short date format.
		 * @property {string} ["dateFormats-medium"] The medium date format.
		 * @property {string} ["dateFormats-long"] The long date format.
		 * @property {string} ["dateFormats-full"] The full date format.
		 * @property {string} ["timeFormats-short"] The short time format.
		 * @property {string} ["timeFormats-medium"] The medium time format.
		 * @property {string} ["timeFormats-long"] The long time format.
		 * @property {string} ["timeFormats-full"] The full time format.
		 * @property {string} ["symbols-latn-group"] The latin symbols group.
		 * @property {string} ["symbols-latn-decimal"] The latin symbols decimal.
		 * @property {string} ["symbols-latn-plusSign"] The latin symbols plusSign.
		 * @property {string} ["symbols-latn-minusSign"] The latin symbols minusSign.
		 * @property {Object<string,string>} [currency] The currency.
		 * @property {string[]} ["dayPeriods-format-narrow"] The narrow day periods format.
		 * @property {string[]} ["dayPeriods-format-abbreviated"] The abbreviated day periods format.
		 * @property {string[]} ["dayPeriods-format-wide"] The wide day periods format.
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.118.0
		 */

		/**
		 * Attaches the <code>fnFunction</code> event handler to the {@link #event:change change} event
		 * of <code>module:sap/base/i18n/Formatting</code>.
		 *
		 * @param {function(module:sap/base/i18n/Formatting$ChangeEvent)} fnFunction
		 *   The function to be called when the event occurs
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.116.0
		 */
		attachChange: (fnFunction) => {
			oEventing.attachEvent("change", fnFunction);
		},

		/**
		 * Detaches event handler <code>fnFunction</code> from the {@link #event:change change} event of
		 * this <code>module:sap/base/i18n/Formatting</code>.
		 *
		 * @param {function(module:sap/base/i18n/Formatting$ChangeEvent)} fnFunction Function to be called when the event occurs
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.116.0
		 */
		detachChange: (fnFunction) => {
			oEventing.detachEvent("change", fnFunction);
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
		 * @returns {module:sap/base/i18n/LanguageTag} the format LanguageTag
		 * @public
		 * @since 1.116.0
		 */
		getLanguageTag : () => {
			function fallback() {
				let oLanguageTag = new LanguageTag(Localization.getLanguage());
				// if any user settings have been defined, add the private use subtag "sapufmt"
				if (!isEmptyObject(mSettings)
						|| Formatting.getCalendarWeekNumbering() !== CalendarWeekNumbering.Default) {
					let l = oLanguageTag.toString();
					if ( l.indexOf("-x-") < 0 ) {
						l += "-x-sapufmt";
					} else if ( l.indexOf("-sapufmt") <= l.indexOf("-x-") ) {
						l += "-sapufmt";
					}
					oLanguageTag = new LanguageTag(l);
				}
				return oLanguageTag;
			}
			return oWritableConfig.get({
				name: "sapUiFormatLocale",
				type: function(sFormatLocale) {return new LanguageTag(sFormatLocale);},
				defaultValue: fallback,
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
		 * @throws {Error} When <code>sLanguageTag</code> is given, but is not a valid BCP47 language
		 *   tag or Java locale identifier
		 * @public
		 * @since 1.116.0
		 */
		setLanguageTag : (sLanguageTag) => {
			const oLanguageTag = createLanguageTag(sLanguageTag);
			check(sLanguageTag == null || typeof sLanguageTag === "string" && oLanguageTag, "sLanguageTag must be a BCP47 language tag or Java Locale id or null");
			sLanguageTag = sLanguageTag === null ? undefined : sLanguageTag;
			const oOldLanguageTag = Formatting.getLanguageTag();
			oWritableConfig.set("sapUiFormatLocale", sLanguageTag);
			const oCurrentLanguageTag = Formatting.getLanguageTag();
			if (oOldLanguageTag.toString() !== oCurrentLanguageTag.toString()) {
				const bFireEvent = !mChanges;
				mChanges ??= {};
				mChanges.languageTag = oCurrentLanguageTag.toString();
				if (bFireEvent) {
					fireChange();
				}
			}
		},

		_set : function(sKey, oValue) {
			BaseConfig._.invalidate();
			const oOldValue = mSettings[sKey];
			if ( oValue != null ) {
				mSettings[sKey] = oValue;
			} else {
				delete mSettings[sKey];
			}
			// report a change only if old and new value differ (null/undefined are treated as the same value)
			if ( (oOldValue != null || oValue != null) && !deepEqual(oOldValue, oValue) ) {
				const bFireEvent = !mChanges;
				mChanges ??= {};
				mChanges[sKey] = oValue;
				if (bFireEvent) {
					fireChange();
				}
			}
		},

		/**
		 * Retrieves the custom units.
		 * These custom units are set by {@link #setCustomUnits} and {@link #addCustomUnits}
		 * @returns {object} custom units object
		 * @see {@link module:sap/base/i18n/Formatting.setCustomUnits}
		 * @see {@link module:sap/base/i18n/Formatting.addCustomUnits}
		 * @private
		 * @since 1.116.0
		 */
		getCustomUnits: () => {
			return mSettings["units"]?.["short"];
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
		 * @private
		 * @since 1.116.0
		 */
		setCustomUnits: (mUnits) => {
			// add custom units, or remove the existing ones if none are given
			let mUnitsshort = null;
			if (mUnits) {
				mUnitsshort = {
					"short": mUnits
				};
			}
			Formatting._set("units", mUnitsshort);
		},

		/**
		 * Adds custom units.
		 * Similar to {@link #setCustomUnits} but instead of setting the custom units, it will add additional ones.
		 * @param {object} mUnits custom unit object which replaces the current custom unit definition. Call with <code>null</code> to delete custom units.
		 * @see {@link module:sap/base/i18n/Formatting.setCustomUnits}
		 * @private
		 * @since 1.116.0
		 */
		addCustomUnits: (mUnits) => {
			// add custom units, or remove the existing ones if none are given
			const mExistingUnits = Formatting.getCustomUnits();
			if (mExistingUnits){
				mUnits = extend({}, mExistingUnits, mUnits);
			}
			Formatting.setCustomUnits(mUnits);
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
		 * @since 1.116.0
		 */
		setUnitMappings: (mUnitMappings) => {
			Formatting._set("unitMappings", mUnitMappings);
		},

		/**
		 * Adds unit mappings.
		 * Similar to {@link #setUnitMappings} but instead of setting the unit mappings, it will add additional ones.
		 * @param {object} mUnitMappings unit mappings
		 * @see {@link module:sap/base/i18n/Formatting.setUnitMappings}
		 * @private
		 * @since 1.116.0
		 */
		addUnitMappings: (mUnitMappings) => {
			// add custom units, or remove the existing ones if none are given
			const mExistingUnits = Formatting.getUnitMappings();
			if (mExistingUnits){
				mUnitMappings = extend({}, mExistingUnits, mUnitMappings);
			}
			Formatting.setUnitMappings(mUnitMappings);
		},

		/**
		 * Retrieves the unit mappings.
		 * These unit mappings are set by {@link #setUnitMappings} and {@link #addUnitMappings}
		 * @private
		 * @returns {object} unit mapping object
		 * @see {@link module:sap/base/i18n/Formatting.setUnitMappings}
		 * @see {@link module:sap/base/i18n/Formatting.addUnitMappings}
		 * @since 1.116.0
		 */
		getUnitMappings: () => {
			return mSettings["unitMappings"];
		},

		/**
		 * Returns the currently set date pattern or undefined if no pattern has been defined.
		 * @param {"short"|"medium"|"long"|"full"} sStyle The date style (short, medium, long or full)
		 * @returns {string} The resulting date pattern
		 * @public
		 * @since 1.116.0
		 */
		getDatePattern : (sStyle) => {
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
		 * @param {"short"|"medium"|"long"|"full"} sStyle must be one of short, medium, long or full.
		 * @param {string} sPattern the format pattern to be used in LDML syntax.
		 * @public
		 * @since 1.116.0
		 */
		setDatePattern : (sStyle, sPattern) => {
			check(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			Formatting._set("dateFormats-" + sStyle, sPattern);
		},

		/**
		 * Returns the currently set time pattern or undefined if no pattern has been defined.
		 * @param {"short"|"medium"|"long"|"full"} sStyle The time style (short, medium, long or full)
		 * @returns {string} The resulting time pattern
		 * @public
		 * @since 1.116.0
		 */
		getTimePattern : (sStyle) => {
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
		 * @param {"short"|"medium"|"long"|"full"} sStyle must be one of short, medium, long or full.
		 * @param {string} sPattern the format pattern to be used in LDML syntax.
		 * @public
		 * @since 1.116.0
		 */
		setTimePattern : (sStyle, sPattern) => {
			check(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			Formatting._set("timeFormats-" + sStyle, sPattern);
		},

		/**
		 * Returns the currently set number symbol of the given type or undefined if no symbol has been defined.
		 *
		 * @param {"group"|"decimal"|"plusSign"|"minusSign"} sType the type of symbol
		 * @returns {string} A non-numerical symbol used as part of a number for the given type,
		 *   e.g. for locale de_DE:
		 *     <ul>
		 *       <li>"group": "." (grouping separator)</li>
		 *       <li>"decimal": "," (decimal separator)</li>
		 *       <li>"plusSign": "+" (plus sign)</li>
		 *       <li>"minusSign": "-" (minus sign)</li>
		 *     </ul>
		 * @public
		 * @since 1.116.0
		 */
		getNumberSymbol : (sType) => {
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
		 * @public
		 * @since 1.116.0
		 */
		setNumberSymbol : (sType, sSymbol) => {
			check(["group", "decimal", "plusSign", "minusSign"].includes(sType), "sType must be decimal, group, plusSign or minusSign");
			Formatting._set("symbols-latn-" + sType, sSymbol);
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
		 * @returns {object} the mapping between custom currencies and its digits
		 * @public
		 * @since 1.116.0
		 * @see {@link module:sap/base/i18n/Formatting.setCustomCurrencies}
		 * @see {@link module:sap/base/i18n/Formatting.addCustomCurrencies}
		 */
		getCustomCurrencies : () => {
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
		 * @since 1.116.0
		 * @param {object} mCurrencies currency map which is set
		 * @see {@link module:sap/base/i18n/Formatting.addCustomCurrencies}
		 */
		setCustomCurrencies : (mCurrencies) => {
			check(typeof mCurrencies === "object" || mCurrencies == null, "mCurrencyDigits must be an object");
			Object.keys(mCurrencies || {}).forEach(function(sCurrencyDigit) {
				check(typeof sCurrencyDigit === "string");
				check(typeof mCurrencies[sCurrencyDigit] === "object");
			});
			Formatting._set("currency", mCurrencies);
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
		 * @since 1.116.0
		 * @param {object} mCurrencies adds to the currency map
		 * @see {@link module:sap/base/i18n/Formatting.setCustomCurrencies}
		 */
		addCustomCurrencies: (mCurrencies) => {
			// add custom units, or remove the existing ones if none are given
			const mExistingCurrencies = Formatting.getCustomCurrencies();
			if (mExistingCurrencies){
				mCurrencies = extend({}, mExistingCurrencies, mCurrencies);
			}
			Formatting.setCustomCurrencies(mCurrencies);
		},

		_setDayPeriods : (sWidth, aTexts) => {
			assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			Formatting._set("dayPeriods-format-" + sWidth, aTexts);
		},

		/**
		 * Returns the currently set legacy ABAP date format (its id) or undefined if none has been set.
		 *
		 * @returns {"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"A"|"B"|"C"|undefined} ID of the ABAP date format,
		 *   if not set or set to <code>""</code>, <code>undefined</code> will be returned
		 * @public
		 * @since 1.116.0
		 */
		getLegacyDateFormat : () => {
			const sLegacyDateFormat = oWritableConfig.get({
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
		 * @public
		 * @since 1.116.0
		 */
		setLegacyDateFormat : (sFormatId) => {
			sFormatId = sFormatId ? String(sFormatId).toUpperCase() : "";
			check(M_ABAP_DATE_FORMAT_PATTERN.hasOwnProperty(sFormatId), "sFormatId must be one of ['1','2','3','4','5','6','7','8','9','A','B','C'] or empty");
			const bFireEvent = !mChanges;
			const sOldFormat = Formatting.getLegacyDateFormat();
			if (sOldFormat !== sFormatId) {
				mChanges ??= {};
				oWritableConfig.set("sapUiLegacyDateFormat", sFormatId);
				mChanges.legacyDateFormat = sFormatId;
				Formatting.setDatePattern("short", M_ABAP_DATE_FORMAT_PATTERN[sFormatId].pattern);
				Formatting.setDatePattern("medium", M_ABAP_DATE_FORMAT_PATTERN[sFormatId].pattern);
				if (bFireEvent) {
					fireChange();
				}
			}
		},

		/**
		 * Returns the currently set legacy ABAP time format (its id) or undefined if none has been set.
		 *
		 * @returns {"0"|"1"|"2"|"3"|"4"|undefined} ID of the ABAP date format,
		 *   if not set or set to <code>""</code>, <code>undefined</code> will be returned
		 * @public
		 * @since 1.116.0
		 */
		getLegacyTimeFormat : () => {
			const sLegacyTimeFormat = oWritableConfig.get({
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
		 * @public
		 * @since 1.116.0
		 */
		setLegacyTimeFormat : (sFormatId) => {
			sFormatId = sFormatId || "";
			check(M_ABAP_TIME_FORMAT_PATTERN.hasOwnProperty(sFormatId), "sFormatId must be one of ['0','1','2','3','4'] or empty");
			const bFireEvent = !mChanges;
			const sOldFormat = Formatting.getLegacyTimeFormat();
			if (sOldFormat !== sFormatId) {
				mChanges ??= {};
				oWritableConfig.set("sapUiLegacyTimeFormat", sFormatId);
				mChanges.legacyTimeFormat = sFormatId;
				Formatting.setTimePattern("short", M_ABAP_TIME_FORMAT_PATTERN[sFormatId]["short"]);
				Formatting.setTimePattern("medium", M_ABAP_TIME_FORMAT_PATTERN[sFormatId]["medium"]);
				Formatting._setDayPeriods("abbreviated", M_ABAP_TIME_FORMAT_PATTERN[sFormatId].dayPeriods);
				if (bFireEvent) {
					fireChange();
				}
			}
		},

		/**
		 * Returns the currently set legacy ABAP number format (its id) or undefined if none has been set.
		 *
		 * @returns {" "|"X"|"Y"|undefined} ID of the ABAP number format,
		 *   if not set or set to <code>""</code>, <code>undefined</code> will be returned
		 * @public
		 * @since 1.116.0
		 */
		getLegacyNumberFormat : () => {
			const sLegacyNumberFormat = oWritableConfig.get({
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
		 * @public
		 * @since 1.116.0
		 */
		setLegacyNumberFormat : (sFormatId) => {
			sFormatId = sFormatId ? sFormatId.toUpperCase() : "";
			check(M_ABAP_NUMBER_FORMAT_SYMBOLS.hasOwnProperty(sFormatId), "sFormatId must be one of [' ','X','Y'] or empty");
			const bFireEvent = !mChanges;
			const sOldFormat = Formatting.getLegacyNumberFormat();
			if (sOldFormat !== sFormatId) {
				mChanges ??= {};
				oWritableConfig.set("sapUiLegacyNumberFormat", sFormatId);
				mChanges.legacyNumberFormat = sFormatId;
				Formatting.setNumberSymbol("group", M_ABAP_NUMBER_FORMAT_SYMBOLS[sFormatId].groupingSeparator);
				Formatting.setNumberSymbol("decimal", M_ABAP_NUMBER_FORMAT_SYMBOLS[sFormatId].decimalSeparator);
				if (bFireEvent) {
					fireChange();
				}
			}
		},

		/**
		 * Allows to specify the customizing data for Islamic calendar support
		 *
		 * @param {object[]} aMappings contains the customizing data for the support of Islamic calendar.
		 * @param {string} aMappings[].dateFormat The date format
		 * @param {string} aMappings[].islamicMonthStart The Islamic date
		 * @param {string} aMappings[].gregDate The corresponding Gregorian date
		 * @public
		 * @since 1.116.0
		 */
		setLegacyDateCalendarCustomizing : (aMappings) => {
			check(Array.isArray(aMappings), "aMappings must be an Array");
			const bFireEvent = !mChanges;
			mChanges ??= {};
			Formatting.aLegacyDateCalendarCustomizing = mChanges.legacyDateCalendarCustomizing = aMappings.slice();
			if (bFireEvent) {
				fireChange();
			}
		},

		/**
		 * Returns the currently set customizing data for Islamic calendar support
		 *
		 * @returns {object[]} Returns an array contains the customizing data. Each element in the array has properties: dateFormat, islamicMonthStart, gregDate. For details, please see {@link #setLegacyDateCalendarCustomizing}
		 * @public
		 * @since 1.116.0
		 */
		getLegacyDateCalendarCustomizing : () => {
			let aLegacyDateCalendarCustomizing = Formatting.aLegacyDateCalendarCustomizing;
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
		 * @since 1.75.0
		 * @public
		 * @since 1.116.0
		 */
		setTrailingCurrencyCode : (bTrailingCurrencyCode) => {
			check(typeof bTrailingCurrencyCode === "boolean", "bTrailingCurrencyCode must be a boolean");
			oWritableConfig.set("sapUiTrailingCurrencyCode", bTrailingCurrencyCode);
		},

		/**
		 * Returns current trailingCurrencyCode configuration for new NumberFormatter instances
		 *
		 * @return {boolean} Whether currency codes shall always be placed after the numeric value
		 * @since 1.75.0
		 * @public
		 * @since 1.116.0
		 */
		getTrailingCurrencyCode : () => {
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
		 * @returns {mSettings} The custom LocaleData settings object
		 * @private
		 * @since 1.116.0
		 */
		getCustomLocaleData : () => {
			return mSettings;
		},

		/**
		 * Returns the calendar week numbering algorithm used to determine the first day of the week
		 * and the first calendar week of the year, see {@link module:sap/base/i18n/data/CalendarWeekNumbering}.
		 *
		 * @returns {module:sap/base/i18n/date/CalendarWeekNumbering} The calendar week numbering algorithm
		 *
		 * @public
		 * @since 1.116.0
		 */
		getCalendarWeekNumbering: () => {
			let oCalendarWeekNumbering = CalendarWeekNumbering.Default;

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
		 * and the first calendar week of the year, see {@link module:sap/base/i18n/date/CalendarWeekNumbering}.
		 *
		 * @param {module:sap/base/i18n/date/CalendarWeekNumbering} sCalendarWeekNumbering
		 *   The calendar week numbering algorithm
		 * @throws {Error}
		 *   If <code>sCalendarWeekNumbering</code> is not a valid calendar week numbering algorithm,
		 *   defined in {@link module:sap/base/i18n/date/CalendarWeekNumbering}
		 *
		 * @public
		 * @since 1.116.0
		 */
		setCalendarWeekNumbering: (sCalendarWeekNumbering) => {
			BaseConfig._.checkEnum(CalendarWeekNumbering, sCalendarWeekNumbering, "calendarWeekNumbering");
			const sCurrentWeekNumbering = oWritableConfig.get({
				name: "sapUiCalendarWeekNumbering",
				type: CalendarWeekNumbering,
				defaultValue: CalendarWeekNumbering.Default,
				external: true
			});
			if (sCurrentWeekNumbering !== sCalendarWeekNumbering) {
				const bFireEvent = !mChanges;
				mChanges ??= {};
				oWritableConfig.set("sapUiCalendarWeekNumbering", sCalendarWeekNumbering);
				mChanges.calendarWeekNumbering = sCalendarWeekNumbering;
				if (bFireEvent) {
					fireChange();
				}
			}
		},

		/**
		 * Returns the calendar type which is being used in locale dependent functionality.
		 *
		 * When it's explicitly set by calling <code>setCalendar</code>, the set calendar type is returned.
		 * Otherwise, the calendar type is determined by checking the format settings and current locale.
		 *
		 * @returns {module:sap/base/i18n/date/CalendarType} the current calendar type, e.g. <code>Gregorian</code>
		 * @since 1.116.0
		 */
		getCalendarType: () => {
			let sName,
				sCalendarType = oWritableConfig.get({
					name: "sapUiCalendarType",
					type: BaseConfig.Type.String,
					external: true
				});

			sCalendarType ??= null;

			if (sCalendarType) {
				for (sName in CalendarType) {
					if (sName.toLowerCase() === sCalendarType.toLowerCase()) {
						return sName;
					}
				}
				Log.warning("Parameter 'calendarType' is set to " + sCalendarType + " which isn't a valid value and therefore ignored. The calendar type is determined from format setting and current locale");
			}

			const sLegacyDateFormat = Formatting.getLegacyDateFormat();

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
		 * @param {module:sap/base/i18n/date/CalendarType|null} sCalendarType the new calendar type. Set it with null to clear the calendar type
		 *   and the calendar type is calculated based on the format settings and current locale.
		 * @public
		 * @since 1.116.0
		 */
		setCalendarType : (sCalendarType) => {
			const sOldCalendarType = Formatting.getCalendarType();
			oWritableConfig.set("sapUiCalendarType", sCalendarType);
			const sCurrentCalendarType = Formatting.getCalendarType();
			if (sOldCalendarType !== sCurrentCalendarType) {
				const bFireEvent = !mChanges;
				mChanges ??= {};
				mChanges.calendarType = sCurrentCalendarType;
				if (bFireEvent) {
					fireChange();
				}
			}
		}
	};

	function fireChange() {
		oEventing.fireEvent("change", mChanges);
		mChanges = undefined;
	}

	function init() {
		// init legacy formats
		const sLegacyDateFormat = Formatting.getLegacyDateFormat();
		if (sLegacyDateFormat !== undefined) {
			Formatting.setLegacyDateFormat(sLegacyDateFormat);
		}
		const sLegacyNumberFormat = Formatting.getLegacyNumberFormat();
		if (sLegacyNumberFormat !== undefined) {
			Formatting.setLegacyNumberFormat(sLegacyNumberFormat);
		}
		const sLegacyTimeFormat = Formatting.getLegacyTimeFormat();
		if (sLegacyTimeFormat !== undefined) {
			Formatting.setLegacyTimeFormat(sLegacyTimeFormat);
		}
	}

	init();

	return Formatting;
});
