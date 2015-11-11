sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageFormLayout.Component", {

		metadata: {
			rootView: "sap.uxap.sample.ObjectPageFormLayout.ObjectPageFormLayout",
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"ObjectPageFormLayout.view.xml",
						"ObjectPageFormLayout.controller.js",
						"block/personal/PersonalFormBlock.js",
						"block/personal/PersonalFormBlock.view.xml",
						"block/personal/PersonalSimpleFormBlock.js",
						"block/personal/PersonalSimpleFormBlock.view.xml",
						"block/blockscolor/BlockBlue.js",
						"block/blockscolor/BlockBlue.view.xml",
						"block/employment/BlockJobInfo.js",
						"block/employment/BlockJobInfo.view.xml"
					]
				}
			}
		}
	});
	return Component;
}, true);
