sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.OverflowToolbarFooter.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.OverflowToolbarFooter.OverflowToolbar",
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
						"OverflowToolbar.view.xml",
						"OverflowToolbar.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
