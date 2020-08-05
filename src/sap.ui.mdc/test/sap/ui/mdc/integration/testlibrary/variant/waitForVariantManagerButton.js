/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"./waitForVariantManagerOverlay"
], function(
	Opa5,
	Ancestor,
	waitForVariantManagerOverlay
) {
	"use strict";

	return function waitForVariantManagerButton(oSettings) {

		var oDefaultSettings = {
			controlType: "sap.m.Button"
		};

		oSettings = Object.assign(oDefaultSettings, oSettings);

		return waitForVariantManagerOverlay.call(this, {
			properties: oSettings.ancestorProperties,
			success: function(oVariantManagerPopover) {
				this.waitFor({
					controlType: oSettings.controlType,
					properties: oSettings.properties,
					matchers: new Ancestor(oVariantManagerPopover),
					actions: oSettings.actions,
					success: function(aButtons) {
						Opa5.assert.strictEqual(aButtons.length, 1, 'The variant manager button was found');

						if (typeof oSettings.success === "function") {
							var oButton = aButtons[0];
							oSettings.success.call(this, oButton);
						}
					},
					errorMessage: oSettings.errorMessage
				});
			}
		});
	};
});
