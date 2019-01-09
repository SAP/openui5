sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.integration.sample.AnalyticalCard.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.integration.sample.AnalyticalCard.AnalyticalCard",
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
						"AnalyticalCard.view.xml",
						"AnalyticalCard.controller.js",
						"model/cardManifests.json"
					]
				}
			}
		}
	});

	return Component;

});
