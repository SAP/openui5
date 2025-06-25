/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.utils._MenuUtils.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Static collection of utility functions related to menus of sap.ui.table.Table, ...
	 *
	 * Note: Do not access the functions of this helper directly, but via <code>sap.ui.table.utils.TableUtils.Menu...</code>
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @namespace
	 * @alias sap.ui.table.utils._MenuUtils
	 * @private
	 */
	const MenuUtils = {

		TableUtils: null, // Avoid cyclic dependency. Will be filled by TableUtils

		/**
		 * Opens the context menu of a column header or a content cell.
		 *
		 * If a column header cell or an element inside a column header cell is the event target, the context menu of this column is opened.
		 * If a content cell or an element inside a content cell is the event target, then the context menu of this content cell is opened.
		 * The context menu is not be opened if the configuration of the table does not allow it, or an event handler prevents default.
		 *
		 * Fires the <code>beforeOpenContextMenu</code> event when a custom content cell context menu should be opened.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table
		 * @param {jQuery.Event} oEvent The event object
		 */
		openContextMenu: function(oTable, oEvent) {
			const $Cell = MenuUtils.TableUtils.getCell(oTable, oEvent.target);
			const oCellInfo = MenuUtils.TableUtils.getCellInfo($Cell);

			if (oCellInfo.isOfType(MenuUtils.TableUtils.CELLTYPE.COLUMNHEADER)) {
				oTable.getColumns()[oCellInfo.columnIndex]._openHeaderMenu(oCellInfo.cell);
				oEvent.preventDefault();
			} else if (oCellInfo.isOfType(MenuUtils.TableUtils.CELLTYPE.ANYCONTENTCELL)) {
				MenuUtils._openContentCellContextMenu(oTable, oCellInfo, oEvent);
			}
		},

		/**
		 * Opens the context menu of a content cell.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {sap.ui.table.utils.TableUtils.CellInfo} oCellInfo Cell info.
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		_openContentCellContextMenu: function(oTable, oCellInfo, oEvent) {
			const oRow = oTable.getRows()[oCellInfo.rowIndex];

			if (oRow.isEmpty()) {
				return;
			}

			if (oTable.getContextMenu() && !oRow.isGroupHeader() && !oRow.isSummary()) {
				MenuUtils._openCustomContentCellContextMenu(oTable, oTable.getContextMenu(), oCellInfo, oEvent);
			} else if (oTable.getAggregation("groupHeaderRowContextMenu") && oRow.isGroupHeader()) {
				MenuUtils._openCustomContentCellContextMenu(oTable, oTable.getAggregation("groupHeaderRowContextMenu"), oCellInfo, oEvent);
			} else {
				MenuUtils._openDefaultContentCellContextMenu(oTable, oCellInfo, oEvent);
			}
		},

		/**
		 * Opens the custom context menu of a content cell.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {sap.ui.core.IContextMenu} oContextMenu Instance of the context menu to open.
		 * @param {sap.ui.table.utils.TableUtils.CellInfo} oCellInfo Cell info.
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		_openCustomContentCellContextMenu: function(oTable, oContextMenu, oCellInfo, oEvent) {
			const oRow = oTable.getRows()[oCellInfo.rowIndex];

			oContextMenu.setBindingContext(MenuUtils.TableUtils.getBindingContextOfRow(oRow), oTable.getBindingInfo("rows").model);

			const bExecuteDefault = oTable.fireBeforeOpenContextMenu({
				rowIndex: oRow.getIndex(),
				columnIndex: oCellInfo.columnIndex >= 0 ? oCellInfo.columnIndex : null,
				contextMenu: oContextMenu
			});

			if (bExecuteDefault) {
				oContextMenu.openAsContextMenu(oEvent, oCellInfo.cell);
				oEvent.preventDefault();
			}
		},

		/**
		 * Opens the default context menu of a content cell.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {sap.ui.table.utils.TableUtils.CellInfo} oCellInfo Cell info.
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		_openDefaultContentCellContextMenu: function(oTable, oCellInfo, oEvent) {
			const oRow = oTable.getRows()[oCellInfo.rowIndex];
			const oColumn = oTable.getColumns()[oCellInfo.columnIndex];
			const oContextMenu = oTable._getDefaultContextMenu();

			oContextMenu.initContent(oRow, oColumn);

			if (!oContextMenu.isEmpty()) {
				oContextMenu.open(oEvent, oCellInfo.cell);
				oEvent.preventDefault();
			}
		},

		/**
		 * Closes the currently open content cell context menu.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @private
		 */
		closeContentCellContextMenu: function(oTable) {
			// sap.ui.core.IContextMenu does not have a "close" method.
			oTable.getContextMenu()?.close?.();
			oTable.getAggregation("groupHeaderRowContextMenu")?.close?.();
			oTable._getDefaultContextMenu()?.close?.();
		}
	};

	return MenuUtils;

});