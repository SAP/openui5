sap.ui.define(["sap/ui/core/UIComponent"], function (UIComponent) {
	"use strict";

	var Component = UIComponent.extend("sap.uxap.sample.ObjectPageBlockBase.Component", {
		metadata: {
			rootView: {
				"viewName": "sap.uxap.sample.ObjectPageBlockBase.ObjectPageBlockBase",
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
						"ObjectPageBlockBase.view.xml",
						"ObjectPageBlockBase.controller.js"
					]
				}
			}
		}
	});

	return Component;
}, true);
