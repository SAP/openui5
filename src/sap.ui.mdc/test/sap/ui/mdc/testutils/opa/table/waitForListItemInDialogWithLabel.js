/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Descendant",
	"sap/ui/test/matchers/Properties"
], function(
	Opa5,
	Ancestor,
	Descendant,
	Properties
) {
	"use strict";
	return function waitForListItemInDialogWithLabel(oSettings) {
		var aMatchers = [];
		var oDialog = oSettings.dialog;
		var sLabel = oSettings.label;

		if (oDialog) {
			aMatchers.push(new Ancestor(oDialog, false));
		}
		if (sLabel) {
			aMatchers.push(
				new Properties({
					text: sLabel
				})
			);
		}
		this.waitFor({
			controlType: "sap.m.Label",
			matchers: aMatchers,
			success: function(aLabels) {
				//Opa5.assert.strictEqual(aLabels.length, 1, 'The Label was found');
				var oLabel = aLabels[0];
				this.waitFor({
					searchOpenDialogs: true,
					controlType: oSettings.listItemType || "sap.m.ColumnListItem",
					matchers: new Descendant(oLabel),
					success: function(aColumnListItems) {
						//Opa5.assert.strictEqual(aColumnListItems.length, 1, 'The ColumnListItem was found');
						if (typeof oSettings.success === "function") {
							var oColumnListItem = aColumnListItems[aColumnListItems.length - 1];
							oSettings.success.call(this, oColumnListItem);
						}
					},
					actions: oSettings.actions,
					errorMessage: oSettings.errorMessage
				});
			},
			errorMessage: "The Label '" + sLabel + "' was not found"
		});
	};
});
