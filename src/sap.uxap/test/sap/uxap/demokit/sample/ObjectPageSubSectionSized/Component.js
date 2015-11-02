sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";
	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageSubSectionSized.Component", {
		metadata: {
			rootView: "sap.uxap.sample.ObjectPageSubSectionSized.ObjectPageSubSectionSized",
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"ObjectPageSubSectionSized.view.xml",
						"ObjectPageSubSectionSize.controller.js",
						"blocks/InfoButton.js",
						"blocks/InfoButton.view.xml",
						"blocks/InfoButtonController.controller.js"
					]
				}
			}
		}
	});
	return Component;
});
