sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.CalendarSingleDaySelection.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.unified.sample.CalendarSingleDaySelection.CalendarSingleDaySelection",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.ui.unified"
				]
			},
			includes: ["../style.css"],
			config : {
				sample : {
					files : [
						"CalendarSingleDaySelection.view.xml",
						"CalendarSingleDaySelection.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
