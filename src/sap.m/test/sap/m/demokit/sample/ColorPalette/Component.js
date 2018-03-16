sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ColorPalette.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.ColorPalette.ColorPalette",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					files : [
						"ColorPalette.view.xml",
						"ColorPalette.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
