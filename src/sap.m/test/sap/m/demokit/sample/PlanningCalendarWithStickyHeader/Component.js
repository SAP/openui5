sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.PlanningCalendarWithStickyHeader.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.PlanningCalendarWithStickyHeader.Page",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.unified"
				]
			},
			config : {
				sample : {
					files : [
						"Page.view.xml",
						"Page.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
