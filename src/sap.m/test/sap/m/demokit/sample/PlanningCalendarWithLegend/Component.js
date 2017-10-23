sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.m.sample.PlanningCalendarWithLegend.Component", {

			metadata : {
				rootView : {
					"viewName": "sap.m.sample.PlanningCalendarWithLegend.Page",
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