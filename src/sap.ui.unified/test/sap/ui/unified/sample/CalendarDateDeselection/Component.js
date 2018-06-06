sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.unified.sample.CalendarDateDeselection.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.ui.unified.sample.CalendarDateDeselection.CalendarDateDeselection",
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
						"CalendarDateDeselection.view.xml",
						"CalendarDateDeselection.controller.js"
					]
				}
			}
		}
	});

	return Component;

});