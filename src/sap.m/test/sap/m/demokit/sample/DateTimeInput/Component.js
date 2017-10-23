sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.DateTimeInput.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.DateTimeInput.DateTimeInputGroup",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					files : [
						"DateTimeInputGroup.view.xml"
					]
				}
			}
		}
	});

	return Component;

});
