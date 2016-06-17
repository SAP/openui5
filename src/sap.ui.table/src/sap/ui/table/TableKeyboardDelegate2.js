/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableKeyboardDelegate2.
sap.ui.define(['jquery.sap.global', 'sap/ui/base/Object', './library', './TableExtension', './TableUtils'],
	function(jQuery, BaseObject, library, TableExtension, TableUtils) {
	"use strict";

	/**
	 * New Delegate for keyboard events of sap.ui.table.Table controls.
	 *
	 * @class Delegate for keyboard events of sap.ui.table.Table controls.
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @private
	 * @alias sap.ui.table.TableKeyboardDelegate2
	 */
	var TableKeyboardDelegate = BaseObject.extend("sap.ui.table.TableKeyboardDelegate2", /* @lends sap.ui.table.TableKeyboardDelegate2 */ {

		constructor : function(sType) { BaseObject.call(this); },

		/*
		 * @see sap.ui.base.Object#destroy
		 */
		destroy : function() { BaseObject.prototype.destroy.apply(this, arguments); },

		/*
		 * @see sap.ui.base.Object#getInterface
		 */
		getInterface : function() { return this; }

	});


	/*
	 * Restores the focus to the last known cell position.
	 */
	TableKeyboardDelegate._restoreFocusOnLastFocusedDataCell = function(oTable, oEvent) {
		var oInfo = TableUtils.getFocusedItemInfo(oTable);
		var oLastInfo = oTable._getKeyboardExtension()._getLastFocusedCellInfo();
		TableUtils.focusItem(oTable, oInfo.cellInRow + (oInfo.columnCount * oLastInfo.row), oEvent);
	};


	/*
	 * Sets the focus to the correspondig column header of the last known cell position.
	 */
	TableKeyboardDelegate._setFocusOnColumnHeaderOfLastFocusedDataCell = function(oTable, oEvent) {
		var oInfo = TableUtils.getFocusedItemInfo(oTable);
		TableUtils.focusItem(oTable, oInfo.cellInRow, oEvent);
	};


	/*
	 * Sets the focus to the correspondig column header of the last known cell position.
	 */
	TableKeyboardDelegate._forwardFocusToTabDummy = function(oTable, sTabDummy) {
		oTable._getKeyboardExtension()._setSilentFocus(oTable.$().find("." + sTabDummy));
	};


	//******************************************************************************************


	TableKeyboardDelegate.prototype.onfocusin = function(oEvent) {
		if (oEvent.isMarked("sapUiTableIgnoreFocusIn")) {
			return;
		}

		var $Target = jQuery(oEvent.target);

		if ($Target.hasClass("sapUiTableCtrlBefore")) {
			TableKeyboardDelegate._setFocusOnColumnHeaderOfLastFocusedDataCell(this, oEvent);
		} else if ($Target.hasClass("sapUiTableCtrlAfter")) {
			TableKeyboardDelegate._restoreFocusOnLastFocusedDataCell(this, oEvent);
		}
	};


	TableKeyboardDelegate.prototype.onsaptabnext = function(oEvent) {
		var oInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oInfo.type === TableUtils.CELLTYPES.COLUMNHEADER || oInfo.type === TableUtils.CELLTYPES.COLUMNROWHEADER) {
			TableKeyboardDelegate._restoreFocusOnLastFocusedDataCell(this, oEvent);
			oEvent.preventDefault();
		} else if (oInfo.type === TableUtils.CELLTYPES.DATACELL || oInfo.type === TableUtils.CELLTYPES.ROWHEADER) {
			TableKeyboardDelegate._forwardFocusToTabDummy(this, "sapUiTableCtrlAfter");
		}
	};


	TableKeyboardDelegate.prototype.onsaptabprevious = function(oEvent) {
		var oInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oInfo.type === TableUtils.CELLTYPES.DATACELL || oInfo.type === TableUtils.CELLTYPES.ROWHEADER) {
			if (this.getColumnHeaderVisible()) {
				TableKeyboardDelegate._setFocusOnColumnHeaderOfLastFocusedDataCell(this, oEvent);
				oEvent.preventDefault();
			} else {
				TableKeyboardDelegate._forwardFocusToTabDummy(this, "sapUiTableCtrlBefore");
			}
		}
	};


	TableKeyboardDelegate.prototype.onsapdown = function(oEvent) {
		var oInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oInfo.type === TableUtils.CELLTYPES.DATACELL || oInfo.type === TableUtils.CELLTYPES.ROWHEADER) {
			if (TableUtils.isLastScrollableRow(this, oEvent.target)) {
				var bScrolled = TableUtils.scroll(this, true, false);
				if (bScrolled) {
					oEvent.setMarked("sapUiTableSkipItemNavigation");
				}
			}
		} else if (oInfo.type === TableUtils.CELLTYPES.COLUMNROWHEADER) {
			if (this.getColumnHeaderVisible() && this._getHeaderRowCount() > 1) {
				oEvent.setMarked("sapUiTableSkipItemNavigation");
				//Focus the first row header
				TableUtils.focusItem(this, this._getHeaderRowCount() * (TableUtils.getVisibleColumnCount(this) + 1/*Row Headers*/), oEvent);
			}
		}
	};


	TableKeyboardDelegate.prototype.onsapup = function(oEvent) {
		var oInfo = TableUtils.getCellInfo(oEvent.target) || {};

		if (oInfo.type === TableUtils.CELLTYPES.DATACELL || oInfo.type === TableUtils.CELLTYPES.ROWHEADER) {
			if (TableUtils.isFirstScrollableRow(this, oEvent.target)) {
				var bScrolled = TableUtils.scroll(this, false, false);
				if (bScrolled) {
					oEvent.setMarked("sapUiTableSkipItemNavigation");
				}
			}
		}
	};

	return TableKeyboardDelegate;

});