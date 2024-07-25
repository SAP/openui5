/*
 * ! ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"../utils/Util",
	"sap/ui/events/KeyCodes"
], function(Opa5, Util, KeyCodes) {
	"use strict";

	var mDirection = {
		horizontal: {
			forward: KeyCodes.ARROW_RIGHT,
			back: KeyCodes.ARROW_LEFT
		},
		vertical: {
			back: KeyCodes.ARROW_UP,
			forward: KeyCodes.ARROW_DOWN
		}
	};

	function pressKey(sKey, oDomRef, bShift, bAlt, bCtrl) {
		Opa5.getUtils().triggerKeydown(oDomRef, sKey, bShift, bAlt, bCtrl);
		Opa5.getUtils().triggerKeyup(oDomRef, sKey, bShift, bAlt, bCtrl);
	}

	function navigate(sKey, oDomRef, bShift) {
		if (bShift) {
			// Required as Range Selection is started only when SHIFT with onkeydown (see KeyboardDelegate)
			Opa5.getUtils().triggerKeydown(oDomRef, KeyCodes.SHIFT);
			Opa5.getUtils().triggerKeydown(oDomRef, "", true, false, false);
		}
		pressKey(sKey, oDomRef, bShift, false, false);
		if (bShift) {
			// Required as Range Selection is started only when SHIFT with onkeydown (see KeyboardDelegate)
			Opa5.getUtils().triggerKeyup(oDomRef, KeyCodes.SHIFT);
		}
	}

	Opa5.createPageObjects({
		Keyboard: {
			actions: {
				/**
				 * Select/Deselect a cell.
				 *
				 * Simulates a SPACE press on the currently focused cell.
				 */
				iSelectDeselectCell: function() {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							var oFocus = Util.getFocusedElement(oTable);
							pressKey(KeyCodes.SPACE, oFocus);
						}
					});
				},
				iRemoveSelection: function(bOnlyCells) {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							var oFocus = Util.getFocusedElement(oTable);
							if (oTable.isA("sap.ui.table.Table")) {
								if (bOnlyCells) {
									Opa5.getUtils().triggerKeydown(oFocus, KeyCodes.ESCAPE, false, false, false);
								} else {
									Opa5.getUtils().triggerKeydown(oFocus, KeyCodes.A, true, false, true);
								}
							} else {
								Opa5.getUtils().triggerKeydown(oFocus, KeyCodes.ESCAPE, false, false, false);
								if (!bOnlyCells) {
									var bCellFocus = oFocus.hasClass("sapMListTblCell");
									if (bCellFocus) {
										Opa5.getUtils().triggerEvent("keydown", Util.getFocusedElement(oTable), {code: "F7"});
									}
									Opa5.getUtils().triggerEvent("keydown", Util.getFocusedElement(oTable), {code: "KeyA", ctrlKey: true, shiftKey: true});
									if (bCellFocus) {
										Opa5.getUtils().triggerEvent("keydown", Util.getFocusedElement(oTable), {code: "F7"});
									}
								}
							}
						}
					});
				},
				iNavigate: function(bIsHorizontal, bIsForward) {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							var sKey = mDirection[bIsHorizontal ? "horizontal" : "vertical"][bIsForward ? "forward" : "back"];
							var oFocus = Util.getFocusedElement(oTable);
							navigate(sKey, oFocus, false);
						}
					});
				},
				/**
				 * Select next cell either horizontally or vertically from source cell.
				 * @param {boolean} bIsHorizontal horizontal direction
				 * @param {boolean} bIsForward forward direction
				 * @param {number} iRow row index
				 * @param {number} iCol col index
				 */
				iSelectNextCell: function(bIsHorizontal, bIsForward) {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							var sKey = mDirection[bIsHorizontal ? "horizontal" : "vertical"][bIsForward ? "forward" : "back"];
							var oFocus = Util.getFocusedElement(oTable);
							navigate(sKey, oFocus, true);
						}
					});
				},
				/**
				 * Select a row.
				 */
				iSelectRows: function() {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							var oFocus = Util.getFocusedElement(oTable);
							pressKey(KeyCodes.SPACE, oFocus, true);
						}
					});
				},
				iSelectRowsWithSpace: function() {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							var oFocus = Util.getFocusedElement(oTable);
							pressKey(KeyCodes.ENTER, oFocus);
						}
					});
				},
				iSelectColumns: function() {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							var oFocus = Util.getFocusedElement(oTable);
							pressKey(KeyCodes.SPACE, oFocus, false, false, true);
						}
					});
				},
				iSelectInnerControl: function() {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							var oFocus = Util.getFocusedElement(oTable);
							Opa5.getUtils().triggerKeydown(oFocus, KeyCodes.F2, false, false, false);
						}
					});
				},
				iSelectAll: function() {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							var oFocus = Util.getFocusedElement(oTable);

							if (oTable.isA("sap.ui.table.Table")) {
								Opa5.getUtils().triggerKeydown(oFocus, KeyCodes.A, false, false, true);
							} else {
								var bCellFocus = oFocus.hasClass("sapMListTblCell");
								if (bCellFocus) {
									Opa5.getUtils().triggerEvent("keydown", Util.getFocusedElement(oTable), {code: "F7"});
								}
								Opa5.getUtils().triggerEvent("keydown", Util.getFocusedElement(oTable), {code: "KeyA", ctrlKey: true});
								if (bCellFocus) {
									Opa5.getUtils().triggerEvent("keydown", Util.getFocusedElement(oTable), {code: "F7"});
								}
							}
						}
					});
				}
			}
		}
	});
});