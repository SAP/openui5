sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.core.sample.OpaMessageToast.Component", {

		metadata : {
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					iframe : "OpaMessageToast.html?opaExecutionDelay=700",
					stretch : true,
					files : [
						"OpaMessageToast.html",
						"applicationUnderTest/index.html",
						"applicationUnderTest/Component.js",
						"applicationUnderTest/view/Main.view.xml",
						"applicationUnderTest/view/Main.controller.js"
					]
				}
			}
		}

	});

	return Component;

});
