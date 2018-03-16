sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageState.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.uxap.sample.ObjectPageState.ObjectPageState",
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
						"ObjectPageState.view.xml",
						"ObjectPageState.controller.js",
						"HRData.json"
					]
				}
			}
		}
	});
	return Component;
}, true);
