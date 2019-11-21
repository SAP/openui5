/* global QUnit*/

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/test/matchers/Descendant',
	'sap/ui/test/matchers/Properties',
	'sap/ui/test/opaQunit',
	'sap/ui/test/Opa5'
], function (Descendant, Properties, opaTest, Opa5) {
	"use strict";

	QUnit.module("Descendant");

	Opa5.extendConfig({
		viewNamespace: "appUnderTest.view.",
		autoWait: true
	});

	opaTest("Should match a control with given descentant", function (Given, When, Then) {

		Given.iStartMyAppInAFrame("webapp/index.html");

		When.waitFor({
			viewName: "Main",
			controlType: "sap.m.Text",
			matchers: new Properties({
				text: "Ultra Jet Super Color"
			}),
			success: function (aText) {
				return this.waitFor({
					controlType: "sap.m.CustomListItem",
					matchers: new Descendant(aText[0]),
					success: function (aRows) {
						Opa5.assert.strictEqual(aRows.length, 1, "Found row with special text");
					},
					errorMessage: "Did not find row or special text is not inside table row"
				});
			},
			errorMessage: "Did not find special text"
		});

		// Descendant - declarative syntax
		When.waitFor({
			controlType: "sap.m.CustomListItem",
			matchers: {
				descendant: {
					viewName: "Main",
					controlType: "sap.m.Text",
					properties: {
						text: "Ultra Jet Super Color"
					}
				}
			},
			success: function (aRows) {
				Opa5.assert.strictEqual(aRows.length, 1, "Found row with special text");
			},
			errorMessage: "Did not find row or special text is not inside table row"
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
