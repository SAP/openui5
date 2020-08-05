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
	return function waitForColumnListItemInDialogWithLabel(oDialog, sLabel, oSettings) {
		this.waitFor({
			controlType: "sap.m.Label",
			matchers: [
				new Properties({
					text: sLabel
				}),
				new Ancestor(oDialog, false)
			],
			success: function(aLabels) {
				//Opa5.assert.strictEqual(aLabels.length, 1, 'The Label was found');
				var oLabel = aLabels[0];
				this.waitFor({
					searchOpenDialogs: true,
					controlType: "sap.m.ColumnListItem",
					matchers: new Descendant(oLabel, false),
					success: function(aColumnListItems) {
						//Opa5.assert.strictEqual(aColumnListItems.length, 1, 'The ColumnListItem was found');
						if (typeof oSettings.success === "function") {
							var oColumnListItem = aColumnListItems[0];
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
