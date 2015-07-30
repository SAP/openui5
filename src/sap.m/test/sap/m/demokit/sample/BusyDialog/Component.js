sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.BusyDialog.Component", {

		metadata : {
			rootView : "sap.m.sample.BusyDialog.V",
			dependencies : {
				libs : [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config : {
				sample : {
					stretch : true,
					files : [
						"V.view.xml",
						"C.controller.js",
						"BusyDialog.fragment.xml"
					]
				}
			}
		}
	});

	return Component;

});
