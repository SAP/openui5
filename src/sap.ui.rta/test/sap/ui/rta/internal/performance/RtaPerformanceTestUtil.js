sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/dt/OverlayRegistry",
	"sap/base/Log"
], function(
	RuntimeAuthoring,
	Plugin,
	OverlayRegistry,
	Log
) {
	"use strict";

	var Util = {
		startRta: function(oHorizontalLayout, aPlugins) {
			var oRuntimeAuthoring = new RuntimeAuthoring({
				rootControl: oHorizontalLayout,
				showToolbars: false
			});
			if (aPlugins && Array.isArray(aPlugins)) {
				if (!aPlugins.length) {
					aPlugins.push(new Plugin("abc"));
				}
				oRuntimeAuthoring.setPlugins(aPlugins);
			}

			// will result in custom timer in webPageTest
			window.performance.mark("rta.start.starts");

			return oRuntimeAuthoring.start()
			.then(function() {
				var sMeasureName = "RTA start function called";
				//will result in custom timer in webPageTest
				window.performance.mark("rta.start.ends");
				window.performance.measure(sMeasureName, "rta.start.starts", "rta.start.ends");
				window.startTime = window.performance.getEntriesByName(sMeasureName)[0].duration;
				Log.info(sMeasureName, window.startTime + "ms");
				//visual change at the end
				var oOverlay = OverlayRegistry.getOverlay(oHorizontalLayout);
				oOverlay.setSelected(true);
			});
		},

		startRtaWithoutStretch: function(oRootControl) {
			var oRuntimeAuthoring = new RuntimeAuthoring({
				rootControl: oRootControl,
				showToolbars: false
			});
			var mPlugins = oRuntimeAuthoring.getDefaultPlugins();
			delete mPlugins["stretch"];
			oRuntimeAuthoring.setPlugins(mPlugins);

			// will result in custom timer in webPageTest
			window.performance.mark("rta.start.starts");

			return oRuntimeAuthoring.start()
			.then(function() {
				var sMeasureName = "RTA start function called";
				//will result in custom timer in webPageTest
				window.performance.mark("rta.start.ends");
				window.performance.measure(sMeasureName, "rta.start.starts", "rta.start.ends");
				window.startTime = window.performance.getEntriesByName(sMeasureName)[0].duration;
				Log.info(sMeasureName, window.startTime + "ms");
				//visual change at the end
				var oOverlay = OverlayRegistry.getOverlay(oRootControl);
				oOverlay.setSelected(true);
			});
		},

		startRtaConstructorOnly: function(oHorizontalLayout) {
			var iRtaStartCounter = 1000;
			var sMeasureName = "RTA init function called " + iRtaStartCounter + " times";
			window.performance.clearMeasures();

			// will result in custom timer in webPageTest
			window.performance.mark("rta.init.starts");

			for (var i = 0; i < iRtaStartCounter; i++) {
				/* eslint no-new: 0 */
				new RuntimeAuthoring({
					rootControl: oHorizontalLayout
				});
			}

			//will result in custom timer in webPageTest
			window.performance.mark("rta.init.ends");
			window.performance.measure(sMeasureName, "rta.init.starts", "rta.init.ends");
			window.creationTime = window.performance.getEntriesByName(sMeasureName)[0].duration;
			Log.info(sMeasureName, window.creationTime + "ms");
		}
	};

	window.startRta = Util.startRta;
	window.startRtaConstructorOnly = Util.startRtaConstructorOnly;

	return Util;
}, true);
