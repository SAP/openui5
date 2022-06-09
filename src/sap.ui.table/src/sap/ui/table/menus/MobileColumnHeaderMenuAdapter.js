/*!
 * ${copyright}
 */

sap.ui.define([
	"./ColumnHeaderMenuAdapter",
	"../utils/TableUtils",
	"../library",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/table/columnmenu/QuickSort",
	"sap/m/table/columnmenu/QuickSortItem",
	"sap/m/table/columnmenu/QuickGroup",
	"sap/m/table/columnmenu/QuickGroupItem",
	"sap/m/table/columnmenu/QuickTotal",
	"sap/m/table/columnmenu/QuickTotalItem",
	"sap/m/table/columnmenu/Item",
	"sap/m/table/columnmenu/ActionItem",
	"sap/m/Button",
	"sap/m/Input",
	"sap/ui/core/library",
	"sap/ui/Device"
], function(
	ColumnHeaderMenuAdapter,
	TableUtils,
	library,
	QuickAction,
	QuickSort,
	QuickSortItem,
	QuickGroup,
	QuickGroupItem,
	QuickTotal,
	QuickTotalItem,
	Item,
	ActionItem,
	Button,
	Input,
	CoreLibrary,
	Device
) {
	"use strict";

	/**
	 * Constructor for a new MobileColumnHeaderMenuAdapter.
	 *
	 * @param {sap.ui.table.Column} oColumn Instance of the column
	 *
	 * @class
	 * Provides methods to map and reuse the column menu instance between multiple columns
	 *
	 * @extends sap.ui.table.menus.ColumnHeaderMenuAdapter
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @alias sap.ui.table.menus.MobileColumnHeaderMenuAdapter
	 */
	var MobileColumnHeaderMenuAdapter = ColumnHeaderMenuAdapter.extend("sap.ui.table.menus.MobileColumnHeaderMenuAdapter", /** @lends sap.ui.table.menus.MobileColumnHeaderMenuAdapter.prototype */ {});

	/**
	 * Injects entries to the column menu needed to utilize built-in column features.
	 *
	 * @param {sap.ui.core.IColumnHeaderMenu} oColumnHeaderMenu Instance of the column menu
	 * @param {sap.ui.table.Column} oColumn Instance of the column
	 */
	MobileColumnHeaderMenuAdapter.prototype.injectMenuItems = function(oMenu, oColumn) {
		// For event handlers.
		this._oColumn = oColumn;
		this._oMenu = oMenu;

		this._prepareQuickActions(oMenu, oColumn);
		oMenu.setAggregation("_quickSort", this._oQuickSort);
		oMenu.setAggregation("_quickFilter", this._oQuickFilter);
		oMenu.setAggregation("_quickGroup", this._oQuickGroup);
		oMenu.setAggregation("_quickTotal", this._oQuickTotal);
		oMenu.addAggregation("_quickActions", this._oQuickFreeze);
		oMenu.addAggregation("_quickActions", this._oQuickResize);

		this._prepareItems(oMenu, oColumn);
		oMenu.addAggregation("_items", this._oCustomFilterItem);
	};

	/**
	 * Removes entries from the column menu.
	 *
	 * @param {sap.ui.core.IColumnHeaderMenu} oColumnHeaderMenu Instance of the column menu
	 */
	MobileColumnHeaderMenuAdapter.prototype.removeMenuItems = function(oMenu) {
		delete this._oColumn;
		oMenu.setAggregation("_quickSort");
		oMenu.setAggregation("_quickFilter");
		oMenu.setAggregation("_quickGroup");
		oMenu.setAggregation("_quickTotal");
		oMenu.removeAllAggregation("_quickActions");

		oMenu.removeAllAggregation("_items");
	};

	/**
	 * Executed after the column menu is destroyed. The adapter gets notified using a <code>ManagedObjectObserver</code>.
	 *
	 * @param {sap.ui.core.IColumnHeaderMenu} oColumnHeaderMenu
	 */
	MobileColumnHeaderMenuAdapter.prototype.onAfterMenuDestroyed = function(oColumnHeaderMenu) {
		delete this._oQuickSort;
		delete this._oQuickFreeze;
		delete this._oQuickFilter;
		delete this._oQuickGroup;
		delete this._oQuickTotal;

		delete this._oCustomFilterItem;
	};

	/**
	 * Destroys the instance of the <code>MobileColumnHeaderMenuAdapter</code>.
	 */
	MobileColumnHeaderMenuAdapter.prototype.destroy = function() {
		ColumnHeaderMenuAdapter.prototype.destroy.apply(this, arguments);
		this._destroyQuickActions();
		this._destroyItems();
		delete this._oColumn;
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareQuickActions = function(oMenu, oColumn) {
		var oTable = oColumn._getTable();

		this._prepareQuickSort(oMenu, oColumn);

		if (!oTable.getEnableCustomFilter()) {
			this._prepareQuickFilter(oMenu, oColumn);
		}

		this._prepareQuickGroup(oMenu, oColumn);
		this._prepareQuickTotal(oMenu, oColumn);
		this._prepareQuickFreeze(oMenu, oColumn);
		this._prepareQuickResize(oMenu, oColumn);
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareItems = function(oMenu, oColumn) {
		var oTable = oColumn._getTable();
		if (oTable.getEnableCustomFilter()) {
			this._prepareCustomFilterItem(oMenu, oColumn);
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._destroyQuickActions = function() {
		if (this._oQuickSort) {
			this._oQuickSort.destroy();
			delete this._oQuickSort;
		}

		if (this._oQuickFilter) {
			this._oQuickFilter.destroy();
			delete this._oQuickFilter;
		}

		if (this._oQuickGroup) {
			this._oQuickGroup.destroy();
			delete this._oQuickGroup;
		}

		if (this._oQuickTotal) {
			this._oQuickTotal.destroy();
			delete this._oQuickTotal;
		}

		if (this._oQuickFreeze) {
			this._oQuickFreeze.destroy();
			delete this._oQuickFreeze;
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._destroyItems = function() {
		if (this._oCustomFilterItem) {
			this._oCustomFilterItem.destroy();
			delete this._oCustomFilterItem;
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareQuickSort = function(oMenu, oColumn) {
		if (oColumn.isSortableByMenu()) {
			if (!this._oQuickSort) {
				this._oQuickSort = this._createQuickSort(oMenu);
			}
			this._oQuickSort.getItems()[0].setSortOrder(oColumn.getSorted() ? oColumn.getSortOrder() : CoreLibrary.SortOrder.None);
		} else if (this._oQuickSort) {
			this._oQuickSort.destroy(); // TODO: Should be kept for reuse
			delete this._oQuickSort;
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._createQuickSort = function(oMenu) {
		return new QuickSort({
			items: new QuickSortItem(),
			change: [function(oEvent) {
				var sSortOrder = oEvent.getParameter("item").getSortOrder();

				if (sSortOrder === CoreLibrary.SortOrder.None) {
					this._oColumn._unsort();
				} else {
					this._oColumn.sort(sSortOrder === CoreLibrary.SortOrder.Descending, true);
				}
			}, this]
		});
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareQuickFilter = function(oMenu, oColumn) {
		if (oColumn.getShowFilterMenuEntry() && oColumn.isFilterableByMenu()) {
			if (!this._oQuickFilter) {
				this._oQuickFilter = this._createQuickFilter(oMenu, oColumn);
			}
			var oFilterField = this._oQuickFilter.getContent()[0];
			oFilterField.setValue(oColumn.getFilterValue());
			oFilterField.setValueState(oColumn._getFilterState());
		} else if (this._oQuickFilter) {
			this._oQuickFilter.destroy(); // TODO: Should be kept for reuse
			delete this._oQuickFilter;
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._createQuickFilter = function(oMenu, oColumn) {
		var oBundle = sap.ui.getCore().getLibraryResourceBundle("sap.m");

		return new QuickAction({
			label: oBundle.getText("table.COLUMNMENU_QUICK_FILTER"),
			content: new Input({
				submit: [function(oEvent) {
					this._oColumn.setFilterValue(oEvent.getSource().getValue());
					var sState = this._oColumn._getFilterState();

					if (sState === CoreLibrary.ValueState.None) {
						this._oColumn.filter(oEvent.getSource().getValue());
						this._oMenu.close();
					}

					oEvent.getSource().setValueState(sState);
				}, this]
			})
		});
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareQuickGroup = function(oMenu, oColumn) {
		if (oColumn.isGroupableByMenu()) {
			if (!this._oQuickGroup) {
				this._oQuickGroup = this._createQuickGroup(oMenu);
			}
			this._oQuickGroup.getItems()[0].setGrouped(oColumn.getGrouped());
		} else if (this._oQuickGroup) {
			this._oQuickGroup.destroy(); // TODO: Should be kept for reuse
			delete this._oQuickGroup;
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._createQuickGroup = function(oMenu, oColumn) {
		return new QuickGroup({
			items: new QuickGroupItem({
				label: TableUtils.getResourceText("TBL_GROUP")
			}),
			change: [function(oEvent) {
				this._oColumn._setGrouped(oEvent.getParameter("item").getGrouped());
			}, this]
		});
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareQuickTotal = function(oMenu, oColumn) {
		if (oColumn._isAggregatableByMenu()) {
			if (!this._oQuickTotal) {
				this._oQuickTotal = this._createQuickTotal(oMenu);
			}
			this._oQuickTotal.getItems()[0].setTotaled(oColumn.getSummed());
		} else if (this._oQuickTotal) {
			this._oQuickTotal.destroy(); // TODO: Should be kept for reuse
			delete this._oQuickTotal;
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._createQuickTotal = function(oMenu, oColumn) {
		return new QuickTotal({
			items: new QuickTotalItem({
				label: TableUtils.getResourceText("TBL_TOTAL")
			}),
			change: [function(oEvent) {
				this._oColumn.setSummed(oEvent.getParameter("item").getTotaled());
			}, this]
		});
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareQuickFreeze = function(oMenu, oColumn) {
		var oTable = oColumn._getTable();

		if (oTable.getEnableColumnFreeze()) {
			var bIsLastFixedColumn = oColumn.getIndex() + TableUtils.Column.getHeaderSpan(oColumn) === oTable.getComputedFixedColumnCount();
			var sResourceTextKey = bIsLastFixedColumn ? "TBL_UNFREEZE" : "TBL_FREEZE";

			if (!this._oQuickFreeze) {
				this._oQuickFreeze = this._createQuickFreeze(oMenu, oColumn);
			}
			this._oQuickFreeze.getContent()[0].setText(TableUtils.getResourceText(sResourceTextKey));
		} else if (this._oQuickFreeze) {
			this._oQuickFreeze.destroy(); // TODO: Should be kept for reuse
			delete this._oQuickFreeze;
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._createQuickFreeze = function(oMenu, oColumn) {
		return new QuickAction({
			content: new Button({
				press: [function(oEvent) {
					var oTable = this._oColumn._getTable();
					var bExecuteDefault = oTable.fireColumnFreeze({
						column: this._oColumn
					});

					if (bExecuteDefault) {
						var bIsLastFixedColumn = oEvent.getSource().getText() === TableUtils.getResourceText("TBL_UNFREEZE");

						if (bIsLastFixedColumn) {
							oTable.setFixedColumnCount(0);
						} else {
							oTable.setFixedColumnCount(this._oColumn.getIndex() + 1);
						}
					}

					this._oMenu.close();
				}, this]
			})
		});
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareQuickResize = function(oMenu, oColumn) {
		if (Device.support.touch && oColumn.getResizable()) {
			if (!this._oQuickResize) {
				this._oQuickResize = this._createQuickResize(oMenu, oColumn);
			}
		} else if (this._oQuickResize) {
			this._oQuickResize.destroy();
			delete this._oQuickResize;
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._createQuickResize = function(oMenu, oColumn) {
		return new QuickAction({
			content: new Button({
				icon: "sap-icon://resize-horizontal",
				press: [function(oEvent) {
					this._startColumnResize(oColumn);
					this._oMenu.close();
				}, this]
			})
		});
	};

	MobileColumnHeaderMenuAdapter.prototype._startColumnResize = function(oColumn) {
		var oTable = oColumn._getTable();
		oTable.$().toggleClass("sapUiTableResizing", true);
		oTable._$colResize = oTable.$("rsz");
		oTable._$colResize.toggleClass("sapUiTableColRszActive", true);
	};

	MobileColumnHeaderMenuAdapter.prototype._removeHeaderCellColumnResizer = function(oTable) {
		var $ColumnCellMenu = oTable && oTable.$().find(".sapUiTableCHT .sapUiTableCellTouchMenu");
		if ($ColumnCellMenu.length) {
			$ColumnCellMenu.parent().find(".sapUiTableCellInner").show();
			$ColumnCellMenu.remove();
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareCustomFilterItem = function(oMenu, oColumn) {
		if (oColumn.getShowFilterMenuEntry()) {
			if (!this._oCustomFilterItem) {
				this._oCustomFilterItem = this._createCustomFilterItem(oMenu);
			}
		} else if (this._oCustomFilterItem) {
			this._oCustomFilterItem.destroy(); // TODO: Should be kept for reuse
			delete this._oCustomFilterItem;
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._createCustomFilterItem = function(oMenu, oColumn) {
		return new ActionItem({
			label: TableUtils.getResourceText("TBL_FILTER_ITEM"),
			icon: "sap-icon://filter",
			press: [function(oEvent) {
				this._oColumn._getTable().fireCustomFilter({
					column: this._oColumn
				});
			}, this]
		});
	};

	return MobileColumnHeaderMenuAdapter;
});