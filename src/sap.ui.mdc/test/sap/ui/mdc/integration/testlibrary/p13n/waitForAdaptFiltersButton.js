/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"./waitForAdaptFiltersDialog"
], function(
	Opa5,
	Ancestor,
	waitForAdaptFiltersDialog
) {
	"use strict";

	// TODO: unify this with waitForP13nButtonWithParentAndIcon
	return function waitForAdaptFiltersButton(oSettings) {

		var oDefaultSettings = {
			controlType: "sap.m.Button"
		};

		oSettings = Object.assign(oDefaultSettings, oSettings);

		return waitForAdaptFiltersDialog.call(this, {
			success: function(oAdaptFilterPopover) {
				this.waitFor({
					controlType: oSettings.controlType,
					properties: oSettings.properties,
					matchers: new Ancestor(oAdaptFilterPopover),
					actions: oSettings.actions,
					success: function(aButtons) {
						Opa5.assert.strictEqual(aButtons.length, 1, 'The button was found');

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
