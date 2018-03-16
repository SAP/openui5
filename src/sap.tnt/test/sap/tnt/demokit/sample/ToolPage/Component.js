sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.tnt.sample.ToolPage.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.tnt.sample.ToolPage.ToolPage",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.m",
					"sap.tnt"
				]
			},
			config : {
				sample : {
					stretch: true,
					files : [
						"ToolPage.view.xml", "ToolPage.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
