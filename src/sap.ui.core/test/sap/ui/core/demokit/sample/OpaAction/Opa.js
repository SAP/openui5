/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/matchers/AggregationLengthEquals",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Properties",
	"sap/ui/test/actions/Press",
	"sap/ui/test/actions/EnterText"
], function (Opa5,
			 opaTest,
			 AggregationLengthEquals,
			 Ancestor,
			 Properties,
			 Press,
			 EnterText) {
	"use strict";

	QUnit.module("Navigation using the press action");

	// set defaults
	Opa5.extendConfig({
		viewNamespace: "appUnderTest.view.",
		// we only have one view
		viewName : "Main",
		autoWait : true
	});

	opaTest("Should navigate to page 2", function(Given, When, Then) {
		Given.iStartMyUIComponent({
			componentConfig: { name: "appUnderTest" }
		});

		When.waitFor({
			controlType : "sap.m.StandardListItem",
			// Pressing a special region of a control may be achieved with the id suffix
			actions: new Press({ idSuffix : "imgDel" }),
			errorMessage: "List items where not pressable"
		});

		Then.waitFor({
			controlType: "sap.m.List",
			matchers: new AggregationLengthEquals({
				name: "items",
				length: 0
			}),
			success: function () {
				Opa5.assert.ok(true, "List has no items");
			}
		});

		When.waitFor({
			id : "navigationButton",
			// For pressing controls use the press action
			// The button is busy so OPA will automatically wait until you can press it
			actions: new Press(),
			errorMessage: "The navigation-button was not pressable"
		});

		Then.waitFor({
			id : "myForm",
			success: function () {
				Opa5.assert.ok(true, "Navigation to page 2 was a success");
			},
			errorMessage: "Was not able to navigate to page 2"
		});
	});

	QUnit.module("Entering text in Controls");
	opaTest("Should enter a text to all", function (Given, When, Then) {
		// Fill all inputs on the screen with the same text
		When.waitFor({
			controlType: "sap.m.Input",
			actions: new EnterText({
				text: "Hello from OPA actions"
			}),
			errorMessage: "There was no Input"
		});

		Then.waitFor({
			controlType: "sap.m.Input",
			success: function (aInputs) {
				aInputs.forEach(function (oInput) {
					Opa5.assert.strictEqual(oInput.getValue(), "Hello from OPA actions", oInput + " contains the text");
				});
			},
			errorMessage: "The text was not entered"
		});
	});

	QUnit.module("Select using the press action");

	opaTest("Should select an item in a Select", function(Given, When, Then) {
		When.waitFor({
			id: "mySelect",
			actions: new Press(),
			success: function(oSelect) {
				this.waitFor({
					controlType: "sap.ui.core.Item",
					matchers: [
						new Ancestor(oSelect),
						new Properties({ key: "Germany"})
					],
					actions: new Press(),
					success: function() {
						Opa5.assert.strictEqual(oSelect.getSelectedKey(), "Germany", "Selected Germany");
					},
					errorMessage: "Cannot select Germany from mySelect"
				});
			},
			errorMessage: "Could not find mySelect"
		});

	});

	QUnit.module("Custom Actions");

	opaTest("Should select an item in a Select", function(Given, When, Then) {
		// If the framework does not have the action you are looking for
		// This is how you enter a custom action
		When.waitFor({
			id: "mySelect",
			actions: function (oSelect) {
				oSelect.setSelectedKey("USA");
			},
			errorMessage: "Could not select USA from the country select"
		});

		Then.waitFor({
			id: "mySelect",
			success: function (oSelect) {
				Opa5.assert.strictEqual(oSelect.getSelectedKey(), "USA", "Selected USA");
			},
			errorMessage: "USA was not selected"
		});
	});

	QUnit.start();
});
