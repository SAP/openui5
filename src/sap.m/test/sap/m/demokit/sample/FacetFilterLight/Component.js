sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.FacetFilterLight.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.FacetFilterLight.FacetFilter",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				],
				components : [
					"sap.m.sample.Table"
				]
			},
			config : {
				sample : {
					files : [
						"FacetFilter.view.xml",
						"../FacetFilterSimple/FacetFilter.controller.js",
						"../Table/Component.js",
						"../Table/Formatter.js",
						"../Table/Table.controller.js",
						"../Table/Table.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
