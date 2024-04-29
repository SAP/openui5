/*
 * ! ${copyright}
 */

sap.ui.define([
	"../utils/Util"
], function(Util) {
	"use strict";

	return {
		iStartMyGridTableApp: function (dir) {
			const sParameter = dir == "LTR" ? "" : "?sap-ui-rtl=true";
			return this.iStartMyAppInAFrame(`./test-resources/sap/m/qunit/plugins/opa/CellSelector/GridTable/start.html${sParameter}`);
		},
		iStartMyResponsiveTableApp: function (dir) {
			const sParameter = dir == "LTR" ? "" : "?sap-ui-rtl=true";
			return this.iStartMyAppInAFrame(`./test-resources/sap/m/qunit/plugins/opa/CellSelector/ResponsiveTable/start.html${sParameter}`);
		},
		iChangeSelectionMode: function(sSelectionMode) {
			return Util.waitForTable.call(this, {
				success: function(oTable) {
					if (oTable.isA("sap.ui.table.Table")) {
						const oSelectionPlugin = Util.getSelectionPlugin(oTable) ?? oTable;
						oSelectionPlugin.setSelectionMode(sSelectionMode);
					} else {
						oTable.setMode(sSelectionMode);
					}
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
		},
		iChangeMultiSelectMode: function(sMode) {
			return Util.waitForTable.call(this, {
				success: function(oTable) {
					oTable.setMultiSelectMode(sMode);
				}
			});
		},
		iSetPageEnableScrolling: function(bEnable) {
			return Util.waitForTable.call(this, {
				success: function(oTable) {
					oTable.getParent().setEnableScrolling(bEnable);
				}
			});
		}
	};
});