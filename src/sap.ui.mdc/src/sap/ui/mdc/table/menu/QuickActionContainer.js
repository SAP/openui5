/*!
 * ${copyright}
 */
sap.ui.define([
	"../ResponsiveTableType",
	"../utils/Personalization",
	"sap/m/table/columnmenu/QuickActionContainer",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/table/columnmenu/QuickSort",
	"sap/m/table/columnmenu/QuickSortItem",
	"sap/m/table/columnmenu/QuickGroup",
	"sap/m/table/columnmenu/QuickGroupItem",
	"sap/m/table/columnmenu/QuickTotal",
	"sap/m/table/columnmenu/QuickTotalItem",
	"sap/m/Button",
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/core/Element"
], function(
	ResponsiveTableType,
	PersonalizationUtils,
	QuickActionContainerBase,
	QuickAction,
	QuickSort,
	QuickSortItem,
	QuickGroup,
	QuickGroupItem,
	QuickTotal,
	QuickTotalItem,
	Button,
	Core,
	CoreLibrary,
	Element
) {
	"use strict";

	const QuickActionContainer = QuickActionContainerBase.extend("sap.ui.mdc.table.menu.QuickActionContainer", {
		metadata: {
			library: "sap.ui.mdc",
			associations: {
				table: {type: "sap.ui.mdc.Table"},
				column: {type: "sap.ui.mdc.table.Column"}
			}
		}
	});

	QuickActionContainer.prototype.initializeQuickActions = function() {
		const oTable = this.getTable();
		const oColumn = this.getColumn();
		const oPropertyHelper = oTable.getPropertyHelper();
		const pCreateContent = Promise.resolve();

		this.destroyQuickActions(); // TODO: More efficient update would be good

		if (oTable.isSortingEnabled()) {
			const aSortableProperties = oPropertyHelper.getProperty(oColumn.getPropertyKey()).getSortableProperties();
			const aSortedProperties = oTable._getSortedProperties();

			if (aSortableProperties.length > 0) {
				this.addQuickAction(new QuickSort({
					items: aSortableProperties.map(function(oProperty) {
						let sSortOrder = CoreLibrary.SortOrder.None;
						const mSortCondition = aSortedProperties.find(function(oSortedProperty) {
							return oSortedProperty.name === oProperty.name;
						});

						if (mSortCondition) {
							sSortOrder = mSortCondition.descending ? CoreLibrary.SortOrder.Descending : CoreLibrary.SortOrder.Ascending;
						}
						return new QuickSortItem({
							key: oProperty.name,
							label: oProperty.label,
							sortOrder: sSortOrder
						});
					}),
					change: function(oEvent) {
						const oItem = oEvent.getParameter("item");
						PersonalizationUtils.createSortChange(oTable, {
							property: oItem.getKey(),
							sortOrder: oItem.getSortOrder()
						});
					}
				}));
			}
		}

		if (oTable.isGroupingEnabled()) {
			const aGroupableProperties = oPropertyHelper.getProperty(oColumn.getPropertyKey()).getGroupableProperties();
			const aGroupedProperties = oTable._getGroupedProperties();

			if (aGroupableProperties.length > 0) {
				this.addQuickAction(new QuickGroup({
					items: aGroupableProperties.map(function(oProperty) {
						const bGrouped = aGroupedProperties.some(function(oGroupedProperty) {
							return oGroupedProperty.name === oProperty.name;
						});

						return new QuickGroupItem({
							key: oProperty.name,
							label: oProperty.label,
							grouped: bGrouped
						});
					}),
					change: function(oEvent) {
						PersonalizationUtils.createGroupChange(oTable, {
							property: oEvent.getParameter("item").getKey()
						});
					}
				}));
			}
		}

		if (oTable.isAggregationEnabled()) {
			const aPropertiesThatCanBeTotaled = oPropertyHelper.getProperty(oColumn.getPropertyKey()).getAggregatableProperties().filter(function(oProperty) {
				return oProperty.extension && oProperty.extension.customAggregate;
			});
			const mAggregatedProperties = oTable._getAggregatedProperties();

			if (aPropertiesThatCanBeTotaled.length > 0) {
				this.addQuickAction(new QuickTotal({
					items: aPropertiesThatCanBeTotaled.map(function(oProperty) {
						return new QuickTotalItem({
							key: oProperty.name,
							label: oProperty.label,
							totaled: mAggregatedProperties.hasOwnProperty(oProperty.name)
						});
					}),
					change: function(oEvent) {
						PersonalizationUtils.createAggregateChange(oTable, {
							property: oEvent.getParameter("item").getKey()
						});
					}
				}));
			}
		}

		if (oTable.getEnableColumnResize()) {
			this.addQuickAction(oTable._getType().createColumnResizeMenuItem(oColumn, this.getMenu()));
		}

		return pCreateContent;
	};

	QuickActionContainer.prototype.updateQuickActions = function(aKeys) {
		const oTable = this.getTable();
		const aSortedProperties = oTable._getSortedProperties();
		const aGroupedProperties = oTable._getGroupedProperties();
		const oAggregatedProperty = oTable._getAggregatedProperties();

		this.getQuickActions().forEach(function(oQuickAction) {
			if ((!aKeys || aKeys.includes("Sort")) && oQuickAction.isA("sap.m.table.columnmenu.QuickSort")) {
				oQuickAction.getItems().forEach(function(oItem) {
					const mSortCondition = aSortedProperties.find(function(oSortedProperty) {
						return oSortedProperty.name === oItem.getProperty("key");
					});
					if (mSortCondition) {
						oItem.setSortOrder(mSortCondition.descending ? CoreLibrary.SortOrder.Descending : CoreLibrary.SortOrder.Ascending);
					} else {
						oItem.setSortOrder(CoreLibrary.SortOrder.None);
					}
				});
			} else if ((!aKeys || aKeys.includes("Group")) && oQuickAction.isA("sap.m.table.columnmenu.QuickGroup")) {
				oQuickAction.getItems().forEach(function(oItem) {
					const bGrouped = aGroupedProperties.some(function (oGroupedProperty) {
						return oGroupedProperty.name === oItem.getProperty("key");
					});
					oItem.setGrouped(bGrouped);
				});
			} else if ((!aKeys || aKeys.includes("Aggregate")) && oQuickAction.isA("sap.m.table.columnmenu.QuickTotal")) {
				oQuickAction.getItems().forEach(function(oItem) {
					const bTotaled = oAggregatedProperty.hasOwnProperty(oItem.getProperty("key"));
					oItem.setTotaled(bTotaled);
				});
			}
		});
	};

	QuickActionContainer.prototype.hasQuickActions = function() {
		return this.getEffectiveQuickActions().length > 0;
	};

	QuickActionContainer.prototype.getTable = function() {
		return Element.registry.get(this.getAssociation("table"));
	};

	QuickActionContainer.prototype.getColumn = function() {
		return Element.registry.get(this.getAssociation("column"));
	};

	return QuickActionContainer;
});