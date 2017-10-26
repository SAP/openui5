sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.CalendarMultipleMonth.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.unified.sample.CalendarMultipleMonth.CalendarMultipleMonth",
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
						"CalendarMultipleMonth.view.xml",
						"CalendarMultipleMonth.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
