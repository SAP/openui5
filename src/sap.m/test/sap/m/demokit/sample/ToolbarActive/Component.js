sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ToolbarActive.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.ToolbarActive.Toolbar",
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
						"Toolbar.view.xml",
						"Toolbar.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
