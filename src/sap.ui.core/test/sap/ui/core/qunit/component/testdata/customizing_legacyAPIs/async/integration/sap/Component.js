sap.ui.define([
	'sap/ui/core/UIComponent'
], function(UIComponent) {
	"use strict";

	// extended by testdata.customizing.async.integration.customer.Component
	return UIComponent.extend("testdata.customizing.async.integration.sap.Component", {
		metadata : {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			version : "1.0",
			rootView : {
				id: "mainView",
				viewName: "testdata.customizing.async.integration.sap.views.Main",
				type: "XML"
			}
		}
	});
});
