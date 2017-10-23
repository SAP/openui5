sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.IconTabBarMulti.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.IconTabBarMulti.IconTabBar",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
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
