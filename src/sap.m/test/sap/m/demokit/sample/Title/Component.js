sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.Title.Component", {

		metadata : {
			rootView : "sap.m.sample.Title.V",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
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
