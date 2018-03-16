sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.BlockLayoutDefault.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.layout.sample.BlockLayoutDefault.Block",
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
						"Block.view.xml",
						"Block.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
