sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ToolbarDesign.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.ToolbarDesign.Toolbar",
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
					stretch : true,
					files : [
						"Toolbar.view.xml",
						"Toolbar.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
