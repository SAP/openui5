/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Delegate class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define(["sap/ui/mdc/AggregationBaseDelegate"], function(AggregationBaseDelegate) {
	"use strict";
	/**
	 * Base Delegate for {@link sap.ui.mdc.FilterBar FilterBar}. Extend this object in your project to use all functionalites of the {@link sap.ui.mdc.FilterBar FilterBar}.
	 * <b>Note:</b>
	 * The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 * @author SAP SE
	 * @private
	 * @experimental
	 * @since 1.61.0
	 * @alias sap.ui.mdc.FilterBarDelegate
	 */
	var FilterBarDelegate = Object.assign({}, AggregationBaseDelegate);

	FilterBarDelegate.addItem = function(sPropertyName, oFilterBar, mPropertyBag) {
		return this.beforeAddFilterFlex.apply(this, arguments);
	};

	FilterBarDelegate.removeItem = function(sPropertyName, oFilterBar, mPropertyBag) {
		return this.afterRemoveFilterFlex.apply(this, arguments);
	};

	/**
	 *
	 * @deprecated
	 * <b>Note:</b> once all dependencies to the beforeAdd* and afterRemove* hooks have been changed,
	 * this method should be removed. Please see: {@link  sap.ui.mdc.AggregationBaseDelegate AggregationBaseDelegate}
	 *
	 * @param {String} sPropertyName The name of the property info object/JSON
	 * @param {sap.ui.mdc.FilterBar} oFilterBar Instance of a filter bar
	 * @param {Object} mPropertyBag Instance of property bag from SAPUI5 flexibility change API
	 * @returns {Promise} Promise that resolves with an instance of {@link sap.ui.mdc.FilterItem FilterItem}
	 * @public
	 */
	FilterBarDelegate.beforeAddFilterFlex = function(sPropertyName, oFilterBar, mPropertyBag) {
		return Promise.resolve(null);
	};

	/**
	 *
	 * @deprecated
	 * <b>Note:</b> once all dependencies to the beforeAdd* and afterRemove* hooks have been changed,
	 * this method should be removed. Please see: {@link  sap.ui.mdc.AggregationBaseDelegate AggregationBaseDelegate}
	 *
	 * Triggers any necessary follow-up steps that need to be taken after the removal of filter items.
	 * The returned Boolean value inside the <code>Promise</code> can be used to prevent the default follow-up behavior of the SAPUI5 flexibility handling.
	 *
	 *
	 * @param {sap.ui.mdc.FilterField} oFilterField The filter field that was removed
	 * @param {sap.ui.mdc.FilterBar} oFilterBar Instance of a filter bar
	 * @param {Object} mPropertyBag Instance of property bag from SAPUI5 flexibility
	 * @returns {Promise} Promise that resolves with <code>true</code>, <code>false</code> to allow/prevent default behavior of the change
	 * @public
	 */
	FilterBarDelegate.afterRemoveFilterFlex = function(oFilterField, oFilterBar, mPropertyBag) {
		// return true within the Promise for default behavior
		return Promise.resolve(true);
	};

	return FilterBarDelegate;
});
