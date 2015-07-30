sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ToolbarActive.Component", {

		metadata : {
			rootView : "sap.m.sample.ToolbarActive.Toolbar",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					files : [
						"Toolbar.view.xml",
						"Toolbar.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
