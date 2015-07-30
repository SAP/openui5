sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.DateTimeInput.Component", {

		metadata : {
			rootView : "sap.m.sample.DateTimeInput.DateTimeInputGroup",
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
