sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.m.sample.DynamicMessageStripGenerator.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.m.sample.DynamicMessageStripGenerator.V",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"V.view.xml",
						"C.controller.js"
					]
				}
			}
		}
	});
});