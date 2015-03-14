sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.InputSuggestionsDynamic.Component", {

		metadata : {
			rootView : "sap.m.sample.InputSuggestionsDynamic.V",
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
