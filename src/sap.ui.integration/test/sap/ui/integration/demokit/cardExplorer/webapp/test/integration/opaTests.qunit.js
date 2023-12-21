/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/demo/cardExplorer/test/integration/AllJourneys"
], async (Core) => {
	"use strict";

	await Core.ready();
	QUnit.start();
});
