sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.DatePicker.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.DatePicker.Group",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout",
					"sap.ui.unified"
				]
			},
			config : {
				sample : {
					files : [
						"Group.view.xml",
						"Group.controller.js"
					]
				}
			}
		}
	});

	return Component;

});
