/*!
 * ${copyright}
 */

// intended to be used by all OPA modules that need to create a logger
sap.ui.define([
	"sap/base/Log"
], function (Log) {
	"use strict";

	// Set stored amount of log entries to unlimited
	Log.setLogEntriesLimit(Infinity);
	// component names of all loggers created by OPA components
	var aLoggerComponents = [];
	// DEBUG is the default maximum log level for OPA
	var iLogLevel = Log.Level.DEBUG;

	return {
		// _OpaLogger might also be loaded in an iFrame. setLevel should be called for each iFrame
		// $.sap.log reference changes depending on the contentWindow
		setLevel: function (sNewLogLevel) {
			var sLogLevel = sNewLogLevel && sNewLogLevel.toUpperCase();
			var iNewLogLevel = sLogLevel && Log.Level[sLogLevel];
			iLogLevel = iNewLogLevel || iLogLevel;
			aLoggerComponents.forEach(function (sComponent) {
				Log.setLevel(iLogLevel, sComponent);
			});
		},
		getLogger: function (sComponent) {
			aLoggerComponents.push(sComponent);
			var logger = Log.getLogger(sComponent, iLogLevel);
			logger.timestamp = function (marker) {
				/* eslint-disable no-console */
				if (console.timeStamp && this.getLevel() >= Log.Level.DEBUG) {
					console.timeStamp(marker);
				}
				/* eslint-enable no-console */
			};
			return logger;
		},
		getLevel: function () {
			return iLogLevel;
		}
	};

}, true);