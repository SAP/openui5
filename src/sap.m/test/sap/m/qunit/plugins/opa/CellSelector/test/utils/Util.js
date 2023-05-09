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
		SelectionMode: {
			None: "None",
			Single: "Single",
			Multi: "MultiToggle"
		},
		waitForTable: function(mSettings) {
			return this.waitFor(Object.assign({
				id: "container-CellSelectorOPA---MyView--table",
				controlType: "sap.ui.table.Table",
				errorMessage: "Could not find table."
			}, mSettings));
		},
		getCell: function(oTable, iRow, iCol) {
			var oRow = oTable.getRows().find(function(oRow) {
				return oRow.getIndex() == iRow;
			});
			var aColumns = oTable.getColumns().filter(function(oColumn) {
				return oColumn.getDomRef();
			});
			var oColumn = aColumns[iCol];

			if (oColumn) {
				return oRow.getCells()[iCol].$().closest(".sapUiTableDataCell")[0];
			}
		},
		getCellRef: function(oCell) {
			return oCell.$().closest(".sapUiTableDataCell")[0];
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
