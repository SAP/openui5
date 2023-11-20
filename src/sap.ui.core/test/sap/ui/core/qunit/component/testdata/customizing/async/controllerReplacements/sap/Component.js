sap.ui.define([
	'sap/ui/core/UIComponent'
], function(UIComponent) {
	"use strict";

	// extended by testdata.customizing.async.controllerReplacements.customer.Component
	return UIComponent.extend("testdata.customizing.async.controllerReplacements.sap.Component", {
		metadata : {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			version : "1.0",
			rootView : {
				id: "mainView",
				viewName: "testdata.customizing.async.controllerReplacements.sap.views.Main",
				type: "XML"
			}
		}
	});
});
