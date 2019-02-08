sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.m.sample.TabContainerIcons.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.m.sample.TabContainerIcons.TabContainerIcons",
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
						"TabContainerIcons.view.xml",
						"TabContainerIcons.controller.js"
					]
				}
			}
		}
	});
});
