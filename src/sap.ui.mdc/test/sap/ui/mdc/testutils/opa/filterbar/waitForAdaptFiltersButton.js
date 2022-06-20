/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"../Utils"
], function(
	Opa5,
	TestUtils
) {
	"use strict";

	return function waitForAdaptFiltersButton(oSettings) {
		oSettings = oSettings || {};
		var sAdaptFiltersResourceBundleButtonText = TestUtils.getTextFromResourceBundle("sap.ui.mdc", "filterbar.ADAPT");
		return this.waitFor({
			controlType: "sap.m.Button",
			properties: {
				text: {
					regex: {
						source: sAdaptFiltersResourceBundleButtonText + "*",
						flags: "ig"
					}
				}
			},
			matchers: {
				ancestor: {
					controlType: "sap.ui.mdc.FilterBar",
					properties: {
						showAdaptFiltersButton: true
					}
				}
			},
			actions: oSettings.actions,
			success: function(aAdaptFiltersButton) {
				Opa5.assert.strictEqual(aAdaptFiltersButton.length, 1, 'The "Adapt Filters" button was found');

				if (typeof oSettings.success === "function") {
					var oAdaptFiltersButton = aAdaptFiltersButton[0];
					oSettings.success.call(this, oAdaptFiltersButton);
				}
			},
			errorMessage: 'The "Adapt Filters" button was not found'
		});
	};
});
