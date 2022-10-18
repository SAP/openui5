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
		return this.waitFor({
			controlType: "sap.ui.mdc.Field",
			id: oSettings.id,
			properties: oSettings.properties,
			matchers: oSettings.matchers,
			actions: oSettings.actions,
			success: function(vFields) {
				var aFields = [].concat(vFields);
				Opa5.assert.strictEqual(aFields.length, 1, "The field was found with settings " + JSON.stringify(oSettings));

				if (typeof oSettings.success === "function") {
					var oField = aFields[0];
					oSettings.success.call(this, oField);
				}
			},
			errorMessage: "The field was not found"
		});
	};
});
