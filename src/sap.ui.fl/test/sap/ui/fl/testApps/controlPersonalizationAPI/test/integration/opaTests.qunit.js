/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"test/sap/ui/fl/testApps/controlPersonalizationAPIChanges/test/integration/AllJourneys"
], function(Core) {
	"use strict";

	Core.ready().then(() => {
		QUnit.start();
	});
});