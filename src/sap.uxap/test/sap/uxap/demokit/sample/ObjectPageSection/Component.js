sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageSection.Component", {

		metadata: {
			rootView: {
				"viewName": "sap.uxap.sample.ObjectPageSection.ObjectPageSection",
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
						"ObjectPageSection.view.xml",
						"../SharedBlocks/BlockBlueT1.js",
						"../SharedBlocks/BlockBlueT1.view.xml",
						"../SharedBlocks/BlockBlueT2.js",
						"../SharedBlocks/BlockBlueT2.view.xml",
						"../SharedBlocks/BlockBlueT3.js",
						"../SharedBlocks/BlockBlueT3.view.xml",
						"../SharedBlocks/BlockBlueT4.js",
						"../SharedBlocks/BlockBlueT4.view.xml",
						"../SharedBlocks/BlockBlueT5.js",
						"../SharedBlocks/BlockBlueT5.view.xml"
					]
				}
			}
		}
	});
	return Component;
}, true);
