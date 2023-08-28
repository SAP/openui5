/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.utils._MenuUtils.
sap.ui.define([
	"sap/ui/Device",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem",
	"sap/ui/core/Popup"
], function(Device, Menu, MenuItem, Popup) {
	"use strict";

	function onCellFilterSelect(oColumn, oRow) {
		// "this" is the table instance.
		var oRowContext = oRow.getRowBindingContext();
		var sFilterProperty = oColumn.getFilterProperty();
		var sFilterValue = oRowContext.getProperty(sFilterProperty);

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
	var MenuUtils = {

		TableUtils: null, // Avoid cyclic dependency. Will be filled by TableUtils

		/**
		 * Opens the context menu of a column header or a content cell.
		 *
		 * If a column header cell or an element inside a column header cell is passed as the parameter <code>oElement</code>,
		 * the context menu of this column will be opened. If a content cell or an element inside a content cell is passed, then the context menu
		 * of this content cell will be opened.
		 * The context menu will not be opened if the configuration of the table does not allow it, or one of the event handlers attached to the
		 * events <code>ColumnSelect</code> or <code>CellContextmenu</code> calls <code>preventDefault()</code>.
		 *
		 * Fires the <code>ColumnSelect</code> event when a column context menu should be opened.
		 * Fires the <code>CellContextmenu</code> event when a content cell context menu should be opened.
		 *
		 * When passing an event object, context menus for content cells can be opened at the cursor's location. Otherwise the context menu is
		 * docked to <code>oElement</code> (see {@link sap.ui.unified.Menu#openAsContextMenu}).
		 *
		 * On mobile devices, when trying to open a column context menu, a column header cell menu is created instead with buttons to actually
		 * open the column context menu or to resize the column. If this function is called when this cell menu already exists, then it is closed
		 * and the column context menu is opened.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {jQuery | HTMLElement} oElement The header or content cell, or an element inside, for which to open the context menu.
		 * @param {jQuery.Event} [oEvent] The event object.
		 * @returns {boolean} Whether a context menu was opened.
		 * @see _openColumnContextMenu
		 * @see _openContentCellContextMenu
		 * @see _applyColumnHeaderCellMenu
		 */
		openContextMenu: function(oTable, oElement, oEvent) {
			if (!oTable || !oElement) {
				return false;
			}

			var $Cell = MenuUtils.TableUtils.getCell(oTable, oElement);
			var oCell = $Cell ? $Cell[0] : null;
			var oCellInfo = MenuUtils.TableUtils.getCellInfo(oCell);
			var iColumnIndex = oCellInfo.columnIndex;
			var iRowIndex = oCellInfo.rowIndex;
			var bExecuteDefault = true;

			if (oCellInfo.isOfType(MenuUtils.TableUtils.CELLTYPE.COLUMNHEADER)) {
				var oColumn = oTable.getColumns()[iColumnIndex];

				oColumn._openHeaderMenu(oCell);
				return true;

			} else if (oCellInfo.isOfType(MenuUtils.TableUtils.CELLTYPE.ANYCONTENTCELL)) {
				var oRowColCell = MenuUtils.TableUtils.getRowColCell(oTable, iRowIndex, iColumnIndex, iColumnIndex >= 0);
				var oRow = oRowColCell.row;
				var oRowBindingContext;
				var oRowBindingInfo = oTable.getBindingInfo("rows");

				if (oRowBindingInfo) {
					oRowBindingContext = oRow.getBindingContext(oRowBindingInfo.model);
				}

				// fire beforeOpenContextMenu event
				var oRowContextMenu = oTable.getContextMenu();

				if (oRowContextMenu && oRowBindingInfo) {
					oRowContextMenu.setBindingContext(oRowBindingContext, oRowBindingInfo.model);
				}

				bExecuteDefault = oTable.fireBeforeOpenContextMenu({
					rowIndex: oRow.getIndex(),
					columnIndex: oRowColCell.column ? iColumnIndex : null,
					contextMenu: oRowContextMenu
				});

				if (bExecuteDefault) {
					return MenuUtils._openContentCellContextMenu(oTable, oCell, oEvent);
				} else {
					return true; // We do not know whether the event handler opens a context menu or not, so we just assume it is done.
				}
			}

			return false;
		},

		/**
		 * Opens the context menu of a content cell.
		 * If a context menu of another cell is open, it will be closed.
		 * When passing an event object, context menus for content cells can be opened at the cursor's location. Otherwise the context menu is
		 * docked to <code>oElement</code> (see {@link sap.ui.unified.Menu#openAsContextMenu}).
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {HTMLElement} oCell A content cell.
		 * @param {jQuery.Event} [oEvent] The event object.
		 * @returns {boolean} Whether a context menu was opened.
		 * @private
		 * @see _openCustomContentCellContextMenu
		 * @see _openDefaultContentCellContextMenu
		 */
		_openContentCellContextMenu: function(oTable, oCell, oEvent) {
			var oCellInfo = MenuUtils.TableUtils.getCellInfo(oCell);

			if (oCellInfo.rowIndex >= MenuUtils.TableUtils.getNonEmptyRowCount(oTable)) {
				return false;
			}

			if (MenuUtils.hasCustomContextMenu(oTable)) {
				return MenuUtils._openCustomContentCellContextMenu(oTable, oCell, oEvent);
			} else {
				return MenuUtils._openDefaultContentCellContextMenu(oTable, oCell, oEvent);
			}
		},

		/**
		 * Opens the custom context menu of a content cell.
		 * If a context menu of another cell is open, it will be closed.
		 * When passing an event object, context menus for content cells can be opened at the cursor's location. Otherwise the context menu is
		 * docked to <code>oElement</code> (see {@link sap.ui.unified.Menu#openAsContextMenu}).
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {HTMLElement} oCell A content cell.
		 * @param {jQuery.Event} [oEvent] The event object.
		 * @returns {boolean} Whether a context menu was opened.
		 * @private
		 */
		_openCustomContentCellContextMenu: function(oTable, oCell, oEvent) {
			var oCellInfo = MenuUtils.TableUtils.getCellInfo(oCell);
			var oRow = oTable.getRows()[oCellInfo.rowIndex];

			if (oRow.isGroupHeader() || oRow.isSummary()) {
				return false;
			}

			var oContextMenu = oTable.getContextMenu();
			MenuUtils._closeDefaultContentCellContextMenu(oTable);

			if (oEvent) {
				oContextMenu.openAsContextMenu(oEvent, oCell);
			} else if (typeof oContextMenu.openBy === "function") {
				oContextMenu.openBy(oCell);
			} else {
				oContextMenu.open(null, oCell, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oCell);
			}

			return true;
		},

		/**
		 * Opens the default context menu of a content cell.
		 * If a context menu of another cell is open, it will be closed.
		 * When passing an event object, context menus for content cells can be opened at the cursor's location. Otherwise the context menu is
		 * docked to <code>oElement</code> (see {@link sap.ui.unified.Menu#openAsContextMenu}).
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {HTMLElement} oCell A content cell.
		 * @param {jQuery.Event} [oEvent] The event object.
		 * @returns {boolean} Whether a context menu was opened.
		 * @private
		 */
		_openDefaultContentCellContextMenu: function(oTable, oCell, oEvent) {
			var oCellInfo = MenuUtils.TableUtils.getCellInfo(oCell);
			var iRowIndex = oCellInfo.rowIndex;
			var oRow = oTable.getRows()[iRowIndex];
			var iColumnIndex = oCellInfo.columnIndex;
			var aColumns = oTable.getColumns();
			var oColumn = aColumns[iColumnIndex];

			if (!oTable._oCellContextMenu) {
				oTable._oCellContextMenu = new Menu(oTable.getId() + "-cellcontextmenu");
			}

			var sCellFilterMenuItemId = oTable._oCellContextMenu.getId() + "-cellfilter";
			var oCellFilterMenuItem = sap.ui.getCore().byId(sCellFilterMenuItemId);

			if (oTable.getEnableCellFilter() && oColumn && oColumn.isFilterableByMenu() && !oRow.isGroupHeader()) {
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

			MenuUtils.TableUtils.Hook.call(oTable, MenuUtils.TableUtils.Hook.Keys.Table.OpenMenu, oCellInfo, oTable._oCellContextMenu);

			if (oTable._oCellContextMenu.getItems().length === 0) {
				return false;
			}

			MenuUtils._closeCustomContentCellContextMenu(oTable);

			if (oEvent) {
				oTable._oCellContextMenu.openAsContextMenu(oEvent, oCell);
			} else {
				oTable._oCellContextMenu.open(null, oCell, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oCell);
			}

			return true;
		},

		/**
		 * Closes the currently open content cell context menu.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @private
		 * @see _closeCustomContentCellContextMenu
		 * @see _closeDefaultContentCellContextMenu
		 */
		_closeContentCellContextMenu: function(oTable) {
			MenuUtils._closeCustomContentCellContextMenu(oTable);
			MenuUtils._closeDefaultContentCellContextMenu(oTable);
		},

		/**
		 * Closes the currently open custom content cell context menu.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @private
		 */
		_closeCustomContentCellContextMenu: function(oTable) {
			var oCustomMenu = oTable.getContextMenu();
			var bCustomContextMenuOpen = oCustomMenu ? oCustomMenu.isOpen() : false;

			if (bCustomContextMenuOpen) {
				oCustomMenu.close();
			}
		},

		/**
		 * Closes the currently open default content cell context menu.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @private
		 */
		_closeDefaultContentCellContextMenu: function(oTable) {
			var oDefaultMenu = oTable._oCellContextMenu;
			var bDefaultMenuOpen = oDefaultMenu ? oDefaultMenu.isOpen() : false;

			if (bDefaultMenuOpen) {
				oDefaultMenu.close();
			}
		},

		/**
		 * Destroys the default content cell context menu.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 */
		cleanupDefaultContentCellContextMenu: function(oTable) {
			if (!oTable || !oTable._oCellContextMenu) {
				return;
			}

			var sCellFilterMenuItemId = oTable._oCellContextMenu.getId() + "-cellfilter";
			var oCellFilterMenuItem = sap.ui.getCore().byId(sCellFilterMenuItemId);

			// We don't want to destroy items which were added, for example, by hooks. The owners of the items are responsible for them.
			oTable._oCellContextMenu.removeAllItems();
			oTable._oCellContextMenu.destroy();
			oTable._oCellContextMenu = null;

			// Destroy the items of the table.
			if (oCellFilterMenuItem) {
				oCellFilterMenuItem.destroy();
			}
		},

		/**
		 * Checks whether a custom context menu (contextMenu aggregation) is applied to the table.
		 *
		 * @param {sap.ui.table.Table} oTable Table instance.
		 * @returns {boolean} Whether a custom context menu is applied to the table.
		 */
		hasCustomContextMenu: function(oTable) {
			return oTable != null && oTable.getContextMenu() != null;
		}
	};

	return MenuUtils;

}, /* bExport= */ true);