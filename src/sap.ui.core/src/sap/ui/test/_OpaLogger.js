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
	var sDefaultLevel = "DEBUG";
	var sLogLevel = sDefaultLevel;

	return {
		// _OpaLogger might also be loaded in an iFrame. setLevel should be called for each iFrame
		// `Log` reference changes depending on the contentWindow
		setLevel: function (sNewLogLevel) {
			sNewLogLevel = sNewLogLevel && sNewLogLevel.toUpperCase();
			if (sNewLogLevel && Log.Level[sNewLogLevel]) {
				sLogLevel = sNewLogLevel;
			}
			aLoggerComponents.forEach(function (sComponent) {
				Log.setLevel(Log.Level[sLogLevel], sComponent);
			});
		},
		getLogger: function (sComponent) {
			aLoggerComponents.push(sComponent);
			var logger = Log.getLogger(sComponent, Log.Level[sLogLevel]);
			logger.timestamp = function (marker) {
				/* eslint-disable no-console */
				if (console.timeStamp && Log.Level[this.getLevel()] >= Log.Level[sDefaultLevel]) {
					console.timeStamp(marker);
				}
				/* eslint-enable no-console */
			};
			return logger;
		},
		getLevel: function () {
			return sLogLevel;
		}
	};

}, true);