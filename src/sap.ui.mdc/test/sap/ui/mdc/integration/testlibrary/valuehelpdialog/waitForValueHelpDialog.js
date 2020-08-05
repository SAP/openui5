/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5"
], function(
	Opa5
) {
	"use strict";

	return function waitForValueHelpDialog(oSettings) {
		return this.waitFor({
			searchOpenDialogs: true, // search only visible controls inside the static area
			controlType: "sap.m.Dialog",
			properties: oSettings.properties,
			matchers: {
				descendant: {
					controlType: "sap.ui.mdc.field.ValueHelpPanel"
				}
			},
			success: function onSuccess(aValueHelpDialog) {
				Opa5.assert.ok(true, "The value help dialog was found");

				if (typeof oSettings.success === "function") {
					var oValueHelpDialog = aValueHelpDialog[0];
					oSettings.success.call(this, oValueHelpDialog);
				}
			},
			errorMessage: "The value help dialog could not be found"
		});
	};
});
