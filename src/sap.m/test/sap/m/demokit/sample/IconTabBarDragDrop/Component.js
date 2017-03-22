sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.IconTabBarDragDrop.Component", {

		metadata : {
			rootView : "sap.m.sample.IconTabBarDragDrop.IconTabBarDragDrop",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					files : [
						"IconTabBarDragDrop.view.xml",
						"IconTabBarDragDrop.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
