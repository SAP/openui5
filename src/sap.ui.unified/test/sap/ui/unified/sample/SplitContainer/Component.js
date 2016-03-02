sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.SplitContainer.Component", {

		metadata : {
			rootView : "sap.ui.unified.sample.SplitContainer.View",
			dependencies : {
				libs : [
					"sap.ui.unified",
					"sap.m"
				]
			},
			includes : [
				"../style.css"
			],
			config : {
				sample : {
					stretch: true,
					files : [
						"View.view.xml",
						"Controller.controller.js",
					]
				}
			}
		}
	});

	return Component;

});
