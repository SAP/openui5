sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.ActionSheet.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.m.sample.ActionSheet.V",
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
						"V.view.xml",
						"C.controller.js",
						"ActionSheet.fragment.xml"
					]
				}
			}
		}
	});

	return Component;

});
