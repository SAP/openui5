sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageDynamicSideContentBtn.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.uxap.sample.ObjectPageDynamicSideContentBtn.ObjectPageDynamicSideContentBtn",
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
						"ObjectPageDynamicSideContentBtn.view.xml",
						"ObjectPageDynamicSideContentBtn.controller.js",
						"style.css",
						"employee.json"
					]
				}
			}
		}
	});

	return Component;

});
