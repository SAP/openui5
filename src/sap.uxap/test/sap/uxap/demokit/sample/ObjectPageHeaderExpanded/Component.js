sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageHeaderExpanded.Component", {
		metadata: {
			rootView: "sap.uxap.sample.ObjectPageHeaderExpanded.ObjectPageHeaderExpanded",
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
						"ObjectPageHeaderExpanded.view.xml",
						"ObjectPageHeaderExpanded.controller.js",
						"employee.json",
						"products.json"
					]
				}
			}
		}
	});

	return Component;
}, true);
