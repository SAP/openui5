/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component for OData V4 Data Aggregation.
 * @version @version@
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/UIComponent",
	"sap/ui/test/TestUtils"
], function (jQuery, UIComponent, TestUtils) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.odata.v4.DataAggregation.Component", {
		metadata : {
			manifest : "json"
		},

		exit : function () {
			TestUtils.retrieveData("sap.ui.core.sample.odata.v4.DataAggregation.sandbox").restore();
			// ensure the sandbox module is reloaded so that sandbox initialization takes place
			// again the next time the component used
			jQuery.sap.unloadResources(
				"sap/ui/core/sample/odata/v4/DataAggregation/Sandbox.js",
				/*bPreloadGroup*/false, /*bUnloadAll*/true, /*bDeleteExports*/true);
		}
	});
});
