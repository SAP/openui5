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
						"patternApp/view/PatternTable.view.xml",
						"patternApp/view/Dialog.fragment.xml",
						"patternApp/model/Pattern.js",
						"patternApp/Component.js",
						"Patterns.html"
					]
				}
			}
		}
	});

	return Component;

});
