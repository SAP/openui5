/*
 * ! ${copyright}
 */

sap.ui.define(["sap/ui/test/Opa5", "sap/ui/core/InvisibleRenderer"], function(Opa5, InvisibleRenderer) {
	"use strict";

	function getPlugin(oTable, sPlugin) {
		return oTable.getDependents().filter((oDependent) => oDependent.isA(sPlugin))[0]
			|| oTable.findElements(false, (oElement) => oElement.isA(sPlugin))[0];
	}

	function getCellDOM(oCell, sClasses) {
		let oCellRef = oCell?.$().closest(sClasses)[0];

		if (!oCellRef) {
			const oInvisibleCell = Opa5.getWindow().document.getElementById(InvisibleRenderer.createInvisiblePlaceholderId(oCell));
			oCellRef = oInvisibleCell?.closest(sClasses);
		}
		return oCellRef;
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
			let oRow, oColumn;
			if (oTable.isA("sap.ui.table.Table")) {
				oRow = oTable.getRows().find(function(oRow) {
					return oRow.getIndex() == iRow;
				});
				const aColumns = oTable.getColumns().filter(function(oColumn) {
					return oColumn.getDomRef();
				});
				oColumn = aColumns[iCol];

				if (oColumn) {
					const oCellRef = getCellDOM(oRow.getCells()[iCol], ".sapUiTableCell");
					return oCellRef;
				}
			} else if (oTable.isA("sap.m.Table")) {
				const oCellRef = getCellDOM(oTable.getItems()[iRow].getCells()[iCol], ".sapMListTblCell");
				return oCellRef;
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
