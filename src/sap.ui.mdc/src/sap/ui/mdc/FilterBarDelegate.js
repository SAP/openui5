/*!
 * ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Delegate class used to help create content in the filterbar and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define(["sap/ui/mdc/AggregationBaseDelegate"], function(AggregationBaseDelegate) {
	"use strict";
	/**
	 * @class Base Delegate for {@link sap.ui.mdc.FilterBar FilterBar}. Extend this object in your project to use all functionalites of the {@link sap.ui.mdc.FilterBar FilterBar}.
	 * <b>Note:</b>
	 * The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.fe
	 * @experimental As of version 1.61.0
	 * @MDC_PUBLIC_CANDIDATE
	 * @since 1.61.0
	 * @alias sap.ui.mdc.FilterBarDelegate
	 */
	var FilterBarDelegate = Object.assign({}, AggregationBaseDelegate);

	FilterBarDelegate.addItem = function(sPropertyName, oFilterBar, mPropertyBag) {
		return Promise.resolve(null);
	};

	FilterBarDelegate.removeItem = function(sPropertyName, oFilterBar, mPropertyBag) {
		// return true within the Promise for default behavior
		return Promise.resolve(true);
	};

	/**
	 * This methods is called during the appliance of the add condition change.
	 * This intention is to update the propertyInfo property.
	 *
	 * @param {string} sPropertyName The name of a property.
	 * @param {sap.ui.mdc.FilterBar} oFilterBar - the instance of filter bar
	 * @param {Object} mPropertyBag Instance of property bag from Flex change API
	 * @returns {Promise} Promise that resolves once the properyInfo property was updated
	 */
	FilterBarDelegate.addCondition = function(sPropertyName, oFilterBar, mPropertyBag) {
		return Promise.resolve();
    };

	/**
	 * This methods is called during the appliance of the remove condition change.
	 * This intention is to update the propertyInfo property.
	 *
	 * @param {string} sPropertyName The name of a property.
	 * @param {sap.ui.mdc.FilterBar} oFilterBar - the instance of filter bar
	 * @param {Object} mPropertyBag Instance of property bag from Flex change API
	 * @returns {Promise} Promise that resolves once the properyInfo property was updated
	 */
	FilterBarDelegate.removeCondition = function(sPropertyName, oFilterBar, mPropertyBag) {
		return Promise.resolve();
    };

	return FilterBarDelegate;
});
