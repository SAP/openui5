sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.DateTimePicker.Component", {

		metadata : {
			rootView : "sap.m.sample.DateTimePicker.Group",
			dependencies : {
				libs : [
					"sap.m",
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
