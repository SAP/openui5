sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.TileContainer.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.TileContainer.Page",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"Page.view.xml",
						"Page.controller.js",
						"data.json"
					]
				}
			}
		}
	});

	return Component;

});
