/* global QUnit */
window.QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/gherkin/opa5TestHarness",
	// Code coverage will be calculated for all modules loaded after the harness
	"GherkinWithUIComponent/Steps"
], function(opa5TestHarness, Steps) {
	"use strict";

	opa5TestHarness.test({
		featurePath: "GherkinWithUIComponent.Requirements2",
		steps: Steps
	});

	opa5TestHarness.test({
		featurePath: "GherkinWithUIComponent.Requirements1",
		steps: Steps
	});

	QUnit.start();
});
