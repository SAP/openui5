sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		return UIComponent.extend("sap.f.sample.GridListBasic.Component", {

			metadata: {
				rootView: {
					"viewName": "sap.f.sample.GridListBasic.V",
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
						files: [
							"V.view.xml",
							"C.controller.js"
						]
					}
				}
			}
		});
	});
