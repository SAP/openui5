sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.OpaDynamicWait.Component", {

		metadata : {
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.commons"
				]
			},
			config : {
				sample : {
					iframe : "Opa.html",
					stretch : true,
					files : [
						"Opa.html",
						"applicationUnderTest/view/Main.view.xml",
						"applicationUnderTest/index.html",
						"applicationUnderTest/Component.js"
					]
				}
			}
		}

	});

	return Component;

});
