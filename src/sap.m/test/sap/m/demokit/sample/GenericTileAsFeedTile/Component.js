sap.ui.define(['sap/ui/core/UIComponent'], function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.GenericTileAsFeedTile.Component", {
		metadata : {
			rootView : "sap.m.sample.GenericTileAsFeedTile.Page",
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