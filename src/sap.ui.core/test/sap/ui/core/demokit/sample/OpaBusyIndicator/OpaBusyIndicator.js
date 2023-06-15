/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/test/actions/Press",
	"sap/ui/test/matchers/PropertyStrictEquals"
], function (Opa5, opaTest, Press, PropertyStrictEquals) {
	"use strict";

	/* When can we interact with / assert on busy controls:
	 * - if no actions are declared and either:
	 * -- OPA5.config autoWait = true and waitFor autoWait = false
	 * -- OPA5.config autoWait = false and and waitFor autoWait is not modified
	 */

	Opa5.extendConfig({
		viewName: "view.Main"
	});

	var mToggleButtonOptions = {
		controlType: "sap.m.Button",
		matchers: new PropertyStrictEquals({
			name: "text",
			value: "Toggle table busy indicator"
		}),
		actions: new Press(),
		errorMessage: "The button was not found"
	};

	QUnit.module("Busy Indicator - global autoWait: true", {
		beforeEach: function () {
			Opa5.extendConfig({
				autoWait: true
			});
		}
	});

	opaTest("Should verify that control is busy", function (Given, When, Then) {
		Given.iStartMyAppInAFrame("applicationUnderTest/index.html");

		When.waitFor(mToggleButtonOptions);

		Then.waitFor({
			// disabling autoWait will enable us to check for non-interactable controls
			autoWait: false,
			id: "myList",
			check: function (oList) {
				return oList.getBusy();
			},
			success: function () {
				Opa5.assert.ok(true, "The list is busy");
			},
			// uncommenting the actions will fail the test:
			// if we disable autoWait, but use actions, searching for busy controls will remain disabled
			// actions: new Press(),
			errorMessage: "The list was not found"
		});

		When.waitFor(mToggleButtonOptions);

		Then.iTeardownMyAppFrame();
	});

	QUnit.start();
});
