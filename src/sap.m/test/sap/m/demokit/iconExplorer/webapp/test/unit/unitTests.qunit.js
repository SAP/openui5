/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require(["sap/ui/core/Core"], Core => Core.ready(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/demo/iconexplorer/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
}));
