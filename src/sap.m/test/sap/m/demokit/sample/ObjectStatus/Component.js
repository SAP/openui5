sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ObjectStatus.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.ObjectStatus.V",
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
						"V.view.xml", "C.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
