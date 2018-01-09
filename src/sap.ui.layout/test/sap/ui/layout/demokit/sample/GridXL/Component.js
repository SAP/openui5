sap.ui.define([
	'sap/ui/core/UIComponent'
], function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.GridXL.Component", {

		metadata: {
			rootView: {
				"viewName": "sap.ui.layout.sample.GridXL.Grid",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: [
					"sap.m", "sap.ui.layout"
				]
			},
			config: {
				sample: {
					files: [
						"Grid.view.xml",
						"Grid.controller.js",
						"information.json"
					]
				}
			}
		}
	});

	return Component;

});
