/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/mdc/integration/testlibrary/Util"
], function(
	Opa5,
	Ancestor,
	TestUtil
) {
	"use strict";

	// TODO: unify this with waitForListItemInDialogWithLabel
	return function waitForColumnListItem(sItemText, oSettings) {
		oSettings = oSettings || {};

		return this.waitFor({
			searchOpenDialogs: true, // search only visible controls inside the static area
			controlType: "sap.m.ColumnListItem",
			matchers: {
				ancestor: {
					controlType: "sap.m.ResponsivePopover",
					properties: {

						// title: "Adapt Filters"
						title: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "filterbar.ADAPT_TITLE")
					}
				},
				descendant: {
					controlType: "sap.m.Label",
					properties: {
						text: sItemText
					}
				}
			},
			actions: oSettings.actions,
			success: function onColumnListItemFound(aColumnListItems) {
				Opa5.assert.strictEqual(aColumnListItems.length, 1, 'The personalization "' + sItemText + '" column list item was found');
				var oColumnListItem = aColumnListItems[0];

				if (typeof oSettings.success === "function") {
					oSettings.success.call(this, oColumnListItem);
				}
			}
		});
	};
});
