sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.tnt.sample.ToolPage.Component", {

		metadata : {
			rootView : "sap.tnt.sample.ToolPage.ToolPage",
			dependencies : {
				libs : [
					"sap.m",
					"sap.tnt"
				]
			},
			config : {
				sample : {
					stretch: true,
					files : [
						"ToolPage.view.xml", "ToolPage.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
