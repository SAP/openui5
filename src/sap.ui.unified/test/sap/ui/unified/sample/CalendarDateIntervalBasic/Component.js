sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.CalendarDateIntervalBasic.Component", {

		metadata : {
			rootView : "sap.ui.unified.sample.CalendarDateIntervalBasic.CalendarDateIntervalBasic",
			dependencies : {
				libs : [
					"sap.ui.unified",
					"sap.m",
					"sap.ui.layout"
				]
			},
			includes: ["style.css"],
			config : {
				sample : {
					files : [
						"CalendarDateIntervalBasic.view.xml",
						"CalendarDateIntervalBasic.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
