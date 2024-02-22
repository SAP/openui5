/* global QUnit */
window.QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/gherkin/opa5TestHarness",
	// Code coverage will be calculated for all modules loaded after the harness
	"GherkinWithOPA5/Steps"
], function(opa5TestHarness, Steps) {
	"use strict";

	opa5TestHarness.test({
		featurePath: "GherkinWithOPA5.Requirements1",
		steps: Steps
	});
	opa5TestHarness.test({
		featurePath: "GherkinWithOPA5.Requirements2",
		steps: Steps
	});

	QUnit.start();
});
