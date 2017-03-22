sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageSubSectionMultiView.Component", {
		metadata: {
			rootView: "sap.uxap.sample.ObjectPageSubSectionMultiView.ObjectPageSubSectionMultiView",
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"BlockEmpty.js",
						"BlockEmpty.view.xml",
						"ObjectPageSubSectionMultiView.controller.js",
						"ObjectPageSubSectionMultiView.view.xml"
					]
				}
			}
		}
	});
	return Component;
});
