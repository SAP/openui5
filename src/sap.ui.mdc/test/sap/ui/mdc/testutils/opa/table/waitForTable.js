/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5"
], function(
	Opa5
) {
	"use strict";

	/**
	 * Waits for the MDCTable instance has been found.
	 *
	 * @param {String|sap.ui.mdc.Table} [oControl] Id or control instance of the MDCTable
	 * @param {Object} [oSettings] Additional function call parameters
	 * @param {function} [oSettings.success] call-back success function
	 * @returns {Promise} OPA waitFor
	 */
	return function waitForTable(oControl, oSettings) {
		var sTableId;

		if (oControl) {
			if (typeof oControl !== "string" || oControl.isA && !oControl.isA("sap.ui.mdc.Table")){
				oSettings = oControl;
			} else {
				sTableId = typeof oControl === "string" ? oControl : oControl.getId();
			}
		}

		return this.waitFor({
			id: sTableId,
			controlType: "sap.ui.mdc.Table",
			success: function(oTable) {
				Opa5.assert.ok('The mdc.Table was found');

				if (oSettings && typeof oSettings.success === "function") {
					/*
					 * If neither the Id nor the control instance of the MDCTable is passed as parameter
					 * the success callback of the waitFor will returns the founded controls as an Array[].
					 */
					if (oTable.length) {
						oTable = oTable[0];
					}
					oSettings.success.call(this, oTable);
				}
			},
			errorMessage: "The mdc.Table was not found",
			timeout: 40
		});
	};
});
