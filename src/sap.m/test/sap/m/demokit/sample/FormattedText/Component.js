sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.FormattedText.Component", {

		metadata : {
			rootView : "sap.m.sample.FormattedText.V",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"C.controller.js",
						"V.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
