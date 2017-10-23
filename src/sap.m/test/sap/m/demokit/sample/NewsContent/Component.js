sap.ui.define(['sap/ui/core/UIComponent'], function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.NewsContent.Component", {
		metadata : {
			rootView : {
				"viewName": "sap.m.sample.NewsContent.Page",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : ["sap.m"]
			},
			config : {
				sample : {
					files : ["Page.view.xml" , "Page.controller.js"]
				}
			}
		}
	});
	return Component;
});