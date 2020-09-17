/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"./waitForVariantManagerOverlay",
	"sap/ui/mdc/integration/testlibrary/Util"
], function(
	Opa5,
	Ancestor,
	waitForVariantManagerOverlay,
	TestUtil
) {
	"use strict";

	return function waitForVariantManagerItem(oSettings) {
		oSettings = oSettings || {};

		var sItemText = oSettings.itemText;

		function onVariantManagerPopoverFound(oVariantManagerPopover) {
			this.waitFor({
				searchOpenDialogs: true, // search only visible controls inside the static area
				controlType: "sap.ui.core.Item",
				properties: {
					text: sItemText,
					enabled: true
				},
				matchers: new Ancestor(oVariantManagerPopover),
				actions: oSettings.actions,
				success: function onListItemFound(aItems) {
					Opa5.assert.strictEqual(aItems.length, 1, 'The variant "' + sItemText + '" item was found');
					var oListItem = aItems[0];

					if (typeof oSettings.success === "function") {
						oSettings.success.call(this, oListItem);
					}
				},
				errorMessage: 'The variant "' + sItemText + '" item could not be found'
			});
		}

		return waitForVariantManagerOverlay.call(this, {
			properties: {

				// title: "My Views"
				title: TestUtil.getTextFromResourceBundle("sap.ui.fl", "VARIANT_MANAGEMENT_VARIANTS")
			},
			success: onVariantManagerPopoverFound
		});
	};
});
