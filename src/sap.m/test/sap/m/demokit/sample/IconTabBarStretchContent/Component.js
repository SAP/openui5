sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.IconTabBarStretchContent.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.IconTabBarStretchContent.IconTabBar",
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
						"IconTabBar.view.xml",
						"IconTabBar.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
