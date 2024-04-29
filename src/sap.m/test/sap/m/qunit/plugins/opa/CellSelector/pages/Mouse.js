/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"../utils/Util"
], function(Opa5, Util) {
	"use strict";

	function triggerMouseEvent(oTarget, sEventName, oParams) {
		Opa5.getUtils().triggerEvent(sEventName, oTarget, oParams);
	}

	function selectCell(oTarget) {
		triggerMouseEvent(oTarget, "mousedown", { ctrlKey: true, button: 0 });
		triggerMouseEvent(oTarget, "mouseup");
	}

	function getBorderCellRect(oTable, sDirection, mFrom, mTo, bRTL) {
		let mBorder = mFrom;

		if (sDirection == "bottom" || sDirection == "right") {
			mBorder = mTo;
			if (bRTL) {
				mBorder.colIndex = mFrom.colIndex;
			}
		} else if (bRTL && sDirection == "left") {
			mBorder.colIndex = mTo.colIndex;
		}

		const oCellRef = Util.getCell(oTable, mBorder.rowIndex, mBorder.colIndex);
		return oCellRef.getBoundingClientRect();
	}

	// Emulates a mousemove event
	function mousemove(oTable, oTarget, oParams) {
		const oCellSelector = Util.getCellSelector(oTable);
		const oEvent = Object.assign({ type: "mousemove", target: oTarget, preventDefault: () => {}, stopImmediatePropagation: () => {} }, oParams);
		oCellSelector._onmousemove(oEvent);
	}

	Opa5.createPageObjects({
		Mouse: {
			actions: {
				iSelectDeselectCell: function(iRow, iCol) {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							const oCellRef = Util.getCell(oTable, iRow, iCol);
							selectCell(oCellRef);
						}
					});
				},
				iPressCell: function(iRow, iCol) {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							const oCellRef = Util.getCell(oTable, iRow, iCol);
							triggerMouseEvent(oCellRef, "mousedown", { button: 0 });
						}
					});
				},
				iExtendTo: function(iRow, iCol, bRelease) {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							const oCellRef = Util.getCell(oTable, iRow, iCol);
							mousemove(oTable, oCellRef);
							if (bRelease) {
								triggerMouseEvent(oCellRef, "mouseup");
							}
						}
					});
				},
				iHoverBorder: function(sDirection, mFrom, mTo, bRtl) {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							const oCellRect = getBorderCellRect(oTable, sDirection, mFrom, mTo, bRtl);

							mousemove(oTable, oTable.getDomRef(), {
								clientX: oCellRect[sDirection],
								clientY: oCellRect[sDirection]
							});
						}
					});
				},
				iExtendBorderTo: function(sDirection, mFrom, mTo, mTarget, bRtl) {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							const oCellRect = getBorderCellRect(oTable, sDirection, mFrom, mTo, bRtl);

							mousemove(oTable, oTable.getDomRef(), {
								clientX: oCellRect[sDirection],
								clientY: oCellRect[sDirection]
							});

							const oCellSelector = Util.getCellSelector(oTable);
							const oCellRef = Util.getCell(oTable, mTarget.rowIndex, mTarget.colIndex);

							// Emulate border down
							oCellSelector._onborderdown();
							mousemove(oTable, oCellRef);
							triggerMouseEvent(oCellRef, "mouseup");
						}
					});
				},
				iHoverEdge: function(bFirstRow, bFirstCol, mEdgeCell) {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							const oCellRef = Util.getCell(oTable, mEdgeCell.rowIndex, mEdgeCell.colIndex);
							const oCellRect = oCellRef.getBoundingClientRect();

							const mEdgeStyle = {
								row: bFirstRow ? "top" : "bottom",
								col: bFirstCol ? "left" : "right"
							};

							mousemove(oTable, oTable.getDomRef(), {
								clientX: oCellRect[mEdgeStyle.col],
								clientY: oCellRect[mEdgeStyle.row]
							});
						}
					});
				},
				iExtendEdgeTo: function(bFirstRow, bFirstCol, mEdgeCell, mTarget) {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							const oCellRef = Util.getCell(oTable, mEdgeCell.rowIndex, mEdgeCell.colIndex);
							const oCellRect = oCellRef.getBoundingClientRect();

							const mEdgeStyle = {
								row: bFirstRow ? "top" : "bottom",
								col: bFirstCol ? "left" : "right"
							};

							mousemove(oTable, oTable.getDomRef(), {
								clientX: oCellRect[mEdgeStyle.col],
								clientY: oCellRect[mEdgeStyle.row]
							});

							const oCellSelector = Util.getCellSelector(oTable);
							const oTarget = Util.getCell(oTable, mTarget.rowIndex, mTarget.colIndex);
							oCellSelector._onborderdown();
							mousemove(oTable, oTarget);
							triggerMouseEvent(oTarget, "mouseup");
						}
					});
				}
			}
		}
	});
});