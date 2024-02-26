/* global QUnit */
window.QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/gherkin/opa5TestHarness",
	// Code coverage will be calculated for all modules loaded after the harness
	"GherkinWithPageObjects/Steps",
	"GherkinWithPageObjects/arrangements/Common",
	"GherkinWithPageObjects/pageObjects/Intro",
	"GherkinWithPageObjects/pageObjects/Overview",
	"GherkinWithPageObjects/pageObjects/TestPage1",
	"GherkinWithPageObjects/pageObjects/TestPage2"
], function(Opa5, opa5TestHarness, Steps, Common) {
	"use strict";

	Opa5.extendConfig({
		viewName : "Main",
		viewNamespace : "appUnderTest.view.",
		arrangements : new Common()
	});

	opa5TestHarness.test({
		featurePath: "GherkinWithPageObjects.Requirements1",
		generateMissingSteps: true
	});
	opa5TestHarness.test({
		featurePath: "GherkinWithPageObjects.Requirements2",
		steps: Steps,
		generateMissingSteps: true
	});

	QUnit.start();
});
