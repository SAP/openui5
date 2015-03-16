sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.PatternMatching.Component", {

		metadata : {
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					iframe : "Patterns.html",
					stretch : true,
					files : [
						"patternApp/view/PatternTable.controller.js",
						"patternApp/model/Pattern.js",
						"patternApp/view/PatternTable.view.xml",
						"patternApp/Component.js",
						"Patterns.html"
					]
				}
			}
		}

	});

	return Component;

});
