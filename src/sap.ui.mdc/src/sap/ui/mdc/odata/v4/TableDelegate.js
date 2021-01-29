/*
 * ! ${copyright}
 */

sap.ui.define([
	"../../TableDelegate",
	"../../util/loadModules",
	"../../library",
	"sap/m/ColumnPopoverSelectListItem",
	"sap/ui/core/Item",
	"sap/ui/core/Core",
	"sap/m/MessageBox"
], function(
	TableDelegate,
	loadModules,
	library,
	ColumnPopoverSelectListItem,
	Item,
	Core,
	MessageBox
) {
	"use strict";

	var TableType = library.TableType;
	var TableMap = new window.WeakMap(); // To store table-related information for easy access in the delegate.

	/**
	 * Delegate class for sap.ui.mdc.Table and ODataV4.
	 * Enables additional analytical capabilities.
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized.
	 *
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.85
	 * @alias sap.ui.mdc.odata.v4.TableDelegate
	 */
	var Delegate = Object.assign({}, TableDelegate);

	/**
	 * Fetches the model-specific property helper class or instance.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @param {object[]} aProperties The property infos
	 * @param {Promise<object<string, object>|null>} mExtensions The property extensions
	 * @returns {Promise<sap.ui.mdc.table.V4AnalyticsPropertyHelper>} A promise that resolves with the property helper class or instance
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Delegate.fetchPropertyHelper = function(oTable, aProperties, mExtensions) {
		return loadModules("sap/ui/mdc/table/V4AnalyticsPropertyHelper").then(function(aResult) {
			return aResult[0];
		});
	};

	/**
	 * Fetches the property extensions.
	 * TODO: document structure of the extension
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @param {object[]} aProperties The property infos
	 * @returns {Promise<object<string, object>|null>} Key-value map, where the key is the name of the property, and the value is the extension
	 * @protected
	 */
	Delegate.fetchPropertyExtensions = function(oTable, aProperties) {
		return Promise.resolve(null);
	};

	Delegate.preInit = function(oTable) {
		var that = this;
		if (oTable._getStringType() === TableType.ResponsiveTable) {
			throw new Error("This delegate does not support the table type '" + TableDelegate.ResponsiveTable + "'.");
		}

		return enrichGridTable(oTable, that);
	};

	Delegate.addColumnMenuItems = function(oTable, oMDCColumn) {
		var oPropertyHelper = oTable.getPropertyHelper();
		var aGroupProperties = oPropertyHelper.getGroupableProperties(oMDCColumn.getDataProperty());
		var aAggregateProperties = oPropertyHelper.getAggregatableProperties(oMDCColumn.getDataProperty());
		var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
		var oPopover = oTable._oPopover;
		oPopover && oPopover.getItems().forEach(function(item, index, aItems) {
			if (item.getLabel() === oResourceBundle.getText("table.SETTINGS_GROUP") || item.getLabel() === oResourceBundle.getText("table.SETTINGS_AGGREGATE")) {
				aItems[index].destroy();
			}
			if (aItems.length == 0 ) {
				oPopover.destroy();
			}
		});

		var oAggregatePopover, oGroupPopover;
		if (oTable.isGroupingEnabled() && aGroupProperties && aGroupProperties.length) {
			oGroupPopover = this._onGroup(aGroupProperties, oMDCColumn);
		}

		if (oTable.isAggregationEnabled() && aAggregateProperties && aAggregateProperties.length) {
			oAggregatePopover = this._onAggregate(aAggregateProperties, oMDCColumn);
		}
		return [oGroupPopover, oAggregatePopover];
	};

	Delegate._onGroup = function(aGroupProperties, oMDCColumn) {
		var oGroupChild, aGroupChildren = [];
		var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
		aGroupProperties.forEach(function(oGroupProperty) {
			oGroupChild = new Item({
				text: oGroupProperty.getLabel(),
				key: oGroupProperty.getName()
			});
			aGroupChildren.push(oGroupChild);
		});
		if (aGroupChildren.length > 0) {
			var oGroupPopover = new ColumnPopoverSelectListItem({
				items: aGroupChildren,
				label: oResourceBundle.getText("table.SETTINGS_GROUP"),
				icon: "sap-icon://group-2",
				action: [{
					sName: "Group",
					oMDCColumn: oMDCColumn
				}, this._checkForPreviousAnalytics, this]
			});
			return oGroupPopover;
		}
	};

	Delegate._onAggregate = function(aAggregateProperties, oMDCColumn) {
		var oAggregateChild, aAggregateChildren = [];
		var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
		aAggregateProperties.forEach(function(oAggregateProperty) {
			oAggregateChild = new Item({
				text: oAggregateProperty.getLabel(),
				key: oAggregateProperty.getName()
			});
			aAggregateChildren.push(oAggregateChild);
		});

		if (aAggregateChildren.length > 0) {
			var oAggregatePopover = new ColumnPopoverSelectListItem({
				items: aAggregateChildren,
				label: oResourceBundle.getText("table.SETTINGS_AGGREGATE"),
				icon: "sap-icon://collections-management",
				action: [{
					sName: "Aggregate",
					oMDCColumn: oMDCColumn
				}, this._checkForPreviousAnalytics, this]
			});
			return oAggregatePopover;
		}
	};

	Delegate._checkForPreviousAnalytics = function(oEvent, oData) {
		var sName = oData.sName,
			sTitle,
			oMDCColumn = oData.oMDCColumn,
			oTable = oMDCColumn.getParent(),
			aGroupLevels = oTable.getCurrentState().groupLevels || [],
			oAggregate = oTable.getCurrentState().aggregations || {},
			aAggregate = Object.keys(oAggregate),
			bForcedAnalytics = false,
			sPath = oEvent.getParameter("property");

		var aAnalytics = sName == "Aggregate" ? aGroupLevels : aAggregate;
		var bForce = aAnalytics.filter(function(item) {
			return sName == "Aggregate" ? item.name === sPath : item === sPath;
		}).length > 0;

		if (bForce) {
			var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
			sTitle = sName == "Aggregate" ? oResourceBundle.getText("table.SETTINGS_AGGREGATE") : oResourceBundle.getText("table.SETTINGS_GROUP");
			bForcedAnalytics = true;
			MessageBox.warning(oResourceBundle.getText("table.SETTINGS_MESSAGE"), {
				title: oResourceBundle.getText("table.SETTINGS_WARNING_TITLE") + " " + sTitle,
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				onClose: function (oAction) {
					if (oAction === sap.m.MessageBox.Action.YES) {
						this._forceAnalytics(sName, oTable, sPath);
						return;
					}
				}.bind(this)
			});
		}
		if (sName === "Aggregate" && !bForcedAnalytics) {
			this._onAction(sName, oTable, sPath);
		} else if (sName === "Group" && !bForcedAnalytics) {
			this._onAction(sName, oTable, sPath);
		}
	};

	Delegate._onAction = function(sAction, oTable, sPath) {
		if (sAction === "Group") {
			oTable._onCustomGroup(sPath);
		} else {
			oTable._onCustomAggregate(sPath);
		}
	};

	Delegate._forceAnalytics = function(sName, oTable, sPath) {
		var self = this;
		if (sName === "Aggregate") {
			oTable.getCurrentState().groupLevels.forEach(function (item, index, object) {
				if (item.name == sPath) {
					var aGroupLevel = oTable.getCurrentState().groupLevels || [];
					var oAggregate = oTable.getCurrentState().aggregations || {};
					var aAggregate = Object.keys(oAggregate);
					aGroupLevel.splice(index, 1);
					self._setAggregation(oTable, aGroupLevel, aAggregate);
				}
			});
			oTable._onCustomAggregate(sPath);
		} else if (sName === "Group") {
			var oAggregate = oTable.getCurrentState().aggregations || {};
			Object.keys(oAggregate).forEach(function (item, index, object) {
				if (item == sPath) {
					delete oAggregate[sPath];
					var aAggregate = Object.keys(oAggregate);
					var aGroupLevel = oTable.getCurrentState().groupLevels || [];
					self._setAggregation(oTable, aGroupLevel, aAggregate);
				}
			});
			oTable._onCustomGroup(sPath);
		}
	};

	Delegate.rebindTable = function (oTable, oBindingInfo) {
		var oGroupLevels, aGrouping, oAggregations, aAggregate;

		oGroupLevels = oTable._getGroupedProperties();
		oAggregations = oTable._getAggregatedProperties();

		aGrouping = oGroupLevels.map(function (item) {
			return item.name;
		});

		aAggregate = Object.keys(oAggregations);

		this._setAggregation(oTable, aGrouping, aAggregate);
		TableDelegate.rebindTable(oTable, oBindingInfo);
	};

	Delegate._setAggregation = function(oTable, aGroupLevel, aAggregate) {
		var mTableMap = TableMap.get(oTable);
		var oPlugin = mTableMap["plugin"];
		var oAggregationInfo = {
			visible: this._getVisibleProperties(oTable),
			groupLevels: aGroupLevel,
			grandTotal: aAggregate,
			subtotals: aAggregate
		};

		oPlugin && oPlugin.setAggregationInfo(oAggregationInfo);
	};

	Delegate._getVisibleProperties = function(oTable) {
		var aVisibleProperties = [];
		var oPropertyHelper = oTable.getPropertyHelper();
		oTable.getColumns().forEach(function(item) {
			var sPath = item.getDataProperty();
			if (oPropertyHelper.isComplex(sPath)) {
				oPropertyHelper.getReferencedProperties(sPath).forEach(function(e){
					if (aVisibleProperties.indexOf(e.getName()) == -1) {
						aVisibleProperties.push(e.getName());
					}
				});
			} else if (aVisibleProperties.indexOf(oPropertyHelper.getName(sPath)) == -1) {
					aVisibleProperties.push(oPropertyHelper.getName(sPath));
				}
		});
		return aVisibleProperties;
	};

	Delegate._onColumnChange = function(oTable) {
		if (!TableMap.get(oTable)) {
			return;
		}
		var aGroupLevel = oTable.getCurrentState().groupLevels || [];
		var oAggregate  = oTable.getCurrentState().aggregations || {};
		var aAggregate = Object.keys(oAggregate);
		this._setAggregation(oTable, aGroupLevel, aAggregate);
	};

	function enrichGridTable(oTable, that) {
		// The property helper is initialized after the table "initialized" promise resolves. So we can only wait for the property helper.
		return Promise.all([
			oTable.awaitPropertyHelper(),
			loadModules("sap/ui/table/plugins/V4Aggregation")
		]).then(function(aResult) {
			var oPropertyHelper = oTable.getPropertyHelper(),
				V4AggregationPlugin = aResult[1][0],
				oInnerTable = oTable._oTable,
				oPlugin = new V4AggregationPlugin();

			oInnerTable.addDependent(oPlugin);

			TableMap.set(oTable, {
				plugin: oPlugin
			});

			// Configure the plugin with the propertyInfos
			oPlugin.setPropertyInfos(oPropertyHelper.getProperties());
			that._setAggregation(oTable, [], []);
		});
	}

	return Delegate;
});