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
		return this.waitFor({
			controlType: "sap.ui.mdc.FilterField",
			id: oSettings.id,
			properties: oSettings.properties,
			matchers: oSettings.matchers,
			actions: oSettings.actions,
			success: function(vFilterFields) {
				var aFilterFields = [].concat(vFilterFields);
				Opa5.assert.strictEqual(aFilterFields.length, 1, "The field was found with settings " + JSON.stringify(oSettings));

				if (typeof oSettings.success === "function") {
					var oFilterField = aFilterFields[0];
					oSettings.success.call(this, oFilterField);
				}
			},
			errorMessage: "The filter field was not found"
		});
	};
});
