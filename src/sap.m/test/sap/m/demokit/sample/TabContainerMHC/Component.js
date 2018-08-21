sap.ui.define([
	'sap/ui/core/UIComponent'
], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.m.sample.TabContainerMHC.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.m.sample.TabContainerMHC.TabContainer",
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
						"TabContainer.view.xml",
						"TabContainer.controller.js"
					]
				}
			}
		}
	});
});
