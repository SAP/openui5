sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ModelMapping.Component", {

		metadata: {
			rootView: "sap.uxap.sample.ModelMapping.ModelMapping",
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"ModelMapping.view.xml",
						"ModelMapping.controller.js",
						"ModelMappingBlock.js",
						"ModelMappingBlock.view.xml"
					]
				}
			}
		}
	});

	return Component;

}, true);
