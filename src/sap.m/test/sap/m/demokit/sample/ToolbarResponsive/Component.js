sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ToolbarResponsive.Component", {

		metadata : {
			rootView : "sap.m.sample.ToolbarResponsive.Page",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"Page.view.xml",
						"Page.controller.js",
						"ActionSheet.fragment.xml"
					]
				}
			}
		}
	});

	return Component;

});
