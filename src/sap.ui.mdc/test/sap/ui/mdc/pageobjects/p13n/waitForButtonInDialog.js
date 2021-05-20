/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Properties",
	"./waitForP13nDialog"
], function(
	Opa5,
	Ancestor,
	Properties,
	waitForP13nDialog
) {
	"use strict";

	return function waitForButtonInDialog(oSettings) {

		var sDialogTitle = oSettings.dialogTitle;
		var sButtonText = oSettings.buttonText;

		var oDefaultSettings = {
			controlType: "sap.m.Button"
		};

		oSettings = Object.assign(oDefaultSettings, oSettings);

		return waitForP13nDialog.call(this, {
			dialogTitle: sDialogTitle,
			liveMode: false,
			success: function(oP13nDialog) {
				this.waitFor({
					controlType: oSettings.controlType,
					matchers: [
						new Ancestor(oP13nDialog),
						new Properties({
							text: sButtonText
						})
					],
					actions: oSettings.actions,
					success: function(aButtons){
						Opa5.assert.strictEqual(aButtons.length, 1, 'The Button "' + sButtonText  + '" was found');
						var oButton = aButtons[0];

						if (typeof oSettings.success === "function") {
							oSettings.success.call(this, oButton);
						}
					}
				});
			}
		});
	};
});
