sap.ui.define(['sap/ui/core/UIComponent'], function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.GenericTag.Component", {
		metadata : {
			rootView : {
				"viewName": "sap.m.sample.GenericTag.Page",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : ["sap.m"]
			},
			includes : [],
			config : {
				sample : {
					files : ["Page.view.xml", "Page.controller.js"]
				}
			}
		}
	});
	return Component;
});