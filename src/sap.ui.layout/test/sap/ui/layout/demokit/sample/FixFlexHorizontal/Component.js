sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.FixFlexHorizontal.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.layout.sample.FixFlexHorizontal.V",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
				    "sap.ui.layout",
					"sap.m"
				]
			},
			includes : [ "FixFlexHorizontal/style.css" ],
			config : {
				sample : {
					stretch : true,
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
