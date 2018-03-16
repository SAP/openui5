sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.HeaderContainerNoDividers.Component", {
		metadata : {
			rootView : {
				"viewName": "sap.m.sample.HeaderContainerNoDividers.Page",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [ "sap.m", "sap.ui.core" ]
			},
			config : {
				sample : {
					files : [
						"Page.view.xml",
						"Page.controller.js"
					]
				}
			}
		}
	});

	return Component;
});