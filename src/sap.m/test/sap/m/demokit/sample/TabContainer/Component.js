sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.m.sample.TabContainer.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.m.sample.TabContainer.TabContainer",
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
						"TabContainer.view.xml",
						"TabContainer.controller.js"
					]
				}
			}
		}
	});
});
