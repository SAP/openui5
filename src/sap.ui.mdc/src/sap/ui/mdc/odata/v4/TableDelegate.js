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
	"sap/ui/core/library",
	"sap/m/MessageBox"
], function(
	TableDelegate,
	loadModules,
	library,
	ColumnPopoverSelectListItem,
	Item,
	Core,
	coreLibrary,
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

	/**
	 * Retrieves the relevant metadata that will be used for the table binding, and returns the property info array.
	 * If not overriden, this method return the same as <code>fetchProperties</code>.
	 * When overridding, make sure the returned result is consistent with what is returned by <code>fetchProperties</code>.
	 *
	 * @param {Object} oControl MDC Control instance
	 * @returns {Promise} Once resolved, an array of property info objects is returned
	 * @protected
	*/
	Delegate.fetchPropertiesForBinding = function(oTable) {
		return this.fetchProperties(oTable);
	};

	/**
	 * Fetches the property extensions that will be used for the table binding.
	 * If not overriden, this method eturn the same as <code>fetchPropertyExtensions</code>.
	 * When overridding, make sure the returned result is consistent with what is returned by <code>fetchPropertyExtensions</code>.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @param {object[]} aProperties The property infos
	 * @returns {Promise<object<string, object>|null>} Key-value map, where the key is the name of the property, and the value is the extension
	 * @protected
	 */
	Delegate.fetchPropertyExtensionsForBinding = function(oTable, aProperties) {
		return this.fetchPropertyExtensions(oTable, aProperties);
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
		if (oTable.isGroupingEnabled() && aGroupProperties && aGroupProperties.length > 0) {
			oGroupPopover = this._onGroup(aGroupProperties, oMDCColumn);
		}

		if (oTable.isAggregationEnabled() && aAggregateProperties && aAggregateProperties.length > 0) {
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
				icon: "sap-icon://sum",
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

		if (oPlugin) {
			var oAggregationInfo = {
				visible: this._getVisibleProperties(oTable, oPlugin),
				groupLevels: aGroupLevel,
				grandTotal: aAggregate,
				subtotals: aAggregate
			};

			oPlugin.setAggregationInfo(oAggregationInfo);
		}
	};

	Delegate._getVisibleProperties = function(oTable, oPlugin) {
		var aVisibleProperties = [];
		var aProperties = oPlugin.getPropertyInfos();
		oTable.getColumns().forEach(function(item) {
			var sPropertyName = item.getDataProperty(),
				oPropertyInfo = aProperties.find(function(oProp) {
				return oProp.name === sPropertyName;
			});
			if (oPropertyInfo) {
				if (oPropertyInfo.propertyInfos) {
					// Complex propertyInfo --> add the names of all related (simple) propertyInfos in the list
					oPropertyInfo.propertyInfos.forEach(function(sRelatedInfoName) {
						if (aVisibleProperties.indexOf(sRelatedInfoName) < 0) {
							aVisibleProperties.push(sRelatedInfoName);
						}
					});
				} else if (aVisibleProperties.indexOf(sPropertyName) < 0) {
					// Simple propertyInfo --> add its name in the list
					aVisibleProperties.push(sPropertyName);
				}
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

	Delegate.validateState = function(oControl, oState) {
		var oProperty, aProperties = [];
		oState.items.forEach(function(oItem) {
			oProperty = oControl.getPropertyHelper().getProperty(oItem.name);
			if (!oProperty.isComplex()) {
				aProperties.push(oProperty.name);
			} else {
				oProperty.getReferencedProperties().forEach(function(oReferencedProperty) {
					aProperties.push(oReferencedProperty.name);
				});
			}
		});

		var bSortedOnlyVisibleColumns = oState.sorters.every(function(oSort) {
			return aProperties.find(function(sPropertyName) {
				return oSort.name === sPropertyName;
			});
		});

		if (!bSortedOnlyVisibleColumns) {
			var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			return {
				validation: coreLibrary.MessageType.Warning,
				message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION")
			};
		}

		return {
			validation: coreLibrary.MessageType.None
		};
	};


	function enrichGridTable(oTable, that) {
		// The property helper is initialized after the table "initialized" promise resolves. So we can only wait for the property helper.
		var aPropertiesForBinding,
			mExtensionsForBinding,
			oPlugin;

		return Promise.all([
			oTable.awaitPropertyHelper(),
			loadModules("sap/ui/table/plugins/V4Aggregation")
		]).then(function(aResult) {
			var V4AggregationPlugin = aResult[1][0],
				oInnerTable = oTable._oTable;

			oPlugin = new V4AggregationPlugin();

			oInnerTable.addDependent(oPlugin);

			TableMap.set(oTable, {
				plugin: oPlugin
			});

			// Configure the plugin with the propertyInfos
			return that.fetchPropertiesForBinding(oTable);
		}).then(function(aProperties) {
			aPropertiesForBinding = aProperties;
			return that.fetchPropertyExtensionsForBinding(oTable, aPropertiesForBinding);
		}).then(function(mExtensions) {
			mExtensionsForBinding = mExtensions;
			return that.fetchPropertyHelper(oTable, aPropertiesForBinding, mExtensionsForBinding);
		}).then(function(HelperClass) {
			var oHelper = new HelperClass(aPropertiesForBinding, mExtensionsForBinding, oTable);
			oPlugin.setPropertyInfos(oHelper.getProperties());
			that._setAggregation(oTable, [], []);
			oHelper.destroy();
		});
	}

	return Delegate;
});
