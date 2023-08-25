/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5, opaTest, Press, PropertyStrictEquals) {
	"use strict";

	QUnit.module("OPA autoWait parameters");

	opaTest("Should change autoWait parameters", function (Given, When, Then) {
		Opa5.extendConfig({
			viewNamespace: "appUnderTest.view.",
			timeout: 1,
			logLevel: "trace",
			autoWait: {
				timeoutWaiter: {
					maxDelay: 500 // timeouts with delays >= 500 will not block test execution
				}
			}
		});

		Given.iStartMyAppInAFrame({ source: "applicationUnderTest/index.html", autoWait: true });

		When.waitFor({
			controlType: "sap.m.Button",
			matchers: new PropertyStrictEquals({name: "text", value: "Start"}),
			errorMessage: "Did not find the button with text Start",
			actions: new Press() // this will start "polling" every 500ms
		});

		Then.waitFor({
			controlType: "sap.m.Button",
			matchers: new PropertyStrictEquals({name: "text", value: "Stop"}),
			actions: new Press(),
			success: function (aButtons) {
				// if autoWait is set to true or maxDelay > 500, the poll started by pressing the button
				// will be caught by the autoWait mechanism and the current waitFor will fail with OPA timeout
				// stating that there is 1 open blocking timeout with delay 500
				Opa5.assert.ok(true, "The Stop button was pressed");
			},
			errorMessage: "Did not find the button with text Stop"
		});

		Then.iTeardownMyAppFrame();
	});

	QUnit.start();
});
