sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.RangeSlider.Component", {

		metadata : {
			rootView : "sap.m.sample.RangeSlider.V",
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
