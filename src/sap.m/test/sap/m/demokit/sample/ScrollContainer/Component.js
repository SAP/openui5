sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ScrollContainer.Component", {

		metadata : {
			rootView : "sap.m.sample.ScrollContainer.ScrollContainer",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"ScrollContainer.view.xml",
						"ScrollContainer.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
