/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"./waitForField"
], function(
	Opa5,
	Ancestor,
	waitForField
) {
	"use strict";

	return function waitForFieldValueHelpButton(oSettings) {

		return waitForField.call(this, {
			properties: oSettings.properties,
			success: onFieldFound
		});

		function onFieldFound(oField) {
			var sValueHelpButtonID = oField.getId() + "-inner-vhi";

			this.waitFor({
				id: sValueHelpButtonID,
				controlType: "sap.ui.core.Icon",
				matchers: new Ancestor(oField),
				actions: oSettings.actions,
				success: function(oValueHelpIconButton) {
					Opa5.assert.ok(oValueHelpIconButton, "The field value help button was found");

					if (typeof oSettings.success === "function") {
						oSettings.success.call(this, oValueHelpIconButton);
					}
				},
				errorMessage: "The field value help button could not be found"
			});
		}
	};
});
