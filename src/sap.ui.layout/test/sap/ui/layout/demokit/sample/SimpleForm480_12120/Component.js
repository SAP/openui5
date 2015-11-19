sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.SimpleForm480_12120.Component", {

		metadata : {
			rootView : "sap.ui.layout.sample.SimpleForm480_12120.Page",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"Page.view.xml",
						"Page.controller.js",
						"Change.fragment.xml",
						"Display.fragment.xml"
					]
				}
			}
		}
	});

	return Component;

});
