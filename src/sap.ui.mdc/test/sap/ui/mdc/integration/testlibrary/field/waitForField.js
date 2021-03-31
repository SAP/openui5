/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5"
], function(
	Opa5
) {
	"use strict";

	return function waitForField(oSettings) {
		oSettings = oSettings || {};

		return this.waitFor({
			controlType: "sap.ui.mdc.Field",
			properties: oSettings.properties,
			matchers: {
				// ancestor: {
				// 	controlType: "sap.ui.layout.form.SimpleForm" // "sap.ui.mdc.FilterBar"
				// }
			},
			actions: oSettings.actions,
			check: oSettings.check,
			success: function(aFields) {
				Opa5.assert.strictEqual(aFields.length, 1, "The field was found");

				if (typeof oSettings.success === "function") {
					var oField = aFields[0];
					oSettings.success.call(this, oField);
				}
			},
			errorMessage: "The field was not found"
		});
	};
});
