sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.FormToolbar.Component", {

		metadata : {
			rootView : "sap.ui.layout.sample.FormToolbar.Panel",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"Panel.view.xml",
						"Panel.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
