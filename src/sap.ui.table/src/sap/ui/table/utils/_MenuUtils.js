/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.utils._MenuUtils.
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem"
], function(
	Element,
	Menu,
	MenuItem
) {
	"use strict";

	function onCellFilterSelect(oColumn, oRow) {
		// "this" is the table instance.
		const oRowContext = oRow.getRowBindingContext();
		const sFilterProperty = oColumn.getFilterProperty();
		let sFilterValue = oRowContext.getProperty(sFilterProperty);

		if (sFilterValue != null && typeof sFilterValue !== "string") {
			sFilterValue = sFilterValue.toString();
		}

		if (this.getEnableCustomFilter()) {
			this.fireCustomFilter({
				column: oColumn,
				value: sFilterValue
			});
		} else {
			this.filter(oColumn, sFilterValue);
		}
	}

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
		 * Fires the <code>columnSelect</code> event when a column context menu should be opened.
		 * Fires the <code>beforeOpenContextMenu</code> event when a content cell context menu should be opened.
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
		 * If a context menu of another cell is open, it will be closed.
		 * When passing an event object, context menus for content cells can be opened at the cursor's location. Otherwise the context menu is
		 * docked to <code>oElement</code> (see {@link sap.ui.unified.Menu#openAsContextMenu}).
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

			if (oRow.isGroupHeader() || oRow.isSummary() || !oTable.getContextMenu()) {
				MenuUtils._openDefaultContentCellContextMenu(oTable, oCellInfo, oEvent);
			} else {
				MenuUtils._openCustomContentCellContextMenu(oTable, oCellInfo, oEvent);
			}
		},

		/**
		 * Opens the custom context menu of a content cell.
		 * If a context menu of another cell is open, it will be closed.
		 * When passing an event object, context menus for content cells can be opened at the cursor's location. Otherwise the context menu is
		 * docked to <code>oElement</code> (see {@link sap.ui.unified.Menu#openAsContextMenu}).
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {sap.ui.table.utils.TableUtils.CellInfo} oCellInfo Cell info.
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		_openCustomContentCellContextMenu: function(oTable, oCellInfo, oEvent) {
			const oRow = oTable.getRows()[oCellInfo.rowIndex];
			const oContextMenu = oTable.getContextMenu();

			oContextMenu.setBindingContext(oRow.getRowBindingContext(), oTable.getBindingInfo("rows").model);

			const bExecuteDefault = oTable.fireBeforeOpenContextMenu({
				rowIndex: oRow.getIndex(),
				columnIndex: oCellInfo.columnIndex >= 0 ? oCellInfo.columnIndex : null,
				contextMenu: oContextMenu
			});

			if (bExecuteDefault) {
				oTable.getContextMenu()?.openAsContextMenu(oEvent, oCellInfo.cell);
				oEvent.preventDefault();
			}
		},

		/**
		 * Opens the default context menu of a content cell.
		 * If a context menu of another cell is open, it will be closed.
		 * When passing an event object, context menus for content cells can be opened at the cursor's location. Otherwise the context menu is
		 * docked to <code>oElement</code> (see {@link sap.ui.unified.Menu#openAsContextMenu}).
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {sap.ui.table.utils.TableUtils.CellInfo} oCellInfo Cell info.
		 * @param {jQuery.Event} oEvent The event object.
		 * @private
		 */
		_openDefaultContentCellContextMenu: function(oTable, oCellInfo, oEvent) {
			const iRowIndex = oCellInfo.rowIndex;
			const oRow = oTable.getRows()[iRowIndex];
			const oColumn = oTable.getColumns()[oCellInfo.columnIndex];

			if (!oTable._oCellContextMenu) {
				oTable._oCellContextMenu = new Menu(oTable.getId() + "-cellcontextmenu");
			}

			const sCellFilterMenuItemId = oTable._oCellContextMenu.getId() + "-cellfilter";
			let oCellFilterMenuItem = Element.getElementById(sCellFilterMenuItemId);

			if (oTable.getEnableCellFilter() && oColumn?.isFilterableByMenu() && !oRow.isGroupHeader() && !oRow.isSummary()) {
				if (!oCellFilterMenuItem) {
					oCellFilterMenuItem = new MenuItem({
						id: sCellFilterMenuItemId,
						text: MenuUtils.TableUtils.getResourceText("TBL_FILTER")
					});

					oCellFilterMenuItem._onSelect = onCellFilterSelect.bind(oTable, oColumn, oRow);
					oCellFilterMenuItem.attachSelect(oCellFilterMenuItem._onSelect);
				} else {
					oCellFilterMenuItem.detachSelect(oCellFilterMenuItem._onSelect);
					oCellFilterMenuItem._onSelect = onCellFilterSelect.bind(oTable, oColumn, oRow);
					oCellFilterMenuItem.attachSelect(oCellFilterMenuItem._onSelect);
				}

				// Menu items from the table should be on top.
				oTable._oCellContextMenu.insertItem(oCellFilterMenuItem, 0);
			} else {
				oTable._oCellContextMenu.removeItem(oCellFilterMenuItem);
			}

			MenuUtils.TableUtils.Hook.call(oTable, MenuUtils.TableUtils.Hook.Keys.Table.OpenContextMenu, oCellInfo, oTable._oCellContextMenu);

			if (oTable._oCellContextMenu.getItems().length === 0) {
				return;
			}

			oTable._oCellContextMenu.openAsContextMenu(oEvent, oCellInfo.cell);
			oEvent.preventDefault();
		},

		/**
		 * Closes the currently open content cell context menu.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @private
		 */
		closeContentCellContextMenu: function(oTable) {
			oTable.getContextMenu()?.close?.(); // sap.ui.core.IContextMenu does not contain "close".
			oTable._oCellContextMenu?.close();
		},

		/**
		 * Destroys the default content cell context menu.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		cleanupDefaultContentCellContextMenu: function(oTable) {
			if (!oTable._oCellContextMenu) {
				return;
			}

			// Destroy the items of the table.
			const sCellFilterMenuItemId = oTable._oCellContextMenu.getId() + "-cellfilter";
			Element.getElementById(sCellFilterMenuItemId)?.destroy();

			// We don't want to destroy items which were added, for example, by hooks. The owners of the items are responsible for them.
			oTable._oCellContextMenu.removeAllItems();
			oTable._oCellContextMenu.destroy();
			delete oTable._oCellContextMenu;
		}
	};

	return MenuUtils;

});