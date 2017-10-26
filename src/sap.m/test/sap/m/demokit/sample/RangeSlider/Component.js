sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.RangeSlider.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.RangeSlider.V",
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
						"V.view.xml",
						"RangeSlider.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
