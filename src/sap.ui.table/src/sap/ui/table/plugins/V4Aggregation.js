/*
 * ${copyright}
 */
sap.ui.define([
	"./PluginBase",
	"../utils/TableUtils",
	"sap/ui/unified/MenuItem"
], function(
	PluginBase,
	TableUtils,
	MenuItem
) {
	"use strict";

	/**
	 * Constructs an instance of sap.ui.table.plugins.V4Aggregation
	 *
	 * @class TODO
	 * @extends sap.ui.table.plugins.PluginBase
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @since 1.76
	 * @experimental
	 * @alias sap.ui.table.plugins.V4Aggregation
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var V4Aggregation = PluginBase.extend("sap.ui.table.plugins.V4Aggregation", /** @lends sap.ui.table.plugins.V4Aggregation.prototype */ {
		metadata: {
			library: "sap.ui.table",
			properties: {
				// This has to be managed above column level, because the group order is independent from the oder of the columns in the aggregation.
				//groupLevels: {type: "string[]", defaultValue: []}
				//showTotalSummary: {type: "boolean", defaultValue: true},
				//showGroupSummaries: {type: "boolean", defaultValue: true}
			},
			events: {}
		}
	});

	V4Aggregation.prototype.init = function() {
		this.aGroupMenuItems = [];
		this.aAggregateMenuItems = [];
		this.aContextMenuItems = [];
	};

	V4Aggregation.prototype.isApplicable = function(oTable) {
		return oTable.getMetadata().getName() === "sap.ui.table.Table";
	};

	V4Aggregation.prototype.onActivate = function(oTable) {
		PluginBase.prototype.onActivate.apply(this, arguments);
		TableUtils.Grouping.setGroupMode(oTable); // TODO: Only when really grouped
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Row.UpdateState, this.updateRowState, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Table.OpenMenu, this.onOpenMenu, this);
		TableUtils.Hook.register(oTable, TableUtils.Hook.Keys.Column.MenuItemNotification, this.notifyColumnAboutMenuItems, this);
	};

	V4Aggregation.prototype.onDeactivate = function(oTable) {
		PluginBase.prototype.onDeactivate.apply(this, arguments);
		TableUtils.Grouping.clearMode(oTable);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Row.UpdateState, this.updateRowState, this);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Table.OpenMenu, this.onOpenMenu, this);
		TableUtils.Hook.deregister(oTable, TableUtils.Hook.Keys.Column.MenuItemNotification, this.notifyColumnAboutMenuItems, this);

		this.aGroupMenuItems.concat(this.aAggregateMenuItems, this.aContextMenuItems)
			.forEach(function(oItem) {
				oItem.destroy();
			});
		this.aGroupMenuItems = [];
		this.aAggregateMenuItems = [];
		this.aContextMenuItems = [];

		var oBinding = oTable.getBinding("rows");
		if (oBinding) {
			oBinding.setAggregation(null);
		}
	};

	V4Aggregation.prototype.onTableRowsBound = function(oBinding) {
		// TODO: Check whether OData V4 and throw otherwise.
		this.updateAggregation();
	};

	V4Aggregation.prototype.updateRowState = function(oState) {
		if (typeof oState.context.getValue("@$ui5.node.isExpanded") === "boolean") {
			oState.type = oState.Type.GroupHeader;
		} else if (oState.context.getValue("@$ui5.node.isTotal")) {
			oState.type = oState.Type.Summary;
		}
		oState.title = "todo";
		oState.expandable = oState.type === oState.Type.GroupHeader;
		oState.expanded = oState.context.getValue("@$ui5.node.isExpanded") === true;
		oState.level = oState.context.getValue("@$ui5.node.level");
	};

	V4Aggregation.prototype.setGroupLevels = function(aGroupLevels) {
		this._aGroupLevels = aGroupLevels;
	};

	V4Aggregation.prototype.getGroupLevels = function() {
		return this._aGroupLevels || [];
	};

	function getGroupableProperties(oInstance) {
		var aColumns;

		if (oInstance.isA("sap.ui.table.Table")) {
			aColumns = oInstance.getColumns();
		} else {
			aColumns = [oInstance];
		}

		return aColumns.reduce(function(aGroupableProperties, oColumn) {
			var oPropertyInfo = oColumn.data("propertyInfo");

			if (oColumn.getVisible() && oPropertyInfo) {
				for (var sProperty in oPropertyInfo) {
					if (oPropertyInfo[sProperty].groupable && aGroupableProperties.indexOf(sProperty) === -1) {
						aGroupableProperties.push(sProperty);
					}
				}
			}

			return aGroupableProperties;
		}, []);
	}

	function getAggregatableProperties(oInstance) {
		var aColumns;

		if (oInstance.isA("sap.ui.table.Table")) {
			aColumns = oInstance.getColumns();
		} else {
			aColumns = [oInstance];
		}

		return aColumns.reduce(function(aAggregatableProperties, oColumn) {
			var oPropertyInfo = oColumn.data("propertyInfo");

			if (oColumn.getVisible() && oPropertyInfo) {
				for (var sProperty in oPropertyInfo) {
					if (oPropertyInfo[sProperty].aggregatable && aAggregatableProperties.indexOf(sProperty) === -1) {
						aAggregatableProperties.push(sProperty);
					}
				}
			}

			return aAggregatableProperties;
		}, []);
	}

	function getAggregationInfos(oColumn) {
		var aAggregatableProperties = getAggregatableProperties(oColumn);
		var oPropertyInfo = oColumn.data("propertyInfo");
		var aAggregationConfigs = [];

		for (var i = 0; i < aAggregatableProperties.length; i++) {
			var sProperty = aAggregatableProperties[i];
			var oProperty = oPropertyInfo[aAggregatableProperties[i]];
			var oDetails = Object.assign({grandtotal: true, subtotals: true}, oProperty.aggregationDetails);
			var oConfig = {
				grandTotal: oDetails.grandtotal === true,
				subtotals: oDetails.subtotals === true
			};
			if (oConfig.grandTotal || oConfig.subtotals) {
				aAggregationConfigs.push({name: sProperty, menuText: "Totals", config: oConfig});
			}
			if (oDetails.custom) {
				for (var sCustomConfig in oDetails.custom) {
					var oCustomConfig = oDetails.custom[sCustomConfig];
					aAggregationConfigs.push({name: sCustomConfig, menuText: sCustomConfig, config: oCustomConfig});
				}
			}
		}

		return aAggregationConfigs;
	}

	function getGroup(oTable) {
		return getGroupableProperties(oTable).reduce(function(mGroup, sGroupableProperty) {
			mGroup[sGroupableProperty] = {};
			return mGroup;
		}, {});
	}

	function getAggregate(oTable) {
		var mAggregate = getAggregatableProperties(oTable).reduce(function(mAggregate, sAggregatableProperty) {
			mAggregate[sAggregatableProperty] = {};
			return mAggregate;
		}, {});

		return oTable.getColumns().reduce(function(mAggregate, oColumn) {
			var oExtendedState = oColumn.data("extendedState");

			if (oExtendedState && oExtendedState.aggregations) {
				oExtendedState.aggregations.forEach(function(oAggregatedProperty) {
					mAggregate[oAggregatedProperty.name] = oAggregatedProperty.config;
				});
			}

			return mAggregate;
		}, mAggregate);
	}

	V4Aggregation.prototype.updateAggregation = function() {
		var oTable = this.getTable();
		var oBinding = this.getTableBinding();
		var mAggregation = {
			aggregate: getAggregate(oTable),
			group: getGroup(oTable),
			groupLevels: this.getGroupLevels()
		};

		oBinding.setAggregation(mAggregation);
	};

	/* TODO: The whole method needs to be refactored.
	 *  Maybe switch to sap.m.ColumnHeaderPopover. But then it also needs to be able to be opened as a context menu (see
	 *  Menu#openAsContextMenu), ... and perhaps get a different name
	 *  How to handle existing Table/Column API related to old menus (sap.ui.unified.Menu)?
	 */
	V4Aggregation.prototype.onOpenMenu = function(oCellInfo, oMenu) {
		var oTable = this.getTable();

		if (oCellInfo.isOfType(TableUtils.CELLTYPE.COLUMNHEADER)) {
			var oColumn = oTable.getColumns()[oCellInfo.columnIndex];
			var aGroupableProperties = getGroupableProperties(oColumn);
			var aAggregationInfos = getAggregationInfos(oColumn);

			if (aGroupableProperties.length > 0) {
				// Info about groups is stored in property "groupLevels".
				var onGroup = function(sProperty) {
					var aGroupLevels = this.getGroupLevels();

					// TODO: Fire group event of the table and consider prevent default.
					// TODO: Maintain array of grouped columns to provide in the event and for internal usage.
					if (this.getGroupLevels().indexOf(sProperty) === -1) { // Group
						// TODO: This is incorrect, but good enough for testing. Move "showIfGrouped" property from AnalyticalColumn to Column.
						//oColumn.setGrouped(true);
						aGroupLevels.push(sProperty);
						this.setGroupLevels(aGroupLevels);
					} else { // Ungroup
						aGroupLevels.splice(aGroupLevels.indexOf(sProperty), 1);
						this.setGroupLevels(aGroupLevels);
						//if (aGroupLevels.length === 0) {
						//	oColumn.setGrouped(false);
						//}
					}

					this.updateAggregation();
				}.bind(this);

				aGroupableProperties.forEach(function(sGroupableProperty, iIndex) {
					if (!this.aGroupMenuItems[iIndex] || this.aGroupMenuItems[iIndex].bIsDestroyed) {
						this.aGroupMenuItems[iIndex] = new MenuItem(this.getId() + "-group" + "-" + iIndex, {
							text: TableUtils.getResourceText("TBL_GROUP") + ": " + sGroupableProperty,
							icon: this.getGroupLevels().indexOf(sGroupableProperty) > -1 ? "sap-icon://accept" : null,
							select: function() {
								onGroup(sGroupableProperty);
							}
						});
					} else {
						// TODO: Just a quick hack. Do the update without messing with private stuff.
						this.aGroupMenuItems[iIndex].mEventRegistry.select[0].fFunction = function() {
							onGroup(sGroupableProperty);
						};
						this.aGroupMenuItems[iIndex].setText(TableUtils.getResourceText("TBL_GROUP") + ": " + sGroupableProperty);
						this.aGroupMenuItems[iIndex].setIcon(this.getGroupLevels().indexOf(sGroupableProperty) > -1 ? "sap-icon://accept" : null);
					}
					oMenu.addItem(this.aGroupMenuItems[iIndex]);
				}.bind(this));
			}

			if (aAggregationInfos.length > 0) {
				// Info about enabled aggregation is stored in custom data "extendedState".
				var onAggregate = function(oAggregationInfo) {
					var oExtendedState = oColumn.data("extendedState");
					var bEnable = true;

					if (!oExtendedState) {
						oExtendedState = {aggregations: []};
					}

					for (var i = 0; i < oExtendedState.aggregations.length; i++) {
						var oAggregation = oExtendedState.aggregations[i];

						if (oAggregation.name === oAggregationInfo.name) {
							oExtendedState.aggregations.splice(i, 1);
							bEnable = false;
							break;
						}
					}

					if (bEnable) {
						oExtendedState.aggregations.push(oAggregationInfo);
					}

					oColumn.data("extendedState", oExtendedState);

					this.updateAggregation();
				}.bind(this);

				var getAggregationMenuIcon = function(oAggregatablePropertyInfo) {
					var oExtendedState = oColumn.data("extendedState");

					if (!oExtendedState || !oExtendedState.aggregations) {
						return null;
					}

					return oExtendedState.aggregations.some(function(oAggregation) {
						return oAggregation.name === oAggregatablePropertyInfo.name && oAggregation.method === oAggregatablePropertyInfo.method;
					}) ? "sap-icon://accept" : null;
				};

				aAggregationInfos.forEach(function(oAggregationInfo, iIndex) {
					if (!this.aAggregateMenuItems[iIndex] || this.aAggregateMenuItems[iIndex].bIsDestroyed) {
						this.aAggregateMenuItems[iIndex] = new MenuItem(this.getId() + "-aggregate" + "-" + iIndex, {
							text: oAggregationInfo.menuText,
							icon: getAggregationMenuIcon(oAggregationInfo),
							select: function() {
								onAggregate(oAggregationInfo);
							}
						});
					} else {
						// TODO: Just a quick hack. Do the update without messing with private stuff.
						this.aAggregateMenuItems[iIndex].mEventRegistry.select[0].fFunction = function() {
							onAggregate(oAggregationInfo);
						};
						this.aAggregateMenuItems[iIndex].setText(oAggregationInfo.menuText);
						this.aAggregateMenuItems[iIndex].setIcon(getAggregationMenuIcon(oAggregationInfo));
					}
					oMenu.addItem(this.aAggregateMenuItems[iIndex]);
				}.bind(this));
			}

		} else if (oCellInfo.isOfType(TableUtils.CELLTYPE.ANYCONTENTCELL)) {
			var oRow = this.getTable().getRows()[oCellInfo.rowIndex];

			if (oRow.isGroupHeader()) { // Group header row context menu
				if (this.aContextMenuItems[0]) {
					this.aContextMenuItems[0].destroy();
				}
				this.aContextMenuItems[0] = new MenuItem(this.getId() + "-expandrow", {
					text: "expand index (" + oRow.getIndex() + ")",
					select: function() {
						var oBinding = oTable.getBinding("rows");
						if (oBinding.expand) {
							oTable.getBinding("rows").expand(oRow.getIndex());
						} else {
							sap.m.MessageToast.show("not yet ;)");
						}
					}
				});
				oMenu.addItem(this.aContextMenuItems[0]);

				if (this.aContextMenuItems[1]) {
					this.aContextMenuItems[1].destroy();
				}
				this.aContextMenuItems[1] = new MenuItem(this.getId() + "-collapserow", {
					text: "collapse (" + oRow.getIndex() + ")",
					select: function() {
						var oBinding = oTable.getBinding("rows");
						if (oBinding.collapse) {
							oTable.getBinding("rows").collapse(oRow.getIndex());
						} else {
							sap.m.MessageToast.show("not yet ;)");
						}
					}
				});
				oMenu.addItem(this.aContextMenuItems[1]);
			}
		}
	};

	V4Aggregation.prototype.notifyColumnAboutMenuItems = function(oColumn, fnNotify) {
		if (getGroupableProperties(oColumn).length > 0 || getAggregationInfos(oColumn).length > 0) {
			fnNotify();
		}
	};

	return V4Aggregation;
});