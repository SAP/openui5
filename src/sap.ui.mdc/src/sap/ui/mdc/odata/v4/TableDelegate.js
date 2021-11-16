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
	 * Delegate for {@link sap.ui.mdc.Table} and <code>ODataV4</code>.
	 * Enables additional analytical capabilities.
	 *
	 * @author SAP SE
	 * @namespace
	 * @alias module:sap/ui/mdc/odata/v4/TableDelegate
	 * @extends module:sap/ui/mdc/TableDelegate
	 * @experimental
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.85
	 */
	var Delegate = Object.assign({}, TableDelegate);

	/**
	 * Fetches the model-specific <code>PropertyHelper</code> class or instance.
	 *
	 * <b>Note:</b> The <code>PropertyHelper</code> class adds the extension of a property to the reserved attribute "extension". It is not allowed to
	 * add an <code>extension</code> attribute in the standard <code>PropertyInfo</code>.
	 *
	 * @example <caption>Initializing a <code>PropertyHelper</code> with extensions:</caption>
	 * new PropertyHelper(
	 *     [{
	 *         name: "propA",
	 *         label: "Property A",
	 *         extension: {
	 *             messageType: "Success"
	 *         }
	 *     }, {
	 *         name: "propB",
	 *         label: "Property B"
	 *     }]
	 * )
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {object[]} aProperties <code>PropertyInfo</code>
	 * @param {Promise<object<string, object>|null>} mExtensions The property extensions
	 * @returns {Promise<sap.ui.mdc.table.V4AnalyticsPropertyHelper>} A <code>Promise</code> that resolves with the <code>PropertyHelper</code> class
	 * or instance
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
	 *
	 * <b>Note:</b> Property extensions add model-specific information. To ensure a clear separation from the standard property information, the
	 * extensions need to be passed separately to the constructor, together with their attribute metadata. An extension has to be provided as a
	 * key-value pair, where the key is the name of the property and the value is the extension of this property. It is not allowed to provide
	 * extensions without the corresponding attribute metadata.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {object[]} aProperties <code>PropertyInfo</code>
	 * @returns {Promise<object<string, object>|null>} Key-value map, where the key is the name of the property, and the value is the extension
	 * @protected
	 */
	Delegate.fetchPropertyExtensions = function(oTable, aProperties) {
		return Promise.resolve(null);
	};

	/**
	 * Retrieves the relevant metadata that will be used for the table binding, and returns the <code>PropertyInfo</code> array.
	 * If it is not overridden, this method returns the same as <code>fetchProperties</code>.
	 * When overriding the method make sure the returned result is consistent with what is returned by <code>fetchProperties</code>.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {Promise} Once resolved, an array of <code>PropertyInfo</code> objects is returned
	 * @protected
	*/
	Delegate.fetchPropertiesForBinding = function(oTable) {
		return this.fetchProperties(oTable);
	};

	/**
	 * Fetches the property extensions that will be used for the table binding.
	 * If it is not overridden, this method returns the same as <code>fetchPropertyExtensions</code>.
	 * When overriding the method make sure the returned result is consistent with what is returned by <code>fetchPropertyExtensions</code>.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {object[]} aProperties <code>PropertyInfo</code>
	 * @returns {Promise<object<string, object>|null>} Key-value map, where the key is the name of the property, and the value is the extension
	 * @protected
	 */
	Delegate.fetchPropertyExtensionsForBinding = function(oTable, aProperties) {
		return this.fetchPropertyExtensions(oTable, aProperties);
	};

	/**
	 * Formats the title text of a group header row of the table.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {sap.ui.model.Context} oContext Binding context
	 * @param {string} sProperty The name of the grouped property
	 * @returns {string | undefined} The group header title. If <code>undefined</code> is returned, the default group header title is set.
	 * @private
	 */
	Delegate.formatGroupHeader = function(oTable, oContext, sProperty) {};

	Delegate.preInit = function(oTable) {
		if (!TableMap.has(oTable)) {
			TableMap.set(oTable, {});
		}

		return configureInnerTable(oTable).then(function() {
			setAggregation(oTable);
		});
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
		} else if (sKey == "Group" && oState.aggregations) {
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
					message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION", [oListFormat.format(aAggregateGroupableProperties)])
				};
			}
		} else if (sKey == "Column" ) {
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
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
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
	 * @param {sap.ui.mdc.Table} oMDCTable Instance of the table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model.
	 * @param {sap.ui.model.ListBinding} [oBinding] The binding instance of the table
	 * @protected
	 * @override
	 */
	Delegate.updateBinding = function(oTable, oBindingInfo, oBinding) {
		if (!oBinding || oBinding.getPath() != oBindingInfo.path) {
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
		var oPropertyHelper = oTable.getPropertyHelper();
		var oProperty = oPropertyHelper.getProperty(oMDCColumn.getDataProperty());
		var oAggregatePopoverItem;
		var oGroupPopoverItem;

		if (!oProperty) {
			return [];
		}

		if (oTable.isGroupingEnabled() && supportsGrouping(oTable)) {
			var aGroupProperties = oProperty.getGroupableProperties();

			if (aGroupProperties.length > 0) {
				oGroupPopoverItem = createGroupPopoverItem(aGroupProperties, oMDCColumn);
			}
		}

		if (oTable.isAggregationEnabled() && supportsAggregation(oTable)) {
			var aAggregateProperties = oProperty.getAggregatableProperties();

			if (aAggregateProperties.length > 0) {
				oAggregatePopoverItem = createAggregatePopoverItem(aAggregateProperties, oMDCColumn);
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

				if (aItems.length == 0 ) {
					oPopover.destroy();
				}
			});
		}

		return [oGroupPopoverItem, oAggregatePopoverItem];
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
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} [oBindingInfo] The binding info object to be used to bind the table to the model
	 */
	function setAggregation(oTable, oBindingInfo) {
		var oPlugin = TableMap.get(oTable).plugin;

		if (!oPlugin || oPlugin.isDestroyed()) {
			return;
		}

		var aGroupLevels = oTable._getGroupedProperties().map(function (mGroupLevel) {
			return mGroupLevel.name;
		});
		var aAggregates = Object.keys(oTable._getAggregatedProperties());
		var sSearch = oBindingInfo ? oBindingInfo.parameters["$search"] : undefined;

		if (sSearch ) {
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
		var oPropertyHelper = TableMap.get(oTable).oPropertyHelperForBinding;

		oTable.getColumns().forEach(function(oColumn) {
			var oProperty = oPropertyHelper.getProperty(oColumn.getDataProperty());

			if (!oProperty) {
				return;
			}

			if (oProperty.isComplex()) {
				// Add the names of all related (simple) PropertyInfo in the list.
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
	 * @param {Object} oBaseState Message set by the base <code>TableDelegate</code>
	 * @param {Object} oValidationState Message set by the <code>ODataV4Delegate</code>
	 * @returns {Object} The message with higher priority
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
	 * Checks whether the inner table supports grouping.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {boolean} Whether the inner table supports grouping
	 */
	function supportsGrouping(oTable) {
		return oTable._isOfType(TableType.Table);
	}

	/**
	 * Checks whether the inner table supports aggregation.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {boolean} Whether the inner table supports aggregation
	 */
	function supportsAggregation(oTable) {
		return oTable._isOfType(TableType.Table);
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

			mTableMap.observer.observe(oTable, {
				properties: ["p13nMode"],
				destroy: true
			});
		}
	}

	return Delegate;
});