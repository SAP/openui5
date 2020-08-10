/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/mdc/integration/testlibrary/Util"
], function(
	Opa5,
	TestUtil
) {
	"use strict";

	// TODO: unify this with waitForP13nDialog
	return function waitForAdaptFiltersDialog(oSettings) {
		oSettings = oSettings || {};

		return this.waitFor({
			searchOpenDialogs: true, // search only visible controls inside the static area
			controlType: "sap.m.Dialog",
			properties: {

				// title: "Adapt Filters"
				title: TestUtil.getTextFromResourceBundle("sap.ui.mdc", "filterbar.ADAPT_TITLE")
			},
			success: function(aAdaptFiltersPopovers) {
				Opa5.assert.ok(true, 'The adapt filters personalization popover was found');

				if (typeof oSettings.success === "function") {
					var oAdaptFiltersPopover = aAdaptFiltersPopovers[0];

					// FIXME: increase the `followOf` threshold/tolerance of the sap.m.Popover
					// control to prevent it from closing when the position of the “Adapt Filters”
					// button changes when a filter field is re-ordered, removed or added
					oAdaptFiltersPopover._followOfTolerance = 96;

					oSettings.success.call(this, oAdaptFiltersPopover);
				}
			},
			errorMessage: 'The adapt filters personalization popover was not found'
		});
	};
});
