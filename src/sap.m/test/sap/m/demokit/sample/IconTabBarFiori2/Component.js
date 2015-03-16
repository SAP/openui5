sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.IconTabBarFiori2.Component", {

		metadata : {
			rootView : "sap.m.sample.IconTabBarFiori2.IconTabBar",
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
