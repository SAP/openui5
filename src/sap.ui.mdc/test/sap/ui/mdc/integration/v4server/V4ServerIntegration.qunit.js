/* global QUnit */
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/core/Core",
	"mdc/qunit/util/V4ServerHelper"
], async function(
	Core,
	V4ServerHelper
) {
"use strict";

	await Core.ready();

	V4ServerHelper.checkWhetherServerExists().then(function(bServerAvailable) { // this is where we decide to ONLY execute the test IF the V4 server is available
		if (bServerAvailable) {

			sap.ui.require([
				"v4server/integration/TestJourney"
			], function(TestJourney) {
				QUnit.start();
			});

		} else {
			QUnit.test("V4 NOT AVAILABLE - v4server.integration TESTS SKIPPED", function(assert) {
				assert.ok(true, "Tests are not executed when V4 Test Server is not available");
			});
			QUnit.start();
		}
	});

});
