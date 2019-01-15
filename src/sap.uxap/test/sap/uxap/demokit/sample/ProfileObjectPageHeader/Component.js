sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ProfileObjectPageHeader.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.uxap.sample.ProfileObjectPageHeader.ProfileObjectPageHeader",
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
						"ProfileObjectPageHeader.view.xml",
						"ProfileObjectPageHeader.controller.js",
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
						"employee.json"
					]
				}
			}
		}
	});
	return Component;
});
