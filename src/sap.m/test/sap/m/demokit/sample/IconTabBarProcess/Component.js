sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.IconTabBarProcess.Component", {

		metadata : {
			rootView : "sap.m.sample.IconTabBarProcess.IconTabBar",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				],
				components : [
					"sap.m.sample.Table"
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
