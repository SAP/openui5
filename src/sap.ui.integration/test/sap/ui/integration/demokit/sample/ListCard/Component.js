sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.integration.sample.ListCard.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.integration.sample.ListCard.ListCard",
				"type": "XML",
				"async": true
			},
			includes : [],
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.integration"
				]
			},
			config : {
				sample : {
					files : [
						"ListCard.view.xml",
						"ListCard.controller.js",
						"model/cardManifest.json"
					]
				}
			}
		}
	});

	return Component;

});
