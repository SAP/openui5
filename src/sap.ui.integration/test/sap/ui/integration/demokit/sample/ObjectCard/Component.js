sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.integration.sample.ObjectCard.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.integration.sample.ObjectCard.ObjectCard",
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
						"ObjectCard.view.xml",
						"ObjectCard.controller.js",
						"model/manifest.json",
						"model/employee.json",
						"model/i18n/i18n.properties"
					]
				}
			}
		}
	});

	return Component;

});
