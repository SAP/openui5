sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.LabelProperties.Component", {

		metadata : {
			rootView : "sap.m.sample.LabelProperties.LabelProperties",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"LabelProperties.view.xml",
						"LabelProperties.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
