sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'sap/ui/test/actions/Press',
	"sap/ui/test/actions/EnterText",
	"sap/ui/events/KeyCodes"
], function (
	Opa5,
	opaTest,
	Press,
	EnterText,
	KeyCodes
) {
	"use strict";

	var oActions = new Opa5({
		iFocusTheInput: function () {
			return this.waitFor({
				id: "i1",
				actions: new Press(),
				errorMessage: "Did not find the input"
			});
		},

		iEnterText: function () {
			return this.waitFor({
				id: "i1",
				actions: new EnterText({
					text: "A"
				}),
				errorMessage: "Did not find inner input"
			});
		},

		iPressKeyboardKeyA: function () {
			return this.waitFor({
				id: "i1",
				actions: function (oTarget) {
					Opa5.getUtils().triggerKeydown(oTarget.getDomRef("inner"), KeyCodes.A);
					Opa5.getUtils().triggerKeyup(oTarget.getDomRef("inner"), KeyCodes.A);

				},
				errorMessage: "Did not find the inner"
			});
		},

		iPressShowAllItems: function () {
			return this.waitFor({
				id: "__button0",
				searchOpenDialogs: true,
				actions: new Press(),
				errorMessage: "Did not find the Button"
			});
		}
	});

	var oAssertions = new Opa5({
		iSeeTheCorrectInputValue: function () {
			return this.waitFor({
				id: "i1",
				controlType: "sap.m.Input",
				success: function (oInput) {
					Opa5.assert.ok(oInput.getValue() === "AB", "Input value is correct");
				},
				errorMessage: "Input value is not correct."
			});
		},

		iSeeTheCorrectEventValue: function () {
			return this.waitFor({
				id: "iResult",
				controlType: "sap.m.Input",
				success: function (oInput) {
					Opa5.assert.ok(oInput.getValue() === "AB", "Event value is correct");
				},
				errorMessage: "Input value is not correct."
			});
		}
	});

	Opa5.extendConfig({
		actions: oActions,
		assertions: oAssertions,
		autoWait: true,
		viewName: "MyView"
	});

	opaTest('Check input value and user input value in the event parameter', function (Given, When, Then) {
		// Arrange
		Given.iStartMyAppInAFrame("./test-resources/sap/m/qunit/opa/input/TypeAhead/InputTypeAhead.html");

		// Act
		When.iFocusTheInput();
		When.iPressKeyboardKeyB();

		When.iPressKeyboardKeyA();
		When.iPressShowAllItems();

		// Assert
		Then.iSeeTheCorrectInputValue();
		// Then.iSeeTheCorrectEventValue();

		// Act
		Then.iTeardownMyApp();
	});
});
