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

		iEnterText: function (sText) {
			return this.waitFor({
				id: "i1",
				actions: new EnterText({
					text: sText,
					clearTextFirst: false,
					keepFocus: true
				}),
				errorMessage: "Did not find inner input"
			});
		},

		iPressKey: function (sKey) {
			return this.waitFor({
				id: "i1",
				actions: function (oTarget) {
					Opa5.getUtils().triggerKeydown(oTarget.getDomRef("inner"), sKey);
					Opa5.getUtils().triggerKeyup(oTarget.getDomRef("inner"), sKey);
				},
				errorMessage: "Did not find the inner"
			});
		},

		iPressKeyBackspace: function () {
			return this.waitFor({
				id: "i1",
				actions: function (oTarget) {
					Opa5.getUtils().triggerKeydown(oTarget.getDomRef("inner"), KeyCodes.BACKSPACE);
					Opa5.getUtils().triggerKeyup(oTarget.getDomRef("inner"), KeyCodes.BACKSPACE);
					const value = oTarget.getValue();
					oTarget.setValue(value.slice(0, value.length - 1));
				},
				errorMessage: "Did not find the inner"
			});
		}
	});

	var oAssertions = new Opa5({
		iSeePopoverOpen: function () {
			return this.waitFor({
				controlType: "sap.m.Table",
				searchOpenDialogs: true,
				success: function (aTables) {
					var oSuggestionTable = aTables[0];
					Opa5.assert.ok(oSuggestionTable, "Table is displayed and Popover is open");
					Opa5.assert.strictEqual(oSuggestionTable.getItems().length, 1, "Table has one row");
					Opa5.assert.ok(oSuggestionTable.getSelectedItem(), "Table's first item is selected");
				},
				errorMessage: "No Popover is open."
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
		Given.iStartMyAppInAFrame("./test-resources/sap/m/qunit/opa/input/SuggestionRowsPopover/SuggestionRowsPopover.html");

		// Act
		When.iFocusTheInput();
		When.iPressKey(KeyCodes.DIGIT_7);
		When.iEnterText("7");
		When.iPressKey(KeyCodes.DIGIT_0);
		When.iEnterText("0");
		When.iPressKey(KeyCodes.DIGIT_0);
		When.iEnterText("0");
		When.iPressKey(KeyCodes.DIGIT_0);
		When.iEnterText("0");
		When.iPressKeyBackspace();
		When.iPressKeyBackspace();
		When.iPressKey(KeyCodes.DIGIT_2);
		When.iEnterText("2");

		// Assert
		Then.iSeePopoverOpen();

		// Destroy
		Then.iTeardownMyApp();
	});
});
