sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/m/routing/Router"
], function (UIComponent, Router) {
	"use strict";

	var Component = UIComponent.extend("sap.m.sample.FlexibleColumnLayoutDynamicPage.Component", {
		metadata: {
			rootView: "sap.m.sample.FlexibleColumnLayoutDynamicPage.FlexibleColumnLayout",
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
						"MasterDP.view.xml",
						"Detail.controller.js",
						"DetailDP.view.xml",
						"DetailDetail.controller.js",
						"DetailDetailDP.view.xml"
					]
				}
			}
		}
	});
	return Component;
}, true);
