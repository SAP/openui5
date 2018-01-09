sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageDynamicHeader.Component", {

		metadata: {
			rootView: "sap.uxap.sample.ObjectPageDynamicHeader.ObjectPageDynamicHeader",
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"ObjectPageDynamicHeader.view.xml",
						"ObjectPageDynamicHeader.controller.js",
						"HRData.json"
					]
				}
			}
		}
	});
	return Component;
});
