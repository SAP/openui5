/*global QUnit */
sap.ui.require([
	"sap/base/util/UriParameters",
	"sap/m/Text",
	"sap/ui/test/gherkin/qUnitTestHarness",
	"sap/ui/test/gherkin/opa5TestHarness",
	"test/testHarnessDuplicateSteps"
], function(UriParameters, Text, qUnitTestHarness, opa5TestHarness, Steps) {
	"use strict";

	// Test with either qunit or opa5 test harness depending on how page is called
	var sTestHarness = UriParameters.fromQuery(window.location.search).get("harness");
	if ( (sTestHarness !== "qUnitTestHarness") && (sTestHarness !== "opa5TestHarness") ) {
		throw new Error("Pass in URL parameter 'harness' with value 'qUnitTestHarness' or 'opa5TestHarness'");
	}
	var oTestHarness = (sTestHarness === "qUnitTestHarness") ? qUnitTestHarness : opa5TestHarness;
	document.title += " " + sTestHarness;

	QUnit.done(function() {
		// This SAPUI5 control can be used by an external Opa5 script to know when the test is finished
		var oText = new Text({id: "testing-done", text: ""});
		oText.placeAt("uiArea");
	});

	// we expect this call to throw a "duplicate test step" error and fail the QUnit build
	oTestHarness.test({
		featurePath: "test/testHarnessFailing", // this won't really be used, it just needs to be something valid
		steps: Steps
	});

});
