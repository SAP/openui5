sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.OpaStaticAreaControls.Component", {

		metadata : {
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					iframe : "OpaStaticAreaControls.html?opaExecutionDelay=700",
					stretch : true,
					files : [
						"OpaStaticAreaControls.html",
						"OpaStaticAreaControls.js",
						"applicationUnderTest/index.html",
						"applicationUnderTest/Component.js",
						"applicationUnderTest/manifest.json",
						"applicationUnderTest/view/Main.view.xml",
						"applicationUnderTest/view/Main.controller.js"
					]
				}
			}
		}

	});

	return Component;

});
