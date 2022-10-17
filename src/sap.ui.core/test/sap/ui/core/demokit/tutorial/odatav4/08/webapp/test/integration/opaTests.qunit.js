QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/core/tutorial/odatav4/test/integration/AllJourneys"
	], function () {
		QUnit.start();
	});
});
