sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";
	var Component = UIComponent.extend("sap.uxap.sample.Eventing.Component", {

		metadata: {
			rootView: "sap.uxap.sample.Eventing.Eventing",
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"Eventing.view.xml",
						"Eventing.controller.js",
						"EventingBlock.js",
						"EventingBlock.view.xml",
						"EventingBlockController.controller.js"
					]
				}
			}
		}
	});

	return Component;
}, true);
