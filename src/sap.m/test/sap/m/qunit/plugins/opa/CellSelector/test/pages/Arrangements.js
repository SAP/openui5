/*
 * ! ${copyright}
 */

sap.ui.define([
	"../utils/Util"
], function(Util) {
	"use strict";

	return {
		iStartMyApp: function () {
			return this.iStartMyAppInAFrame("./test-resources/sap/m/qunit/plugins/opa/CellSelector/start.html");
		},
		iChangeSelectionMode: function(sSelectionMode) {
			return Util.waitForTable.call(this, {
				success: function(oTable) {
					const oSelectionPlugin = Util.getSelectionPlugin(oTable) ?? oTable;
					oSelectionPlugin.setSelectionMode(sSelectionMode);
				}
			});
		},
		iChangeRangeLimit: function(iLimit) {
			return Util.waitForTable.call(this, {
				success: function(oTable) {
					const oCellSelector = Util.getCellSelector(oTable);
					oCellSelector.setRangeLimit(iLimit);
				}
			});
		}
	};
});