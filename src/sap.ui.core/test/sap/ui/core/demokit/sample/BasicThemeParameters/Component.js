sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.BasicThemeParameters.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.core.sample.BasicThemeParameters.BasicThemeParameters",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.ui.core"
				]
			},
			config : {
				sample : {
					stretch : false,
					files : [
						"BasicThemeParameters.view.xml",
						"BasicThemeParameters.controller.js",
						"parameters.json"
					]
				}
			}
		}
	});

	return Component;

});
