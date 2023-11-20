/*!
 * ${copyright}
 */

/**
 * @fileOverview Application component for OData V2 Analytical Table AutoExpand mode.
 * @version @version@
 */
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/UIComponent",
	"sap/ui/test/TestUtils"
], function (jQuery, UIComponent, TestUtils) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.odata.v2.AutoExpand.Component", {
		metadata : {
			manifest : "json"
		},

		exit : function () {
			TestUtils.retrieveData("sap.ui.core.sample.odata.v2.AutoExpand.sandbox").restore();
			// ensure the sandbox module is reloaded so that sandbox initialization takes place
			// again the next time the component used
			jQuery.sap.unloadResources(
				"sap/ui/core/sample/odata/v2/AutoExpand/Sandbox.js",
				/*bPreloadGroup*/false, /*bUnloadAll*/true, /*bDeleteExports*/true);
		}
	});
});
