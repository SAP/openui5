sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ToolbarShrinkable.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.ToolbarShrinkable.Toolbar",
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
						"Toolbar.view.xml",
						"Toolbar.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
