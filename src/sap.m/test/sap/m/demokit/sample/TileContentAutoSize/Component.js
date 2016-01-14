sap.ui.define(['sap/ui/core/UIComponent'], function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.TileContentAutoSize.Component", {

		metadata : {
			rootView : "sap.m.sample.TileContentAutoSize.Page",
			dependencies : {
				libs : ["sap.m"]
			},
			config : {
				sample : {
					files : ["Page.view.xml"]
				}
			}
		}
	});
	return Component;
});