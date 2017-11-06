sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.IconTabBarOverflowSelectList.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.IconTabBarOverflowSelectList.IconTabBarOverflowSelectList",
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
						"IconTabBarOverflowSelectList.view.xml",
						"IconTabBarOverflowSelectList.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
