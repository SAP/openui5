/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.form.Form control
sap.ui.define([],
	function() {
	"use strict";
	
	return {
		aggregations : {
			formContainers : {
				getAggregationDomRef : function(sAggregationName) {
					if (this.getLayout() instanceof sap.ui.layout.form.GridLayout) {
						return ":sap-domref tbody";
					} else {
						return ":sap-domref > div";
					}
				}
			}
		},
		name: "{name}",
		description: "{description}"
	};
	
}, /* bExport= */ true);