sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.HorizontalLayout.Component", {

		metadata : {
			rootView : "sap.ui.layout.sample.HorizontalLayout.V",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"V.view.xml",
						"C.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
