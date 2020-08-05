/*
 * ! ${copyright}
 */
sap.ui.define(["sap/ui/mdc/Delegate"], function(BaseDelegate) {
	"use strict";

	/**
	 * @experimental
	 * @private
	 * @since 1.61
	 * @alias sap.ui.mdc.chart.Delegate
	 */
	var Delegate = BaseDelegate.extend("sap.ui.mdc.chart.Delegate", {
		retrieveAllMetadata: function() {
			return {};
		},
		retrieveAggregationItem: function (sAggregationName, sPropertyKey) {
			return null;
		},
		preConfiguration: function(oNode, oVisitor) {
			return oNode;
		},
		getNavigationTargets: function(oField) {
			return [];
		}
	});

	return Delegate;
});
