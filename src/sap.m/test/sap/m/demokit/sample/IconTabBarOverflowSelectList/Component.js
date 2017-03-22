sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.IconTabBarOverflowSelectList.Component", {

		metadata : {
			rootView : "sap.m.sample.IconTabBarOverflowSelectList.IconTabBarOverflowSelectList",
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
