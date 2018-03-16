sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ScrollContainer.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.ScrollContainer.ScrollContainer",
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
					stretch : true,
					files : [
						"ScrollContainer.view.xml",
						"ScrollContainer.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
