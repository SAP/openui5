sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ViewSettingsDialogCustomFilterDetails.Component", {

		metadata : {
			rootView : "sap.m.sample.ViewSettingsDialogCustomFilterDetails.V",
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
						"Dialog.fragment.xml"
					]
				}
			}
		}
	});

	return Component;

});
