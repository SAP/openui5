sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.DynamicSideContent.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.layout.sample.DynamicSideContent.DynamicSideContent",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.ui.layout"
				]
			},
			includes : [ "style.css" ],
			config : {
				sample : {
					stretch : true,
					files : [
						"DynamicSideContent.view.xml",
						"DynamicSideContent.controller.js",
						"style.css"
					]
				}
			}
		}
	});

	return Component;

});
