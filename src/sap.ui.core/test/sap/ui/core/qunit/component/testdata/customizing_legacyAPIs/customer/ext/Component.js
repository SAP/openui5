sap.ui.define([
	"sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";


	var Component = UIComponent.extend("testdata.customizing.customer.Component", {

		metadata : {
			version : "1.0",
			rootView : {
				viewName: "testdata.customizing.customer.ext.Main",
				type: "XML",
				id: "mainView",
				async: true
			},
			customizing: {
			}
		}

	});

	return Component;

});
