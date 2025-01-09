/*!
 * ${copyright}
 */

sap.ui.define([
	"./ContextMenu",
	"../library",
	"../utils/TableUtils",
	"sap/ui/core/library",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem"
], function(
	ContextMenu,
	Library,
	TableUtils,
	CoreLibrary,
	Menu,
	MenuItem
) {
	"use strict";

	const SortOrder = CoreLibrary.SortOrder;
	const GroupEventType = Library.GroupEventType;
	const aBasicItemKeys = [
		"ungroup",
		"collapse",
		"expand"
	];

	/**
	 * Constructor for a new AnalyticalTableContextMenu.
	 *
	 * @class
	 * @extends sap.ui.table.menus.ContextMenu
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @alias sap.ui.table.menus.AnalyticalTableContextMenu
	 */
	const AnalyticalTableContextMenu = ContextMenu.extend("sap.ui.table.menus.AnalyticalTableContextMenu", {
		metadata: {
			library: "sap.ui.table"
		}
	});

	AnalyticalTableContextMenu.prototype.init = function() {
		Menu.prototype.init.apply(this, arguments);
		this._mItems = new Map();
	};

	AnalyticalTableContextMenu.prototype.initContent = function(oRow, oColumn) {
		ContextMenu.prototype.initContent.apply(this, arguments);

		const oMenu = this.getMenu();
		const oTable = this.getTable();
		const bExtendedMenu = !!oTable.getProperty("extendedGroupHeaderMenu");

		if (!oRow.isGroupHeader()) {
			this._mItems.values().forEach((oMenuItem) => oMenuItem.setVisible(false));
			return;
		}

		this._iGroupLevel = oRow.getLevel();

		if (this._mItems.size === 0) {
			this._createItems(oTable);
		}

		for (const [sKey, oMenuItem] of this._mItems.entries()) {
			oMenuItem.setVisible(aBasicItemKeys.includes(sKey) ? true : bExtendedMenu);

			if (!oMenu.getItems().includes(oMenuItem)) {
				oMenu.addItem(oMenuItem);
			}
		}

		if (!bExtendedMenu) {
			// Invisible items don't need to be updated.
			return;
		}

		const oGroupedColumn = getGroupedColumn(oTable, this._iGroupLevel);
		const [oMoveUpItem, oMoveDownItem] = this._mItems.get("move").getSubmenu().getItems();
		const oVisibilityItem = this._mItems.get("visibility");

		if (oGroupedColumn) {
			if (oGroupedColumn.getShowIfGrouped()) {
				oVisibilityItem.setText(TableUtils.getResourceText("TBL_HIDE_COLUMN"));
			} else {
				oVisibilityItem.setText(TableUtils.getResourceText("TBL_SHOW_COLUMN"));
			}
			oMoveUpItem.setEnabled(this._iGroupLevel > 1);
			oMoveDownItem.setEnabled(this._iGroupLevel < oTable._aGroupedColumns.length);
		} else {
			oMoveUpItem.setEnabled(true);
			oMoveDownItem.setEnabled(true);
		}
	};

	AnalyticalTableContextMenu.prototype._createItems = function(oTable) {
		this._mItems.set("ungroup", this._createUngroupItem(oTable));
		this._mItems.set("collapse", this._createCollapseItem(oTable));
		this._mItems.set("expand", this._createExpandItem(oTable));
		this._mItems.set("visibility", this._createVisibilityItem(oTable));
		this._mItems.set("move", this._createMoveItem(oTable));
		this._mItems.set("sort", this._createSortItem(oTable));
	};

	AnalyticalTableContextMenu.prototype._createUngroupItem = function(oTable) {
		return new MenuItem({
			text: TableUtils.getResourceText("TBL_UNGROUP"),
			submenu: new Menu({
				items: [
					new MenuItem({
						text: TableUtils.getResourceText("TBL_UNGROUP_LEVEL"),
						select: () => {
							const oColumn = getGroupedColumn(oTable, this._iGroupLevel);

							oColumn.setGrouped(false);
							oTable.fireGroup({
								column: oColumn,
								groupedColumns: oTable._aGroupedColumns,
								type: GroupEventType.ungroup
							});
						}
					}),
					new MenuItem({
						text: TableUtils.getResourceText("TBL_UNGROUP_ALL"),
						select: () => {
							oTable.suspendUpdateAnalyticalInfo();

							for (const oColumn of oTable.getColumns()) {
								oColumn.setGrouped(false);
							}

							oTable.resumeUpdateAnalyticalInfo();
							oTable.fireGroup({column: undefined, groupedColumns: [], type: GroupEventType.ungroupAll});
						}
					})
				]
			})
		});
	};

	AnalyticalTableContextMenu.prototype._createCollapseItem = function(oTable) {
		return new MenuItem({
			text: TableUtils.getResourceText("TBL_COLLAPSE"),
			icon: "sap-icon://collapse-all",
			submenu: new Menu({
				items: [
					new MenuItem({
						text: TableUtils.getResourceText("TBL_COLLAPSE_LEVEL"),
						select: () => {
							// Why -1? Because the "Collapse Level" Menu Entry should collapse TO the given level - 1
							// So collapsing level 1 means actually all nodes up TO level 0 will be collapsed.
							// Potential negative values are handled by the binding.
							oTable.getBinding().collapseToLevel(this._iGroupLevel - 1);
							oTable.setFirstVisibleRow(0); //scroll to top after collapsing (so no rows vanish)
							oTable._getSelectionPlugin().clearSelection();
						}
					}),
					new MenuItem({
						text: TableUtils.getResourceText("TBL_COLLAPSE_ALL"),
						select: () => {
							oTable.getBinding().collapseToLevel(0);
							oTable.setFirstVisibleRow(0); //scroll to top after collapsing (so no rows vanish)
							oTable._getSelectionPlugin().clearSelection();
						}
					})
				]
			})
		});
	};

	AnalyticalTableContextMenu.prototype._createExpandItem = function(oTable) {
		return new MenuItem({
			text: TableUtils.getResourceText("TBL_EXPAND"),
			icon: "sap-icon://expand-all",
			submenu: new Menu({
				items: [
					new MenuItem({
						text: TableUtils.getResourceText("TBL_EXPAND_LEVEL"),
						select: () => {
							oTable.getBinding().expandToLevel(this._iGroupLevel);
							oTable.setFirstVisibleRow(0);
							oTable._getSelectionPlugin().clearSelection();
						}
					}),
					new MenuItem({
						text: TableUtils.getResourceText("TBL_EXPAND_ALL"),
						select: () => {
							oTable.expandAll();
						}
					})
				]
			})
		});
	};

	AnalyticalTableContextMenu.prototype._createVisibilityItem = function(oTable) {
		return new MenuItem({
			text: TableUtils.getResourceText("TBL_SHOW_COLUMN"),
			select: () => {
				const oColumn = getGroupedColumn(oTable, this._iGroupLevel);
				const bShowIfGrouped = oColumn.getShowIfGrouped();

				oColumn.setShowIfGrouped(!bShowIfGrouped);
				oTable.fireGroup({
					column: oColumn,
					groupedColumns: oTable._aGroupedColumns,
					type: (!bShowIfGrouped ? GroupEventType.showGroupedColumn : GroupEventType.hideGroupedColumn)
				});
			}
		});
	};

	AnalyticalTableContextMenu.prototype._createMoveItem = function(oTable) {
		return new MenuItem({
			text: TableUtils.getResourceText("TBL_MOVE"),
			submenu: new Menu({
				items: [
					new MenuItem({
						text: TableUtils.getResourceText("TBL_MOVE_UP"),
						icon: "sap-icon://arrow-top",
						select: () => {
							const oColumn = getGroupedColumn(oTable, this._iGroupLevel);
							const iGroupLevelIndex = this._iGroupLevel - 1;

							if (iGroupLevelIndex > 0) {
								oTable._aGroupedColumns[iGroupLevelIndex] =
									oTable._aGroupedColumns.splice(iGroupLevelIndex - 1, 1, oTable._aGroupedColumns[iGroupLevelIndex])[0];

								oTable.updateAnalyticalInfo();
								oTable.fireGroup({
									column: oColumn,
									groupedColumns: oTable._aGroupedColumns,
									type: GroupEventType.moveUp
								});
							}
						}
					}),
					new MenuItem({
						text: TableUtils.getResourceText("TBL_MOVE_DOWN"),
						icon: "sap-icon://arrow-bottom",
						select: () => {
							const oColumn = getGroupedColumn(oTable, this._iGroupLevel);
							const iGroupLevelIndex = this._iGroupLevel - 1;

							if (iGroupLevelIndex < oTable._aGroupedColumns.length) {
								oTable._aGroupedColumns[iGroupLevelIndex] =
									oTable._aGroupedColumns.splice(iGroupLevelIndex + 1, 1, oTable._aGroupedColumns[iGroupLevelIndex])[0];

								oTable.updateAnalyticalInfo();
								oTable.fireGroup({
									column: oColumn,
									groupedColumns: oTable._aGroupedColumns,
									type: GroupEventType.moveDown
								});
							}
						}
					})
				]
			})
		});
	};

	AnalyticalTableContextMenu.prototype._createSortItem = function(oTable) {
		return new MenuItem({
			text: TableUtils.getResourceText("TBL_SORT"),
			icon: "sap-icon://sort",
			submenu: new Menu({
				items: [
					new MenuItem({
						text: TableUtils.getResourceText("TBL_SORT_ASC"),
						icon: "sap-icon://sort-ascending",
						select: () => {
							oTable.sort(getGroupedColumn(oTable, this._iGroupLevel), SortOrder.Ascending);
						}
					}),
					new MenuItem({
						text: TableUtils.getResourceText("TBL_SORT_DESC"),
						icon: "sap-icon://sort-descending",
						select: () => {
							oTable.sort(getGroupedColumn(oTable, this._iGroupLevel), SortOrder.Descending);
						}
					})
				]
			})
		});
	};

	function getGroupedColumn(oTable, iGroupLevel) {
		return oTable.getColumns().find((oColumn) => oTable._aGroupedColumns[iGroupLevel - 1] === oColumn.getId());
	}

	return AnalyticalTableContextMenu;
});