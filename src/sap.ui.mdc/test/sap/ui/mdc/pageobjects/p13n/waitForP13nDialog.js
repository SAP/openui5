/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5"
], function(
	Opa5
) {
	"use strict";

	return function waitForP13nDialog(oSettings) {
		var aMatchers = oSettings.matchers ? oSettings.matchers : [];

		return this.waitFor({
			//FilterBar p13n uses live mode which is why we need to distinguish in some cases
			controlType: oSettings && oSettings.liveMode ? "sap.m.Popover" : "sap.m.Dialog",
			matchers: aMatchers,
			actions: oSettings.actions,
			success: function(aP13nDialogs) {
				Opa5.assert.strictEqual(aP13nDialogs.length, 1, 'The P13n Dialog was found');
				if (typeof oSettings.success === "function") {
					var oP13nDialog = aP13nDialogs[0];
					oSettings.success.call(this, oP13nDialog);
				}
			},
			errorMessage: "The P13n Dialog was not found"
		});
	};
});
