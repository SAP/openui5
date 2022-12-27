sap.ui.define([
	'sap/ui/core/UIComponent'
], function(UIComponent) {
	"use strict";

	// extended by testdata.customizing.async.noInterface.customer.Component
	return UIComponent.extend("testdata.customizing.async.noInterface.sap.Component", {
		metadata : {
			version : "1.0",
			rootView : {
				async: true,
				id: "mainView",
				type: "XML",
				viewName: "testdata.customizing.async.noInterface.sap.views.Main"
			}
		}
	});
});
