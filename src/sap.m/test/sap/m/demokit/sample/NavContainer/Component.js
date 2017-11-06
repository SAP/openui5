sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.NavContainer.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.NavContainer.V",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			includes : [ "NavContainer/style.css" ],
			config : {
				sample : {
					files : [
						"V.view.xml",
						"C.controller.js",
						"style.css"
					]
				}
			}
		}
	});

	return Component;

});
