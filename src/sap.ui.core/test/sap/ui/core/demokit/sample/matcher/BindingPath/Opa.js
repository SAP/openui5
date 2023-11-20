/* global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/test/matchers/BindingPath',
	'sap/ui/test/opaQunit',
	'sap/ui/test/Opa5'
], function (BindingPath, opaTest, Opa5) {
	"use strict";

	QUnit.module("Binding Path");

	Opa5.extendConfig({
		viewNamespace: "appUnderTest.view.",
		autoWait: true
	});

	opaTest("Should match the binding path for selected item", function (Given, When, Then) {

		// Arrange
		Given.iStartMyAppInAFrame("webapp/index.html");

		// Act
		When.waitFor({
			id: "productList",
			viewName: "Main",
			matchers: new BindingPath({
				propertyPath: "/ProductCollection"
			}),
			success: function () {
				Opa5.assert.ok(true, "The binding property path of the list was matched");
			},
			errorMessage: "Could not match the binding property of the list"
		});

		// Assert
		Then.waitFor({
			controlType: "sap.m.CustomListItem",
			matchers: new BindingPath({
				path: "/ProductCollection/0"
			}),
			success: function () {
				Opa5.assert.ok(true, "Notebook Basic 15", "The binding context for the selected item was matched");
			},
			errorMessage: "The binding context for the selected item was not matched"
		});

		Then.waitFor({
			controlType: "sap.m.CheckBox",
			matchers:new BindingPath({
				path: "/ProductCollection/0",
				propertyPath: "Status"
			}),
			success: function (aCheckBoxes) {
				Opa5.assert.ok(aCheckBoxes[0].getSelected(), "The binding context path and property path of the CheckBox were matched");
			},
			errorMessage: "Could not match the binding context and property path of the first collection item"
		});

		Then.waitFor({
			controlType: "sap.m.Text",
			matchers: new BindingPath({
				propertyPath: "/ProductCollection/0/MainCategory"
			}),
			success: function (aTexts) {
				Opa5.assert.strictEqual(aTexts[0].getText(), "Computer Systems",
					"The binding path for an element with property binding was matched");
			},
			errorMessage: "The binding path for an element with property binding was not matched"
		});

		// BindingPath - declarative syntax
		Then.waitFor({
			controlType: "sap.m.CheckBox",
			matchers:{
				bindingPath: {
					path: "/ProductCollection/0",
					propertyPath: "Status"
				}
			},
			success: function (aCheckBoxes) {
				Opa5.assert.ok(aCheckBoxes[0].getSelected(), "The binding context path and property path of the CheckBox were matched");
			},
			errorMessage: "Could not match the binding context and property path of the first collection item"
		});

		// Tear down should always be done in real use case
		// In this sample we commented it out so you can see the result.
		// If no globals is activated,
		// IE will fail because the frame with an id will be recognized as global.
		if (QUnit.config.noglobals) {
			Then.iTeardownMyAppFrame();
		}
	});

	QUnit.start();

});
