/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/fl/apply/api/FlexRuntimeInfoAPI', './ItemBaseFlex'
], function(FlexRuntimeInfoAPI, ItemBaseFlex) {
	"use strict";

	var oColumnFlex = Object.assign({}, ItemBaseFlex);

	// Rebind triggered on the Control only during runtime JS change
	var fRebindControl = function(oControl) {
		if (oControl && oControl.isA && oControl.isA("sap.ui.mdc.Table") && oControl.isTableBound()) {
			if (!oControl._bWaitForBindChanges) {
				oControl._bWaitForBindChanges = true;
				FlexRuntimeInfoAPI.waitForChanges({
					element: oControl
				}).then(function() {
					oControl.checkAndRebindTable();
					delete oControl._bWaitForBindChanges;
				});

			}
		}
	};

	oColumnFlex.findItem = function(oModifier, aColumns, sName) {
		return aColumns.find(function(oColumn) {
			var aDataProperties = oModifier.getProperty(oColumn, "dataProperties");
			return aDataProperties[0] === sName;
		});
	};

	oColumnFlex.afterApply = function(sChangeType, oTable, bIsRevert) {
		if (sChangeType === "addColumn" && !bIsRevert || (sChangeType === "removeColumn" && bIsRevert)) {
			fRebindControl(oTable);
		}
	};

	oColumnFlex.addColumn = oColumnFlex.createAddChangeHandler();
	oColumnFlex.removeColumn = oColumnFlex.createRemoveChangeHandler();
	oColumnFlex.moveColumn = oColumnFlex.createMoveChangeHandler();

	return oColumnFlex;

});
