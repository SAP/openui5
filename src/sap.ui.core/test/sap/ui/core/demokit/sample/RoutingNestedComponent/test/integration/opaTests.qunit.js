/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/core/sample/RoutingNestedComponent/test/integration/AllJourneys"
], function(Core) {
	"use strict";

	Core.ready().then(function() {
		QUnit.start();
	});
});