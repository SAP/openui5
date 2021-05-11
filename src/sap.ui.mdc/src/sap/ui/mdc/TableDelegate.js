/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the table/column and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
	"sap/ui/mdc/AggregationBaseDelegate"
], function(AggregationBaseDelegate) {
	"use strict";

	/**
	 * Base delegate class for sap.ui.mdc.Table.<br>
	 * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 *
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.60
	 * @alias sap.ui.mdc.TableDelegate
	 */
	var TableDelegate = Object.assign({}, AggregationBaseDelegate);

	TableDelegate.addItem = function(sPropertyName, oTable, mPropertyBag) {
		return Promise.resolve(null);
	};

	TableDelegate.removeItem = function(sPropertyName, oTable, mPropertyBag) {
		// return true within the Promise for default behaviour (e.g. continue to destroy the column)
		return Promise.resolve(true);
	};

	/**
	 * Provides hook to update the binding info object that is used to bind the table to the model.
	 *
	 * @abstract
	 * @param {sap.ui.mdc.Table} oMDCTable The MDC table instance
	 * @param {object} oDelegatePayload The delegate payload
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model
	 */
	TableDelegate.updateBindingInfo = function(oMDCTable, oDelegatePayload, oBindingInfo) {
		oBindingInfo.parameters = {};
		oBindingInfo.filters = [];
		oBindingInfo.sorter = oMDCTable._getSorters();
	};

	/**
	 * Updates the row binding of the table.
	 *
	 * The default implementation rebinds the table but model-specific subclasses must call dedicated binding methods to update the binding instead of using {@link #rebindTable}.
	 *
	 * @virtual
	 * @param {sap.ui.mdc.Table} oMDCTable The MDC table instance
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model
	 * @param {sap.ui.model.ListBinding} [oBinding] The binding instance of the table
	 */
	TableDelegate.updateBinding = function(oMDCTable, oBindingInfo, oBinding) {
		this.rebindTable(oMDCTable, oBindingInfo);
	};

	/**
	 * Rebinds the table.
	 *
	 * @param {sap.ui.mdc.Table} oMDCTable The MDC table instance
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo The binding info object to be used to bind the table to the model
	 */
	TableDelegate.rebindTable = function(oMDCTable, oBindingInfo) {
		if (oMDCTable._oTable) {
			oMDCTable._oTable.bindRows(oBindingInfo);
		}
	};

	/**
	 * Provides the table's filter delegate that provides basic filter functionality such as adding filter fields.
	 * <b>Note:</b> The functionality provided in this delegate should act as a subset of a FilterBarDelegate
	 * to enable the table for inbuilt filtering.
	 *
	 * @example <caption>Example usage of <code>getFilterDelegate</code></caption>
	 * oFilterDelegate = {
	 * 		addItem: function() {
	 * 			var oFilterFieldPromise = new Promise(...);
	 * 			return oFilterFieldPromise;
	 * 		}
	 * }
	 * @returns {Object} Object for the tables filter personalization
	 * @public
	 */
	TableDelegate.getFilterDelegate = function() {
		return {
			/**
			 *
			 * @param {String} sPropertyName The property name
			 * @param {Object} oTable Instance of the table
			 *
			 * @returns {Promise} Promise that resolves with an instance of a <code>sap.ui.mdc.FilterField</code>.
			 * For more information, see {@link sap.ui.mdc.AggregationBaseDelegate#addItem AggregationBaseDelegate}.
			 */
			addItem: function(sPropertyName, oTable) {
				return Promise.resolve(null);
			}
		};
	};

	return TableDelegate;
});
