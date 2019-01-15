sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.SingleView.Component", {

		metadata: {
			rootView: {
				"viewName": "sap.uxap.sample.SingleView.SingleView",
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
						"SingleView.view.xml",
						"../SharedBlocks/BlockBlue.js",
						"../SharedBlocks/BlockBlue.view.xml"
					]
				}
			}
		}
	});
	return Component;
});
