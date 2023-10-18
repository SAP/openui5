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
		iFocusTheInput: function (sId) {
			return this.waitFor({
				id: sId,
				actions: new Press(),
				errorMessage: "Did not find the input"
			});
		},

		iEnterText: function (sId, sEnteredText) {
			return this.waitFor({
				id: sId,
				actions: new EnterText({
					text: sEnteredText,
					keepFocus: true,
					clearTextFirst: false
				}),
				errorMessage: "Did not find inner input"
			});
		},

		iMoveCursor: function(sId, sCharToPutCursor, sWayOfMove) {
			return this.waitFor({
				controlType: "sap.m.Input",
				id: sId,
				success: function (oInput) {

				var sValue = oInput.getValue();

				var iInsertIndex = sValue.indexOf(sCharToPutCursor);

				oInput.getFocusDomRef().setSelectionRange(iInsertIndex, iInsertIndex, sWayOfMove);

				},
				errorMessage: "Could not move the cursor"
			});
		},

		iPressShowAllItems: function () {
			return this.waitFor({
				id: "__button0",
				searchOpenDialogs: true,
				actions: new Press(),
				errorMessage: "Did not find the Button"
			});
		},

		iPressKey: function (sKey) {
			return this.waitFor({
				id: "iTypeAhead",
				actions: function (oTarget) {
					Opa5.getUtils().triggerKeydown(oTarget.getDomRef("inner"), sKey);
					Opa5.getUtils().triggerKeyup(oTarget.getDomRef("inner"), sKey);
				},
				errorMessage: "Did not find the inner"
			});
		}
	});

	var oAssertions = new Opa5({
		iSeeTheCorrectInputValue: function (sId, sValue) {
			return this.waitFor({
				id: sId,
				controlType: "sap.m.Input",
				success: function (oInput) {
					Opa5.assert.ok(oInput.getValue() === sValue, "Input value is correct");
				},
				errorMessage: "Input value is not correct."
			});
		},

		iSeeTheCorrectEventValue: function (sId, sValue) {
			return this.waitFor({
				id: sId,
				controlType: "sap.m.Input",
				success: function (oInput) {
					Opa5.assert.ok(oInput.getValue() === sValue, "Event value is correct");
				},
				errorMessage: "Input value is not correct."
			});
		},

		iSeeTheSuggestionsPopover: function (sId) {
			return this.waitFor({
				id: sId,
				controlType: "sap.m.Popover",
				success: function (oInputPopover) {
					Opa5.assert.ok(oInputPopover.getVisible(), "Suggestions were shown");
				},
				errorMessage: "Suggestions popover were not shown.",
				timeout: 5000
			});
		},
		iSeeTheSuggestionsPopoverIsClosed: function (sId) {
			return this.waitFor({
				id: sId,
				controlType: "sap.m.Popover",
				visible: false,
				matchers: function (oPopover) {
					return !oPopover.isOpen();
				},
				success: function (oPopover) {
					Opa5.assert.ok(true, "Popover is not present.");
				},
				errorMessage: "Suggestions popover is still shown."

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
		When.iFocusTheInput("i1");
		When.iEnterText("i1", "A");
		When.iEnterText("i1", "B");
		When.iPressShowAllItems("iResult", "AB");

		// Assert
		Then.iSeeTheCorrectInputValue("i1", "AB");
		Then.iSeeTheCorrectEventValue("iResult", "AB");

		// Act
		Then.iTeardownMyApp();
	});

	opaTest('Check typeAhead functionality', function (Given, When, Then) {
		// Arrange
		Given.iStartMyAppInAFrame("./test-resources/sap/m/qunit/opa/input/TypeAhead/InputTypeAhead.html");

		// Act
		When.iFocusTheInput("iTypeAhead");
		When.iEnterText("iTypeAhead", "b");
		When.iPressKey("b");
		When.iEnterText("iTypeAhead", "n");
		When.iPressKey("n");

		When.iMoveCursor("iTypeAhead", "n", "backward");
		When.iPressKey("g");
		When.iEnterText("iTypeAhead", "g");
		When.iMoveCursor("iTypeAhead", "n", "backward");

		// Assert
		Then.iSeeTheSuggestionsPopover("iTypeAhead-popup");
		Then.iSeeTheSuggestionsPopoverIsClosed("iTypeAhead-popup");
		Then.iSeeTheCorrectInputValue("iTypeAhead", "bgn");

		// Act
		Then.iTeardownMyApp();
	});
});
