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
	 * @typedef {sap.ui.mdc.table.PropertyInfo} sap.ui.mdc.odata.v4.TableDelegate.PropertyInfo
	 *
	 * An object literal describing a data property in the context of a {@link sap.ui.mdc.Table} with
	 * {@link module:sap/ui/mdc/odata/v4/TableDelegate sap/ui/mdc/odata/v4/TableDelegate}.
	 *
	 * When specifying the <code>PropertyInfo</code> objects in the {@link sap.ui.mdc.Table#getPropertyInfo propertyInfo} property, the following
	 * attributes need to be specified:
	 * <ul>
	 *   <li><code>key</code></li>
	 *   <li><code>path</code></li>
	 *   <li><code>dataType</code></li>
	 *   <li><code>formatOptions</code></li>
	 *   <li><code>constraints</code></li>
	 *   <li><code>maxConditions</code></li>
	 *   <li><code>caseSensitive</code></li>
	 *   <li><code>visualSettings.widthCalculation</code></li>
	 *   <li><code>propertyInfos</code></li>
	 *   <li><code>groupable</code></li>
	 *   <li><code>isKey</code></li>
	 *   <li><code>unit</code></li>
	 *   <li><code>text</code></li>
	 *   <li><code>aggregatable</code></li>
	 *   <li><code>extension.technicallyGroupable</code></li>
	 *   <li><code>extension.technicallyAggregatable</code></li>
	 * </ul>
	 *
	 * If the property is complex, the following attributes need to be specified:
	 * <ul>
	 *   <li><code>key</code></li>
	 *   <li><code>visualSettings.widthCalculation</code></li>
	 *   <li><code>propertyInfos</code> (all referenced properties must be specified)</li>
	 * </ul>
	 *
	 * @property {boolean} [isKey=false]
	 *   Defines whether a property is a key or part of a key in the data. A key property must be technically groupable.
	 * @property {boolean} [aggregatable=false]
	 *   Defines whether the property is aggregatable. A property can only be declared aggregatable if there is a <code>CustomAggregate</code> whose
	 *   <code>Qualifier</code> is equal to the property key.
	 * @property {Object} [extension]
	 *   Contains model-specific information.
	 * @property {boolean} [extension.technicallyGroupable=false]
	 *   If <code>groupable</code> is set to <code>false</code> to exclude it from group personalization on the UI, the UI still needs to know that
	 *   this property is groupable for data requests. If this attribute is not set, the default value is the same as the value of
	 *   <code>groupable</code>.
	 * @property {boolean} [extension.technicallyAggregatable=false]
	 *   If <code>aggregatable</code> is set to <code>false</code> to exclude it from aggregate personalization on the UI, the UI still needs to know
	 *   that this property is aggregatable for data requests. If this attribute is not set, the default value is the same as the value of
	 *   <code>aggregatable</code>.
	 * @public
	 */

	 /*
	 * restricted for sap.fe (there's no way to make a property of a type private, therefore it's defined outside of the typedef)
	 * TODO: Rename to "contextDefiningProperties" before making it public.
	 * property {string[]} [extension.additionalProperties]
	 *   Properties that are loaded in addition if this property is loaded.
	 *   These properties are not considered for any other functionality, such as export or column width calculation, for example.
	 *   This attribute is only taken into account if data aggregation is enabled.
	 *
	 *   The following restrictions apply:
	 *   <ul>
	 *     <li>If the property is neither technically groupable nor technically aggregatable, it must not reference additional properties.</li>
	 *     <li>If the property is both technically groupable and technically aggregatable, it must not reference additional properties.</li>
	 *     <li>If the property is the text of another property, it must not reference any properties other than its ID property.</li>
	 *     <li>If the property is the unit of another property, it must not reference additional properties.</li>
	 *     <li>If the property is groupable, it must not reference additional properties.</li>
	 *     <li>Do not group this property via API, for example, with the <code>StateUtil</code>.</li>
	 *     <li>Properties referenced via <code>text</code> must not be repeated here.</li>
	 *     <li>Properties referenced via <code>unit</code> must not be repeated here if the property is technically aggregatable.</li>
	 *     <li>There must be no bi-directional references. For example, if property A references B, B must not reference A.</li>
	 *     <li>All nested additional properties must be listed at root level. For example, if property A references B and B references C, A must also
	 *         reference C.</li>
	 *     <li>Additional properties must be technically groupable.</li>
	 *     <li>Additional properties must not be technically aggregatable.</li>
	 *   </ul>
	 */

	/**
	 * Payload for the {@link module:sap/ui/mdc/odata/v4/TableDelegate ODataV4 TableDelegate}. Contains settings to control the behavior of the
	 * delegate.
	 *
	 * @typedef {object} sap.ui.mdc.odata.v4.TableDelegate.Payload
	 * @property {object} [aggregationConfiguration] The configuration that is applied if data aggregation is enabled in the delegate.
	 * @property {boolean} [aggregationConfiguration.leafLevel=false]
	 *     Determines whether aggregation on the leaf level is enabled. If it is enabled, every column change affects the data in the table.
	 * @public
	 * @since 1.132
	 */

	/**
	 * Base delegate for {@link sap.ui.mdc.Table} and <code>ODataV4</code>. Extend this object in your project to use all functionalities of the
	 * table. For more information, please see {@link module:sap/ui/mdc/TableDelegate}.
	 *
	 * Data aggregation is enabled if the table type is {@link sap.ui.mdc.table.GridTableType GridTable}, and at least one of the
	 * following conditions is fulfilled:
	 * <ul>
	 *   <li><code>p13nMode</code> <code>Group</code> is enabled</li>
	 *   <li><code>p13nMode</code> <code>Aggregate</code> is enabled</li>
	 *   <li>The table has group conditions</li>
	 *   <li>The table has aggregate conditions</li>
	 * </ul>
	 *
	 * Data aggregation can be configured via the delegate payload by providing <code>aggregationConfiguration</code>. See
	 * {@link sap.ui.mdc.odata.v4.TableDelegate.Payload} for details.
	 *
	 * <i>Sample delegate object:</i>
	 * <pre>{
	 * 	name: "my/delegate/extending/sap/ui/mdc/odata/v4/TableDelegate",
	 * 	payload: {
	 * 		aggregationConfiguration: {
	 * 			leafLevel: true
	 * 		},
	 * 		...
	 * 	}
	 * }</pre>
	 *
	 * If data aggregation is enabled, the following restrictions apply:
	 * <ul>
	 *   <li>Only properties that are technically groupable or technically aggregatable are loaded from the back end. See
	 *       {@link sap.ui.mdc.odata.v4.TableDelegate.PropertyInfo} for more information about properties.</li>
	 *   <li>The path of a property must not contain a <code>NavigationProperty</code>.</li>
	 * </ul>
	 *
	 * <b>Note:</b> This base delegate supports the <code>p13nMode</code> <code>Aggregate</code> only if the table type is
	 * {@link sap.ui.mdc.table.GridTableType GridTable}. The <code>p13nMode</code> <code>Group</code> is not supported if the table type is
	 * {@link sap.ui.mdc.table.TreeTableType TreeTable}. This cannot be changed in your delegate implementation.
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
	 * @returns {Promise<sap.ui.mdc.odata.v4.TableDelegate.PropertyInfo[]>} A <code>Promise</code> that resolves with the property information
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
			const aVisiblePropertyPaths = getVisiblePropertyKeys(oTable).map((sPropertyKey) => oPropertyHelper.getProperty(sPropertyKey).path);

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
	 * See also the restrictions in the description of the {@link module:sap/ui/mdc/odata/v4/TableDelegate TableDelegate} if data aggregation is
	 * enabled.<br>
	 * For more information about properties, see {@link sap.ui.mdc.odata.v4.TableDelegate.PropertyInfo PropertyInfo}.
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
			enabled: {
				parts: [
					{path: "$sap.ui.mdc.Table>/p13nMode"},
					{path: "$sap.ui.mdc.Table>/groupConditions"},
					{path: "$sap.ui.mdc.Table>/aggregateConditions"}
				],
				formatter: function(sP13nMode, aGroupConditions, aAggregateConditions) {
					return isAnalyticsEnabled(oTable);
				}
			},
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
				return aTotaledPropertyKeys.includes(oProperty.key);
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
		const aPropertyKeys = [];

		if (aItems) {
			aItems.forEach((oItem) => {
				oTable.getPropertyHelper().getProperty(oItem.name).getSimpleProperties().forEach((oProperty) => {
					aPropertyKeys.push(oProperty.key);
				});
			});
		}

		const bOnlyVisibleColumns = aStates ? aStates.every((oState) => {
			return aPropertyKeys.find((sPropertyKey) => {
				return oState.name ? oState.name === sPropertyKey : oState === sPropertyKey;
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
		return oTable._isOfType(TableType.Table) && (oTable._getGroupedProperties().length > 0 || oTable.isGroupingEnabled() ||
			Object.keys(oTable._getAggregatedProperties()).length > 0 || oTable.isAggregationEnabled());
	}

	function create$$Aggregation(oTable) {
		const aVisiblePropertyKeys = getVisiblePropertyKeys(oTable);

		if (aVisiblePropertyKeys.length === 0) {
			return undefined;
		}

		const mAggregationConfig = {
			leafLevel: false,
			...oTable.getPayload()?.aggregationConfiguration
		};
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

		if (!mAggregationConfig.leafLevel) {
			// Add key properties to prevent data aggregation on leafs.
			addKeyPropertiesTo$$Aggregation(mAggregation, oTable);
		}

		addInResultPropertiesTo$$Aggregation(mAggregation, oTable);

		// We need to consider group levels as visible properties, to add them in the query properly if they have additional properties.
		aGroupedPropertyKeys.forEach((sPropertyKey) => {
			if (aVisiblePropertyKeys.indexOf(sPropertyKey) < 0) {
				aVisiblePropertyKeys.push(sPropertyKey);
			}
		});

		for (const sPropertyKey of aVisiblePropertyKeys) {
			const oProperty = oPropertyHelper.getProperty(sPropertyKey);

			if (oProperty.extension.technicallyGroupable) {
				addGroupablePropertyTo$$Aggregation(mAggregation, oTable, oProperty);
			}

			if (oProperty.extension.technicallyAggregatable) {
				addAggregatablePropertyTo$$Aggregation(mAggregation, oTable, oProperty, {
					withTotals: aTotaledPropertyKeys.includes(oProperty.key)
				});
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

	function addGroupablePropertyTo$$Aggregation(mAggregation, oTable, oProperty) {
		const oPropertyHelper = oTable.getPropertyHelper();
		const mGroup = {};

		// Skip the Text property if it depends on the ID property. The ID property must be added to the aggregation instead.
		if (oProperty.extension.additionalProperties.length === 1) {
			const oAdditionalProperty = oPropertyHelper.getProperty(oProperty.extension.additionalProperties[0]);
			if (oAdditionalProperty.text === oProperty.key) { // The additional property is the ID property of this Text property.
				addGroupablePropertyTo$$Aggregation(mAggregation, oTable, oAdditionalProperty);
				return;
			}
		}

		mAggregation.group[oProperty.path] = mGroup;

		const oTextProperty = oPropertyHelper.getProperty(oProperty.text);
		if (oTextProperty) {
			mGroup.additionally = [oTextProperty.path];
		}

		const oUnitProperty = oPropertyHelper.getProperty(oProperty.unit);
		if (oUnitProperty) {
			mAggregation.group[oUnitProperty.path] ??= {};
		}

		for (const sAdditionalPropertyKey of oProperty.extension.additionalProperties) {
			const oAdditionalProperty = oPropertyHelper.getProperty(sAdditionalPropertyKey);
			mAggregation.group[oAdditionalProperty.path] ??= {};
		}
	}

	function addAggregatablePropertyTo$$Aggregation(mAggregation, oTable, oProperty, mSettings) {
		const oPropertyHelper = oTable.getPropertyHelper();
		const mAggregate = {};

		mAggregation.aggregate[oProperty.path] = mAggregate;

		if (mSettings?.withTotals) {
			mAggregate.grandTotal = true;
			mAggregate.subtotals = true;
		}

		const oUnitProperty = oPropertyHelper.getProperty(oProperty.unit);
		if (oUnitProperty) {
			mAggregate.unit = oUnitProperty.path;
		}

		for (const sPropertyKey of oProperty.extension.additionalProperties) {
			const oProperty = oPropertyHelper.getProperty(sPropertyKey);
			mAggregation.group[oProperty.path] ??= {};
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

		// If the table is visually grouped by a property (the property is in groupLevels), its additional properties, for example the Text property,
		// also need to be available in the group header context. To achieve this, they must be in "additionally" of the grouped property and then
		// they must not also be present as a separate key in “group” (binding restriction).
		// If that leads to issues, the PropertyInfo is incorrect. Additional properties are supposed to be in a 1:1 relation.
		for (const sPath of oAllAdditionalPropertyPaths) {
			if (sPath in mAggregation.group) {
				delete mAggregation.group[sPath];
			}
		}
	}

	return Delegate;
});