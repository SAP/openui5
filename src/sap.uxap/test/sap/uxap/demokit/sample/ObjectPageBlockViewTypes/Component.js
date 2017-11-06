sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageBlockViewTypes.Component", {

		metadata: {
			rootView: {
				"viewName": "sap.uxap.sample.ObjectPageBlockViewTypes.ObjectPageOnJSON",
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
						"ObjectPageOnJSON.view.xml",
						"../SharedBlocks/goals/GoalsBlock.js",
						"../SharedBlocks/goals/GoalsBlockJS.js",
						"../SharedBlocks/goals/GoalsBlockJSON.js",
						"../SharedBlocks/goals/GoalsBlockHTML.js",
						"../SharedBlocks/goals/GoalsBlock.view.xml",
						"../SharedBlocks/goals/GoalsBlock.view.js",
						"../SharedBlocks/goals/GoalsBlock.view.json",
						"../SharedBlocks/goals/GoalsBlock.view.html"
					]
				}
			}
		}
	});

	return Component;
}, true);
