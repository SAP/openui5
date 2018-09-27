/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties",
	"sap/ui/thirdparty/jquery"
], function (Opa5, opaTest, Press, Properties, $) {
	"use strict";

	QUnit.module("Message Toast");

	Opa5.extendConfig({
		viewNamespace: "appUnderTest.view.",
		autoWait: true
	});

	opaTest("Should click on the button and see a message toast", function (Given, When, Then) {

		// Act
		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		When.waitFor({
			controlType: "sap.m.Button",
			matchers: new Properties({ text: "Show Message Toast" }),
			actions: new Press(),
			errorMessage: "The button was not found"
		});

		Then.waitFor({
			// Locate the message toast using its class name in a jQuery function
			check: function () {
				return $(".sapMMessageToast");
			},
			success: function () {
				Opa5.assert.ok(true, "The message toast was found");
			},
			errorMessage: "The message toast was not found"
		});

		Then.iTeardownMyAppFrame();
	});

	QUnit.start();
});
