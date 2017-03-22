sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.CalendarMultipleDaySelection.Component", {

		metadata : {
			rootView : "sap.ui.unified.sample.CalendarMultipleDaySelection.CalendarMultipleDaySelection",
			dependencies : {
				libs : [
					"sap.ui.unified"
				]
			},
			includes: ["../style.css"],
			config : {
				sample : {
					files : [
						"CalendarMultipleDaySelection.view.xml",
						"CalendarMultipleDaySelection.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
