sap.ui.define(['sap/ui/core/UIComponent'], function(UIComponent) {
	"use strict";
	var Component = UIComponent.extend("sap.m.sample.NumericContentWithoutMargin.Component", {
		metadata : {
			rootView : "sap.m.sample.NumericContentWithoutMargin.Page",
			dependencies : {
				libs : ["sap.m", "sap.ui.core"]
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