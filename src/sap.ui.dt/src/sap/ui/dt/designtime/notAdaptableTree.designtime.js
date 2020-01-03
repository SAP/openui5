/*!
 * ${copyright}
 */

// Provides default design time for 'not-adaptable-tree' scenario
sap.ui.define([], function() {
	"use strict";

	return function(oManagedObject) {
		var sNotAdaptable = "not-adaptable";
		var oReturnDesignTime = {
			aggregations: {},
			actions: sNotAdaptable
		};
		var oAggregationDT = {
			propagateMetadata: function() {
				return {
					actions: sNotAdaptable
				};
			},
			actions: sNotAdaptable
		};
		var oAggregations = oManagedObject.getMetadata().getAllAggregations();

		Object.keys(oAggregations).reduce(function(oDesignTime, sAggregation) {
			oDesignTime.aggregations[sAggregation] = oAggregationDT;
			return oDesignTime;
		}, oReturnDesignTime);

		return oReturnDesignTime;
	};
});