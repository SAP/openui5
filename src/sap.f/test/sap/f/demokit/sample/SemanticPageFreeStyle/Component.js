sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.f.sample.SemanticPageFreeStyle.Component", {

			metadata: {
				rootView: {
					"viewName": "sap.f.sample.SemanticPageFreeStyle.V",
					"type": "XML",
					"async": true
				},
				dependencies: {
					libs: [
						"sap.f",
						"sap.m"
					]
				},
				config: {
					sample: {
						stretch : true,
						files: [
							"V.view.xml",
							"C.controller.js",
							"model.json"
						]
					}
				}
			}
		});
	});
