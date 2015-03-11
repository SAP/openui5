sap.ui.define(['jquery.sap.global', 'sap/ui/core/UIComponent'],
	function(jQuery, UIComponent) {
	"use strict";

	
	var Component = UIComponent.extend("sap.ui.core.sample.InvisibleText.Component", {

		metadata : {
			rootView : "sap.ui.core.sample.InvisibleText.V",
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
