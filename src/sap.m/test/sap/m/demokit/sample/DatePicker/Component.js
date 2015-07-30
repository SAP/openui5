sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.DatePicker.Component", {

		metadata : {
			rootView : "sap.m.sample.DatePicker.Group",
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
