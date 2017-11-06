sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.Image.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.Image.ImageGroup",
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
						"ImageGroup.view.xml",
						"ImageGroup.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
