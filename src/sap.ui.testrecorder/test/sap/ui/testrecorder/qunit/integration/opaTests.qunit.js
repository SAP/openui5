/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"sap/ui/testrecorder/qunit/integration/AllJourneys"
], async function(Core) {
	'use strict';

	await Core.ready();

	QUnit.start();
});

