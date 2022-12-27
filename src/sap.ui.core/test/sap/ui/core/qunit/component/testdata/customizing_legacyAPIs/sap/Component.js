sap.ui.define([
	"sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("testdata.customizing.sap.Component", {

		metadata : {
			version : "1.0",
			rootView : {
				viewName: "testdata.customizing.sap.Main",
				type: "XML",
				id: "mainView",
				async: true
			}
		}

	});

	return Component;
});
