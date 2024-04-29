/*
 * ! ${copyright}
 */

sap.ui.define([
	"../utils/Util"
], function(Util) {
	"use strict";

	return {
		iLookAtTheScreen: function() {
			return this;
		},
		iFocusCell: function(iRow, iCol) {
			Util.waitForTable.call(this, {
				success: function(oTable) {
					var oCell = Util.getCell(oTable, iRow, iCol);
					oCell.focus();
				}
			});
		},
		iFocusRow: function(iRow) {
			Util.waitForTable.call(this, {
				success: function(oTable) {
					var oRow = Util.getRow(oTable, iRow);
					oRow.focus();
				}
			});
		}
	};
});