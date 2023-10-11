/*!
 * ${copyright}
 */

//Provides class sap.ui.core.Configuration
sap.ui.define([
	'../Device',
	'../base/Object',
	'./AnimationMode',
	'./ControlBehavior',
	'./Locale',
	"./format/TimezoneUtil",
	"sap/ui/base/DesignTime",
	"sap/ui/core/getCompatibilityVersion",
	"sap/ui/core/date/CalendarWeekNumbering",
	"sap/ui/core/Supportability",
	"sap/ui/core/Theming",
	"sap/ui/security/Security",
	"sap/base/util/Version",
	"sap/base/Log",
	"sap/base/assert",
	"sap/base/config",
	"sap/base/Event",
	"sap/base/util/deepClone",
	"sap/base/i18n/Localization",
	"sap/base/i18n/Formatting"
],
	function(
		Device,
		BaseObject,
		AnimationMode,
		ControlBehavior,
		Locale,
		TimezoneUtil,
		DesignTime,
		getCompatibilityVersion,
		CalendarWeekNumbering,
		Supportability,
		Theming,
		Security,
		Version,
		Log,
		assert,
		BaseConfig,
		BaseEvent,
		deepClone,
		Localization,
		Formatting
	) {
	"use strict";

	var M_SETTINGS;
	var VERSION = "${version}";

	function detectLanguage() {

		function navigatorLanguage() {
			if ( Device.os.android ) {
				// on Android, navigator.language is hardcoded to 'en', so check UserAgent string instead
				var match = navigator.userAgent.match(/\s([a-z]{2}-[a-z]{2})[;)]/i);
				if ( match ) {
					return match[1];
				}
				// okay, we couldn't find a language setting. It might be better to fallback to 'en' instead of having no language
			}
			return navigator.language;
		}

		return convertToLocaleOrNull( (navigator.languages && navigator.languages[0]) || navigatorLanguage() || navigator.userLanguage || navigator.browserLanguage ) || new Locale("en");
	}

	function setValue(sName, vValue) {
		if ( vValue == null ) {
			return;
		}
		config[sName] = convertToType(sName, vValue);
	}

	function convertToType(sName, vValue) {
		if ( vValue == null ) {
			return;
		}
		switch (M_SETTINGS[sName].type) {
		case "boolean":
			if ( typeof vValue === "string" ) {
				if (M_SETTINGS[sName].defaultValue) {
					return vValue.toLowerCase() != "false";
				} else {
					return vValue.toLowerCase() === "true" || vValue.toLowerCase() === "x";
				}
			} else {
				// boolean etc.
				return !!vValue;
			}
		case "string":
			return "" + vValue; // enforce string
		case "code":
			return typeof vValue === "function" ? vValue : String(vValue);
		case "function":
			if ( typeof vValue !== "function" ) {
				throw new Error("unsupported value");
			}
			return vValue;
		case "function[]":
			vValue.forEach(function(fnFunction) {
				if ( typeof fnFunction !== "function" ) {
					throw new Error("Not a function: " + fnFunction);
				}
			});
			return vValue.slice();
		case "string[]":
			if ( Array.isArray(vValue) ) {
				return vValue;
			} else if ( typeof vValue === "string" ) {
				return vValue.split(/[ ,;]/).map(function(s) {
					return s.trim();
				});
			} else {
				throw new Error("unsupported value");
			}
		case "object":
			if ( typeof vValue !== "object" ) {
				throw new Error("unsupported value");
			}
			return vValue;
		case "Locale":
			var oLocale = convertToLocaleOrNull(vValue);
			if ( oLocale || M_SETTINGS[sName].defaultValue == null ) {
				return oLocale;
			} else {
				throw new Error("unsupported value");
			}
		default:
			// When the type is none of the above types, check if an object as enum is provided to validate the value.
			var vType = M_SETTINGS[sName].type;
			if (typeof vType === "object") {
				BaseConfig._.checkEnum(vType, vValue, sName);
				return vValue;
			} else {
				throw new Error("illegal state");
			}
		}
	}

	// Definition of supported settings
	// Valid property types are: string, boolean, string[], code, object, function, function[].
	// Objects as an enumeration list of valid values can also be provided (e.g. Configuration.AnimationMode).
	var M_SETTINGS = {
		"theme"                 : { type : "string",   defaultValue : "base" },
		"language"              : { type : "Locale",   defaultValue : detectLanguage() },
		"timezone"              : { type : "string",   defaultValue : TimezoneUtil.getLocalTimezone() },
		"formatLocale"          : { type : "Locale",   defaultValue : null },
		"calendarType"          : { type : "string",   defaultValue : null },
		"calendarWeekNumbering" : { type : CalendarWeekNumbering, defaultValue : CalendarWeekNumbering.Default},
		"trailingCurrencyCode"  : { type : "boolean",  defaultValue : true },
		"accessibility"         : { type : "boolean",  defaultValue : true },
		"autoAriaBodyRole"      : { type : "boolean",  defaultValue : false,     noUrl:true }, //whether the framework automatically adds the ARIA role 'application' to the html body
		"animation"             : { type : "boolean",  defaultValue : true }, // deprecated, please use animationMode
		"animationMode"         : { type : AnimationMode, defaultValue : undefined }, // If no value is provided, animationMode will be set on instantiation depending on the animation setting.
		"rtl"                   : { type : "boolean",  defaultValue : null },
		"debug"                 : { type : "boolean",  defaultValue : false },
		"inspect"               : { type : "boolean",  defaultValue : false },
		"originInfo"            : { type : "boolean",  defaultValue : false },
		"noConflict"            : { type : "boolean",  defaultValue : false,     noUrl:true },
		"noDuplicateIds"        : { type : "boolean",  defaultValue : true },
		"trace"                 : { type : "boolean",  defaultValue : false,     noUrl:true },
		"modules"               : { type : "string[]", defaultValue : [],        noUrl:true },
		"areas"                 : { type : "string[]", defaultValue : null,      noUrl:true },
		"onInit"                : { type : "code",     defaultValue : undefined, noUrl:true }, // could be either a reference to a JavaScript function, the name of a global function (string value) or the name of a module (indicated with prefix "module:")
		"uidPrefix"             : { type : "string",   defaultValue : "__",      noUrl:true },
		"ignoreUrlParams"       : { type : "boolean",  defaultValue : false,     noUrl:true },
		"preload"               : { type : "string",   defaultValue : "auto" },
		"rootComponent"         : { type : "string",   defaultValue : "",        noUrl:true },
		"preloadLibCss"         : { type : "string[]", defaultValue : [] },
		"application"           : { type : "string",   defaultValue : "" },
		"appCacheBuster"        : { type : "string[]", defaultValue : [] },
		"bindingSyntax"         : { type : "string",   defaultValue : "default", noUrl:true }, // default|simple|complex
		"versionedLibCss"       : { type : "boolean",  defaultValue : false },
		"manifestFirst"         : { type : "boolean",  defaultValue : false },
		"flexibilityServices"   : { type : "string",   defaultValue : "/sap/bc/lrep"},
		"whitelistService"      : { type : "string",   defaultValue : null,      noUrl:true }, // deprecated, use allowlistService instead
		"allowlistService"      : { type : "string",   defaultValue : null,      noUrl:true }, // url/to/service
		"frameOptions"          : { type : "string",   defaultValue : "default", noUrl:true }, // default/allow/deny/trusted (default => allow)
		"frameOptionsConfig"    : { type : "object",   defaultValue : undefined, noUrl:true },  // advanced frame options configuration
		"support"               : { type : "string[]", defaultValue : null },
		"testRecorder"          : { type : "string[]", defaultValue : null },
		"activeTerminologies"   : { type : "string[]", defaultValue : undefined},
		"fileShareSupport"      : { type : "string",   defaultValue : undefined, noUrl:true }, // Module name (AMD syntax)
		"securityTokenHandlers"	: { type : "function[]", defaultValue: [],       noUrl:true },
		"productive"			: { type : "boolean",  defaultValue: false,      noUrl:true },
		"themeRoots"			: { type : "object",   defaultValue: {},  noUrl:true },
		"xx-placeholder"		: { type : "boolean",  defaultValue : true },
		"xx-rootComponentNode"  : { type : "string",   defaultValue : "",        noUrl:true },
		"xx-appCacheBusterMode" : { type : "string",   defaultValue : "sync" },
		"xx-appCacheBusterHooks": { type : "object",   defaultValue : undefined, noUrl:true }, // e.g.: { handleURL: fn, onIndexLoad: fn, onIndexLoaded: fn }
		"xx-disableCustomizing" : { type : "boolean",  defaultValue : false,     noUrl:true },
		"xx-viewCache"          : { type : "boolean",  defaultValue : true },
		"xx-depCache"           : { type : "boolean",  defaultValue : false },
		"xx-libraryPreloadFiles": { type : "string[]", defaultValue : [] },
		"xx-componentPreload"   : { type : "string",   defaultValue : "" },
		"xx-designMode"         : { type : "boolean",  defaultValue : false },
		"xx-supportedLanguages" : { type : "string[]", defaultValue : [] }, // *=any, sapui5 or list of locales
		"xx-bootTask"           : { type : "function", defaultValue : undefined, noUrl:true },
		"xx-suppressDeactivationOfControllerCode" : { type : "boolean",  defaultValue : false }, //temporarily to suppress the deactivation of controller code in design mode
		"xx-lesssupport"        : { type : "boolean",  defaultValue : false },
		"xx-handleValidation"   : { type : "boolean",  defaultValue : false },
		"xx-fiori2Adaptation"   : { type : "string[]",  defaultValue : [] },
		"xx-cache-use"          : { type : "boolean",  defaultValue : true},
		"xx-cache-excludedKeys" : { type : "string[]", defaultValue : []},
		"xx-cache-serialization": { type : "boolean",  defaultValue : false},
		"xx-nosync"             : { type : "string",   defaultValue : "" },
		"xx-waitForTheme"       : { type : "string",  defaultValue : ""}, // rendering|init
		"xx-hyphenation" : { type : "string",  defaultValue : ""}, // (empty string)|native|thirdparty|disable
		"xx-flexBundleRequestForced" : { type : "boolean",  defaultValue : false },
		"xx-skipAutomaticFlLibLoading" : { type : "boolean",  defaultValue: false },
		"xx-cssVariables"       : { type : "string",   defaultValue : "false" }, // false|true|additional (additional just includes the css_variables.css in addition)
		"xx-debugModuleLoading"	: { type : "boolean",  defaultValue: false },
		"statistics"            : { type : "boolean",  defaultValue : false },
		"xx-acc-keys"           : { type : "boolean",  defaultValue : false },
		"xx-measure-cards"      : { type : "boolean",  defaultValue : false }
	};

	// Lazy dependency to core
	var oCore;

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
			oCore && oCore.fireLocalizationChanged(mChangesToReport);
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
	 *
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

	/* Object that carries the real configuration data */
	var config = {};

	var bInitialized = false;

	function init() {
		bInitialized = true;

		// apply settings from global config object (already merged with script tag attributes)
		var oCfg = window["sap-ui-config"] || {};
		for (var n in M_SETTINGS) {
			// collect the defaults
			config[n] = Array.isArray(M_SETTINGS[n].defaultValue) ? [] : M_SETTINGS[n].defaultValue;
			if ( oCfg.hasOwnProperty(n.toLowerCase()) ) {
				setValue(n, oCfg[n.toLowerCase()]);
			} else if ( !/^xx-/.test(n) && oCfg.hasOwnProperty("xx-" + n.toLowerCase()) ) {
				setValue(n, oCfg["xx-" + n.toLowerCase()]);
			}
		}

		var oUriParams;

		// apply the settings from the url (only if not blocked by app configuration)
		if ( !config.ignoreUrlParams ) {
			var sUrlPrefix = "sap-ui-";
			oUriParams = new URLSearchParams(window.location.search);

			// now analyze sap-ui parameters
			for (var n in M_SETTINGS) {
				if ( M_SETTINGS[n].noUrl ) {
					continue;
				}
				var sValue = oUriParams.get(sUrlPrefix + n);
				if ( sValue == null && !/^xx-/.test(n) ) {
					sValue = oUriParams.get(sUrlPrefix + "xx-" + n);
				}
				if (sValue === "") {
					//empty URL parameters set the parameter back to its system default
					config[n] = M_SETTINGS[n].defaultValue;
				} else {
					//sets the value (null or empty value ignored)
					setValue(n, sValue);
				}
			}
		}

		// log  all non default value
		for (var n in M_SETTINGS) {
			if ( config[n] !== M_SETTINGS[n].defaultValue ) {
				Log.info("  " + n + " = " + config[n]);
			}
		}
	}

	var oFormatSettings;

	Object.assign(Configuration, /** @lends sap.ui.core.Configuration */ {
		/**
		 * Returns the version of the framework.
		 *
		 * Similar to <code>sap.ui.version</code>.
		 *
		 * @return {module:sap/base/util/Version} the version
		 * @public
		 */
		getVersion: function () {
			if (config._version) {
				return config._version;
			}

			config._version = new Version(VERSION);
			return config._version;
		},

		getCompatibilityVersion : getCompatibilityVersion,

		/**
		 * Returns the theme name
		 * @return {string} the theme name
		 * @function
		 * @public
		 * @deprecated Since 1.119. Please use {@link module:sap/ui/core/Theming.getTheme} instead.
		 */
		getTheme : Theming.getTheme,

		/**
		 * Allows setting the theme name
		 * @param {string} sTheme the theme name
		 * @return {this} <code>this</code> to allow method chaining
		 * @public
		 * @deprecated Since 1.119. Please use {@link module:sap/ui/core/Theming.setTheme} instead.
		 */
		setTheme : function (sTheme) {
			Theming.setTheme(sTheme);
			return this;
		},

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
		 * For a normalized BCP47 tag, call {@link #getLanguageTag} or call {@link #getLocale} to get a
		 * {@link sap.ui.core.Locale Locale} object matching the language.
		 *
		 * @return {string} Language string as configured
		 * @function
		 * @public
		 * @deprecated Since 1.119. Please use {@link module:sap/base/i18n/Localization.getLanguage} instead.
		 */
		getLanguage :  Localization.getLanguage,


		/**
		 * Sets a new language to be used from now on for language/region dependent
		 * functionality (e.g. formatting, data types, translated texts, ...).
		 *
		 * When the language can't be interpreted as a BCP47 language (using the relaxed syntax
		 * described in {@link #getLanguage}, an error will be thrown.
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
		 * <li>Elements or Controls that implement the <code>onlocalizationChanged</code> hook
		 *     (note the lowercase 'l' in onlocalizationChanged)</li>
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
		 * to the given language. A given value will be returned by the {@link #getSAPLogonLanguage} method.
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
		 *
		 * @see http://scn.sap.com/docs/DOC-14377
		 * @function
		 * @public
		 * @deprecated Since 1.119. Please use {@link module:sap/base/i18n/Localization.setLanguage} instead.
		 */
		setLanguage : function() {
			Localization.setLanguage.apply(Localization, arguments);
			return Configuration;
		},

		/**
		 * Returns a BCP47-compliant language tag for the current language.
		 *
		 * The return value of config method is especially useful for an HTTP <code>Accept-Language</code> header.
		 *
		 * Retrieves the modern locale,
		 * e.g. sr-Latn (Serbian (Cyrillic)), he (Hebrew), yi (Yiddish)
		 *
		 * @returns {string} The language tag for the current language, conforming to BCP47
		 * @function
		 * @public
		 * @deprecated Since 1.119. Please use {@link module:sap/base/i18n/Localization.getLanguageTag} instead.
		 */
		getLanguageTag : function () {
			return Localization.getLanguageTag().toString();
		},

		/**
		 * Returns an SAP logon language for the current language.
		 *
		 * It will be returned in uppercase.
		 * e.g. "EN", "DE"
		 *
		 * @returns {string} The SAP logon language code for the current language
		 * @function
		 * @public
		 * @deprecated Since 1.119. Please use {@link module:sap/base/i18n/Localization.getSAPLogonLanguage} instead.
		 */
		getSAPLogonLanguage : Localization.getSAPLogonLanguage,

		/**
		 * Retrieves the configured IANA timezone ID.
		 *
		 * @returns {string} The configured IANA timezone ID, e.g. "America/New_York"
		 * @function
		 * @public
		 * @deprecated Since 1.119. Please use {@link module:sap/base/i18n/Localization.getTimezone} instead.
		 */
		getTimezone : Localization.getTimezone,

		/**
		 * Sets the timezone such that all date and time based calculations use config timezone.
		 *
		 * <b>Important:</b> It is strongly recommended to only use config API at the earliest point
		 * of time while initializing a UI5 app. A later adjustment of the time zone should be
		 * avoided. It can lead to unexpected data inconsistencies in a running application,
		 * because date objects could still be related to a previously configured time zone.
		 * Instead, the app should be completely restarted with the new time zone.
		 * For more information, see
		 * {@link topic:6c9e61dc157a40c19460660ece8368bc Dates, Times, Timestamps, and Time Zones}.
		 *
		 * When the timezone has changed, the Core will fire its
		 * {@link sap.ui.core.Core#event:localizationChanged localizationChanged} event.
		 *
		 * @param {string|null} [sTimezone] IANA timezone ID, e.g. "America/New_York". Use <code>null</code> to reset the timezone to the browser's local timezone.
		 *   An invalid IANA timezone ID will fall back to the browser's timezone.
		 * @function
		 * @public
		 * @return {this} <code>this</code> to allow method chaining
		 * @since 1.99.0
		 * @deprecated Since 1.119. Please use {@link module:sap/base/i18n/Localization.setTimezone} instead.
		 */
		setTimezone : function() {
			Localization.setTimezone.apply(Localization, arguments);
			return Configuration;
		},

		/**
		 * Returns the calendar type which is being used in locale dependent functionality.
		 *
		 * When it's explicitly set by calling <code>setCalendar</code>, the set calendar type is returned.
		 * Otherwise, the calendar type is determined by checking the format settings and current locale.
		 *
		 * @return {sap.ui.core.CalendarType} the current calendar type, e.g. <code>Gregorian</code>
		 * @since 1.28.6
		 * @function
		 * @public
		 * @deprecated As of Version 1.120. Please use {@link module:sap/base/i18n/Formatting.getCalendarType} instead.
		 */
		getCalendarType: Formatting.getCalendarType,

		/**
		 * Returns the calendar week numbering algorithm used to determine the first day of the week
		 * and the first calendar week of the year, see {@link sap.ui.core.date.CalendarWeekNumbering}.
		 *
		 * @returns {sap.ui.core.date.CalendarWeekNumbering} The calendar week numbering algorithm
		 * @function
		 * @public
		 * @since 1.113.0
		 * @deprecated As of Version 1.120. Please use {@link module:sap/base/i18n/Formatting.getCalendarWeekNumbering} instead.
		 */
		getCalendarWeekNumbering: Formatting.getCalendarWeekNumbering,

		/**
		 * Returns whether the page uses the RTL text direction.
		 *
		 * If no mode has been explicitly set (neither <code>true</code> nor <code>false</code>),
		 * the mode is derived from the current language setting.
		 *
		 * @returns {boolean} whether the page uses the RTL text direction
		 * @function
		 * @public
		 * @deprecated Since 1.119. Please use {@link module:sap/base/i18n/Localization.getRTL} instead.
		 */
		getRTL :Localization.getRTL,

		/**
		 * Sets the character orientation mode to be used from now on.
		 *
		 * Can either be set to a concrete value (true meaning right-to-left,
		 * false meaning left-to-right) or to <code>null</code> which means that
		 * the character orientation mode should be derived from the current
		 * language (incl. region) setting.
		 *
		 * After changing the character orientation mode, the framework tries
		 * to update localization specific parts of the UI. See the documentation of
		 * {@link #setLanguage} for details and restrictions.
		 *
		 * <b>Note</b>: See documentation of {@link #setLanguage} for restrictions.
		 *
		 * @param {boolean|null} bRTL new character orientation mode or <code>null</code>
		 * @returns {this} <code>this</code> to allow method chaining
		 * @function
		 * @public
		 * @deprecated Since 1.119. Please use {@link module:sap/base/i18n/Localization.setRTL} instead.
		 */
		setRTL : function() {
			Localization.setRTL.apply(Localization, arguments);
			return Configuration;
		},

		/**
		 * Returns a Locale object for the current language.
		 *
		 * The Locale is derived from the {@link #getLanguage language} property.
		 *
		 * @return {sap.ui.core.Locale} The locale
		 * @public
		 * @deprecated Since 1.119. Please use {@link module:sap/base/i18n/Localization.getLanguageTag} instead.
		 */
		getLocale : function() {
			var oLanguageTag = Localization.getLanguageTag();
			return Locale._getCoreLocale(oLanguageTag);
		},

		/**
		 * Sets the new calendar type to be used from now on in locale dependent functionality (for example,
		 * formatting, translation texts, etc.).
		 *
		 * @param {sap.ui.core.CalendarType|null} sCalendarType the new calendar type. Set it with null to clear the calendar type
		 *   and the calendar type is calculated based on the format settings and current locale.
		 * @return {this} <code>this</code> to allow method chaining
		 * @public
		 * @since 1.28.6
		 * @deprecated As of Version 1.120. Please use {@link module:sap/base/i18n/Formatting.setCalendarType} instead.
		 */
		setCalendarType : function(sCalendarType) {
			Formatting.setCalendarType.apply(Formatting, arguments);
			return this;
		},

		/**
		 * Sets the calendar week numbering algorithm which is used to determine the first day of the week
		 * and the first calendar week of the year, see {@link sap.ui.core.date.CalendarWeekNumbering}.
		 *
		 * @param {sap.ui.core.date.CalendarWeekNumbering} sCalendarWeekNumbering
		 *   The calendar week numbering algorithm
		 * @returns {this}
		 *   <code>this</code> to allow method chaining
		 * @throws {Error}
		 *   If <code>sCalendarWeekNumbering</code> is not a valid calendar week numbering algorithm,
		 *   defined in {@link sap.ui.core.date.CalendarWeekNumbering}
		 *
		 * @public
		 * @since 1.113.0
		 * @deprecated As of Version 1.120. Please use {@link module:sap/base/i18n/Formatting.setCalendarWeekNumbering} instead.
		 */
		setCalendarWeekNumbering: function(sCalendarWeekNumbering) {
			Formatting.setCalendarWeekNumbering.apply(Formatting, arguments);
			return this;
		},

		/**
		 * Returns the format locale string with language and region code. Falls back to
		 * language configuration, in case it has not been explicitly defined.
		 *
		 * @return {string} the format locale string with language and country code
		 * @public
		 * @deprecated As of Version 1.120. Please use {@link module:sap/base/i18n/Formatting.getLanguageTag} instead.
		 */
		getFormatLocale : function() {
			return Formatting.getLanguageTag().toString();
		},

		/**
		 * Sets a new format locale to be used from now on for retrieving locale
		 * specific formatters. Modifying this setting does not have an impact on
		 * the retrieval of translated texts!
		 *
		 * Can either be set to a concrete value (a BCP47 or Java locale compliant
		 * language tag) or to <code>null</code>. When set to <code>null</code> (default
		 * value) then locale specific formatters are retrieved for the current language.
		 *
		 * After changing the format locale, the framework tries to update localization
		 * specific parts of the UI. See the documentation of {@link #setLanguage} for
		 * details and restrictions.
		 *
		 * <b>Note</b>: When a format locale is set, it has higher priority than a number,
		 * date or time format defined with a call to <code>setLegacyNumberFormat</code>,
		 * <code>setLegacyDateFormat</code> or <code>setLegacyTimeFormat</code>.
		 *
		 * <b>Note</b>: See documentation of {@link #setLanguage} for restrictions.
		 *
		 * @param {string|null} sFormatLocale the new format locale as a BCP47 compliant language tag;
		 *   case doesn't matter and underscores can be used instead of dashes to separate
		 *   components (compatibility with Java Locale IDs)
		 * @return {this} <code>this</code> to allow method chaining
		 * @public
		 * @deprecated As of Version 1.120. Please use {@link module:sap/base/i18n/Formatting.setLanguageTag} instead.
		 * @throws {Error} When <code>sFormatLocale</code> is given, but is not a valid BCP47 language
		 *   tag or Java locale identifier
		 */
		setFormatLocale : function(sFormatLocale) {
			Formatting.setLanguageTag.apply(Formatting, arguments);
			return this;
		},

		getLanguagesDeliveredWithCore : Localization.getLanguagesDeliveredWithCore,

		getSupportedLanguages : Localization.getSupportedLanguages,

		/**
		 * Returns whether the accessibility mode is enabled or not.
		 * @return {boolean} whether the accessibility mode is enabled or not
		 * @public
		 * @since 1.120
		 * @function
		 * @deprecated As of Version 1.120: Please use {@link module:sap/ui/core/ControlBehavior.isAccessibilityEnabled} instead.
		 */
		getAccessibility : ControlBehavior.isAccessibilityEnabled,

		/**
		 * Returns whether the framework automatically adds
		 * the ARIA role 'application' to the HTML body or not.
		 * @return {boolean} Wether the ARIA role 'application' should be added to the HTML body or not
		 * @since 1.27.0
		 * @public
		 */
		getAutoAriaBodyRole : function () {
			return Configuration.getValue("autoAriaBodyRole");
		},

		/**
		 * Returns whether the animations are globally used.
		 * @return {boolean} whether the animations are globally used
		 * @public
		 * @deprecated As of version 1.50.0, replaced by {@link sap.ui.core.Configuration#getAnimationMode}
		 */
		getAnimation : function () {
			var sAnimationMode = Configuration.getAnimationMode();
			// Set the animation to on or off depending on the animation mode to ensure backward compatibility.
			return (sAnimationMode !== Configuration.AnimationMode.minimal && sAnimationMode !== Configuration.AnimationMode.none);
		},

		/**
		 * Returns the current animation mode.
		 *
		 * @return {sap.ui.core.Configuration.AnimationMode} The current animationMode
		 * @since 1.50.0
		 * @function
		 * @public
		 * @deprecated As of Version 1.120: Please use {@link module:sap/ui/core/ControlBehavior.getAnimationMode} instead.
		 */
		getAnimationMode : ControlBehavior.getAnimationMode,

		/**
		 * Sets the current animation mode.
		 *
		 * Expects an animation mode as string and validates it. If a wrong animation mode was set, an error is
		 * thrown. If the mode is valid it is set, then the attributes <code>data-sap-ui-animation</code> and
		 * <code>data-sap-ui-animation-mode</code> of the HTML document root element are also updated.
		 * If the <code>animationMode</code> is <code>Configuration.AnimationMode.none</code> the old
		 * <code>animation</code> property is set to <code>false</code>, otherwise it is set to <code>true</code>.
		 *
		 * @param {sap.ui.core.Configuration.AnimationMode} sAnimationMode A valid animation mode
		 * @throws {Error} If the provided <code>sAnimationMode</code> does not exist, an error is thrown
		 * @since 1.50.0
		 * @function
		 * @public
		 * @deprecated As of Version 1.120: Please use {@link module:sap/ui/core/ControlBehavior.setAnimationMode} instead.
		 */
		setAnimationMode : ControlBehavior.setAnimationMode,

		/**
		 * Returns whether the Fiori2Adaptation is on.
		 * @return {boolean|string} false - no adaptation, true - full adaptation, comma-separated list - partial adaptation
		 * Possible values: style, collapse, title, back, hierarchy
		 * @public
		 * @deprecated As of Version 1.120
		 */
		getFiori2Adaptation : function () {
			var aAdaptations = BaseConfig.get({
					name: "sapUiXxFiori2Adaptation",
					type: BaseConfig.Type.StringArray,
					external: true
				}),
				bAdaptationEnabled;
			//parse fiori 2 adaptation parameters
			if ( aAdaptations.length === 0 || (aAdaptations.length === 1 && aAdaptations[0] === 'false') ) {
				bAdaptationEnabled = false;
			} else if ( aAdaptations.length === 1 && aAdaptations[0] === 'true' ) {
				bAdaptationEnabled = true;
			}

			return bAdaptationEnabled === undefined ? aAdaptations : bAdaptationEnabled;
		},

		/**
		 * Returns whether the page runs in full debug mode.
		 * @returns {boolean} Whether the page runs in full debug mode
		 * @public
		 * @function
		 * @deprecated As of version 1.120.
		 */
		getDebug : Supportability.isDebugModeEnabled,

		/**
		 * Returns whether the UI5 control inspe ctor is displayed.
		 * Has only an effect when the sap-ui-debug module has been loaded
		 * @return {boolean} whether the UI5 control inspector is displayed
		 * @public
		 * @function
		 * @deprecated As of Version 1.120.
		 */
		getInspect : Supportability.isControlInspectorEnabled,

		/**
		 * Returns whether the text origin information is collected.
		 * @return {boolean} whether the text info is collected
		 * @public
		 * @function
		 * @deprecated As of Version 1.120.
		 */
		getOriginInfo : Supportability.collectOriginInfo,

		/**
		 * Returns whether there should be an exception on any duplicate element IDs.
		 * @return {boolean} whether there should be an exception on any duplicate element IDs
		 * @public
		 */
		getNoDuplicateIds : function () {
			return BaseConfig.get({ name: "sapUiNoDuplicateIds", type: BaseConfig.Type.Boolean, defaultValue: true, external: true });
		},

		/**
		 * Prefix to be used for automatically generated control IDs.
		 * Default is a double underscore "__".
		 *
		 * @returns {string} the prefix to be used
		 * @public
		 * @deprecated since 1.119.0. Please use {@link sap.ui.base.ManagedObjectMetadata.getUIDPrefix ManagedObjectMetadata.getUIDPrefix} instead.
		 */
		getUIDPrefix : function() {
			var ManagedObjectMetadata = sap.ui.require("sap/ui/base/ManagedObjectMetadata");
			return ManagedObjectMetadata.getUIDPrefix();
		},

		/**
		 * Return whether the design mode is active or not.
		 *
		 * @returns {boolean} whether the design mode is active or not.
		 * @since 1.13.2
		 * @private
		 * @ui5-restricted sap.ui.core.Core, sap.watt, com.sap.webide, sap.ui.fl, sap.ui.rta, sap.ui.comp, SAP Business Application Studio
		 * @deprecated As of Version 1.120
		 */
		getDesignMode : DesignTime.isDesignModeEnabled,

		/**
		 * Return whether the activation of the controller code is suppressed.
		 *
		 * @returns {boolean} whether the activation of the controller code is suppressed or not
		 * @since 1.13.2
		 * @private
		 * @ui5-restricted sap.watt, com.sap.webide
		 * @deprecated As of Version 1.120
		 */
		getSuppressDeactivationOfControllerCode : DesignTime.isControllerCodeDeactivationSuppressed,

		/**
		 * Return whether the controller code is deactivated. During design mode the.
		 *
		 * @returns {boolean} whether the activation of the controller code is suppressed or not
		 * @since 1.26.4
		 * @private
		 * @ui5-restricted sap.watt, com.sap.webide
		 * @deprecated As of Version 1.120
		 */
		getControllerCodeDeactivated : DesignTime.isControllerCodeDeactivated,

		/**
		 * The name of the application to start or empty.
		 *
		 * @returns {string} name of the application
		 * @public
		 * @deprecated Since 1.15.1. Please use {@link module:sap/ui/core/ComponentSupport} instead. See also {@link topic:82a0fcecc3cb427c91469bc537ebdddf Declarative API for Initial Components}.
		 */
		getApplication : function() {
			return Configuration.getValue("application");
		},

		/**
		 * The name of the root component to start or empty.
		 *
		 * @returns {string} name of the root component
		 * @public
		 * @deprecated Since 1.95. Please use {@link module:sap/ui/core/ComponentSupport} instead. See also {@link topic:82a0fcecc3cb427c91469bc537ebdddf Declarative API for Initial Components}.
		 */
		getRootComponent : function() {
			return Configuration.getValue("rootComponent");
		},

		/**
		 * Base URLs to AppCacheBuster ETag-Index files.
		 *
		 * @returns {string[]} array of base URLs
		 * @public
		 * @deprecated Since 1.120.0
		 */
		getAppCacheBuster : function() {
			return BaseConfig.get({name: "sapUiAppCacheBuster", type: BaseConfig.Type.StringArray, external: true, freeze: true});
		},

		/**
		 * The loading mode (sync|async|batch) of the AppCacheBuster (sync is default)
		 *
		 * @returns {string} "sync" | "async" | "batch"
		 * @public
		 * @deprecated Since 1.120.0
		 */
		getAppCacheBusterMode : function() {
			return BaseConfig.get({name: "sapUiXxAppCacheBusterMode", type: BaseConfig.Type.String, defaultValue: "sync", external: true, freeze: true});
		},

		/**
		 * Flag, whether the customizing is disabled or not.
		 *
		 * @returns {boolean} true if customizing is disabled
		 * @private
		 * @ui5-restricted
		 */
		getDisableCustomizing : function() {
			return BaseConfig.get({name: "sapUiXxDisableCustomizing", type: BaseConfig.Type.Boolean});
		},

		/**
		 * Flag whether a Component should load the manifest first.
		 *
		 * @returns {boolean} true if a Component should load the manifest first
		 * @public
		 * @since 1.33.0
		 * @deprecated As of 1.120, manifest-first is the default for the {@link sap.ui.core.Component.create} factory.
		 */
		getManifestFirst : function() {
			return BaseConfig.get({name: "sapUiManifestFirst", type: BaseConfig.Type.Boolean, external: true});
		},

		/**
		 * Returns the URL from where the UI5 flexibility services are called;
		 * if empty, the flexibility services are not called.
		 *
		 * @returns {object[]} Flexibility services configuration
		 * @public
		 * @since 1.60.0
		 * @deprecated As of Version 1.120.0
		 */
		getFlexibilityServices : function() {
			var FlexConfig = sap.ui.require("sap/ui/fl/initial/_internal/config");
			var vFlexibilityServices;
			if (FlexConfig) {
				vFlexibilityServices = FlexConfig.getFlexibilityServices();
			} else {
				const aDefaultValue = [{
					url: "/sap/bc/lrep",
					connector: "LrepConnector"
				}];
				vFlexibilityServices = BaseConfig.get({
					name: "sapUiFlexibilityServices",
					type: (value) => {
						if (value && typeof value === "string") {
							if (value[0] === "/") {
								aDefaultValue[0].url = value;
								value = aDefaultValue;
							} else {
								value = JSON.parse(value);
							}
						}
						return value || [];
					},
					defaultValue: aDefaultValue,
					external: true
				});
			}
			return vFlexibilityServices;
		},

		/**
		 * Returns a configuration object that bundles the format settings of UI5.
		 *
		 * @returns {sap.ui.core.Configuration.FormatSettings} A FormatSettings object.
		 * @public
		 * @deprecated As of Version 1.120. Please use {@link module:sap/base/i18n/Formatting} instead.
		 */
		getFormatSettings : function() {
			return oFormatSettings;
		},

		/**
		 * frameOptions mode (allow/deny/trusted).
		 *
		 * @return {string} frameOptions mode
		 * @public
		 * @function
		 * @deprecated Since 1.120. Please use {@link module:sap/ui/security/Security.getFrameOptions} instead.
		 */
		getFrameOptions : Security.getFrameOptions,

		/**
		 * URL of the whitelist service.
		 *
		 * @return {string} whitelist service URL
		 * @public
		 * @function
		 * @deprecated Since 1.85.0. Use {@link module:sap/ui/security/Security.getAllowlistService} instead.
		 * SAP strives to replace insensitive terms with inclusive language.
		 * Since APIs cannot be renamed or immediately removed for compatibility reasons, this API has been deprecated.
		 */
		getWhitelistService : Security.getAllowlistService,

		/**
		 * URL of the allowlist service.
		 *
		 * @return {string} allowlist service URL
		 * @public
		 * @function
		 * @deprecated Since 1.120. Please use {@link module:sap/ui/security/Security.getAllowlistService} instead.
		*/
		getAllowlistService : Security.getAllowlistService,

		/**
		 * Name (ID) of a UI5 module that implements file share support.
		 *
		 * If no implementation is known, <code>undefined</code> is returned.
		 *
		 * The contract of the module is not defined by the configuration API.
		 *
		 * @returns {string|undefined} Module name (ID) of a file share support module
		 * @public
		 * @since 1.102
		 * @deprecated As of version 1.120.0
		 */
		getFileShareSupport : function() {
			return BaseConfig.get({
				name: "sapUiFileShareSupport",
				type: BaseConfig.Type.String,
				defaultValue: undefined
			});
		},

		/**
		 * Flag if statistics are requested.
		 *
		 * Flag set by TechnicalInfo Popup will also be checked
		 * So its active if set by URL parameter or by TechnicalInfo property
		 *
		 * @returns {boolean} statistics flag
		 * @private
		 * @deprecated since 1.106.0. Renamed for clarity, use {@link sap.ui.core.Configuration#getStatisticsEnabled} instead
		 * @since 1.20.0
		 */
		getStatistics : function() {
			return Configuration.getStatisticsEnabled();
		},

		/**
		 * Flag if statistics are requested.
		 *
		 * Flag set by TechnicalInfo Popup will also be checked.
		 * So its active if set by URL parameter or manually via TechnicalInfo.
		 *
		 * @returns {boolean} Whether statistics are enabled
		 * @public
		 * @since 1.106.0
		 * @function
		 * @deprecated As of Version 1.120.
		 */
		getStatisticsEnabled : Supportability.isStatisticsEnabled,

		/**
		 * Return whether native scrolling should be suppressed on touch devices.
		 *
		 * @returns {boolean} whether native scrolling is suppressed on touch devices
		 * @since 1.20.0
		 * @deprecated since 1.26.0. Always use native scrolling
		 * @private
		 */
		getNoNativeScroll : function() {
			return false;
		},

		/**
		 * Returns the list of active terminologies defined via the Configuration.
		 *
		 * @returns {string[]|undefined} if no active terminologies are set, the default value <code>undefined</code> is returned.
		 * @since 1.77.0
		 * @public
		 * @function
		 * @deprecated Since 1.118. Please use {@link module:sap/base/i18n/Localization.getActiveTerminologies} instead.
		 */
		getActiveTerminologies : Localization.getActiveTerminologies,

		/**
		 * Returns the security token handlers of an OData V4 model.
		 *
		 * @returns {Array<function(sap.ui.core.URI):Promise>} the security token handlers (an empty array if there are none)
		 * @public
		 * @function
		 * @deprecated Since 1.120. Please use {@link module:sap/ui/security/Security.getSecurityTokenHandlers} instead.
		 * @see #setSecurityTokenHandlers
		 */
		getSecurityTokenHandlers : Security.getSecurityTokenHandlers,

		/**
		 * Sets the security token handlers for an OData V4 model. See chapter
		 * {@link topic:9613f1f2d88747cab21896f7216afdac/section_STH Security Token Handling}.
		 *
		 * @param {Array<function(sap.ui.core.URI):Promise>} aSecurityTokenHandlers - The security token handlers
		 * @public
		 * @function
		 * @deprecated Since 1.120. Please use {@link module:sap/ui/security/Security.setSecurityTokenHandlers} instead.
		 * @see #getSecurityTokenHandlers
		 */
		setSecurityTokenHandlers : Security.setSecurityTokenHandlers,

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
		},

		/**
		 * Function to pass core instance to configuration. Should be only used by core constructor.
		 *
		 * @param {sap.ui.core.Core} oCore Instance of 'real' core
		 *
		 * @private
	 	 * @ui5-restricted sap.ui.core.Core
		 */
		setCore: function (oNewCore) {
			// Setting the core needs to happen before init
			// because getValue relies on oCore and is used in init
			oCore = oNewCore;
			init();
		},

		/**
		 * Generic getter for configuration options that are not explicitly exposed via a dedicated own getter.
		 *
		 * For now, this getter only supports configuration options that are known to Configuration.js
		 * (as maintained in the M_SETTINGS, see code).
		 *
		 * @param {string} sName Name of the configuration parameter, must be a key of M_SETTINGS
		 * @returns {any} Value of the configuration parameter, will be of the type specified in M_SETTINGS
		 *
		 * @private
	 	 * @ui5-restricted sap.ui.core.Core, jquery.sap.global
	 	 * @since 1.106
		 */
		getValue: function(sName) {
			var vValue;
			if (typeof sName !== "string" || !Object.hasOwn(M_SETTINGS, sName)) {
				throw new TypeError(
					"Parameter 'sName' must be the name of a valid configuration option (one of "
					+ Object.keys(M_SETTINGS).map(function(key) {
						return "'" + key + "'";
					  }).sort().join(", ")
					+ ")"
				);
			}

			// Until the Configuration is initialized we return the configuration value either from the instance
			// (if a setter was called), from URL or window["sap-ui-config"].
			// In case there is no value or the type conversion fails we return the defaultValue.
			// After the Configuration is initialized we only return the value of the configuration.
			if (bInitialized || config.hasOwnProperty(sName)) {
				vValue = config[sName];
			} else {
				if (!config.ignoreUrlParams && !M_SETTINGS[sName].noUrl) {
					var oUriParams = new URLSearchParams(window.location.search);
					vValue = oUriParams.get("sap-ui-" + sName) || oUriParams.get("sap-" + sName);
				}
				vValue = vValue ? vValue : window["sap-ui-config"][sName] || window["sap-ui-config"][sName.toLowerCase()];
				try {
					vValue = vValue === undefined ? M_SETTINGS[sName].defaultValue : convertToType(sName, vValue);
				} catch (error) {
					// If type conversion fails return defaultValue
					vValue = M_SETTINGS[sName].defaultValue;
				}
			}
			// Return copy of array or object instead of reference
			if (typeof M_SETTINGS[sName].type === "string" &&
				(M_SETTINGS[sName].type.endsWith("[]") || M_SETTINGS[sName].type === "object")) {
				vValue = deepClone(vValue);
			}
			return vValue;
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
	 * @deprecated As of Version 1.120. Please use {@link module:sap/ui/core/AnimationMode} instead.
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

	/*
	 * Helper that creates a Locale object from the given language
	 * or, if that fails, returns null.
	 * A value of null indicates that the language was not BCP47 compliant.
	 */
	function convertToLocaleOrNull(sLanguage) {
		try {
			if ( sLanguage && typeof sLanguage === 'string' ) {
				return new Locale( sLanguage );
			}
		} catch (e) {
			// ignore
		}
	}

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
	 * @deprecated As of Version 1.120. Please use {@link module:sap/base/i18n/Formatting} instead.
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
	 * @borrows module:sap/base/i18n/Formatting.getLegacyDateCalendarCustomizing as #getLegacyDateCalendarCustomizing
	 * @borrows module:sap/base/i18n/Formatting.setLegacyDateCalendarCustomizing as #setLegacyDateCalendarCustomizing
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

		/**
		 * Returns the locale to be used for formatting.
		 *
		 * If no such locale has been defined, this method falls back to the language,
		 * see {@link sap.ui.core.Configuration#getLanguage Configuration.getLanguage()}.
		 *
		 * If any user preferences for date, time or number formatting have been set,
		 * and if no format locale has been specified, then a special private use subtag
		 * is added to the locale, indicating to the framework that these user preferences
		 * should be applied.
		 *
		 * @return {sap.ui.core.Locale} the format locale
		 * @public
		 * @deprecated As of Version 1.120. Please use {@link module:sap/base/i18n/Formatting.getLanguageTag} instead.
		 */
		getFormatLocale : function() {
			var oLocale = Formatting.getLanguageTag();
			return Locale._getCoreLocale(oLocale);
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
		 * See class {@link sap.ui.core.format.DateFormat} for details about the pattern syntax.
		 *
		 * After changing the date pattern, the framework tries to update localization
		 * specific parts of the UI. See the documentation of {@link sap.ui.core.Configuration#setLanguage}
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
		 * See class {@link sap.ui.core.format.DateFormat} for details about the pattern syntax.
		 *
		 * After changing the time pattern, the framework tries to update localization
		 * specific parts of the UI. See the documentation of {@link sap.ui.core.Configuration#setLanguage}
		 * for details and restrictions.
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
		 * See class {@link sap.ui.core.format.NumberFormat} for details about the symbols.
		 *
		 * After changing the number symbol, the framework tries to update localization
		 * specific parts of the UI. See the documentation of {@link sap.ui.core.Configuration#setLanguage}
		 * for details and restrictions.
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

		/**
		 * Defines the day used as the first day of the week.
		 *
		 * The day is set as an integer value between 0 (Sunday) and 6 (Saturday).
		 * Calling this method with a null or undefined symbol removes a previously set value.
		 *
		 * If a value is defined, it will be preferred over values derived from the current locale.
		 *
		 * Usually in the US the week starts on Sunday while in most European countries on Monday.
		 * There are special cases where you want to have the first day of week set independent of the
		 * user locale.
		 *
		 * After changing the first day of week, the framework tries to update localization
		 * specific parts of the UI. See the documentation of {@link sap.ui.core.Configuration#setLanguage}
		 * for details and restrictions.
		 *
		 * @param {int} iValue must be an integer value between 0 and 6
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 * @deprecated Since 1.113.0. Use {@link sap.ui.core.Configuration.FormatSettings#setCalendarWeekNumbering} instead.
		 */
		setFirstDayOfWeek : function(iValue) {
			check(typeof iValue == "number" && iValue >= 0 && iValue <= 6, "iValue must be an integer value between 0 and 6");
			Formatting._set("weekData-firstDay", iValue);
			return this;
		},

		_setDayPeriods: Formatting._setDayPeriods,

		getLegacyDateFormat : Formatting.getLegacyDateFormat,

		/**
		 * Allows to specify one of the legacy ABAP date formats.
		 *
		 * This method modifies the date patterns for 'short' and 'medium' style with the corresponding ABAP
		 * format. When called with a null or undefined format id, any previously applied format will be removed.
		 *
		 * After changing the legacy date format, the framework tries to update localization
		 * specific parts of the UI. See the documentation of {@link sap.ui.core.Configuration#setLanguage}
		 * for details and restrictions.
		 *
		 * @param {""|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"A"|"B"|"C"} [sFormatId=""] ID of the ABAP date format,
		 *   <code>""</code> will reset the date patterns for 'short' and 'medium' style to the
		 *   locale-specific ones.
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 * @function
		 */
		setLegacyDateFormat : function() {
			Formatting.setLegacyDateFormat.apply(Formatting, arguments);
			return this;
		},

		getLegacyTimeFormat : Formatting.getLegacyTimeFormat,

		/**
		 * Allows to specify one of the legacy ABAP time formats.
		 *
		 * This method sets the time patterns for 'short' and 'medium' style to the corresponding ABAP
		 * formats and sets the day period texts to "AM"/"PM" or "am"/"pm" respectively. When called
		 * with a null or undefined format id, any previously applied format will be removed.
		 *
		 * After changing the legacy time format, the framework tries to update localization
		 * specific parts of the UI. See the documentation of {@link sap.ui.core.Configuration#setLanguage}
		 * for details and restrictions.
		 *
		 * @param {""|"0"|"1"|"2"|"3"|"4"} [sFormatId=""] ID of the ABAP time format,
		 *   <code>""</code> will reset the time patterns for 'short' and 'medium' style and the day
		 *   period texts to the locale-specific ones.
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 * @function
		 */
		setLegacyTimeFormat : function() {
			Formatting.setLegacyTimeFormat.apply(Formatting, arguments);
			return this;
		},

		getLegacyNumberFormat : Formatting.getLegacyNumberFormat,

		/**
		 * Allows to specify one of the legacy ABAP number format.
		 *
		 * This method will modify the 'group' and 'decimal' symbols. When called with a null
		 * or undefined format id, any previously applied format will be removed.
		 *
		 * After changing the legacy number format, the framework tries to update localization
		 * specific parts of the UI. See the documentation of {@link sap.ui.core.Configuration#setLanguage}
		 * for details and restrictions.
		 *
		 * @param {""|" "|"X"|"Y"} [sFormatId=""] ID of the ABAP number format set,
		 *   <code>""</code> will reset the 'group' and 'decimal' symbols to the locale-specific
		 *   ones.
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 * @function
		 */
		setLegacyNumberFormat : function() {
			Formatting.setLegacyNumberFormat.apply(Formatting, arguments);
			return this;
		},

		setLegacyDateCalendarCustomizing : function() {
			Formatting.setLegacyDateCalendarCustomizing.apply(Formatting, arguments);
			return this;
		},

		getLegacyDateCalendarCustomizing : Formatting.getLegacyDateCalendarCustomizing,

		setTrailingCurrencyCode : function() {
			Formatting.setTrailingCurrencyCode.apply(Formatting, arguments);
			return this;
		},

		getTrailingCurrencyCode : Formatting.getTrailingCurrencyCode,

		getCustomLocaleData : Formatting.getCustomLocaleData
	});

	/**
	 * @deprecated As of Version 1.120
	 */
	oFormatSettings = new FormatSettings(this);

	//enable Eventing
	Localization.attachChange(function(oEvent) {
		if (!mChanges && oCore) {
			oCore.fireLocalizationChanged(BaseEvent.getParameters(oEvent));
		} else if (mChanges) {
			Object.assign(mChanges, BaseEvent.getParameters(oEvent));
		}
	});

	Formatting.attachChange(function(oEvent) {
		if (!mChanges && oCore) {
			oCore.fireLocalizationChanged(BaseEvent.getParameters(oEvent));
		} else if (mChanges) {
			Object.assign(mChanges, BaseEvent.getParameters(oEvent));
		}
	});

	return Configuration;
});