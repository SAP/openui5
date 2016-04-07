sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageLazyLoadingWithoutBlocks.Component", {
		metadata: {
			rootView: "sap.uxap.sample.ObjectPageLazyLoadingWithoutBlocks.ObjectPageLazyLoadingWithoutBlocks",
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
