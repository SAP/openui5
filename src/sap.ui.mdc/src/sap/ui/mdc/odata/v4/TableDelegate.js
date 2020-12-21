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
	 * Initializes a new table property helper for V4 analytics with the property extensions merged into the property infos.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table.
	 * @returns {Promise<sap.ui.mdc.table.V4AnalyticsPropertyHelper>} A promise that resolves with the property helper.
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Delegate.initPropertyHelper = function(oTable) {
		// TODO: Do this in the DelegateMixin, or provide a function in the base delegate to merge properties and extensions
		return Promise.all([
			this.fetchProperties(oTable),
			loadModules("sap/ui/mdc/table/V4AnalyticsPropertyHelper")
		]).then(function(aResult) {
			return Promise.all(aResult.concat(this.fetchPropertyExtensions(oTable, aResult[0])));
		}.bind(this)).then(function(aResult) {
			var aProperties = aResult[0];
			var PropertyHelper = aResult[1][0];
			var mExtensions = aResult[2];
			var iMatchingExtensions = 0;
			var aPropertiesWithExtension = [];

			for (var i = 0; i < aProperties.length; i++) {
				aPropertiesWithExtension.push(Object.assign({}, aProperties[i], {
					extension: mExtensions[aProperties[i].name] || {}
				}));

				if (aProperties[i].name in mExtensions) {
					iMatchingExtensions++;
				}
			}

			if (iMatchingExtensions !== Object.keys(mExtensions).length) {
				throw new Error("At least one property extension does not point to an existing property");
			}

			return new PropertyHelper(aPropertiesWithExtension, oTable);
		});
	};

	/**
	 * Fetches the property extensions.
	 * TODO: document structure of the extension
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @param {object[]} aProperties The property infos
	 * @returns {Promise<object<string, object>>} Key-value map, where the key is the name of the property, and the value is the extension
	 * @protected
	 */
	Delegate.fetchPropertyExtensions = function(oTable, aProperties) {
		return Promise.resolve({});
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
		if (aGroupProperties && aGroupProperties.length) {
			oGroupPopover = this._onGroup(oTable, aGroupProperties, oMDCColumn);
		}

		if (aAggregateProperties && aAggregateProperties.length) {
			oAggregatePopover = this._onAggregate(oTable, aAggregateProperties, oMDCColumn);
		}
		return [oGroupPopover, oAggregatePopover];
	};

	Delegate._onGroup = function(oTable, aGroupProperties, oMDCColumn) {
		var oGroupChild, aGroupChildren = [];
		var aAggregate = TableMap.get(oTable)["aggregate"] || [];
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
					aAnalytics: aAggregate,
					oMDCColumn: oMDCColumn
				}, this._checkForPreviousAnalytics, this]
			});
			return oGroupPopover;
		}
	};

	Delegate._onAggregate = function(oTable, aAggregateProperties, oMDCColumn) {
		var oAggregateChild, aAggregateChildren = [];
		var aGroupLevel = TableMap.get(oTable)["group"] || [];
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
					aAnalytics: aGroupLevel,
					oMDCColumn: oMDCColumn
				}, this._checkForPreviousAnalytics, this]
			});
			return oAggregatePopover;
		}
	};

	Delegate._checkForPreviousAnalytics = function(oEvent, oData) {
		var sName = oData.sName,
			aAnalytics = oData.aAnalytics,
			oMDCColumn = oData.oMDCColumn,
			oTable = oMDCColumn.getParent(),
			bForcedAnalytics = false,
			sPath = oEvent.getParameter("property");

		if (aAnalytics.includes(sPath)) {
			var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
			bForcedAnalytics = true;
			MessageBox.warning(oResourceBundle.getText("table.SETTINGS_MESSAGE") + "\n"
			+ oResourceBundle.getText("table.SETTINGS_MESSAGE2") + " " + sName + "?", {
				title: "Add " + sName,
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
		var mTableMap = TableMap.get(oTable);
		var aGroup =  mTableMap["group"] || [];
		var aAggregate =  mTableMap["aggregate"] || [];

		if (sAction === "Group") {
			if (aGroup.indexOf(sPath) > -1) {
				aGroup.splice(aGroup.indexOf(sPath), 1);
			} else {
				aGroup.push(sPath);
			}
		} else if (aAggregate.indexOf(sPath) > -1) {
			aAggregate.splice(aAggregate.indexOf(sPath), 1);
		} else {
				aAggregate.push(sPath);
		}
		this._setAggregation(oTable, aGroup, aAggregate);
	};

	Delegate._forceAnalytics = function(sName, oTable, sPath) {
		var aGroupLevel = TableMap.get(oTable)["group"] || [];
		var aAggregate = TableMap.get(oTable)["aggregate"] || [];

		if (sName === "Aggregate") {
			aGroupLevel.splice(aAggregate.indexOf(sPath),1);
			aAggregate.push(sPath);
		} else if (sName === "Group") {
			aAggregate.splice(aAggregate.indexOf(sPath),1);
			aGroupLevel.push(sPath);
		}

		this._setAggregation(oTable, aGroupLevel, aAggregate);
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
		TableMap.set(oTable, {
			plugin: oPlugin,
			group: aGroupLevel,
			aggregate: aAggregate
		});
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
		var aGroupLevel = TableMap.get(oTable)["group"] || [];
		var aAggregate  = TableMap.get(oTable)["aggregate"] || [];
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
			oPlugin.setPropertyInfos(oPropertyHelper.getRawPropertyInfos());
			that._setAggregation(oTable, [], []);
		});
	}

	return Delegate;
});