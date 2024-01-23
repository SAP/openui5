/*!
 * ${copyright}
 */

sap.ui.define([
	"../../TableDelegate",
	"../../table/V4AnalyticsPropertyHelper",
	"sap/ui/mdc/enums/TableP13nMode",
	"sap/ui/mdc/enums/TableType",
	"sap/ui/mdc/enums/TableSelectionMode",
	"sap/ui/mdc/odata/v4/TypeMap",
	"sap/ui/mdc/util/loadModules",
	"sap/m/plugins/PluginBase",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/format/ListFormat",
	"sap/ui/base/ManagedObjectObserver"
], (
	TableDelegate,
	V4AnalyticsPropertyHelper,
	P13nMode,
	TableType,
	SelectionMode,
	ODataV4TypeMap,
	loadModules,
	PluginBase,
	Lib,
	coreLibrary,
	ListFormat,
	ManagedObjectObserver
) => {
	"use strict";

	/*global Set */

	const TableMap = new window.WeakMap(); // To store table-related information for easy access in the delegate.

	/**
	 * Delegate for {@link sap.ui.mdc.Table} and <code>ODataV4</code>.
	 * Enables additional analytical capabilities.
	 *
	 * @author SAP SE
	 * @namespace
	 * @alias module:sap/ui/mdc/odata/v4/TableDelegate
	 * @extends module:sap/ui/mdc/TableDelegate
	 * @public
	 * @since 1.85
	 */
	const Delegate = Object.assign({}, TableDelegate);

	Delegate.getTypeMap = function(oPayload) {
		return ODataV4TypeMap;
	};

	/**
	 * Gets the model-specific <code>PropertyHelper</code> class to create an instance of.
	 *
	 * @returns {sap.ui.mdc.table.V4AnalyticsPropertyHelper} The <code>PropertyHelper</code> class.
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	Delegate.getPropertyHelperClass = function() {
		return V4AnalyticsPropertyHelper;
	};

	/**
	 * Provides hook to update the binding info object that is used to bind the table to the model.
	 *
	 * Delegate objects that implement this method must ensure that at least the <code>path</code> key of the binding info is provided.
	 * <b>Note:</b> To remove a binding info parameter, the value must be set to <code>undefined</code>. For more information, see
	 * {@link sap.ui.model.odata.v4.ODataListBinding#changeParameters}.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model
	 * @function
	 * @name module:sap/ui/mdc/odata/v4/TableDelegate.updateBindingInfo
	 * @abstract
	 */
	//Delegate.updateBindingInfo = function(oTable, oBindingInfo) { };

	/**
	 * @inheritDoc
	 */
	Delegate.getGroupSorter = function(oTable) {
		const oGroupedProperty = oTable._getGroupedProperties()[0];

		if (!oGroupedProperty || !oTable._isOfType(TableType.ResponsiveTable)) {
			return undefined;
		}

		if (!getVisiblePropertyNames(oTable).includes(oGroupedProperty.name)) {
			// Suppress grouping by non-visible property.
			return undefined;
		}

		return TableDelegate.getGroupSorter.apply(this, arguments);
	};

	/**
	 * @inheritDoc
	 */
	Delegate.getSorters = function(oTable) {
		let aSorters = TableDelegate.getSorters.apply(this, arguments);

		// Sorting by a property that is not in the aggregation info (sorting by a property that is not requested) causes a backend error.
		if (isAnalyticsEnabled(oTable)) {
			const oPropertyHelper = oTable.getPropertyHelper();
			const aVisiblePropertyPaths = getVisiblePropertyNames(oTable).map((sPropertyName) => oPropertyHelper.getProperty(sPropertyName).path);

			aSorters = aSorters.filter((oSorter) => aVisiblePropertyPaths.includes(oSorter.sPath));
		}

		return aSorters;
	};

	/**
	 * Updates the row binding of the table if possible, rebinds otherwise.
	 *
	 * Compares the current and previous state of the table to detect whether rebinding is necessary or not.
	 * The diffing happens for the sorters, filters, aggregation, parameters, and the path of the binding.
	 * Other {@link sap.ui.base.ManagedObject.AggregationBindingInfo binding info} keys like <code>events</code>,
	 * <code>model</code>... must be provided in the {@link #updateBindingInfo updateBindingInfo} method always,
	 * and those keys must not be changed conditionally.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model.
	 * @param {sap.ui.model.ListBinding} [oBinding] The binding instance of the table
	 * @param {object} [mSettings] Additional settings
	 * @param {boolean} [mSettings.forceRefresh] Indicates that the binding has to be refreshed even if <code>oBindingInfo</code> has not been changed
	 * @protected
	 * @override
	 */
	Delegate.updateBinding = function(oTable, oBindingInfo, oBinding, mSettings) {
		if (!oBinding || oBinding.getPath() != oBindingInfo.path) {
			this.rebind(oTable, oBindingInfo);
			return;
		}

		// suspend and resume have to be called on the root binding
		const oRootBinding = oBinding.getRootBinding();
		let bHasRootBindingAndWasNotSuspended = oRootBinding && !oRootBinding.isSuspended();

		try {
			if (bHasRootBindingAndWasNotSuspended) {
				oRootBinding.suspend();
			}

			setAggregation(oTable, oBindingInfo);
			oBinding.changeParameters(oBindingInfo.parameters);
			oBinding.filter(oBindingInfo.filters, "Application");
			oBinding.sort(oBindingInfo.sorter);

			if (mSettings && mSettings.forceRefresh) {
				oBinding.refresh();
			}
		} catch (e) {
			this.rebind(oTable, oBindingInfo);
			if (oRootBinding == oBinding) {
				// If we resume before the rebind, you get an extra request therefore we must
				// resume after rebind, but only if the list binding was not the root binding.
				bHasRootBindingAndWasNotSuspended = false;
			}
		} finally {
			if (bHasRootBindingAndWasNotSuspended && oRootBinding.isSuspended()) {
				oRootBinding.resume();
			}
		}
	};

	/**
	 * @inheritDoc
	 */
	Delegate.rebind = function(oTable, oBindingInfo) {
		setAggregation(oTable, oBindingInfo);
		TableDelegate.rebind.apply(this, arguments);
	};


	/**
	 * @inheritDoc
	 */
	Delegate.expandAll = function(oTable) {
		if (!this.getSupportedFeatures(oTable).expandAll) {
			return;
		}

		const oRowBinding = oTable.getRowBinding();
		if (oRowBinding) {
			oRowBinding.setAggregation(Object.assign(oRowBinding.getAggregation(), { expandTo: Number.MAX_SAFE_INTEGER }));
		}
	};

	/**
	 * @inheritDoc
	 */
	Delegate.collapseAll = function(oTable) {
		if (!this.getSupportedFeatures(oTable).collapseAll) {
			return;
		}

		const oRowBinding = oTable.getRowBinding();
		if (oRowBinding) {
			oRowBinding.setAggregation(Object.assign(oRowBinding.getAggregation(), { expandTo: 1 }));
		}
	};

	/**
	 * @inheritDoc
	 */
	Delegate.getSupportedFeatures = function(oTable) {
		const oSupportedFeatures = TableDelegate.getSupportedFeatures.apply(this, arguments);
		const bIsTreeTable = oTable._isOfType(TableType.TreeTable);

		return Object.assign(oSupportedFeatures, {
			expandAll: bIsTreeTable,
			collapseAll: bIsTreeTable
		});
	};

	/**
	 * @inheritDoc
	 */
	Delegate.getSupportedP13nModes = function(oTable) {
		const aSupportedModes = TableDelegate.getSupportedP13nModes.apply(this, arguments);

		if (oTable._isOfType(TableType.Table)) {
			if (!aSupportedModes.includes(P13nMode.Group)) {
				aSupportedModes.push(P13nMode.Group);
			}
			if (!aSupportedModes.includes(P13nMode.Aggregate)) {
				aSupportedModes.push(P13nMode.Aggregate);
			}
		}

		return aSupportedModes;
	};

	Delegate.validateState = function(oTable, oState, sKey) {
		const oBaseValidationResult = TableDelegate.validateState.apply(this, arguments);
		let oValidationResult;

		if (sKey == "Sort") {
			oValidationResult = validateSortState(oTable, oState);
		} else if (sKey == "Group") {
			oValidationResult = validateGroupState(oTable, oState);
		} else if (sKey == "Column") {
			oValidationResult = validateColumnState(oTable, oState);
		}

		return mergeValidationResults(oBaseValidationResult, oValidationResult);
	};

	function validateSortState(oTable, oState) {
		if (isAnalyticsEnabled(oTable) && hasStateForInvisibleColumns(oTable, oState.items, oState.sorters)) {
			// Sorting by properties that are not visible in the table (not requested from the backend) is not possible in analytical scenarios.
			// Corresponding sort conditions are not applied.
			return {
				validation: coreLibrary.MessageType.Information,
				message: Lib.getResourceBundleFor("sap.ui.mdc").getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION")
			};
		}

		return null;
	}

	function validateGroupState(oTable, oState) {
		const oResourceBundle = Lib.getResourceBundleFor("sap.ui.mdc");

		if (oState.aggregations) {
			const aAggregateProperties = Object.keys(oState.aggregations);
			const aAggregatedGroupableProperties = [];
			const oListFormat = ListFormat.getInstance();

			aAggregateProperties.forEach((sProperty) => {
				const oProperty = oTable.getPropertyHelper().getProperty(sProperty);
				if (oProperty && oProperty.groupable) {
					aAggregatedGroupableProperties.push(sProperty);
				}
			});

			if (aAggregatedGroupableProperties.length > 0) {
				// It is not possible to group and aggregate by the same property at the same time. Aggregated properties that are also groupable are
				// filtered out in the GroupController. This message should inform the user about that.
				return {
					validation: coreLibrary.MessageType.Information,
					message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION_TOTALS", [
						oListFormat.format(aAggregatedGroupableProperties)
					])
				};
			}
		} else if (oTable._isOfType(TableType.ResponsiveTable)) {
			if (hasStateForInvisibleColumns(oTable, oState.items, oState.groupLevels)) {
				// Grouping by a property that isn't visible in the table (not requested from the backend) causes issues with the group header text.
				// Corresponding group conditions are not applied.
				return {
					validation: coreLibrary.MessageType.Information,
					message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION_VISIBLE")
				};
			}
		}

		return null;
	}

	function validateColumnState(oTable, oState) {
		const oResourceBundle = Lib.getResourceBundleFor("sap.ui.mdc");
		const aAggregateProperties = oState.aggregations && Object.keys(oState.aggregations);
		let sMessage;

		if (oTable._isOfType(TableType.ResponsiveTable)) {
			if (hasStateForInvisibleColumns(oTable, oState.items, oState.groupLevels)) {
				// Grouping by a property that isn't visible in the table (not requested from the backend) causes issues with the group header text.
				// Corresponding group conditions are not applied.
				return {
					validation: coreLibrary.MessageType.Information,
					message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION_VISIBLE")
				};
			}
		}

		if (hasStateForInvisibleColumns(oTable, oState.items, aAggregateProperties)) {
			// Aggregating by properties that are not visible in the table (not requested from the backend) is not possible in analytical scenarios.
			// Corresponding aggregate conditions are not applied.
			sMessage = oResourceBundle.getText("table.PERSONALIZATION_DIALOG_TOTAL_RESTRICTION");
		}

		if (isAnalyticsEnabled(oTable) && hasStateForInvisibleColumns(oTable, oState.items, oState.sorters)) {
			// Sorting by properties that are not visible in the table (not requested from the backend) is not possible in analytical scenarios.
			// Corresponding sort conditions are not applied.
			const sSortMessage = oResourceBundle.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION");
			sMessage = sMessage ? sMessage + "\n" + sSortMessage : sSortMessage;
		}

		if (sMessage) {
			return {
				validation: coreLibrary.MessageType.Information,
				message: sMessage
			};
		}

		return null;
	}

	Delegate.preInit = function() { // not used in the table, but is overridden in FE
		return Promise.resolve();
	};

	/**
	 * @inheritDoc
	 */
	Delegate.initializeContent = function(oTable) {
		return TableDelegate.initializeContent.apply(this, arguments).then(() => {
			if (!TableMap.has(oTable)) {
				TableMap.set(oTable, {});
			}
			return configureInnerTable(oTable);
		}).then(() => {
			setAggregation(oTable);
		});
	};

	/**
	 * @inheritDoc
	 */
	Delegate.initializeSelection = function(oTable) {
		if (oTable._isOfType(TableType.Table, true)) {
			return initializeGridTableSelection(oTable);
		} else {
			return TableDelegate.initializeSelection.apply(this, arguments);
		}
	};

	function initializeGridTableSelection(oTable) {
		const mSelectionModeMap = {
			Single: "Single",
			SingleMaster: "Single",
			Multi: "MultiToggle"
		};

		return loadModules("sap/ui/table/plugins/ODataV4Selection").then((aModules) => {
			const ODataV4SelectionPlugin = aModules[0];

			oTable._oTable.addDependent(new ODataV4SelectionPlugin({
				limit: "{$sap.ui.mdc.Table#type>/selectionLimit}",
				enableNotification: true,
				hideHeaderSelector: "{= !${$sap.ui.mdc.Table#type>/showHeaderSelector} }",
				selectionMode: {
					path: "$sap.ui.mdc.Table>/selectionMode",
					formatter: function(sSelectionMode) {
						return mSelectionModeMap[sSelectionMode];
					}
				},
				enabled: {
					path: "$sap.ui.mdc.Table>/selectionMode",
					formatter: function(sSelectionMode) {
						return sSelectionMode in mSelectionModeMap;
					}
				},
				selectionChange: function(oEvent) {
					oTable._onSelectionChange({
						selectAll: oEvent.getParameter("selectAll")
					});
				}
			}));
		});
	}

	function setSelectedGridTableConditions(oTable, aContexts) {
		oTable.clearSelection();

		for (const oContext of aContexts) {
			oContext.setSelected(true);
		}

		// There's currently no way for the plugin to detect that selection of a context changed, so an update needs to be triggered manually.
		oTable._oTable.invalidate();
	}

	/**
	 * @inheritDoc
	 */
	Delegate.setSelectedContexts = function(oTable, aContexts) {
		if (oTable._isOfType(TableType.Table, true)) {
			const sSelectionMode = oTable.getSelectionMode();

			if (sSelectionMode === SelectionMode.None
				|| ((sSelectionMode === SelectionMode.Single
					|| sSelectionMode === SelectionMode.SingleMaster)
					&& aContexts.length > 1)
			) {
				throw Error("Unsupported operation: Cannot select the given number of contexts in the current selection mode");
			}

			setSelectedGridTableConditions(oTable, aContexts);
		} else {
			TableDelegate.setSelectedContexts.apply(this, arguments);
		}
	};

	/**
	 * @inheritDoc
	 */
	Delegate.getSelectedContexts = function(oTable) {
		if (!oTable._oTable) {
			return [];
		}

		if (oTable._isOfType(TableType.Table, true)) {
			const oODataV4SelectionPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.ODataV4Selection");
			return oODataV4SelectionPlugin ? oODataV4SelectionPlugin.getSelectedContexts() : [];
		}

		return TableDelegate.getSelectedContexts.apply(this, arguments);
	};

	/**
	 * Updates the aggregation info if the plugin is enabled.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} [oBindingInfo] The binding info object to be used to bind the table to the model
	 */
	function setAggregation(oTable, oBindingInfo) {
		const oPlugin = TableMap.get(oTable).plugin;

		if (!oPlugin || oPlugin.isDestroyed()) {
			return;
		}

		const aGroupLevels = oTable._getGroupedProperties().map((mGroupLevel) => {
			return mGroupLevel.name;
		});
		const aAggregates = Object.keys(oTable._getAggregatedProperties());
		const sSearch = oBindingInfo ? oBindingInfo.parameters["$search"] : undefined;

		if (sSearch) {
			delete oBindingInfo.parameters["$search"];
		}

		const oAggregationInfo = {
			visible: getVisiblePropertyNames(oTable),
			groupLevels: aGroupLevels,
			grandTotal: aAggregates,
			subtotals: aAggregates,
			columnState: getColumnState(oTable, aAggregates),
			search: sSearch
		};

		oPlugin.setAggregationInfo(oAggregationInfo);
	}

	function getVisiblePropertyNames(oTable) {
		const oVisiblePropertiesSet = new Set();

		oTable.getColumns().forEach((oColumn) => {
			const oProperty = oTable.getPropertyHelper().getProperty(oColumn.getPropertyKey());

			if (!oProperty) {
				return;
			}

			oProperty.getSimpleProperties().forEach((oProperty) => {
				oVisiblePropertiesSet.add(oProperty.name);
			});
		});

		return Array.from(oVisiblePropertiesSet);
	}

	function getColumnState(oTable, aAggregatedPropertyNames) {
		const mColumnState = {};

		oTable.getColumns().forEach((oColumn) => {
			let sInnerColumnId = oColumn.getId() + "-innerColumn";
			const aAggregatedProperties = getAggregatedColumnProperties(oTable, oColumn, aAggregatedPropertyNames);
			const bColumnIsAggregated = aAggregatedProperties.length > 0;

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

			findUnitColumns(oTable, aAggregatedProperties).forEach((oUnitColumn) => {
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

	// TODO: Move this to TablePropertyHelper (or even base PropertyHelper - another variant of getSimpleProperties?)
	function getColumnProperties(oTable, oColumn) {
		const oProperty = oTable.getPropertyHelper().getProperty(oColumn.getPropertyKey());

		if (!oProperty) {
			return [];
		} else {
			return oProperty.getSimpleProperties();
		}
	}

	function getAggregatedColumnProperties(oTable, oColumn, aAggregatedProperties) {
		return getColumnProperties(oTable, oColumn).filter((oProperty) => {
			return aAggregatedProperties.includes(oProperty.name);
		});
	}

	function findUnitColumns(oTable, aProperties) {
		const aUnitProperties = [];

		aProperties.forEach((oProperty) => {
			if (oProperty.unitProperty) {
				aUnitProperties.push(oProperty.unitProperty);
			}
		});

		return oTable.getColumns().filter((oColumn) => {
			return getColumnProperties(oTable, oColumn).some((oProperty) => {
				return aUnitProperties.includes(oProperty);
			});
		});
	}

	function hasStateForInvisibleColumns(oTable, aItems, aStates) {
		const aPropertyNames = [];

		if (aItems) {
			aItems.forEach((oItem) => {
				oTable.getPropertyHelper().getProperty(oItem.name).getSimpleProperties().forEach((oProperty) => {
					aPropertyNames.push(oProperty.name);
				});
			});
		}

		const bOnlyVisibleColumns = aStates ? aStates.every((oState) => {
			return aPropertyNames.find((sPropertyName) => {
				return oState.name ? oState.name === sPropertyName : oState === sPropertyName;
			});
		}) : true;

		return !bOnlyVisibleColumns;
	}

	/**
	 * Compares the message type and returns the message with higher priority.
	 *
	 * @param {Object} oBaseState Message set by the base <code>TableDelegate</code>
	 * @param {Object} oValidationState Message set by the <code>ODataV4Delegate</code>
	 * @returns {Object} The message with higher priority
	 * @private
	 */
	function mergeValidationResults(oBaseState, oValidationState) {
		const oSeverity = { Error: 1, Warning: 2, Information: 3, None: 4 };

		if (!oValidationState || oSeverity[oValidationState.validation] - oSeverity[oBaseState.validation] > 0) {
			return oBaseState;
		} else {
			return oValidationState;
		}
	}

	/**
	 * Checks whether aggregation features of the model are used.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {boolean} Whether aggregation features are used
	 * @see sap.ui.model.odata.v4.ODataListBinding#setAggregation
	 */
	function isAnalyticsEnabled(oTable) {
		return (oTable.isGroupingEnabled() || oTable.isAggregationEnabled()) && oTable._isOfType(TableType.Table);
	}

	/**
	 * Configures the inner table to support the personalization settings of the table.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @return {Promise} A <code>Promise</code> that resolves when the inner table is configured
	 */
	function configureInnerTable(oTable) {
		if (oTable._isOfType(TableType.Table)) {
			return (isAnalyticsEnabled(oTable) ? enableGridTablePlugin(oTable) : disableGridTablePlugin(oTable)).then(() => {
				return setUpTableObserver(oTable);
			});
		}
		return Promise.resolve();
	}

	function enableGridTablePlugin(oTable) {
		const mTableMap = TableMap.get(oTable);
		let oPlugin = mTableMap.plugin;

		if (oPlugin && !oPlugin.isDestroyed()) {
			oPlugin.activate();
			return Promise.resolve();
		}

		// The property helper is initialized after the table "initialized" promise resolves. So we can only wait for the property helper.
		return Promise.all([
			oTable.awaitPropertyHelper(), loadModules("sap/ui/table/plugins/V4Aggregation")
		]).then((aResult) => {
			const V4AggregationPlugin = aResult[1][0];
			const oDelegate = oTable.getControlDelegate();

			oPlugin = new V4AggregationPlugin({
				groupHeaderFormatter: function(oContext, sProperty) {
					return oDelegate.formatGroupHeader(oTable, oContext, sProperty);
				}
			});
			oPlugin.setPropertyInfos(oTable.getPropertyHelper().getPropertiesForPlugin());
			oTable.propertiesFinalized().then(() => {
				oPlugin.setPropertyInfos(oTable.getPropertyHelper().getPropertiesForPlugin());
			});
			oTable._oTable.addDependent(oPlugin);
			mTableMap.plugin = oPlugin;
		});
	}

	function disableGridTablePlugin(oTable) {
		const mTableMap = TableMap.get(oTable);

		if (mTableMap.plugin) {
			mTableMap.plugin.deactivate();
		}

		return Promise.resolve();
	}

	function setUpTableObserver(oTable) {
		const mTableMap = TableMap.get(oTable);

		if (!mTableMap.observer) {
			mTableMap.observer = new ManagedObjectObserver((oChange) => {
				configureInnerTable(oTable);
			});

			mTableMap.observer.observe(oTable, {
				properties: ["p13nMode"]
			});
		}
	}

	return Delegate;
});