sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ObjectHeaderImage.Component", {

		metadata : {
			rootView : "sap.m.sample.ObjectHeaderImage.V",
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
