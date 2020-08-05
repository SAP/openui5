/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press"
], function (Opa5, opaTest, Press) {
	"use strict";

	QUnit.module("Controls by id");

	Opa5.extendConfig({
		viewNamespace: "appUnderTest.view.",
		autoWait : true
	});

	opaTest("Should find a Button with an id", function(Given, When, Then) {

		// Act
		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		When.waitFor({
			viewName : "Main",
			id : "navigationButton",
			actions : new Press(),
			errorMessage : "Did not find the navigation-button"
		});

		Then.waitFor({
			viewName : "Main",
			id : ["firstButtonOnSecondPage", "secondButtonOnSecondPage"],
			success : function (aButtons) {
				Opa5.assert.strictEqual(aButtons.length, 2, "Found both buttons");
			}
		});

		Then.waitFor({
			id: new RegExp("firstButtonOnSecondPage"),
			success : function (aButtons) {
				Opa5.assert.ok(true, "Found the button: " + aButtons[0]);
			},
			errorMessage : "Did not find the button with corresponding id"
		});

		Then.waitFor({
			viewName: "Main",
			fragmentId: "secondPageFragment",
			id: /^hello/,
			success: function (aButtons) {
				Opa5.assert.ok(true, "Found the button: " + aButtons[0]);
			},
			errorMessage : "Did not find the button with corresponding ID inside specified fragment"
		});

		Then.iTeardownMyAppFrame();
	});

	QUnit.start();
});
