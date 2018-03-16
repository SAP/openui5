sap.ui.define(["sap/ui/core/UIComponent"],
	function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.FieldGroup.Component", {

		metadata: {
			rootView: {
				"viewName": "sap.ui.core.sample.FieldGroup.Page",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: [
					"sap.m",
					"sap.ui.layout"
				]
			},
			config: {
				sample: {
					stretch : true,
					files: [
						"Page.view.xml",
						"Page.controller.js",
						"SampleData.json"
					]
				}
			}
		}
	});
});