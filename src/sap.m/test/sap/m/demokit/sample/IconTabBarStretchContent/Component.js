sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.IconTabBarStretchContent.Component", {

		metadata : {
			rootView : "sap.m.sample.IconTabBarStretchContent.IconTabBar",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					files : [
						"IconTabBar.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
