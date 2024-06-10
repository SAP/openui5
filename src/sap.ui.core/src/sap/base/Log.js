/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/now"
], function(
	now
) {
	"use strict";

	/**
	 * A Logging API for JavaScript.
	 *
	 * Provides methods to manage a client-side log and to create entries in it. Each of the logging methods
	 * {@link module:sap/base/Log.debug}, {@link module:sap/base/Log.info}, {@link module:sap/base/Log.warning},
	 * {@link module:sap/base/Log.error} and {@link module:sap/base/Log.fatal} creates and records a log entry,
	 * containing a timestamp, a log level, a message with details and a component info.
	 * The log level will be one of {@link module:sap/base/Log.Level} and equals the name of the concrete logging method.
	 *
	 * By using the {@link module:sap/base/Log.setLevel} method, consumers can determine the least important
	 * log level which should be recorded. Less important entries will be filtered out. (Note that higher numeric
	 * values represent less important levels). The initially set level depends on the mode that UI5 is running in.
	 * When the optimized sources are executed, the default level will be {@link module:sap/base/Log.Level.ERROR}.
	 * For normal (debug sources), the default level is {@link module:sap/base/Log.Level.DEBUG}.
	 *
	 * All logging methods allow to specify a <b>component</b>. These components are simple strings and
	 * don't have a special meaning to the UI5 framework. However they can be used to semantically group
	 * log entries that belong to the same software component (or feature). There are two APIs that help
	 * to manage logging for such a component. With {@link module:sap/base/Log.getLogger},
	 * one can retrieve a logger that automatically adds the given <code>sComponent</code> as component
	 * parameter to each log entry, if no other component is specified. Typically, JavaScript code will
	 * retrieve such a logger once during startup and reuse it for the rest of its lifecycle.
	 * Second, the {@link module:sap/base/Log.setLevel}(iLevel, sComponent) method allows to set the log level
	 * for a specific component only. This allows a more fine grained control about the created logging entries.
	 * {@link module:sap/base/Log.getLevel} allows to retrieve the currently effective log level for a given
	 * component.
	 *
	 * {@link module:sap/base/Log.getLogEntries} returns an array of the currently collected log entries.
	 *
	 * Furthermore, a listener can be registered to the log. It will be notified whenever a new entry
	 * is added to the log. The listener can be used for displaying log entries in a separate page area,
	 * or for sending it to some external target (server).
	 *
	 * @public
	 * @since 1.58
	 * @namespace
	 * @alias module:sap/base/Log
	 */
	var Log = {};

	/**
	 * Enumeration of the configurable log levels that a Logger should persist to the log.
	 *
	 * Only if the current LogLevel is higher than the level {@link module:sap/base/Log.Level} of the currently added log entry,
	 * then this very entry is permanently added to the log. Otherwise it is ignored.
	 * @enum {int}
	 * @public
	 */
	Log.Level = {
		/**
		 * Do not log anything
		 * @public
		 */
		NONE : -1,
		/**
		 * Fatal level. Use this for logging unrecoverable situations
		 * @public
		 */
		FATAL : 0,
		/**
		 * Error level. Use this for logging of erroneous but still recoverable situations
		 * @public
		 */
		ERROR : 1,
		/**
		 * Warning level. Use this for logging unwanted but foreseen situations
		 * @public
		 */
		WARNING : 2,
		/**
		 * Info level. Use this for logging information of purely informative nature
		 * @public
		 */
		INFO : 3,
		/**
		 * Debug level. Use this for logging information necessary for debugging
		 * @public
		 */
		DEBUG : 4,
		/**
		 * Trace level. Use this for tracing the program flow.
		 * @public
		 */
		TRACE : 5,
		/**
		 * Trace level to log everything.
		 * @public
		 */
		ALL : (5 + 1)
	};

	/**
	 * The array that holds the log entries that have been recorded so far
	 */
	var aLog = [],

	/**
	 * Maximum log level to be recorded (per component).
	 */
	mMaxLevel = { '' : Log.Level.ERROR },

	/**
	 * Maximum amount of stored log entries
	 */
	iLogEntriesLimit = 3000,

	/**
	 * Registered listener to be informed about new log entries.
	 */
	oListener = null,

	/**
	 * Additional support information delivered by callback should be logged
	 */
	bLogSupportInfo = false;

	function pad0(i,w) {
		return ("000" + String(i)).slice(-w);
	}

	function level(sComponent) {
		return (!sComponent || isNaN(mMaxLevel[sComponent])) ? mMaxLevel[''] : mMaxLevel[sComponent];
	}

	/**
	 * Discard 30 percent of log entries when the limit is reached
	 */
	function discardLogEntries() {
		var iLogLength =  aLog.length;
		if (iLogLength) {
			var iEntriesToKeep = Math.min(iLogLength, Math.floor(iLogEntriesLimit * 0.7));

			if (oListener) {
				// Notify listener that entries are being discarded
				oListener.onDiscardLogEntries(aLog.slice(0, iLogLength - iEntriesToKeep));
			}

			if (iEntriesToKeep) {
				aLog = aLog.slice(-iEntriesToKeep, iLogLength);
			} else {
				aLog = [];
			}
		}
	}

	/**
	 * Gets the log entry listener instance, if not present creates a new one
	 * @returns {Object} the singleton log entry listener
	 */
	function getLogEntryListenerInstance(){
		if (!oListener) {
			oListener = {
				listeners: [],
				onLogEntry: function(oLogEntry){
					for (var i = 0; i < oListener.listeners.length; i++) {
						if (oListener.listeners[i].onLogEntry) {
							oListener.listeners[i].onLogEntry(oLogEntry);
						}
					}
				},
				onDiscardLogEntries: function(aDiscardedLogEntries) {
					for (var i = 0; i < oListener.listeners.length; i++) {
						if (oListener.listeners[i].onDiscardLogEntries) {
							oListener.listeners[i].onDiscardLogEntries(aDiscardedLogEntries);
						}
					}
				},
				attach: function(oLog, oLstnr){
					if (oLstnr) {
						oListener.listeners.push(oLstnr);
						if (oLstnr.onAttachToLog) {
							oLstnr.onAttachToLog(oLog);
						}
					}
				},
				detach: function(oLog, oLstnr){
					for (var i = 0; i < oListener.listeners.length; i++) {
						if (oListener.listeners[i] === oLstnr) {
							if (oLstnr.onDetachFromLog) {
								oLstnr.onDetachFromLog(oLog);
							}
							oListener.listeners.splice(i,1);
							return;
						}
					}
				}
			};
		}
		return oListener;
	}

	/**
	 * Creates a new fatal-level entry in the log with the given message, details and calling component.
	 *
	 * @param {string} sMessage
	 *   Message text to display
	 * @param {string|Error} [vDetails='']
	 *   Optional details about the message, might be omitted. Can be an Error object which will be
	 *   logged together with its stacktrace.
	 * @param {string} [sComponent='']
	 *   Name of the component that produced the log entry
	 * @param {function} [fnSupportInfo]
	 *   Callback that returns an additional support object to be logged in support mode.
	 *   This function is only called if support info mode is turned on with
	 *   <code>logSupportInfo(true)</code>. To avoid negative effects regarding execution times and
	 *   memory consumption, the returned object should be a simple immutable JSON object with mostly
	 *   static and stable content.
	 * @public
	 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
	 */
	Log.fatal = function(sMessage, vDetails, sComponent, fnSupportInfo) {
		log(Log.Level.FATAL, sMessage, vDetails, sComponent, fnSupportInfo);
	};

	/**
	 * Creates a new error-level entry in the log with the given message, details and calling component.
	 *
	 * @param {string} sMessage
	 *   Message text to display
	 * @param {string|Error} [vDetails='']
	 *   Optional details about the message, might be omitted. Can be an Error object which will be
	 *   logged together with its stacktrace.
	 * @param {string} [sComponent='']
	 *   Name of the component that produced the log entry
	 * @param {function} [fnSupportInfo]
	 *   Callback that returns an additional support object to be logged in support mode.
	 *   This function is only called if support info mode is turned on with
	 *   <code>logSupportInfo(true)</code>. To avoid negative effects regarding execution times and
	 *   memory consumption, the returned object should be a simple immutable JSON object with mostly
	 *   static and stable content.
	 * @public
	 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
	 */
	Log.error = function(sMessage, vDetails, sComponent, fnSupportInfo) {
		log(Log.Level.ERROR, sMessage, vDetails, sComponent, fnSupportInfo);
	};

	/**
	 * Creates a new warning-level entry in the log with the given message, details and calling component.
	 *
	 * @param {string} sMessage
	 *   Message text to display
	 * @param {string|Error} [vDetails='']
	 *   Optional details about the message, might be omitted. Can be an Error object which will be
	 *   logged together with its stacktrace.
	 * @param {string} [sComponent='']
	 *   Name of the component that produced the log entry
	 * @param {function} [fnSupportInfo]
	 *   Callback that returns an additional support object to be logged in support mode.
	 *   This function is only called if support info mode is turned on with
	 *   <code>logSupportInfo(true)</code>. To avoid negative effects regarding execution times and
	 *   memory consumption, the returned object should be a simple immutable JSON object with mostly
	 *   static and stable content.
	 * @public
	 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
	 */
	Log.warning = function(sMessage, vDetails, sComponent, fnSupportInfo) {
		log(Log.Level.WARNING, sMessage, vDetails, sComponent, fnSupportInfo);
	};

	/**
	 * Creates a new info-level entry in the log with the given message, details and calling component.
	 *
	 * @param {string} sMessage
	 *   Message text to display
	 * @param {string|Error} [vDetails='']
	 *   Optional details about the message, might be omitted. Can be an Error object which will be
	 *   logged with the stack.
	 * @param {string} [sComponent='']
	 *   Name of the component that produced the log entry
	 * @param {function} [fnSupportInfo]
	 *   Callback that returns an additional support object to be logged in support mode.
	 *   This function is only called if support info mode is turned on with
	 *   <code>logSupportInfo(true)</code>. To avoid negative effects regarding execution times and
	 *   memory consumption, the returned object should be a simple immutable JSON object with mostly
	 *   static and stable content.
	 * @public
	 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
	 */
	Log.info = function(sMessage, vDetails, sComponent, fnSupportInfo) {
		log(Log.Level.INFO, sMessage, vDetails, sComponent, fnSupportInfo);
	};

	/**
	 * Creates a new debug-level entry in the log with the given message, details and calling component.
	 *
	 * @param {string} sMessage
	 *   Message text to display
	 * @param {string|Error} [vDetails='']
	 *   Optional details about the message, might be omitted. Can be an Error object which will be
	 *   logged with the stack.
	 * @param {string} [sComponent='']
	 *   Name of the component that produced the log entry
	 * @param {function} [fnSupportInfo]
	 *   Callback that returns an additional support object to be logged in support mode.
	 *   This function is only called if support info mode is turned on with
	 *   <code>logSupportInfo(true)</code>. To avoid negative effects regarding execution times and
	 *   memory consumption, the returned object should be a simple immutable JSON object with mostly
	 *   static and stable content.
	 * @public
	 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
	 */
	Log.debug = function(sMessage, vDetails, sComponent, fnSupportInfo) {
		log(Log.Level.DEBUG, sMessage, vDetails, sComponent, fnSupportInfo);
	};

	/**
	 * Creates a new trace-level entry in the log with the given message, details and calling component.
	 *
	 * @param {string} sMessage
	 *   Message text to display
	 * @param {string|Error} [vDetails='']
	 *   Optional details about the message, might be omitted. Can be an Error object which will be
	 *   logged with the stack.
	 * @param {string} [sComponent='']
	 *   Name of the component that produced the log entry
	 * @param {function} [fnSupportInfo]
	 *   Callback that returns an additional support object to be logged in support mode.
	 *   This function is only called if support info mode is turned on with
	 *   <code>logSupportInfo(true)</code>. To avoid negative effects regarding execution times and
	 *   memory consumption, the returned object should be a simple immutable JSON object with mostly
	 *   static and stable content.
	 * @public
	 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
	 */
	Log.trace = function(sMessage, vDetails, sComponent, fnSupportInfo) {
		log(Log.Level.TRACE, sMessage, vDetails, sComponent, fnSupportInfo);
	};

	/**
	 * Defines the maximum <code>sap/base/Log.Level</code> of log entries that will be recorded.
	 * Log entries with a higher (less important) log level will be omitted from the log.
	 * When a component name is given, the log level will be configured for that component
	 * only, otherwise the log level for the default component of this logger is set.
	 * For the global logger, the global default level is set.
	 *
	 * <b>Note</b>: Setting a global default log level has no impact on already defined
	 * component log levels. They always override the global default log level.
	 *
	 * @param {module:sap/base/Log.Level} iLogLevel The new log level
	 * @param {string} [sComponent] The log component to set the log level for
	 * @public
	 */
	Log.setLevel = function(iLogLevel, sComponent, _bDefault) {
		sComponent = sComponent || '';
		if (!_bDefault || mMaxLevel[sComponent] == null) {
			mMaxLevel[sComponent] = iLogLevel;
			var sLogLevel;
			Object.keys(Log.Level).forEach(function(sLevel) {
				if (Log.Level[sLevel] === iLogLevel) {
					sLogLevel = sLevel;
				}
			});
			log(Log.Level.INFO, "Changing log level " + (sComponent ? "for '" + sComponent + "' " : "") + "to " + sLogLevel, "", "sap.base.log");
		}
	};

	/**
	 * Returns the log level currently effective for the given component.
	 * If no component is given or when no level has been configured for a
	 * given component, the log level for the default component of this logger is returned.
	 *
	 * @param {string} [sComponent] Name of the component to retrieve the log level for
	 * @returns {module:sap/base/Log.Level} The log level for the given component or the default log level
	 * @public
	 */
	Log.getLevel = function(sComponent) {
		return level(sComponent);
	};

	/**
	 * Checks whether logging is enabled for the given log level,
	 * depending on the currently effective log level for the given component.
	 *
	 * If no component is given, the default component of this logger will be taken into account.
	 *
	 * @param {module:sap/base/Log.Level} [iLevel=Level.DEBUG] The log level in question
	 * @param {string} [sComponent] Name of the component to check the log level for
	 * @returns {boolean} Whether logging is enabled or not
	 * @public
	 */
	Log.isLoggable = function(iLevel, sComponent) {
		return (iLevel == null ? Log.Level.DEBUG : iLevel) <= level(sComponent);
	};

	/**
	 * Enables or disables whether additional support information is logged in a trace.
	 * If enabled, logging methods like error, warning, info and debug are calling the additional
	 * optional callback parameter fnSupportInfo and store the returned object in the log entry property supportInfo.
	 *
	 * @param {boolean} bEnabled true if the support information should be logged
	 * @private
	 * @ui5-restricted sap.ui.support
	 */
	Log.logSupportInfo = function(bEnabled) {
		bLogSupportInfo = bEnabled;
	};

	/**
	 * Creates a new log entry depending on its level and component.
	 *
	 * If the given level is higher than the max level for the given component
	 * (or higher than the global level, if no component is given),
	 * then no entry is created and <code>undefined</code> is returned.
	 *
	 * If an <code>Error</code> is passed via <code>vDetails</code> the stack
	 * of the <code>Error</code> will be logged as a separate parameter in
	 * the proper <code>console</code> function for the matching log level.
	 *
	 * @param {module:sap/base/Log.Level} iLevel
	 *   One of the log levels FATAL, ERROR, WARNING, INFO, DEBUG, TRACE
	 * @param {string} sMessage
	 *   The message to be logged
	 * @param {string|Error} [vDetails]
	 *   The optional details for the message; could be an Error which will be logged with the
	 *   stacktrace, to easily find the root cause of the Error
	 * @param {string} [sComponent]
	 *   The log component under which the message should be logged
	 * @param {function} [fnSupportInfo] Callback that returns an additional support object to be
	 *   logged in support mode. This function is only called if support info mode is turned on with
	 *   <code>logSupportInfo(true)</code>. To avoid negative effects regarding execution times and
	 *   memory consumption, the returned object should be a simple immutable JSON object with mostly
	 *   static and stable content.
	 * @returns {module:sap/base/Log.Entry}
	 *   The log entry as an object or <code>undefined</code> if no entry was created
	 * @private
	 */
	function log(iLevel, sMessage, vDetails, sComponent, fnSupportInfo) {
		if (!fnSupportInfo && !sComponent && typeof vDetails === "function") {
			fnSupportInfo = vDetails;
			vDetails = "";
		}
		if (!fnSupportInfo && typeof sComponent === "function") {
			fnSupportInfo = sComponent;
			sComponent = "";
		}

		if (iLevel <= level(sComponent) ) {
			var fNow =  now(),
				oNow = new Date(fNow),
				iMicroSeconds = Math.floor((fNow - Math.floor(fNow)) * 1000),
				oLogEntry = {
					time     : pad0(oNow.getHours(),2) + ":" + pad0(oNow.getMinutes(),2) + ":" + pad0(oNow.getSeconds(),2) + "." + pad0(oNow.getMilliseconds(),3) + pad0(iMicroSeconds,3),
					date     : pad0(oNow.getFullYear(),4) + "-" + pad0(oNow.getMonth() + 1,2) + "-" + pad0(oNow.getDate(),2),
					timestamp: fNow,
					level    : iLevel,
					message  : String(sMessage || ""),
					details  : String(vDetails || ""),
					component: String(sComponent || "")
				};
			if (bLogSupportInfo && typeof fnSupportInfo === "function") {
				oLogEntry.supportInfo = fnSupportInfo();
			}

			if (iLogEntriesLimit) {
				if (aLog.length >= iLogEntriesLimit) {
					// Cap the amount of stored log messages by 30 percent
					discardLogEntries();
				}

				aLog.push(oLogEntry);
			}

			if (oListener) {
				oListener.onLogEntry(oLogEntry);
			}

			/*
			 * Console Log, also tries to log to the console, if available.
			 *
			 * Unfortunately, the support for console is quite different between the UI5 browsers. The most important differences are:
			 * - in FF3.6 the console is not available, until FireBug is opened. It disappears again, when fire bug is closed.
			 *   But when the settings for a web site are stored (convenience), the console remains open
			 *   When the console is available, it supports all relevant methods
			 * - in FF9.0, the console is always available, but method assert is only available when firebug is open
			 * - in Webkit browsers, the console object is always available and has all required methods
			 *   - Exception: in the iOS Simulator, console.info() does not exist
			 */
			/*eslint-disable no-console */
			if (console) { // in Firefox, console might not exist or it might even disappear
				var isDetailsError = vDetails instanceof Error,
					logText = oLogEntry.date + " " + oLogEntry.time + " " + oLogEntry.message + " - " + oLogEntry.details + " " + oLogEntry.component;
				switch (iLevel) {
					case Log.Level.FATAL:
					case Log.Level.ERROR: isDetailsError ? console.error(logText, "\n", vDetails) : console.error(logText); break;
					case Log.Level.WARNING: isDetailsError ? console.warn(logText, "\n", vDetails) : console.warn(logText); break;
					case Log.Level.INFO:
						if (console.info) { // info not available in iOS simulator
							isDetailsError ? console.info(logText, "\n", vDetails) : console.info(logText);
						} else {
							isDetailsError ? console.log(logText, "\n", vDetails) : console.log(logText);
						}
						break;
					case Log.Level.DEBUG:
						isDetailsError ? console.debug(logText, "\n", vDetails) : console.debug(logText);
						break;
					case Log.Level.TRACE:
						isDetailsError ? console.trace(logText, "\n", vDetails) : console.trace(logText);
						break;
				}
				if (console.info && oLogEntry.supportInfo) {
					console.info(oLogEntry.supportInfo);
				}
			}
			/*eslint-enable no-console */
			return oLogEntry;
		}
	}

	/**
	 * Returns the logged entries recorded so far as an array.
	 *
	 * Log entries are plain JavaScript objects with the following properties
	 * <ul>
	 * <li>timestamp {number} point in time when the entry was created
	 * <li>level {module:sap/base/Log.Level} LogLevel level of the entry
	 * <li>message {string} message text of the entry
	 * </ul>
	 * The default amount of stored log entries is limited to 3000 entries.
	 * @returns {Array<module:sap/base/Log.Entry>} an array containing the recorded log entries
	 * @public
	 * @static
	 */
	Log.getLogEntries = function() {
		return aLog.slice();
	};

	/**
	 * Returns the maximum amount of stored log entries.
	 *
	 * @returns {int|Infinity} The maximum amount of stored log entries or Infinity if no limit is set
	 * @private
	 * @ui5-restricted
	 */
	Log.getLogEntriesLimit = function() {
		return iLogEntriesLimit;
	};

	/**
	 * Sets the limit of stored log entries
	 *
	 * If the new limit is lower than the current limit, the overlap of old log entries will be discarded.
	 * If the limit is reached the amount of stored messages will be reduced by 30 percent.
	 *
	 * @param {int|Infinity} iLimit The maximum amount of stored log entries or Infinity for unlimited entries
	 * @private
	 * @ui5-restricted
	 */
	Log.setLogEntriesLimit = function(iLimit) {
		if (iLimit < 0) {
			throw new Error("The log entries limit needs to be greater than or equal to 0!");
		}
		iLogEntriesLimit = iLimit;
		if (aLog.length >= iLogEntriesLimit) {
			discardLogEntries();
		}
	};

	/**
	 * @typedef {object} module:sap/base/Log.Entry
	 * @property {float} timestamp The number of milliseconds since the epoch
	 * @property {string} time Time string in format HH:mm:ss:mmmnnn
	 * @property {string} date Date string in format yyyy-MM-dd
	 * @property {module:sap/base/Log.Level} level The level of the log entry, see {@link module:sap/base/Log.Level}
	 * @property {string} message The message of the log entry
	 * @property {string} details The detailed information of the log entry
	 * @property {string} component The component that creates the log entry
	 * @property {function():any} [supportInfo] Callback that returns an additional support object to be
	 *   logged in support mode.
	 * @public
	 */

	/**
	 * Interface to be implemented by a log listener.
	 *
	 * Typically, a listener will at least implement the {@link #.onLogEntry} method,
	 * but in general, all methods are optional.
	 *
	 * @interface
	 * @name module:sap/base/Log.Listener
	 * @public
	 */

	/**
	 * The function that is called when a new log entry is created
	 *
	 * @param {module:sap/base/Log.Entry} oLogEntry The newly created log entry
	 * @name module:sap/base/Log.Listener.onLogEntry?
	 * @function
	 * @public
	 */

	/**
	 * The function that is called once the Listener is attached
	 *
	 * @param {module:sap/base/Log} oLog The Log instance where the listener is attached
	 * @name module:sap/base/Log.Listener.onAttachToLog?
	 * @function
	 * @public
	 */

	/**
	 * The function that is called once the Listener is detached
	 *
	 * @param {module:sap/base/Log} oLog The Log instance where the listener is detached
	 * @name module:sap/base/Log.Listener.onDetachFromLog?
	 * @function
	 * @public
	 */

	/**
	 * The function that is called once log entries are discarded due to the exceed of total log entry amount
	 *
	 * @param {Array<module:sap/base/Log.Entry>} aDiscardedEntries The discarded log entries
	 * @name module:sap/base/Log.Listener.onDiscardLogEntries?
	 * @function
	 * @public
	 */

	/**
	 * Allows to add a new listener that will be notified for new log entries.
	 *
	 * The given object must provide method <code>onLogEntry</code> and can also be informed
	 * about <code>onDetachFromLog</code>, <code>onAttachToLog</code> and <code>onDiscardLogEntries</code>.
	 * @param {module:sap/base/Log.Listener} oListener The new listener object that should be informed
	 * @public
	 * @static
	 */
	Log.addLogListener = function(oListener) {
		getLogEntryListenerInstance().attach(this, oListener);
	};

	/**
	 * Allows to remove a registered LogListener.
	 * @param {module:sap/base/Log.Listener} oListener The listener object that should be removed
	 * @public
	 * @static
	 */
	Log.removeLogListener = function(oListener) {
		getLogEntryListenerInstance().detach(this, oListener);
	};

	/**
	 * The logger comes with a subset of the API of the <code>sap/base/Log</code> module:
	 * <ul>
	 * <li><code>#fatal</code> - see:  {@link module:sap/base/Log.fatal}
	 * <li><code>#error</code> - see:  {@link module:sap/base/Log.error}
	 * <li><code>#warning</code> - see:  {@link module:sap/base/Log.warning}
	 * <li><code>#info</code> - see:  {@link module:sap/base/Log.info}
	 * <li><code>#debug</code> - see:  {@link module:sap/base/Log.debug}
	 * <li><code>#trace</code> - see:  {@link module:sap/base/Log.trace}
	 * <li><code>#setLevel</code> - see:  {@link module:sap/base/Log.setLevel}
	 * <li><code>#getLevel</code> - see:  {@link module:sap/base/Log.getLevel}
	 * <li><code>#isLoggable</code> - see:  {@link module:sap/base/Log.isLoggable}
	 * </ul>
	 * @interface
	 * @borrows module:sap/base/Log.fatal as #fatal
	 * @borrows module:sap/base/Log.error as #error
	 * @borrows module:sap/base/Log.warning as #warning
	 * @borrows module:sap/base/Log.info as #info
	 * @borrows module:sap/base/Log.debug as #debug
	 * @borrows module:sap/base/Log.trace as #trace
	 * @borrows module:sap/base/Log.setLevel as #setLevel
	 * @borrows module:sap/base/Log.getLevel as #getLevel
	 * @borrows module:sap/base/Log.isLoggable as #isLoggable
	 * @name module:sap/base/Log.Logger
	 * @public
	 */
	function Logger(sComponent) {
		this.fatal = function(msg,detail,comp,support) { Log.fatal(msg, detail, comp || sComponent, support); return this; };
		this.error = function(msg,detail,comp,support) { Log.error(msg, detail, comp || sComponent, support); return this; };
		this.warning = function(msg,detail,comp,support) { Log.warning(msg, detail, comp || sComponent, support); return this; };
		this.info = function(msg,detail,comp,support) { Log.info(msg, detail, comp || sComponent, support); return this; };
		this.debug = function(msg,detail,comp,support) { Log.debug(msg, detail, comp || sComponent, support); return this; };
		this.trace = function(msg,detail,comp,support) { Log.trace(msg, detail, comp || sComponent, support); return this; };
		this.setLevel = function(level, comp) { Log.setLevel(level, comp || sComponent); return this; };
		this.getLevel = function(comp) { return Log.getLevel(comp || sComponent); };
		this.isLoggable = function(level,comp) { return Log.isLoggable(level, comp || sComponent); };
	}

	/**
	 * Returns a dedicated logger for a component.
	 *
	 * The logger comes with the same API as the <code>sap/base/Log</code> module:
	 * <ul>
	 * <li><code>#fatal</code> - see:  {@link module:sap/base/Log.fatal}
	 * <li><code>#error</code> - see:  {@link module:sap/base/Log.error}
	 * <li><code>#warning</code> - see:  {@link module:sap/base/Log.warning}
	 * <li><code>#info</code> - see:  {@link module:sap/base/Log.info}
	 * <li><code>#debug</code> - see:  {@link module:sap/base/Log.debug}
	 * <li><code>#trace</code> - see:  {@link module:sap/base/Log.trace}
	 * <li><code>#setLevel</code> - see:  {@link module:sap/base/Log.setLevel}
	 * <li><code>#getLevel</code> - see:  {@link module:sap/base/Log.getLevel}
	 * <li><code>#isLoggable</code> - see:  {@link module:sap/base/Log.isLoggable}
	 * </ul>
	 *
	 * @param {string} sComponent Name of the component which should be logged
	 * @param {module:sap/base/Log.Level} [iDefaultLogLevel] The default log level
	 * @return {module:sap/base/Log.Logger} A logger with a specified component
	 * @public
	 * @static
	 */
	Log.getLogger = function(sComponent, iDefaultLogLevel) {
		if ( !isNaN(iDefaultLogLevel) && mMaxLevel[sComponent] == null ) {
			mMaxLevel[sComponent] = iDefaultLogLevel;
		}
		return new Logger(sComponent);
	};

	return Log;
});