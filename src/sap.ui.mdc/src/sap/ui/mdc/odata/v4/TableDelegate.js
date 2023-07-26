/*!
 * ${copyright}
 */

sap.ui.define([
	"../../TableDelegate",
	"../../table/V4AnalyticsPropertyHelper",
	"../../util/loadModules",
	"sap/m/ColumnPopoverSelectListItem",
	"sap/m/MessageBox",
	"sap/ui/core/Item",
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/core/format/ListFormat",
	"sap/ui/base/ManagedObjectObserver",
	'sap/ui/mdc/odata/v4/TypeMap',
	'sap/ui/mdc/enums/TableP13nMode',
	'sap/ui/mdc/enums/TableType'
], function(
	TableDelegate,
	V4AnalyticsPropertyHelper,
	loadModules,
	ColumnPopoverSelectListItem,
	MessageBox,
	Item,
	Core,
	coreLibrary,
	ListFormat,
	ManagedObjectObserver,
	ODataV4TypeMap,
	TableP13nMode,
	TableType
) {
	"use strict";

	/*global Set */

	var TableMap = new window.WeakMap(); // To store table-related information for easy access in the delegate.

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
	var Delegate = Object.assign({}, TableDelegate);

	Delegate.getTypeMap = function (oPayload) {
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

	Delegate.preInit = function() { // not used in the table, but is overridden in FE
		return Promise.resolve();
	};

	/**
	 * @inheritDoc
	 */
	Delegate.initializeContent = function(oTable) {
		return TableDelegate.initializeContent.apply(this, arguments).then(function() {
			if (!TableMap.has(oTable)) {
				TableMap.set(oTable, {});
			}
			return configureInnerTable(oTable);
		}).then(function() {
			setAggregation(oTable);
		});
	};

	/**
	 * @inheritDoc
	 */
	Delegate.initializeSelection = function(oTable) {
		if (oTable._bV4LegacySelectionEnabled) {
			return TableDelegate.initializeSelection.apply(this, arguments);
		}

		if (oTable._isOfType(TableType.Table, true)) {
			return initializeGridTableSelection(oTable);
		} else {
			return TableDelegate.initializeSelection.apply(this, arguments);
		}
	};

	function initializeGridTableSelection(oTable) {
		var mSelectionModeMap = {
			Single: "Single",
			SingleMaster: "Single",
			Multi: "MultiToggle"
		};

		return loadModules("sap/ui/table/plugins/ODataV4Selection").then(function(aModules) {
			var ODataV4SelectionPlugin = aModules[0];

			if (oTable._bV4LegacySelectionEnabled) {
				return TableDelegate.initializeSelection.call(this, oTable);
			}

			oTable._oTable.addPlugin(new ODataV4SelectionPlugin({
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

	function setSelectedGridTableConditions (oTable, aContexts) {

		var oODataV4SelectionPlugin = oTable._oTable.getPlugins().find(function(oPlugin) {
			return oPlugin.isA("sap.ui.table.plugins.ODataV4Selection");
		});

		if (oODataV4SelectionPlugin) {
			return oODataV4SelectionPlugin.setSelectedContexts(aContexts);
		}

		var oMultiSelectionPlugin = oTable._oTable.getPlugins().find(function(oPlugin) {
			return oPlugin.isA("sap.ui.table.plugins.MultiSelectionPlugin");
		});

		if (oMultiSelectionPlugin) {
			oMultiSelectionPlugin.clearSelection();
			return aContexts.map(function (oContext) {
				var iContextIndex = oContext.getIndex(); // TODO: Handle undefined index?
				return oMultiSelectionPlugin.addSelectionInterval(iContextIndex, iContextIndex);
			});
		}

		throw Error("Unsupported operation: TableDelegate does not support #setSelectedContexts for the given Table configuration");
	}

	/**
	 * @inheritDoc
	 */
	Delegate.setSelectedContexts = function (oTable, aContexts) {
		if (oTable._isOfType(TableType.Table, true)) {
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

		if (oTable._bV4LegacySelectionEnabled) {
			return TableDelegate.getSelectedContexts.apply(this, arguments);
		}

		if (oTable._isOfType(TableType.Table, true)) {
			var oODataV4SelectionPlugin = oTable._oTable.getPlugins().find(function(oPlugin) {
				return oPlugin.isA("sap.ui.table.plugins.ODataV4Selection");
			});

			return oODataV4SelectionPlugin ? oODataV4SelectionPlugin.getSelectedContexts() : [];
		}

		return TableDelegate.getSelectedContexts.apply(this, arguments);
	};

	Delegate.validateState = function(oTable, oState, sKey) {
		var oBaseStates = TableDelegate.validateState.apply(this, arguments);
		var oValidation;

		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

		if (sKey == "Sort" && oState.sorters) {
			if (isAnalyticsEnabled(oTable) && !checkForValidity(oTable, oState.items, oState.sorters)) {
				oValidation = {
					validation: coreLibrary.MessageType.Information,
					message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION")
				};
			}
		} else if (sKey == "Group") {
			if (oState.aggregations) {
				var aAggregateProperties = Object.keys(oState.aggregations);
				var aAggregateGroupableProperties = [];
				var oListFormat = ListFormat.getInstance();
				aAggregateProperties.forEach(function(sProperty) {
					var oProperty = oTable.getPropertyHelper().getProperty(sProperty);
					if (oProperty && oProperty.groupable) {
						aAggregateGroupableProperties.push(sProperty);
					}
				});

				if (aAggregateGroupableProperties.length) {
					oValidation = {
						validation: coreLibrary.MessageType.Information,
						message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION_TOTALS", [oListFormat.format(aAggregateGroupableProperties)])
					};
				}
			} else if (oTable._isOfType(TableType.ResponsiveTable)) {
				if (!checkForValidity(oTable, oState.items, oState.groupLevels)) {
					oValidation = {
						validation: coreLibrary.MessageType.Information,
						message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION_VISIBLE")
					};
				}
			}
		} else if (sKey == "Column") {
			var sMessage;
			var aAggregateProperties = oState.aggregations && Object.keys(oState.aggregations);

			if (!checkForValidity(oTable, oState.items, aAggregateProperties)) {
				sMessage = oResourceBundle.getText("table.PERSONALIZATION_DIALOG_TOTAL_RESTRICTION");
			}

			if (isAnalyticsEnabled(oTable) && !checkForValidity(oTable, oState.items, oState.sorters)) {
				sMessage = sMessage ? sMessage + "\n" + oResourceBundle.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION")
					: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION");
			}
			if (sMessage) {
				oValidation = {
					validation: coreLibrary.MessageType.Information,
					message: sMessage
				};
			}
		}

		return mergeValidation(oBaseStates, oValidation);
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
		var oRootBinding = oBinding.getRootBinding();
		var bHasRootBindingAndWasNotSuspended = oRootBinding && !oRootBinding.isSuspended();

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

		// When changes are made in the binding with multiple API calls, the binding fires a change event with the consolidated reason "change".
		// The information that there is a sort or filter change is lost, hence the GridTable does not clear the selection. The changes could
		// affect the indices and make the current selection invalid. Therefore, the delegate has to clear the selection here.
		if (oTable._bV4LegacySelectionEnabled && oTable._isOfType(TableType.Table)) {
			var oInnerPlugin = oTable._oTable && oTable._oTable.getPlugins()[0] ? oTable._oTable.getPlugins()[0].oInnerSelectionPlugin : null;

			if (oInnerPlugin) {
				oInnerPlugin._bInternalTrigger = true;
			}

			oTable.clearSelection();

			if (oInnerPlugin) {
				delete oInnerPlugin._bInternalTrigger;
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

	Delegate.addColumnMenuItems = function(oTable, oMDCColumn) {
		var oPropertyHelper = oTable.getPropertyHelper();
		var oProperty = oPropertyHelper.getProperty(oMDCColumn.getPropertyKey());
		var aItems = [];

		if (!oProperty) {
			return [];
		}

		if (oTable.isGroupingEnabled()) {
			var aGroupableProperties = oProperty.getGroupableProperties();

			if (aGroupableProperties.length > 0) {
				aItems.push(createGroupPopoverItem(aGroupableProperties, oMDCColumn));
			}
		}

		if (oTable.isAggregationEnabled()) {
			var aPropertiesThatCanBeTotaled = oProperty.getAggregatableProperties().filter(function(oProperty) {
				return oProperty.extension.customAggregate != null;
			});

			if (aPropertiesThatCanBeTotaled.length > 0) {
				aItems.push(createAggregatePopoverItem(aPropertiesThatCanBeTotaled, oMDCColumn));
			}
		}

		var oPopover = oTable._oPopover;
		if (oPopover) {
			oPopover.getItems().forEach(function(oItem, iIndex, aItems) {
				var sLabel = oItem.getLabel();
				var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");

				if (sLabel === oResourceBundle.getText("table.SETTINGS_GROUP") || sLabel === oResourceBundle.getText("table.SETTINGS_TOTALS")) {
					aItems[iIndex].destroy();
				}

				if (aItems.length == 0) {
					oPopover.destroy();
				}
			});
		}

		return aItems;
	};

	/**
	 * @inheritDoc
	 */
	Delegate.getSupportedP13nModes = function(oTable) {
		var aSupportedModes = TableDelegate.getSupportedP13nModes.apply(this, arguments);

		if (oTable._isOfType(TableType.Table)) {
			if (!aSupportedModes.includes(TableP13nMode.Group)) {
				aSupportedModes.push(TableP13nMode.Group);
			}
			if (!aSupportedModes.includes(TableP13nMode.Aggregate)) {
				aSupportedModes.push(TableP13nMode.Aggregate);
			}
		}

		return aSupportedModes;
	};

	/**
	 * @inheritDoc
	 */
	Delegate.getGroupSorter = function(oTable) {
		var oGroupedProperty = oTable._getGroupedProperties()[0];

		if (!oGroupedProperty || !oTable._isOfType(TableType.ResponsiveTable)) {
			return undefined;
		}

		var oPropertyHelper = oTable.getPropertyHelper();
		var oVisibleProperty = oTable._getVisibleProperties().find(function(oProperty) {
			var oCurrentProperty = oPropertyHelper.getProperty(oProperty.name);
			return oCurrentProperty.getSimpleProperties().find(function(oSimpleProperty) {
				return oSimpleProperty.name === oGroupedProperty.name;
			});
		});

		if (!oVisibleProperty) {
			// Suppress grouping by non-visible property.
			return undefined;
		}

		return TableDelegate.getGroupSorter.apply(this, arguments);
	};

	/**
	 * @inheritDoc
	 */
	Delegate.getSupportedFeatures = function(oTable) {
		var oSupportedFeatures = TableDelegate.getSupportedFeatures.apply(this, arguments);
		var bIsTreeTable = oTable._isOfType(TableType.TreeTable);

		return Object.assign(oSupportedFeatures, {
			expandAll: bIsTreeTable,
			collapseAll: bIsTreeTable
		});
	};

	/**
	 * @inheritDoc
	 */
	Delegate.expandAll = function(oTable) {
		if (!this.getSupportedFeatures(oTable).expandAll) {
			return;
		}

		var oRowBinding = oTable.getRowBinding();
		if (oRowBinding) {
			oRowBinding.setAggregation(Object.assign(oRowBinding.getAggregation(), {expandTo: 999}));
		}
	};

	/**
	 * @inheritDoc
	 */
	Delegate.collapseAll = function(oTable) {
		if (!this.getSupportedFeatures(oTable).collapseAll) {
			return;
		}

		var oRowBinding = oTable.getRowBinding();
		if (oRowBinding) {
			oRowBinding.setAggregation(Object.assign(oRowBinding.getAggregation(), {expandTo: 1}));
		}
	};

	function createGroupPopoverItem(aGroupProperties, oMDCColumn) {
		var aGroupChildren = aGroupProperties.map(function(oGroupProperty) {
			return new Item({
				text: oGroupProperty.label,
				key: oGroupProperty.name
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
				text: oAggregateProperty.label,
				key: oAggregateProperty.name
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
				onClose: function(oAction) {
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

	/**
	 * Updates the aggregation info if the plugin is enabled.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} [oBindingInfo] The binding info object to be used to bind the table to the model
	 */
	function setAggregation(oTable, oBindingInfo) {
		var oPlugin = TableMap.get(oTable).plugin;

		if (!oPlugin || oPlugin.isDestroyed()) {
			return;
		}

		var aGroupLevels = oTable._getGroupedProperties().map(function(mGroupLevel) {
			return mGroupLevel.name;
		});
		var aAggregates = Object.keys(oTable._getAggregatedProperties());
		var sSearch = oBindingInfo ? oBindingInfo.parameters["$search"] : undefined;

		if (sSearch) {
			delete oBindingInfo.parameters["$search"];
		}

		var oAggregationInfo = {
			visible: getVisibleProperties(oTable),
			groupLevels: aGroupLevels,
			grandTotal: aAggregates,
			subtotals: aAggregates,
			columnState: getColumnState(oTable, aAggregates),
			search: sSearch
		};

		oPlugin.setAggregationInfo(oAggregationInfo);
	}

	function getVisibleProperties(oTable) {
		var oVisiblePropertiesSet = new Set();

		oTable.getColumns().forEach(function(oColumn) {
			var oProperty = oTable.getPropertyHelper().getProperty(oColumn.getPropertyKey());

			if (!oProperty) {
				return;
			}

			oProperty.getSimpleProperties().forEach(function(oProperty) {
				oVisiblePropertiesSet.add(oProperty.name);
			});
		});

		return Array.from(oVisiblePropertiesSet);
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

	// TODO: Move this to TablePropertyHelper (or even base PropertyHelper - another variant of getSimpleProperties?)
	function getColumnProperties(oTable, oColumn) {
		var oProperty = oTable.getPropertyHelper().getProperty(oColumn.getPropertyKey());

		if (!oProperty) {
			return [];
		} else {
			return oProperty.getSimpleProperties();
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
			if (oProperty.unitProperty) {
				aUnitProperties.push(oProperty.unitProperty);
			}
		});

		return oTable.getColumns().filter(function(oColumn) {
			return getColumnProperties(oTable, oColumn).some(function(oProperty) {
				return aUnitProperties.includes(oProperty);
			});
		});
	}

	function checkForValidity(oControl, aItems, aStates) {
		var aProperties = [];

		if (aItems) {
			aItems.forEach(function(oItem) {
				oControl.getPropertyHelper().getProperty(oItem.name).getSimpleProperties().forEach(function(oProperty) {
					aProperties.push(oProperty.name);
				});
			});
		}

		var bOnlyVisibleColumns = aStates ? aStates.every(function(oState) {
			return aProperties.find(function(sPropertyName) {
				return oState.name ? oState.name === sPropertyName : oState === sPropertyName;
			});
		}) : true;

		return bOnlyVisibleColumns;
	}

	/**
	 * Compares the message type and returns the message with higher priority.
	 *
	 * @param {Object} oBaseState Message set by the base <code>TableDelegate</code>
	 * @param {Object} oValidationState Message set by the <code>ODataV4Delegate</code>
	 * @returns {Object} The message with higher priority
	 * @private
	 */
	function mergeValidation(oBaseState, oValidationState) {
		var oSeverity = {Error: 1, Warning: 2, Information: 3, None: 4};

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
			return (isAnalyticsEnabled(oTable) ? enableGridTablePlugin(oTable) : disableGridTablePlugin(oTable)).then(function() {
				return setUpTableObserver(oTable);
			});
		}
		return Promise.resolve();
	}

	function enableGridTablePlugin(oTable) {
		var mTableMap = TableMap.get(oTable);
		var oPlugin = mTableMap.plugin;

		if (oPlugin && !oPlugin.isDestroyed()) {
			oPlugin.activate();
			return Promise.resolve();
		}

		// The property helper is initialized after the table "initialized" promise resolves. So we can only wait for the property helper.
		return Promise.all([
			oTable.awaitPropertyHelper(),
			loadModules("sap/ui/table/plugins/V4Aggregation")
		]).then(function(aResult) {
			var V4AggregationPlugin = aResult[1][0];
			var oDelegate = oTable.getControlDelegate();

			oPlugin = new V4AggregationPlugin({
				groupHeaderFormatter: function(oContext, sProperty) {
					return oDelegate.formatGroupHeader(oTable, oContext, sProperty);
				}
			});
			oPlugin.setPropertyInfos(oTable.getPropertyHelper().getPropertiesForPlugin());
			oTable.propertiesFinalized().then(function() {
				oPlugin.setPropertyInfos(oTable.getPropertyHelper().getPropertiesForPlugin());
			});
			oTable._oTable.addDependent(oPlugin);
			mTableMap.plugin = oPlugin;
		});
	}

	function disableGridTablePlugin(oTable) {
		var mTableMap = TableMap.get(oTable);

		if (mTableMap.plugin) {
			mTableMap.plugin.deactivate();
		}

		return Promise.resolve();
	}

	function setUpTableObserver(oTable) {
		var mTableMap = TableMap.get(oTable);

		if (!mTableMap.observer) {
			mTableMap.observer = new ManagedObjectObserver(function(oChange) {
				configureInnerTable(oTable);
			});

			mTableMap.observer.observe(oTable, {
				properties: ["p13nMode"]
			});
		}
	}

	return Delegate;
});