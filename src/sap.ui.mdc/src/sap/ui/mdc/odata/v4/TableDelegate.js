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
	"sap/ui/core/format/ListFormat",
	"sap/ui/core/message/MessageType"
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
	ListFormat,
	MessageType
) => {
	"use strict";

	/**
	 * Base delegate for {@link sap.ui.mdc.Table} and <code>ODataV4</code>. Extend this object in your project to use all functionalities of the
	 * table. For more information, please see {@link module:sap/ui/mdc/TableDelegate}.
	 *
	 * <b>Note:</b> This base delegate supports the <code>p13nMode</code> <code>Aggregate</code> only if the table type is
	 * {@link sap.ui.mdc.table.GridTableType GridTable}, and the <code>p13nMode</code> <code>Group</code> is not supported if the table type is
	 * {@link sap.ui.mdc.table.TreeTableType TreeTable}. This cannot be changed in your delegate implementation.<br>
	 * If the table type is {@link sap.ui.mdc.table.GridTableType GridTable}, and <code>p13nMode</code> <code>Group</code> or <code>p13nMode</code>
	 * <code>Aggregate</code> is enabled, only groupable or aggregatable properties are loaded from the back end. Also, the path of a property must
	 * not contain a <code>NavigationProperty</code>.
	 *
	 * @author SAP SE
	 * @namespace
	 * @alias module:sap/ui/mdc/odata/v4/TableDelegate
	 * @extends module:sap/ui/mdc/TableDelegate
	 * @public
	 * @since 1.85
	 */
	const Delegate = Object.assign({}, TableDelegate);

	/**
	 * Retrieves information about the relevant properties.
	 *
	 * By default, this method returns a <code>Promise</code> that resolves with an empty array.
	 *
	 * @name module:sap/ui/mdc/odata/v4/TableDelegate.fetchProperties
	 * @function
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {Promise<sap.ui.mdc.odata.v4.TablePropertyInfo[]>} A <code>Promise</code> that resolves with the property information
	 * @protected
	 */

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
	 * @inheritDoc
	 */
	Delegate.updateBindingInfo = function(oTable, oBindingInfo) {
		const oCurrentAggregation = oTable.getRowBinding()?.getAggregation();

		TableDelegate.updateBindingInfo.apply(this, arguments);

		if ("expandTo" in (oCurrentAggregation ?? {})) {
			// The binding throws an error if expandTo is set without the hierarchyQualifier parameter. We assume that once a hierarchyQualifier is
			// set, it is always set. If the delegate decides to no longer add the hierarchyQualifier, it needs to actively remove the automatically
			// added $$aggregation parameter.
			oBindingInfo.parameters.$$aggregation = {expandTo: oCurrentAggregation.expandTo};
		}

		if (!isAnalyticsEnabled(oTable)) {
			const aInResultPropertyKeys = getInResultPropertyKeys(oTable);

			if (aInResultPropertyKeys.length > 0) {
				const oPropertyHelper = oTable.getPropertyHelper();
				oBindingInfo.parameters.$select = aInResultPropertyKeys.map((sKey) => oPropertyHelper.getProperty(sKey).path);
			}
		}
	};

	/**
	 * @inheritDoc
	 */
	Delegate.getGroupSorter = function(oTable) {
		const oGroupedProperty = oTable._getGroupedProperties()[0];

		if (!oGroupedProperty || !oTable._isOfType(TableType.ResponsiveTable)) {
			return undefined;
		}

		if (!getVisiblePropertyKeys(oTable).includes(oGroupedProperty.name)) {
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

		// Sorting by a property that is not in the aggregation info (sorting by a property that is not requested) causes a back end error.
		if (isAnalyticsEnabled(oTable)) {
			const oPropertyHelper = oTable.getPropertyHelper();
			const aVisiblePropertyPaths = getVisiblePropertyKeys(oTable).map((sPropertyName) => oPropertyHelper.getProperty(sPropertyName).path);

			aSorters = aSorters.filter((oSorter) => aVisiblePropertyPaths.includes(oSorter.sPath));
		}

		return aSorters;
	};

	/**
	 * Updates the binding of the table with the binding info object returned from
	 * {@link module:sap/ui/mdc/TableDelegate.updateBindingInfo updateBindingInfo}. If an update is not possible, it rebinds the table.
	 *
	 * Compares the current and previous state of the table to detect whether rebinding is necessary.
	 * The diffing is done for the sorters, filters, aggregation, parameters, and the path of the binding.
	 * Other {@link sap.ui.base.ManagedObject.AggregationBindingInfo binding info} keys, such as <code>events</code> or <code>model</code>, must be
	 * provided in <code>updateBindingInfo</code>, and those keys must not be changed conditionally.
	 *
	 * <b>Note:</b> To remove a binding info parameter, the value must be set to <code>undefined</code> in
	 * <code>updateBindingInfo</code>. For more information, see {@link sap.ui.model.odata.v4.ODataListBinding#changeParameters}.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table
	 * @param {sap.ui.model.ListBinding} [oBinding] The binding instance of the table that can be used to update the binding and avoid a rebind
	 * @param {object} [mSettings] Additional settings
	 * @param {boolean} [mSettings.forceRefresh] Indicates that the binding has to be refreshed even if the binding info has not changed
	 * @see rebind
	 * @protected
	 * @override
	 */
	Delegate.updateBinding = function(oTable, oBindingInfo, oBinding, mSettings) {
		// Custom $$aggregation is not supported if analytical features are enabled.
		if (isAnalyticsEnabled(oTable)) {
			updateAggregation(oTable, oBindingInfo);
		}

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

			oBinding.setAggregation(oBindingInfo.parameters?.$$aggregation);
			oBinding.changeParameters((() => {
				const mParameters = {...oBindingInfo.parameters};
				delete mParameters.$$aggregation;
				return mParameters;
			})());
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

	Delegate.fetchExpandAndCollapseConfiguration = function(oTable) {
		if (!oTable._isOfType(TableType.TreeTable)) {
			return Promise.resolve({});
		}

		return Promise.resolve({
			expandAll: function(oTable) {
				expandRowsToLevel(oTable, Number.MAX_SAFE_INTEGER);
			},
			collapseAll: function(oTable) {
				expandRowsToLevel(oTable, 1);
			},
			expandAllFromNode: function(oTable, oContext) {
				oContext.expand(Number.MAX_SAFE_INTEGER);
			},
			collapseAllFromNode: function(oTable, oContext) {
				oContext.collapse(true);
			},
			isNodeExpanded: function(oTable, oContext) {
				return oContext.getProperty("@$ui5.node.isExpanded");
			}
		});
	};

	function expandRowsToLevel(oTable, iLevel) {
		const oBinding = oTable.getRowBinding();

		if (!oBinding) {
			return;
		}

		const bIsSameLevel = oBinding.getAggregation()?.expandTo === iLevel;

		if (bIsSameLevel) {
			oBinding.refresh();
		} else {
			oBinding.setAggregation({...oBinding.getAggregation(), ...{expandTo: iLevel}});
		}
	}

	/**
	 * Returns the keys of properties that should always be included in the result of the collection requested from the back end. This information is
	 * applied when updating the table's binding.
	 *
	 * By default, this method returns an empty array.
	 *
	 * <b>Note:</b> If properties are provided in the table's {@link sap.ui.mdc.Table propertyInfo} property, the properties whose keys are returned
	 * by this method must be included, otherwise they may not be in included the result.<br>
	 * The path of a property must not be empty.<br>
	 * If a property is complex, the properties it references are taken into account.<br>
	 * If <code>autoExpandSelect</code> of the {@link sap.ui.model.odata.v4.ODataModel} is not enabled, this method must return an empty array.
	 * If the table type is {@link sap.ui.mdc.table.GridTableType GridTable} and <code>p13nMode</code> <code>Group</code> or <code>p13nMode</code>
	 * <code>Aggregate</code> is enabled, also see the restrictions in the description of the
	 * {@link module:sap/ui/mdc/odata/v4/TableDelegate TableDelegate}.<br>
	 * For more information about properties, see {@link sap.ui.mdc.odata.v4.TablePropertyInfo PropertyInfo}.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {string[]} Property keys
	 * @protected
	 */
	Delegate.getInResultPropertyKeys = function(oTable) {
		return [];
	};

	/**
	 * @inheritDoc
	 */
	Delegate.getSupportedFeatures = function(oTable) {
		const mSupportedFeatures = TableDelegate.getSupportedFeatures.apply(this, arguments);

		if (oTable._isOfType(TableType.Table)) {
			const aP13nModes = mSupportedFeatures.p13nModes;

			if (!aP13nModes.includes(P13nMode.Group)) {
				aP13nModes.push(P13nMode.Group);
			}
			if (!aP13nModes.includes(P13nMode.Aggregate)) {
				aP13nModes.push(P13nMode.Aggregate);
			}
		}

		return {
			...mSupportedFeatures
		};
	};

	/**
	 * @inheritDoc
	 */
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
				validation: MessageType.Information,
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
					validation: MessageType.Information,
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
					validation: MessageType.Information,
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
					validation: MessageType.Information,
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
				validation: MessageType.Information,
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
	Delegate.initializeContent = async function(oTable) {
		await TableDelegate.initializeContent.apply(this, arguments);

		if (oTable._isOfType(TableType.Table)) {
			await configureGridTable(oTable);
		}
	};

	async function configureGridTable(oTable) {
		const [V4AggregationPlugin] = await loadModules("sap/ui/table/plugins/V4Aggregation");

		oTable._oTable.addDependent(new V4AggregationPlugin({
			groupHeaderFormatter: function(oContext) {
				const aGroupedPropertyKeys = oTable._getGroupedProperties().map((mGroupLevel) => mGroupLevel.name);
				const sGroupLevelKey = aGroupedPropertyKeys[oContext.getProperty("@$ui5.node.level") - 1];
				return oTable.getControlDelegate().formatGroupHeader(oTable, oContext, sGroupLevelKey);
			}
		}));
	}

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

			oTable.clearSelection();

			for (const oContext of aContexts) {
				oContext.setSelected(true);
			}
		} else {
			TableDelegate.setSelectedContexts.apply(this, arguments);
		}
	};

	/**
	 * @inheritDoc
	 */
	Delegate.getSelectedContexts = function(oTable) {
		if (oTable._isOfType(TableType.Table, true)) {
			return PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.ODataV4Selection")?.getSelectedContexts() ?? [];
		}

		return TableDelegate.getSelectedContexts.apply(this, arguments);
	};

	/**
	 * Sets the $$aggregation binding parameter to the binding info and updates the table, for example, to prepare it for displaying the grand total.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} [oBindingInfo] The binding info object to be used to bind the table to the model
	 */
	function updateAggregation(oTable, oBindingInfo) {
		const mAggregation = create$$Aggregation(oTable);
		const sSearch = oBindingInfo.parameters.$search;

		if (mAggregation && sSearch) {
			delete oBindingInfo.parameters.$search;
			mAggregation.search = sSearch;
		}

		oBindingInfo.parameters.$$aggregation = mAggregation;

		const bHasGrandTotal = Object.keys(mAggregation?.aggregate || {}).some((sKey) => {
			return mAggregation.aggregate[sKey].grandTotal;
		});
		oTable.getModel("$sap.ui.mdc.Table").setProperty("/@custom/hasGrandTotal", bHasGrandTotal);

		const V4AggregationPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.V4Aggregation");
		V4AggregationPlugin?.declareColumnsHavingTotals(getColumnsWithTotals(oTable).map((oColumn) => oColumn.getInnerColumn()));
	}

	function getVisiblePropertyKeys(oTable) {
		return getSimplePropertyKeys(oTable, oTable.getColumns());
	}

	function getInResultPropertyKeys(oTable) {
		return getSimplePropertyKeys(oTable, oTable.getControlDelegate().getInResultPropertyKeys(oTable));
	}

	function getColumnsWithTotals(oTable) {
		const aTotaledPropertyKeys = Object.keys(oTable._getAggregatedProperties());
		const oColumnsWithTotals = new Set();

		for (const oColumn of oTable.getColumns()) {
			const aRelevantColumnProperties = getColumnProperties(oTable, oColumn).filter((oProperty) => {
				return aTotaledPropertyKeys.includes(oProperty.name);
			});
			const bColumnHasTotals = aRelevantColumnProperties.length > 0;

			if (bColumnHasTotals) {
				oColumnsWithTotals.add(oColumn);

				findUnitColumns(oTable, aRelevantColumnProperties).forEach((oUnitColumn) => {
					oColumnsWithTotals.add(oUnitColumn);
				});
			}
		}

		return Array.from(oColumnsWithTotals);
	}

	// TODO: Move this to TablePropertyHelper for reuse?
	/**
	 * Gets the keys of simple properties. For complex properties, the keys of the simple properties, which they reference, are collected. Keys of
	 * properties that are not known to the property helper are filtered out and do not trigger a <code>fetchProperties</code> call.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {string[] | sap.ui.mdc.table.Column[]} vKeys The keys or the columns from which the keys are obtained
	 * @returns {string[]} Keys of simply properties
	 */
	function getSimplePropertyKeys(oTable, vKeys) {
		const oPropertyHelper = oTable.getPropertyHelper();
		const aKeys = typeof vKeys[0] === "object" ? vKeys.map((oColumn) => oColumn.getPropertyKey()) : vKeys;

		return Array.from(new Set(aKeys.flatMap((sKey) => {
			return oPropertyHelper.getProperty(sKey)?.getSimpleProperties().map((oProperty) => oProperty.key) || [];
		})));
	}

	// TODO: Move this to TablePropertyHelper for reuse?
	function getColumnProperties(oTable, oColumn) {
		const oProperty = oTable.getPropertyHelper().getProperty(oColumn.getPropertyKey());

		if (!oProperty) {
			return [];
		} else {
			return oProperty.getSimpleProperties();
		}
	}

	function findUnitColumns(oTable, aProperties) {
		const aUnitPropertyKeys = [];

		aProperties.forEach((oProperty) => {
			if (oProperty.unit) {
				aUnitPropertyKeys.push(oProperty.unit);
			}
		});

		return oTable.getColumns().filter((oColumn) => {
			return getColumnProperties(oTable, oColumn).some((oProperty) => {
				return aUnitPropertyKeys.includes(oProperty.key);
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
		const oSeverity = {Error: 1, Warning: 2, Information: 3, None: 4};

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
		return oTable._isOfType(TableType.Table) && (oTable.getGroupConditions() || oTable.isGroupingEnabled() ||
			oTable.getAggregateConditions() || oTable.isAggregationEnabled());
	}

	function create$$Aggregation(oTable) {
		const aVisiblePropertyKeys = getVisiblePropertyKeys(oTable);

		if (aVisiblePropertyKeys.length === 0) {
			return undefined;
		}

		const oPropertyHelper = oTable.getPropertyHelper();
		const aGroupedPropertyKeys = oTable._getGroupedProperties().map((mGroupLevel) => mGroupLevel.name);
		const aTotaledPropertyKeys = Object.keys(oTable._getAggregatedProperties());
		const mAggregation = {
			group: {},
			groupLevels: [],
			aggregate: {},
			grandTotalAtBottomOnly: true,
			subtotalsAtBottomOnly: true
		};

		// Add key properties to prevent data aggregation on leafs.
		addKeyPropertiesTo$$Aggregation(mAggregation, oTable);

		addInResultPropertiesTo$$Aggregation(mAggregation, oTable);

		// We need to consider group levels as visible properties, to add them in the query properly if they have additional properties.
		aGroupedPropertyKeys.forEach((sPropertyKey) => {
			if (aVisiblePropertyKeys.indexOf(sPropertyKey) < 0) {
				aVisiblePropertyKeys.push(sPropertyKey);
			}
		});

		for (const sPropertyKey of aVisiblePropertyKeys) {
			const oProperty = oPropertyHelper.getProperty(sPropertyKey);

			if (!oProperty.extension.technicallyGroupable && !oProperty.extension.technicallyAggregatable) {
				continue;
			}

			// Skip text property if its ID is visible.
			const oAdditionalProperty = oPropertyHelper.getProperty(oProperty.extension.additionalProperties?.[0]);
			if (oAdditionalProperty?.text === oProperty.key && aVisiblePropertyKeys.includes(oAdditionalProperty.key)) {
				continue;
			}

			if (oProperty.extension.technicallyGroupable) {
				mAggregation.group[oProperty.path] = {};
			}

			if (oProperty.extension.technicallyAggregatable) {
				mAggregation.aggregate[oProperty.path] = {};

				if (aTotaledPropertyKeys.includes(oProperty.key)) {
					mAggregation.aggregate[oProperty.path].grandTotal = true;
					mAggregation.aggregate[oProperty.path].subtotals = true;
				}

				if (oProperty.unit) {
					const oUnitPropertyInfo = oPropertyHelper.getProperty(oProperty.unit);
					if (oUnitPropertyInfo) {
						mAggregation.aggregate[oProperty.path].unit = oUnitPropertyInfo.path;
					}
				}

				if (!oProperty.extension.additionalProperties?.length && oProperty.extension.customAggregate?.contextDefiningProperties) {
					oProperty.extension.customAggregate.contextDefiningProperties.forEach((sContextDefiningPropertyKey) => {
						const oDefiningPropertyInfo = oPropertyHelper.getProperty(sContextDefiningPropertyKey);
						if (oDefiningPropertyInfo) {
							mAggregation.group[oDefiningPropertyInfo.path] = {};
						}
					});
				}
			}

			const aAdditionalPropertyPaths = getAdditionalPropertyPaths(oProperty, oPropertyHelper);

			if (oProperty.extension.technicallyAggregatable) {
				for (const sPropertyPath of aAdditionalPropertyPaths) {
					mAggregation.group[sPropertyPath] = {};
				}
			} else if (oProperty.extension.technicallyGroupable && oProperty.path in mAggregation.group) {
				mAggregation.group[oProperty.path].additionally = aAdditionalPropertyPaths;
			}
		}

		// Visual grouping (expandable groups)
		aGroupedPropertyKeys.forEach((sPropertyKey) => {
			const oProperty = oPropertyHelper.getProperty(sPropertyKey);
			if (oProperty) {
				mAggregation.groupLevels.push(oProperty.path);
			}
		});

		if (!Object.keys(mAggregation.group).length && !Object.keys(mAggregation.aggregate).length) {
			return undefined;
		}

		sanitize$$Aggregation(mAggregation);

		return mAggregation;
	}

	function getAdditionalPropertyPaths(oProperty, oPropertyHelper) {
		const oPropertyPaths = new Set();

		if (oProperty.text) {
			const oTextProperty = oPropertyHelper.getProperty(oProperty.text);
			oPropertyPaths.add(oTextProperty.path);
		}

		for (const sPropertyKey of oProperty.extension.additionalProperties ?? []) {
			const oAdditionalProperty = oPropertyHelper.getProperty(sPropertyKey);
			oPropertyPaths.add(oAdditionalProperty.path);
		}

		return Array.from(oPropertyPaths);
	}

	function addKeyPropertiesTo$$Aggregation(mAggregation, oTable) {
		oTable.getPropertyHelper().getProperties().forEach((oProperty) => {
			if (oProperty.isKey) {
				mAggregation.group[oProperty.path] = {};
			}
		});
	}

	function addInResultPropertiesTo$$Aggregation(mAggregation, oTable) {
		const oPropertyHelper = oTable.getPropertyHelper();

		for (const sPropertyKey of getInResultPropertyKeys(oTable)) {
			const oProperty = oPropertyHelper.getProperty(sPropertyKey);

			if (oProperty.extension.technicallyGroupable) {
				mAggregation.group[oProperty.path] = {};
			} else if (oProperty.extension.technicallyAggregatable) {
				mAggregation.aggregate[oProperty.path] = {};
			}
		}
	}

	function sanitize$$Aggregation(mAggregation) {
		dedupe$$AggregationGroupAndAggregate(mAggregation); // A property must not be in both "group" and "aggregate".
		dedupe$$AggregationAdditionally(mAggregation); // A property must not be in "group" if it is in "group.additionally".
	}

	function dedupe$$AggregationGroupAndAggregate(mAggregation) {
		for (const sPath in mAggregation.group) {
			if (sPath in mAggregation.aggregate) {
				// To get the totals, the property needs to be in "aggregate".
				if (mAggregation.aggregate[sPath].grandTotal || mAggregation.aggregate[sPath].subtotals) {
					delete mAggregation.group[sPath];
				} else {
					delete mAggregation.aggregate[sPath];
				}
			}
		}
	}

	function dedupe$$AggregationAdditionally(mAggregation) {
		const oAllAdditionalPropertyPaths = new Set();

		for (const sPath in mAggregation.group) {
			mAggregation.group[sPath].additionally?.forEach((sPath) => oAllAdditionalPropertyPaths.add(sPath));
		}

		// If the table is visually grouped by a property (the property is in groupLevels), its additional properties also need to be available in the
		// group header context. For this, they need to be in "additionally" of the grouped property and therefore have to be removed from "group".
		// If that leads to missing (additional) properties, the issue is unsupported nesting of additional properties. If X has additional property
		// Y, and Y has additional property Z, then Z must be an additional property of X as well.
		for (const sPath of oAllAdditionalPropertyPaths) {
			if (sPath in mAggregation.group) {
				delete mAggregation.group[sPath];
			}
		}
	}

	return Delegate;
});