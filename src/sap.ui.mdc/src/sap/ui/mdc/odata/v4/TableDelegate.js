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
	"sap/ui/core/message/MessageType",
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
	ListFormat,
	MessageType,
	ManagedObjectObserver
) => {
	"use strict";

	const TableMap = new window.WeakMap(); // To store table-related information for easy access in the delegate.

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
		TableDelegate.updateBindingInfo.apply(this, arguments);

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
	 * Expands all rows.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @throws {Error} If
	 *     <ul>
	 *       <li>the table type is not {@link sap.ui.mdc.table.TreeTableType TreeTable}</li>
	 *       <li>{@link sap.ui.model.odata.v4.ODataListBinding#setAggregation} throws an error</li>
	 *       <li>{@link sap.ui.model.odata.v4.ODataListBinding#refresh} throws an error</li>
	 *     </ul>
	 * @protected
	 * @override
	 */
	Delegate.expandAllRows = function(oTable) {
		if (!this.getSupportedFeatures(oTable).expandAllRows) {
			throw Error("Unsupported operation: Not supported for the current table type");
		}

		expandRowsToLevel(oTable, Number.MAX_SAFE_INTEGER);
	};

	/**
	 * Collapses all rows.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @throws {Error} If
	 *     <ul>
	 *       <li>the table type is not {@link sap.ui.mdc.table.TreeTableType TreeTable}</li>
	 *       <li>{@link sap.ui.model.odata.v4.ODataListBinding#setAggregation} throws an error</li>
	 *       <li>{@link sap.ui.model.odata.v4.ODataListBinding#refresh} throws an error</li>
	 *     </ul>
	 * @protected
	 * @override
	 */
	Delegate.collapseAllRows = function(oTable) {
		if (!this.getSupportedFeatures(oTable).collapseAllRows) {
			throw Error("Unsupported operation: Not supported for the current table type");
		}

		expandRowsToLevel(oTable, 1);
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
	 * <code>Aggregate</code> is enabled, referenced properties, for example, properties that are referenced via <code>text</code> or
	 * <code>unit</code>, are also included in the result. Please also see the restrictions in the description of the {@link module:sap/ui/mdc/odata/v4/TableDelegate TableDelegate}.<br>
	 * For more information about properties, see {@link sap.ui.mdc.odata.v4.TablePropertyInfo PropertyInfo}.
	 *
	 * @param {sap.ui.mdc.Table} Instance of the table
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
		const bIsTreeTable = oTable._isOfType(TableType.TreeTable);

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
			...mSupportedFeatures,
			expandAllRows: bIsTreeTable,
			collapseAllRows: bIsTreeTable
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

		const aInResultPropertyKeys = Array.from(new Set([
			...getVisiblePropertyKeys(oTable),
			...getInResultPropertyKeys(oTable)
		]));
		const aGroupLevels = oTable._getGroupedProperties().map((mGroupLevel) => mGroupLevel.name);
		const aAggregates = Object.keys(oTable._getAggregatedProperties());
		const mColumnState = getColumnState(oTable, aAggregates);
		const sSearch = oBindingInfo?.parameters["$search"];

		if (sSearch) {
			delete oBindingInfo.parameters["$search"];
		}

		oPlugin.setAggregationInfo({
			visible: aInResultPropertyKeys,
			groupLevels: aGroupLevels,
			grandTotal: aAggregates,
			subtotals: aAggregates,
			columnState: mColumnState,
			search: sSearch
		});
	}

	function getVisiblePropertyKeys(oTable) {
		return getSimplePropertyKeys(oTable, oTable.getColumns());
	}

	function getInResultPropertyKeys(oTable) {
		return getSimplePropertyKeys(oTable, oTable.getControlDelegate().getInResultPropertyKeys(oTable));
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