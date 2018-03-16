sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.MenuItemEventing.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.unified.sample.MenuItemEventing.MenuItemEventing",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.ui.unified"
				]
			},

			config : {
				sample : {
					files : [
						"MenuItemEventing.view.xml",
						"MenuItemEventing.fragment.xml",
						"MenuItemEventing.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
