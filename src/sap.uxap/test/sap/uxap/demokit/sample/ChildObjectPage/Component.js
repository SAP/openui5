sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.uxap.sample.ChildObjectPage.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.uxap.sample.ChildObjectPage.ChildObjectPage",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: [
					"sap.m",
					"sap.ui.core"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"ChildObjectPage.view.xml",
						"ChildObjectPage.controller.js",
						"employee.json",
						"products.json"
					]
				}
			}
		}
	});
}, true);
