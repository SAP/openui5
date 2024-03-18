/*
 * ! ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	function getPlugin(oTable, sPlugin) {
		return oTable.getDependents().filter((oDependent) => oDependent.isA(sPlugin))[0]
			|| oTable.findElements(false, (oElement) => oElement.isA(sPlugin))[0];
	}

	return {
		GridTableSelectionMode: {
			None: "None",
			Single: "Single",
			Multi: "MultiToggle"
		},
		ResponsiveTableSelectionMode: {
			None: "None",
			Single: "SingleSelect",
			Multi: "MultiSelect"
		},
		waitForTable: function(mSettings) {
			return this.waitFor({
				controlType: "sap.ui.core.Control",
				matchers: [
					function(oControl) {
						return oControl.isA("sap.ui.table.Table") || oControl.isA("sap.m.Table");
					}
				],
				success: function(aTables) {
					const oTable = aTables[0];
					this.waitFor({
						check: function() {
							if (oTable.isA("sap.ui.table.Table")) {
								return oTable.getBinding("rows").getLength() > 0;
							} else {
								return oTable.getItems().length > 0;
							}
						},
						success: function() {
							return mSettings.success(aTables[0]);
						}
					});
				},
				errorMessage: "Could not find table."
			}, mSettings);
		},
		getRow: function(oTable, iRow) {
			return oTable.getItems()[iRow].$();
		},
		getCell: function(oTable, iRow, iCol) {
			var oRow;
			if (oTable.isA("sap.ui.table.Table")) {
				oRow = oTable.getRows().find(function(oRow) {
					return oRow.getIndex() == iRow;
				});
				var aColumns = oTable.getColumns().filter(function(oColumn) {
					return oColumn.getDomRef();
				});
				var oColumn = aColumns[iCol];

				if (oColumn) {
					return oRow.getCells()[iCol].$().closest(".sapUiTableDataCell")[0];
				}
			} else if (oTable.isA("sap.m.Table")) {
				oRow = oTable.getItems()[iRow];
				return oRow.getCells()[iCol].$().closest(".sapMTblCellFocusable")[0];
			}
		},
		getCellRef: function(oTable, oCell) {
			if (oTable.isA("sap.ui.table.Table")) {
				return oCell.$().closest(".sapUiTableDataCell")[0];
			} else if (oTable.isA("sap.m.Table")) {
				return oCell.$().closest(".sapMTblCellFocusable")[0];
			}
		},
		getCellSelectionState: function(oCellRef) {
			return oCellRef.classList.contains("sapMPluginsCellSelectorSelected");
		},
		getSelectionPlugin: function(oTable) {
			return getPlugin(oTable, "sap.ui.table.plugins.SelectionPlugin");
		},
		getCellSelector: function(oTable) {
			return getPlugin(oTable, "sap.m.plugins.CellSelector");
		},
		getFocusedElement: function(oTable, bCheckCell) {
			return oTable.$().find(":focus") ?? oTable.getDomRef();
		}
	};
});
