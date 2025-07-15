/*!
 * ${copyright}
 */

//Provides class sap.ui.core.Configuration
sap.ui.define([
	'../Device',
	'../base/Object',
	'./CalendarType',
	'./Locale',
	"./format/TimezoneUtil",
	'sap/ui/thirdparty/URI',
	"sap/ui/core/_ConfigurationProvider",
	"sap/ui/core/theming/ThemeHelper",
	"sap/base/util/UriParameters",
	"sap/base/util/deepEqual",
	"sap/base/util/Version",
	"sap/base/Log",
	"sap/base/assert",
	"sap/base/util/deepClone",
	"sap/base/util/extend",
	"sap/base/util/isEmptyObject"
],
	function(
		Device,
		BaseObject,
		CalendarType,
		Locale,
		TimezoneUtil,
		URI,
		_ConfigurationProvider,
		ThemeHelper,
		UriParameters,
		deepEqual,
		Version,
		Log,
		assert,
		deepClone,
		extend,
		isEmptyObject
	) {
	"use strict";

	// Singleton instance for configuration
	var oConfiguration;
	var M_SETTINGS;
	var VERSION = "${version}";
	var mCache = Object.create(null);

	// Helper Functions
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

	function setValue(sName, vValue, config) {
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
				checkEnum(vType, vValue, sName);
				return vValue;
			} else {
				throw new Error("illegal state");
			}
		}
	}

	function getMetaTagValue(sName) {
		var oMetaTag = document.querySelector("META[name='" + sName + "']"),
			sMetaContent = oMetaTag && oMetaTag.getAttribute("content");
		if (sMetaContent) {
			return sMetaContent;
		}
	}

	function validateThemeOrigin(sOrigin) {
		var sAllowedOrigins = getMetaTagValue("sap-allowedThemeOrigins");
		return !!sAllowedOrigins && sAllowedOrigins.split(",").some(function(sAllowedOrigin) {
			return sAllowedOrigin === "*" || sOrigin === sAllowedOrigin.trim();
		});
	}

	function validateThemeRoot(sThemeRoot) {
		var oThemeRoot,
			sPath;

		try {
			// Remove search query as they are not supported for themeRoots/resourceRoots
			oThemeRoot = new URI(sThemeRoot).search("");

			// If the URL is absolute, validate the origin
			var sOrigin = oThemeRoot.origin();
			if (sOrigin && validateThemeOrigin(sOrigin)) {
				sPath = oThemeRoot.toString();
			} else {
				// For relative URLs or not allowed origins
				// ensure same origin and resolve relative paths based on href
				sPath = oThemeRoot.absoluteTo(window.location.href).origin(window.location.origin).normalize().toString();
			}
			return sPath + (sPath.endsWith('/') ? '' : '/') + "UI5/";
		} catch (e) {
			// malformed URL are also not accepted
		}
	}

	var M_ANIMATION_MODE = {
		/**
		 * <code>full</code> represents a mode with unrestricted animation capabilities.
		 * @public
		 */
		full : "full",

		/**
		 * <code>basic</code> can be used for a reduced, more light-weight set of animations.
		 * @public
		 */
		basic : "basic",

		/**
		 * <code>minimal</code> includes animations of fundamental functionality.
		 * @public
		 */
		minimal : "minimal",

		/**
		 * <code>none</code> deactivates the animation completely.
		 * @public
		 */
		none : "none"
	};

	// Definition of supported settings
	// Valid property types are: string, boolean, string[], code, object, function, function[].
	// Objects as an enumeration list of valid values can also be provided (e.g. Configuration.AnimationMode).
	var M_SETTINGS = {
		"theme"                 : { type : "string",   defaultValue : "" }, // default value will be evaluated correct (incl. dark-mode) during init
		"language"              : { type : "Locale",   defaultValue : detectLanguage() },
		"timezone"              : { type : "string",   defaultValue : TimezoneUtil.getLocalTimezone() },
		"formatLocale"          : { type : "Locale",   defaultValue : null },
		"calendarType"          : { type : "string",   defaultValue : null },
		"trailingCurrencyCode"  : { type : "boolean",  defaultValue : true },
		"accessibility"         : { type : "boolean",  defaultValue : true },
		"autoAriaBodyRole"      : { type : "boolean",  defaultValue : false,     noUrl:true }, //whether the framework automatically adds the ARIA role 'application' to the html body
		"animation"             : { type : "boolean",  defaultValue : true }, // deprecated, please use animationMode
		"animationMode"         : { type : M_ANIMATION_MODE, defaultValue : undefined }, // If no value is provided, animationMode will be set on instantiation depending on the animation setting.
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
		"flexibilityServices"   : { type : "string",   defaultValue : "/sap/bc/lrep", noUrl:true },
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
		"xx-cssVariables"       : { type : "string",   defaultValue : "false" }, // false|true|additional (additional just includes the css_variables.css in addition)
		"xx-debugModuleLoading"	: { type : "boolean",  defaultValue: false },
		"statistics"            : { type : "boolean",  defaultValue : false },
		"xx-acc-keys"           : { type : "boolean",  defaultValue : false }
	};

	var M_COMPAT_FEATURES = {
			"xx-test"               : "1.15", //for testing purposes only
			"flexBoxPolyfill"       : "1.14",
			"sapMeTabContainer"     : "1.14",
			"sapMeProgessIndicator" : "1.14",
			"sapMGrowingList"       : "1.14",
			"sapMListAsTable"       : "1.14",
			"sapMDialogWithPadding" : "1.14",
			"sapCoreBindingSyntax"  : "1.24"
	};

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
	 * @author Frank Weigel (Martin Schaus)
	 * @public
	 * @alias sap.ui.core.Configuration
	 */
	var Configuration = BaseObject.extend("sap.ui.core.Configuration", /** @lends sap.ui.core.Configuration.prototype */ {

		constructor : function() {
			if (oConfiguration) {
				Log.error(
					"Configuration is designed as a singleton and should not be created manually! " +
					"Please require 'sap/ui/core/Configuration' instead and use the module export directly without using 'new'."
				);

				return oConfiguration;
			}
		},

		init: function() {
			this.bInitialized = true;

			this.oFormatSettings = new Configuration.FormatSettings(this);

			/* Object that carries the real configuration data */
			var config = this; // eslint-disable-line consistent-this

			// apply settings from global config object (already merged with script tag attributes)
			var oCfg = window["sap-ui-config"] || {};
			oCfg.oninit = oCfg.oninit || oCfg["evt-oninit"];
			for (var n in M_SETTINGS) {
				// collect the defaults
				config[n] = Array.isArray(M_SETTINGS[n].defaultValue) ? [] : M_SETTINGS[n].defaultValue;
				if ( oCfg.hasOwnProperty(n.toLowerCase()) ) {
					setValue(n, oCfg[n.toLowerCase()], this);
				} else if ( !/^xx-/.test(n) && oCfg.hasOwnProperty("xx-" + n.toLowerCase()) ) {
					setValue(n, oCfg["xx-" + n.toLowerCase()], this);
				}
			}

			// if libs are configured, convert them to modules and prepend them to the existing modules list
			if ( oCfg.libs ) {
				config.modules = oCfg.libs.split(",").map(function(lib) {
					return lib.trim() + ".library";
				}).concat(config.modules);
			}

			var PARAM_CVERS = "compatversion";
			var DEFAULT_CVERS = oCfg[PARAM_CVERS];
			var BASE_CVERS = Version("1.14");
			this._compatversion = {};

			function _getCVers(key){
				var v = !key ? DEFAULT_CVERS || BASE_CVERS.toString()
						: oCfg[PARAM_CVERS + "-" + key.toLowerCase()] || DEFAULT_CVERS || M_COMPAT_FEATURES[key] || BASE_CVERS.toString();
				v = Version(v.toLowerCase() === "edge" ? VERSION : v);
				//Only major and minor version are relevant
				return Version(v.getMajor(), v.getMinor());
			}

			this._compatversion._default = _getCVers();
			for (var n in M_COMPAT_FEATURES) {
				this._compatversion[n] = _getCVers(n);
			}

			// apply the settings from the url (only if not blocked by app configuration)
			if ( !config.ignoreUrlParams ) {
				var sUrlPrefix = "sap-ui-";
				var oUriParams = UriParameters.fromQuery(window.location.search);

				// first map SAP parameters, can be overwritten by "sap-ui-*" parameters
				if ( oUriParams.has('sap-language') ) {
					// always remember as SAP Logon language
					var sValue = config.sapLogonLanguage = oUriParams.get('sap-language');
					// try to interpret it as a BCP47 language tag, taking some well known  SAP language codes into account
					var oLocale = Locale.fromSAPLogonLanguage(sValue);
					if ( oLocale ) {
						config.language = oLocale;
					} else if ( sValue && !oUriParams.get('sap-locale') && !oUriParams.get('sap-ui-language')) {
						// only complain about an invalid sap-language if neither sap-locale nor sap-ui-language are given
						Log.warning("sap-language '" + sValue + "' is not a valid BCP47 language tag and will only be used as SAP logon language");
					}
				}

				// Check sap-locale after sap-language to ensure compatibility if both parameters are provided (e.g. portal iView).
				if ( oUriParams.has('sap-locale') ) {
					setValue("language", oUriParams.get('sap-locale'), this);
				}

				if (oUriParams.has('sap-rtl')) {
					// "" = false, "X", "x" = true
					var sValue = oUriParams.get('sap-rtl');
					if (sValue === "X" || sValue === "x") {
						setValue('rtl', true, this);
					} else {
						setValue('rtl', false, this);
					}
				}

				if (oUriParams.has('sap-timezone')) {
					// validate the IANA timezone ID, but do not trigger a localizationChanged event
					// because the initialization should not trigger a "*Changed" event
					Log.warning("Timezone configuration cannot be changed at the moment");
					var sTimezone = oUriParams.get('sap-timezone');
					if (checkTimezone(sTimezone)) {
						/*
						TODO Timezone Configuration: re-activate following line when re-enabling Configuration#setTimezone
						this.timezone = sTimezone;
						*/
					}
				}

				if (oUriParams.has('sap-theme')) {
					var sValue = oUriParams.get('sap-theme');
					if (sValue === "") {
						// empty URL parameters set the parameter back to its system default
						config['theme'] = M_SETTINGS['theme'].defaultValue;
					} else {
						setValue('theme', sValue, this);
					}
				}

				if (oUriParams.has('sap-statistics')) {
					var sValue = oUriParams.get('sap-statistics');
					setValue('statistics', sValue, this);
				}

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
						setValue(n, sValue, this);
					}
				}
				// handle legacy URL params through format settings
				if (oUriParams.has('sap-ui-legacy-date-format')) {
					this.oFormatSettings.setLegacyDateFormat(oUriParams.get('sap-ui-legacy-date-format'));
				}
				if (oUriParams.has('sap-ui-legacy-time-format')) {
					this.oFormatSettings.setLegacyTimeFormat(oUriParams.get('sap-ui-legacy-time-format'));
				}
				if (oUriParams.has('sap-ui-legacy-number-format')) {
					this.oFormatSettings.setLegacyNumberFormat(oUriParams.get('sap-ui-legacy-number-format'));
				}
			}

			// map of SAP parameters (allows general access)
			config.sapparams = config.sapparams || {};

			// set the SAP logon language to the SAP params
			config.sapparams['sap-language'] = this.getSAPLogonLanguage();

			// read the SAP parameters from URL or META tag
			['sap-client', 'sap-server', 'sap-system'].forEach(function(sName) {
				if (!config.ignoreUrlParams && oUriParams.get(sName)) {
					config.sapparams[sName] = oUriParams.get(sName);
				} else {
					config.sapparams[sName] = getMetaTagValue(sName);
				}
			});

			// calculate RTL mode
			this.derivedRTL = Locale._impliesRTL(config.language);

			// analyze theme parameter
			var sTheme = config.theme;
			var sThemeRoot;
			var iIndex = sTheme.indexOf("@");
			if (iIndex >= 0) {
				sThemeRoot = validateThemeRoot(sTheme.slice(iIndex + 1));
				if ( sThemeRoot ) {
					config.theme = sTheme.slice(0, iIndex);
					config.themeRoot = sThemeRoot;
					config.themeRoots[config.theme] = sThemeRoot;
				} else {
					// fallback to non-URL parameter (if not equal to sTheme)
					config.theme = (oCfg.theme && oCfg.theme !== sTheme) ? oCfg.theme : "";
					iIndex = -1; // enable theme mapping below
				}
			}

			// if the theme is still undefined (or an empty string)
			if (!config.theme) {
				var mThemeDefaultInfo = ThemeHelper.getDefaultThemeInfo();
				config.theme = mThemeDefaultInfo.DEFAULT_THEME + (mThemeDefaultInfo.DARK_MODE ? "_dark" : "");
			}

			config.theme = ThemeHelper.validateAndFallbackTheme(config.theme, sThemeRoot);

			var aCoreLangs = config['languagesDeliveredWithCore'] = Locale._coreI18nLocales;
			var aLangs = config['xx-supportedLanguages'];
			if ( aLangs.length === 0 || (aLangs.length === 1 && aLangs[0] === '*') ) {
				aLangs = [];
			} else if ( aLangs.length === 1 && aLangs[0] === 'default' ) {
				aLangs = aCoreLangs || [];
			}
			config['xx-supportedLanguages'] = aLangs;

			//parse fiori 2 adaptation parameters
			var vAdaptations = config['xx-fiori2Adaptation'];
			if ( vAdaptations.length === 0 || (vAdaptations.length === 1 && vAdaptations[0] === 'false') ) {
				vAdaptations = false;
			} else if ( vAdaptations.length === 1 && vAdaptations[0] === 'true' ) {
				vAdaptations = true;
			}

			config['xx-fiori2Adaptation'] = vAdaptations;

			// determine default for binding syntax
			if ( config["bindingSyntax"] === "default" ) {
				config["bindingSyntax"] = (config.getCompatibilityVersion("sapCoreBindingSyntax").compareTo("1.26") < 0) ? "simple" : "complex";
			}

			config["allowlistService"] = config["allowlistService"] || /* fallback to legacy config */ config["whitelistService"];

			// Configure allowlistService / frameOptions via <meta> tag if not already defined via UI5 configuration
			if (!config["allowlistService"]) {
				var sAllowlistMetaTagValue = getMetaTagValue('sap.allowlistService') || /* fallback to legacy config */ getMetaTagValue('sap.whitelistService');
				if (sAllowlistMetaTagValue) {
					config["allowlistService"] = sAllowlistMetaTagValue;
					// Set default "frameOptions" to "trusted" instead of "allow"
					if (config["frameOptions"] === "default") {
						config["frameOptions"] = "trusted";
					}
				}
			}

			// Verify and set default for "frameOptions" configuration
			if (config["frameOptions"] === "default" ||
				(config["frameOptions"] !== "allow"
				&& config["frameOptions"] !== "deny"
				&& config["frameOptions"] !== "trusted")) {

				// default => allow
				config["frameOptions"] = "allow";
			}

			// frameOptionsConfig: Handle compatibility of renamed config option
			var oFrameOptionsConfig = config["frameOptionsConfig"];
			if (oFrameOptionsConfig) {
				oFrameOptionsConfig.allowlist = oFrameOptionsConfig.allowlist || oFrameOptionsConfig.whitelist;
			}

			// in case the flexibilityServices configuration was set to a non-empty, non-default value, sap.ui.fl becomes mandatory
			if (config.flexibilityServices
					&& config.flexibilityServices !== M_SETTINGS.flexibilityServices.defaultValue
					&& config.modules.indexOf("sap.ui.fl.library") == -1) {
				config.modules.push("sap.ui.fl.library");
			}

			var aCSSLibs = config['preloadLibCss'];
			if ( aCSSLibs.length > 0 ) {
				// a leading "!" denotes that the application has loaded the file already
				if ( aCSSLibs[0].startsWith("!") ) {
					aCSSLibs[0] = aCSSLibs[0].slice(1); // also affect same array in "config"!
				}
				if ( aCSSLibs[0] === "*" ) {
					// replace with configured libs
					aCSSLibs.shift(); // remove * (inplace)
					config.modules.forEach(function(mod) {
						var m = mod.match(/^(.*)\.library$/);
						if ( m ) {
							aCSSLibs.unshift(m[1]);
						}
					});
				}
			}

			// default legacy boolean to new enum value
			// TODO: remove when making the configuration non-experimental
			if ( config["xx-waitForTheme"] === "true" ) {
				config["xx-waitForTheme"] = "rendering";
			}
			if ( config["xx-waitForTheme"] !== "rendering" && config["xx-waitForTheme"] !== "init" ) {
				// invalid value or false from legacy boolean setting
				config["xx-waitForTheme"] = undefined;
			}

			// log  all non default value
			for (var n in M_SETTINGS) {
				if ( config[n] !== M_SETTINGS[n].defaultValue ) {
					Log.info("  " + n + " = " + config[n]);
				}
			}

			// Setup animation mode. If no animation mode is provided
			// the value is set depending on the animation setting.
			if (this.getAnimationMode() === undefined) {
				if (this.animation) {
					this.setAnimationMode(Configuration.AnimationMode.full);
				} else {
					this.setAnimationMode(Configuration.AnimationMode.minimal);
				}
			} else {
				// Validate and set the provided value for the animation mode
				this.setAnimationMode(this.getAnimationMode());
			}

			// The following code can't be done in the _ConfigurationProvider
			// because of cyclic dependency
			var syncCallBehavior = this.getSyncCallBehavior();
			sap.ui.loader.config({
				reportSyncCalls: syncCallBehavior
			});

			if ( syncCallBehavior && oCfg.__loaded ) {
				var sMessage = "[nosync]: configuration loaded via sync XHR";
				if (syncCallBehavior === 1) {
					Log.warning(sMessage);
				} else {
					Log.error(sMessage);
				}
			}
		},

		/**
		 * Returns the version of the framework.
		 *
		 * Similar to <code>sap.ui.version</code>.
		 *
		 * @return {module:sap/base/util/Version} the version
		 * @public
		 */
		getVersion : function () {
			if (this._version) {
				return this._version;
			}

			this._version = new Version(VERSION);
			return this._version;
		},

		/**
		 * Returns the used compatibility version for the given feature.
		 *
		 * @param {string} sFeature the key of desired feature
		 * @return {module:sap/base/util/Version} the used compatibility version
		 * @public
		 */
		getCompatibilityVersion : function (sFeature) {
			if (typeof (sFeature) === "string" && this._compatversion[sFeature]) {
				return this._compatversion[sFeature];
			}

			return this._compatversion._default;
		},

		/**
		 * Returns the theme name
		 * @return {string} the theme name
		 * @public
		 */
		getTheme : function () {
			return this.getValue("theme");
		},

		/**
		 * Get themeRoot for configured theme
		 * @returns {string|object} Returns themeRoot for configured theme
		 * @private
		 */
		getThemeRoot : function () {
			return this.themeRoot;
		},

		/**
		 * Returns whether placeholders are active or not
		 * @returns {boolean} Whether placeholders are active or not
		 */
		getPlaceholder : function() {
			return this.getValue("xx-placeholder");
		},

		/**
		 * Allows setting the theme name
		 * @param {string} sTheme the theme name
		 * @return {this} <code>this</code> to allow method chaining
		 * @private
		 */
		setTheme : function (sTheme) {
			this.theme = sTheme;
			return this;
		},

		/**
		 * Returns a string that identifies the current language.
		 *
		 * The value returned by this method in most cases corresponds to the exact value that has been
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
		 * @public
		 */
		getLanguage : function () {
			return this.getValue("language").sLocaleId;
		},

		/**
		 * Returns a BCP47-compliant language tag for the current language.
		 *
		 * The return value of this method is especially useful for an HTTP <code>Accept-Language</code> header.
		 *
		 * Retrieves the modern locale,
		 * e.g. sr-Latn (Serbian (Cyrillic)), he (Hebrew), yi (Yiddish)
		 *
		 * @returns {string} The language tag for the current language, conforming to BCP47
		 * @public
		 */
		getLanguageTag : function () {
			var sLanguage = this.getLanguage();
			if (mCache[sLanguage]) {
				return mCache[sLanguage];
			}
			mCache[sLanguage] = this.getValue("language").toLanguageTag();
			return mCache[sLanguage];
		},

		/**
		 * Returns an SAP logon language for the current language.
		 *
		 * It will be returned in uppercase.
		 * e.g. "EN", "DE"
		 *
		 * @return {string} The SAP logon language code for the current language
		 * @public
		 */
		getSAPLogonLanguage : function () {
			return (this.sapLogonLanguage && this.sapLogonLanguage.toUpperCase()) || this.getValue("language")._getSAPLogonLanguage();
		},

		/**
		 * <b>Note: Due to compatibility considerations, this function will always return the timezone of the browser/host system
		 * in this release</b>
		 *
		 * Retrieves the configured IANA timezone ID.
		 *
		 * @returns {string} The configured IANA timezone ID, e.g. "America/New_York"
		 * @public
		 * @since 1.99.0
		 */
		getTimezone : function () {
			// TODO Timezone Configuration: re-activate following line when re-enabling Configuration#setTimezone
			// return this.getValue("timezone");
			return TimezoneUtil.getLocalTimezone();
		},

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
		 * dependent objects will be updated by this call. It therefore remains best practice
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
		 * This method does not accept SAP language codes for <code>sLanguage</code>. Instead, a second
		 * parameter <code>sSAPLogonLanguage</code> can be provided with an SAP language code corresponding
		 * to the given language. A given value will be returned by the {@link #getSAPLogonLanguage} method.
		 * It is up to the caller to provide a consistent pair of BCP47 language and SAP language code.
		 * The SAP language code is only checked to be of length 2 and must consist of letters or digits only.
		 *
		 * <b>Note</b>: When using this method please take note of and respect the above mentioned restrictions.
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
		 * @public
		 */
		setLanguage : function (sLanguage, sSAPLogonLanguage) {
			var oLocale = convertToLocaleOrNull(sLanguage),
				bOldRTL = this.getRTL(),
				mChanges;

			check(oLocale, "Configuration.setLanguage: sLanguage must be a valid BCP47 language tag");
			check(sSAPLogonLanguage == null || (typeof sSAPLogonLanguage === 'string' && /[A-Z0-9]{2,2}/i.test(sSAPLogonLanguage)),
				"Configuration.setLanguage: sSAPLogonLanguage must be null or be a string of length 2, consisting of digits and latin characters only", /* warn= */ true);

			if ( oLocale.toString() != this.getLanguageTag() || sSAPLogonLanguage !== this.sapLogonLanguage ) {
				this.language = oLocale;
				this.sapLogonLanguage = sSAPLogonLanguage || undefined;
				this.sapparams['sap-language'] = this.getSAPLogonLanguage();
				mChanges = this._collect();
				mChanges.language = this.getLanguageTag();
				this.derivedRTL = Locale._impliesRTL(oLocale);
				if ( bOldRTL != this.getRTL() ) {
					mChanges.rtl = this.getRTL();
				}
				//invalidate cache
				mCache = Object.create(null);
				this._endCollect();
			}
			return this;
		},

		/**
		 * <b>Note: Due to compatibility considerations, this function has no effect in this release.
		 * The timezone configuration will always reflect the timezone of the browser/host system.</b>
		 *
		 * Sets the timezone such that all date and time based calculations use this timezone.
		 *
		 * When the timezone has changed, the Core will fire its
		 * {@link sap.ui.core.Core#event:localizationChanged localizationChanged} event.
		 *
		 * @param {string|null} [sTimezone] IANA timezone ID, e.g. "America/New_York". Use <code>null</code> to reset the timezone to the browser's local timezone.
		 *   An invalid IANA timezone ID will fall back to the browser's timezone.
		 * @public
		 * @return {this} <code>this</code> to allow method chaining
		 * @since 1.99.0
		 */
		setTimezone : function (sTimezone) {
			check(sTimezone == null || typeof sTimezone === 'string',
				"Configuration.setTimezone: sTimezone must be null or be a string", /* warn= */ true);

			Log.warning("Timezone configuration cannot be changed at the moment");
			sTimezone != null && checkTimezone(sTimezone);
			/*
			TODO Timezone Configuration: re-activate following code when re-enabling Configuration#setTimezone
			if (sTimezone == null || !checkTimezone(sTimezone)) {
				sTimezone = TimezoneUtil.getLocalTimezone();
			}
			if (this.timezone !== sTimezone) {
				this.timezone = sTimezone;

				var mChanges = this._collect();
				mChanges.timezone = sTimezone;
				this._endCollect();
			} */
			return this;
		},

		/**
		 * Returns a Locale object for the current language.
		 *
		 * The Locale is derived from the {@link #getLanguage language} property.
		 *
		 * @return {sap.ui.core.Locale} The locale
		 * @public
		 */
		getLocale : function () {
			return this.getValue("language");
		},

		/**
		 * Returns an SAP parameter by it's name (e.g. sap-client, sap-system, sap-server).
		 *
		 * @experimental
		 * @since 1.45.0
		 * @param {string} sName The parameter name
		 * @return {string} The SAP parameter value
		 */
		getSAPParam : function (sName) {
			return this.sapparams && this.sapparams[sName];
		},

		/**
		 * Checks whether the Cache Manager is switched on.
		 * @ui5-restricted sap.ui.core
		 * @since 1.37.0
		 * @returns {boolean}
		 */
		isUI5CacheOn: function () {
			return this.getValue("xx-cache-use");
		},

		/**
		 * Enables/Disables the Cache configuration.
		 * @ui5-restricted sap.ui.core
		 * @since 1.37.0
		 * @param {boolean} on true to switch it on, false if to switch it off
		 * @returns {this}
		 */
		setUI5CacheOn: function (on) {
			this["xx-cache-use"] = on;
			return this;
		},

		/**
		 * Checks whether the Cache Manager serialization support is switched on.
		 * @ui5-restricted sap.ui.core
		 * @since 1.37.0
		 * @returns {boolean}
		 */
		isUI5CacheSerializationSupportOn: function () {
			return this.getValue("xx-cache-serialization");
		},

		/**
		 * Enables/Disables the Cache serialization support
		 * @ui5-restricted sap.ui.core
		 * @since 1.37.0
		 * @param {boolean} on true to switch it on, false if to switch it off
		 * @returns {this}
		 */
		setUI5CacheSerializationSupport: function (on) {
			this["xx-cache-serialization"] = on;
			return this;
		},

		/**
		 * Returns all keys, that the CacheManager will ignore when set/get values.
		 * @ui5-restricted sap.ui.core
		 * @since 1.37.0
		 * @returns {string[]} array of keys that CacheManager should ignore
		 * @see sap.ui.core.cache.LRUPersistentCache#keyMatchesExclusionStrings
		 */
		getUI5CacheExcludedKeys: function () {
			return this.getValue("xx-cache-excludedKeys");
		},

		/**
		 * Returns the calendar type which is being used in locale dependent functionality.
		 *
		 * When it's explicitly set by calling <code>setCalendar</code>, the set calendar type is returned.
		 * Otherwise, the calendar type is determined by checking the format settings and current locale.
		 *
		 * @return {sap.ui.core.CalendarType} the current calendar type, e.g. <code>Gregorian</code>
		 * @since 1.28.6
		 */
		getCalendarType: function() {
			var sName,
				sCalendarType = this.getValue("calendarType");

			if (sCalendarType) {
				for (sName in CalendarType) {
					if (sName.toLowerCase() === sCalendarType.toLowerCase()) {
						this.calendarType = sName;
						return this.calendarType;
					}
				}
				Log.warning("Parameter 'calendarType' is set to " + sCalendarType + " which isn't a valid value and therefore ignored. The calendar type is determined from format setting and current locale");
			}

			var sLegacyDateFormat = this.oFormatSettings.getLegacyDateFormat();

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
					return this.getLocale().getPreferredCalendarType();
			}
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
		 */
		setCalendarType : function(sCalendarType) {
			var mChanges;

			if (this.calendarType !== sCalendarType) {
				mChanges = this._collect();
				this.calendarType = mChanges.calendarType = sCalendarType;
				this._endCollect();
			}
			return this;
		},

		/**
		 * Returns the format locale string with language and region code. Falls back to
		 * language configuration, in case it has not been explicitly defined.
		 *
		 * @return {string} the format locale string with language and country code
		 * @public
		 */
		getFormatLocale : function () {
			return (this.getValue("formatLocale") || this.getValue("language")).toString();
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
		 * @throws {Error} When <code>sFormatLocale</code> is given, but is not a valid BCP47 language
		 *   tag or Java locale identifier
		 */
		setFormatLocale : function(sFormatLocale) {
			var oFormatLocale = convertToLocaleOrNull(sFormatLocale),
				mChanges;

			check(sFormatLocale == null || typeof sFormatLocale === "string" && oFormatLocale, "sFormatLocale must be a BCP47 language tag or Java Locale id or null");

			if ( toLanguageTag(oFormatLocale) !== toLanguageTag(this.getValue("formatLocale")) ) {
				this.formatLocale = oFormatLocale;
				mChanges = this._collect();
				mChanges.formatLocale = toLanguageTag(oFormatLocale);
				this._endCollect();
			}
			return this;
		},

		/**
		 * List of languages that the SAPUI5 core delivers.
		 *
		 * Might return undefined if the information is not available.
		 *
		 * @experimental
		 */
		getLanguagesDeliveredWithCore : function() {
			return this["languagesDeliveredWithCore"];
		},

		/**
		 * @experimental
		 */
		getSupportedLanguages : function() {
			return this.getValue("xx-supportedLanguages");
		},

		/**
		 * Returns whether the accessibility mode is used or not.
		 * @return {boolean} whether the accessibility mode is used or not
		 * @public
		 */
		getAccessibility : function () {
			return this.getValue("accessibility");
		},

		/**
		 * Returns whether the framework automatically adds
		 * the ARIA role 'application' to the HTML body or not.
		 * @return {boolean}
		 * @since 1.27.0
		 * @public
		 */
		getAutoAriaBodyRole : function () {
			return this.getValue("autoAriaBodyRole");
		},

		/**
		 * Returns whether the animations are globally used.
		 * @return {boolean} whether the animations are globally used
		 * @public
		 * @deprecated As of version 1.50.0, replaced by {@link sap.ui.core.Configuration#getAnimationMode}
		 */
		getAnimation : function () {
			return this.getValue("animation");
		},

		/**
		 * Returns the current animation mode.
		 *
		 * @return {sap.ui.core.Configuration.AnimationMode} The current animationMode
		 * @since 1.50.0
		 * @public
		 */
		getAnimationMode : function () {
			return this.getValue("animationMode");
		},

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
		 * @public
		 */
		setAnimationMode : function(sAnimationMode) {
			checkEnum(Configuration.AnimationMode, sAnimationMode, "animationMode");

			// Set the animation to on or off depending on the animation mode to ensure backward compatibility.
			this.animation = (sAnimationMode !== Configuration.AnimationMode.minimal && sAnimationMode !== Configuration.AnimationMode.none);

			// Set the animation mode and update html attributes.
			this.animationMode = sAnimationMode;
			if (this._oCore && this._oCore._setupAnimation) {
				this._oCore._setupAnimation();
			}
		},

		/**
		 * Returns whether the page uses the RTL text direction.
		 *
		 * If no mode has been explicitly set (neither <code>true</code> nor <code>false</code>),
		 * the mode is derived from the current language setting.
		 *
		 * @return {boolean} whether the page uses the RTL text direction
		 * @public
		 */
		getRTL : function () {
			// if rtl has not been set (still null), return the rtl mode derived from the language
			return this.getValue("rtl") === null ? this.derivedRTL : this.getValue("rtl");
		},

		/**
		 * Returns whether the Fiori2Adaptation is on.
		 * @return {boolean|string} false - no adaptation, true - full adaptation, comma-separated list - partial adaptation
		 * Possible values: style, collapse, title, back, hierarchy
		 * @public
		 */
		getFiori2Adaptation : function () {
			return this.getValue("xx-fiori2Adaptation");
		},

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
		 * @return {this} <code>this</code> to allow method chaining
		 * @public
		 */
		setRTL : function(bRTL) {
			check(bRTL === null || typeof bRTL === "boolean", "bRTL must be null or a boolean");

			var oldRTL = this.getRTL(),
				mChanges;
			this.rtl = bRTL;
			if ( oldRTL != this.getRTL() ) { // also take the derived RTL flag into account for the before/after comparison!
				mChanges = this._collect();
				mChanges.rtl = this.getRTL();
				this._endCollect();
			}
			return this;
		},

		/**
		 * Returns whether the page runs in full debug mode.
		 * @returns {boolean} Whether the page runs in full debug mode
		 * @public
		 */
		getDebug : function () {
			// Configuration only maintains a flag for the full debug mode.
			// ui5loader-autoconfig calculates detailed information also for the partial debug
			// mode and writes it to window["sap-ui-debug"].
			// Only a value of true must be reflected by this getter
			return window["sap-ui-debug"] === true || this.getValue("debug");
		},

		/**
		 * Returns whether the UI5 control inspe ctor is displayed.
		 * Has only an effect when the sap-ui-debug module has been loaded
		 * @return {boolean} whether the UI5 control inspector is displayed
		 * @public
		 */
		getInspect : function () {
			return this.getValue("inspect");
		},

		/**
		 * Returns whether the text origin information is collected.
		 * @return {boolean} whether the text info is collected
		 * @public
		 */
		getOriginInfo : function () {
			return this.getValue("originInfo");
		},

		/**
		 * Returns whether there should be an exception on any duplicate element IDs.
		 * @return {boolean} whether there should be an exception on any duplicate element IDs
		 * @public
		 */
		getNoDuplicateIds : function () {
			return this.getValue("noDuplicateIds");
		},

		/**
		 * Whether a trace view should be shown or not.
		 *
		 * Has only an effect when the sap-ui-debug module has been loaded
		 * either by explicitly loading it or by setting the 'debug' option to true.
		 * @return {boolean} whether a trace view should be shown
		 */
		getTrace : function () {
			return this.getValue("trace");
		},

		/**
		 * Prefix to be used for automatically generated control IDs.
		 * Default is a double underscore "__".
		 *
		 * @returns {string} the prefix to be used
		 * @public
		 */
		getUIDPrefix : function() {
			return this.getValue("uidPrefix");
		},


		/**
		 * Return whether the design mode is active or not.
		 *
		 * @returns {boolean} whether the design mode is active or not.
		 * @since 1.13.2
		 * @private
		 * @ui5-restricted sap.ui.core.Core, sap.watt, com.sap.webide, sap.ui.fl, sap.ui.rta, sap.ui.comp, SAP Business Application Studio
		 */
		getDesignMode : function() {
			return this.getValue("xx-designMode");
		},

		/**
		 * Return whether the activation of the controller code is suppressed.
		 *
		 * @returns {boolean} whether the activation of the controller code is suppressed or not
		 * @since 1.13.2
		 * @private
		 * @ui5-restricted sap.watt, com.sap.webide
		 */
		getSuppressDeactivationOfControllerCode : function() {
			return this.getValue("xx-suppressDeactivationOfControllerCode");
		},

		/**
		 * Return whether the controller code is deactivated. During design mode the.
		 *
		 * @returns {boolean} whether the activation of the controller code is suppressed or not
		 * @since 1.26.4
		 * @private
		 * @ui5-restricted sap.watt, com.sap.webide
		 */
		getControllerCodeDeactivated : function() {
			return this.getDesignMode() && !this.getSuppressDeactivationOfControllerCode();
		},

		/**
		 * The name of the application to start or empty.
		 *
		 * @returns {string} name of the application
		 * @public
		 * @deprecated Since 1.15.1. Please use {@link module:sap/ui/core/ComponentSupport} instead. See also {@link topic:82a0fcecc3cb427c91469bc537ebdddf Declarative API for Initial Components}.
		 */
		getApplication : function() {
			return this.getValue("application");
		},

		/**
		 * The name of the root component to start or empty.
		 *
		 * @returns {string} name of the root component
		 * @public
		 * @deprecated Since 1.95. Please use {@link module:sap/ui/core/ComponentSupport} instead. See also {@link topic:82a0fcecc3cb427c91469bc537ebdddf Declarative API for Initial Components}.
		 */
		getRootComponent : function() {
			return this.getValue("rootComponent");
		},

		/**
		 * Base URLs to AppCacheBuster ETag-Index files.
		 *
		 * @returns {string[]} array of base URLs
		 * @public
		 */
		getAppCacheBuster : function() {
			return this.getValue("appCacheBuster");
		},

		/**
		 * The loading mode (sync|async|batch) of the AppCacheBuster (sync is default)
		 *
		 * @returns {string} "sync" | "async"
		 * @public
		 */
		getAppCacheBusterMode : function() {
			return this.getValue("xx-appCacheBusterMode");
		},

		/**
		 * Object defining the callback hooks for the AppCacheBuster like e.g.
		 * <code>handleURL</code>, <code>onIndexLoad</code> or <code>onIndexLoaded</code>.
		 *
		 * @returns {object} object containing the callback functions for the AppCacheBuster
		 * @private
		 * @ui5-restricted
		 */
		getAppCacheBusterHooks : function() {
			return this.getValue("xx-appCacheBusterHooks");
		},

		/**
		 * Flag, whether the customizing is disabled or not.
		 *
		 * @returns {boolean} true if customizing is disabled
		 * @private
		 * @ui5-restricted
		 */
		getDisableCustomizing : function() {
			return this.getValue("xx-disableCustomizing");
		},

		/**
		 * Flag, representing the status of the view cache.
		 * @see {sap.ui.xmlview}
		 *
		 * @returns {boolean} true if view cache is enabled
		 * @private
		 * @experimental Since 1.44
		 */
		getViewCache : function() {
			return this.getValue("xx-viewCache");
		},

		/**
		 * Currently active preload mode for libraries or falsy value.
		 *
		 * @returns {string} preload mode
		 * @private
		 * @ui5-restricted sap.ui.core.Core
		 * @since 1.16.3
		 */
		getPreload : function() {
			// determine preload mode (e.g. resolve default or auto)
			var sPreloadMode = this.getValue("preload");
			// if debug sources are requested, then the preload feature must be deactivated
			if ( this.getDebug() === true ) {
				sPreloadMode = "";
			}
			// when the preload mode is 'auto', it will be set to 'async' or 'sync' for optimized sources
			// depending on whether the ui5loader is configured async
			if ( sPreloadMode === "auto" ) {
				if (window["sap-ui-optimized"]) {
					sPreloadMode = sap.ui.loader.config().async ? "async" : "sync";
				} else {
					sPreloadMode = "";
				}
			}
			return sPreloadMode;
		},

		/**
		 * Currently active syncCallBehavior
		 *
		 * @returns {int} syncCallBehavior
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @since 1.106.0
		 */
		getSyncCallBehavior : function() {
			var syncCallBehavior = 0; // ignore
			if ( this.getValue('xx-nosync') === 'warn' || /(?:\?|&)sap-ui-xx-nosync=(?:warn)/.exec(window.location.search) ) {
				syncCallBehavior = 1;
			}
			if ( this.getValue('xx-nosync') === true || this.getValue('xx-nosync') === 'true' || /(?:\?|&)sap-ui-xx-nosync=(?:x|X|true)/.exec(window.location.search) ) {
				syncCallBehavior = 2;
			}
			return syncCallBehavior;
		},

		/**
		 * Whether dependency cache info files should be loaded instead of preload files.
		 *
		 * This is an experimental feature intended for HTTP/2 scenarios.
		 * @private
		 */
		getDepCache : function() {
			return this.getValue("xx-depCache");
		},

		/**
		 * Flag whether a Component should load the manifest first.
		 *
		 * @returns {boolean} true if a Component should load the manifest first
		 * @public
		 * @since 1.33.0
		 */
		getManifestFirst : function() {
			return this.getValue("manifestFirst");
		},

		/**
		 * Returns the URL from where the UI5 flexibility services are called;
		 * if empty, the flexibility services are not called.
		 *
		 * @returns {object[]} Flexibility services configuration
		 * @public
		 * @since 1.60.0
		 */
		getFlexibilityServices : function() {
			var vFlexibilityServices = this.getValue("flexibilityServices") || [];

			if (typeof vFlexibilityServices === 'string') {
				if (vFlexibilityServices[0] === "/") {
					vFlexibilityServices = [{
						url : vFlexibilityServices,
						layers : ["ALL"],
						connector : "LrepConnector"
					}];
				} else {
					vFlexibilityServices = JSON.parse(vFlexibilityServices);
				}
			}
			this.flexibilityServices = vFlexibilityServices;

			return this.flexibilityServices;
		},

		/**
		 * Sets the UI5 flexibility services configuration.
		 *
		 * @param {object[]} aFlexibilityServices Connector configuration
		 * @param {string} [aFlexibilityServices.connector] Name of the connector
		 * @param {string} [aFlexibilityServices.applyConnector] Name of the full module name of the custom apply connector
		 * @param {string} [aFlexibilityServices.writeConnector] Name of the full module name of the custom write connector
		 * @param {boolean} [aFlexibilityServices.custom=false] Flag to identify the connector as custom or fl owned
		 * @param {string} [aFlexibilityServices.url] Url for requests sent by the connector
		 * @param {string} [aFlexibilityServices.path] Path for loading data in the ObjectPath connector
		 * @param {sap.ui.fl.Layer[]} [aFlexibilityServices.layers] List of layers in which the connector is allowed to write
		 * @private
		 * @ui5-restricted sap.ui.fl, other ui5 bootstrapping tools
		 * @since 1.73.0
		 */
		setFlexibilityServices: function (aFlexibilityServices) {
			this.flexibilityServices = aFlexibilityServices.slice();
		},

		/**
		 * Currently active preload mode for components or falsy value.
		 *
		 * @returns {string} component preload mode
		 * @private
		 * @experimental Since 1.16.3, might change completely.
		 */
		getComponentPreload : function() {
			return this.getValue("xx-componentPreload") || this.getPreload();
		},

		/**
		 * Returns a configuration object that bundles the format settings of UI5.
		 *
		 * @returns {sap.ui.core.Configuration.FormatSettings} A FormatSettings object.
		 * @public
		 */
		getFormatSettings : function() {
			return this.oFormatSettings;
		},

		/**
		 * frameOptions mode (allow/deny/trusted).
		 *
		 * @return {string} frameOptions mode
		 * @public
		 */
		getFrameOptions : function() {
			return this.getValue("frameOptions");
		},

		/**
		 * URL of the whitelist service.
		 *
		 * @return {string} whitelist service URL
		 * @public
		 * @deprecated Since 1.85.0. Use {@link sap.ui.core.Configuration#getAllowlistService} instead.
		 * SAP strives to replace insensitive terms with inclusive language.
		 * Since APIs cannot be renamed or immediately removed for compatibility reasons, this API has been deprecated.
		 */
		getWhitelistService : function() {
			return this.getAllowlistService();
		},

		/**
		 * URL of the allowlist service.
		 *
		 * @return {string} allowlist service URL
		 * @public
		 */
		getAllowlistService : function() {
			return this.getValue("allowlistService");
		},

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
		 */
		getFileShareSupport : function() {
			return this.getValue("fileShareSupport") || undefined;
		},

		/**
		 * Whether support mode is enabled.
		 *
		 * @return {boolean} support mode is enabled
		 * @experimental
		 */
		getSupportMode : function() {
			return this.getValue("support");
		},

		/**
		 * Whether test tools are enabled.
		 *
		 * @return {boolean} test tools are enabled
		 * @experimental
		 */
		getTestRecorderMode : function() {
			return this.getValue("testRecorder");
		},

		_collect : function() {
			var mChanges = this.mChanges || (this.mChanges = { __count : 0});
			mChanges.__count++;
			return mChanges;
		},

		_endCollect : function() {
			var mChanges = this.mChanges;
			if ( mChanges && (--mChanges.__count) === 0 ) {
				delete mChanges.__count;
				delete this.mChanges;
				this._oCore && this._oCore.fireLocalizationChanged(mChanges);
			}
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
			return this.getStatisticsEnabled();
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
		 */
		getStatisticsEnabled : function() {
			var result = this.getValue("statistics");
			try {
				result = result || window.localStorage.getItem("sap-ui-statistics") == "X";
			} catch (e) {
				// access to local storage might fail due to security / privacy settings
			}
			return result;
		},

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
		 * Return whether type validation is handled by core.
		 *
		 * @returns {boolean} whether whether type validation is handled by core
		 * @since 1.28.0
		 * @private
		 */
		getHandleValidation : function() {
			return this.getValue("xx-handleValidation");
		},

		/**
		 * Gets if the hyphenation has to be forced to use only browser-native or only third-party.
		 *
		 * @returns {string} empty string, "native" or "thirdparty"
		 * @private
		 */
		getHyphenation : function() {
			return this.getValue("xx-hyphenation");
		},

		/**
		 * Gets if pressing alt key will highlight access keys enabled elements on the screen.
		 *
		 * @returns {boolean} whether access keys is enabled
		 * @since 1.104.0
		 * @experimental
		 */
		getAccKeys: function () {
			return this.getValue("xx-acc-keys");
		},

		/**
		 * Returns the list of active terminologies defined via the Configuration.
		 *
		 * @returns {string[]|undefined} if no active terminologies are set, the default value <code>undefined</code> is returned.
		 * @since 1.77.0
		 * @public
		 */
		getActiveTerminologies : function() {
			return this.getValue("activeTerminologies");
		},

		/**
		 * Returns the security token handlers of an OData V4 model.
		 *
		 * @returns {function[]} the security token handlers (an empty array if there are none)
		 * @public
		 * @since 1.95.0
		 * @see #setSecurityTokenHandlers
		 */
		getSecurityTokenHandlers : function () {
			return this.getValue("securityTokenHandlers").slice();
		},

		/**
		 * Sets the security token handlers for an OData V4 model. See chapter
		 * {@link topic:9613f1f2d88747cab21896f7216afdac/section_STH Security Token Handling}.
		 *
		 * @param {function[]} aSecurityTokenHandlers - The security token handlers
		 * @public
		 * @since 1.95.0
		 * @see #getSecurityTokenHandlers
		 */
		setSecurityTokenHandlers : function (aSecurityTokenHandlers) {
			aSecurityTokenHandlers.forEach(function (fnSecurityTokenHandler) {
				check(typeof fnSecurityTokenHandler === "function",
					"Not a function: " + fnSecurityTokenHandler);
			});
			this.securityTokenHandlers = aSecurityTokenHandlers.slice();
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
		 */
		applySettings: function(mSettings) {

			function applyAll(ctx, m) {
				var sName, sMethod;
				for ( sName in m ) {
					sMethod = "set" + sName.slice(0,1).toUpperCase() + sName.slice(1);
					if ( sName === 'formatSettings' && ctx.oFormatSettings ) {
						applyAll(ctx.oFormatSettings, m[sName]);
					} else if ( typeof ctx[sMethod] === 'function' ) {
						ctx[sMethod](m[sName]);
					} else {
						Log.warning("Configuration.applySettings: unknown setting '" + sName + "' ignored");
					}
				}
			}

			assert(typeof mSettings === 'object', "mSettings must be an object");

			this._collect(); // block events
			applyAll(this, mSettings);
			this._endCollect(); // might fire localizationChanged

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
		setCore: function (oCore) {
			// Setting the core needs to happen before init
			// because getValue relies on _oCore and is used in init
			this._oCore = oCore;
			this.init();
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
	 	 * @ui5-restricted sap.ui.core.Core jquery.sap.global
	 	 * @since 1.106
		 */
		getValue: function(sName) {
			var vValue;
			if (typeof sName !== "string" || !Object.prototype.hasOwnProperty.call(M_SETTINGS, sName)) {
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
			if (this.bInitialized || this.hasOwnProperty(sName)) {
				vValue = this[sName];
			} else {
				if (!this.ignoreUrlParams && !M_SETTINGS[sName].noUrl) {
					var oUriParams = UriParameters.fromQuery(window.location.search);
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
	 * This enumerable is used to validate the animation mode. Animation modes allow to specify different animation scenarios or levels.
	 * The implementation of the Control (JavaScript or CSS) has to be done differently for each animation mode.
	 *
	 * @enum {string}
	 * @since 1.50.0
	 * @public
	 */
	Configuration.AnimationMode = M_ANIMATION_MODE;

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

	/*
	 * Helper that return a language tag or null from a locale object
	 */
	function toLanguageTag(oLocale) {
		return oLocale ? oLocale.toString() : null;
	}

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
	 * Checks if a value exists within an enumerable list.
	 *
	 * @param {object} oEnum Enumeration object with values for validation
	 * @param {string} sValue Value to check against enumerable list
	 * @param {string} sPropertyName Name of the property which is checked
	 * @throws {Error} If the value could not be found, an error is thrown
	 */
	function checkEnum(oEnum, sValue, sPropertyName) {
		var aValidValues = [];
		for (var sKey in oEnum) {
			if (oEnum.hasOwnProperty(sKey)) {
				if (oEnum[sKey] === sValue) {
					return;
				}
				aValidValues.push(oEnum[sKey]);
			}
		}
		throw new Error("Unsupported Enumeration value for " + sPropertyName + ", valid values are: " + aValidValues.join(", "));
	}

	/**
	 * Checks if the provided timezone is valid and logs an error if not.
	 *
	 * @param {string} sTimezone The IANA timezone ID
	 * @returns {boolean} Returns true if the timezone is valid
	 */
	function checkTimezone(sTimezone) {
		var bIsValidTimezone = TimezoneUtil.isValidTimezone(sTimezone);
		if (!bIsValidTimezone) {
			Log.error("The provided timezone '" + sTimezone + "' is not a valid IANA timezone ID." +
				" Falling back to browser's local timezone '" + TimezoneUtil.getLocalTimezone() + "'.");
		}
		return bIsValidTimezone;
	}

	/**
	 * @class Encapsulates configuration settings that are related to data formatting/parsing.
	 *
	 * <b>Note:</b> When format configuration settings are modified through this class,
	 * UI5 only ensures that formatter objects created after that point in time will honor
	 * the modifications. To be on the safe side, applications should do any modifications
	 * early in their lifecycle or recreate any model/UI that is locale dependent.
	 *
	 * @name sap.ui.core.Configuration.FormatSettings
	 * @extends sap.ui.base.Object
	 * @public
	 */
	BaseObject.extend("sap.ui.core.Configuration.FormatSettings", /** @lends sap.ui.core.Configuration.FormatSettings.prototype */ {
		constructor : function(oConfiguration) {
			this.oConfiguration = oConfiguration;
			this.mSettings = {};
			this.sLegacyDateFormat = undefined;
			this.sLegacyTimeFormat = undefined;
			this.sLegacyNumberFormatSymbolSet = undefined;
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
		 */
		getFormatLocale : function() {
			function fallback(that) {
				var oLocale = that.oConfiguration.getValue("language");
				// if any user settings have been defined, add the private use subtag "sapufmt"
				if ( !isEmptyObject(that.mSettings) ) {
					// TODO move to Locale/LocaleData
					var l = oLocale.toString();
					if ( l.indexOf("-x-") < 0 ) {
						l = l + "-x-sapufmt";
					} else if ( l.indexOf("-sapufmt") <= l.indexOf("-x-") ) {
						l = l + "-sapufmt";
					}
					oLocale = new Locale(l);
				}
				return oLocale;
			}
			return this.oConfiguration.getValue("formatLocale") || fallback(this);
		},

		_set : function(sKey, oValue) {
			var oOldValue = this.mSettings[sKey];
			if ( oValue != null ) {
				this.mSettings[sKey] = oValue;
			} else {
				delete this.mSettings[sKey];
			}
			// report a change only if old and new value differ (null/undefined are treated as the same value)
			if ( (oOldValue != null || oValue != null) && !deepEqual(oOldValue, oValue) ) {
				var mChanges = this.oConfiguration._collect();
				mChanges[sKey] = oValue;
				this.oConfiguration._endCollect();
			}
		},

		/**
		 * Retrieves the custom units.
		 * These custom units are set by {@link sap.ui.core.Configuration#setCustomUnits} and {@link sap.ui.core.Configuration#addCustomUnits}
		 * @return {object} custom units object
		 * @see sap.ui.core.Configuration#setCustomUnits
		 * @see sap.ui.core.Configuration#addCustomUnits
		 */
		getCustomUnits: function () {
			return this.mSettings["units"] ? this.mSettings["units"]["short"] : undefined;
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
		 * @returns {this}
		 */
		setCustomUnits: function (mUnits) {
			// add custom units, or remove the existing ones if none are given
			var mUnitsshort = null;
			if (mUnits) {
				mUnitsshort = {
					"short": mUnits
				};
			}
			this._set("units", mUnitsshort);
			return this;
		},

		/**
		 * Adds custom units.
		 * Similar to {@link sap.ui.core.Configuration#setCustomUnits} but instead of setting the custom units, it will add additional ones.
		 * @param {object} mUnits custom unit object which replaces the current custom unit definition. Call with <code>null</code> to delete custom units.
		 * @returns {this}
		 * @see sap.ui.core.Configuration#setCustomUnits
		 */
		addCustomUnits: function (mUnits) {
			// add custom units, or remove the existing ones if none are given
			var mExistingUnits = this.getCustomUnits();
			if (mExistingUnits){
				mUnits = extend({}, mExistingUnits, mUnits);
			}
			this.setCustomUnits(mUnits);
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
			this._set("unitMappings", mUnitMappings);
			return this;
		},

		/**
		 * Adds unit mappings.
		 * Similar to {@link sap.ui.core.Configuration#setUnitMappings} but instead of setting the unit mappings, it will add additional ones.
		 * @param {object} mUnitMappings unit mappings
		 * @returns {this}
		 * @see sap.ui.core.Configuration#setUnitMappings
		 */
		addUnitMappings: function (mUnitMappings) {
			// add custom units, or remove the existing ones if none are given
			var mExistingUnits = this.getUnitMappings();
			if (mExistingUnits){
				mUnitMappings = extend({}, mExistingUnits, mUnitMappings);
			}
			this.setUnitMappings(mUnitMappings);
			return this;
		},

		/**
		 * Retrieves the unit mappings.
		 * These unit mappings are set by {@link sap.ui.core.Configuration#setUnitMappings} and {@link sap.ui.core.Configuration#addUnitMappings}
		 * @returns {object} unit mapping object
		 * @see sap.ui.core.Configuration#setUnitMappings
		 * @see sap.ui.core.Configuration#addUnitMappings
		 */
		getUnitMappings: function () {
			return this.mSettings["unitMappings"];
		},

		/**
		 * Returns the currently set date pattern or undefined if no pattern has been defined.
		 * @public
		 */
		getDatePattern : function(sStyle) {
			assert(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			return this.mSettings["dateFormats-" + sStyle];
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
		 * specific parts of the UI. See the documentation of {@link sap.ui.core.Configuration#setLanguage}
		 * for details and restrictions.
		 *
		 * @param {string} sStyle must be one of short, medium, long or full.
		 * @param {string} sPattern the format pattern to be used in LDML syntax.
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 */
		setDatePattern : function(sStyle, sPattern) {
			check(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			this._set("dateFormats-" + sStyle, sPattern);
			return this;
		},

		/**
		 * Returns the currently set time pattern or undefined if no pattern has been defined.
		 * @public
		 */
		getTimePattern : function(sStyle) {
			assert(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			return this.mSettings["timeFormats-" + sStyle];
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
		 * specific parts of the UI. See the documentation of {@link sap.ui.core.Configuration#setLanguage}
		 * for details and restrictions.
		 *
		 * @param {string} sStyle must be one of short, medium, long or full.
		 * @param {string} sPattern the format pattern to be used in LDML syntax.
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 */
		setTimePattern : function(sStyle, sPattern) {
			check(sStyle == "short" || sStyle == "medium" || sStyle == "long" || sStyle == "full", "sStyle must be short, medium, long or full");
			this._set("timeFormats-" + sStyle, sPattern);
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
			return this.mSettings["symbols-latn-" + sType];
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
		 * specific parts of the UI. See the documentation of {@link sap.ui.core.Configuration#setLanguage}
		 * for details and restrictions.
		 *
		 * @param {"group"|"decimal"|"plusSign"|"minusSign"} sType the type of symbol
		 * @param {string} sSymbol will be used to represent the given symbol type
		 * @returns {this} Returns <code>this</code> to allow method chaining
		 * @public
		 */
		setNumberSymbol : function(sType, sSymbol) {
			check(["group", "decimal", "plusSign", "minusSign"].includes(sType), "sType must be decimal, group, plusSign or minusSign");
			this._set("symbols-latn-" + sType, sSymbol);
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
			return this.mSettings["currency"];
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
			this._set("currency", mCurrencies);
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
		 * @see sap.ui.core.Configuration.FormatSettings#setCustomCurrencies
		 */
		addCustomCurrencies: function (mCurrencies) {
			// add custom units, or remove the existing ones if none are given
			var mExistingCurrencies = this.getCustomCurrencies();
			if (mExistingCurrencies){
				mCurrencies = extend({}, mExistingCurrencies, mCurrencies);
			}
			this.setCustomCurrencies(mCurrencies);
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
		 */
		setFirstDayOfWeek : function(iValue) {
			check(typeof iValue == "number" && iValue >= 0 && iValue <= 6, "iValue must be an integer value between 0 and 6");
			this._set("weekData-firstDay", iValue);
			return this;
		},

		_setDayPeriods : function(sWidth, aTexts) {
			assert(sWidth == "narrow" || sWidth == "abbreviated" || sWidth == "wide", "sWidth must be narrow, abbreviated or wide");
			this._set("dayPeriods-format-" + sWidth, aTexts);
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
			return this.sLegacyDateFormat || undefined;
		},

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
		 */
		setLegacyDateFormat : function(sFormatId) {
			sFormatId = sFormatId ? String(sFormatId).toUpperCase() : "";
			check(M_ABAP_DATE_FORMAT_PATTERN.hasOwnProperty(sFormatId), "sFormatId must be one of ['1','2','3','4','5','6','7','8','9','A','B','C'] or empty");
			var mChanges = this.oConfiguration._collect();
			this.sLegacyDateFormat = mChanges.legacyDateFormat = sFormatId;
			this.setDatePattern("short", M_ABAP_DATE_FORMAT_PATTERN[sFormatId].pattern);
			this.setDatePattern("medium", M_ABAP_DATE_FORMAT_PATTERN[sFormatId].pattern);
			this.oConfiguration._endCollect();
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
			return this.sLegacyTimeFormat || undefined;
		},

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
		 */
		setLegacyTimeFormat : function(sFormatId) {
			sFormatId = sFormatId || "";
			check(M_ABAP_TIME_FORMAT_PATTERN.hasOwnProperty(sFormatId), "sFormatId must be one of ['0','1','2','3','4'] or empty");
			var mChanges = this.oConfiguration._collect();
			this.sLegacyTimeFormat = mChanges.legacyTimeFormat = sFormatId;
			this.setTimePattern("short", M_ABAP_TIME_FORMAT_PATTERN[sFormatId]["short"]);
			this.setTimePattern("medium", M_ABAP_TIME_FORMAT_PATTERN[sFormatId]["medium"]);
			this._setDayPeriods("abbreviated", M_ABAP_TIME_FORMAT_PATTERN[sFormatId].dayPeriods);
			this.oConfiguration._endCollect();
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
			return this.sLegacyNumberFormat || undefined;
		},

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
		 */
		setLegacyNumberFormat : function(sFormatId) {
			sFormatId = sFormatId ? sFormatId.toUpperCase() : "";
			check(M_ABAP_NUMBER_FORMAT_SYMBOLS.hasOwnProperty(sFormatId), "sFormatId must be one of [' ','X','Y'] or empty");
			var mChanges = this.oConfiguration._collect();
			this.sLegacyNumberFormat = mChanges.legacyNumberFormat = sFormatId;
			this.setNumberSymbol("group", M_ABAP_NUMBER_FORMAT_SYMBOLS[sFormatId].groupingSeparator);
			this.setNumberSymbol("decimal", M_ABAP_NUMBER_FORMAT_SYMBOLS[sFormatId].decimalSeparator);
			this.oConfiguration._endCollect();
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

			var mChanges = this.oConfiguration._collect();
			this.aLegacyDateCalendarCustomizing = mChanges.legacyDateCalendarCustomizing = aMappings.slice();
			this.oConfiguration._endCollect();
			return this;
		},

		/**
		 * Returns the currently set customizing data for Islamic calendar support
		 *
		 * @return {object[]} Returns an array contains the customizing data. Each element in the array has properties: dateFormat, islamicMonthStart, gregDate. For details, please see {@link #setLegacyDateCalendarCustomizing}
		 * @public
		 */
		getLegacyDateCalendarCustomizing : function() {
			var aLegacyDateCalendarCustomizing = this.aLegacyDateCalendarCustomizing;
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
			this.oConfiguration.trailingCurrencyCode = bTrailingCurrencyCode;
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
			return this.oConfiguration.getValue("trailingCurrencyCode");
		},

		/*
		 * Returns a live object with the current settings
		 * TODO this method is part of the facade to be accessible from LocaleData, but it shouldn't be
		 * @private
		 */
		getCustomLocaleData : function() {
			return this.mSettings;
		}
	});

	oConfiguration =  new Configuration();
	Object.assign(Configuration, oConfiguration.getInterface());
	return Configuration;

});
