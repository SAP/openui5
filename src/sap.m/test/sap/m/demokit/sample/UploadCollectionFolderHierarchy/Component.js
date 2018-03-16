sap.ui.define([
	"sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.UploadCollectionFolderHierarchy.Component", {

		metadata: {
			rootView: {
				"viewName": "sap.m.sample.UploadCollectionFolderHierarchy.Page",
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
						"UploadCollectionData.json"
					]
				}
			}
		}
	});

	return Component;
});
