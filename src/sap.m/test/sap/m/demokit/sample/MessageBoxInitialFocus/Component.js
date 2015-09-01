sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.MessageBoxInitialFocus.Component", {

		metadata : {
			rootView : "sap.m.sample.MessageBoxInitialFocus.V",
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
						"C.controller.js",
						"Layout.fragment.xml"
					]
				}
			}
		}
	});


	return Component;

});
