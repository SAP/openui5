sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageBlockBase.Component", {
		metadata: {
			rootView: "sap.uxap.sample.ObjectPageBlockBase.ObjectPageBlockBase",
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"ObjectPageBlockBase.view.xml",
						"ObjectPageBlockBase.controller.js"
					]
				}
			}
		}
	});

	return Component;
}, true);
