/* global QUnit */
window.QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/gherkin/qUnitTestHarness",
	// Code coverage will be calculated for all modules loaded after the harness
	"GherkinWithQUnit/Steps"
], function(qUnitTestHarness, Steps) {
	"use strict";

	qUnitTestHarness.test({
		featurePath: "GherkinWithQUnit.Requirements1",
		steps: Steps
	});
	qUnitTestHarness.test({
		featurePath: "GherkinWithQUnit.Requirements2",
		steps: Steps
	});

	QUnit.start();
});
