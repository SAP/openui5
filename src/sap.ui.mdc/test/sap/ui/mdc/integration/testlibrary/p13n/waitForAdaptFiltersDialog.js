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
		var sTitle = oSettings.title;

		return this.waitFor({
			searchOpenDialogs: true, // search only visible controls inside the static area
			controlType: "sap.m.Dialog",
			matchers: {
				descendant: {
					controlType: "sap.m.Title",
					properties: {
						text: sTitle
					}
				}
			},
			success: function(AdaptFiltersDialog) {
				Opa5.assert.ok(true, 'The adapt filters personalization dialog was found');

				if (typeof oSettings.success === "function") {
					var oAdaptFiltersDialog = AdaptFiltersDialog[0];

					// FIXME: increase the `followOf` threshold/tolerance of the sap.m.Dialog
					// control to prevent it from closing when the position of the “Adapt Filters”
					// button changes when a filter field is re-ordered, removed or added
					oAdaptFiltersDialog._followOfTolerance = 96;

					oSettings.success.call(this, oAdaptFiltersDialog);
				}
			},
			errorMessage: 'The adapt filters personalization dialog was not found'
		});
	};
});
