/* global QUnit, opaTodo, opaSkip */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties"
], function (Opa5, opaTest, Press, Properties) {
	"use strict";

	QUnit.module("Simple server action");

	Opa5.extendConfig({
		viewName : "Main",
		viewNamespace: "appUnderTest.view.",
		autoWait : true
	});

	opaTest("Should get a response", function(Given, When, Then) {

		// Act
		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		When.waitFor({
			id : "loadButton",
			actions : new Press(),
			errorMessage : "Did not find the load button"
		});

		Then.waitFor({
			controlType : "sap.m.Page",
			matchers : new Properties({
				title : "Hello from Server"
			}),
			success : function () {
				Opa5.assert.ok(true, "Did update the app title correctly");
			}
		});

		Then.iTeardownMyAppFrame();
	});

	// The following test should report 1 assertion failure because there is no element with ID "saveButton"
	// The test itself will be successful in QUnit2
	// It will fail in QUnit1, as QUnit.todo is not yet available, and the result will be the same as for opaTest
	opaTodo("Should press another button", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		When.waitFor({
			id : "saveButton",
			actions : new Press(),
			errorMessage : "Did not find the save button"
		});

		Then.iTeardownMyAppFrame();
	});

	// The following test will be skipped
	// If opaTest is used instead, the test will fail
	opaSkip("Should press another button", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		When.waitFor({
			id : "skipButton",
			actions : new Press(),
			errorMessage : "Did not find the skip button"
		});

		Then.iTeardownMyAppFrame();
	});

	QUnit.start();
});
