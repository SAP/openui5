/*!
 * ${copyright}
 */

sap.ui.define([
	"./ColumnHeaderMenuAdapter",
	"../utils/TableUtils",
	"sap/m/library",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/table/columnmenu/QuickSort",
	"sap/m/table/columnmenu/QuickSortItem",
	"sap/m/table/columnmenu/QuickGroup",
	"sap/m/table/columnmenu/QuickGroupItem",
	"sap/m/table/columnmenu/QuickTotal",
	"sap/m/table/columnmenu/QuickTotalItem",
	"sap/m/table/columnmenu/QuickResize",
	"sap/m/table/columnmenu/ItemContainer",
	"sap/m/table/columnmenu/ActionItem",
	"sap/m/Button",
	"sap/m/Switch",
	"sap/m/Input",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/Device"
], function(
	ColumnHeaderMenuAdapter,
	TableUtils,
	MLibrary,
	QuickAction,
	QuickSort,
	QuickSortItem,
	QuickGroup,
	QuickGroupItem,
	QuickTotal,
	QuickTotalItem,
	QuickResize,
	ItemContainer,
	ActionItem,
	Button,
	Switch,
	Input,
	Library,
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
	const MobileColumnHeaderMenuAdapter = ColumnHeaderMenuAdapter.extend("sap.ui.table.menus.MobileColumnHeaderMenuAdapter",
		/** @lends sap.ui.table.menus.MobileColumnHeaderMenuAdapter.prototype */ {});

	/**
	 * Injects entries to the column menu needed to utilize built-in column features.
	 *
	 * @param {sap.m.table.columnmenu.Menu} oMenu Instance of the column menu
	 * @param {sap.ui.table.Column} oColumn Instance of the column
	 */
	MobileColumnHeaderMenuAdapter.prototype.injectMenuItems = function(oMenu, oColumn) {
		// For event handlers.
		this._oColumn = oColumn;
		this._oMenu = oMenu;

		this._prepareQuickActions(oColumn);
		this._oMenu.addAggregation("_quickActions", this._oQuickSort);
		this._oMenu.addAggregation("_quickActions", this._oQuickFilter);
		this._oMenu.addAggregation("_quickActions", this._oQuickGroup);
		this._oMenu.addAggregation("_quickActions", this._oQuickTotal);
		this._oMenu.addAggregation("_quickActions", this._oQuickFreeze);
		this._oMenu.addAggregation("_quickActions", this._oQuickResize);
		this._oMenu.addAggregation("_quickActions", this._oQuickResizeInput);

		this._prepareItems(oColumn);
		oMenu.addAggregation("_items", this._oItemContainer);
	};

	/**
	 * Removes entries from the column menu.
	 *
	 * @param {sap.m.table.columnmenu.Menu} oMenu Instance of the column menu
	 */
	MobileColumnHeaderMenuAdapter.prototype.removeMenuItems = function(oMenu) {
		delete this._oColumn;
		oMenu.removeAggregation("_quickActions", this._oQuickSort);
		oMenu.removeAggregation("_quickActions", this._oQuickFilter);
		oMenu.removeAggregation("_quickActions", this._oQuickGroup);
		oMenu.removeAggregation("_quickActions", this._oQuickTotal);
		oMenu.removeAggregation("_quickActions", this._oQuickFreeze);
		oMenu.removeAggregation("_quickActions", this._oQuickResize);
		oMenu.removeAggregation("_quickActions", this._oQuickResizeInput);

		oMenu.removeAggregation("_items", this._oItemContainer);
	};

	/**
	 * Executed after the column menu and injected menu items are destroyed.
	 *
	 * @param {sap.m.table.columnmenu.Menu} oMenu Instance of the column menu
	 */
	MobileColumnHeaderMenuAdapter.prototype.onAfterMenuDestroyed = function(oMenu) {
		if (oMenu !== this._oMenu) {
			// No need to remove references if the menu that contains the items lives.
			return;
		}

		delete this._oQuickSort;
		delete this._oQuickFilter;
		delete this._oQuickGroup;
		delete this._oQuickTotal;
		delete this._oQuickFreeze;
		delete this._oQuickResize;
		delete this._oQuickResizeInput;

		delete this._oItemContainer;
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

	MobileColumnHeaderMenuAdapter.prototype._prepareQuickActions = function(oColumn) {
		const oTable = oColumn._getTable();

		this._prepareQuickSort(oColumn);
		if (!oTable.getEnableCustomFilter()) {
			this._prepareQuickFilter(oColumn);
		}
		this._prepareQuickGroup(oColumn);
		this._prepareQuickTotal(oColumn);
		this._prepareQuickFreeze(oColumn);
		this._prepareQuickResize(oColumn);
		this._prepareQuickResizeInput(oColumn);
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareItems = function(oColumn) {
		const oTable = oColumn._getTable();

		if (oTable.getEnableCustomFilter()) {
			this._prepareCustomFilterItem(oColumn);
		}

		if (!this._oItemContainer) {
			this._oItemContainer = new ItemContainer();
		}

		this._oItemContainer.addItem(this._oCustomFilterItem);
	};

	MobileColumnHeaderMenuAdapter.prototype._destroyQuickActions = function() {
		if (this._oQuickSort) {
			this._oQuickSort.destroy();
		}
		if (this._oQuickFilter) {
			this._oQuickFilter.destroy();
		}
		if (this._oQuickGroup) {
			this._oQuickGroup.destroy();
		}
		if (this._oQuickTotal) {
			this._oQuickTotal.destroy();
		}
		if (this._oQuickFreeze) {
			this._oQuickFreeze.destroy();
		}
		if (this._oQuickResize) {
			this._oQuickResize.destroy();
		}
		if (this._oQuickResizeInput) {
			this._oQuickResizeInput.destroy();
		}

		delete this._oQuickSort;
		delete this._oQuickFilter;
		delete this._oQuickGroup;
		delete this._oQuickTotal;
		delete this._oQuickFreeze;
		delete this._oQuickResize;
		delete this._oQuickResizeInput;
	};

	MobileColumnHeaderMenuAdapter.prototype._destroyItems = function() {
		if (this._oItemContainer) {
			this._oItemContainer.destroy();
		}

		delete this._oItemContainer;
		delete this._oCustomFilterItem;
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareQuickSort = function(oColumn) {
		if (oColumn.isSortableByMenu()) {
			if (!this._oQuickSort) {
				this._oQuickSort = this._createQuickSort();
			}
			this._updateQuickSort(oColumn);
			this._oQuickSort.setVisible(true);
		} else if (this._oQuickSort) {
			this._oQuickSort.setVisible(false);
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._createQuickSort = function() {
		return new QuickSort({
			items: new QuickSortItem(),
			change: [function(oEvent) {
				const sSortOrder = oEvent.getParameter("item").getSortOrder();
				this._oColumn._sort(sSortOrder, false);
			}, this]
		});
	};

	MobileColumnHeaderMenuAdapter.prototype._updateQuickSort = function(oColumn) {
		const oItem = this._oQuickSort.getItems()[0];

		oItem.setLabel(TableUtils.Column.getHeaderText(oColumn));
		oItem.setSortOrder(oColumn.getSortOrder());
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareQuickFilter = function(oColumn) {
		if (oColumn.getShowFilterMenuEntry() && oColumn.isFilterableByMenu()) {
			if (!this._oQuickFilter) {
				this._oQuickFilter = this._createQuickFilter(oColumn);
				this._oQuickFilter._bHideLabelColon = true;
			}
			this._updateQuickFilter(oColumn);
			this._oQuickFilter.setVisible(true);
		} else if (this._oQuickFilter) {
			this._oQuickFilter.setVisible(false);
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._createQuickFilter = function() {
		return new QuickAction({
			content: new Input({
				submit: [function(oEvent) {
					this._oColumn.setFilterValue(oEvent.getSource().getValue());
					const sState = this._oColumn._getFilterState();

					if (sState === CoreLibrary.ValueState.None) {
						this._oColumn.filter(oEvent.getSource().getValue());
						this._oMenu.close();
					}

					oEvent.getSource().setValueState(sState);
				}, this]
			}),
			category: MLibrary.table.columnmenu.Category.Filter
		});
	};

	MobileColumnHeaderMenuAdapter.prototype._updateQuickFilter = function(oColumn) {
		const oFilterField = this._oQuickFilter.getContent()[0];

		this._oQuickFilter.setLabel(TableUtils.Column.getHeaderText(oColumn));
		oFilterField.setValue(oColumn.getFilterValue());
		oFilterField.setValueState(oColumn._getFilterState());
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareQuickGroup = function(oColumn) {
		if (oColumn._isGroupableByMenu()) {
			if (!this._oQuickGroup) {
				this._oQuickGroup = this._createQuickGroup();
			}
			this._updateQuickGroup(oColumn);
			this._oQuickGroup.setVisible(true);
		} else if (this._oQuickGroup) {
			this._oQuickGroup.setVisible(false);
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._createQuickGroup = function() {
		return new QuickGroup({
			items: new QuickGroupItem(),
			change: [function(oEvent) {
				const bGrouped = oEvent.getParameter("item").getGrouped();
				const oColumn = this._oColumn;
				const oTable = oColumn._getTable();

				this._oMenu.attachEventOnce("afterClose", function() {
					if (bGrouped && (!oColumn.getShowIfGrouped || !oColumn.getShowIfGrouped())) {
						let oDomRef;

						if (TableUtils.isNoDataVisible(oTable)) {
							oDomRef = oTable.getDomRef("noDataCnt");
						} else {
							oDomRef = oTable.getDomRef("rowsel0");
						}

						if (oDomRef) {
							oDomRef.focus();
						}
					}

					oColumn._setGrouped(bGrouped);
				});
			}, this]
		});
	};

	MobileColumnHeaderMenuAdapter.prototype._updateQuickGroup = function(oColumn) {
		const oItem = this._oQuickGroup.getItems()[0];

		oItem.setLabel(TableUtils.Column.getHeaderText(oColumn));
		oItem.setGrouped(oColumn.getGrouped());
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareQuickTotal = function(oColumn) {
		if (oColumn._isAggregatableByMenu()) {
			if (!this._oQuickTotal) {
				this._oQuickTotal = this._createQuickTotal();
			}
			this._updateQuickTotal(oColumn);
			this._oQuickTotal.setVisible(true);
		} else if (this._oQuickTotal) {
			this._oQuickTotal.setVisible(false);
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._createQuickTotal = function() {
		return new QuickTotal({
			items: new QuickTotalItem(),
			change: [function(oEvent) {
				this._oColumn.setSummed(oEvent.getParameter("item").getTotaled());
			}, this]
		});
	};

	MobileColumnHeaderMenuAdapter.prototype._updateQuickTotal = function(oColumn) {
		const oItem = this._oQuickTotal.getItems()[0];

		oItem.setLabel(TableUtils.Column.getHeaderText(oColumn));
		oItem.setTotaled(oColumn.getSummed());
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareQuickFreeze = function(oColumn) {
		if (oColumn._getTable().getEnableColumnFreeze()) {
			if (!this._oQuickFreeze) {
				this._oQuickFreeze = this._createQuickFreeze();
			}
			this._updateQuickFreeze(oColumn);
			this._oQuickFreeze.setVisible(true);
		} else if (this._oQuickFreeze) {
			this._oQuickFreeze.setVisible(false);
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._createQuickFreeze = function() {
		return new QuickAction({
			label: TableUtils.getResourceText("TBL_FREEZE"),
			content: new Switch({
				customTextOn: " ",
				customTextOff: " ",
				change: [function(oEvent) {
					const oTable = this._oColumn._getTable();
					const bExecuteDefault = oTable.fireColumnFreeze({
						column: this._oColumn
					});

					if (bExecuteDefault) {
						if (oEvent.getSource().getState()) {
							oTable.setFixedColumnCount(this._oColumn.getIndex() + 1);
						} else {
							oTable.setFixedColumnCount(this._oColumn.getIndex());
						}
					}

					this._oMenu.close();
				}, this]
			})
		});
	};

	MobileColumnHeaderMenuAdapter.prototype._updateQuickFreeze = function(oColumn) {
		const bFixed = oColumn.getIndex() + TableUtils.Column.getHeaderSpan(oColumn) <= oColumn._getTable().getComputedFixedColumnCount();
		this._oQuickFreeze.getContent()[0].setState(bFixed);
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareQuickResize = function(oColumn) {
		if (!Device.system.desktop && oColumn.getResizable()) {
			if (!this._oQuickResize) {
				this._oQuickResize = this._createQuickResize(oColumn);
			}
			this._oQuickResize.setVisible(true);
		} else if (this._oQuickResize) {
			this._oQuickResize.setVisible(false);
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._createQuickResize = function(oColumn) {
		const oSapMResourceBundle = Library.getResourceBundleFor("sap.m");
		const sLabel = oSapMResourceBundle.getText("table.COLUMNMENU_RESIZE");

		return new QuickAction({
			label: sLabel,
			content: new Button({
				icon: "sap-icon://resize-horizontal",
				tooltip: sLabel,
				press: [function(oEvent) {
					this._startColumnResize(oColumn);
					this._oMenu.close();
				}, this]
			})
		});
	};

	MobileColumnHeaderMenuAdapter.prototype._startColumnResize = function(oColumn) {
		const oTable = oColumn._getTable();
		oTable.$().toggleClass("sapUiTableResizing", true);
		oTable._$colResize = oTable.$("rsz");
		oTable._$colResize.toggleClass("sapUiTableColRszActive", true);
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareQuickResizeInput = function(oColumn) {
		if (oColumn.getResizable()) {
			if (!this._oQuickResizeInput) {
				this._oQuickResizeInput = this._createQuickResizeInput(oColumn);
			}
			this._updateQuickResizeInput(oColumn);
			this._oQuickResizeInput.setVisible(true);
		} else if (this._oQuickResizeInput) {
			this._oQuickResizeInput.setVisible(false);
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._createQuickResizeInput = function() {
		const oTable = this._oColumn._getTable();
		return new QuickResize({
			change: [function(oEvent) {
				TableUtils.Column.resizeColumn(oTable, this._oColumn, oEvent.getParameter("width"));
			}, this]
		});
	};

	MobileColumnHeaderMenuAdapter.prototype._updateQuickResizeInput = function(oColumn) {
		const oTable = oColumn._getTable();
		this._oQuickResizeInput.setWidth(Math.round(TableUtils.Column.getColumnWidth(oTable, oColumn.getIndex())));
	};

	MobileColumnHeaderMenuAdapter.prototype._removeHeaderCellColumnResizer = function(oTable) {
		const $ColumnCellMenu = oTable && oTable.$().find(".sapUiTableCHT .sapUiTableCellTouchMenu");
		if ($ColumnCellMenu.length) {
			$ColumnCellMenu.parent().find(".sapUiTableCellInner").show();
			$ColumnCellMenu.remove();
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._prepareCustomFilterItem = function(oColumn) {
		if (oColumn.getShowFilterMenuEntry()) {
			if (!this._oCustomFilterItem) {
				this._oCustomFilterItem = this._createCustomFilterItem();
			}
			this._oCustomFilterItem.setVisible(true);
		} else if (this._oCustomFilterItem) {
			this._oCustomFilterItem.setVisible(false);
		}
	};

	MobileColumnHeaderMenuAdapter.prototype._createCustomFilterItem = function() {
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