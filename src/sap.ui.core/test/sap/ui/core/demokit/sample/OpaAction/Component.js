sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.OpaAction.Component", {

		metadata : {
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					iframe : "Opa.html",
					stretch : true,
					files : [
						"Opa.html",
						"applicationUnderTest/view/Main.view.xml",
						"applicationUnderTest/view/Main.controller.js",
						"applicationUnderTest/Component.js"
					]
				}
			}
		}

	});

	return Component;

});
