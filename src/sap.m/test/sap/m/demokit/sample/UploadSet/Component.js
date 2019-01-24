sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.UploadSet.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.m.sample.UploadSet.Page",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: ["sap.m", "sap.ui.unified"]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"Page.view.xml",
						"Page.controller.js",
						"items.json"
					]
				}
			}
		}
	});

	return Component;
});