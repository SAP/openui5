sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.uxap.sample.ChildObjectPage.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.uxap.sample.ChildObjectPage.ChildObjectPage",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: [
					"sap.m",
					"sap.ui.core"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"ChildObjectPage.view.xml",
						"ChildObjectPage.controller.js",
						"../SharedBlocks/goals/GoalsBlock.js",
						"../SharedBlocks/goals/GoalsBlock.view.xml",
						"../SharedBlocks/personal/BlockAdresses.js",
						"../SharedBlocks/personal/BlockAdresses.view.xml",
						"../SharedBlocks/personal/BlockMailing.js",
						"../SharedBlocks/personal/BlockMailing.view.xml",
						"../SharedBlocks/personal/BlockPhoneNumber.js",
						"../SharedBlocks/personal/BlockPhoneNumber.view.xml",
						"../SharedBlocks/personal/BlockSocial.js",
						"../SharedBlocks/personal/BlockSocial.view.xml",
						"../SharedBlocks/personal/PersonalBlockPart1.js",
						"../SharedBlocks/personal/PersonalBlockPart1.view.xml",
						"../SharedBlocks/personal/PersonalBlockPart2.js",
						"../SharedBlocks/personal/PersonalBlockPart2.view.xml",
						"employee.json",
						"products.json"
					]
				}
			}
		}
	});
}, true);
