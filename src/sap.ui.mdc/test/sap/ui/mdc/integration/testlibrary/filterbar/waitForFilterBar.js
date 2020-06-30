/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5"
], function(
	Opa5
) {
	"use strict";

	return function waitForFilterBar(oSettings) {
		oSettings = oSettings || {};

		return this.waitFor({
			controlType: "sap.ui.mdc.FilterBar",
			success: function(aFilterBar) {
				Opa5.assert.strictEqual(aFilterBar.length, 1, "The FilterBar control was found");

				if (typeof oSettings.success === "function") {
					var oFilterBar = aFilterBar[0];
					oSettings.success.call(this, oFilterBar);
				}
			},
			errorMessage: "The FilterBar control was not found"
		});
	};
});
