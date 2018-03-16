sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/m/routing/Router"
], function (UIComponent, Router) {
	"use strict";

	var Component = UIComponent.extend("sap.f.sample.FlexibleColumnLayoutSimple.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.f.sample.FlexibleColumnLayoutSimple.FlexibleColumnLayout",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: [
					"sap.m",
					"sap.f"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"Component.js",
						"FlexibleColumnLayout.controller.js",
						"FlexibleColumnLayout.view.xml",
						"Master.controller.js",
						"Master.view.xml",
						"Detail.controller.js",
						"Detail.view.xml",
						"DetailDetail.view.xml"
					]
				}
			}
		}
	});
	return Component;
}, true);
