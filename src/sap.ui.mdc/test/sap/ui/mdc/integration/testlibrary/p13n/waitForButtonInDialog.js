/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"sap/ui/test/matchers/Properties",
	"./waitForP13nDialog",
	"sap/ui/mdc/integration/testlibrary/Util"
], function(
	Opa5,
	Ancestor,
	Properties,
	waitForP13nDialog,
	TestUtil
) {
	"use strict";

	return function waitForButtonInDialog(sTitle, bConfirm, oSettings) {

		var oDefaultSettings = {
			controlType: "sap.m.Button"
		};

		oSettings = Object.assign(oDefaultSettings, oSettings);

		return waitForP13nDialog.call(this, sTitle, {
			liveMode: false,
			success: function(oP13nDialog) {
				this.waitFor({
					controlType: oSettings.controlType,
					matchers: [
						new Ancestor(oP13nDialog),
						new Properties({
							text: bConfirm ?
								TestUtil.getTextFromResourceBundle("sap.ui.mdc", "p13nDialog.OK") :
								TestUtil.getTextFromResourceBundle("sap.ui.mdc", "p13nDialog.Cancel")
						})
					],
					actions: oSettings.actions,
					success: function(aButtons){
						Opa5.assert.strictEqual(aButtons.length, 1, 'The Button "' + bConfirm ? TestUtil.getTextFromResourceBundle("sap.ui.mdc", "p13nDialog.OK") : TestUtil.getTextFromResourceBundle("sap.ui.mdc", "p13nDialog.Cancel") + '" was found');
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
