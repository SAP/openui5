/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/assert",
	"sap/base/config",
	"sap/base/Event",
	"sap/base/Log",
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/base/util/Version",
	"sap/ui/base/DesignTime",
	"sap/ui/base/Object",
	"sap/ui/core/AnimationMode",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/getCompatibilityVersion",
	"sap/ui/core/Locale",
	"sap/ui/core/Supportability",
	"sap/ui/core/Theming",
	"sap/ui/security/Security"
], function(
	assert,
	BaseConfig,
	BaseEvent,
	Log,
	Formatting,
	Localization,
	Version,
	DesignTime,
	BaseObject,
	AnimationMode,
	ControlBehavior,
	getCompatibilityVersion,
	Locale,
	Supportability,
	Theming,
	Security
) {
	"use strict";

	var oVersion = new Version("${version}");
	var oFormatSettings;

	// Lazy dependency to core
	var Core;

	// ---- change handling ----

	var mChanges;

	function _collect() {
		mChanges = mChanges || { __count : 0};
		mChanges.__count++;
		return mChanges;
	}

	function _endCollect() {
		if ( mChanges && (--mChanges.__count) === 0 ) {
			var mChangesToReport = mChanges;
			delete mChanges.__count;
			mChanges = undefined;
			Core?.fireLocalizationChanged(mChangesToReport);
		}
	}

	// ---- Configuration state and init ----

	/**
	 * Creates a new Configuration object.
	 *
	 * @class Collects and stores the configuration of the current environment.
	 *
	 * The Configuration is initialized once when the {@link sap.ui.core.Core} is created.
	 * There are different ways to set the environment configuration (in ascending priority):
	 * <ol>
	 * <li>System defined defaults</li>
	 * <li>Server wide defaults, read from /sap-ui-config.json</li>
	 * <li>Properties of the global configuration object window["sap-ui-config"]</li>
	 * <li>A configuration string in the data-sap-ui-config attribute of the bootstrap tag.</li>
	 * <li>Individual data-sap-ui-<i>xyz</i> attributes of the bootstrap tag</li>
	 * <li>Using URL parameters</li>
	 * <li>Setters in this Configuration object (only for some parameters)</li>
	 * </ol>
	 *
	 * That is, attributes of the DOM reference override the system defaults, URL parameters
	 * override the DOM attributes (where empty URL parameters set the parameter back to its
	 * system default). Calling setters at runtime will override any previous settings
	 * calculated during object creation.
	 *
	 * The naming convention for parameters is:
	 * <ul>
	 * <li>in the URL : sap-ui-<i>PARAMETER-NAME</i>="value"</li>
	 * <li>in the DOM : data-sap-ui-<i>PARAMETER-NAME</i>="value"</li>
	 * </ul>
	 * where <i>PARAMETER-NAME</i> is the name of the parameter in lower case.
	 *
	 * Values of boolean parameters are case insensitive where "true" and "x" are interpreted as true.
	 *
	 * @hideconstructor
	 * @extends sap.ui.base.Object
	 * @public
	 * @alias sap.ui.core.Configuration
	 * @deprecated As of Version 1.120
	 * @borrows module:sap/base/i18n/Localization.getLanguagesDeliveredWithCore as getLanguagesDeliveredWithCore
	 * @borrows module:sap/base/i18n/Localization.getSupportedLanguages as getSupportedLanguages
	 * @borrows module:sap/ui/core/getCompatibilityVersion as getCompatibilityVersion
	 */
	var Configuration = BaseObject.extend("sap.ui.core.Configuration", /** @lends sap.ui.core.Configuration.prototype */ {

		constructor : function() {
			BaseObject.call(this);
			Log.error(
				"Configuration is designed as a singleton and should not be created manually! " +
				"Please require 'sap/ui/core/Configuration' instead and use the module export directly without using 'new'."
			);

			return Configuration;
		}

	});

	Object.assign(Configuration, /** @lends sap.ui.core.Configuration */ {
		/**
		 * Returns the version of the framework.
		 *
		 * Similar to <code>sap.ui.version</code>.
		 *
		 * @return {module:sap/base/util/Version} the version
		 * @public
		 * @deprecated As of Version 1.120. Please use the async {@link module:sap/ui/VersionInfo.load VersionInfo.load} instead.
		 */
		getVersion: function () {
			return oVersion;
		},

		getCompatibilityVersion : getCompatibilityVersion,

		/**
		 * Returns the theme name
		 * @return {string} the theme name
		 * @function
		 * @public
		 * @deprecated Since 1.119. Please use {@link module:sap/ui/core/Theming.getTheme Theming.getTheme} instead.
		 */
		getTheme : Theming.getTheme,

		/**
		 * Returns a string that identifies the current language.
		 *
		 * The value returned by config method in most cases corresponds to the exact value that has been
		 * configured by the user or application or that has been determined from the user agent settings.
		 * It has not been normalized, but has been validated against a relaxed version of
		 * {@link http://www.ietf.org/rfc/bcp/bcp47.txt BCP47}, allowing underscores ('_') instead of the
		 * suggested dashes ('-') and not taking the case of letters into account.
		 *
		 * The exceptions mentioned above affect languages that have been specified via the URL parameter
		 * <code>sap-language</code>. That parameter by definition represents an SAP logon language code
		 * ('ABAP language'). Most but not all of these language codes are valid ISO639 two-letter languages
		 * and as such are valid BCP47 language tags. For better BCP47 compliance, the framework
		 * maps the following non-BCP47 SAP logon codes to a BCP47 substitute:
		 * <pre>
		 *    "ZH"  -->  "zh-Hans"         // script 'Hans' added to distinguish it from zh-Hant
		 *    "ZF"  -->  "zh-Hant"         // ZF is not a valid ISO639 code, use the compliant language + script 'Hant'
		 *    "1Q"  -->  "en-US-x-saptrc"  // special language code for supportability (tracing),
		 *                                    represented as en-US with a private extension
		 *    "2Q"  -->  "en-US-x-sappsd"  // special language code for supportability (pseudo translation),
		 *                                    represented as en-US with a private extension
		 *    "3Q"  -->  "en-US-x-saprigi" // special language code for the Rigi pseudo language,
		 *                                    represented as en-US with a private extension
		 * </pre>
		 *
		 * For a normalized BCP47 tag, call {@link #.getLanguageTag Configuration.getLanguageTag} or call
		 * {@link #.getLocale Configuration.getLocale} to get a {@link sap.ui.core.Locale Locale} object matching
		 * the language.
		 *
		 * @return {string} Language string as configured
		 * @function
		 * @public
		 * @deprecated Since 1.119. Please use {@link module:sap/base/i18n/Localization.getLanguage Localization.getLanguage} instead.
		 */
		getLanguage :  Localization.getLanguage,

		/**
		 * Sets a new language to be used from now on for language/region dependent
		 * functionality (e.g. formatting, data types, translated texts, ...).
		 *
		 * When the language can't be interpreted as a BCP47 language (using the relaxed syntax
		 * described in {@link #.getLanguage Configuration.getLanguage}, an error will be thrown.
		 *
		 * When the language has changed, the Core will fire its
		 * {@link sap.ui.core.Core#event:localizationChanged localizationChanged} event.
		 *
		 *
		 * <h3>Restrictions</h3>
		 *
		 * The framework <strong>does not</strong> guarantee that already created, language
		 * dependent objects will be updated by config call. It therefore remains best practice
		 * for applications to switch the language early, e.g. before any language dependent
		 * objects are created. Applications that need to support more dynamic changes of
		 * the language should listen to the <code>localizationChanged</code> event and adapt
		 * all language dependent objects that they use (e.g. by rebuilding their UI).
		 *
		 * Currently, the framework notifies the following objects about a change of the
		 * localization settings before it fires the <code>localizationChanged</code> event:
		 *
		 * <ul>
		 * <li>date and number data types that are used in property bindings or composite
		 *     bindings in existing Elements, Controls, UIAreas or Components</li>
		 * <li>ResourceModels currently assigned to the Core, a UIArea, Component,
		 *     Element or Control</li>
		 * <li>Elements or Controls that implement the <code>onLocalizationChanged</code> hook</li>
		 * </ul>
		 *
		 * It furthermore derives the RTL mode from the new language, if no explicit RTL
		 * mode has been set. If the RTL mode changes, the following additional actions will be taken:
		 *
		 * <ul>
		 * <li>the URLs of already loaded library theme files will be changed</li>
		 * <li>the <code>dir</code> attribute of the page will be changed to reflect the new mode.</li>
		 * <li>all UIAreas will be invalidated (which results in a rendering of the whole UI5 UI)</li>
		 * </ul>
		 *
		 * config method does not accept SAP language codes for <code>sLanguage</code>. Instead, a second
		 * parameter <code>sSAPLogonLanguage</code> can be provided with an SAP language code corresponding
		 * to the given language. A given value will be returned by the {@link #.getSAPLogonLanguage
		 * Configuration.getSAPLogonLanguage} method.
		 * It is up to the caller to provide a consistent pair of BCP47 language and SAP language code.
		 * The SAP language code is only checked to be of length 2 and must consist of letters or digits only.
		 *
		 * <b>Note</b>: When using config method please take note of and respect the above mentioned restrictions.
		 *
		 * @param {string} sLanguage the new language as a BCP47 compliant language tag; case doesn't matter
		 *   and underscores can be used instead of dashes to separate components (compatibility with Java Locale IDs)
		 * @param {string} [sSAPLogonLanguage] SAP language code that corresponds to the <code>sLanguage</code>;
		 *   if a value is specified, future calls to <code>getSAPLogonLanguage</code> will return that value;
		 *   if no value is specified, the framework will use the ISO639 language part of <code>sLanguage</code>
		 *   as SAP Logon language.
		 * @throws {Error} When <code>sLanguage</code> can't be interpreted as a BCP47 language or when
		 *   <code>sSAPLanguage</code> is given and can't be interpreted as SAP language code.
		 * @return {this} <code>this</code> to allow method chaining
		 *
		 * @see http://scn.sap.com/docs/DOC-14377
		 * @function
		 * @public
		 * @deprecated As of Version 1.119. Please use {@link module:sap/base/i18n/Localization.setLanguage Localization.setLanguage} instead.
		 */
		setLanguage : function() {
			Localization.setLanguage.apply(Localization, arguments);
			return Configuration;
		},

		/**
		 * Returns a Locale object for the current language.
		 *
		 * The Locale is derived from the {@link #.getLanguage language} property.
		 *
		 * @return {sap.ui.core.Locale} The locale
		 * @public
		 * @deprecated As of Version 1.119. Please use {@link module:sap/base/i18n/Localization.getLanguageTag Localization.getLanguageTag} instead.
		 */
		getLocale : function() {
			var oLanguageTag = Localization.getLanguageTag();
			return Locale._getCoreLocale(oLanguageTag);
		},

		getLanguagesDeliveredWithCore : Localization.getLanguagesDeliveredWithCore,
		getSupportedLanguages : Localization.getSupportedLanguages,

		/**
		 * Returns a configuration object that bundles the format settings of UI5.
		 *
		 * @returns {sap.ui.core.Configuration.FormatSettings} A FormatSettings object.
		 * @public
		 * @deprecated As of Version 1.120. Please use {@link module:sap/base/i18n/Formatting Formatting} instead.
		 */
		getFormatSettings : function() {
			return oFormatSettings;
		},

		/**
		 * Applies multiple changes to the configuration at once.
		 *
		 * If the changed settings contain localization related settings like <code>language</code>
		 * or <ode>calendarType</code>, then only a single <code>localizationChanged</code> event will
		 * be fired. As the framework has to inform all existing components, elements, models etc.
		 * about localization changes, using <code>applySettings</code> can significantly reduce the
		 * overhead for multiple changes, esp. when they occur after the UI has been created already.
		 *
		 * The <code>mSettings</code> can contain any property <code><i>xyz</i></code> for which a
		 * setter method <code>set<i>XYZ</i></code> exists in the API of this class.
		 * Similarly, values for the {@link sap.ui.core.Configuration.FormatSettings format settings}
		 * API can be provided in a nested object with name <code>formatSettings</code>.
		 *
		 *
		 * @example <caption>Apply <code>language</code>, <code>calendarType</code> and several legacy
		 *          format settings in one call</caption>
		 *
		 * sap.ui.getCore().getConfiguration().applySettings({
		 *     language: 'de',
		 *     calendarType: sap.ui.core.CalendarType.Gregorian,
		 *     formatSettings: {
		 *         legacyDateFormat: '1',
		 *         legacyTimeFormat: '1',
		 *         legacyNumberFormat: '1'
		 *     }
		 * });
		 *
		 * @param {object} mSettings Configuration options to apply
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 * @since 1.38.6
		 * @deprecated As of Version 1.120
		 */
		applySettings: function(mSettings) {

			function applyAll(ctx, m) {
				var sName, sMethod;
				for ( sName in m ) {
					sMethod = "set" + sName.slice(0,1).toUpperCase() + sName.slice(1);
					if ( sName === 'formatSettings' && oFormatSettings ) {
						applyAll(oFormatSettings, m[sName]);
					} else if ( typeof ctx[sMethod] === 'function' ) {
						ctx[sMethod](m[sName]);
					} else {
						Log.warning("Configuration.applySettings: unknown setting '" + sName + "' ignored");
					}
				}
			}

			assert(typeof mSettings === 'object', "mSettings must be an object");

			_collect(); // block events
			applyAll(Configuration, mSettings);
			_endCollect(); // might fire localizationChanged

			return this;
		}
	});

	/**
	 * Enumerable list with available animation modes.
	 *
	 * This enumerable is used to validate the animation mode. Animation modes allow to specify
	 * different animation scenarios or levels. The implementation of the Control (JavaScript or CSS)
	 * has to be done differently for each animation mode.
	 *
	 * @enum {string}
	 * @name sap.ui.core.Configuration.AnimationMode
	 * @since 1.50.0
	 * @public
	 * @deprecated As of Version 1.120. Please use module {@link module:sap/ui/core/AnimationMode AnimationMode} instead.
	 */

	/**
	 * <code>full</code> represents a mode with unrestricted animation capabilities.
	 * @public
	 * @name sap.ui.core.Configuration.AnimationMode.full
	 * @member
	 */

	/**
	 * <code>basic</code> can be used for a reduced, more light-weight set of animations.
	 * @public
	 * @name sap.ui.core.Configuration.AnimationMode.basic
	 * @member
	 */

	/**
	 * <code>minimal</code> includes animations of fundamental functionality.
	 * @public
	 * @name sap.ui.core.Configuration.AnimationMode.minimal
	 * @member
	 */

	/**
	 * <code>none</code> deactivates the animation completely.
	 * @public
	 * @name sap.ui.core.Configuration.AnimationMode.none
	 * @member
	 */
	Configuration.AnimationMode = AnimationMode;

	function check(bCondition, sMessage) {
		if ( !bCondition ) {
			throw new Error(sMessage);
		}
	}

	/**
	 * @class Encapsulates configuration settings that are related to data formatting/parsing.
	 *
	 * <b>Note:</b> When format configuration settings are modified through this class,
	 * UI5 only ensures that formatter objects created after that point in time will honor
	 * the modifications. To be on the safe side, applications should do any modifications
	 * early in their lifecycle or recreate any model/UI that is locale dependent.
	 *
	 * @alias sap.ui.core.Configuration.FormatSettings
	 * @extends sap.ui.base.Object
	 * @public
	 * @deprecated As of Version 1.120. Please use {@link module:sap/base/i18n/Formatting Formatting} instead.
	 * @borrows module:sap/base/i18n/Formatting.getCustomUnits as #getCustomUnits
	 * @borrows module:sap/base/i18n/Formatting.setCustomUnits as #setCustomUnits
	 * @borrows module:sap/base/i18n/Formatting.addCustomUnits as #addCustomUnits
	 * @borrows module:sap/base/i18n/Formatting.getUnitMappings as #getUnitMappings
	 * @borrows module:sap/base/i18n/Formatting.setUnitMappings as #setUnitMappings
	 * @borrows module:sap/base/i18n/Formatting.addUnitMappings as #addUnitMappings
	 * @borrows module:sap/base/i18n/Formatting.getDatePattern as #getDatePattern
	 * @borrows module:sap/base/i18n/Formatting.getTimePattern as #getTimePattern
	 * @borrows module:sap/base/i18n/Formatting.getNumberSymbol as #getNumberSymbol
	 * @borrows module:sap/base/i18n/Formatting.getCustomCurrencies as #getCustomCurrencies
	 * @borrows module:sap/base/i18n/Formatting.setCustomCurrencies as #setCustomCurrencies
	 * @borrows module:sap/base/i18n/Formatting.addCustomCurrencies as #addCustomCurrencies
	 * @borrows module:sap/base/i18n/Formatting.getLegacyDateFormat as #getLegacyDateFormat
	 * @borrows module:sap/base/i18n/Formatting.getLegacyTimeFormat as #getLegacyTimeFormat
	 * @borrows module:sap/base/i18n/Formatting.getLegacyNumberFormat as #getLegacyNumberFormat
	 * @borrows module:sap/base/i18n/Formatting.getCustomIslamicCalendarData as #getLegacyDateCalendarCustomizing
	 * @borrows module:sap/base/i18n/Formatting.setCustomIslamicCalendarData as #setLegacyDateCalendarCustomizing
	 * @borrows module:sap/base/i18n/Formatting.getTrailingCurrencyCode as #getTrailingCurrencyCode
	 * @borrows module:sap/base/i18n/Formatting.setTrailingCurrencyCode as #setTrailingCurrencyCode
	 * @borrows module:sap/base/i18n/Formatting.getCustomLocaleData as #getCustomLocaleData
	 *
	 */
	var FormatSettings = BaseObject.extend("sap.ui.core.Configuration.FormatSettings", /** @lends sap.ui.core.Configuration.FormatSettings.prototype */ {
		constructor : function() {
			BaseObject.call(this);
			this.mSettings = {};
		},

		_set: Formatting._set,
		getCustomUnits: Formatting.getCustomUnits,

		setCustomUnits: function() {
			Formatting.setCustomUnits.apply(Formatting, arguments);
			return this;
		},

		addCustomUnits: function() {
			Formatting.addCustomUnits.apply(Formatting, arguments);
			return this;
		},

		setUnitMappings: function() {
			Formatting.setUnitMappings.apply(Formatting, arguments);
			return this;
		},

		addUnitMappings: function() {
			Formatting.addUnitMappings.apply(Formatting, arguments);
			return this;
		},

		getUnitMappings: Formatting.getUnitMappings,
		getDatePattern : Formatting.getDatePattern,

		/**
		 * Defines the preferred format pattern for the given date format style.
		 *
		 * Calling this method with a null or undefined pattern removes a previously set pattern.
		 *
		 * If a pattern is defined, it will be preferred over patterns derived from the current locale.
		 *
		 * See class {@link sap.ui.core.format.DateFormat DateFormat} for details about the pattern syntax.
		 *
		 * After changing the date pattern, the framework tries to update localization
		 * specific parts of the UI. See the documentation of {@link sap.ui.core.Configuration.setLanguage Configuration.setLanguage}
		 * for details and restrictions.
		 *
		 * @param {string} sStyle must be one of short, medium, long or full.
		 * @param {string} sPattern the format pattern to be used in LDML syntax.
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 * @function
		 */
		setDatePattern : function() {
			Formatting.setDatePattern.apply(Formatting, arguments);
			return this;
		},

		getTimePattern : Formatting.getTimePattern,

		/**
		 * Defines the preferred format pattern for the given time format style.
		 *
		 * Calling this method with a null or undefined pattern removes a previously set pattern.
		 *
		 * If a pattern is defined, it will be preferred over patterns derived from the current locale.
		 *
		 * See class {@link sap.ui.core.format.DateFormat DateFormat} for details about the pattern syntax.
		 *
		 * After changing the time pattern, the framework tries to update localization
		 * specific parts of the UI. See the documentation of {@link sap.ui.core.Configuration.setLanguage
		 * Configuration.setLanguage} for details and restrictions.
		 *
		 * @param {string} sStyle must be one of short, medium, long or full.
		 * @param {string} sPattern the format pattern to be used in LDML syntax.
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 * @function
		 */
		setTimePattern : function() {
			Formatting.setTimePattern.apply(Formatting, arguments);
			return this;
		},

		getNumberSymbol : Formatting.getNumberSymbol,

		/**
		 * Defines the string to be used for the given number symbol.
		 *
		 * Calling this method with a null or undefined symbol removes a previously set symbol string.
		 * Note that an empty string is explicitly allowed.
		 *
		 * If a symbol is defined, it will be preferred over symbols derived from the current locale.
		 *
		 * See class {@link sap.ui.core.format.NumberFormat NumberFormat} for details about the symbols.
		 *
		 * After changing the number symbol, the framework tries to update localization
		 * specific parts of the UI. See the documentation of {@link sap.ui.core.Configuration.setLanguage
		 * Configuration.setLanguage} for details and restrictions.
		 *
		 * @param {"group"|"decimal"|"plusSign"|"minusSign"} sType the type of symbol
		 * @param {string} sSymbol will be used to represent the given symbol type
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 * @function
		 */
		setNumberSymbol : function() {
			Formatting.setNumberSymbol.apply(Formatting, arguments);
			return this;
		},

		getCustomCurrencies : Formatting.getCustomCurrencies,

		setCustomCurrencies : function() {
			Formatting.setCustomCurrencies.apply(Formatting, arguments);
			return this;
		},

		addCustomCurrencies: function() {
			Formatting.addCustomCurrencies.apply(Formatting, arguments);
			return this;
		},

		_setDayPeriods: Formatting._setDayPeriods,
		getLegacyDateFormat : Formatting.getABAPDateFormat,

		/**
		 * Allows to specify one of the legacy ABAP date formats.
		 *
		 * This method modifies the date patterns for 'short' and 'medium' style with the corresponding ABAP
		 * format. When called with a null or undefined format id, any previously applied format will be removed.
		 *
		 * After changing the legacy date format, the framework tries to update localization
		 * specific parts of the UI. See the documentation of {@link sap.ui.core.Configuration.setLanguage
		 * Configuration.setLanguage} for details and restrictions.
		 *
		 * @param {""|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"A"|"B"|"C"} [sFormatId=""] ID of the ABAP date format,
		 *   <code>""</code> will reset the date patterns for 'short' and 'medium' style to the
		 *   locale-specific ones.
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 * @function
		 */
		setLegacyDateFormat : function() {
			Formatting.setABAPDateFormat.apply(Formatting, arguments);
			return this;
		},

		getLegacyTimeFormat : Formatting.getABAPTimeFormat,

		/**
		 * Allows to specify one of the legacy ABAP time formats.
		 *
		 * This method sets the time patterns for 'short' and 'medium' style to the corresponding ABAP
		 * formats and sets the day period texts to "AM"/"PM" or "am"/"pm" respectively. When called
		 * with a null or undefined format id, any previously applied format will be removed.
		 *
		 * After changing the legacy time format, the framework tries to update localization
		 * specific parts of the UI. See the documentation of {@link sap.ui.core.Configuration.setLanguage
		 * Configuration.setLanguage} for details and restrictions.
		 *
		 * @param {""|"0"|"1"|"2"|"3"|"4"} [sFormatId=""] ID of the ABAP time format,
		 *   <code>""</code> will reset the time patterns for 'short' and 'medium' style and the day
		 *   period texts to the locale-specific ones.
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 * @function
		 */
		setLegacyTimeFormat : function() {
			Formatting.setABAPTimeFormat.apply(Formatting, arguments);
			return this;
		},

		getLegacyNumberFormat : Formatting.getABAPNumberFormat,

		/**
		 * Allows to specify one of the legacy ABAP number format.
		 *
		 * This method will modify the 'group' and 'decimal' symbols. When called with a null
		 * or undefined format id, any previously applied format will be removed.
		 *
		 * After changing the legacy number format, the framework tries to update localization
		 * specific parts of the UI. See the documentation of {@link sap.ui.core.Configuration.setLanguage
		 * Configuration.setLanguage} for details and restrictions.
		 *
		 * @param {""|" "|"X"|"Y"} [sFormatId=""] ID of the ABAP number format set,
		 *   <code>""</code> will reset the 'group' and 'decimal' symbols to the locale-specific
		 *   ones.
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 * @function
		 */
		setLegacyNumberFormat : function() {
			Formatting.setABAPNumberFormat.apply(Formatting, arguments);
			return this;
		},

		setLegacyDateCalendarCustomizing : function() {
			Formatting.setCustomIslamicCalendarData.apply(Formatting, arguments);
			return this;
		},

		getLegacyDateCalendarCustomizing : Formatting.getCustomIslamicCalendarData,

		setTrailingCurrencyCode : function() {
			Formatting.setTrailingCurrencyCode.apply(Formatting, arguments);
			return this;
		},

		getTrailingCurrencyCode : Formatting.getTrailingCurrencyCode,
		getCustomLocaleData : Formatting.getCustomLocaleData
	});

	oFormatSettings = new FormatSettings(this);

	//enable Eventing
	Localization.attachChange(function(oEvent) {
		if (!mChanges && Core) {
			Core.fireLocalizationChanged(BaseEvent.getParameters(oEvent));
		} else if (mChanges) {
			Object.assign(mChanges, BaseEvent.getParameters(oEvent));
		}
	});

	Formatting.attachChange(function(oEvent) {
		const mParameters = BaseEvent.getParameters(oEvent);
		Object.keys(oEvent).forEach((sName) => {
			if (["ABAPDateFormat", "ABAPTimeFormat", "ABAPNumberFormat"].includes(sName)) {
				mParameters[sName.replace("ABAP", "legacy")] = mParameters[sName];
				delete mParameters[sName];
			} else if (sName === 'customIslamicCalendarData') {
				mParameters['legacyDateCalendarCustomizing'] = mParameters[sName];
				delete mParameters[sName];
			}
		});
		if (!mChanges && Core) {
			Core.fireLocalizationChanged(mParameters);
		} else if (mChanges) {
			Object.assign(mChanges, mParameters);
		}
	});

	return Configuration;
});