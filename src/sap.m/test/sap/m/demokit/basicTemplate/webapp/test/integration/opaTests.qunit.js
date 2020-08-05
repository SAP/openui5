/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"sap/ui/demo/basicTemplate/test/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});
