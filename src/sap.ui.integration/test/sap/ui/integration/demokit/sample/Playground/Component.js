sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.ui.integration.sample.Playground.Component", {

			metadata: {
				rootView: {
					"viewName": "sap.ui.integration.sample.Playground.Playground",
					"type": "XML",
					"async": true
				},
				includes: [],
				dependencies: {
					libs: [
						"sap.m",
						"sap.ui.integration"
					]
				},
				config: {
					sample: {
						files: [
							"Playground.view.xml",
							"Playground.controller.js"
						]
					}
				}
			}
		});

		return Component;

	});