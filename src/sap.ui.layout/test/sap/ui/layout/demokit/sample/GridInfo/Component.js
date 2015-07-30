sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.GridInfo.Component", {

		metadata : {
			rootView : "sap.ui.layout.sample.GridInfo.Grid",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"Grid.view.xml",
						"Grid.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
