sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.CalendarSingleIntervalSelection.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.unified.sample.CalendarSingleIntervalSelection.CalendarSingleIntervalSelection",
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
						"CalendarSingleIntervalSelection.view.xml",
						"CalendarSingleIntervalSelection.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
