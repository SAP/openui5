/*!
 * ${copyright}
 */

sap.ui.define([
	"./AggregationBaseDelegate",
	"sap/ui/mdc/mixin/delegate/FilterIntegrationDefault",
	"sap/ui/mdc/enums/TableP13nMode",
	"sap/ui/mdc/enums/TableType",
	"sap/ui/mdc/enums/TableSelectionMode",
	"sap/ui/mdc/util/loadModules",
	"sap/m/plugins/PluginBase",
	"sap/ui/model/Sorter",
	"sap/ui/core/Lib",
	"sap/ui/core/message/MessageType"
], (
	AggregationBaseDelegate,
	FilterIntegrationDefault,
	TableP13nMode,
	TableType,
	SelectionMode,
	loadModules,
	PluginBase,
	Sorter,
	Lib,
	MessageType
) => {
	"use strict";

	/**
	 * Base delegate for {@link sap.ui.mdc.Table}. Extend this object in your project to use all functionalities of the table. This base delegate
	 * already meets some requirements of certain features. Others need to be met by your delegate implementation.
	 *
	 * The following methods need to be added or overridden in your delegate. Please also see the documentation of the methods to learn about their
	 * default implementation and what you need to implement.
	 * <ul>
	 *   <li><b>Basic prerequisites</b></li>
	 *   <ul>
	 *     <li>{@link module:sap/ui/mdc/TableDelegate.fetchProperties fetchProperties}</li>
	 *     <li>{@link module:sap/ui/mdc/TableDelegate.updateBindingInfo updateBindingInfo}</li>
	 *   </ul>
	 *   <li>Column personalization (related to <code>p13nMode</code> <code>Column</code>)</li>
	 *   <ul>
	 *     <li>{@link module:sap/ui/mdc/TableDelegate.addItem addItem}</li>
	 *   <li>Filter personalization (related to <code>p13nMode</code> <code>Filter</code>)</li>
	 *   <ul>
	 *     <li>{@link module:sap/ui/mdc/TableDelegate.getFilterDelegate getFilterDelegate}</li>
	 *   </ul>
	 * </ul>
	 *
	 * <b>Note:</b> This base delegate does not support the <code>p13nMode</code> <code>Aggregate</code>, and the <code>p13nMode</code>
	 * <code>Group</code> is only supported if the table type is {@link sap.ui.mdc.table.ResponsiveTableType ResponsiveTable}. This cannot be
	 * changed in your delegate implementation.
	 *
	 * @author SAP SE
	 * @namespace
	 * @alias module:sap/ui/mdc/TableDelegate
	 * @extends module:sap/ui/mdc/AggregationBaseDelegate
	 * @mixes module:sap/ui/mdc/mixin/delegate/FilterIntegrationDefault
	 * @since 1.60
	 * @public
	 *
	 */
	const TableDelegate = Object.assign({}, AggregationBaseDelegate, FilterIntegrationDefault);

	/**
	 * Retrieves information about the relevant properties.
	 *
	 * By default, this method returns a <code>Promise</code> that resolves with an empty array.
	 *
	 * <b>Note:</b>
	 * The result of this function must be kept stable throughout the lifecycle of your application.
	 * Any changes of the returned values might result in undesired effects.
	 *
	 * <b>Note</b>:
	 * Existing properties (set via <code>sap.ui.mdc.Table#setPropertyInfo</code>) must not be removed and their attributes must not be changed during the {@link module:sap/ui/mdc/TableDelegate.fetchProperties fetchProperties} callback. Otherwise validation errors might occur whenever personalization-related control features (such as the opening of any personalization dialog) are activated.
	 *
	 * @name module:sap/ui/mdc/TableDelegate.fetchProperties
	 * @function
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {Promise<sap.ui.mdc.table.PropertyInfo[]>} A <code>Promise</code> that resolves with the property information
	 * @protected
	 */

	/**
	 * Central hook that is called to add columns to the table when the state is applied, for example, when SAPUI5 flexibility changes are applied.
	 * During preprocessing, this method is called without the <code>mPropertyBag</code> parameter, and <code>oTable</code> is an XML node.
	 *
	 * By default, this method does not create a column and just returns a <code>Promise</code> that resolves without a value.
	 *
	 * @name module:sap/ui/mdc/TableDelegate.addItem
	 * @function
	 * @param {sap.ui.mdc.Table | Element} oTable Instance of the table or an XML node representing the table during preprocessing
	 * @param {string} sPropertyName The property name
	 * @param {Object} [mPropertyBag] Instance of a property bag from the SAPUI5 flexibility API
	 * @returns {Promise<sap.ui.mdc.table.Column>} A <code>Promise</code> that resolves with a column
	 * @abstract
	 * @protected
	 */

	/**
	 * Returns filters to be applied when updating the table's binding based on the filter conditions of the table itself and its associated
	 * {@link sap.ui.mdc.IFilterSource IFilterSource}.
	 *
	 * By default, filters for the associated filter source are only generated for a <code>sap.ui.mdc.FilterBar</code>.
	 *
	 * @name module:sap/ui/mdc/TableDelegate.getFilters
	 * @function
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {sap.ui.model.Filter[]} Array of filters
	 * @protected
	 */

	/**
	 * Updates the binding info object that is used to bind the table in {@link module:sap/ui/mdc/TableDelegate.updateBinding updateBinding}.
	 *
	 * By default, filters and sorters are added to the binding info. Please see {@link module:sap/ui/mdc/TableDelegate.getFilters getFilters},
	 * {@link module:sap/ui/mdc/TableDelegate.getSorters getSorters}, and {@link module:sap/ui/mdc/TableDelegate.getGroupSorter getGroupSorter} for
	 * more details.
	 *
	 * <b>Note:</b> Any other required information, such as the path, must be additionally provided by your delegate implementation.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info
	 * @protected
	 */
	TableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		oBindingInfo.parameters = {};
		oBindingInfo.sorter = [];

		if (oTable._oMessageFilter) {
			oBindingInfo.filters = [oTable._oMessageFilter];
		} else {
			oBindingInfo.filters = this.getFilters(oTable);
		}

		const oGroupSorter = this.getGroupSorter(oTable);
		if (oGroupSorter) {
			oBindingInfo.sorter.push(oGroupSorter);
		}


		const aSorters = this.getSorters(oTable);
		oBindingInfo.sorter = oBindingInfo.sorter.concat(
			oBindingInfo.sorter.length === 1 ?
			aSorters.filter((oSorter) => {
				return oSorter.sPath !== oBindingInfo.sorter[0].sPath;
			}) :
			aSorters
		);
	};

	/**
	 * Returns a sorter for the grouping functionality to be applied when updating the table's binding based on the group conditions of the table.
	 *
	 * <b>Note:</b> No sorter must be returned if the table type, for example, {@link sap.ui.mdc.table.GridTableType GridTable}, cannot be grouped
	 * this way.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {sap.ui.model.Sorter | undefined} The sorter or <code>undefined</code> if there is no group condition or if it cannot be applied
	 * @protected
	 */
	TableDelegate.getGroupSorter = function(oTable) {
		const oGroupedProperty = oTable._getGroupedProperties()[0];

		if (!oGroupedProperty || !oTable._isOfType(TableType.ResponsiveTable)) {
			return undefined;
		}

		const oSortedProperty = oTable._getSortedProperties().find((oProperty) => {
			return oProperty.name === oGroupedProperty.name;
		});
		const sPath = oTable.getPropertyHelper().getProperty(oGroupedProperty.name).path;
		const bDescending = oSortedProperty ? oSortedProperty.descending : false;

		if (!oTable._mFormatGroupHeaderInfo || oTable._mFormatGroupHeaderInfo.propertyName !== oGroupedProperty.name) {
			oTable._mFormatGroupHeaderInfo = {
				propertyName: oGroupedProperty.name,
				formatter: function(oContext) {
					return this.formatGroupHeader(oTable, oContext, oGroupedProperty.name);
				}.bind(this)
			};
		}

		return new Sorter(sPath, bDescending, oTable._mFormatGroupHeaderInfo.formatter);
	};

	/**
	 * Formats the title text of a group header row of the table.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {sap.ui.model.Context} oContext Binding context
	 * @param {string} sProperty Name of the grouped property
	 * @returns {string} The group header title
	 * @protected
	 */
	TableDelegate.formatGroupHeader = function(oTable, oContext, sProperty) {
		const oProperty = oTable.getPropertyHelper().getProperty(sProperty);
		const oTextProperty = oProperty.textProperty;
		const oResourceBundle = Lib.getResourceBundleFor("sap.ui.mdc");
		let sResourceKey = "table.ROW_GROUP_TITLE";
		const aValues = [oProperty.label, oContext.getProperty(oProperty.path, true)];

		if (oTextProperty) {
			sResourceKey = "table.ROW_GROUP_TITLE_FULL";
			aValues.push(oContext.getProperty(oTextProperty.path, true));
		}

		return oResourceBundle.getText(sResourceKey, aValues);
	};

	/**
	 * Returns sorters to be applied when updating the table's binding based on the sort conditions of the table.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {sap.ui.model.Sorter[]} Array of sorters
	 * @protected
	 */
	TableDelegate.getSorters = function(oTable) {
		const aSortedProperties = oTable._getSortedProperties();
		const oPropertyHelper = oTable.getPropertyHelper();
		const aSorters = [];

		aSortedProperties.forEach((oSorter) => {
			if (oPropertyHelper.hasProperty(oSorter.name)) {
				const sPath = oPropertyHelper.getProperty(oSorter.name).path;
				aSorters.push(new Sorter(sPath, oSorter.descending));
			}
		});

		return aSorters;
	};

	/**
	 * Updates the row binding of the table.
	 *
	 * The default implementation rebinds the table, but model-specific subclasses must call dedicated binding methods to update the binding instead
	 * of using {@link #rebind}.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model
	 * @param {sap.ui.model.ListBinding} [oBinding] The binding instance of the table
	 * @param {object} [mSettings] Additional settings
	 * @param {boolean} [mSettings.forceRefresh] Indicates that the binding has to be refreshed even if <code>oBindingInfo</code> has not been changed
	 * @protected
	 */
	TableDelegate.updateBinding = function(oTable, oBindingInfo, oBinding, mSettings) {
		this.rebind(oTable, oBindingInfo);
	};

	/**
	 * Rebinds the table with the binding info object returned from {@link module:sap/ui/mdc/TableDelegate.updateBindingInfo updateBindingInfo}.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object used to bind the table
	 * @see updateBinding
	 * @protected
	 */
	TableDelegate.rebind = function(oTable, oBindingInfo) {
		oTable._getType().bindRows(oBindingInfo);
	};

	/**
	 * Returns the filter delegate of the table that provides basic filter functionality, such as adding filter fields.
	 *
	 * <b>Note:</b> The functionality provided in this delegate acts as a subset of a <code>FilterBarDelegate</code> to enable the table for
	 * inbuilt filtering.<br>
	 *
	 * @example
	 * TableDelegate.getFilterDelegate = {
	 * 		addItem: function() {
	 * 			var oFilterFieldPromise = new Promise(...);
	 * 			return oFilterFieldPromise;
	 * 		}
	 * }
	 * @returns {{addItem: (function(sap.ui.mdc.Table, string): Promise<sap.ui.mdc.FilterField>)}} Object for the tables filter personalization
	 * @protected
	 */
	TableDelegate.getFilterDelegate = function() {
		return {
			/**
			 * Creates an instance of a {@link sap.ui.mdc.FilterField FilterField}.
			 *
			 * By default, this method does not create a <code>FilterField</code> and returns a <code>Promise</code> that resolves with
			 * <code>null</code>.
			 *
			 * @param {sap.ui.mdc.Table} oTable Instance of the table
			 * @param {string} sPropertyName The property name
			 * @returns {Promise<sap.ui.mdc.FilterField>}
			 *     A <code>Promise</code> that resolves with an instance of <code>sap.ui.mdc.FilterField</code>.
			 * @see sap.ui.mdc.AggregationBaseDelegate#addItem
			 */
			addItem: function(oTable, sPropertyName) {
				return Promise.resolve(null);
			},

			/**
			 * This method is called during the appliance of the add condition change.
			 * The intention is to update the propertyInfo property.
			 *
			 * By default, this method does not add the condition and returns a <code>Promise</code> that resolves without a value.
			 *
			 * @param {sap.ui.mdc.Table} oTable Instance of the table
			 * @param {string} sPropertyName The property name
			 * @param {Object} mPropertyBag Instance of a property bag from the SAPUI5 flexibility API
			 * @returns {Promise} A <code>Promise</code> that resolves once the properyInfo property has been updated
			 */
			addCondition: function(oTable, sPropertyName, mPropertyBag) {
				return Promise.resolve();
			},

			/**
			 * This method is called during the appliance of the remove condition change.
			 * The intention is to update the propertyInfo property.
			 *
			 * By default, this method does not remove the condition and returns a <code>Promise</code> that resolves without a value.
			 *
			 * @param {sap.ui.mdc.Table} oTable Instance of the table
			 * @param {string} sPropertyName The property name
			 * @param {Object} mPropertyBag Instance of a property bag from the SAPUI5 flexibility API
			 * @returns {Promise} A <code>Promise</code> that resolves once the properyInfo property has been updated
			 */
			removeCondition: function(oTable, sPropertyName, mPropertyBag) {
				return Promise.resolve();
			}
		};
	};

	/**
	 * Returns the feature set for exporting data in the table.
	 *
	 * By default, this method returns basic <code>sap.ui.export.FileType.XLSX</code> capabilities.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {Promise<object>} A <code>Promise</code> that resolves with an object as specified in {@link sap.ui.export.ExportHandler}
	 * @protected
	 */
	TableDelegate.fetchExportCapabilities = function(oTable) {
		return Promise.resolve({ XLSX: {} });
	};

	/**
	 * Expands all rows.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @throws {Error} If the delegate does not support this operation
	 * @protected
	 */
	TableDelegate.expandAllRows = function(oTable) {
		throw Error("Unsupported operation: TableDelegate.expandAllRows");
	};

	/**
	 * Collapses all rows.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @throws {Error} If the delegate does not support this operation
	 * @protected
	 */
	TableDelegate.collapseAllRows = function(oTable) {
		throw Error("Unsupported operation: TableDelegate.collapseAllRows");
	};

	/**
	 * Gets the information which features this delegate supports. It may also depend on the table's state (for example, the type). This method is
	 * called during table initialization.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {{p13nModes: sap.ui.mdc.enums.TableP13nMode[], export: boolean, expandAllRows: boolean, collapseAllRows: boolean}}
	 *     Feature support information
	 * @private
	 */
	TableDelegate.getSupportedFeatures = function(oTable) {
		const aSupportedP13nModes = [TableP13nMode.Column, TableP13nMode.Sort, TableP13nMode.Filter];

		if (oTable._isOfType(TableType.ResponsiveTable)) {
			aSupportedP13nModes.push(TableP13nMode.Group);
		}

		return {
			p13nModes: aSupportedP13nModes,
			"export": true,
			expandAllRows: false,
			collapseAllRows: false
		};
	};

	/**
	 * @inheritDoc
	 */
	TableDelegate.validateState = function(oTable, oState, sKey) {
		if (sKey == "Filter" && oTable._oMessageFilter) {
			const oResourceBundle = Lib.getResourceBundleFor("sap.ui.mdc");
			return {
				validation: MessageType.Information,
				message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_FILTER_MESSAGESTRIP")
			};
		}

		return AggregationBaseDelegate.validateState.apply(this, arguments);
	};

	/**
	 * This is called after the table has loaded the necessary libraries and modules and initialized its content, but before it resolves its
	 * <code>initialized</code> Promise. It can be used to make changes to the content as part of the initialization.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {Promise} A <code>Promise</code> that resolves after the content has been initialized
	 * @private
	 */
	TableDelegate.initializeContent = function(oTable) {
		return this.initializeSelection(oTable);
	};

	/**
	 * This is called after the table has loaded the necessary libraries and modules and initialized its selection, but before it resolves its
	 * <code>initialized</code> Promise. It can be used to make changes to the selection as part of the initialization.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {Promise} A <code>Promise</code> that resolves after the selection has been initialized
	 * @private
	 */
	TableDelegate.initializeSelection = function(oTable) {
		if (oTable._isOfType(TableType.Table, true)) {
			return initializeGridTableSelection(oTable);
		} else if (oTable._isOfType(TableType.ResponsiveTable)) {
			return initializeResponsiveTableSelection(oTable);
		} else {
			return Promise.resolve();
		}
	};

	function initializeGridTableSelection(oTable) {
		const mSelectionModeMap = {
			Single: "Single",
			SingleMaster: "Single",
			Multi: "MultiToggle"
		};

		return loadModules("sap/ui/table/plugins/MultiSelectionPlugin").then((aModules) => {
			const MultiSelectionPlugin = aModules[0];

			if (oTable.isDestroyed()) {
				return Promise.reject("Destroyed");
			}

			oTable._oTable.addDependent(new MultiSelectionPlugin({
				limit: "{$sap.ui.mdc.Table#type>/selectionLimit}",
				enableNotification: true,
				showHeaderSelector: "{$sap.ui.mdc.Table#type>/showHeaderSelector}",
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
					// TODO: Add something sililar like TableTypeBase#callHook -> move to reusable util? Use here and in other places in delegates.
					oTable._onSelectionChange({
						selectAll: oEvent.getParameter("selectAll")
					});
				}
			}));
		});
	}

	function initializeResponsiveTableSelection(oTable) {
		const mSelectionModeMap = {
			Single: "SingleSelectLeft",
			SingleMaster: "SingleSelectMaster",
			Multi: "MultiSelect"
		};
		const mMultiSelectModeMap = {
			Default: "SelectAll",
			ClearAll: "ClearAll"
		};

		oTable._oTable.bindProperty("mode", {
			path: "$sap.ui.mdc.Table>/selectionMode",
			formatter: function(sSelectionMode) {
				return mSelectionModeMap[sSelectionMode]; // Default is "None"
			}
		});

		oTable._oTable.bindProperty("multiSelectMode", {
			path: "$sap.ui.mdc.Table>/multiSelectMode",
			formatter: function(sMultiSelectMode) {
				return mMultiSelectModeMap[sMultiSelectMode] || "SelectAll"; // Default is "Default"
			}
		});

		oTable._oTable.attachSelectionChange((oEvent) => {
			oTable._onSelectionChange({
				selectAll: oEvent.getParameter("selectAll")
			});
		});

		return Promise.resolve();
	}

	/**
	 * Provides the possibility to set a selection state for the table programmatically.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @param {array<sap.ui.model.Context>} aContexts The set of contexts which should be flagged as selected
	 * @private
	 * @throws {Error} If the delegate cannot support the table/select configuration.
	 */
	TableDelegate.setSelectedContexts = function(oTable, aContexts) {
		if (oTable._isOfType(TableType.ResponsiveTable)) {
			const sSelectionMode = oTable.getSelectionMode();

			if (sSelectionMode === SelectionMode.None
				|| ((sSelectionMode === SelectionMode.Single
					|| sSelectionMode === SelectionMode.SingleMaster)
					&& aContexts.length > 1)
			) {
				throw Error("Unsupported operation: Cannot select the given number of contexts in the current selection mode");
			}

			const aContextPaths = aContexts.map((oContext) => {
				return oContext.getPath();
			});

			oTable.clearSelection();
			oTable._oTable.setSelectedContextPaths(aContextPaths);
			oTable._oTable.getItems().forEach((oItem) => {
				const sPath = oItem.getBindingContextPath();
				if (sPath && aContextPaths.indexOf(sPath) > -1) {
					oItem.setSelected(true);
				}
			});
		} else {
			throw Error("Unsupported operation: Not supported for the current table type");
		}
	};

	/**
	 * Gets the selected contexts.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @returns {sap.ui.model.Context[]} The selected contexts
	 * @private
	 */
	TableDelegate.getSelectedContexts = function(oTable) {
		if (!oTable._oTable) {
			return [];
		}

		if (oTable._isOfType(TableType.Table, true)) {
			const oMultiSelectionPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.MultiSelectionPlugin");

			if (!oMultiSelectionPlugin) {
				return [];
			}

			return oMultiSelectionPlugin.getSelectedIndices().map((iIndex) => {
				return oTable._oTable.getContextByIndex(iIndex);
			}, this);
		}

		if (oTable._isOfType(TableType.ResponsiveTable)) {
			return oTable._oTable.getSelectedContexts(true);
		}

		return [];
	};

	/**
	 * Clears the selection.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the table
	 * @private
	 */
	TableDelegate.clearSelection = function(oTable) {
		if (!oTable._oTable) {
			return;
		}

		if (oTable._isOfType(TableType.Table, true)) {
			const oSelectionPlugin = PluginBase.getPlugin(oTable._oTable, "sap.ui.table.plugins.SelectionPlugin");

			if (oSelectionPlugin) {
				oSelectionPlugin.clearSelection();
			}
		}

		if (oTable._isOfType(TableType.ResponsiveTable)) {
			oTable._oTable.removeSelections(true);
		}
	};

	return TableDelegate;
});