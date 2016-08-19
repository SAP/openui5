sap.ui.define([
	"sap/ui/core/UIComponent"
], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.f.sample.FlexibleColumnLayoutDynamicPage.Component", {
		metadata: {
			rootView: "sap.f.sample.FlexibleColumnLayoutDynamicPage.FlexibleColumnLayout",
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
