/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableUtils.
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	/**
	 * Static collection of utility functions related to the sap.ui.table.Table, ...
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @name sap.ui.table.TableUtils
	 * @private
	 */
	var TableUtils = {

		/*
		 * Returns whether the table has a row header or not
		 */
		hasRowHeader : function(oTable) {
			return oTable.getSelectionMode() !== sap.ui.table.SelectionMode.None
					&& oTable.getSelectionBehavior() !== sap.ui.table.SelectionBehavior.RowOnly;
		},

		/*
		 * Returns the number of currently visible columns
		 */
		getVisibleColumnCount : function(oTable) {
			return oTable._getVisibleColumnCount();
		},

		/*
		 * Returns a combined info about the currently focused item (based on the item navigation)
		 */
		getFocusedItemInfo : function(oTable) {
			var oIN = oTable._getItemNavigation();
			if (!oIN) {
				return null;
			}
			return {
				cell: oIN.getFocusedIndex(),
				columnCount: oIN.iColumns,
				cellInRow: oIN.getFocusedIndex() % oIN.iColumns,
				cellCount: oIN.getItemDomRefs().length,
				domRef: oIN.getFocusedDomRef()
			};
		},

		focusItem : function(oTable, iIndex, oEvent) {
			var oIN = oTable._getItemNavigation();
			if (oIN) {
				oIN.focusItem(iIndex, oEvent);
			}
		}

	};

	return TableUtils;

}, /* bExport= */ true);