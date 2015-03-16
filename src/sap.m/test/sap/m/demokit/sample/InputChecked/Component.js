sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.InputChecked.Component", {

		metadata : {
			rootView : "sap.m.sample.InputChecked.V",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
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
