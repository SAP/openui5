sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.FormattedText.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.FormattedText.V",
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
						"C.controller.js",
						"V.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
