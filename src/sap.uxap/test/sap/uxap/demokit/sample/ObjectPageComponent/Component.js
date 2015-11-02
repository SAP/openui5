sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageComponent.Component", {
		metadata: {
			rootView: "sap.uxap.sample.ObjectPageComponent.ObjectPageComponent",
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"ObjectPageComponent.view.xml",
						"ObjectPageComponent.controller.js",
						"ObjectPageConfig.json",
						"HRData.json"
					]
				}
			}
		}
	});
	return Component;
}, true);
