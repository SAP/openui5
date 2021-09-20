/* global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/test/opaQunit',
	'sap/ui/test/Opa5',
	'sap/ui/test/matchers/I18NText',
	'sap/ui/test/actions/Press'
], function (opaTest, Opa5, I18NText, Press) {
	"use strict";

	QUnit.module("Test the App");

	Opa5.extendConfig({
		viewNamespace: "appUnderTest.view.",
		autoWait : true
	});

	opaTest("Pressing the load button shall will populate the list with products", function (Given, When, Then) {

		// Arrange
		Given.iStartMyAppInAFrame("webapp/index.html");

		// Act
		When.waitFor({
			viewName: "Main",
			controlType: "sap.m.Button",
			matchers: new I18NText({
				propertyName : "text",
				key: "loadButtonText"
			}),
			actions: new Press(),
			errorMessage: "Failed to press the load button"
		});

		// Assert
		Then.waitFor({
			viewName: "Main",
			controlType: "sap.m.Title",
			matchers: new I18NText({
				propertyName : "text",
				key: "listTitle",
				parameters: [ 123 ]
			}),
			success: function () {
				Opa5.assert.ok(true,"The list header indicates 123 products");
			},
			errorMessage: "The list header does not indicate 123 products"
		});

		// I18NText - declarative syntax
		Then.waitFor({
			viewName: "Main",
			controlType: "sap.m.Button",
			matchers: {
				i18NText: {
					propertyName : "text",
					key: "loadButtonText"
				}
			},
			success: function () {
				Opa5.assert.ok(true, "Found the load button with a declarative matcher");
			},
			errorMessage: "Failed to find the load button"
		});

		Then.waitFor({
			viewName: "Main",
			controlType: "sap.m.Button",
			matchers: new I18NText({
				propertyName: "text",
				key: "VIEWSETTINGS_ACCEPT",
				useLibraryBundle: true
			}),
			success: function () {
				Opa5.assert.ok(true, "Found the OK button");
			},
			errorMessage: "Failed to find the OK button"
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
