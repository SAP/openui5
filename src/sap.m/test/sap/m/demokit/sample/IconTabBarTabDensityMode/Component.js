sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.IconTabBarTabDensityMode.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.IconTabBarTabDensityMode.IconTabBarTabDensityMode",
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
						"IconTabBarTabDensityMode.view.xml",
						"IconTabBarTabDensityMode.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
