/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the table/column and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/AggregationBaseDelegate", "sap/ui/core/library", "sap/ui/core/Core"
], function(AggregationBaseDelegate, coreLibrary, Core) {
	"use strict";

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
	 * @param {sap.ui.mdc.Table} oMDCTable Instance of the MDC table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model
	 * @protected
	 */
	TableDelegate.updateBindingInfo = function(oMDCTable, oBindingInfo) {
		oBindingInfo.parameters = {};

		if (oMDCTable._oMessageFilter) {
			oBindingInfo.filters = [oMDCTable._oMessageFilter];
		} else {
			oBindingInfo.filters = [];
		}
		oBindingInfo.sorter = oMDCTable._getSorters();
	};

	/**
	 * Updates the row binding of the table.
	 *
	 * The default implementation rebinds the table, but model-specific subclasses must call dedicated binding methods to update the binding instead
	 * of using {@link #rebind}.
	 *
	 * @param {sap.ui.mdc.Table} oMDCTable Instance of the table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model
	 * @param {sap.ui.model.ListBinding} [oBinding] The binding instance of the table
	 * @protected
	 */
	TableDelegate.updateBinding = function(oMDCTable, oBindingInfo, oBinding) {
		this.rebind(oMDCTable, oBindingInfo);
	};

	TableDelegate.validateState = function(oControl, oState, sKey) {
		if (sKey == "Filter" && oControl._oMessageFilter) {
			var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");
			return {
				validation: coreLibrary.MessageType.Information,
				message: oResourceBundle.getText("table.PERSONALIZATION_DIALOG_FILTER_MESSAGESTRIP")
			};
		}

		return  AggregationBaseDelegate.validateState.apply(this, arguments);
	};

	/**
	 * Rebinds the table.
	 *
	 * @param {sap.ui.mdc.Table} oMDCTable Instance of the MDC table
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model
	 * @protected
	 */
	TableDelegate.rebind = function (oMDCTable, oBindingInfo) {
		if (oMDCTable._oTable) {
			oMDCTable._oTable.bindRows(oBindingInfo);
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
			 * @returns {Promise<sap.ui.mdc.FilterField>} <code>Promise</code> that resolves with an instance of a <code>sap.ui.mdc.FilterField</code>.
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
	 * @returns {Promise} Export capabilities with specific features
	 * @protected
	 */
	TableDelegate.fetchExportCapabilities = function() {
		var oExportCapabilities = {
			"XLSX": {} // default
		};

		// This is a temporary approach for testing purposes
		if (new URL(window.location.href).search.indexOf("sap-ui-xx-enablePDFExport=true") > -1) {
			oExportCapabilities["PDF"] = {
				DocumentDescriptionReference: "../../../../default/iwbep/common/0001/$metadata",
				DocumentDescriptionCollection: "MyDocumentDescriptions",
				ArchiveFormat: true,
				Signature: true,
				CoverPage: true,
				FitToPage: false,
				ResultSizeDefault: 5000,
				ResultSizeMaximum: 20000
			};
		}
		return Promise.resolve(oExportCapabilities);
	};


	return TableDelegate;
});
