sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.uxap.sample.AnchorBarWithNumbers.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.uxap.sample.AnchorBarWithNumbers.AnchorBarWithNumbers",
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
						"AnchorBarWithNumbers.view.xml",
						"AnchorBarWithNumbers.controller.js",
						"HRData.json"
					]
				}
			}
		}
	});
}, true);
