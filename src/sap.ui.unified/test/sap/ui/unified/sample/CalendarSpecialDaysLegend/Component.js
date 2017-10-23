sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.CalendarSpecialDaysLegend.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.unified.sample.CalendarSpecialDaysLegend.CalendarSpecialDaysLegend",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.ui.unified",
					"sap.ui.layout",
					"sap.m"
				]
			},
			includes: ["../style.css"],
			config : {
				sample : {
					files : [
						"CalendarSpecialDaysLegend.view.xml",
						"CalendarSpecialDaysLegend.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
