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

	return function waitForP13nDialog(oParent, sTitle, oSettings) {
		return this.waitFor({
			controlType: "sap.m.ResponsivePopover",
			matchers: [
				new Properties({
					title: sTitle
				}),
				new Ancestor(oParent)
			],
			actions: oSettings.actions,
			success: function(aP13nDialogs) {
				//Opa5.assert.strictEqual(aP13nDialogs.length, 1, 'The "' + sTitle + '" P13n Dialog was found');

				if (typeof oSettings.success === "function") {
					var oP13nDialog = aP13nDialogs[0];
					oSettings.success.call(this, oP13nDialog);
				}
			},
			errorMessage: 'The "' + sTitle + '" P13n Dialog was not found'
		});
	};
});
