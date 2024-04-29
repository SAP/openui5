/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"../utils/Util",
	"sap/ui/thirdparty/jquery"
], function(Opa5, Util, jQuery) {
	"use strict";

	return {
		iSeeGridTable: function() {
			return this.waitFor({
				controlType: "sap.ui.table.Table",
				success: function(oTable) {
					Opa5.assert.ok(oTable, "Table is visible");
				},
				errorMessage: "Could not find table."
			});
		},
		iSeeResponsiveTable: function() {
			return this.waitFor({
				controlType: "sap.m.Table",
				success: function(oTable) {
					Opa5.assert.ok(oTable, "Table is visible");
				},
				errorMessage: "Could not find table."
			});
		},
		iSeeCellsSelected: function(mFrom, mTo) {
			return Util.waitForTable.call(this, {
				success: function(oTable) {
					var bAllSelected = true;
					var aRows;
					if (oTable.isA("sap.ui.table.Table")) {
						aRows = oTable.getRows();
					} else {
						aRows = oTable.getItems();
					}

					for (var iRow = 0; iRow < aRows.length; iRow++) {
						var oRow = aRows[iRow];
						var iRowIndex;
						if (oTable.isA("sap.ui.table.Table")) {
							iRowIndex = oRow.getIndex();
						} else {
							iRowIndex = iRow;
						}
						var aCells = oRow.getCells();

						for (var iCol = 0; iCol < aCells.length; iCol++) {
							var bCellState = Util.getCellSelectionState(Util.getCellRef(oTable, aCells[iCol]));
							if (!mFrom || !mTo
								|| (iRowIndex < mFrom.rowIndex || iRowIndex > mTo.rowIndex
								|| iCol < mFrom.colIndex || iCol > mTo.colIndex)) {
								bCellState = !bCellState;
							}

							bAllSelected &&= bCellState;
						}
					}

					var sMessage = `No cells are selected.`;
					if (mFrom || mTo) {
						sMessage = `Cells from ${JSON.stringify(mFrom)} to ${JSON.stringify(mTo)} are selected.`;
					}

					Opa5.assert.ok(bAllSelected, sMessage);
				}
			});
		},
		iSeeCellFocused: function(mFocus) {
			return Util.waitForTable.call(this, {
				success: function(oTable) {
					var oCell = Util.getCell(oTable, mFocus.rowIndex, mFocus.colIndex);
					Opa5.assert.ok(oCell, `Cell (${mFocus.rowIndex}, ${mFocus.colIndex}) exists`);

					var $Cell = jQuery(oCell);
					Opa5.assert.ok($Cell.is(":focus"), `Cell is focused`);
				}
			});
		},
		iSeeRowsSelected: function(iStart, iEnd) {
			return Util.waitForTable.call(this, {
				success: function(oTable) {
					if (oTable.isA("sap.ui.table.Table")) {
						const oSelectionPlugin = Util.getSelectionPlugin(oTable) || oTable;
						const aSelection = oSelectionPlugin.getSelectedIndices();

						if (iStart === undefined || iEnd === undefined) {
							Opa5.assert.equal(aSelection.length, 0, "No rows selected.");
						}

						for (const iSelected of aSelection) {
							Opa5.assert.ok(iSelected >= iStart && iSelected <= iEnd, `Row ${iSelected} is selected.`);
						}
					} else {
						var aItems = oTable.getItems();
						var aSelectedItems = oTable.getSelectedItems();

						if (iStart === undefined || iEnd === undefined) {
							Opa5.assert.equal(aSelectedItems.length, 0, "No rows selected.");
						}

						for (var i = iStart; i <= iEnd; i++) {
							Opa5.assert.ok(aSelectedItems.includes(aItems[i]), `Row ${i} is selected.`);
						}
					}
				}
			});
		},
		iSeeRowFocused: function(mFocus) {
			return Util.waitForTable.call(this, {
				success: function(oTable) {
					var oRow = Util.getRow(oTable, mFocus.rowIndex);
					Opa5.assert.ok(oRow, `Row (${mFocus.rowIndex}) exists`);

					var $Row = jQuery(oRow);
					Opa5.assert.ok($Row.is(":focus"), `Row is focused`);
				}
			});
		},
		iCheckBorderState: function(bIsRow, bIsForward, iExpectedIndex) {
			return Util.waitForTable.call(this, {
				success: function(oTable) {
					const oCellSelector = Util.getCellSelector(oTable);
					const oResizer = oCellSelector._getResizer();
					Opa5.assert.ok(oCellSelector._oCurrentBorder, "Border information exists");
					Opa5.assert.ok(oResizer, "Resizer element exists");

					const mCoords = { row: 0, col: 0 };
					mCoords[bIsRow ? "row" : "col"] = iExpectedIndex;

					const oCell = Util.getCell(oTable, mCoords.row, mCoords.col);
					const oCellRect = oCell.getBoundingClientRect();

					let sType;
					if (bIsForward) {
						sType = bIsRow ? "bottom" : "right";
					} else {
						sType = bIsRow ? "top" : "left";
					}

					const iExpectedPx = parseInt(oResizer.style[bIsRow ? "top" : "left"]);
					Opa5.assert.equal(iExpectedPx, parseInt(oCellRect[sType]), "Border is at correct position");
				}
			});
		},
		iCheckEdgeState: function(bFirstRow, bFirstCol, iExpectedRow, iExpectedCol) {
			return Util.waitForTable.call(this, {
				success: function(oTable) {
					const oCellSelector = Util.getCellSelector(oTable);
					const oResizer = oCellSelector._getResizer();
					Opa5.assert.ok(oCellSelector._oCurrentBorder, "Border information exists");
					Opa5.assert.ok(oResizer, "Resizer element exists");

					const oCell = Util.getCell(oTable, iExpectedRow, iExpectedCol);
					const oCellRect = oCell.getBoundingClientRect();

					const mEdgeStyle = {
						row: bFirstRow ? "top" : "bottom",
						col: bFirstCol ? "left" : "right"
					};
					const iExpectedRowPx = parseInt(oResizer.style.top);
					const iExpectedColPx = parseInt(oResizer.style.left);
					Opa5.assert.equal(iExpectedColPx, parseInt(oCellRect[mEdgeStyle.col]), "Edge is at correct X position");
					Opa5.assert.equal(iExpectedRowPx, parseInt(oCellRect[mEdgeStyle.row]), "Edge is at correct Y position");
				}
			});
		}
	};
});