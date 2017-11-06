sap.ui.define(['sap/ui/core/UIComponent'], function (UIComponent) {
	"use strict";

	return UIComponent.extend("sap.m.sample.Breadcrumbs.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.m.sample.Breadcrumbs.Page",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: ["sap.m"]
			},
			config: {
				sample: {
					files: ["Page.view.xml", "Page.controller.js"]
				}
			}
		}
	});
});
