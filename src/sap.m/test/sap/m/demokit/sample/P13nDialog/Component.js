sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.P13nDialog.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.P13nDialog.Page",
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
						"Page.view.xml",
						"Page.controller.js",
						"PersonalizationDialog.fragment.xml",
						"products.json"
					]
				}
			}
		}
	});

	return Component;

});
