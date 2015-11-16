sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.BlockInBlock.Component", {
		metadata: {
			rootView: "sap.uxap.sample.BlockInBlock.BlockInBlock",
			dependencies: {
				libs: [
					"sap.m"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"BlockInBlock.view.xml",
						"Block.js",
						"Block.view.xml",
						"InnerBlock.js",
						"InnerBlock.view.xml"
					]
				}
			}
		}
	});
	return Component;
}, true);
