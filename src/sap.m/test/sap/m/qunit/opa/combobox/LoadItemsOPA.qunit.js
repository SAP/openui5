sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'sap/ui/test/actions/Press',
	"sap/ui/events/KeyCodes"
], function (
	Opa5,
	opaTest,
	Press,
	KeyCodes
) {
	"use strict";

	var oActions = new Opa5({
		iOpenTheComboBox: function () {
			return this.waitFor({
				id: "c1-arrow",
				actions: new Press(),
				errorMessage: "Did not find the Icon"
			});
		},

		iPressArrowDownOnComboBox: function () {
			return this.waitFor({
				id: "c1",
				actions: function (oTarget) {
					Opa5.getUtils().triggerKeydown(oTarget.getDomRef("inner"), KeyCodes.ARROW_DOWN);
					Opa5.getUtils().triggerKeyup(oTarget.getDomRef("inner"), KeyCodes.ARROW_DOWN);
				},
				errorMessage: "Did not find the inner"
			});
		},

		iPressTheRebindButton: function () {
			return this.waitFor({
				id: "ReBind",
				actions: new Press(),
				errorMessage: "Did not find the Button"
			});
		},

		iPressDummyButton: function () {
			return this.waitFor({
				id: "dummy",
				actions: new Press(),
				errorMessage: "Did not find the Button"
			});
		}
	});

	var oAssertions = new Opa5({
		iSeeADropDownWithNoData: function () {
			return this.waitFor({
				controlType: "sap.m.List",
				searchOpenDialogs: true,
				success: function (aLists) {
					Opa5.assert.ok(aLists[0].getShowNoData(), "No data feature of the list is enabled");
				},
				errorMessage: "No data feature of the list is disabled."
			});
		},

		iSeeOpenPicker: function () {
			return this.waitFor({
				controlType: "sap.m.List",
				searchOpenDialogs: true,
				success: function (aLists) {
					Opa5.assert.ok(aLists[0].getDomRef(), "List is visible");
				},
				errorMessage: "List is not visible"
			});
		},

		iSeeListWithItems: function () {
			return this.waitFor({
				controlType: "sap.m.List",
				searchOpenDialogs: true,
				success: function (aLists) {
					Opa5.assert.ok(!!aLists[0].getItems().length, "List has items");
				},
				errorMessage: "List has no items"
			});
		}
	});

	Opa5.extendConfig({
		actions: oActions,
		assertions: oAssertions,
		autoWait: true,
		viewName: "MyView"
	});

	opaTest('Checks if no data feature of the list is enabled', function (Given, When, Then) {
		// Arrange
		Given.iStartMyAppInAFrame("./test-resources/sap/m/qunit/opa/combobox/LoadItems/LoadItems.html");

		// Act
		When.iOpenTheComboBox();

		// Assert
		Then.iSeeADropDownWithNoData();

		// Act
		When.iPressTheRebindButton();
		When.iOpenTheComboBox();

		// // Assert
		Then.iSeeListWithItems();

		// Act
		Then.iTeardownMyApp();
	});

	opaTest('Checks if no data feature of the list is enabled when fech is done via arrow down', function (Given, When, Then) {
		// Arrange
		Given.iStartMyAppInAFrame("./test-resources/sap/m/qunit/opa/combobox/LoadItems/LoadItems.html");

		// Act
		When.iPressArrowDownOnComboBox();
		When.iOpenTheComboBox();

		// assert
		Then.iSeeOpenPicker();
		Then.iSeeADropDownWithNoData();

		// Act
		Then.iTeardownMyApp();
	});


	opaTest('Open picker to check no data then close, focus the combo and press arow down', function (Given, When, Then) {
		// Arrange
		Given.iStartMyAppInAFrame("./test-resources/sap/m/qunit/opa/combobox/LoadItems/LoadItems.html");

		// Act (Open combo via click)
		When.iOpenTheComboBox();

		// Assert
		Then.iSeeADropDownWithNoData();

		// Act (Press dummy button to close the picker)
		When.iPressDummyButton();

		// Act (Press arrow down when inner input is focued)
		When.iPressArrowDownOnComboBox();

		// Act (Open the picker)
		When.iOpenTheComboBox();

		// assert
		Then.iSeeOpenPicker();
		Then.iSeeADropDownWithNoData();

		// Act
		Then.iTeardownMyApp();
	});
});
