sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.OpaMatchers.Component", {

		metadata : {
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					iframe : "OpaMatchers.html?opaExecutionDelay=700",
					stretch : true,
					files : [
						"OpaMatchers.html",
						"OpaMatchers.js",
						"applicationUnderTest/controller/App.controller.js",
						"applicationUnderTest/controller/Main.controller.js",
						"applicationUnderTest/view/App.view.xml",
						"applicationUnderTest/view/Main.view.xml",
						"applicationUnderTest/index.html",
						"applicationUnderTest/Component.js",
						"applicationUnderTest/manifest.json"
					]
				}
			}
		}

	});

	return Component;

});
