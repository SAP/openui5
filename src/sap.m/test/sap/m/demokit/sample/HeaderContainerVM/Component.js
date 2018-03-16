sap.ui.define([ 'sap/ui/core/UIComponent' ],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.HeaderContainerVM.Component", {
		metadata : {
			rootView : {
				"viewName": "sap.m.sample.HeaderContainerVM.Page",
				"type": "XML",
				"async": true
			},
			includes : "HeaderContainerVM/style.css",
			dependencies : {
				libs : [ "sap.m", "sap.ui.core" ]
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