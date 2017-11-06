sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.MenuMenuEventing.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.unified.sample.MenuMenuEventing.MenuMenuEventing",
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
						"MenuMenuEventing.view.xml",
						"MenuMenuEventing.fragment.xml",
						"MenuMenuEventing.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
