/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/demo/bulletinboard/test/unit/AllTests"
], async function (Core) {
	"use strict";
	await Core.ready();
	QUnit.start();
});