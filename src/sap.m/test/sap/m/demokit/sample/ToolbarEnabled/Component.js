sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ToolbarEnabled.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.ToolbarEnabled.Toolbar",
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
