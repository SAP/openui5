sap.ui.define(['sap/ui/core/UIComponent'], function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.GenericTile2x1SingleCont.Component", {
		metadata : {
			rootView : "sap.m.sample.GenericTile2x1SingleCont.Page",
			dependencies : {
				libs : ["sap.m"]
			},
			config : {
				sample : {
					files : ["Page.view.xml", "Page.controller.js"]
				}
			}
		}
	});
	return Component;
});