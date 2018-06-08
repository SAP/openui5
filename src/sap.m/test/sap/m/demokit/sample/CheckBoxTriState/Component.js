sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.CheckBoxTriState.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.CheckBoxTriState.CheckBoxTriState",
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
						"CheckBoxTriState.view.xml",
						"CheckBoxTriState.controller.js"
					]
				}
			}
		}
	});

	return Component;

});