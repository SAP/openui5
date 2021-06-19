/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	// ensure 100% height
	document.documentElement.style.height =
	document.body.style.height = "100%";

	sap.ui.require([
		"teamCalendar/test/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});