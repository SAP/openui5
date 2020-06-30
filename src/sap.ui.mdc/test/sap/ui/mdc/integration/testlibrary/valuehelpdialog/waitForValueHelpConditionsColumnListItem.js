/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"./waitForValueHelpConditionsTable"
], function(
	Opa5,
	waitForValueHelpConditionsTable
) {
	"use strict";

	return function waitForValueHelpConditionsColumnListItem(aValues, oSettings) {

		return waitForValueHelpConditionsTable.call(this, {
			success: onValueHelpDialogConditionsTableFound
		});

		function onValueHelpDialogConditionsTableFound(oValueHelpDialogConditionsTable) {
			this.waitFor({
				controlType: "sap.m.ColumnListItem",
				searchOpenDialogs: true,
				matchers: function(oColumnListItem) {
					var oColumnListItemParent = oColumnListItem.getParent();

					if (!oColumnListItemParent) {
						return false;
					}

					if (oColumnListItemParent !== oValueHelpDialogConditionsTable) {
						return false;
					}

					var aCells = oColumnListItem.getCells().filter(function(oCell) {
						return oCell.isA("sap.m.Text");
					});

					var aCellTexts = aCells.map(function(oCell) {
						return oCell.getText();
					});

					if (aCellTexts.length < aValues.length) {
						return false;
					}

					var bCellsFound = aValues.every(function(vValue) {
						return aCellTexts.includes(String(vValue));
					});

					return bCellsFound;
				},
				actions: oSettings.actions,
				success: function(aColumnListItems) {
					Opa5.assert.ok(true, "The column list item condition inside the value help dialog was found");

					if (typeof oSettings.success === "function") {
						var oColumnListItem = aColumnListItems[0];
						oSettings.success.call(this, oColumnListItem);
					}
				},
				errorMessage: "The column list item condition inside the value help dialog could not be found"
			});
		}
	};
});
