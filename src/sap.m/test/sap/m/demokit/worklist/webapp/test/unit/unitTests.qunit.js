/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/demo/worklist/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});