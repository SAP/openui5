sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageLazyLoadingWithoutBlocks.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.uxap.sample.ObjectPageLazyLoadingWithoutBlocks.ObjectPageLazyLoadingWithoutBlocks",
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
						"ObjectPageLazyLoadingWithoutBlocks.view.xml",
						"ObjectPageLazyLoadingWithoutBlocks.controller.js"
					]
				}
			}
		}
	});
	return Component;
}, true);
