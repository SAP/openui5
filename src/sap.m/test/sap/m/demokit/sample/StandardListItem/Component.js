sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.StandardListItem.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.StandardListItem.List",
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
						"List.view.xml",
						"List.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
