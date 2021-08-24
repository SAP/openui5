/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5"
], function(
	Opa5
) {
	"use strict";

	return function waitForP13nButtonWithMatchers(oSettings) {
		var aMatchers = oSettings.matchers ? oSettings.matchers : [];

		return this.waitFor({
			controlType: "sap.m.Button",
			matchers: aMatchers,
			actions: oSettings.actions,
			errorMessage: oSettings.errorMessage,
			success: function(aButtons) {
				Opa5.assert.strictEqual(aButtons.length, 1, 'The button was found');

				if (typeof oSettings.success === "function") {
					var oButton = aButtons[0];
					oSettings.success.call(this, oButton);
				}
			}
		});
	};
});
