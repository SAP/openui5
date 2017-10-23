sap.ui.define(['sap/ui/core/UIComponent'], function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.GenericTileStates.Component", {
		metadata : {
			rootView : {
				"viewName": "sap.m.sample.GenericTileStates.Page",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : ["sap.m"]
			},
			includes : [ "style.css" ],
			config : {
				sample : {
					files : ["Page.view.xml", "Page.controller.js", "style.css"]
				}
			}
		}
	});
	return Component;
});