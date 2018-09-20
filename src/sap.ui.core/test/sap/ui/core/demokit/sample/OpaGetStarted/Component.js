sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.OpaGetStarted.Component", {

		metadata : {
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					iframe : "Opa.html?opaExecutionDelay=1500",
					stretch : true,
					files : [
						"Opa.html",
						"Opa.js",
						"applicationUnderTest/view/Main.view.xml",
						"applicationUnderTest/view/Main.controller.js",
						"applicationUnderTest/index.html",
						"applicationUnderTest/server.js",
						"applicationUnderTest/Component.js"
					]
				}
			}
		}

	});

	return Component;

});
