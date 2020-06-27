/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5"
], function(
	Opa5
) {
	"use strict";

	return function waitForFilterField(oSettings) {
		oSettings = oSettings || {};

		return this.waitFor({
			controlType: "sap.ui.mdc.FilterField",
			properties: oSettings.properties,
			matchers: {
				ancestor: {
					controlType: "sap.ui.mdc.FilterBar"
				}
			},
			actions: oSettings.actions,
			check: oSettings.check,
			success: function(aFilterFields) {
				Opa5.assert.strictEqual(aFilterFields.length, 1, "The filter field was found");

				if (typeof oSettings.success === "function") {
					var oFilterField = aFilterFields[0];
					oSettings.success.call(this, oFilterField);
				}
			},
			errorMessage: "The filter field was not found"
		});
	};
});
