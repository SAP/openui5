sap.ui.define(['sap/ui/core/UIComponent'], function(UIComponent) {
	"use strict";
	var Component = UIComponent.extend("sap.m.sample.NumericContentIcon.Component", {
		metadata : {
			rootView : "sap.m.sample.NumericContentIcon.Page",
			dependencies : {
				libs : ["sap.m", "sap.ui.core"]
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