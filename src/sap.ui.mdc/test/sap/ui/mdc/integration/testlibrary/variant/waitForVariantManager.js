/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5"
], function(
	Opa5
) {
	"use strict";

	return function waitForVariantManager(oSettings) {
		oSettings = oSettings || {};

		return this.waitFor({
			controlType: "sap.ui.fl.variants.VariantManagement",
			matchers: {
				descendant: {
					controlType: "sap.m.Title",
					properties: {
						text: oSettings.text
					}
				}
			},
			actions: oSettings.actions,
			success: function(aVariantManagerButtons) {
				var sMessageFound = 'The variant manager button with text "' + oSettings.text + '" was found';
				Opa5.assert.strictEqual(aVariantManagerButtons.length, 1, sMessageFound);

				if (oSettings.actions) {
					var sMessageAction = 'An action on the variant manager button with text "' + oSettings.text + '" was performed';
					Opa5.assert.ok(true, sMessageAction);
				}

				if (typeof oSettings.success === "function") {
					var oVariantManagerButton = aVariantManagerButtons[0];
					oSettings.success.call(this, oVariantManagerButton);
				}
			},
			errorMessage: "The variant manager button was not found"
		});
	};
});
