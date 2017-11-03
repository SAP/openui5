sap.ui.define([ 'sap/ui/core/UIComponent' ], function(UIComponent) {
	"use strict";
	var Component = UIComponent.extend("sap.m.sample.ImageContent.Component", {
		metadata : {
			rootView : {
				"viewName": "sap.m.sample.ImageContent.Page",
				"type": "XML",
				"async": true
			},
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