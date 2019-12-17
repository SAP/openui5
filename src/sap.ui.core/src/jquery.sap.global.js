/*!
 * ${copyright}
 */

/*global ActiveXObject, XMLHttpRequest, localStorage, alert, confirm, console, document, Promise */

/**
 * Provides base functionality of the SAP jQuery plugin as extension of the jQuery framework.<br/>
 * See also <a href="http://api.jquery.com/jQuery/">jQuery</a> for details.<br/>
 * Although these functions appear as static ones, they are meant to be used on jQuery instances.<br/>
 * If not stated differently, the functions follow the fluent interface paradigm and return the jQuery instance for chaining of statements.
 *
 * Example for usage of an instance method:
 * <pre>
 *   var oRect = jQuery("#myDiv").rect();
 *   alert("Top Position: " + oRect.top);
 * </pre>
 *
 * @namespace jQuery
 * @public
 */
sap.ui.define([
	// new sap/base/* modules
	"sap/base/util/now", "sap/base/util/Version", "sap/base/assert", "sap/base/Log",

	// new sap/ui/* modules
	"sap/ui/dom/getComputedStyleFix", "sap/ui/dom/activeElementFix", "sap/ui/dom/includeScript",
	"sap/ui/dom/includeStylesheet", "sap/ui/core/support/Hotkeys", "sap/ui/test/RecorderHotkeyListener",
	"sap/ui/security/FrameOptions", "sap/ui/performance/Measurement", "sap/ui/performance/trace/Interaction",
	"sap/ui/base/syncXHRFix", "sap/base/util/LoaderExtensions",
	'sap/ui/events/PasteEventFix',

	// former sap-ui-core.js dependencies
	"sap/ui/Device", "sap/ui/thirdparty/URI",

	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/jqueryui/jquery-ui-position",
	"ui5loader-autoconfig",
	"jquery.sap.stubs"
], function(now, Version, assert, Log,

	getComputedStyleFix, activeElementFix, includeScript,
	includeStylesheet, SupportHotkeys, TestRecorderHotkeyListener,
	FrameOptions, Measurement, Interaction,
	syncXHRFix, LoaderExtensions,
	PasteEventFix,

	Device, URI,

	jQuery /*, jqueryUiPosition, ui5loaderAutoconfig, jquerySapStubs */) {

	"use strict";

	if ( !jQuery ) {
		throw new Error("Loading of jQuery failed");
	}

	var ui5loader = sap.ui.loader;

	if ( !ui5loader || !ui5loader._ ) {
		throw new Error("The UI5 compatilbility module requires a UI5 specific AMD implementation");
	}

	var _ui5loader = ui5loader._;

	// early logging support
	var _earlyLogs = [];
	function _earlyLog(sLevel, sMessage) {
		_earlyLogs.push({
			level: sLevel,
			message: sMessage
		});
	}

	var oJQVersion = Version(jQuery.fn.jquery);

	(function() {
		/**
		 * Holds information about the browser's capabilities and quirks.
		 * This object is provided and documented by jQuery.
		 * But it is extended by SAPUI5 with detection for features not covered by jQuery. This documentation ONLY covers the detection properties added by UI5.
		 * For the standard detection properties, please refer to the jQuery documentation.
		 *
		 * These properties added by UI5 are only available temporarily until jQuery adds feature detection on their own.
		 *
		 * @name jQuery.support
		 * @namespace
		 * @private
	 	 * @deprecated since 1.58 use {@link sap.ui.Device} instead
		 */
		jQuery.support = jQuery.support || {};

		/**
		 * Whether the device has a retina display (window.devicePixelRatio >= 2)
		 * @type {boolean}
		 * @public
		 * @deprecated since 1.58 use {@link sap.ui.Device.support.retina} instead
		 */
		jQuery.support.retina = Device.support.retina;

		// this is also defined by jquery-mobile-custom.js, but this information is needed earlier
		jQuery.support.touch = Device.support.touch;

		/**
		 * Whether the current browser supports (2D) CSS transforms
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.cssTransforms
		 */
		jQuery.support.cssTransforms = true;

		/**
		 * Whether the current browser supports 3D CSS transforms
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.cssTransforms3d
		 */
		jQuery.support.cssTransforms3d = true;

		/**
		 * Whether the current browser supports CSS transitions
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.cssTransitions
		 */
		jQuery.support.cssTransitions = true;

		/**
		 * Whether the current browser supports (named) CSS animations
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.cssAnimations
		 */
		jQuery.support.cssAnimations = true;

		/**
		 * Whether the current browser supports CSS gradients. Note that ANY support for CSS gradients leads to "true" here, no matter what the syntax is.
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.cssGradients
		 */
		jQuery.support.cssGradients = true;

		/**
		 * Whether the current browser supports only prefixed flexible layout properties
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.flexBoxPrefixed
		 */
		jQuery.support.flexBoxPrefixed = false;

		/**
		 * Whether the current browser supports the OLD CSS3 Flexible Box Layout directly or via vendor prefixes
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.flexBoxLayout
		 */
		jQuery.support.flexBoxLayout = false;

		/**
		 * Whether the current browser supports the NEW CSS3 Flexible Box Layout directly or via vendor prefixes
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.newFlexBoxLayout
		 */
		jQuery.support.newFlexBoxLayout = true;

		/**
		 * Whether the current browser supports the IE10 CSS3 Flexible Box Layout directly or via vendor prefixes
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.ie10FlexBoxLayout
		 */
		jQuery.support.ie10FlexBoxLayout = false;

		/**
		 * Whether the current browser supports any kind of Flexible Box Layout directly or via vendor prefixes
		 * @type {boolean}
		 * @private
		 * @name jQuery.support.hasFlexBoxSupport
		 */
		jQuery.support.hasFlexBoxSupport = true;
	}());

	// XHR overrides for IE
	if ( Device.browser.msie ) {

		// Fixes the CORS issue (introduced by jQuery 1.7) when loading resources
		// (e.g. SAPUI5 script) from other domains for IE browsers.
		// The CORS check in jQuery filters out such browsers who do not have the
		// property "withCredentials" which is the IE and Opera and prevents those
		// browsers to request data from other domains with jQuery.ajax. The CORS
		// requests are simply forbidden nevertheless if it works. In our case we
		// simply load our script resources from another domain when using the CDN
		// variant of SAPUI5. The following fix is also recommended by jQuery:

		jQuery.support.cors = true;

		// Fixes XHR factory issue (introduced by jQuery 1.11). In case of IE
		// it uses by mistake the ActiveXObject XHR. In the list of XHR supported
		// HTTP methods PATCH and MERGE are missing which are required for OData.
		// The related ticket is: #2068 (no downported to jQuery 1.x planned)
		// the fix will only be applied to jQuery >= 1.11.0 (only for jQuery 1.x)
		if ( window.ActiveXObject !== undefined && oJQVersion.inRange("1.11", "2") ) {
			var fnCreateStandardXHR = function() {
				try {
					return new XMLHttpRequest();
				} catch (e) { /* ignore */ }
			};
			var fnCreateActiveXHR = function() {
				try {
					return new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e) { /* ignore */ }
			};
			jQuery.ajaxSettings = jQuery.ajaxSettings || {};
			jQuery.ajaxSettings.xhr = function() {
				return !this.isLocal ? fnCreateStandardXHR() : fnCreateActiveXHR();
			};
		}

	}

	// getComputedStyle polyfill for firefox
	if ( Device.browser.firefox ) {
		getComputedStyleFix();
	}

	// document.activeElement iframe fix
	if (Device.browser.msie || Device.browser.edge) {
		activeElementFix();
	}

	// XHR proxy for Firefox
	if ( Device.browser.firefox && window.Proxy ) {
		syncXHRFix();
	}

	/*
	 * Merged, raw (un-interpreted) configuration data from the following sources
	 * (last one wins)
	 * <ol>
	 * <li>global configuration object <code>window["sap-ui-config"]</code> (could be either a string/url or a conffiguration object)</li>
	 * <li><code>data-sap-ui-config</code> attribute of the bootstrap script tag</li>
	 * <li>other <code>data-sap-ui-<i>xyz</i></code> attributes of the bootstrap tag</li>
	 * </ol>
	 */
	var oCfgData = window["sap-ui-config"] = (function() {
		function normalize(o) {
			for (var i in o) {
				var v = o[i];
				var il = i.toLowerCase();
				if ( !o.hasOwnProperty(il) ) {
					o[il] = v;
					delete o[i];
				}
			}
			return o;
		}

		function loadExternalConfig(url) {
			var sCfgFile = "sap-ui-config.json",
				config;

			Log.warning("Loading external bootstrap configuration from \"" + url + "\". This is a design time feature and not for productive usage!");
			if (url !== sCfgFile) {
				Log.warning("The external bootstrap configuration file should be named \"" + sCfgFile + "\"!");
			}

			var xhr = new XMLHttpRequest();
			xhr.addEventListener('load', function(e) {
				if ( xhr.status === 200 && xhr.responseText ) {
					try {
						config = JSON.parse( xhr.responseText );
					} catch (error) {
						Log.error("Parsing externalized bootstrap configuration from \"" + url + "\" failed! Reason: " + error + "!");
					}
				} else {
					Log.error("Loading externalized bootstrap configuration from \"" + url + "\" failed! Response: " + xhr.status + "!");
				}
			});
			xhr.open('GET', url, false);
			try {
				xhr.send();
			} catch (error) {
				Log.error("Loading externalized bootstrap configuration from \"" + url + "\" failed! Reason: " + error + "!");
			}

			config = config || {};
			config.__loaded = true; // mark config as 'being loaded', needed to detect sync call

			return config;
		}

		function getInfo() {
			function check(oScript, rUrlPattern) {
				var sUrl = oScript && oScript.getAttribute("src");
				var oMatch = rUrlPattern.exec(sUrl);
				if ( oMatch ) {
					return {
						tag: oScript,
						url: sUrl,
						resourceRoot: oMatch[1] || ""
					};
				}
			}

			var rResources = /^((?:.*\/)?resources\/)/,
				rBootScripts, aScripts, i, oResult;

			// Prefer script tags which have the sap-ui-bootstrap ID
			// This prevents issues when multiple script tags point to files named
			// "sap-ui-core.js", for example when using the cache buster for UI5 resources
			oResult = check(document.querySelector('SCRIPT[src][id=sap-ui-bootstrap]'), rResources);

			if ( !oResult ) {
				aScripts = document.querySelectorAll('SCRIPT[src]');
				rBootScripts = /^([^?#]*\/)?(?:sap-ui-(?:core|custom|boot|merged)(?:-[^?#/]*)?|jquery.sap.global|ui5loader(?:-autoconfig)?)\.js(?:[?#]|$)/;
				for ( i = 0; i < aScripts.length; i++ ) {
					oResult = check(aScripts[i], rBootScripts);
					if ( oResult ) {
						break;
					}
				}
			}

			return oResult || {};
		}

		var _oBootstrap = getInfo(),
			oScriptTag = _oBootstrap.tag,
			oCfg = window["sap-ui-config"];

		// load the configuration from an external JSON file
		if (typeof oCfg === "string") {
			oCfg = loadExternalConfig(oCfg);
		}

		oCfg = normalize(oCfg || {});
		oCfg.resourceroots = oCfg.resourceroots || {};
		oCfg.themeroots = oCfg.themeroots || {};

		// map loadall mode to sync preload mode
		if ( /(^|\/)(sap-?ui5|[^\/]+-all).js([?#]|$)/.test(_oBootstrap.url) ) {
			Log.error(
				"The all-in-one file 'sap-ui-core-all.js' has been abandoned in favour of standard preloads." +
				" Please migrate to sap-ui-core.js and consider to use async preloads.");
			oCfg.preload = 'sync';
		}

		// if a script tag has been identified, collect its configuration info
		if ( oScriptTag ) {
			// evaluate the config attribute first - if present
			var sConfig = oScriptTag.getAttribute("data-sap-ui-config");
			if ( sConfig ) {
				try {
					var oParsedConfig;
					try {
						// first try to parse the config as a plain JSON
						oParsedConfig = JSON.parse("{" + sConfig + "}");
					} catch (e) {
						// if the JSON.parse fails, we fall back to the more lenient "new Function" eval for compatibility reasons
						Log.error("JSON.parse on the data-sap-ui-config attribute failed. Please check the config for JSON syntax violations.");
						/*eslint-disable no-new-func */
						oParsedConfig = (new Function("return {" + sConfig + "};"))();
						/*eslint-enable no-new-func */
					}
					Object.assign(oCfg, normalize(oParsedConfig));
				} catch (e) {
					// no log yet, how to report this error?
					Log.error("failed to parse data-sap-ui-config attribute: " + (e.message || e));
				}
			}

			// merge with any existing "data-sap-ui-" attributes
			for (var i = 0; i < oScriptTag.attributes.length; i++) {
				var attr = oScriptTag.attributes[i];
				var m = attr.name.match(/^data-sap-ui-(.*)$/);
				if ( m ) {
					// the following (deactivated) conversion would implement multi-word names like "resource-roots"
					m = m[1].toLowerCase(); // .replace(/\-([a-z])/g, function(s,w) { return w.toUpperCase(); })
					if ( m === 'resourceroots' ) {
						// merge map entries instead of overwriting map
						Object.assign(oCfg[m], JSON.parse(attr.value));
					} else if ( m === 'theme-roots' ) {
						// merge map entries, but rename to camelCase
						Object.assign(oCfg.themeroots, JSON.parse(attr.value));
					} else if ( m !== 'config' ) {
						oCfg[m] = attr.value;
					}
				}
			}
		}

		return oCfg;
	}());

	var syncCallBehavior = 0; // ignore
	if ( oCfgData['xx-nosync'] === 'warn' || /(?:\?|&)sap-ui-xx-nosync=(?:warn)/.exec(window.location.search) ) {
		syncCallBehavior = 1;
	}
	if ( oCfgData['xx-nosync'] === true || oCfgData['xx-nosync'] === 'true' || /(?:\?|&)sap-ui-xx-nosync=(?:x|X|true)/.exec(window.location.search) ) {
		syncCallBehavior = 2;
	}

	ui5loader.config({
		reportSyncCalls: syncCallBehavior
	});

	if ( syncCallBehavior && oCfgData.__loaded ) {
		_earlyLog(syncCallBehavior === 1 ? "warning" : "error", "[nosync]: configuration loaded via sync XHR");
	}

	// check whether noConflict must be used...
	if ( oCfgData.noconflict === true || oCfgData.noconflict === "true"  || oCfgData.noconflict === "x" ) {
		jQuery.noConflict();
	}

	/**
	 * Root Namespace for the jQuery plug-in provided by SAP SE.
	 *
	 * @version ${version}
	 * @namespace
	 * @public
	 * @static
	 * @deprecated since 1.58. To avoid usage of global variables in general, please
	 *  do not use the jQuery.sap namespace any longer. Most of the jQuery.sap functionalities
	 *  are replaced by alternative modules which can be found in the API doc.
	 */
	jQuery.sap = jQuery.sap || {}; // namespace already created by jquery.sap.stubs

	// -------------------------- VERSION -------------------------------------

	/**
	 * Returns a Version instance created from the given parameters.
	 *
	 * This function can either be called as a constructor (using <code>new</code>) or as a normal function.
	 * It always returns an immutable Version instance.
	 *
	 * The parts of the version number (major, minor, patch, suffix) can be provided in several ways:
	 * <ul>
	 * <li>Version("1.2.3-SNAPSHOT")    - as a dot-separated string. Any non-numerical char or a dot followed
	 *                                    by a non-numerical char starts the suffix portion. Any missing major,
	 *                                    minor or patch versions will be set to 0.</li>
	 * <li>Version(1,2,3,"-SNAPSHOT")   - as individual parameters. Major, minor and patch must be integer numbers
	 *                                    or empty, suffix must be a string not starting with digits.</li>
	 * <li>Version([1,2,3,"-SNAPSHOT"]) - as an array with the individual parts. The same type restrictions apply
	 *                                    as before.</li>
	 * <li>Version(otherVersion)        - as a Version instance (cast operation). Returns the given instance instead
	 *                                    of creating a new one.</li>
	 * </ul>
	 *
	 * To keep the code size small, this implementation mainly validates the single string variant.
	 * All other variants are only validated to some degree. It is the responsibility of the caller to
	 * provide proper parts.
	 *
	 * @param {int|string|any[]|jQuery.sap.Version} vMajor the major part of the version (int) or any of the single
	 *        parameter variants explained above.
	 * @param {int} iMinor the minor part of the version number
	 * @param {int} iPatch the patch part of the version number
	 * @param {string} sSuffix the suffix part of the version number
	 * @return {jQuery.sap.Version} the version object as determined from the parameters
	 *
	 * @class Represents a version consisting of major, minor, patch version and suffix, e.g. '1.2.7-SNAPSHOT'.
	 *
	 * @public
	 * @since 1.15.0
	 * @alias jQuery.sap.Version
	 * @deprecated since 1.58 use {@link module:sap/base/util/Version} instead
	 */
	jQuery.sap.Version = Version;

	/**
	 * Returns a string representation of this version.
	 * @name jQuery.sap.Version#toString
	 * @return {string} a string representation of this version.
	 * @public
	 * @since 1.15.0
	 * @function
	 */

	/**
	 * Returns the major version part of this version.
	 * @name jQuery.sap.Version#getMajor
	 * @function
	 * @return {int} the major version part of this version
	 * @public
	 * @since 1.15.0
	 */

	/**
	 * Returns the minor version part of this version.
	 * @name jQuery.sap.Version#getMinor
	 * @return {int} the minor version part of this version
	 * @public
	 * @since 1.15.0
	 * @function
	 */

	/**
	 * Returns the patch (or micro) version part of this version.
	 * @name jQuery.sap.Version#getPatch
	 * @return {int} the patch version part of this version
	 * @public
	 * @since 1.15.0
	 * @function
	 */

	/**
	 * Returns the version suffix of this version.
	 *
	 * @name jQuery.sap.Version#getSuffix
	 * @return {string} the version suffix of this version
	 * @public
	 * @since 1.15.0
	 * @function
	 */

	/**
	 * Compares this version with a given one.
	 *
	 * The version with which this version should be compared can be given as a <code>jQuery.sap.Version</code> instance,
	 * as a string (e.g. <code>v.compareto("1.4.5")</code>). Or major, minor, patch and suffix values can be given as
	 * separate parameters (e.g. <code>v.compareTo(1, 4, 5)</code>) or in an array (e.g. <code>v.compareTo([1, 4, 5])</code>).
	 *
	 * @name jQuery.sap.Version#compareTo
	 * @return {int} 0, if the given version is equal to this version, a negative value if the given other version is greater
	 *               and a positive value otherwise
	 * @public
	 * @since 1.15.0
	 * @function
	 */

	/**
	 * Checks whether this version is in the range of the given interval (start inclusive, end exclusive).
	 *
	 * The boundaries against which this version should be checked can be given as  <code>jQuery.sap.Version</code>
	 * instances (e.g. <code>v.inRange(v1, v2)</code>), as strings (e.g. <code>v.inRange("1.4", "2.7")</code>)
	 * or as arrays (e.g. <code>v.inRange([1,4], [2,7])</code>).
	 *
	 * @name jQuery.sap.Version#inRange
	 * @param {string|any[]|jQuery.sap.Version} vMin the start of the range (inclusive)
	 * @param {string|any[]|jQuery.sap.Version} vMax the end of the range (exclusive)
	 * @return {boolean} <code>true</code> if this version is greater or equal to <code>vMin</code> and smaller
	 *                   than <code>vMax</code>, <code>false</code> otherwise.
	 * @public
	 * @since 1.15.0
	 * @function
	 */

	/**
	 * Returns a high resolution timestamp in microseconds if supported by the environment, otherwise in milliseconds.
	 * The timestamp is based on 01/01/1970 00:00:00 (UNIX epoch) as float with microsecond precision or
	 * with millisecond precision, if high resolution timestamps are not available.
	 * The fractional part of the timestamp represents fractions of a millisecond.
	 * Converting to a <code>Date</code> is possible by using <code>require(["sap/base/util/now"], function(now){new Date(now());}</code>
	 *
	 * @returns {float} timestamp in microseconds if supported by the environment otherwise in milliseconds
	 * @public
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/base/util/now} instead
	 */
	jQuery.sap.now = now;

	// Reads the value for the given key from the localStorage or writes a new value to it.
	var fnMakeLocalStorageAccessor = function(key, type, callback) {
		return function(value) {
			try {
				if ( value != null || type === 'string' ) {
					if (value) {
						localStorage.setItem(key, type === 'boolean' ? 'X' : value);
					} else {
						localStorage.removeItem(key);
					}
					callback(value);
				}
				value = localStorage.getItem(key);
				return type === 'boolean' ? value === 'X' : value;
			} catch (e) {
				Log.warning("Could not access localStorage while accessing '" + key + "' (value: '" + value + "', are cookies disabled?): " + e.message);
			}
		};
	};

	jQuery.sap.debug = fnMakeLocalStorageAccessor.call(this, 'sap-ui-debug', '', function(vDebugInfo) {
		/*eslint-disable no-alert */
		alert("Usage of debug sources is " + (vDebugInfo ? "on" : "off") + " now.\nFor the change to take effect, you need to reload the page.");
		/*eslint-enable no-alert */
	});

	/**
	 * Sets the URL to reboot this app from, the next time it is started. Only works with localStorage API available
	 * (and depending on the browser, if cookies are enabled, even though cookies are not used).
	 *
	 * @param {string} sRebootUrl the URL to sap-ui-core.js, from which the application should load UI5 on next restart; undefined clears the restart URL
	 * @returns {string} the current reboot URL or undefined in case of an error or when the reboot URL has been cleared
	 *
	 * @private
	 * @function
	 * @deprecated since 1.58
	 */
	jQuery.sap.setReboot = fnMakeLocalStorageAccessor.call(this, 'sap-ui-reboot-URL', 'string', function(sRebootUrl) { // null-ish clears the reboot request
		if ( sRebootUrl ) {
			/*eslint-disable no-alert */
			alert("Next time this app is launched (only once), it will load UI5 from:\n" + sRebootUrl + ".\nPlease reload the application page now.");
			/*eslint-enable no-alert */
		}
	});

	jQuery.sap.statistics = fnMakeLocalStorageAccessor.call(this, 'sap-ui-statistics', 'boolean', function(bUseStatistics) {
		/*eslint-disable no-alert */
		alert("Usage of Gateway statistics " + (bUseStatistics ? "on" : "off") + " now.\nFor the change to take effect, you need to reload the page.");
		/*eslint-enable no-alert */
	});

	// -------------------------- Logging -------------------------------------

	/**
	 * Creates a new Logger instance which will use the given component string
	 * for all logged messages without a specific component.
	 *
	 * @name jQuery.sap.log.Logger
	 * @param {string} sDefaultComponent The component to use
	 * @class A Logger class
	 * @since 1.1.2
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/base/Log.getLogger} instead
	 */

	/**
	 * Creates a new fatal-level entry in the log with the given message, details and calling component.
	 *
	 * @param {string} sMessage Message text to display
	 * @param {string} [sDetails=''] Details about the message, might be omitted
	 * @param {string} [sComponent=''] Name of the component that produced the log entry
	 * @param {function} [fnSupportInfo] Callback that returns an additional support object to be logged in support mode.
	 *   This function is only called if support info mode is turned on with <code>logSupportInfo(true)</code>.
	 *   To avoid negative effects regarding execution times and memory consumption, the returned object should be a simple
	 *   immutable JSON object with mostly static and stable content.
	 * @return {jQuery.sap.log.Logger} The log instance for method chaining
	 * @public
	 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
	 * @name jQuery.sap.log.Logger#fatal
	 * @function
	 */

	/**
	 * Creates a new error-level entry in the log with the given message, details and calling component.
	 *
	 * @param {string} sMessage Message text to display
	 * @param {string} [sDetails=''] Details about the message, might be omitted
	 * @param {string} [sComponent=''] Name of the component that produced the log entry
	 * @param {function} [fnSupportInfo] Callback that returns an additional support object to be logged in support mode.
	 *   This function is only called if support info mode is turned on with <code>logSupportInfo(true)</code>.
	 *   To avoid negative effects regarding execution times and memory consumption, the returned object should be a simple
	 *   immutable JSON object with mostly static and stable content.
	 * @return {jQuery.sap.log.Logger} The log instance
	 * @public
	 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
	 * @name jQuery.sap.log.Logger#error
	 * @function
	 */

	/**
	 * Creates a new warning-level entry in the log with the given message, details and calling component.
	 *
	 * @param {string} sMessage Message text to display
	 * @param {string} [sDetails=''] Details about the message, might be omitted
	 * @param {string} [sComponent=''] Name of the component that produced the log entry
	 * @param {function} [fnSupportInfo] Callback that returns an additional support object to be logged in support mode.
	 *   This function is only called if support info mode is turned on with <code>logSupportInfo(true)</code>.
	 *   To avoid negative effects regarding execution times and memory consumption, the returned object should be a simple
	 *   immutable JSON object with mostly static and stable content.
	 * @return {jQuery.sap.log.Logger} The log instance
	 * @public
	 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
	 * @name jQuery.sap.log.Logger#warning
	 * @function
	 */

	/**
	 * Creates a new info-level entry in the log with the given message, details and calling component.
	 *
	 * @param {string} sMessage Message text to display
	 * @param {string} [sDetails=''] Details about the message, might be omitted
	 * @param {string} [sComponent=''] Name of the component that produced the log entry
	 * @param {function} [fnSupportInfo] Callback that returns an additional support object to be logged in support mode.
	 *   This function is only called if support info mode is turned on with <code>logSupportInfo(true)</code>.
	 *   To avoid negative effects regarding execution times and memory consumption, the returned object should be a simple
	 *   immutable JSON object with mostly static and stable content.
	 * @return {jQuery.sap.log.Logger} The log instance
	 * @public
	 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
	 * @name jQuery.sap.log.Logger#info
	 * @function
	 */

	/**
	 * Creates a new debug-level entry in the log with the given message, details and calling component.
	 *
	 * @param {string} sMessage Message text to display
	 * @param {string} [sDetails=''] Details about the message, might be omitted
	 * @param {string} [sComponent=''] Name of the component that produced the log entry
	 * @param {function} [fnSupportInfo] Callback that returns an additional support object to be logged in support mode.
	 *   This function is only called if support info mode is turned on with <code>logSupportInfo(true)</code>.
	 *   To avoid negative effects regarding execution times and memory consumption, the returned object should be a simple
	 *   immutable JSON object with mostly static and stable content.
	 * @return {jQuery.sap.log.Logger} The log instance
	 * @public
	 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
	 * @name jQuery.sap.log.Logger#debug
	 * @function
	 */

	/**
	 * Creates a new trace-level entry in the log with the given message, details and calling component.
	 *
	 * @param {string} sMessage Message text to display
	 * @param {string} [sDetails=''] Details about the message, might be omitted
	 * @param {string} [sComponent=''] Name of the component that produced the log entry
	 * @param {function} [fnSupportInfo] Callback that returns an additional support object to be logged in support mode.
	 *   This function is only called if support info mode is turned on with <code>logSupportInfo(true)</code>.
	 *   To avoid negative effects regarding execution times and memory consumption, the returned object should be a simple
	 *   immutable JSON object with mostly static and stable content.
	 * @return {jQuery.sap.log.Logger} The log-instance
	 * @public
	 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
	 * @name jQuery.sap.log.Logger#trace
	 * @function
	 */

	/**
	 * Defines the maximum <code>jQuery.sap.log.Level</code> of log entries that will be recorded.
	 * Log entries with a higher (less important) log level will be omitted from the log.
	 * When a component name is given, the log level will be configured for that component
	 * only, otherwise the log level for the default component of this logger is set.
	 * For the global logger, the global default level is set.
	 *
	 * <b>Note</b>: Setting a global default log level has no impact on already defined
	 * component log levels. They always override the global default log level.
	 *
	 * @param {jQuery.sap.log.Level} iLogLevel The new log level
	 * @param {string} [sComponent] The log component to set the log level for
	 * @return {jQuery.sap.log.Logger} This logger object to allow method chaining
	 * @public
	 * @name jQuery.sap.log.Logger#setLevel
	 * @function
	 */

	/**
	 * Returns the log level currently effective for the given component.
	 * If no component is given or when no level has been configured for a
	 * given component, the log level for the default component of this logger is returned.
	 *
	 * @param {string} [sComponent] Name of the component to retrieve the log level for
	 * @return {int} The log level for the given component or the default log level
	 * @public
	 * @since 1.1.2
	 * @name jQuery.sap.log.Logger#getLevel
	 * @function
	 */

	/**
	 * Checks whether logging is enabled for the given log level,
	 * depending on the currently effective log level for the given component.
	 *
	 * If no component is given, the default component of this logger will be taken into account.
	 *
	 * @param {int} [iLevel=Level.DEBUG] The log level in question
	 * @param {string} [sComponent] Name of the component to check the log level for
	 * @return {boolean} Whether logging is enabled or not
	 * @public
	 * @since 1.13.2
	 * @name jQuery.sap.log.Logger#isLoggable
	 * @function
	 */

	/**
	 * A Logging API for JavaScript.
	 *
	 * Provides methods to manage a client-side log and to create entries in it. Each of the logging methods
	 * {@link jQuery.sap.log.debug}, {@link jQuery.sap.log.info}, {@link jQuery.sap.log.warning},
	 * {@link jQuery.sap.log.error} and {@link jQuery.sap.log.fatal} creates and records a log entry,
	 * containing a timestamp, a log level, a message with details and a component info.
	 * The log level will be one of {@link jQuery.sap.log.Level} and equals the name of the concrete logging method.
	 *
	 * By using the {@link jQuery.sap.log.setLevel} method, consumers can determine the least important
	 * log level which should be recorded. Less important entries will be filtered out. (Note that higher numeric
	 * values represent less important levels). The initially set level depends on the mode that UI5 is running in.
	 * When the optimized sources are executed, the default level will be {@link jQuery.sap.log.Level.ERROR}.
	 * For normal (debug sources), the default level is {@link jQuery.sap.log.Level.DEBUG}.
	 *
	 * All logging methods allow to specify a <b>component</b>. These components are simple strings and
	 * don't have a special meaning to the UI5 framework. However they can be used to semantically group
	 * log entries that belong to the same software component (or feature). There are two APIs that help
	 * to manage logging for such a component. With <code>{@link jQuery.sap.log.getLogger}(sComponent)</code>,
	 * one can retrieve a logger that automatically adds the given <code>sComponent</code> as component
	 * parameter to each log entry, if no other component is specified. Typically, JavaScript code will
	 * retrieve such a logger once during startup and reuse it for the rest of its lifecycle.
	 * Second, the {@link jQuery.sap.log.Logger#setLevel}(iLevel, sComponent) method allows to set the log level
	 * for a specific component only. This allows a more fine granular control about the created logging entries.
	 * {@link jQuery.sap.log.Logger#getLevel} allows to retrieve the currently effective log level for a given
	 * component.
	 *
	 * {@link jQuery.sap.log.getLogEntries} returns an array of the currently collected log entries.
	 *
	 * Furthermore, a listener can be registered to the log. It will be notified whenever a new entry
	 * is added to the log. The listener can be used for displaying log entries in a separate page area,
	 * or for sending it to some external target (server).
	 *
	 * @since 0.9.0
	 * @namespace
	 * @public
	 * @borrows jQuery.sap.log.Logger#fatal as fatal
	 * @borrows jQuery.sap.log.Logger#error as error
	 * @borrows jQuery.sap.log.Logger#warning as warning
	 * @borrows jQuery.sap.log.Logger#info as info
	 * @borrows jQuery.sap.log.Logger#debug as debug
	 * @borrows jQuery.sap.log.Logger#trace as trace
	 * @borrows jQuery.sap.log.Logger#getLevel as getLevel
	 * @borrows jQuery.sap.log.Logger#setLevel as setLevel
	 * @borrows jQuery.sap.log.Logger#isLoggable as isLoggable
	 * @deprecated since 1.58 use {@link module:sap/base/Log} instead
	 */
	jQuery.sap.log = Object.assign(Log.getLogger(), /** @lends jQuery.sap.log */ {

		/**
		 * Enumeration of the configurable log levels that a Logger should persist to the log.
		 *
		 * Only if the current LogLevel is higher than the level {@link jQuery.sap.log.Level} of the currently added log entry,
		 * then this very entry is permanently added to the log. Otherwise it is ignored.
		 * @see jQuery.sap.log.Logger#setLevel
		 * @enum {int}
		 * @public
		 * @deprecated since 1.58 use {@link module:sap/base/Log.Level} instead
		 */
		Level: Log.Level,

		/**
		 * Do not log anything
		 * @public
		 * @name jQuery.sap.log.Level.NONE
		 * @type {int}
		 */
		/**
		 * Fatal level. Use this for logging unrecoverable situations
		 * @public
		 * @name jQuery.sap.log.Level.FATAL
		 * @type {int}
		 */
		/**
		 * Error level. Use this for logging of erroneous but still recoverable situations
		 * @public
		 * @name jQuery.sap.log.Level.ERROR
		 * @type {int}
		 */
		/**
		 * Warning level. Use this for logging unwanted but foreseen situations
		 * @public
		 * @name jQuery.sap.log.Level.WARNING
		 * @type {int}
		 */
		/**
		 * Info level. Use this for logging information of purely informative nature
		 * @public
		 * @name jQuery.sap.log.Level.INFO
		 * @type {int}
		 */
		/**
		 * Debug level. Use this for logging information necessary for debugging
		 * @public
		 * @name jQuery.sap.log.Level.DEBUG
		 * @type {int}
		 */
		/**
		 * Trace level. Use this for tracing the program flow.
		 * @public
		 * @name jQuery.sap.log.Level.TRACE
		 * @type {int}
		 */
		/**
		 * Trace level to log everything.
		 * @public
		 * @name jQuery.sap.log.Level.ALL
		 * @type {int}
		 */

		/**
		 * Returns a {@link jQuery.sap.log.Logger} for the given component.
		 *
		 * The method might or might not return the same logger object across multiple calls.
		 * While loggers are assumed to be light weight objects, consumers should try to
		 * avoid redundant calls and instead keep references to already retrieved loggers.
		 *
		 * The optional second parameter <code>iDefaultLogLevel</code> allows to specify
		 * a default log level for the component. It is only applied when no log level has been
		 * defined so far for that component (ignoring inherited log levels). If this method is
		 * called multiple times for the same component but with different log levels,
		 * only the first call one might be taken into account.
		 *
		 * @param {string} sComponent Component to create the logger for
		 * @param {int} [iDefaultLogLevel] a default log level to be used for the component,
		 *   if no log level has been defined for it so far.
		 * @return {jQuery.sap.log.Logger} A logger for the component.
		 * @public
		 * @static
		 * @since 1.1.2
		 * @function
		 */
		getLogger: Log.getLogger,

		/**
		 * Returns the logged entries recorded so far as an array.
		 *
		 * Log entries are plain JavaScript objects with the following properties
		 * <ul>
		 * <li>timestamp {number} point in time when the entry was created</li>
		 * <li>level {int} LogLevel level of the entry</li>
		 * <li>message {string} message text of the entry</li>
		 * </ul>
		 *
		 * @return {object[]} an array containing the recorded log entries
		 * @public
		 * @static
		 * @since 1.1.2
		 * @function
		 */
		getLogEntries: Log.getLogEntries,

		/**
		 * Allows to add a new LogListener that will be notified for new log entries.
		 *
		 * The given object must provide method <code>onLogEntry</code> and can also be informed
		 * about <code>onDetachFromLog</code> and <code>onAttachToLog</code>
		 * @param {object} oListener The new listener object that should be informed
		 * @return {jQuery.sap.log} The global logger
		 * @public
		 * @static
		 * @function
		 */
		addLogListener: Log.addLogListener,

		/**
		 * Allows to remove a registered LogListener.
		 * @param {object} oListener The new listener object that should be removed
		 * @return {jQuery.sap.log} The global logger
		 * @public
		 * @static
		 * @function
		 */
		removeLogListener: Log.removeLogListener,

		/**
		 * Enables or disables whether additional support information is logged in a trace.
		 * If enabled, logging methods like error, warning, info and debug are calling the additional
		 * optional callback parameter fnSupportInfo and store the returned object in the log entry property supportInfo.
		 *
		 * @param {boolean} bEnabled true if the support information should be logged
		 * @private
		 * @static
		 * @since 1.46.0
		 * @function
		 */
		logSupportInfo: Log.logSupportInfo,

		/**
		 * Enumeration of levels that can be used in a call to {@link jQuery.sap.log.Logger#setLevel}(iLevel, sComponent).
		 *
		 * @deprecated Since 1.1.2. To streamline the Logging API a bit, the separation between Level and LogLevel has been given up.
		 * Use the (enriched) enumeration {@link jQuery.sap.log.Level} instead.
		 * @enum
		 * @public
		 */
		LogLevel: Log.Level,

		/**
		 * Retrieves the currently recorded log entries.
		 * @deprecated Since 1.1.2. To avoid confusion with getLogger, this method has been renamed to {@link jQuery.sap.log.getLogEntries}.
		 * @function
		 * @public
		 */
		getLog: Log.getLogEntries

	});


	var sWindowName = (typeof window === "undefined" || window.top == window) ? "" : "[" + window.location.pathname.split('/').slice(-1)[0] + "] ";

	/**
	 * A simple assertion mechanism that logs a message when a given condition is not met.
	 *
	 * <b>Note:</b> Calls to this method might be removed when the JavaScript code
	 *              is optimized during build. Therefore, callers should not rely on any side effects
	 *              of this method.
	 *
	 * @param {boolean} bResult Result of the checked assertion
	 * @param {string|function} vMessage Message that will be logged when the result is <code>false</code>. In case this is a function, the return value of the function will be displayed. This can be used to execute complex code only if the assertion fails.
	 *
	 * @public
	 * @static
	 * @SecSink {1|SECRET} Could expose secret data in logs
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/base/assert} instead
	 */
	jQuery.sap.assert = function(bResult, vMessage) {
		if (!bResult) {
			var sMessage = typeof vMessage === "function" ? vMessage() : vMessage;
			assert(bResult, sWindowName + sMessage);
		}
	};

	// evaluate configuration
	oCfgData.loglevel = (function() {
		var m = /(?:\?|&)sap-ui-log(?:L|-l)evel=([^&]*)/.exec(window.location.search);
		return m && m[1];
	}()) || oCfgData.loglevel;
	if ( oCfgData.loglevel ) {
		Log.setLevel(Log.Level[oCfgData.loglevel.toUpperCase()] || parseInt(oCfgData.loglevel));
	} else if (!window["sap-ui-optimized"]) {
		Log.setLevel(Log.Level.DEBUG);
	}

	Log.info("SAP Logger started.");
	// log early logs
	jQuery.each(_earlyLogs, function(i,e) {
		Log[e.level](e.message);
	});
	_earlyLogs = null;

	// ------------------------------------------- OBJECT --------------------------------------------------------

	/**
	 * Returns a new constructor function that creates objects with
	 * the given prototype.
	 *
	 * As of 1.45.0, this method has been deprecated. Use the following code pattern instead:
	 * <pre>
	 *   function MyFunction() {
	 *   };
	 *   MyFunction.prototype = oPrototype;
	 * </pre>
	 * @param {object} oPrototype Prototype to use for the new objects
	 * @return {function} the newly created constructor function
	 * @public
	 * @static
	 * @deprecated As of 1.45.0, define your own function and assign <code>oPrototype</code> to its <code>prototype</code> property instead.
	 */
	jQuery.sap.factory = function factory(oPrototype) {
		jQuery.sap.assert(typeof oPrototype == "object", "oPrototype must be an object (incl. null)");
		function Factory() {}
		Factory.prototype = oPrototype;
		return Factory;
	};

	/**
	 * Returns a new object which has the given <code>oPrototype</code> as its prototype.
	 *
	 * If several objects with the same prototype are to be created,
	 * {@link jQuery.sap.factory} should be used instead.
	 *
	 * @param {object} oPrototype Prototype to use for the new object
	 * @return {object} new object
	 * @public
	 * @static
	 * @deprecated As of 1.45.0, use <code>Object.create(oPrototype)</code> instead.
	 */
	jQuery.sap.newObject = function newObject(oPrototype) {
		jQuery.sap.assert(typeof oPrototype == "object", "oPrototype must be an object (incl. null)");
		// explicitly fall back to null for best compatibility with old implementation
		return Object.create(oPrototype || null);
	};

	/**
	 * Returns a new function that returns the given <code>oValue</code> (using its closure).
	 *
	 * Avoids the need for a dedicated member for the value.
	 *
	 * As closures don't come for free, this function should only be used when polluting
	 * the enclosing object is an absolute "must-not" (as it is the case in public base classes).
	 *
	 * @param {object} oValue The value that the getter should return
	 * @returns {function} The new getter function
	 * @public
	 * @static
	 * @function
	 * @deprecated since 1.58
	 */
	jQuery.sap.getter = function(oValue) {
		return function() {
			return oValue;
		};
	};

	/**
	 * Returns a JavaScript object which is identified by a sequence of names.
	 *
	 * A call to <code>getObject("a.b.C")</code> has essentially the same effect
	 * as accessing <code>window.a.b.C</code> but with the difference that missing
	 * intermediate objects (a or b in the example above) don't lead to an exception.
	 *
	 * When the addressed object exists, it is simply returned. If it doesn't exists,
	 * the behavior depends on the value of the second, optional parameter
	 * <code>iNoCreates</code> (assuming 'n' to be the number of names in the name sequence):
	 * <ul>
	 * <li>NaN: if iNoCreates is not a number and the addressed object doesn't exist,
	 *          then <code>getObject()</code> returns <code>undefined</code>.
	 * <li>0 &lt; iNoCreates &lt; n: any non-existing intermediate object is created, except
	 *          the <i>last</i> <code>iNoCreates</code> ones.
	 * </ul>
	 *
	 * Example:
	 * <pre>
	 *   getObject()            -- returns the context object (either param or window)
	 *   getObject("a.b.C")     -- will only try to get a.b.C and return undefined if not found.
	 *   getObject("a.b.C", 0)  -- will create a, b, and C in that order if they don't exists
	 *   getObject("a.b.c", 1)  -- will create a and b, but not C.
	 * </pre>
	 *
	 * When a <code>oContext</code> is given, the search starts in that object.
	 * Otherwise it starts in the <code>window</code> object that this plugin
	 * has been created in.
	 *
	 * Note: Although this method internally uses <code>object["key"]</code> to address object
	 *       properties, it does not support all possible characters in a name.
	 *       Especially the dot ('.') is not supported in the individual name segments,
	 *       as it is always interpreted as a name separator.
	 *
	 * @param {string} sName  a dot separated sequence of names that identify the required object
	 * @param {int}    [iNoCreates=NaN] number of objects (from the right) that should not be created
	 * @param {object} [oContext=window] the context to execute the search in
	 * @returns {function} The value of the named object
	 *
	 * @public
	 * @static
	 * @deprecated since 1.58 use {@link module:sap/base/util/ObjectPath.get} or
	 *  {@link module:sap/base/util/ObjectPath.set} instead
	 */
	jQuery.sap.getObject = function(sName, iNoCreates, oContext) {
		var oObject = oContext || window,
			aNames = (sName || "").split("."),
			l = aNames.length,
			iEndCreate = isNaN(iNoCreates) ? 0 : l - iNoCreates,
			i;

		if ( syncCallBehavior && oContext === window ) {
			Log.error("[nosync] getObject called to retrieve global name '" + sName + "'");
		}

		for (i = 0; oObject && i < l; i++) {
			if (!oObject[aNames[i]] && i < iEndCreate ) {
				oObject[aNames[i]] = {};
			}
			oObject = oObject[aNames[i]];
		}
		return oObject;
	};

	/**
	 * Sets an object property to a given value, where the property is
	 * identified by a sequence of names (path).
	 *
	 * When a <code>oContext</code> is given, the path starts in that object.
	 * Otherwise it starts in the <code>window</code> object that this plugin
	 * has been created for.
	 *
	 * Note: Although this method internally uses <code>object["key"]</code> to address object
	 *       properties, it does not support all possible characters in a name.
	 *       Especially the dot ('.') is not supported in the individual name segments,
	 *       as it is always interpreted as a name separator.
	 *
	 * @param {string} sName  a dot separated sequence of names that identify the property
	 * @param {any}    vValue value to be set, can have any type
	 * @param {object} [oContext=window] the context to execute the search in
	 * @public
	 * @static
	 * @deprecated since 1.58 use {@link module:sap/base/util/ObjectPath.set} instead
	 */
	jQuery.sap.setObject = function (sName, vValue, oContext) {
		var oObject = oContext || window,
			aNames = (sName || "").split("."),
			l = aNames.length, i;

		if ( l > 0 ) {
			for (i = 0; oObject && i < l - 1; i++) {
				if (!oObject[aNames[i]] ) {
					oObject[aNames[i]] = {};
				}
				oObject = oObject[aNames[i]];
			}
			oObject[aNames[l - 1]] = vValue;
		}
	};

	// ---------------------- performance measurement -----------------------------------------------------------

	/**
	 * Namespace for the jQuery performance measurement plug-in provided by SAP SE.
	 *
	 * @name jQuery.sap.measure
	 * @namespace
	 * @public
	 * @static
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement} or {@link module:sap/ui/performance/trace/Interaction} instead
	 */
	jQuery.sap.measure = Measurement;

	/**
	 * Gets the current state of the performance measurement functionality
	 *
	 * @name jQuery.sap.measure.getActive
	 * @function
	 * @return {boolean} current state of the performance measurement functionality
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement.getActive} instead
	 */

	/**
	 * Activates or deactivates the performance measure functionality
	 * Optionally a category or list of categories can be passed to restrict measurements to certain categories
	 * like "javascript", "require", "xmlhttprequest", "render"
	 * @param {boolean} bOn - state of the performance measurement functionality to set
	 * @param {string | string[]} aCategories - An optional list of categories that should be measured
	 *
	 * @return {boolean} current state of the performance measurement functionality
	 * @name jQuery.sap.measure#setActive
	 * @function
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement.setActive} instead
	 */

	/**
	 * Starts a performance measure.
	 * Optionally a category or list of categories can be passed to allow filtering of measurements.
	 *
	 * @name jQuery.sap.measure.start
	 * @function
	 * @param {string} sId ID of the measurement
	 * @param {string} sInfo Info for the measurement
	 * @param {string | string[]} [aCategories = "javascript"] An optional list of categories for the measure
	 *
	 * @return {object} current measurement containing id, info and start-timestamp (false if error)
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement.start} instead
	 */

	/**
	 * Pauses a performance measure
	 *
	 * @name jQuery.sap.measure.pause
	 * @function
	 * @param {string} sId ID of the measurement
	 * @return {object} current measurement containing id, info and start-timestamp, pause-timestamp (false if error)
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement.pause} instead
	 */

	/**
	 * Resumes a performance measure
	 *
	 * @name jQuery.sap.measure.resume
	 * @function
	 * @param {string} sId ID of the measurement
	 * @return {object} current measurement containing id, info and start-timestamp, resume-timestamp (false if error)
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement.resume} instead
	 */

	/**
	 * Ends a performance measure
	 *
	 * @name jQuery.sap.measure.end
	 * @function
	 * @param {string} sId ID of the measurement
	 * @return {object} current measurement containing id, info and start-timestamp, end-timestamp, time, duration (false if error)
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement.end} instead
	 */

	/**
	 * Clears all performance measurements
	 *
	 * @name jQuery.sap.measure.clear
	 * @function
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement.clear} instead
	 */

	/**
	 * Removes a performance measure
	 *
	 * @name jQuery.sap.measure.remove
	 * @function
	 * @param {string} sId ID of the measurement
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement.remove} instead
	 */

	/**
	 * Adds a performance measurement with all data
	 * This is useful to add external measurements (e.g. from a backend) to the common measurement UI
	 *
	 * @name jQuery.sap.measure.add
	 * @function
	 * @param {string} sId ID of the measurement
	 * @param {string} sInfo Info for the measurement
	 * @param {int} iStart start timestamp
	 * @param {int} iEnd end timestamp
	 * @param {int} iTime time in milliseconds
	 * @param {int} iDuration effective time in milliseconds
	 * @param {string | string[]} [aCategories = "javascript"] An optional list of categories for the measure
	 * @return {object} [] current measurement containing id, info and start-timestamp, end-timestamp, time, duration, categories (false if error)
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement.add} instead
	 */

	/**
	 * Starts an average performance measure.
	 * The duration of this measure is an avarage of durations measured for each call.
	 * Optionally a category or list of categories can be passed to allow filtering of measurements.
	 *
	 * @name jQuery.sap.measure.average
	 * @function
	 * @param {string} sId ID of the measurement
	 * @param {string} sInfo Info for the measurement
	 * @param {string | string[]} [aCategories = "javascript"] An optional list of categories for the measure
	 * @return {object} current measurement containing id, info and start-timestamp (false if error)
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement.average} instead
	 */

	/**
	 * Gets a performance measure
	 *
	 * @name jQuery.sap.measure.getMeasurement
	 * @function
	 * @param {string} sId ID of the measurement
	 * @return {object} current measurement containing id, info and start-timestamp, end-timestamp, time, duration (false if error)
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement.getMeasurement} instead
	 */

	/**
	 * Gets all performance measurements
	 *
	 * @name jQuery.sap.measure.getAllMeasurements
	 * @function
	 * @param {boolean} [bCompleted] Whether only completed measurements should be returned, if explicitly set to false only incomplete measurements are returned
	 * @return {object[]} current array with measurements containing id, info and start-timestamp, end-timestamp, time, duration, categories
	 * @public
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement.getAllMeasurements} instead
	 */

	/**
	 * Gets all performance measurements where a provided filter function returns a truthy value.
	 * If neither a filter function nor a category is provided an empty array is returned.
	 * To filter for certain properties of measurements a fnFilter can be implemented like this
	 * <code>
	 * function(oMeasurement) {
	 *     return oMeasurement.duration > 50;
	 * }</code>
	 *
	 * @name jQuery.sap.measure.filterMeasurements
	 * @function
	 * @param {function} [fnFilter] a filter function that returns true if the passed measurement should be added to the result
	 * @param {boolean|undefined} [bCompleted] Optional parameter to determine if either completed or incomplete measurements should be returned (both if not set or undefined)
	 * @param {string[]} [aCategories] The function returns only measurements which match these specified categories
	 *
	 * @return {object} [] filtered array with measurements containing id, info and start-timestamp, end-timestamp, time, duration, categories (false if error)
	 * @public
	 * @since 1.34.0
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement.filterMeasurements} instead
	 */

	/**
	 * Registers an average measurement for a given objects method
	 *
	 * @name jQuery.sap.measure.registerMethod
	 * @function
	 * @param {string} sId the id of the measurement
	 * @param {object} oObject the object of the method
	 * @param {string} sMethod the name of the method
	 * @param {string[]} [aCategories = ["javascript"]] An optional categories list for the measurement
	 *
	 * @returns {boolean} true if the registration was successful
	 * @public
	 * @since 1.34.0
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement.registerMethod} instead
	 */

	/**
	 * Unregisters an average measurement for a given objects method
	 *
	 * @name jQuery.sap.measure.unregisterMethod
	 * @function
	 * @param {string} sId the id of the measurement
	 * @param {object} oObject the object of the method
	 * @param {string} sMethod the name of the method
	 *
	 * @returns {boolean} true if the unregistration was successful
	 * @public
	 * @since 1.34.0
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement.unregisterMethod} instead
	 */

	/**
	 * Unregisters all average measurements
	 *
	 * @name jQuery.sap.measure.unregisterAllMethods
	 * @function
	 * @public
	 * @since 1.34.0
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/Measurement.unregisterAllMethods} instead
	 */

	/**
	 * Clears all interaction measurements
	 *
	 * @function
	 * @public
	 * @since 1.34.0
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/trace/Interaction.clear} instead
	 */
	jQuery.sap.measure.clearInteractionMeasurements = Interaction.clear;

	/**
	 * Start an interaction measurements
	 *
	 * @function
	 * @param {string} sType type of the event which triggered the interaction
	 * @param {object} oSrcElement the control on which the interaction was triggered
	 * @public
	 * @since 1.34.0
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/trace/Interaction.start} instead
	 */
	jQuery.sap.measure.startInteraction = Interaction.start;

	/**
	 * End an interaction measurements
	 *
	 * @function
	 * @param {boolean} bForce forces end of interaction now and ignores further re-renderings
	 * @public
	 * @since 1.34.0
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/trace/Interaction.end} instead
	 */
	jQuery.sap.measure.endInteraction = Interaction.end;

	/**
	 * Gets the incomplete pending interaction
	 * @function
	 * @return {object} interaction measurement
	 * @private
	 * @since 1.34.0
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/trace/Interaction.getPending} instead
	 */
	jQuery.sap.measure.getPendingInteractionMeasurement = Interaction.getPending;

	/**
	 * Gets all interaction measurements for which a provided filter function returns a truthy value.
	 * To filter for certain categories of measurements a fnFilter can be implemented like this
	 * <code>
	 * function(InteractionMeasurement) {
	 *     return InteractionMeasurement.duration > 0
	 * }</code>
	 *
	 * @function
	 * @param {function} fnFilter a filter function that returns true if the passed measurement should be added to the result
	 * @return {object[]} all interaction measurements passing the filter function successfully
	 * @public
	 * @since 1.36.2
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/trace/Interaction.filter} instead
	 */
	jQuery.sap.measure.filterInteractionMeasurements = Interaction.filter;

	/**
	 * Gets all interaction measurements
	 * @function
	 * @param {boolean} bFinalize finalize the current pending interaction so that it is contained in the returned array
	 * @return {object[]} all interaction measurements
	 * @public
	 * @since 1.34.0
	 * @deprecated since 1.58 use {@link module:sap/ui/performance/trace/Interaction.getAll} instead
	 */
	jQuery.sap.measure.getAllInteractionMeasurements = Interaction.getAll;

	/**
	 * Gets the current request timings array for type 'resource' safely
	 *
	 * @function
	 * @return {object[]} array of performance timing objects
	 * @public
	 * @since 1.34.0
	 * @deprecated since 1.58 use native function <code>performance.getEntriesByType("resource")</code> instead
	 */
	jQuery.sap.measure.getRequestTimings = function() {
		if (window.performance.getEntriesByType) {
			return window.performance.getEntriesByType("resource");
		}
		return [];
	};

	/**
	 * Clears all request timings safely.
	 *
	 * @function
	 * @public
	 * @since 1.34.0
	 * @deprecated since 1.58 use native function <code>performance.clearResourceTimings()</code> where available
	 */
	jQuery.sap.measure.clearRequestTimings = function() {
		if (window.performance.clearResourceTimings) {
			window.performance.clearResourceTimings();
		}
	};


	/**
	 * Sets the request buffer size for the measurement safely.
	 *
	 * @param {int} iSize size of the buffer
	 * @function
	 * @public
	 * @since 1.34.0
	 * @deprecated since 1.58 use native function <code>performance.setResourceTimingBufferSize(iSize)</code> where available
	 */
	jQuery.sap.measure.setRequestBufferSize = function(iSize) {
		if (window.performance.setResourceTimingBufferSize) {
			window.performance.setResourceTimingBufferSize(iSize);
		}
	};

	// ---------------------- require/declare --------------------------------------------------------

	var getModuleSystemInfo = (function() {

		/**
		 * Local logger for messages related to module loading.
		 *
		 * By default, the log level is the same as for the standard log, but not higher than <code>INFO</code>.
		 * With the experimental config option <code>xx-debugModuleLoading</code>, it can be raised to <code>DEBUG</code>.
		 * @private
		 */
		var oLog = _ui5loader.logger = Log.getLogger("sap.ui.ModuleSystem",
				(/sap-ui-xx-debug(M|-m)odule(L|-l)oading=(true|x|X)/.test(location.search) || oCfgData["xx-debugModuleLoading"]) ? Log.Level.DEBUG : Math.min(Log.getLevel(), Log.Level.INFO)
			),

			mKnownSubtypes = LoaderExtensions.getKnownSubtypes(),

			rSubTypes;

		(function() {
			var sSub = "";

			for (var sType in mKnownSubtypes) {
				sSub = (sSub ? sSub + "|" : "") + "(?:(?:" + mKnownSubtypes[sType].join("\\.|") + "\\.)?" + sType + ")";
			}
			sSub = "\\.(?:" + sSub + "|[^./]+)$";
			oLog.debug("constructed regexp for file sub-types :" + sSub);
			rSubTypes = new RegExp(sSub);
		}());

		function ui5ToRJS(sName) {
			if ( /^jquery\.sap\./.test(sName) ) {
				return sName;
			}
			return sName.replace(/\./g, "/");
		}

		/**
		 * Constructs a URL to load the module with the given name and file type (suffix).
		 *
		 * Searches the longest prefix of the given module name for which a registration
		 * exists (see {@link jQuery.sap.registerModulePath}) and replaces that prefix
		 * by the registered URL prefix.
		 *
		 * The remainder of the module name is appended to the URL, replacing any dot with a slash.
		 *
		 * Finally, the given suffix (typically a file name extension) is added (unconverted).
		 *
		 * The returned name (without the suffix) doesn't end with a slash.
		 *
		 * @param {string} sModuleName module name to detemrine the path for
		 * @param {string} sSuffix suffix to be added to the resulting path
		 * @return {string} calculated path (URL) to the given module
		 *
		 * @public
		 * @static
		 * @deprecated since 1.58 use {@link sap.ui.require.toUrl} instead
		 */
		jQuery.sap.getModulePath = function(sModuleName, sSuffix) {
			return jQuery.sap.getResourcePath(ui5ToRJS(sModuleName), sSuffix);
		};

		/**
		 * Determines the URL for a resource given its unified resource name.
		 *
		 * Searches the longest prefix of the given resource name for which a registration
		 * exists (see {@link jQuery.sap.registerResourcePath}) and replaces that prefix
		 * by the registered URL prefix.
		 *
		 * The remainder of the resource name is appended to the URL.
		 *
		 * <b>Unified Resource Names</b><br>
		 * Several UI5 APIs use <i>Unified Resource Names (URNs)</i> as naming scheme for resources that
		 * they deal with (e.h. Javascript, CSS, JSON, XML, ...). URNs are similar to the path
		 * component of a URL:
		 * <ul>
		 * <li>they consist of a non-empty sequence of name segments</li>
		 * <li>segments are separated by a forward slash '/'</li>
		 * <li>name segments consist of URL path segment characters only. It is recommended to use only ASCII
		 * letters (upper or lower case), digits and the special characters '$', '_', '-', '.')</li>
		 * <li>the empty name segment is not supported</li>
		 * <li>names consisting of dots only, are reserved and must not be used for resources</li>
		 * <li>names are case sensitive although the underlying server might be case-insensitive</li>
		 * <li>the behavior with regard to URL encoded characters is not specified, %ddd notation should be avoided</li>
		 * <li>the meaning of a leading slash is undefined, but might be defined in future. It therefore should be avoided</li>
		 * </ul>
		 *
		 * UI5 APIs that only deal with Javascript resources, use a slight variation of this scheme,
		 * where the extension '.js' is always omitted (see {@link sap.ui.define}, {@link sap.ui.require}).
		 *
		 *
		 * <b>Relationship to old Module Name Syntax</b><br>
		 *
		 * Older UI5 APIs that deal with resources (like {@link jQuery.sap.registerModulePath},
		 * {@link jQuery.sap.require} and {@link jQuery.sap.declare}) used a dot-separated naming scheme
		 * (called 'module names') which was motivated by object names in the global namespace in
		 * Javascript.
		 *
		 * The new URN scheme better matches the names of the corresponding resources (files) as stored
		 * in a server and the dot ('.') is no longer a forbidden character in a resource name. This finally
		 * allows to handle resources with different types (extensions) with the same API, not only JS files.
		 *
		 * Last but not least does the URN scheme better match the naming conventions used by AMD loaders
		 * (like <code>requireJS</code>).
		 *
		 * @param {string} sResourceName unified resource name of the resource
		 * @returns {string} URL to load the resource from
		 * @public
		 * @deprecated since 1.58 use {@link sap.ui.require.toUrl} instead
		 */
		jQuery.sap.getResourcePath = function(sResourceName, sSuffix) {
			// if no suffix was given and if the name is not empty, try to guess the suffix from the last segment
			if ( arguments.length === 1  &&  sResourceName != '' ) {
				// @evo-todo re-implement without split
				// only known types (and their known subtypes) are accepted
				var aSegments = sResourceName.split(/\//);
				var m = rSubTypes.exec(aSegments[aSegments.length - 1]);
				if ( m ) {
					sSuffix = m[0];
					aSegments[aSegments.length - 1] = aSegments[aSegments.length - 1].slice(0, m.index);
					sResourceName = aSegments.join('/');
				} else {
					sSuffix = "";
				}
			}

			return _ui5loader.getResourcePath(sResourceName, sSuffix);
		};

		/**
		 * Registers a URL prefix for a module name prefix.
		 *
		 * Before a module is loaded, the longest registered prefix of its module name
		 * is searched for and the associated URL prefix is used as a prefix for the request URL.
		 * The remainder of the module name is attached to the request URL by replacing
		 * dots ('.') with slashes ('/').
		 *
		 * The registration and search operates on full name segments only. So when a prefix
		 *
		 *    'sap.com'  ->  'http://www.sap.com/ui5/resources/'
		 *
		 * is registered, then it will match the name
		 *
		 *    'sap.com.Button'
		 *
		 * but not
		 *
		 *    'sap.commons.Button'
		 *
		 * Note that the empty prefix ('') will always match and thus serves as a fallback for
		 * any search.
		 *
		 * The prefix can either be given as string or as object which contains the url and a 'final' property.
		 * If 'final' is set to true, overwriting a module prefix is not possible anymore.
		 *
		 * @param {string} sModuleName module name to register a path for
		 * @param {string | object} vUrlPrefix path prefix to register, either a string literal or an object (e.g. {url : 'url/to/res', 'final': true})
		 * @param {string} [vUrlPrefix.url] path prefix to register
		 * @param {boolean} [vUrlPrefix.final] flag to avoid overwriting the url path prefix for the given module name at a later point of time
		 *
		 * @public
		 * @static
		 * @deprecated since 1.58 set path mappings via {@link sap.ui.loader.config} instead.
		 * @SecSink {1|PATH} Parameter is used for future HTTP requests
		 */
		jQuery.sap.registerModulePath = function registerModulePath(sModuleName, vUrlPrefix) {
			jQuery.sap.assert(!/\//.test(sModuleName), "module name must not contain a slash.");
			sModuleName = sModuleName.replace(/\./g, "/");
			// URL must not be empty
			vUrlPrefix = vUrlPrefix || '.';
			LoaderExtensions.registerResourcePath(sModuleName, vUrlPrefix);
		};

		/**
		 * Registers a URL prefix for a resource name prefix.
		 *
		 * Before a resource is loaded, the longest registered prefix of its unified resource name
		 * is searched for and the associated URL prefix is used as a prefix for the request URL.
		 * The remainder of the resource name is attached to the request URL 1:1.
		 *
		 * The registration and search operates on full name segments only. So when a prefix
		 *
		 *    'sap/com'  ->  'http://www.sap.com/ui5/resources/'
		 *
		 * is registered, then it will match the name
		 *
		 *    'sap/com/Button'
		 *
		 * but not
		 *
		 *    'sap/commons/Button'
		 *
		 * Note that the empty prefix ('') will always match and thus serves as a fallback for
		 * any search.
		 *
		 * The url prefix can either be given as string or as object which contains the url and a final flag.
		 * If final is set to true, overwriting a resource name prefix is not possible anymore.
		 *
		 * @param {string} sResourceNamePrefix in unified resource name syntax
		 * @param {string | object} vUrlPrefix prefix to use instead of the sResourceNamePrefix, either a string literal or an object (e.g. {url : 'url/to/res', 'final': true})
		 * @param {string} [vUrlPrefix.url] path prefix to register
		 * @param {boolean} [vUrlPrefix.final] flag to avoid overwriting the url path prefix for the given module name at a later point of time
		 *
		 * @public
		 * @static
		 * @deprecated since 1.58 set path mappings via {@link sap.ui.loader.config} instead.
		 * @SecSink {1|PATH} Parameter is used for future HTTP requests
		 */
		jQuery.sap.registerResourcePath = LoaderExtensions.registerResourcePath;

		/**
		 * Register information about third party modules that are not UI5 modules.
		 *
		 * The information maps the name of the module (without extension '.js') to an info object.
		 * Instead of a complete info object, only the value of the <code>deps</code> property can be given as an array.
		 *
		 * @param {object} mShims Map of shim configuration objects keyed by module names (withou extension '.js')
		 * @param {boolean} [mShims.any-module-name.amd=false]
		 *              Whether the module uses an AMD loader if present. If set to <code>true</code>, UI5 will disable
		 *              the AMD loader while loading such modules to force the modules to expose their content via global names.
		 * @param {string[]|string} [mShims.any-module-name.exports=undefined]
		 *              Global name (or names) that are exported by the module. If one ore multiple names are defined,
		 *              the first one will be read from the global object and will be used as value of the module.
		 *              Each name can be a dot separated hierarchical name (will be resolved with <code>jQuery.sap.getObject</code>)
		 * @param {string[]} [mShims.any-module-name.deps=undefined]
		 *              List of modules that the module depends on (requireJS syntax, no '.js').
		 *              The modules will be loaded first before loading the module itself.
		 *
		 * @private
		 * @ui5-restricted sap.ui.core sap.ui.export sap.ui.vk
	  	 * @deprecated Since 1.58, use {@link sap.ui.loader.config} instead
		 */
		jQuery.sap.registerModuleShims = function(mShims) {
			jQuery.sap.assert( typeof mShims === 'object', "mShims must be an object");
			ui5loader.config({
				shim: mShims
			});
		};

		/**
		 * Check whether a given module has been loaded / declared already.
		 *
		 * Returns true as soon as a module has been required the first time, even when
		 * loading/executing it has not finished yet. So the main assertion of a
		 * return value of <code>true</code> is that the necessary actions have been taken
		 * to make the module available in the near future. It does not mean, that
		 * the content of the module is already available!
		 *
		 * This fuzzy behavior is necessary to avoid multiple requests for the same module.
		 * As a consequence of the assertion above, a <i>preloaded</i> module does not
		 * count as <i>declared</i>. For preloaded modules, an explicit call to
		 * <code>jQuery.sap.require</code> is necessary to make them available.
		 *
		 * If a caller wants to know whether a module needs to be loaded from the server,
		 * it can set <code>bIncludePreloaded</code> to true. Then, preloaded modules will
		 * be reported as 'declared' as well by this method.
		 *
		 * @param {string} sModuleName name of the module to be checked
		 * @param {boolean} [bIncludePreloaded=false] whether preloaded modules should be reported as declared.
		 * @return {boolean} whether the module has been declared already
		 * @public
		 * @static
		 * @deprecated since 1.58 use {@link sap.ui.require} instead
		 */
		jQuery.sap.isDeclared = function isDeclared(sModuleName, bIncludePreloaded) {
			var state = _ui5loader.getModuleState( ui5ToRJS(sModuleName) + ".js" );
			return state && (bIncludePreloaded || state > 0);
		};

		/**
		 * Whether the given resource has been loaded (or preloaded).
		 * @param {string} sResourceName Name of the resource to check, in unified resource name format
		 * @returns {boolean} Whether the resource has been loaded already
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @deprecated since 1.58
		 */
		jQuery.sap.isResourceLoaded = function isResourceLoaded(sResourceName) {
			return !!_ui5loader.getModuleState(sResourceName);
		};

		/**
		 * Returns the names of all declared modules.
		 * @return {string[]} the names of all declared modules
		 * @see jQuery.sap.isDeclared
		 * @public
		 * @static
		 * @deprecated since 1.58
		 */
		jQuery.sap.getAllDeclaredModules = LoaderExtensions.getAllRequiredModules;


		// take resource roots from configuration
		var paths = {};
		for ( var n in oCfgData.resourceroots ) {
			paths[ui5ToRJS(n)] = oCfgData.resourceroots[n] || ".";
		}
		ui5loader.config({paths: paths});

		var mUrlPrefixes = _ui5loader.getUrlPrefixes();
		// dump the URL prefixes
		oLog.info("URL prefixes set to:");
		for (var n in mUrlPrefixes) {
			oLog.info("  " + (n ? "'" + n + "'" : "(default)") + " : " + mUrlPrefixes[n]);
		}

		/**
		 * Declares a module as existing.
		 *
		 * By default, this function assumes that the module will create a JavaScript object
		 * with the same name as the module. As a convenience it ensures that the parent
		 * namespace for that object exists (by calling jQuery.sap.getObject).
		 * If such an object creation is not desired, <code>bCreateNamespace</code> must be set to false.
		 *
		 * @param {string | object}  sModuleName name of the module to be declared
		 *                           or in case of an object {modName: "...", type: "..."}
		 *                           where modName is the name of the module and the type
		 *                           could be a specific dot separated extension e.g.
		 *                           <code>{modName: "sap.ui.core.Dev", type: "view"}</code>
		 *                           loads <code>sap/ui/core/Dev.view.js</code> and
		 *                           registers as <code>sap.ui.core.Dev.view</code>
		 * @param {boolean} [bCreateNamespace=true] whether to create the parent namespace
		 *
		 * @public
		 * @static
		 * @deprecated As of 1.52, UI5 modules and their dependencies should be defined using {@link sap.ui.define}.
		 *    For more details see {@link topic:91f23a736f4d1014b6dd926db0e91070 Modules and Dependencies} in the
		 *    documentation.
		 */
		jQuery.sap.declare = function(sModuleName, bCreateNamespace) {

			var sNamespaceObj = sModuleName;

			// check for an object as parameter for sModuleName
			// in case of this the object contains the module name and the type
			// which could be {modName: "sap.ui.core.Dev", type: "view"}
			if (typeof (sModuleName) === "object") {
				sNamespaceObj = sModuleName.modName;
				sModuleName = ui5ToRJS(sModuleName.modName) + (sModuleName.type ? "." + sModuleName.type : "") + ".js";
			} else {
				sModuleName = ui5ToRJS(sModuleName) + ".js";
			}

			_ui5loader.declareModule(sModuleName);

			// ensure parent namespace even if module was declared already
			// (as declare might have been called by require)
			if (bCreateNamespace !== false) {
				// ensure parent namespace
				jQuery.sap.getObject(sNamespaceObj, 1);
			}

		};

		/**
		 * Ensures that the given module is loaded and executed before execution of the
		 * current script continues.
		 *
		 * By issuing a call to this method, the caller declares a dependency to the listed modules.
		 *
		 * Any required and not yet loaded script will be loaded and execute synchronously.
		 * Already loaded modules will be skipped.
		 *
		 * @param {...string | object}  vModuleName one or more names of modules to be loaded
		 *                              or in case of an object {modName: "...", type: "..."}
		 *                              where modName is the name of the module and the type
		 *                              could be a specific dot separated extension e.g.
		 *                              <code>{modName: "sap.ui.core.Dev", type: "view"}</code>
		 *                              loads <code>sap/ui/core/Dev.view.js</code> and
		 *                              registers as <code>sap.ui.core.Dev.view</code>
		 *
		 * @public
		 * @static
		 * @function
		 * @SecSink {0|PATH} Parameter is used for future HTTP requests
		 * @deprecated As of 1.52, UI5 modules and their dependencies should be defined using {@link sap.ui.define}.
		 *    When additional modules have to be loaded dynamically at a later point in time, the asynchronous API
		 *    {@link sap.ui.require} should be used. For more details, see {@link topic:91f23a736f4d1014b6dd926db0e91070
		 *    Modules and Dependencies} in the documentation.
		 */
		jQuery.sap.require = function(vModuleName) {

			if ( arguments.length > 1 ) {
				// legacy mode with multiple arguments, each representing a dependency
				for (var i = 0; i < arguments.length; i++) {
					jQuery.sap.require(arguments[i]);
				}
				return this;
			}

			// check for an object as parameter for sModuleName
			// in case of this the object contains the module name and the type
			// which could be {modName: "sap.ui.core.Dev", type: "view"}
			if (typeof (vModuleName) === "object") {
				jQuery.sap.assert(!vModuleName.type || mKnownSubtypes.js.indexOf(vModuleName.type) >= 0, "type must be empty or one of " + mKnownSubtypes.js.join(", "));
				vModuleName = ui5ToRJS(vModuleName.modName) + (vModuleName.type ? "." + vModuleName.type : "");
			} else {
				vModuleName = ui5ToRJS(vModuleName);
			}

			sap.ui.requireSync(vModuleName);

		};

		// propagate legacy require hook to ui5loader translate hook
		Object.defineProperty(jQuery.sap.require, "_hook", {
			get: function() {
				return _ui5loader.translate;
			},
			set: function(hook) {
				jQuery.sap.assert(false, "jquery.sap.global: legacy hook for code transformation should no longer be used");
				_ui5loader.translate = hook;
			}
		});

		/**
		 * @private
		 * @deprecated
		 */
		jQuery.sap.preloadModules = function(sPreloadModule, bAsync, oSyncPoint) {
			Log.error("jQuery.sap.preloadModules was never a public API and has been removed. Migrate to Core.loadLibrary()!");
		};

		/**
		 * Adds all resources from a preload bundle to the preload cache.
		 *
		 * When a resource exists already in the cache, the new content is ignored.
		 *
		 * @param {object} oData Preload bundle
		 * @param {string} [oData.url] URL from which the bundle has been loaded
		 * @param {string} [oData.name] Unique name of the bundle
		 * @param {string} [oData.version='1.0'] Format version of the preload bundle
		 * @param {object} oData.modules Map of resources keyed by their resource name; each resource must be a string or a function
		 *
		 * @private
		 * @ui5-restricted sap.ui.core,preloadfiles
	  	 * @deprecated since 1.58
		 */
		jQuery.sap.registerPreloadedModules = function(oData) {

			var modules = oData.modules;
			if ( Version(oData.version || "1.0").compareTo("2.0") < 0 ) {
				modules = {};
				for ( var sName in oData.modules ) {
					modules[ui5ToRJS(sName) + ".js"] = oData.modules[sName];
				}
			}
			sap.ui.require.preload(modules, oData.name, oData.url);

		};

		/**
		 * Removes a set of resources from the resource cache.
		 *
		 * @param {string} sName unified resource name of a resource or the name of a preload group to be removed
		 * @param {boolean} [bPreloadGroup=true] whether the name specifies a preload group, defaults to true
		 * @param {boolean} [bUnloadAll] Whether all matching resources should be unloaded, even if they have been executed already.
		 * @param {boolean} [bDeleteExports] Whether exports (global variables) should be destroyed as well. Will be done for UI5 module names only.
		 * @experimental Since 1.16.3 API might change completely, apps must not develop against it.
		 * @private
		 * @function
	  	 * @deprecated since 1.58
		 */
		jQuery.sap.unloadResources = _ui5loader.unloadResources;

		/**
		 * Converts a UI5 module name to a unified resource name.
		 *
		 * Used by View and Fragment APIs to convert a given module name into a unified resource name.
		 * When the <code>sSuffix</code> is not given, the suffix '.js' is added. This fits the most
		 * common use case of converting a module name to the Javascript resource that contains the
		 * module. Note that an empty <code>sSuffix</code> is not replaced by '.js'. This allows to
		 * convert UI5 module names to requireJS module names with a call to this method.
		 *
		 * @param {string} sModuleName Module name as a dot separated name
		 * @param {string} [sSuffix='.js'] Suffix to add to the final resource name
		 * @private
		 * @ui5-restricted sap.ui.core
	  	 * @deprecated since 1.58
		 */
		jQuery.sap.getResourceName = function(sModuleName, sSuffix) {
			return ui5ToRJS(sModuleName) + (sSuffix == null ? ".js" : sSuffix);
		};

		/**
		 * Retrieves the resource with the given name, either from the preload cache or from
		 * the server. The expected data type of the resource can either be specified in the
		 * options (<code>dataType</code>) or it will be derived from the suffix of the <code>sResourceName</code>.
		 * The only supported data types so far are xml, html, json and text. If the resource name extension
		 * doesn't match any of these extensions, the data type must be specified in the options.
		 *
		 * If the resource is found in the preload cache, it will be converted from text format
		 * to the requested <code>dataType</code> using a converter from <code>jQuery.ajaxSettings.converters</code>.
		 *
		 * If it is not found, the resource name will be converted to a resource URL (using {@link #getResourcePath})
		 * and the resulting URL will be requested from the server with a synchronous jQuery.ajax call.
		 *
		 * If the resource was found in the local preload cache and any necessary conversion succeeded
		 * or when the resource was retrieved from the backend successfully, the content of the resource will
		 * be returned. In any other case, an exception will be thrown, or if option failOnError is set to true,
		 * <code>null</code> will be returned.
		 *
		 * Future implementations of this API might add more options. Generic implementations that accept an
		 * <code>mOptions</code> object and propagate it to this function should limit the options to the currently
		 * defined set of options or they might fail for unknown options.
		 *
		 * For asynchronous calls the return value of this method is an ECMA Script 6 Promise object which callbacks are triggered
		 * when the resource is ready:
		 * If <code>failOnError</code> is <code>false</code> the catch callback of the promise is not called. The argument given to the fullfilled
		 * callback is null in error case.
		 * If <code>failOnError</code> is <code>true</code> the catch callback will be triggered. The argument is an Error object in this case.
		 *
		 * @param {string} [sResourceName] resourceName in unified resource name syntax
		 * @param {object} [mOptions] options
		 * @param {object} [mOptions.dataType] one of "xml", "html", "json" or "text". If not specified it will be derived from the resource name (extension)
		 * @param {string} [mOptions.name] unified resource name of the resource to load (alternative syntax)
		 * @param {string} [mOptions.url] url of a resource to load (alternative syntax, name will only be a guess)
		 * @param {string} [mOptions.headers] Http headers for an eventual XHR request
		 * @param {string} [mOptions.failOnError=true] whether to propagate load errors or not
		 * @param {string} [mOptions.async=false] whether the loading should be performed asynchronously.
		 * @return {string|Document|object|Promise} content of the resource. A string for text or html, an Object for JSON, a Document for XML. For asynchronous calls an ECMA Script 6 Promise object will be returned.
		 * @throws Error if loading the resource failed
		 * @private
		 * @experimental API is not yet fully mature and may change in future.
		 * @since 1.15.1
	  	 * @deprecated since 1.58
		 */
		jQuery.sap.loadResource = LoaderExtensions.loadResource;

		/*
		 * register a global event handler to detect script execution errors.
		 * Only works for browsers that support document.currentScript.
		 * /
		window.addEventListener("error", function(e) {
			if ( document.currentScript && document.currentScript.dataset.sapUiModule ) {
				var error = {
					message: e.message,
					filename: e.filename,
					lineno: e.lineno,
					colno: e.colno
				};
				document.currentScript.dataset.sapUiModuleError = JSON.stringify(error);
			}
		});
		*/

		/**
		 * Loads the given Javascript resource (URN) asynchronously via as script tag.
		 * Returns a promise that will be resolved when the load event is fired or reject
		 * when the error event is fired.
		 *
		 * Note: execution errors of the script are not reported as 'error'.
		 *
		 * This method is not a full implementation of require. It is intended only for
		 * loading "preload" files that do not define an own module / module value.
		 *
		 * Functionality might be removed/renamed in future, so no code outside the
		 * sap.ui.core library must use it.
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted sap.ui.core,sap.ushell
	  	 * @deprecated since 1.58
		 */
		jQuery.sap._loadJSResourceAsync = _ui5loader.loadJSResourceAsync;

		return function() {
			return {
				modules : _ui5loader.getAllModules(),
				prefixes : _ui5loader.getUrlPrefixes()
			};
		};

	}());

	// --------------------- script and stylesheet handling --------------------------------------------------

	/**
	 * Includes the script (via &lt;script&gt;-tag) into the head for the
	 * specified <code>sUrl</code> and optional <code>sId</code>.
	 *
	 * @param {string|object}
	 *            vUrl the URL of the script to load or a configuration object
	 * @param {string}
	 *            vUrl.url the URL of the script to load
	 * @param {string}
	 *            [vUrl.id] id that should be used for the script tag
	 * @param {object}
	 *            [vUrl.attributes] map of attributes that should be used for the script tag
	 * @param {string|object}
	 *            [vId] id that should be used for the script tag or map of attributes
	 * @param {function}
	 *            [fnLoadCallback] callback function to get notified once the script has been loaded
	 * @param {function}
	 *            [fnErrorCallback] callback function to get notified once the script loading failed
	 * @return {void|Promise}
	 *            When using the configuration object a <code>Promise</code> will be returned. The
	 *            documentation for the <code>fnLoadCallback</code> applies to the <code>resolve</code>
	 *            handler of the <code>Promise</code> and the one for the <code>fnErrorCallback</code>
	 *            applies to the <code>reject</code> handler of the <code>Promise</code>.
	 *
	 * @public
	 * @static
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/ui/dom/includeScript} instead
	 * @SecSink {0|PATH} Parameter is used for future HTTP requests
	 */
	jQuery.sap.includeScript = includeScript;


	/**
	 * Includes the specified stylesheet via a &lt;link&gt;-tag in the head of the current document. If there is call to
	 * <code>includeStylesheet</code> providing the sId of an already included stylesheet, the existing element will be
	 * replaced.
	 *
	 * @param {string|object}
	 *          vUrl the URL of the stylesheet to load or a configuration object
	 * @param {string}
	 *          vUrl.url the URL of the stylesheet to load
	 * @param {string}
	 *          [vUrl.id] id that should be used for the link tag
	 * @param {object}
	 *          [vUrl.attributes] map of attributes that should be used for the script tag
	 * @param {string|object}
	 *          [vId] id that should be used for the link tag or map of attributes
	 * @param {function}
	 *          [fnLoadCallback] callback function to get notified once the stylesheet has been loaded
	 * @param {function}
	 *          [fnErrorCallback] callback function to get notified once the stylesheet loading failed.
	 *            In case of usage in IE the error callback will also be executed if an empty stylesheet
	 *            is loaded. This is the only option how to determine in IE if the load was successful
	 *            or not since the native onerror callback for link elements doesn't work in IE. The IE
	 *            always calls the onload callback of the link element.
	 * @return {void|Promise}
	 *            When using the configuration object a <code>Promise</code> will be returned. The
	 *            documentation for the <code>fnLoadCallback</code> applies to the <code>resolve</code>
	 *            handler of the <code>Promise</code> and the one for the <code>fnErrorCallback</code>
	 *            applies to the <code>reject</code> handler of the <code>Promise</code>.
	 *
	 * @public
	 * @static
	 * @function
	 * @deprecated since 1.58 use {@link module:sap/ui/dom/includeStylesheet} instead
	 * @SecSink {0|PATH} Parameter is used for future HTTP requests
	 */
	jQuery.sap.includeStyleSheet = includeStylesheet;

	// --------------------- support hooks ---------------------------------------------------------

	// TODO should be in core, but then the 'callback' could not be implemented
	if ( !(oCfgData.productive === true || oCfgData.productive === "true"  || oCfgData.productive === "x") ) {
		SupportHotkeys.init(getModuleSystemInfo, oCfgData);
		TestRecorderHotkeyListener.init(getModuleSystemInfo, oCfgData);
	}

	// -----------------------------------------------------------------------

	if ( oJQVersion.compareTo("2.2.3") != 0 ) {
		// if the loaded jQuery version isn't SAPUI5's default version -> notify
		// the application
		Log.warning("SAPUI5's default jQuery version is 2.2.3; current version is " + jQuery.fn.jquery + ". Please note that we only support version 2.2.3.");
	}

	// --------------------- frame protection -------------------------------------------------------

	/**
	 * @deprecated since 1.58 use {@link module:sap/ui/security/FrameOptions} instead
	 */
	jQuery.sap.FrameOptions = FrameOptions;

	/**
	 * Executes an 'eval' for its arguments in the global context (without closure variables).
	 *
	 * This is a synchronous replacement for <code>jQuery.globalEval</code> which in some
	 * browsers (e.g. FireFox) behaves asynchronously.
	 *
	 * @type void
	 * @public
	 * @static
	 * @deprecated since 1.58
	 * @SecSink {0|XSS} Parameter is evaluated
	 */
	jQuery.sap.globalEval = function() {

		/*eslint-disable no-eval */
		eval(arguments[0]);
		/*eslint-enable no-eval */
	};

	(function() {

		var b = Device.browser;
		var id = b.name;

		// TODO move to a separate module? Only adds 385 bytes (compressed), but...
		if ( !jQuery.browser ) {
			// re-introduce the jQuery.browser support if missing (jQuery-1.9ff)
			jQuery.browser = (function (ua) {

				var rwebkit = /(webkit)[ \/]([\w.]+)/,
					ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
					rmsie = /(msie) ([\w.]+)/,
					rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
					ua = ua.toLowerCase(),
					match = rwebkit.exec(ua) ||
						ropera.exec(ua) ||
						rmsie.exec(ua) ||
						ua.indexOf("compatible") < 0 && rmozilla.exec(ua) ||
						[],
					browser = {};

				if (match[1]) {
					browser[match[1]] = true;
					browser.version = match[2] || "0";
					if (browser.webkit) {
						browser.safari = true;
					}
				}

				return browser;

			}(window.navigator.userAgent));
		}

		if (id === b.BROWSER.CHROME) {
			jQuery.browser.safari = false;
			jQuery.browser.chrome = true;
		} else if (id === b.BROWSER.SAFARI) {
			jQuery.browser.safari = true;
			jQuery.browser.chrome = false;
		}

		if (id) {
			jQuery.browser.fVersion = b.version;
			jQuery.browser.mobile = b.mobile;
		}

	}());

	return jQuery;

});
