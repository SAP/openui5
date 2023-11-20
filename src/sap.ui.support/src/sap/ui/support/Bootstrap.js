/*!
 * ${copyright}
 */

// Provides control sap.ui.support.Bootstrap.
sap.ui.define(["sap/base/Log"],
	function (Log) {
	"use strict";

	Log.setLogEntriesLimit(Infinity);

	var Bootstrap = {
		initSupportRules: function (aSettings, oDelegates) {
			sap.ui.require(["sap/ui/support/supportRules/Main"], function (Main) {
				if (aSettings[0].toLowerCase() === "true" || aSettings[0].toLowerCase() === "silent") {

					var bHasReadyFunction = oDelegates && oDelegates.onReady && typeof oDelegates.onReady === "function";

					if (!Main._pluginStarted) {
						if (bHasReadyFunction) {
							Main.attachEvent("ready", oDelegates.onReady);
						}

						Main.startPlugin(aSettings);
					} else {
						if (bHasReadyFunction) {
							oDelegates.onReady();
						}
					}

					/**
					 * Enables the additional logging capabilities of the logger,
					 * allowing the developers to pass custom data, that is later going to be added
					 * to the executionScope of the rules
					 */
					Log.logSupportInfo(true);
				}
			});
		}
	};

	return Bootstrap;
});
