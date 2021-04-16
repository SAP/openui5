/*
 * ! ${copyright}
 */

sap.ui.define([
	'sap/ui/mdc/p13n/Engine', './ItemBaseFlex'
], function(Engine, ItemBaseFlex) {
	"use strict";

	var ColumnFlex = Object.assign({}, ItemBaseFlex);

	// Rebind triggered on the Control only during runtime JS change
	var fRebindControl = function(oControl) {
		if (oControl && oControl.isA && oControl.isA("sap.ui.mdc.Table") && oControl.isTableBound()) {
			if (!oControl._bWaitForBindChanges) {
				oControl._bWaitForBindChanges = true;
				Engine.getInstance().waitForChanges(oControl).then(function() {
					oControl.checkAndRebind();
					delete oControl._bWaitForBindChanges;
				});

			}
		}
	};

	ColumnFlex.findItem = function(oModifier, aColumns, sName) {
		return aColumns.find(function(oColumn) {
			var sDataProperty = oModifier.getProperty(oColumn, "dataProperty");
			return sDataProperty === sName;
		});
	};

	ColumnFlex.afterApply = function(sChangeType, oTable, bIsRevert) {
		fRebindControl(oTable);
	};

	ColumnFlex.addColumn = ColumnFlex.createAddChangeHandler();
	ColumnFlex.removeColumn = ColumnFlex.createRemoveChangeHandler();
	ColumnFlex.moveColumn = ColumnFlex.createMoveChangeHandler();

	return ColumnFlex;

});
