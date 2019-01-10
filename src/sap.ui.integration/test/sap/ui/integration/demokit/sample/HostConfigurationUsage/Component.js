sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/m/routing/Router"
], function (UIComponent, Router) {
	"use strict";

	var Component = UIComponent.extend("sap.ui.integration.sample.HostConfigurationUsage.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.ui.integration.sample.HostConfigurationUsage.Main",
				"type": "XML",
				"async": true
			},
			dependencies: {
				libs: [
					"sap.m",
					"sap.f",
					"sap.ui.integration"
				]
			},
			config: {
				sample: {
					stretch: true,
					files: [
						"Main.view.xml",
						"host/dark.json",
						"host/color.json",
						"host/white.json"
					]
				}
			}
		}
	});
	return Component;
}, true);