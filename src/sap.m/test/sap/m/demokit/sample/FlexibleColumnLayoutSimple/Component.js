sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/m/routing/Router"
], function (UIComponent, Router) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.FlexibleColumnLayoutSimple.Component", {
		metadata: {
			rootView: "sap.m.sample.FlexibleColumnLayoutSimple.FlexibleColumnLayout",
			dependencies: {
				libs: [
					"sap.m"
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
