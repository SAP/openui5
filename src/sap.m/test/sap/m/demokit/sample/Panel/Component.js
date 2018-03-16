sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.Panel.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.Panel.Panel",
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
						"Panel.view.xml",
						"Panel.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
