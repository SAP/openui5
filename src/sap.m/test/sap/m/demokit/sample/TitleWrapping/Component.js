sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.TitleWrapping.Component", {

		metadata : {
			rootView : "sap.m.sample.TitleWrapping.V",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			includes : [ ],
			config : {
				sample : {
					stretch : true,
					files : [
						"V.view.xml",
						"V.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
