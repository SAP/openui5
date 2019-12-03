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

	// Table uses z-indices, ensure that popups starts their z-indices at least with 20.
	Popup.setInitialZIndex(10);

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
				var bCellHasMenuButton = oCell.querySelector(".sapUiTableColDropDown") !== null;

				if (Device.system.desktop || bCellHasMenuButton) {
					MenuUtils._removeColumnHeaderCellMenu(oTable);
					bExecuteDefault = oTable.fireColumnSelect({
						column: oTable.getColumns()[iColumnIndex]
					});

					if (bExecuteDefault) {
						return MenuUtils._openColumnContextMenu(oTable, oCell);
					} else {
						return true; // We do not know whether the event handler opens a context menu or not, so we just assume it is done.
					}
				} else {
					return MenuUtils._applyColumnHeaderCellMenu(oTable, oCell);
				}

			} else if (oCellInfo.isOfType(MenuUtils.TableUtils.CELLTYPE.ANYCONTENTCELL)) {
				var oRowColCell = MenuUtils.TableUtils.getRowColCell(oTable, iRowIndex, iColumnIndex, iColumnIndex >= 0);
				var oRow = oRowColCell.row;
				var oRowBindingContext;
				var oRowBindingInfo = oTable.getBindingInfo("rows");

				if (oRowBindingInfo) {
					oRowBindingContext = oRow.getBindingContext(oRowBindingInfo.model);
				}

				if (iColumnIndex >= 0) {
					bExecuteDefault = oTable.fireCellContextmenu({
						rowIndex: oRow.getIndex(),
						columnIndex: iColumnIndex,
						columnId: oRowColCell.column.getId(),
						cellControl: oRowColCell.cell,
						rowBindingContext: oRowBindingContext,
						cellDomRef: oCell
					});
				}

				// fire beforeOpenContextMenu event if the default is not prevented in the cellContextMenu event
				if (bExecuteDefault) {
					var oRowContextMenu = oTable.getContextMenu();

					if (oRowContextMenu && oRowBindingInfo) {
						oRowContextMenu.setBindingContext(oRowBindingContext, oRowBindingInfo.model);
					}

					bExecuteDefault = oTable.fireBeforeOpenContextMenu({
						rowIndex: oRow.getIndex(),
						columnIndex: oRowColCell.column ? iColumnIndex : null,
						contextMenu: oRowContextMenu
					});
				}

				if (bExecuteDefault) {
					return MenuUtils._openContentCellContextMenu(oTable, oCell, oEvent);
				} else {
					return true; // We do not know whether the event handler opens a context menu or not, so we just assume it is done.
				}
			}

			return false;
		},

		/**
		 * Opens the context menu of a column.
		 * If context menus of other columns are open, they will be closed.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {HTMLElement} oCell The column header cell to which the menu should be attached.
		 * @returns {boolean} Whether a context menu was opened.
		 * @private
		 * @see sap.ui.table.Column#_openMenu
		 */
		_openColumnContextMenu: function(oTable, oCell) {
			var oCellInfo = MenuUtils.TableUtils.getCellInfo(oCell);
			var aColumns = oTable.getColumns();
			var oColumn = aColumns[oCellInfo.columnIndex];

			// Close all menus.
			for (var i = 0; i < aColumns.length; i++) {
				// If column menus of other columns are open, close them.
				if (aColumns[i] !== oColumn) {
					MenuUtils._closeColumnContextMenu(oTable, i);
				}
			}
			MenuUtils._closeContentCellContextMenu(oTable);

			var sColspan = oCell.getAttribute("colspan");
			if (sColspan && sColspan !== "1") {
				return false; // headers with span do not have connection to a column, do not open the context menu
			}

			return oColumn._openMenu(oCell);
		},

		/**
		 * Closes the context menu of a column.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {int} iColumnIndex The index of the column to close the context menu on.
		 * @private
		 * @see sap.ui.table.Column#_closeMenu
		 */
		_closeColumnContextMenu: function(oTable, iColumnIndex) {
			oTable.getColumns()[iColumnIndex]._closeMenu();
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

			if (oCellInfo.rowIndex >= MenuUtils.TableUtils.getNonEmptyVisibleRowCount(oTable)) {
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
			if (!MenuUtils.hasCustomContextMenu(oTable)
				|| MenuUtils.TableUtils.Grouping.isInSumRow(oCell)
				|| MenuUtils.TableUtils.Grouping.isInGroupingRow(oCell)) {
				return false;
			}

			var oContextMenu = oTable.getContextMenu();
			var aColumns = oTable.getColumns();

			for (var i = 0; i < aColumns.length; i++) {
				MenuUtils._closeColumnContextMenu(oTable, i);
			}
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

			if (!oTable.getEnableCellFilter() || !oColumn || !oColumn.isFilterableByMenu() || MenuUtils.TableUtils.Grouping.isInGroupingRow(oCell)) {
				return false;
			}

			if (!oTable._oCellContextMenu) {
				// Create the menu instance the first time it is needed.
				oTable._oCellContextMenu = new Menu(oTable.getId() + "-cellcontextmenu");

				var oCellContextMenuItem = new MenuItem({
					text: MenuUtils.TableUtils.getResourceText("TBL_FILTER")
				});

				oCellContextMenuItem._onSelect = function(oColumn, iRowIndex) {
					// "this" is the table instance.
					var oRowContext = this.getContextByIndex(iRowIndex);
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
				};
				oCellContextMenuItem.attachSelect(oCellContextMenuItem._onSelect.bind(oTable, oColumn, oRow.getIndex()));

				oTable._oCellContextMenu.addItem(oCellContextMenuItem);
			} else {
				// If the menu already was created, only update the menu item.
				var oMenuItem = oTable._oCellContextMenu.getItems()[0];
				oMenuItem.mEventRegistry.select[0].fFunction = oMenuItem._onSelect.bind(oTable, oColumn, oRow.getIndex());
			}

			for (var i = 0; i < aColumns.length; i++) {
				MenuUtils._closeColumnContextMenu(oTable, i);
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
			var bCustomContextMenuOpen = oCustomMenu ? oCustomMenu.bOpen : false;

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
			var bDefaultMenuOpen = oDefaultMenu ? oDefaultMenu.bOpen : false;

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

			oTable._oCellContextMenu.destroy();
			oTable._oCellContextMenu = null;
		},

		/**
		 * Applies a cell menu on a column header cell.
		 * Hides the column header cell and inserts an element containing two buttons in its place. One button to open the column context menu and
		 * one to resize the column. These are useful on touch devices.
		 *
		 * <b>Note: Multi Headers are currently not fully supported.</b>
		 * In case of a multi column header the menu will be applied in the first row of the column header. If this column header cell is a span,
		 * then the index of the first column of this span must be provided.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @param {HTMLElement} oCell The column header cell to which the menu should be applied.
		 * @returns {boolean} Whether the cell menu was applied.
		 * @private
		 */
		_applyColumnHeaderCellMenu: function(oTable, oCell) {
			var oCellInfo = MenuUtils.TableUtils.getCellInfo(oCell);
			var oColumn = oTable.getColumns()[oCellInfo.columnIndex];
			var sColspan = oCell.getAttribute("colspan");
			var oCellInner = oCell.querySelector(".sapUiTableCellInner");
			var bCellMenuAlreadyExists = oCell.querySelector(".sapUiTableCellTouchMenu") !== null;

			if (sColspan && sColspan !== "1" // headers with span do not have connection to a column, do not open the context menu
				|| bCellMenuAlreadyExists
				|| (!oColumn.getResizable() && !oColumn._menuHasItems())) {
				return false;
			}

			var oColumnTouchMenu = document.createElement("div");

			MenuUtils._removeColumnHeaderCellMenu(oTable); // First remove any existing column header cell menu of another column.
			oCellInner.style.display = "none";

			if (oColumn._menuHasItems()) {
				var oColumnContextMenuButton;
				oColumnContextMenuButton = document.createElement("div");
				oColumnContextMenuButton.classList.add("sapUiTableColDropDown");
				oColumnContextMenuButton.textContent = "";
				oColumnTouchMenu.appendChild(oColumnContextMenuButton);
			}

			if (oColumn.getResizable()) {
				var oColumnResizerButton;
				oColumnResizerButton = document.createElement("div");
				oColumnResizerButton.classList.add("sapUiTableColResizer");
				oColumnResizerButton.textContent = "";
				oColumnTouchMenu.appendChild(oColumnResizerButton);
			}

			oColumnTouchMenu.classList.add("sapUiTableCellTouchMenu");
			oCell.appendChild(oColumnTouchMenu);

			var onFocusOut = function() {
				MenuUtils._removeColumnHeaderCellMenu(oTable);
				oCell.removeEventListener("focusout", onFocusOut);
			};

			oCell.addEventListener("focusout", onFocusOut);

			return true;
		},

		/**
		 * Removes a cell menu from a column header cell.
		 * Removes the cell menu from the dom and unhides the column header cell.
		 *
		 * @param {sap.ui.table.Table} oTable Instance of the table.
		 * @private
		 */
		_removeColumnHeaderCellMenu: function(oTable) {
			var $ColumnCellMenu = oTable && oTable.$().find(".sapUiTableCHT .sapUiTableCellTouchMenu");
			if ($ColumnCellMenu.length) {
				$ColumnCellMenu.parent().find(".sapUiTableCellInner").show();
				$ColumnCellMenu.remove();
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