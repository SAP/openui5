/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/matchers/BindingPath"
], function (Opa5, opaTest, Press, Properties, BindingPath) {
	"use strict";

	QUnit.module("Message Toast");

	Opa5.extendConfig({
		viewNamespace: "appUnderTest.view.",
		autoWait: true
	});

	opaTest("Should click on the button and see a message toast", function (Given, When, Then) {

		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		When.waitFor({
			controlType: "sap.m.Button",
			matchers: new Properties({
				text: "Show Message Toast"
			}),
			actions: new Press(),
			errorMessage: "The message toast button was not found"
		});

		Then.waitFor({
			// Locate the message toast using its class name in a jQuery function
			check: function () {
				return Opa5.getJQuery()(".sapMMessageToast").length > 0;
			},
			success: function () {
				Opa5.assert.ok(true, "The message toast was found");
			},
			errorMessage: "The message toast was not found"
		});

		Then.iTeardownMyAppFrame();
	});

	opaTest("Should test controls in a dialog", function (Given, When, Then) {

		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		When.waitFor({
			controlType: "sap.m.Button",
			matchers: new Properties({
				text: "Show Dialog"
			}),
			actions: new Press(),
			errorMessage: "The dialog button was not found"
		});

		Then.waitFor({
			// search only inside open controls of the static area
			searchOpenDialogs: true,
			// match only controls with this controlType that are inside an open dialog
			controlType: "sap.m.Title",
			success: function (aControls) {
				Opa5.assert.strictEqual(aControls.length, 1, "Should not match the Page title");
				Opa5.assert.strictEqual(aControls[0].getText(), "Products", "Should match only the Dialog title");
			},
			errorMessage: "No title was found in the open dialog"
		});

		Then.waitFor({
			searchOpenDialogs: true,
			// search in dialog using matchers
			matchers: new BindingPath({
				path: "/ProductCollection/0",
				propertyPath: "Name"
			}),
			success: function (aControls) {
				Opa5.assert.strictEqual(aControls[0].getTitle(), "Notebook Basic 15", "Should match a dialog list item using BindingPath matcher");
			},
			errorMessage: "No list item was found"
		});

		Then.waitFor({
			searchOpenDialogs: true,
			// search by control ID inside open dialog
			id: "OKButton",
			success: function (oControl) {
				Opa5.assert.ok(oControl, "Should match a dialog control by ID");
			},
			errorMessage: "No control was found with the ID OKButton"
		});

		Then.iTeardownMyAppFrame();
	});

	QUnit.start();
});
