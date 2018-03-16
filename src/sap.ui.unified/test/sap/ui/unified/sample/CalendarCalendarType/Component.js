sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.CalendarCalendarType.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.unified.sample.CalendarCalendarType.CalendarCalendarType",
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
						"CalendarCalendarType.view.xml",
						"CalendarCalendarType.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
