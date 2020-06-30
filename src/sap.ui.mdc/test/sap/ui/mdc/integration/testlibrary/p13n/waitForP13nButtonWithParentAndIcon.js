/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Properties"
], function(
	Opa5,
	Ancestor,
	Properties
) {
	"use strict";

	return function waitForP13nButtonWithParentAndIcon(oParent, sIcon, oSettings) {
		return this.waitFor({
			controlType: "sap.m.Button",
			matchers: [
				new Ancestor(oParent, false),
				new Properties({
					icon: sIcon
				})
			],
			actions: oSettings.actions,
			errorMessage: oSettings.errorMessage,
			success: function(aButtons) {
				//Opa5.assert.strictEqual(aButtons.length, 1, 'The button was found');

				if (typeof oSettings.success === "function") {
					var oButton = aButtons[0];
					oSettings.success.call(this, oButton);
				}
			}
		});
	};
});
