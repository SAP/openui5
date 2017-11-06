sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.OverflowToolbarSimple.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.OverflowToolbarSimple.OverflowToolbar",
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
						"OverflowToolbar.view.xml",
						"OverflowToolbar.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
