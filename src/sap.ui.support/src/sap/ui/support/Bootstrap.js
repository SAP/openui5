/*!
 * ${copyright}
 */

// Provides control sap.ui.support.Bootstrap.
sap.ui.define(["jquery.sap.global"],
	function (jQuery) {
		"use strict";

	var Bootstrap = {
		initSupportRules: function (settings) {
			sap.ui.require(["sap/ui/support/supportRules/Main"], function (Main) {
				if (settings[0].toLowerCase() === "true" || settings[0].toLowerCase() === "silent") {
					Main.startPlugin(settings);
					/**
					 * Enables the additional logging capabilites of the logger,
					 * allowing the developers to pass custom data, that is later going to be added
					 * to the executionScope of the rules
					 */
					if ('logSupportInfo' in jQuery.sap.log) {
						jQuery.sap.log.logSupportInfo(true);
					}
				}
			});
		}
	};

	return Bootstrap;
});
