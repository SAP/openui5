/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"./waitForFilterField"
], function(
	Opa5,
	Ancestor,
	waitForFilterField
) {
	"use strict";

	return function waitForFilterFieldValueHelpButton(oSettings) {

		return waitForFilterField.call(this, {
			properties: oSettings.properties,
			success: onFilterFieldFound
		});

		function onFilterFieldFound(oFilterField) {
			var sValueHelpButtonID = oFilterField.getId() + "-inner-vhi";

			this.waitFor({
				id: sValueHelpButtonID,
				controlType: "sap.ui.core.Icon",
				matchers: new Ancestor(oFilterField),
				actions: oSettings.actions,
				success: function(oValueHelpIconButton) {
					Opa5.assert.ok(oValueHelpIconButton, "The filter field value help button was found");

					if (typeof oSettings.success === "function") {
						oSettings.success.call(this, oValueHelpIconButton);
					}
				},
				errorMessage: "The filter field value help button could not be found"
			});
		}
	};
});
