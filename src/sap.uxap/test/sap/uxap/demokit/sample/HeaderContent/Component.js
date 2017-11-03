sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.HeaderContent.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.uxap.sample.HeaderContent.HeaderContent",
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
						"HeaderContent.view.xml",
						"HeaderContent.controller.js",
						"employee.json",
						"products.json"
					]
				}
			}
		}
	});
	return Component;
}, true);
