/*
 * ! ${copyright}
 */

sap.ui.define([
	"../utils/Util"
], function(Util) {
	"use strict";

	return {
		iStartMyApp: function (dir) {
			const sParameter = dir == "LTR" ? "" : "?sap-ui-rtl=true";
			return this.iStartMyAppInAFrame(`./test-resources/sap/m/qunit/plugins/opa/CellSelector/start.html${sParameter}`);
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
		},
		iChangeSelectAllState: function(bEnable) {
			return Util.waitForTable.call(this, {
				success: function(oTable) {
					const oSelectionPlugin = Util.getSelectionPlugin(oTable);
					if (oSelectionPlugin) {
						const iLimit = bEnable ? 0 : 100;
						oSelectionPlugin.setLimit(iLimit);
					} else {
						oTable.setEnableSelectAll(bEnable);
					}
				}
			});
		}
	};
});