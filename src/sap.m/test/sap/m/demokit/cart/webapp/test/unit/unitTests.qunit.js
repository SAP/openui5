/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/demo/cart/test/unit/AllTests"
], async function (Core) {
	"use strict";

	await Core.ready();
	QUnit.start();
});