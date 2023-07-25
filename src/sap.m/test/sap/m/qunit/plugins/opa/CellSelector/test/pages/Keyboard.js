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

	function navigate(sKey, oDomRef, bShift) {
		Opa5.getUtils().triggerKeydown(oDomRef, sKey, bShift, false, false);
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
							Opa5.getUtils().triggerKeydown(oFocus, KeyCodes.SPACE);
						}
					});
				},
				iRemoveSelection: function() {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							var oFocus = Util.getFocusedElement(oTable);
							Opa5.getUtils().triggerKeydown(oFocus, KeyCodes.A, true, false, true);
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
							Opa5.getUtils().triggerKeyup(oFocus, KeyCodes.SPACE, true);
						}
					});
				},
				iSelectColumns: function() {
					Util.waitForTable.call(this, {
						success: function(oTable) {
							var oFocus = Util.getFocusedElement(oTable);
							Opa5.getUtils().triggerKeyup(oFocus, KeyCodes.SPACE, false, false, true);
						}
					});
				}
			}
		}
	});
});