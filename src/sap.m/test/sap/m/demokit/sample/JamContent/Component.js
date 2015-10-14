sap.ui.define([ 'sap/ui/core/UIComponent' ], function(UIComponent) {
	"use strict";
	var Component = UIComponent.extend("sap.m.sample.JamContent.Component", {
		metadata : {
			rootView : "sap.m.sample.JamContent.Page",
			dependencies : {
				libs : [ "sap.m" ]
			},
			config : {
				sample : {
					files : [ "Page.view.xml", "Page.controller.js" ]
				}
			}
		}
	});
	return Component;
});