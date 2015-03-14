sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.DateRangeSelection.Component", {

		metadata : {
			rootView : "sap.m.sample.DateRangeSelection.V",
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
						"V.view.xml",
						"C.controller.js"
					]
				}
			}
		}

	});

	return Component;

});
