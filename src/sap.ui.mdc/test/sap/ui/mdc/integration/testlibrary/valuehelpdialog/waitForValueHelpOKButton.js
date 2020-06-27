/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/matchers/Ancestor",
	"./waitForValueHelpDialog",
	"sap/ui/mdc/integration/testlibrary/Util"
], function(
	Ancestor,
	waitForValueHelpDialog,
	TestUtil
) {
	"use strict";

	return function waitForValueHelpOKButton(oWaitForSettings) {

		return waitForValueHelpDialog.call(this, {
			success: onValueHelpDialogFound
		});

		function onValueHelpDialogFound(oValueHelpDialog) {
			var sResourceBundleOKButtonText = TestUtil.getTextFromResourceBundle("sap.ui.mdc", "valuehelp.OK");

			this.waitFor({
				controlType: "sap.m.Button",
				properties: {
					text: sResourceBundleOKButtonText
				},
				searchOpenDialogs: true,
				matchers: new Ancestor(oValueHelpDialog),
				actions: oWaitForSettings.actions
			});
		}
	};
});
