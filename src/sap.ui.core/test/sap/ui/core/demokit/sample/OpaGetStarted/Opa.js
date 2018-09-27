/* global QUnit */

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

	QUnit.start();
});
