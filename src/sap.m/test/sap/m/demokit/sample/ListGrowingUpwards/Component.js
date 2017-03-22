sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ListGrowingUpwards.Component", {

		metadata : {
			rootView : "sap.m.sample.ListGrowingUpwards.List",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"List.view.xml",
						"List.controller.js",
						"MockServer.js"
					]
				}
			}
		}
	});

	return Component;

});
