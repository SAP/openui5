/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"test/sap/ui/fl/testApps/controlPersonalizationAPIChanges/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});