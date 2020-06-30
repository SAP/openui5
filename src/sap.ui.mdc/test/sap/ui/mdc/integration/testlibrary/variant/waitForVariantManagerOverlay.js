/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5"
], function(
	Opa5
) {
	"use strict";

	return function waitForVariantManagerOverlay(oSettings) {
		var oDefaultSettings = {
			controlType: "sap.m.Popover",
			matchers: {
				ancestor: {
					controlType: "sap.ui.fl.variants.VariantManagement"
				}
			}
		};

		oSettings = Object.assign(oDefaultSettings, oSettings);

		return this.waitFor({
			searchOpenDialogs: true, // search only visible controls inside the static area
			controlType: oSettings.controlType,
			properties: oSettings.properties,
			matchers: oSettings.matchers,
			success: function(aVariantManagerOverlay) {
				Opa5.assert.ok(true, 'The variant manager ' + oSettings.controlType + ' was found');

				if (typeof oSettings.success === "function") {
					var oVariantManagerOverlay = aVariantManagerOverlay[0];
					oSettings.success.call(this, oVariantManagerOverlay);
				}
			},
			errorMessage: 'The variant manager ' + oSettings.controlType + ' could not be found'
		});
	};
});
