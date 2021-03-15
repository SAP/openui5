/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"sap/ui/core/sample/RoutingNestedComponent/test/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});