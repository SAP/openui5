sap.ui.define([
	'sap/ui/core/UIComponent'
], function(UIComponent) {
	"use strict";

	// extended by testdata.customizing.async.viewExtensions.customer.Component
	return UIComponent.extend("testdata.customizing.async.viewExtensions.sap.Component", {
		metadata : {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			version : "1.0",
			rootView : {
				id: "mainView",
				viewName: "testdata.customizing.async.viewExtensions.sap.views.Main",
				type: "XML"
			}
		}
	});
});
