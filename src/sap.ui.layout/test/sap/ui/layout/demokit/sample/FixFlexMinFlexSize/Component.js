sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.layout.sample.FixFlexMinFlexSize.Component", {

		metadata: {
			rootView: {
				"viewName": "sap.ui.layout.sample.FixFlexMinFlexSize.V",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: [
					"sap.ui.layout",
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"C.controller.js",
						"V.view.xml"
					]
				}
			}
		}
	});


	return Component;

});
