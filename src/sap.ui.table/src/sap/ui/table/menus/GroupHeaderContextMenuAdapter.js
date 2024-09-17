/*!
 * ${copyright}
 */

sap.ui.define([
	"../library",
	"sap/ui/base/Object",
	"sap/ui/core/library",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem"
], function(Library, BaseObject, CoreLibrary, TableUtils, Menu, MenuItem) {
	"use strict";

	const GroupEventType = Library.GroupEventType;
	const mDefaultItems = [
		"ungroup",
		"collapse",
		"expand"
	];

	/**
	 * Constructor for a new GroupHeaderContextMenuAdapter.
	 *
	 * @class
	 * Class that provides methods to map and reuse the group header menu items.
	 *
	 * @extends sap.ui.base.Object
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @alias sap.ui.table.menus.GroupHeaderContextMenuAdapter
	 */
	const GroupHeaderContextMenuAdapter = BaseObject.extend("sap.ui.table.menus.GroupHeaderContextMenuAdapter", {
		constructor: function(oTable) {
			this._oTable = oTable;
			this._mItems = new Map();
		}
	});

	/**
	 * Adds the predefined <code>MenuItems</code> to the given <code>Menu</code>. If no predefined <code>MenuItem</code> instances exist yet,
	 * they are created. The predefined <code>MenuItem</code> instances will be updated according to the current state of the table.
	 *
	 * @param {sap.ui.unified.Menu} oMenu <code>Menu</code> to which the predefined <code>MenuItem</code> instances are added
	 * @param {boolean} bExtended Flag that defines whether the menu is extended with additional items
	 * @public
	 */
	GroupHeaderContextMenuAdapter.prototype.addItemsTo = function(oMenu, bExtended) {
		if (!this._mItems.size) {
			this._createItems();
		}

		for (const [sKey, oMenuItem] of this._mItems.entries()) {
			if (!mDefaultItems.includes(sKey)) {
				oMenuItem.setVisible(!!bExtended);
			}

			if (!oMenu.getItems().includes(oMenuItem)) {
				oMenu.addItem(oMenuItem);
			}
		}

		if (!bExtended) {
			return;
		}

		const {column: oColumn, index: iIndex} = this._getGroupedColumnInfo();
		const [oMoveUp, oMoveDown] = this._mItems.get("move").getSubmenu().getItems();
		const oVisibilityItem = this._mItems.get("visibility");

		if (oColumn) {
			if (oColumn.getShowIfGrouped()) {
				oVisibilityItem.setText(TableUtils.getResourceText("TBL_HIDE_COLUMN"));
			} else {
				oVisibilityItem.setText(TableUtils.getResourceText("TBL_SHOW_COLUMN"));
			}
			oMoveUp.setEnabled(iIndex > 0);
			oMoveDown.setEnabled(iIndex < this._oTable._aGroupedColumns.length - 1);
		} else {
			oMoveUp.setEnabled(true);
			oMoveDown.setEnabled(true);
		}
	};

	/**
	 * Removes all predefined <code>MenuItem</code> instances from the given <code>Menu</code>.
	 *
	 * @param {sap.ui.unified.Menu} oMenu <code>Menu</code> from which the predefined <code>MenuItem</code> instances are removed
	 * @public
	 */
	GroupHeaderContextMenuAdapter.prototype.removeItemsFrom = function(oMenu) {
		if (!this._mItems.size) {
			return;
		}

		for (const oMenuItem of this._mItems.values()) {
			oMenu.removeItem(oMenuItem);
		}
	};

	/**
	 * Destroys the instance of the <code>GroupHeaderContextMenuAdapter</code>.
	 *
	 * @public
	 */
	GroupHeaderContextMenuAdapter.prototype.destroy = function() {
		this._mItems?.forEach((oMenuItem) => oMenuItem.destroy());
		this._mItems?.clear();
		this._mItems = null;
		this._oTable = null;
	};

	/**
	 * Creates predefined <code>MenuItem</code> instances for the group header context menu.
	 *
	 * @private
	 */
	GroupHeaderContextMenuAdapter.prototype._createItems = function() {
		const oTable = this._oTable;

		this._mItems.set("ungroup", new MenuItem({
			text: TableUtils.getResourceText("TBL_UNGROUP"),
			submenu: [
				new Menu({
					items: [
						new MenuItem({
							text: TableUtils.getResourceText("TBL_UNGROUP_LEVEL"),
							select: () => {
								const {column: oColumn} = this._getGroupedColumnInfo();

								if (oColumn) {
									oColumn.setGrouped(false);
									oTable.fireGroup({
										column: oColumn,
										groupedColumns: oTable._aGroupedColumns,
										type: GroupEventType.ungroup
									});
								}
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
			]
		}));

		this._mItems.set("collapse", new MenuItem({
			text: TableUtils.getResourceText("TBL_COLLAPSE"),
			icon: "sap-icon://collapse-all",
			submenu: [
				new Menu({
					items: [
						new MenuItem({
							text: TableUtils.getResourceText("TBL_COLLAPSE_LEVEL"),
							select: () => {
								// Why -1? Because the "Collapse Level" Menu Entry should collapse TO the given level - 1
								// So collapsing level 1 means actually all nodes up TO level 0 will be collapsed.
								// Potential negative values are handled by the binding.
								oTable.getBinding().collapseToLevel(oTable._iGroupedLevel - 1);
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
			]
		}));

		this._mItems.set("expand", new MenuItem({
			text: TableUtils.getResourceText("TBL_EXPAND"),
			icon: "sap-icon://expand-all",
			submenu: [
				new Menu({
					items: [
						new MenuItem({
							text: TableUtils.getResourceText("TBL_EXPAND_LEVEL"),
							select: () => {
								oTable.getBinding().expandToLevel(oTable._iGroupedLevel);
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
			]
		}));

		this._mItems.set("visibility", new MenuItem({
			text: TableUtils.getResourceText("TBL_SHOW_COLUMN"),
			select: () => {
				const {column: oColumn} = this._getGroupedColumnInfo();

				if (oColumn) {
					const bShowIfGrouped = oColumn.getShowIfGrouped();
					oColumn.setShowIfGrouped(!bShowIfGrouped);

					oTable.fireGroup({
						column: oColumn,
						groupedColumns: oTable._aGroupedColumns,
						type: (!bShowIfGrouped ? GroupEventType.showGroupedColumn : GroupEventType.hideGroupedColumn)
					});
				}
			}
		}));

		this._mItems.set("move", new MenuItem({
			text: TableUtils.getResourceText("TBL_MOVE"),
			submenu: [
				new Menu({
					items: [
						new MenuItem({
							text: TableUtils.getResourceText("TBL_MOVE_UP"),
							icon: "sap-icon://arrow-top",
							select: () => {
								const {column: oColumn, index: iIndex} = this._getGroupedColumnInfo();

								if (oColumn && iIndex > 0) {
									oTable._aGroupedColumns[iIndex] =
										oTable._aGroupedColumns.splice(iIndex - 1, 1, oTable._aGroupedColumns[iIndex])[0];

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
								const {column: oColumn, index: iIndex} = this._getGroupedColumnInfo();

								if (oColumn && (iIndex < oTable._aGroupedColumns.length)) {
									oTable._aGroupedColumns[iIndex] =
										oTable._aGroupedColumns.splice(iIndex + 1, 1, oTable._aGroupedColumns[iIndex])[0];

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
			]
		}));

		this._mItems.set("sort", new MenuItem({
			text: TableUtils.getResourceText("TBL_SORT"),
			icon: "sap-icon://sort",
			submenu: [
				new Menu({
					items: [
						new MenuItem({
							text: TableUtils.getResourceText("TBL_SORT_ASC"),
							icon: "sap-icon://sort-ascending",
							select: () => {
								this._getGroupedColumnInfo().column?._sort(CoreLibrary.SortOrder.Ascending);
							}
						}),
						new MenuItem({
							text: TableUtils.getResourceText("TBL_SORT_DESC"),
							icon: "sap-icon://sort-descending",
							select: () => {
								this._getGroupedColumnInfo().column?._sort(CoreLibrary.SortOrder.Descending);
							}
						})
					]
				})
			]
		}));
	};

	/**
	 * Identifies the level of the grouped column and returns an object with the index and the <code>Column</code> instance of the grouped column.
	 *
	 * @returns {object}
	 * An object containing the <code>Column</code> and index of the grouped column. If no grouped column is found, the properties <code>column</code>
	 * and <code>index</code> are <code>undefined</code>.
	 */
	GroupHeaderContextMenuAdapter.prototype._getGroupedColumnInfo = function() {
		const oTable = this._oTable;
		const iIndex = oTable._iGroupedLevel - 1;

		const oGroupedColumn = oTable.getColumns().find(function(oColumn) {
			return oTable._aGroupedColumns[iIndex] === oColumn.getId();
		});

		return {
			column: oGroupedColumn,
			index: iIndex
		};

	};

	return GroupHeaderContextMenuAdapter;
});