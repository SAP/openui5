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
	"sap/m/MessageBox",
	"sap/ui/core/format/ListFormat"
], function(
	TableDelegate,
	loadModules,
	library,
	ColumnPopoverSelectListItem,
	Item,
	Core,
	coreLibrary,
	MessageBox,
	ListFormat
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

	/**
	 * Formats the title text of a group header row of the table.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @param {sap.ui.model.Context} oContext Binding context
	 * @param {string} sProperty The name of the grouped property
	 * @returns {string | undefined} The group header title. If <code>undefined</code> is returned, the default group header title is set.
	 */
	Delegate.formatGroupHeader = function(oTable, oContext, sProperty) {};

	Delegate.preInit = function(oTable) {
		if (oTable._getStringType() === TableType.ResponsiveTable) {
			return Promise.resolve();
		}

		return enrichGridTable(oTable);
	};

	Delegate.validateState = function(oControl, oState, sKey) {
		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

		if (sKey == "Sort" && oState.sorters) {
			if (!checkForValidity(oControl, oState.items, oState.sorters)) {
				return {
					validation: coreLibrary.MessageType.Information,
					message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION")
				};
			}
		} else if (sKey == "Group" && oState.aggregations) {
			var aAggregateProperties = Object.keys(oState.aggregations);
			var aAggregateGroupableProperties = [];
			var oListFormat = ListFormat.getInstance();
			aAggregateProperties.forEach(function(oItem) {
				if (oControl.getPropertyHelper().isGroupable(oItem)) {
					aAggregateGroupableProperties.push(oItem);
				}
			});

			if (aAggregateGroupableProperties.length) {
				return {
					validation: coreLibrary.MessageType.Information,
					message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION", [oListFormat.format(aAggregateGroupableProperties)])
				};
			}
		} else if (sKey == "Column" ) {
			var sMessage;
			var aAggregateProperties = oState.aggregations && Object.keys(oState.aggregations);

			if (!checkForValidity(oControl, oState.items, aAggregateProperties)) {
				sMessage = oResourceBundle.getText("table.PERSONALIZATION_DIALOG_TOTAL_RESTRICTION");
			}

			if (!checkForValidity(oControl, oState.items, oState.sorters)) {
				sMessage = sMessage ? sMessage + "\n" + oResourceBundle.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION")
					: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION");
			}
			if (sMessage) {
				return {
					validation: coreLibrary.MessageType.Information,
					message: sMessage
				};
			}
		}
		return {
			validation: coreLibrary.MessageType.None
		};
	};

	/**
	 * Provides hook to update the binding info object that is used to bind the table to the model.
	 *
	 * Delegate objects that implement this method must ensure that at least the <code>path</code> key of the binding info is provided.
	 * <b>Note:</b> To remove a binding info parameter, the value must be set to <code>undefined</code>. For more information, see {@link sap.ui.model.odata.v4.ODataListBinding#changeParameters}.
	 *
	 * @param {sap.ui.mdc.Table} oMDCTable The MDC table instance
	 * @param {object} oDelegatePayload The delegate payload
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model
	 * @function
	 * @name sap.ui.mdc.odata.v4.TableDelegate.updateBindingInfo
	 * @abstract
	 */
	//Delegate.updateBindingInfo = function(oTable, oDelegatePayload, oBindingInfo) { };

	/**
	 * Updates the row binding of the table if possible, rebinds otherwise.
	 *
	 * Compares the current and previous state of the table to detect whether rebinding is necessary or not.
	 * The diffing happens for the sorters, filters, aggregation, parameters, and the path of the binding.
	 * Other {@link sap.ui.base.ManagedObject.AggregationBindingInfo binding info} keys like <code>events</code>,
	 * <code>model</code>... must be provided in the {@link #updateBindingInfo updateBindingInfo} method always,
	 * and those keys must not be changed conditionally.
	 *
	 * @param {sap.ui.mdc.Table} oMDCTable The MDC table instance
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model.
	 * @param {sap.ui.model.ListBinding} [oBinding] The binding instance of the table
	 * @protected
	 * @override
	 */
	Delegate.updateBinding = function(oTable, oBindingInfo, oBinding) {
		var bForceRebind = false;
		if (!oBinding || oBinding.hasPendingChanges() || oBinding.getPath() != oBindingInfo.path) {
			bForceRebind = true;
		} else {
			try { oBinding.suspend(); } catch (e) { /* empty */ }
			try {
				oBinding.changeParameters(oBindingInfo.parameters);
				oBinding.filter(oBindingInfo.filters, "Application");
				oBinding.sort(oBindingInfo.sorter);
				setAggregation(oTable);
			} catch (e) {
				bForceRebind = true;
			}
			try { !bForceRebind && oBinding.resume(); } catch (e) { /* empty */ }
		}

		if (bForceRebind) {
			this.rebindTable(oTable, oBindingInfo);
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	Delegate.rebindTable = function (oTable, oBindingInfo) {
		setAggregation(oTable);
		TableDelegate.rebindTable(oTable, oBindingInfo);
	};

	Delegate.addColumnMenuItems = function(oTable, oMDCColumn) {
		if (!TableMap.get(oTable)) {
			return [];
		}

		var oPropertyHelper = oTable.getPropertyHelper();
		var aGroupProperties = oPropertyHelper.getGroupableProperties(oMDCColumn.getDataProperty());
		var aAggregateProperties = oPropertyHelper.getAggregatableProperties(oMDCColumn.getDataProperty());
		var oPopover = oTable._oPopover;
		var oAggregatePopoverItem;
		var oGroupPopoverItem;

		if (oPopover) {
			oPopover.getItems().forEach(function(oItem, iIndex, aItems) {
				var sLabel = oItem.getLabel();
				var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");

				if (sLabel === oResourceBundle.getText("table.SETTINGS_GROUP") || sLabel === oResourceBundle.getText("table.SETTINGS_TOTALS")) {
					aItems[iIndex].destroy();
				}

				if (aItems.length == 0 ) {
					oPopover.destroy();
				}
			});
		}

		if (oTable.isGroupingEnabled() && aGroupProperties && aGroupProperties.length > 0) {
			oGroupPopoverItem = createGroupPopoverItem(aGroupProperties, oMDCColumn);
		}

		if (oTable.isAggregationEnabled() && aAggregateProperties && aAggregateProperties.length > 0) {
			oAggregatePopoverItem = createAggregatePopoverItem(aAggregateProperties, oMDCColumn);
		}

		return [oGroupPopoverItem, oAggregatePopoverItem];
	};

	function createGroupPopoverItem(aGroupProperties, oMDCColumn) {
		var aGroupChildren = aGroupProperties.map(function(oGroupProperty) {
			return new Item({
				text: oGroupProperty.getLabel(),
				key: oGroupProperty.getName()
			});
		});

		if (aGroupChildren.length > 0) {
			return new ColumnPopoverSelectListItem({
				items: aGroupChildren,
				label: Core.getLibraryResourceBundle("sap.ui.mdc").getText("table.SETTINGS_GROUP"),
				icon: "sap-icon://group-2",
				action: [{
					sName: "Group",
					oMDCColumn: oMDCColumn
				}, checkForPreviousAnalytics, this]
			});
		}
	}

	function createAggregatePopoverItem(aAggregateProperties, oMDCColumn) {
		var aAggregateChildren = aAggregateProperties.map(function(oAggregateProperty) {
			return new Item({
				text: oAggregateProperty.getLabel(),
				key: oAggregateProperty.getName()
			});
		});

		if (aAggregateChildren.length > 0) {
			return new ColumnPopoverSelectListItem({
				items: aAggregateChildren,
				label: Core.getLibraryResourceBundle("sap.ui.mdc").getText("table.SETTINGS_TOTALS"),
				icon: "sap-icon://sum",
				action: [{
					sName: "Aggregate",
					oMDCColumn: oMDCColumn
				}, checkForPreviousAnalytics, this]
			});
		}
	}

	function checkForPreviousAnalytics(oEvent, oData) {
		var sName = oData.sName,
			oTable = oData.oMDCColumn.getParent(),
			aGroupLevels = oTable.getCurrentState().groupLevels || [],
			oAggregate = oTable.getCurrentState().aggregations || {},
			aAggregate = Object.keys(oAggregate),
			bForcedAnalytics = false,
			sPath = oEvent.getParameter("property"),
			aAnalytics = sName === "Aggregate" ? aGroupLevels : aAggregate,
			bForce = aAnalytics.filter(function(mItem) {
				return sName === "Aggregate" ? mItem.name === sPath : mItem === sPath;
			}).length > 0;

		if (bForce) {
			var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
			var sTitle;
			var sMessage;
			var sActionText;

			if (sName === "Aggregate") {
				sTitle = oResourceBundle.getText("table.SETTINGS_WARNING_TITLE_TOTALS");
				sMessage = oResourceBundle.getText("table.SETTINGS_MESSAGE2");
				sActionText = oResourceBundle.getText("table.SETTINGS_WARNING_BUTTON_TOTALS");
			} else {
				sTitle = oResourceBundle.getText("table.SETTINGS_WARNING_TITLE_GROUPS");
				sMessage = oResourceBundle.getText("table.SETTINGS_MESSAGE1");
				sActionText = oResourceBundle.getText("table.SETTINGS_WARNING_BUTTON_GROUP");
			}

			bForcedAnalytics = true;

			MessageBox.warning(sMessage, {
				id: oTable.getId() + "-messageBox",
				title: sTitle,
				actions: [sActionText, oResourceBundle.getText("table.SETTINGS_WARNING_BUTTON_CANCEL")],
				onClose: function (oAction) {
					if (oAction === sActionText) {
						forceAnalytics(sName, oTable, sPath);
					}
				}
			});
		}

		if (sName === "Aggregate" && !bForcedAnalytics) {
			onAction(sName, oTable, sPath);
		} else if (sName === "Group" && !bForcedAnalytics) {
			onAction(sName, oTable, sPath);
		}
	}

	function onAction(sAction, oTable, sPath) {
		if (sAction === "Group") {
			oTable._onCustomGroup(sPath);
		} else {
			oTable._onCustomAggregate(sPath);
		}
	}

	function forceAnalytics(sName, oTable, sPath) {
		if (sName === "Aggregate") {
			oTable._onCustomGroup(sPath);
			oTable._onCustomAggregate(sPath);
		} else if (sName === "Group") {
			oTable._onCustomAggregate(sPath);
			oTable._onCustomGroup(sPath);
		}
	}

	function setAggregation(oTable, aGroupedProperties, mAggregatedProperties) {
		var mTableMap = TableMap.get(oTable) || {};
		var oPlugin = mTableMap.plugin;

		if (oPlugin) {
			aGroupedProperties = aGroupedProperties || oTable._getGroupedProperties();
			mAggregatedProperties = mAggregatedProperties || oTable._getAggregatedProperties();

			var aAggregates = Object.keys(mAggregatedProperties);
			var aGroupLevels = aGroupedProperties.map(function (mGroupLevel) {
				return mGroupLevel.name;
			});

			var oAggregationInfo = {
				visible: getVisibleProperties(oTable, oPlugin),
				groupLevels: aGroupLevels,
				grandTotal: aAggregates,
				subtotals: aAggregates,
				columnState: getColumnState(oTable, aAggregates)
			};

			oPlugin.setAggregationInfo(oAggregationInfo);
		}
	}

	function getVisibleProperties(oTable, oPlugin) {
		var aVisibleProperties = [];
		var aProperties = oPlugin.getPropertyInfos();

		oTable.getColumns().forEach(function(oColumn) {
			var sPropertyName = oColumn.getDataProperty();
			var oPropertyInfo = aProperties.find(function(oProp) {
				return oProp.name === sPropertyName;
			});

			if (!oPropertyInfo) {
				return;
			}

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
		});

		return aVisibleProperties;
	}

	function getColumnState(oTable, aAggregatedPropertyNames) {
		var mColumnState = {};

		oTable.getColumns().forEach(function(oColumn) {
			var sInnerColumnId = oColumn.getId() + "-innerColumn";
			var aAggregatedProperties = getAggregatedColumnProperties(oTable, oColumn, aAggregatedPropertyNames);
			var bColumnIsAggregated = aAggregatedProperties.length > 0;

			if (sInnerColumnId in mColumnState) {
				// If there already is a state for this column, it is a unit column that inherited the state from the amount column.
				// The values in the state may be overridden from false to true, but not the other way around.
				mColumnState[sInnerColumnId].subtotals = bColumnIsAggregated || mColumnState[sInnerColumnId].subtotals;
				mColumnState[sInnerColumnId].grandTotal = bColumnIsAggregated || mColumnState[sInnerColumnId].grandTotal;
				return;
			}

			mColumnState[sInnerColumnId] = {
				subtotals: bColumnIsAggregated,
				grandTotal: bColumnIsAggregated
			};

			findUnitColumns(oTable, aAggregatedProperties).forEach(function(oUnitColumn) {
				sInnerColumnId = oUnitColumn.getId() + "-innerColumn";

				if (sInnerColumnId in mColumnState) {
					// If there already is a state for this column, it is a unit column that inherited the state from the amount column.
					// The values in the state may be overridden from false to true, but not the other way around.
					mColumnState[sInnerColumnId].subtotals = bColumnIsAggregated || mColumnState[sInnerColumnId].subtotals;
					mColumnState[sInnerColumnId].grandTotal = bColumnIsAggregated || mColumnState[sInnerColumnId].grandTotal;
				} else {
					mColumnState[sInnerColumnId] = {
						subtotals: bColumnIsAggregated,
						grandTotal: bColumnIsAggregated
					};
				}
			});
		});

		return mColumnState;
	}

	function getColumnProperties(oTable, oColumn) {
		var oProperty = oTable.getPropertyHelper().getProperty(oColumn.getDataProperty());

		if (!oProperty) {
			return [];
		} else if (oProperty.isComplex()) {
			return oProperty.getReferencedProperties();
		} else {
			return [oProperty];
		}
	}

	function getAggregatedColumnProperties(oTable, oColumn, aAggregatedProperties) {
		return getColumnProperties(oTable, oColumn).filter(function(oProperty) {
			return aAggregatedProperties.includes(oProperty.name);
		});
	}

	function findUnitColumns(oTable, aProperties) {
		var aUnitProperties = [];

		aProperties.forEach(function(oProperty) {
			var oUnitProperty = oProperty ? oProperty.getUnitProperty() : null;

			if (oUnitProperty) {
				aUnitProperties.push(oUnitProperty);
			}
		});

		return oTable.getColumns().filter(function(oColumn) {
			return getColumnProperties(oTable, oColumn).some(function(oProperty) {
				return aUnitProperties.includes(oProperty);
			});
		});
	}

	function checkForValidity(oControl, aItems, aStates) {
		var oProperty, aProperties = [];

		aItems && aItems.forEach(function(oItem) {
			oProperty = oControl.getPropertyHelper().getProperty(oItem.name);
			if (!oProperty.isComplex()) {
				aProperties.push(oProperty.name);
			} else {
				oProperty.getReferencedProperties().forEach(function(oReferencedProperty) {
					aProperties.push(oReferencedProperty.name);
				});
			}
		});
		var bOnlyVisibleColumns = aStates ? aStates.every(function(oState) {
			return aProperties.find(function(sPropertyName) {
				return oState.name ? oState.name === sPropertyName : oState === sPropertyName;
			});
		}) : true;

		return bOnlyVisibleColumns;
	}

	function enrichGridTable(oTable) {
		// The property helper is initialized after the table "initialized" promise resolves. So we can only wait for the property helper.
		var aPropertiesForBinding;
		var mExtensionsForBinding;
		var oPlugin;
		var oDelegate = oTable.getControlDelegate();

		return Promise.all([
			oTable.awaitPropertyHelper(),
			loadModules("sap/ui/table/plugins/V4Aggregation")
		]).then(function(aResult) {
			var V4AggregationPlugin = aResult[1][0];

			oPlugin = new V4AggregationPlugin({
				groupHeaderFormatter: function(oContext, sProperty) {
					return oDelegate.formatGroupHeader(oTable, oContext, sProperty);
				}
			});

			oTable._oTable.addDependent(oPlugin);

			TableMap.set(oTable, {
				plugin: oPlugin
			});

			// Configure the plugin with the propertyInfos
			return oDelegate.fetchPropertiesForBinding(oTable);
		}).then(function(aProperties) {
			aPropertiesForBinding = aProperties;
			return oDelegate.fetchPropertyExtensionsForBinding(oTable, aPropertiesForBinding);
		}).then(function(mExtensions) {
			mExtensionsForBinding = mExtensions;
			return oDelegate.fetchPropertyHelper(oTable, aPropertiesForBinding, mExtensionsForBinding);
		}).then(function(HelperClass) {
			var oHelper = new HelperClass(aPropertiesForBinding, mExtensionsForBinding, oTable);
			oPlugin.setPropertyInfos(oHelper.getProperties());
			setAggregation(oTable, [], {});
			oHelper.destroy();
		});
	}

	return Delegate;
});