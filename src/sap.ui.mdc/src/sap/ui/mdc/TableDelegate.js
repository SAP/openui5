/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the table/column and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"./AggregationBaseDelegate",
	"./library",
	"sap/ui/model/Sorter",
	"sap/ui/core/library",
	"sap/ui/core/Core"
], function(
	AggregationBaseDelegate,
	library,
	Sorter,
	coreLibrary,
	Core
) {
	"use strict";

	var P13nMode = library.TableP13nMode;
	var TableType = library.TableType;

	/**
	 * Base delegate for {@link sap.ui.mdc.Table}.
	 *
	 * @author SAP SE
	 * @namespace
	 * @alias module:sap/ui/mdc/TableDelegate
	 * @extends module:sap/ui/mdc/AggregationBaseDelegate
	 * @experimental
	 * @since 1.60
	 * @private
	 * @ui5-restricted sap.fe
	 * MDC_PUBLIC_CANDIDATE
	 */
	var TableDelegate = Object.assign({}, AggregationBaseDelegate);

	/**
	 * Provides a hook to update the binding info object that is used to bind the table to the model.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model
	 * @protected
	 */
	TableDelegate.updateBindingInfo = function(oTable, oBindingInfo) {
		oBindingInfo.parameters = {};
		oBindingInfo.filters = [];
		oBindingInfo.sorter = [];

		if (oTable._oMessageFilter) {
			oBindingInfo.filters = [oTable._oMessageFilter];
		}

		if (oTable._bMobileTable) {
			var oGroupedProperty = oTable._getGroupedProperties()[0];

			if (oGroupedProperty) {
				var oSortedProperty = oTable._getSortedProperties().find(function(oProperty) {
					return oProperty.name === oGroupedProperty.name;
				});
				var sPath = oTable.getPropertyHelper().getProperty(oGroupedProperty.name).path;
				var bDescending = oSortedProperty ? oSortedProperty.descending : false;

				oBindingInfo.sorter.push(new Sorter(sPath, bDescending, function(oContext) {
					return this.formatGroupHeader(oTable, oContext, oGroupedProperty.name);
				}.bind(this)));
			}
		}

		oBindingInfo.sorter = oBindingInfo.sorter.concat(
			oBindingInfo.sorter.length === 1
				? oTable._getSorters().filter(function(oSorter) {
					return oSorter.sPath !== oBindingInfo.sorter[0].sPath;
				})
				: oTable._getSorters()
		);
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
	 * @protected
	 */
	TableDelegate.updateBinding = function(oTable, oBindingInfo, oBinding) {
		this.rebind(oTable, oBindingInfo);
	};

	/**
	 * Formats the title text of a group header row of the table.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @param {sap.ui.model.Context} oContext Binding context
	 * @param {string} sProperty The name of the grouped property
	 * @returns {string | undefined} The group header title. If <code>undefined</code> is returned, the default group header title is set.
	 * @protected
	 */
	TableDelegate.formatGroupHeader = function(oTable, oContext, sProperty) {
		var oProperty = oTable.getPropertyHelper().getProperty(sProperty);
		var oTextProperty = oProperty.textProperty;
		var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
		var sResourceKey = "table.ROW_GROUP_TITLE";
		var aValues = [oProperty.label, oContext.getProperty(oProperty.path, true)];

		if (oTextProperty) {
			sResourceKey = "table.ROW_GROUP_TITLE_FULL";
			aValues.push(oContext.getProperty(oTextProperty.path, true));
		}

		return oResourceBundle.getText(sResourceKey, aValues);
	};

	TableDelegate.validateState = function(oControl, oState, sKey) {
		if (sKey == "Filter" && oControl._oMessageFilter) {
			var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
			return {
				validation: coreLibrary.MessageType.Information,
				message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_FILTER_MESSAGESTRIP")
			};
		}

		return AggregationBaseDelegate.validateState.apply(this, arguments);
	};

	/**
	 * Rebinds the table.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model
	 * @protected
	 */
	TableDelegate.rebind = function(oTable, oBindingInfo) {
		if (oTable._oTable) {
			oTable._oTable.bindRows(oBindingInfo);
		}
	};

	/**
	 * Returns the filter delegate of the table that provides basic filter functionality, such as adding filter fields.
	 * <b>Note:</b> The functionality provided in this delegate acts as a subset of a <code>FilterBarDelegate</code> to enable the table for inbuilt
	 * filtering.
	 *
	 * @example <caption>Example usage of <code>getFilterDelegate</code></caption>
	 * oFilterDelegate = {
	 * 		addItem: function() {
	 * 			var oFilterFieldPromise = new Promise(...);
	 * 			return oFilterFieldPromise;
	 * 		}
	 * }
	 * @returns {{addItem: (function(string, sap.ui.mdc.Table): Promise<sap.ui.mdc.FilterField>)}} Object for the tables filter personalization
	 * @protected
	 */
	TableDelegate.getFilterDelegate = function() {
		return {
			/**
			 * Creates an instance of a <code>sap.ui.mdc.FilterField</code>.
			 *
			 * @param {string} sPropertyName The property name
			 * @param {sap.ui.mdc.Table} oTable Instance of the table
			 * @returns {Promise<sap.ui.mdc.FilterField>} A promise that resolves with an instance of <code>sap.ui.mdc.FilterField</code>.
			 * @see sap.ui.mdc.AggregationBaseDelegate#addItem
			 */
			addItem: function(sPropertyName, oTable) {
				return Promise.resolve(null);
			},

			/**
			 * This methods is called during the appliance of the add condition change.
			 * This intention is to update the propertyInfo property.
			 *
			 * @param {string} sPropertyName The name of a property.
			 * @param {sap.ui.mdc.Control} oControl - the instance of the mdc control
			 * @param {Object} mPropertyBag Instance of property bag from Flex change API
			 * @returns {Promise} Promise that resolves once the properyInfo property was updated
			 */
			addCondition: function(sPropertyName, oControl, mPropertyBag) {
				return Promise.resolve();
			},

			/**
			 * This methods is called during the appliance of the remove condition change.
			 * This intention is to update the propertyInfo property.
			 *
			 * @param {string} sPropertyName The name of a property.
			 * @param {sap.ui.mdc.Control} oControl - the instance of the mdc control
			 * @param {Object} mPropertyBag Instance of property bag from Flex change API
			 * @returns {Promise} Promise that resolves once the properyInfo property was updated
			 */
			removeCondition: function(sPropertyName, oControl, mPropertyBag) {
				return Promise.resolve();
			}
		};
	};

	/**
	 * Returns the feature set for exporting data in the MDC Table.
	 *
	 * @param {sap.ui.mdc.Table} oTable Instance of the MDC table
	 * @returns {Promise} Export capabilities with specific features
	 * @protected
	 */
	TableDelegate.fetchExportCapabilities = function(oTable) {
		return Promise.resolve({ XLSX: {} });
	};

	TableDelegate.getSupportedP13nModes = function(oTable) {
		var aSupportedModes = [P13nMode.Column, P13nMode.Sort, P13nMode.Filter];

		if (oTable._getStringType() === TableType.ResponsiveTable) {
			aSupportedModes.push(P13nMode.Group);
		}

		return aSupportedModes;
	};

	return TableDelegate;
});
