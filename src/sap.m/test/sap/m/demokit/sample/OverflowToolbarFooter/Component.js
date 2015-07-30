sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.OverflowToolbarFooter.Component", {

		metadata : {
			rootView : "sap.m.sample.OverflowToolbarFooter.OverflowToolbar",
			dependencies : {
				libs : [
					"sap.m"
				]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"OverflowToolbar.view.xml",
						"OverflowToolbar.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
