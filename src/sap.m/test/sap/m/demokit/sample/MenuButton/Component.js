sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.m.sample.MenuButton.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.m.sample.MenuButton.MB",
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
					files: [
						"MB.view.xml",
						"MB.controller.js"
					]
				}
			}
		}
	});
});