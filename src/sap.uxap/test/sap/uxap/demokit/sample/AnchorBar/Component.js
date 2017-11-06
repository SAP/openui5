sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.AnchorBar.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.uxap.sample.AnchorBar.AnchorBar",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: ["sap.m"]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"AnchorBar.view.xml",
						"myBlock.js",
						"myBlock.view.xml",
						"mySimpleBlock.js",
						"mySimpleBlock.view.xml"
					]
				}
			}
		}
	});

	return Component;
}, true);
