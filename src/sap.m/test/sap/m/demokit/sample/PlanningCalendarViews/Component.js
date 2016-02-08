sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.PlanningCalendarViews.Component", {

		metadata : {
			rootView : "sap.m.sample.PlanningCalendarViews.Page",
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
