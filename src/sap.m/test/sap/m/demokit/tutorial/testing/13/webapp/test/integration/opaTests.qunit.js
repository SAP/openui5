/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"sap/ui/demo/bulletinboard/test/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});
