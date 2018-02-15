/*!
 * ${copyright}
 */

// Provides helper sap.ui.table.TableMenuUtils.
sap.ui.define(['jquery.sap.global', 'sap/ui/Device', 'sap/ui/unified/Menu', 'sap/ui/unified/MenuItem', 'sap/ui/core/Popup'],
	function(jQuery, Device, Menu, MenuItem, Popup) {
		"use strict";

		// Table uses z-indices, ensure that popups starts their z-indices at least with 20.
		Popup.setInitialZIndex(10);

		/**
		 * Static collection of utility functions related to menus of sap.ui.table.Table, ...
		 *
		 * Note: Do not access the function of this helper directly but via <code>sap.ui.table.TableUtils.Menu...</code>
		 *
		 * @author SAP SE
		 * @version ${version}
		 * @namespace
		 * @alias sap.ui.table.TableMenuUtils
		 * @private
		 */
		var MenuUtils = {

			TableUtils : null, // Avoid cyclic dependency. Will be filled by TableUtils

			/**
			 * Opens the context menu of a column or a data cell.
			 * If a column header cell or an element inside a column header cell is passed as the parameter <code>oElement</code>,
			 * the context menu of this column will be opened. If a data cell or an element inside a data cell is passed, then the context menu
			 * of this data cell will be opened.
			 * The context menu will not be opened, if the configuration of the table does not allow it, or one of the event handlers attached to the
			 * events <code>ColumnSelect</code> or <code>CellContextmenu</code> calls preventDefault().
			 *
			 * On mobile devices, when trying to open a column context menu, a column header cell menu is created instead with buttons to actually
			 * open the column context menu or to resize the column. If this function is called when this cell menu already exists, then it is closed
			 * and the column context menu is opened.
			 *
			 * @param {sap.ui.table.Table} oTable Instance of the table.
			 * @param {jQuery|HtmlElement} oElement The header or data cell, or an element inside, for which to open the context menu.
			 * @param {boolean} [bHoverFirstMenuItem] If <code>true</code>, the first item in the opened menu will be hovered.
			 * @param {boolean} [bFireEvent=true] If <code>true</code>, an event will be fired.
			 * 									  Fires the <code>ColumnSelect</code> event when a column context menu should be opened.
			 * 									  Fires the <code>CellContextmenu</code> event when a data cell context menu should be opened.
			 * @param {jQuery.Event} oEvent Event object.
			 * @see	openColumnContextMenu
			 * @see closeColumnContextMenu
			 * @see	openDataCellContextMenu
			 * @see closeDataCellContextMenu
			 * @see	applyColumnHeaderCellMenu
			 * @see removeColumnHeaderCellMenu
			 * @private
			 */
			openContextMenu: function(oTable, oElement, bHoverFirstMenuItem, bFireEvent, oEvent) {
				if (oTable == null || oElement == null) {
					return;
				}
				if (bFireEvent == null) {
					bFireEvent = true;
				}

				var $Target = jQuery(oElement);

				var $TableCell = MenuUtils.TableUtils.getCell(oTable, $Target);
				if ($TableCell === null) {
					return;
				}

				var oCellInfo = MenuUtils.TableUtils.getCellInfo($TableCell);
				var iColumnIndex = oCellInfo.columnIndex;
				var iRowIndex = oCellInfo.rowIndex;
				var bExecuteDefault;

				if (oCellInfo.isOfType(MenuUtils.TableUtils.CELLTYPE.COLUMNHEADER)) {
					var bCellHasMenuButton = $TableCell.find(".sapUiTableColDropDown").length > 0;

					if (Device.system.desktop || bCellHasMenuButton) {
						MenuUtils.removeColumnHeaderCellMenu(oTable, iColumnIndex);
						bExecuteDefault = true;

						if (bFireEvent) {
							bExecuteDefault = oTable.fireColumnSelect({
								column: oTable.getColumns()[iColumnIndex]
							});
						}

						if (bExecuteDefault) {
							MenuUtils.openColumnContextMenu(oTable, iColumnIndex, bHoverFirstMenuItem, $TableCell);
						}
					} else {
						MenuUtils.applyColumnHeaderCellMenu(oTable, iColumnIndex, $TableCell);
					}

				} else if (oCellInfo.isOfType(MenuUtils.TableUtils.CELLTYPE.ANYCONTENTCELL)) {
					bExecuteDefault = true;

					if (bFireEvent) {
						var oRowColCell = MenuUtils.TableUtils.getRowColCell(oTable, iRowIndex, iColumnIndex, iColumnIndex >= 0);
						var oRow = oRowColCell.row;

						var oRowBindingContext;
						var oRowBindingInfo = oTable.getBindingInfo("rows");
						if (oRowBindingInfo != null) {
							oRowBindingContext = oRow.getBindingContext(oRowBindingInfo.model);
						}

						var oRowContextMenu = oTable.getContextMenu();
						if (oRowContextMenu) {
							oRowContextMenu.setBindingContext(oRowBindingContext);
						}

						if (iColumnIndex >= 0) {
							bExecuteDefault = oTable.fireCellContextmenu({
								rowIndex: oRow.getIndex(),
								columnIndex: iColumnIndex,
								columnId: oRowColCell.column.getId(),
								cellControl: oRowColCell.cell,
								rowBindingContext: oRowBindingContext,
								cellDomRef: $TableCell[0]
							});
						}

						// fire beforeOpenContextMenu event if the default is not prevented in the cellContextMenu event
						if (bExecuteDefault) {
							bExecuteDefault = oTable.fireBeforeOpenContextMenu({
								rowIndex: oRow.getIndex(),
								columnIndex: oRowColCell.column === null ? null : iColumnIndex,
								contextMenu: oRowContextMenu
							});
						}
					}

					if (bExecuteDefault) {
						MenuUtils.openDataCellContextMenu(oTable, oCellInfo, bHoverFirstMenuItem, oEvent);
					}
				}
			},

			/**
			 * Opens the context menu of a column.
			 * If context menus of other columns are open, they will be closed.
			 *
			 * @param {sap.ui.table.Table} oTable Instance of the table.
			 * @param {int} iColumnIndex The index of the column to open the context menu on.
			 * @param {boolean} [bHoverFirstMenuItem] If <code>true</code>, the first item in the opened menu will be hovered.
			 * @param {jQuery} oCell The column header cell to which the menu should be attached.
			 * @see openContextMenu
			 * @see closeColumnContextMenu
			 * @private
			 */
			openColumnContextMenu: function(oTable, iColumnIndex, bHoverFirstMenuItem, oCell) {
				if (oTable == null ||
					iColumnIndex == null || iColumnIndex < 0) {
					return;
				}
				if (bHoverFirstMenuItem == null) {
					bHoverFirstMenuItem = false;
				}

				var oColumns = oTable.getColumns();
				if (iColumnIndex >= oColumns.length) {
					return;
				}

				var oColumn = oColumns[iColumnIndex];
				if (!oColumn.getVisible()) {
					return;
				}

				// Close all menus.
				for (var i = 0; i < oColumns.length; i++) {
					// If column menus of other columns are open, close them.
					if (oColumns[i] !== oColumn) {
						MenuUtils.closeColumnContextMenu(oTable, i);
					}
				}
				MenuUtils.closeDataCellContextMenu(oTable);

				var colspan = oCell && oCell.attr("colspan");
				if (colspan && colspan !== "1") {
					return; // headers with span do not have connection to a column, do not open the context menu
				}

				oColumn._openMenu(oCell && oCell[0] || oColumn.getDomRef(), bHoverFirstMenuItem);
			},

			/**
			 * Closes the context menu of a column.
			 *
			 * @param {sap.ui.table.Table} oTable Instance of the table.
			 * @param {int} iColumnIndex The index of the column to close the context menu on.
			 * @see openContextMenu
			 * @see openColumnContextMenu
			 * @private
			 */
			closeColumnContextMenu: function(oTable, iColumnIndex) {
				if (oTable == null ||
					iColumnIndex == null || iColumnIndex < 0) {
					return;
				}

				var oColumns = oTable.getColumns();
				if (iColumnIndex >= oColumns.length) {
					return;
				}

				var oColumn = oColumns[iColumnIndex];
				var oMenu = oColumn.getMenu();

				oMenu.close();
			},

			/**
			 * Opens the context menu of a data cell.
			 * If a context menu of another data cell is open, it will be closed.
			 *
			 * @param {sap.ui.table.Table} oTable Instance of the table.
			 * @param {sap.ui.table.TableUtils.CellInfo} oCellInfo An object containing information about the cell.
			 * @param {boolean} [bHoverFirstMenuItem] If <code>true</code>, the first item in the opened menu will be hovered.
			 * @param {jQuery.Event} oEvent event object
			 * @see openContextMenu
			 * @see closeDataCellContextMenu
			 * @private
			 */
			openDataCellContextMenu: function(oTable, oCellInfo, bHoverFirstMenuItem, oEvent) {
				if (oTable == null ||
					oCellInfo == null ||
					oCellInfo.cell == null || oCellInfo.rowIndex >= MenuUtils.TableUtils.getNonEmptyVisibleRowCount(oTable)) {
					return;
				}

				var iColumnIndex = oCellInfo.columnIndex;
				var iRowIndex = oCellInfo.rowIndex;

				if (bHoverFirstMenuItem == null) {
					bHoverFirstMenuItem = false;
				}

				var oColumns = oTable.getColumns();
				if (iColumnIndex >= oColumns.length) {
					return;
				}

				var oColumn = oColumns[iColumnIndex];
				if (oColumn && !oColumn.getVisible()) {
					return;
				}

				var oRow = oTable.getRows()[iRowIndex];

				// Filtering or the contextMenu aggregation are possible as the cell context menu
				if (MenuUtils.hasContextMenu(oTable)) {
					var $row = oRow.$();
					var bSumRow = $row.hasClass("sapUiAnalyticalTableSum");
					var bGroupHeader = $row.hasClass("sapUiTableGroupHeader");
					if (!bSumRow && !bGroupHeader) {
						oTable.getContextMenu().openAsContextMenu(oEvent, oCellInfo.cell);
					}
				} else if (oTable.getEnableCellFilter() && oColumn && oColumn.isFilterableByMenu()) {
					// Create the menu instance the first time it is needed.
					if (oTable._oCellContextMenu == null) {

						oTable._oCellContextMenu = new Menu(oTable.getId() + "-cellcontextmenu");

						var oCellContextMenuItem = new MenuItem({
							text: oTable._oResBundle.getText("TBL_FILTER")
						});

						oCellContextMenuItem._onSelect = function (oColumn, iRowIndex) {
							// "this" is the table instance.
							var oRowContext = this.getContextByIndex(iRowIndex);
							var sFilterProperty = oColumn.getFilterProperty();
							var sFilterValue = oRowContext.getProperty(sFilterProperty);

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
						oTable.addDependent(oTable._oCellContextMenu);

					// If the menu already was created, only update the menu item.
					} else {
						var oMenuItem = oTable._oCellContextMenu.getItems()[0];
						oMenuItem.mEventRegistry.select[0].fFunction = oMenuItem._onSelect.bind(oTable, oColumn, oRow.getIndex());
					}

					// Open the menu below the cell if is is not already open.
					var oCell =  oRow.getCells()[iColumnIndex];
					var $Cell =  MenuUtils.TableUtils.getParentCell(oTable, oCell.getDomRef());

					if ($Cell !== null && !MenuUtils.TableUtils.Grouping.isInGroupingRow($Cell)) {
						oCell = $Cell[0];

						var bMenuOpenAtAnotherDataCell = oTable._oCellContextMenu.bOpen && oTable._oCellContextMenu.oOpenerRef !== oCell;
						if (bMenuOpenAtAnotherDataCell) {
							MenuUtils.closeDataCellContextMenu(oTable);
						}

						for (var i = 0; i < oColumns.length; i++) {
							MenuUtils.closeColumnContextMenu(oTable, i);
						}

						oTable._oCellContextMenu.open(bHoverFirstMenuItem, oCell, Popup.Dock.BeginTop, Popup.Dock.BeginBottom, oCell, "none none");
					}
				}
			},

			/**
			 * Closes the currently open data cell context menu.
			 * Index information are not required as there is only one data cell context menu object and therefore only this one can be open.
			 *
			 * @param {sap.ui.table.Table} oTable Instance of the table.
			 * @see openContextMenu
			 * @see openDataCellContextMenu
			 * @private
			 */
			closeDataCellContextMenu: function(oTable) {
				if (oTable == null) {
					return;
				}

				var oMenu = oTable._oCellContextMenu;
				var bMenuOpen = oMenu != null && oMenu.bOpen;

				if (bMenuOpen) {
					oMenu.close();
				}
			},

			/**
			 * Destroys the cell context menu.
			 *
			 * @param {sap.ui.table.Table} oTable Instance of the table.
			 * @private
			 */
			cleanupDataCellContextMenu: function(oTable) {
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
			 * @param {int} iColumnIndex The column index of the column header to insert the cell menu in.
			 * @see openContextMenu
			 * @see removeColumnHeaderCellMenu
			 * @private
			 */
			applyColumnHeaderCellMenu: function(oTable, iColumnIndex, $TableCell) {
				if (oTable == null ||
					iColumnIndex == null || iColumnIndex < 0) {
					return;
				}

				var oColumns = oTable.getColumns();
				if (iColumnIndex >= oColumns.length) {
					return;
				}

				var colspan = $TableCell && $TableCell.attr("colspan");
				if (colspan && colspan !== "1") {
					return; // headers with span do not have connection to a column, do not open the context menu
				}

				var oColumn = oColumns[iColumnIndex];

				if (oColumn.getVisible() && (oColumn.getResizable() || oColumn._menuHasItems())) {
					var $Column = $TableCell || oColumn.$();
					var $ColumnCell = $Column.find(".sapUiTableColCell");
					var bCellMenuAlreadyExists = $Column.find(".sapUiTableColCellMenu").length > 0;

					if (!bCellMenuAlreadyExists) {
						MenuUtils.removeColumnHeaderCellMenu(oTable); // First remove any existing column header cell menu of another column.
						$ColumnCell.hide();

						var sColumnContextMenuButton = "";
						if (oColumn._menuHasItems()) {
							sColumnContextMenuButton = "<div class='sapUiTableColDropDown'></div>";
						}

						var sColumnResizerButton = "";
						if (oColumn.getResizable()) {
							sColumnResizerButton = "<div class='sapUiTableColResizer''></div>";
						}

						var $ColumnCellMenu = jQuery("<div class='sapUiTableColCellMenu'>" + sColumnContextMenuButton + sColumnResizerButton + "</div>");

						$Column.append($ColumnCellMenu);

						$Column.on("focusout",
							function(oTable, iColumnIndex) {
								MenuUtils.removeColumnHeaderCellMenu(oTable);
								this.off("focusout");
							}.bind($Column, oTable, iColumnIndex)
						);
					}
				}
			},

			/**
			 * Removes a cell menu from a column header cell.
			 * Removes the cell menu from the dom and unhides the column header cell.
			 *
			 * @param {sap.ui.table.Table} oTable Instance of the table.
			 * @see openContextMenu
			 * @see applyColumnHeaderCellMenu
			 * @private
			 */
			removeColumnHeaderCellMenu: function(oTable) {
				var $ColumnCellMenu = oTable && oTable.$().find(".sapUiTableCHT .sapUiTableColCellMenu");
				if ($ColumnCellMenu.length) {
					$ColumnCellMenu.parent().find(".sapUiTableColCell").show();
					$ColumnCellMenu.remove();
				}
			},

			/**
			 * Returns true if the old filter data cell context menu is used.
			 * @param {sap.ui.table.Table} oTable Table instance.
			 * @returns {boolean} true/false if Table and contextMenu aggregation is available.
			 * @see openContextMenu
			 * @private
			 */
			hasContextMenu: function(oTable) {
				return oTable && oTable.getContextMenu();
			}
		};

		return MenuUtils;

}, /* bExport= */ true);