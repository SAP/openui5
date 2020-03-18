/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	/*
	 * NavigationJourney is separated so that each test page runs fast enough (<30s)
	 */
	sap.ui.require([
		"sap/ui/test/Opa5",
		"sap/ui/demo/orderbrowser/test/integration/arrangements/Startup",
		"sap/ui/demo/orderbrowser/test/integration/NavigationJourney"
	], function (Opa5, Startup) {

		Opa5.extendConfig({
			arrangements: new Startup(),
			viewNamespace: "sap.ui.demo.orderbrowser.view.",
			autoWait: true
		});

		QUnit.start();
	});
});