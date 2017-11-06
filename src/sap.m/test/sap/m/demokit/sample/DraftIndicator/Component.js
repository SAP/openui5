sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.DraftIndicator.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.DraftIndicator.V",
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
					stretch: true,
					files : [
						"V.view.xml", "C.controller.js"
					]
				}
			}
		}
	});

	return Component;

});