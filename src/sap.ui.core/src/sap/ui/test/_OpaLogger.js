/*!
 * ${copyright}
 */

// intended to be used by all OPA modules that need to create a logger
sap.ui.define([
	"jquery.sap.global"
], function ($) {
	"use strict";

	// component names of all loggers created by OPA components
	var aLoggerComponents = [];
	// DEBUG is the default maximum log level for OPA
	var iLogLevel = $.sap.log.Level.DEBUG;

	return {
		// _OpaLogger might also be loaded in an iFrame. setLevel should be called for each iFrame
		// $.sap.log reference changes depending on the contentWindow
		setLevel: function (sNewLogLevel) {
			var sLogLevel = sNewLogLevel && sNewLogLevel.toUpperCase();
			var iNewLogLevel = sLogLevel && $.sap.log.Level[sLogLevel];
			iLogLevel = iNewLogLevel || iLogLevel;
			aLoggerComponents.forEach(function (sComponent) {
				$.sap.log.setLevel(iLogLevel, sComponent);
			});
		},
		getLogger: function (sComponent) {
			aLoggerComponents.push(sComponent);
			return $.sap.log.getLogger(sComponent, iLogLevel);
		},
		getLevel: function () {
			return iLogLevel;
		}
	};

}, true);
