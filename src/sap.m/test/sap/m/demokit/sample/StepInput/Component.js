sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.StepInput.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.StepInput.StepInput",
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
						"StepInput.view.xml",
						"StepInput.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
