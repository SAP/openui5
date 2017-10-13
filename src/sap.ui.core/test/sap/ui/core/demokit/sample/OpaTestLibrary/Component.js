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
						"applicationUnderTest/index.html",
						"applicationUnderTest/Component.js",
						"applicationUnderTest/view/Main.view.xml",
						"applicationUnderTest/view/Main.controller.js",
						"pageObjects/Item.js",
						"testLibrary/pageObjects/List.js"
					]
				}
			}
		}

	});

	return Component;

});
