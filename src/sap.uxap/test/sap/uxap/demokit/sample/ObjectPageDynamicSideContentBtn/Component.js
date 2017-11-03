sap.ui.define(['sap/ui/core/UIComponent'],
	function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageDynamicSideContentBtn.Component", {

		metadata : {
			rootView : {
				"viewName": "sap.uxap.sample.ObjectPageDynamicSideContentBtn.ObjectPageDynamicSideContentBtn",
				"type": "XML",
				"async": true
			},
			dependencies : {
				libs : [
					"sap.ui.layout"
				]
			},
			includes : [ "style.css" ],
			config : {
				sample : {
					stretch : true,
					files : [
						"ObjectPageDynamicSideContentBtn.view.xml",
						"ObjectPageDynamicSideContentBtn.controller.js",
						"../SharedBlocks/employment/BlockEmpDetailPart1.js",
						"../SharedBlocks/employment/BlockEmpDetailPart1.view.xml",
						"../SharedBlocks/employment/BlockEmpDetailPart2.js",
						"../SharedBlocks/employment/BlockEmpDetailPart2.view.xml",
						"../SharedBlocks/employment/BlockEmpDetailPart3.js",
						"../SharedBlocks/employment/BlockEmpDetailPart3.view.xml",
						"../SharedBlocks/employment/BlockJobInfoPart1.js",
						"../SharedBlocks/employment/BlockJobInfoPart1.view.xml",
						"../SharedBlocks/employment/BlockJobInfoPart2.js",
						"../SharedBlocks/employment/BlockJobInfoPart2.view.xml",
						"../SharedBlocks/employment/BlockJobInfoPart3.js",
						"../SharedBlocks/employment/BlockJobInfoPart3.view.xml",
						"../SharedBlocks/employment/EmploymentBlockJob.js",
						"../SharedBlocks/employment/EmploymentBlockJobCollapsed.view.xml",
						"../SharedBlocks/employment/EmploymentBlockJobExpanded.view.xml",
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
						"style.css",
						"employee.json"
					]
				}
			}
		}
	});

	return Component;

});
