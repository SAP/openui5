/*
 * ! ${copyright}
 */

sap.ui.define([
	"../../TableDelegate",
	"../../util/loadModules",
	"../../library",
	"sap/m/ColumnPopoverSelectListItem",
	"sap/m/MessageBox",
	"sap/ui/core/Item",
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/core/format/ListFormat",
	"sap/ui/base/ManagedObjectObserver"
], function(
	TableDelegate,
	loadModules,
	library,
	ColumnPopoverSelectListItem,
	MessageBox,
	Item,
	Core,
	coreLibrary,
	ListFormat,
	ManagedObjectObserver
) {
	"use strict";

	/*global Set */

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
		if (!TableMap.has(oTable)) {
			TableMap.set(oTable, {});
		}

		return configureInnerTable(oTable).then(function() {
			setAggregation(oTable);
			setUpTableObserver(oTable);
		});
	};

	Delegate.validateState = function(oControl, oState, sKey) {
		var oBaseStates = TableDelegate.validateState.apply(this, arguments);
		var oValidation;

		var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

		if (sKey == "Sort" && oState.sorters) {
			if (!checkForValidity(oControl, oState.items, oState.sorters)) {
				oValidation = {
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
				oValidation = {
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
		if (!oBinding || oBinding.hasPendingChanges() || oBinding.getPath() != oBindingInfo.path) {
			this.rebindTable(oTable, oBindingInfo);
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
		} catch (e) {
			this.rebindTable(oTable, oBindingInfo);
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
		if (oTable._isOfType(TableType.Table) && !oTable._bSkipClearSelectionOnRebind) {
			oTable.clearSelection();
		}
	};

	/**
	 * @override
	 * @inheritDoc
	 */
	Delegate.rebindTable = function (oTable, oBindingInfo) {
		setAggregation(oTable, oBindingInfo);
		TableDelegate.rebindTable(oTable, oBindingInfo);
	};

	Delegate.addColumnMenuItems = function(oTable, oMDCColumn) {
		if (!isInnerTableReadyForAnalytics(oTable)) {
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

	/**
	 * Updates the aggregation info if the plugin is enabled.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} [oBindingInfo] The binding info object to be used to bind the table to the model
	 */
	function setAggregation(oTable, oBindingInfo) {
		if (isInnerTableReadyForAnalytics(oTable)) {
			var aAggregates = Object.keys(oTable._getAggregatedProperties());
			var sSearch = oBindingInfo && oBindingInfo.parameters["$search"] || undefined;
			if (sSearch ) {
				delete oBindingInfo.parameters["$search"];
			}
			var aGroupLevels = oTable._getGroupedProperties().map(function (mGroupLevel) {
				return mGroupLevel.name;
			});
			var oAggregationInfo = {
				visible: getVisibleProperties(oTable),
				groupLevels: aGroupLevels,
				grandTotal: aAggregates,
				subtotals: aAggregates,
				columnState: getColumnState(oTable, aAggregates),
				search: sSearch
			};

			TableMap.get(oTable).plugin.setAggregationInfo(oAggregationInfo);
		}
	}

	function getVisibleProperties(oTable) {
		var oVisiblePropertiesSet = new Set();
		var oPropertyHelper = TableMap.get(oTable).oPropertyHelperForBinding;

		oTable.getColumns().forEach(function(oColumn) {
			var oProperty = oPropertyHelper.getProperty(oColumn.getDataProperty());

			if (!oProperty) {
				return;
			}

			if (oProperty.isComplex()) {
				// Add the names of all related (simple) propertyInfos in the list.
				oProperty.getReferencedProperties().forEach(function(oProperty) {
					oVisiblePropertiesSet.add(oProperty.name);
				});
			} else {
				oVisiblePropertiesSet.add(oProperty.name);
			}
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

	// TODO: Move this to TablePropertyHelper (or even base PropertyHelper - another variant of getReferencedProperties?)
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

	/**
	 * Compares the message type and returns the message with higher priority.
	 *
	 * @param {Object} oBaseState message set by the base table delegate.
	 * @param {Object} oValidationState message set by the odata v4 delegate.
	 * @return {Object} A message with higher priority.
	 * @private
	 */
	function mergeValidation(oBaseState, oValidationState) {
		var oSeverity = { Error: 1, Warning: 2, Information: 3, None: 4};

		if (!oValidationState || oSeverity[oValidationState.validation] - oSeverity[oBaseState.validation] > 0) {
			return oBaseState;
		} else {
			return oValidationState;
		}
	}

	/**
	 * Configures the inner table to support the p13n settings of the MDC table.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @return {Promise} A promise that revolves when the inner table is configured
	 */
	function configureInnerTable(oTable) {
		return oTable._isOfType(TableType.Table) ? configureGridTable(oTable) : configureResponsiveTable(oTable);
	}

	/**
	 * Checks whether the inner table supports the "analytical" p13n modes <code>Group</code> and <code>Aggregate</code>.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @return {boolean} Whether the inner table supports the "analytical" p13n modes
	 */
	function isInnerTableReadyForAnalytics(oTable) {
		if (oTable._isOfType(TableType.Table)) {
			var oPlugin = TableMap.get(oTable).plugin;
			return oPlugin != null && !oPlugin.bIsDestroyed;
		} else {
			return false;
		}
	}

	function configureGridTable(oTable) {
		return isAnalyticsEnabled(oTable) ? enableGridTablePlugin(oTable) : disableGridTablePlugin(oTable);
	}

	function enableGridTablePlugin(oTable) {
		var mTableMap = TableMap.get(oTable);
		var oPlugin = mTableMap.plugin;

		if (oPlugin && !oPlugin.bIsDestroyed) {
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

			oTable._oTable.addDependent(oPlugin);
			mTableMap.plugin = oPlugin;

			return fetchPropertyHelperForBinding(oTable);
		}).then(function(oPropertyHelperForBinding) {
			oPlugin.setPropertyInfos(oPropertyHelperForBinding.getProperties());
		});
	}

	function disableGridTablePlugin(oTable) {
		var mTableMap = TableMap.get(oTable);

		if (mTableMap.plugin) {
			mTableMap.plugin.deactivate();
		}

		return Promise.resolve();
	}

	function configureResponsiveTable(oTable) {
		return Promise.resolve();
	}

	function fetchPropertyHelperForBinding(oTable) {
		var mTableMap = TableMap.get(oTable);

		if (mTableMap.oPropertyHelperForBinding) {
			return Promise.resolve(mTableMap.oPropertyHelperForBinding);
		}

		var oDelegate = oTable.getControlDelegate();
		var aProperties;
		var mExtensions;

		return oDelegate.fetchPropertiesForBinding(oTable).then(function(aPropertiesForBinding) {
			aProperties = aPropertiesForBinding;
			return oDelegate.fetchPropertyExtensionsForBinding(oTable, aProperties);
		}).then(function(mExtensionsForBinding) {
			mExtensions = mExtensionsForBinding;
			return oDelegate.fetchPropertyHelper(oTable, aProperties, mExtensions);
		}).then(function(PropertyHelper) {
			var bIsPropertyHelperInstance = PropertyHelper.constructor === PropertyHelper;
			mTableMap.oPropertyHelperForBinding = bIsPropertyHelperInstance ? PropertyHelper : new PropertyHelper(aProperties, mExtensions, oTable);
			return mTableMap.oPropertyHelperForBinding;
		});
	}

	function setUpTableObserver(oTable) {
		var mTableMap = TableMap.get(oTable);

		if (!mTableMap.observer) {
			mTableMap.observer = new ManagedObjectObserver(function(oChange) {
				if (oChange.type === "destroy") {
					// Destroy objects that are not in the lifecycle of the table.
					if (mTableMap.oPropertyHelperForBinding) {
						mTableMap.oPropertyHelperForBinding.destroy();
					}
				} else {
					configureInnerTable(oTable);
				}
			});
		}

		mTableMap.observer.observe(oTable, {
			properties: ["p13nMode"],
			destroy: true
		});
	}

	function isAnalyticsEnabled(oTable) {
		return oTable.isGroupingEnabled() || oTable.isAggregationEnabled();
	}

	return Delegate;
});