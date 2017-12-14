sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.HeaderContainer.Component", {
		metadata : {
			rootView : {
				"viewName": "sap.m.sample.HeaderContainer.Page",
				"type": "XML"
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