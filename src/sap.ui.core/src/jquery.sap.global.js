/*!
 * ${copyright}
 */

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
 "sap/base/util/now",
 "sap/base/util/Version",
 "sap/base/assert",
 "sap/base/Log",
 // new sap/ui/* modules
 "sap/ui/dom/getComputedStyleFix",
 "sap/ui/dom/includeScript",
 "sap/ui/dom/includeStylesheet",
 "sap/ui/core/support/Hotkeys",
 "sap/ui/test/RecorderHotkeyListener",
 "sap/ui/security/FrameOptions",
 "sap/ui/performance/Measurement",
 "sap/ui/performance/trace/Interaction",
 "sap/ui/base/syncXHRFix",
 "sap/base/util/LoaderExtensions",
 // former sap-ui-core.js dependencies
 "sap/ui/Device",
 "sap/ui/core/Configuration",
 "sap/base/config",
 "sap/ui/thirdparty/jquery",
 "sap/ui/thirdparty/jqueryui/jquery-ui-position",
 "ui5loader-autoconfig",
 // side effect: make global URI available
 "sap/ui/thirdparty/URI",
 // side effect: activates paste event fix
 "sap/ui/events/PasteEventFix"
], function(now, Version, assert, Log,

	getComputedStyleFix, includeScript,
	includeStylesheet, SupportHotkeys, TestRecorderHotkeyListener,
	FrameOptions, Measurement, Interaction,
	syncXHRFix, LoaderExtensions,

	Device,
	Configuration,
	BaseConfig,

	jQuery /*, jqueryUiPosition, ui5loaderAutoconfig, jquerySapStubs, URI, PasteEventFix */) {
 "use strict";

 if ( !jQuery ) {
	 throw new Error("Loading of jQuery failed");
 }

 var ui5loader = sap.ui.loader;

 if ( !ui5loader || !ui5loader._ ) {
	 throw new Error("The UI5 compatilbility module requires a UI5 specific AMD implementation");
 }

 var _ui5loader = ui5loader._;

 var oJQVersion = Version(jQuery.fn.jquery);

 (function() {}());

 // getComputedStyle polyfill for firefox
 if ( Device.browser.firefox ) {
	 getComputedStyleFix();
 }

 // XHR proxy for Firefox
 if ( Device.browser.firefox && window.Proxy ) {
	 syncXHRFix();
 }

 // Normalize configuration to stay compatible
 // Previously the sap/ui/core/_ConfigurationProvider code (incl. normalization)
 // was executed here. Since we moved the coding to an own module which is
 // a dependency of sap/ui/core/Configuration it's possible, that someone requires
 // the configuration and normalizes the window['sap-ui-config'] object at an
 // earlier point in time. To avoid, that someone adds configuration parameters
 // to the window object inbetween normalization done by _ConfigurationProvider
 // and the usage within jquery.sap.global we normalize here again.
 var oCfg = window["sap-ui-config"];
 for (var sKey in oCfg) {
	 var vValue = oCfg[sKey];
	 var sLowerCaseKey = sKey.toLowerCase();
	 if ( !oCfg.hasOwnProperty(sLowerCaseKey) ) {
		 oCfg[sLowerCaseKey] = vValue;
		 delete oCfg[sKey];
	 }
 }

 // check whether noConflict must be used...
 if (BaseConfig.get({
		 name: "sapUiNoConflict",
		 type: BaseConfig.Type.Boolean,
		 freeze: true
	 })) {
	 jQuery.noConflict();
 }

 // -------------------------- VERSION -------------------------------------

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

 // -------------------------- Logging -------------------------------------

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

 /* -------------------------------------- */
 var sWindowName = (typeof window === "undefined" || window.top == window) ? "" : "[" + window.location.pathname.split('/').slice(-1)[0] + "] ";

 // ------------------------------------------- OBJECT --------------------------------------------------------

 // ---------------------- performance measurement -----------------------------------------------------------

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
		  BaseConfig.get({name: "sapUiXxDebugModuleLoading", type: BaseConfig.Type.Boolean, external: true, freeze: true}) ? Log.Level.DEBUG : Math.min(Log.getLevel(), Log.Level.INFO)
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

  var mUrlPrefixes = _ui5loader.getUrlPrefixes();
  // dump the URL prefixes
  oLog.info("URL prefixes set to:");
  for (var n in mUrlPrefixes) {
	  oLog.info("  " + (n ? "'" + n + "'" : "(default)") + " : " + mUrlPrefixes[n]);
  }

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

  /* -------------------------------------- */
  return function() {
	  return {
		  modules : _ui5loader.getAllModules(),
		  prefixes : _ui5loader.getUrlPrefixes()
	  };
  };
 }());

 // --------------------- script and stylesheet handling --------------------------------------------------

 // --------------------- support hooks ---------------------------------------------------------

 // TODO should be in core, but then the 'callback' could not be implemented
 if (!BaseConfig.get({name: "sapUiProductive", type: BaseConfig.Type.Boolean, freeze: true})) {
	 SupportHotkeys.init(getModuleSystemInfo);
	 TestRecorderHotkeyListener.init(getModuleSystemInfo);
 }

 // -----------------------------------------------------------------------

 if ( oJQVersion.compareTo("3.6.0") != 0 ) {
	 // if the loaded jQuery version isn't SAPUI5's default version -> notify
	 // the application
	 Log.warning("SAPUI5's default jQuery version is 3.6.0; current version is " + jQuery.fn.jquery + ". Please note that we only support version 3.6.0.");
 }

 // --------------------- frame protection -------------------------------------------------------

 /* -------------------------------------- */
 return jQuery;
});
