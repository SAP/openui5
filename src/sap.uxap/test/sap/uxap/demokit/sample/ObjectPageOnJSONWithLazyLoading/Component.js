sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageOnJSONWithLazyLoading.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.uxap.sample.ObjectPageOnJSONWithLazyLoading.ObjectPageOnJSONWithLazyLoading",
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
						"ObjectPageOnJSONWithLazyLoading.view.xml",
						"ObjectPageOnJSONWithLazyLoading.controller.js",
						"../SharedBlocks/employment/EmploymentBlockJob.js",
						"../SharedBlocks/employment/EmploymentBlockJobCollapsed.view.xml",
						"../SharedBlocks/employment/EmploymentBlockJobExpanded.view.xml",
						"HRData.json"
					]
				}
			}
		}
	});
	return Component;
}, true);
