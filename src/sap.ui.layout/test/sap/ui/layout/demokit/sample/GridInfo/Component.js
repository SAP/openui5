sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.GridInfo.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.layout.sample.GridInfo.Grid",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"Grid.view.xml",
						"Grid.controller.js",
						"persons.json"
					]
				}
			}
		}
	});

	return Component;

});
