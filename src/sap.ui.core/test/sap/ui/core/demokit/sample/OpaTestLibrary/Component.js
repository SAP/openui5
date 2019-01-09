sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.OpaTestLibrary.Component", {

		metadata : {
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					iframe : "OpaTestLibrary.html?opaExecutionDelay=700",
					stretch : true,
					files : [
						"OpaTestLibrary.html",
						"OpaTestLibrary.js",
						"applicationUnderTest/index.html",
						"applicationUnderTest/Component.js",
						"applicationUnderTest/manifest.json",
						"applicationUnderTest/view/Main.view.xml",
						"applicationUnderTest/view/Main.controller.js",
						"pageObjects/Item.js",
						"testLibrary/SampleTestLibrary.js",
						"testLibrary/pageObjects/List.js",
						"testLibrary/pageObjects/Common1.js",
						"testLibrary/pageObjects/Common2.js"
					]
				}
			}
		}

	});

	return Component;

});
